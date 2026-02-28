import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertContactMessageSchema, insertFeatureRequestSchema, notificationTemplates } from "@shared/schema";
import { sendContactEmail, sendRequestStatusEmail } from "./lib/resend";
import { sendTopicNotification } from "./lib/firebase";
import { startScheduler } from "./lib/scheduler";
import fs from "fs";
import path from "path";

// Required env vars - no fallbacks for security (set in .env or hosting platform)
const ADMIN_PIN = process.env.ADMIN_PIN;
const CAFFEINE_API_KEY = process.env.CAFFEINE_API_KEY;

if (!ADMIN_PIN) {
  console.warn("WARNING: ADMIN_PIN not set - admin endpoints will reject all requests");
}
if (!CAFFEINE_API_KEY) {
  console.warn("WARNING: CAFFEINE_API_KEY not set - /api/caffeineItems will reject all requests");
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.post("/api/contact", async (req, res) => {
    try {
      const data = insertContactMessageSchema.parse(req.body);
      const message = await storage.createContactMessage(data);
      
      // Send email notification asynchronously
      sendContactEmail(data.name, data.email, data.message).catch(err => {
        console.error("Email sending failed:", err);
      });

      res.json(message);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Feature Request Routes
  app.post("/api/requests", async (req, res) => {
    try {
      const data = insertFeatureRequestSchema.parse(req.body);
      const request = await storage.createFeatureRequest(data);
      res.json(request);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/requests", async (req, res) => {
    try {
      const requests = await storage.getFeatureRequests();
      res.json(requests);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/admin/verify", async (req, res) => {
    const { pin } = req.body;
    if (pin === ADMIN_PIN) {
      res.json({ success: true });
    } else {
      res.status(401).json({ error: "Invalid PIN" });
    }
  });

  app.patch("/api/requests/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { status, pin } = req.body;
      
      if (pin !== ADMIN_PIN) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      if (status !== "accepted" && status !== "rejected") {
        return res.status(400).json({ error: "Invalid status" });
      }
      const request = await storage.updateFeatureRequestStatus(id, status);
      if (!request) {
        return res.status(404).json({ error: "Request not found" });
      }
      
      // Send email notification if user provided an email
      if (request.submitterEmail) {
        sendRequestStatusEmail(
          request.submitterEmail, 
          request.name, 
          request.type, 
          status
        ).catch(err => {
          console.error("Failed to send status notification email:", err);
        });
      }
      
      res.json(request);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Caffeine Items API for mobile app
  app.get("/api/caffeineItems", async (req, res) => {
    try {
      const apiKey = req.headers["x-api-key"];
      if (apiKey !== CAFFEINE_API_KEY) {
        return res.status(401).json({ error: "Invalid API key" });
      }
      
      const items = await storage.getAllCaffeineItems();
      // Transform to match Android data class exactly
      const response = items.map(item => ({
        id: item.id,
        name: item.name,
        productUrl: item.productUrl,
        floz: item.floz,
        calories: item.calories,
        caffeine: item.caffeine,
        mgFloz: item.mgFloz,
        imageUrl: item.imageUrl,
        sugar: item.sugar
      }));
      res.json(response);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Admin endpoint to get caffeine items with search
  app.get("/api/admin/caffeineItems", async (req, res) => {
    try {
      const query = req.query.q as string | undefined;
      const items = query 
        ? await storage.searchCaffeineItems(query)
        : await storage.getAllCaffeineItems();
      res.json(items);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get count of caffeine items
  app.get("/api/admin/caffeineItems/count", async (req, res) => {
    try {
      const count = await storage.getCaffeineItemsCount();
      res.json({ count });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Seed caffeine items database (protected by admin PIN)
  app.post("/api/admin/seedCaffeineItems", async (req, res) => {
    try {
      const { pin } = req.body;
      if (pin !== ADMIN_PIN) {
        return res.status(401).json({ error: "Invalid PIN" });
      }

      const existingCount = await storage.getCaffeineItemsCount();
      if (existingCount > 0) {
        return res.json({ message: `Database already has ${existingCount} items`, seeded: false });
      }

      const jsonPath = path.join(process.cwd(), "attached_assets/caffeine_items_copy_1769705796875.json");
      const jsonData = fs.readFileSync(jsonPath, "utf-8");
      const items = JSON.parse(jsonData);

      const dbItems = items.map((item: any) => ({
        id: item.id,
        name: item.name,
        productUrl: item.productUrl,
        floz: item.floz,
        calories: item.calories ?? null,
        caffeine: item.caffeine,
        mgFloz: item.mgFloz ?? null,
        imageUrl: item.imageUrl ?? null,
        sugar: item.sugar ?? null,
      }));

      await storage.bulkInsertCaffeineItems(dbItems);
      res.json({ message: `Seeded ${items.length} caffeine items`, seeded: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Send push notification to topic (protected by admin PIN)
  app.post("/api/admin/sendNotification", async (req, res) => {
    try {
      const { pin, title, body, scheduledFor } = req.body;
      
      if (pin !== ADMIN_PIN) {
        return res.status(401).json({ error: "Invalid PIN" });
      }
      
      if (!title || !body) {
        return res.status(400).json({ error: "Title and body are required" });
      }

      if (scheduledFor) {
        const scheduledDate = new Date(scheduledFor);
        if (scheduledDate <= new Date()) {
          return res.status(400).json({ error: "Scheduled time must be in the future" });
        }
        
        const notification = await storage.createNotification({
          title,
          body,
          status: "scheduled",
          scheduledFor: scheduledDate,
        });
        
        res.json({ success: true, scheduled: true, notification });
      } else {
        const result = await sendTopicNotification("caffitrack", { title, body });
        
        if (result.success) {
          await storage.createNotification({
            title,
            body,
            status: "sent",
            messageId: result.messageId,
            sentAt: new Date(),
          });
          res.json({ success: true, messageId: result.messageId });
        } else {
          await storage.createNotification({
            title,
            body,
            status: "failed",
            error: result.error,
          });
          res.status(500).json({ success: false, error: result.error });
        }
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get notification history (PIN protected via query param)
  app.get("/api/admin/notifications", async (req, res) => {
    try {
      const pin = req.query.pin as string;
      if (pin !== ADMIN_PIN) {
        return res.status(401).json({ error: "Invalid PIN" });
      }
      const history = await storage.getNotificationHistory();
      res.json(history);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get scheduled notifications (PIN protected via query param)
  app.get("/api/admin/notifications/scheduled", async (req, res) => {
    try {
      const pin = req.query.pin as string;
      if (pin !== ADMIN_PIN) {
        return res.status(401).json({ error: "Invalid PIN" });
      }
      const scheduled = await storage.getScheduledNotifications();
      res.json(scheduled);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Cancel a scheduled notification
  app.post("/api/admin/notifications/:id/cancel", async (req, res) => {
    try {
      const { pin } = req.body;
      const { id } = req.params;
      
      if (pin !== ADMIN_PIN) {
        return res.status(401).json({ error: "Invalid PIN" });
      }
      
      const result = await storage.updateNotificationStatus(id, "cancelled");
      if (!result) {
        return res.status(404).json({ error: "Notification not found" });
      }
      
      res.json({ success: true, notification: result });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get notification templates
  app.get("/api/admin/notifications/templates", async (req, res) => {
    res.json(notificationTemplates);
  });

  // Recurring notification routes
  app.get("/api/admin/notifications/recurring", async (req, res) => {
    try {
      const pin = req.query.pin as string;
      if (pin !== ADMIN_PIN) {
        return res.status(401).json({ error: "Invalid PIN" });
      }
      const recurring = await storage.getRecurringNotifications();
      res.json(recurring);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/admin/notifications/recurring", async (req, res) => {
    try {
      const { pin, title, body, hour, minute } = req.body;
      if (pin !== ADMIN_PIN) {
        return res.status(401).json({ error: "Invalid PIN" });
      }
      if (!title || !body || hour === undefined || minute === undefined) {
        return res.status(400).json({ error: "Title, body, hour, and minute are required" });
      }
      const notification = await storage.createRecurringNotification({
        title,
        body,
        hour: Number(hour),
        minute: Number(minute),
      });
      res.json(notification);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/admin/notifications/recurring/:id", async (req, res) => {
    try {
      const { pin } = req.body;
      const { id } = req.params;
      if (pin !== ADMIN_PIN) {
        return res.status(401).json({ error: "Invalid PIN" });
      }
      await storage.deleteRecurringNotification(id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/admin/notifications/recurring/:id/toggle", async (req, res) => {
    try {
      const { pin, enabled } = req.body;
      const { id } = req.params;
      if (pin !== ADMIN_PIN) {
        return res.status(401).json({ error: "Invalid PIN" });
      }
      await storage.toggleRecurringNotification(id, enabled);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Start the scheduler for processing scheduled notifications
  startScheduler();

  return httpServer;
}
