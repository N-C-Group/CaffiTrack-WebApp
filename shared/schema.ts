import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, real, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const requestTypeEnum = ["drink", "chain"] as const;
export const requestStatusEnum = ["pending", "accepted", "rejected"] as const;

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export const contactMessages = pgTable("contact_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull(),
  message: text("message").notNull(),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const insertContactMessageSchema = createInsertSchema(contactMessages).pick({
  name: true,
  email: true,
  message: true,
});

export type InsertContactMessage = z.infer<typeof insertContactMessageSchema>;
export type ContactMessage = typeof contactMessages.$inferSelect;

export const featureRequests = pgTable("feature_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: text("type").notNull().$type<"drink" | "chain">(),
  name: text("name").notNull(),
  details: text("details"),
  submitterEmail: text("submitter_email"),
  status: text("status").notNull().default("pending").$type<"pending" | "accepted" | "rejected">(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertFeatureRequestSchema = createInsertSchema(featureRequests).pick({
  type: true,
  name: true,
  details: true,
  submitterEmail: true,
});

export type InsertFeatureRequest = z.infer<typeof insertFeatureRequestSchema>;
export type FeatureRequest = typeof featureRequests.$inferSelect;

export const caffeineItems = pgTable("caffeine_items", {
  id: integer("id").primaryKey(),
  name: text("name").notNull(),
  productUrl: text("product_url").notNull(),
  floz: real("floz").notNull(),
  calories: integer("calories"),
  caffeine: integer("caffeine").notNull(),
  mgFloz: real("mg_floz"),
  imageUrl: text("image_url"),
  sugar: doublePrecision("sugar"),
});

export const insertCaffeineItemSchema = createInsertSchema(caffeineItems);
export type InsertCaffeineItem = z.infer<typeof insertCaffeineItemSchema>;
export type CaffeineItem = typeof caffeineItems.$inferSelect;

export const notificationStatusEnum = ["sent", "failed", "scheduled", "cancelled"] as const;

export const notificationHistory = pgTable("notification_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  body: text("body").notNull(),
  status: text("status").notNull().default("sent").$type<"sent" | "failed" | "scheduled" | "cancelled">(),
  messageId: text("message_id"),
  error: text("error"),
  scheduledFor: timestamp("scheduled_for"),
  sentAt: timestamp("sent_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertNotificationSchema = createInsertSchema(notificationHistory).pick({
  title: true,
  body: true,
  status: true,
  messageId: true,
  error: true,
  scheduledFor: true,
  sentAt: true,
});

export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type NotificationHistory = typeof notificationHistory.$inferSelect;

export const notificationTemplates = [
  { id: "reminder", title: "Don't forget!", body: "Have you logged your caffeine intake today?" },
  { id: "new_drinks", title: "New drinks added!", body: "We've added new drinks to our database. Check them out!" },
  { id: "update", title: "App Update Available", body: "A new version of CaffiTrack is available. Update now for the latest features!" },
  { id: "tip", title: "Caffeine Tip", body: "For better sleep, try to avoid caffeine 6 hours before bedtime." },
  { id: "welcome", title: "Welcome to CaffiTrack!", body: "Start tracking your caffeine intake to understand your habits better." },
] as const;

export type NotificationTemplate = typeof notificationTemplates[number];

export const recurringNotifications = pgTable("recurring_notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  body: text("body").notNull(),
  hour: integer("hour").notNull(),
  minute: integer("minute").notNull(),
  enabled: integer("enabled").notNull().default(1),
  lastSentDate: text("last_sent_date"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertRecurringNotificationSchema = createInsertSchema(recurringNotifications).pick({
  title: true,
  body: true,
  hour: true,
  minute: true,
});

export type InsertRecurringNotification = z.infer<typeof insertRecurringNotificationSchema>;
export type RecurringNotification = typeof recurringNotifications.$inferSelect;
