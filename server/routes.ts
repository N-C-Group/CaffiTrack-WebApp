import type { Express } from "express";
import { type Server } from "http";
import {
  insertContactMessageSchema,
  insertFeatureRequestSchema,
} from "@shared/schema";
import { sendContactEmail, sendFeatureRequestEmail } from "./lib/resend";

export async function registerRoutes(
  httpServer: Server,
  app: Express,
): Promise<Server> {
  app.post("/api/contact", async (req, res) => {
    try {
      const data = insertContactMessageSchema.parse(req.body);

      sendContactEmail(data.name, data.email, data.message).catch((err) => {
        console.error("Email sending failed:", err);
      });

      res.json({ ok: true });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Invalid request body";
      res.status(400).json({ error: message });
    }
  });

  app.post("/api/requests", async (req, res) => {
    try {
      const raw = req.body as Record<string, unknown>;
      const data = insertFeatureRequestSchema.parse({
        type: raw.type,
        name: raw.name,
        details: raw.details,
        submitterEmail:
          typeof raw.submitterEmail === "string" ? raw.submitterEmail : "",
      });

      sendFeatureRequestEmail({
        type: data.type,
        name: data.name,
        details: data.details,
        submitterEmail:
          data.submitterEmail?.trim() ? data.submitterEmail.trim() : undefined,
      }).catch((err) => {
        console.error("Feature request email failed:", err);
      });

      res.json({ ok: true });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Invalid request body";
      res.status(400).json({ error: message });
    }
  });

  return httpServer;
}
