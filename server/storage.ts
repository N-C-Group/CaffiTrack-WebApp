import { db } from "./db";
import { users, contactMessages, featureRequests, caffeineItems, notificationHistory, recurringNotifications, type User, type InsertUser, type ContactMessage, type InsertContactMessage, type FeatureRequest, type InsertFeatureRequest, type CaffeineItem, type InsertCaffeineItem, type NotificationHistory, type InsertNotification, type RecurringNotification, type InsertRecurringNotification } from "@shared/schema";
import { eq, desc, ilike, lte, and } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createContactMessage(message: InsertContactMessage): Promise<ContactMessage>;
  createFeatureRequest(request: InsertFeatureRequest): Promise<FeatureRequest>;
  getFeatureRequests(): Promise<FeatureRequest[]>;
  updateFeatureRequestStatus(id: string, status: "accepted" | "rejected"): Promise<FeatureRequest | undefined>;
  getAllCaffeineItems(): Promise<CaffeineItem[]>;
  getCaffeineItemsCount(): Promise<number>;
  searchCaffeineItems(query: string): Promise<CaffeineItem[]>;
  bulkInsertCaffeineItems(items: InsertCaffeineItem[]): Promise<void>;
  createNotification(notification: InsertNotification): Promise<NotificationHistory>;
  getNotificationHistory(): Promise<NotificationHistory[]>;
  getScheduledNotifications(): Promise<NotificationHistory[]>;
  getPendingScheduledNotifications(): Promise<NotificationHistory[]>;
  updateNotificationStatus(id: string, status: "sent" | "failed" | "cancelled", messageId?: string, error?: string): Promise<NotificationHistory | undefined>;
  claimScheduledNotification(id: string): Promise<boolean>;
  createRecurringNotification(notification: InsertRecurringNotification): Promise<RecurringNotification>;
  getRecurringNotifications(): Promise<RecurringNotification[]>;
  updateRecurringNotificationLastSent(id: string, date: string): Promise<void>;
  deleteRecurringNotification(id: string): Promise<void>;
  toggleRecurringNotification(id: string, enabled: boolean): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async createContactMessage(insertMessage: InsertContactMessage): Promise<ContactMessage> {
    const [message] = await db.insert(contactMessages).values(insertMessage).returning();
    return message;
  }

  async createFeatureRequest(insertRequest: InsertFeatureRequest): Promise<FeatureRequest> {
    const [request] = await db.insert(featureRequests).values({
      type: insertRequest.type as "drink" | "chain",
      name: insertRequest.name,
      details: insertRequest.details ?? null,
      submitterEmail: insertRequest.submitterEmail ?? null,
    }).returning();
    return request;
  }

  async getFeatureRequests(): Promise<FeatureRequest[]> {
    return await db.select().from(featureRequests).orderBy(desc(featureRequests.createdAt));
  }

  async updateFeatureRequestStatus(id: string, status: "accepted" | "rejected"): Promise<FeatureRequest | undefined> {
    const [request] = await db
      .update(featureRequests)
      .set({ status })
      .where(eq(featureRequests.id, id))
      .returning();
    return request;
  }

  async getAllCaffeineItems(): Promise<CaffeineItem[]> {
    return await db.select().from(caffeineItems).orderBy(caffeineItems.id);
  }

  async getCaffeineItemsCount(): Promise<number> {
    const result = await db.select().from(caffeineItems);
    return result.length;
  }

  async searchCaffeineItems(query: string): Promise<CaffeineItem[]> {
    return await db.select().from(caffeineItems).where(ilike(caffeineItems.name, `%${query}%`)).orderBy(caffeineItems.name);
  }

  async bulkInsertCaffeineItems(items: InsertCaffeineItem[]): Promise<void> {
    if (items.length === 0) return;
    await db.insert(caffeineItems).values(items).onConflictDoNothing();
  }

  async createNotification(notification: InsertNotification): Promise<NotificationHistory> {
    const status = (notification.status || "sent") as "sent" | "failed" | "scheduled" | "cancelled";
    const [result] = await db.insert(notificationHistory).values({
      title: notification.title,
      body: notification.body,
      status,
      messageId: notification.messageId || null,
      error: notification.error || null,
      scheduledFor: notification.scheduledFor || null,
      sentAt: notification.sentAt || null,
    }).returning();
    return result;
  }

  async getNotificationHistory(): Promise<NotificationHistory[]> {
    return await db.select().from(notificationHistory).orderBy(desc(notificationHistory.createdAt)).limit(50);
  }

  async getScheduledNotifications(): Promise<NotificationHistory[]> {
    return await db.select().from(notificationHistory)
      .where(eq(notificationHistory.status, "scheduled"))
      .orderBy(notificationHistory.scheduledFor);
  }

  async getPendingScheduledNotifications(): Promise<NotificationHistory[]> {
    const now = new Date();
    return await db.select().from(notificationHistory)
      .where(and(
        eq(notificationHistory.status, "scheduled"),
        lte(notificationHistory.scheduledFor, now)
      ));
  }

  async updateNotificationStatus(id: string, status: "sent" | "failed" | "cancelled", messageId?: string, error?: string): Promise<NotificationHistory | undefined> {
    const updateData: Partial<NotificationHistory> = { status };
    if (messageId) updateData.messageId = messageId;
    if (error) updateData.error = error;
    if (status === "sent") updateData.sentAt = new Date();
    
    const [result] = await db.update(notificationHistory)
      .set(updateData)
      .where(eq(notificationHistory.id, id))
      .returning();
    return result;
  }

  async claimScheduledNotification(id: string): Promise<boolean> {
    // Atomically claim a scheduled notification by updating only if still "scheduled"
    const [result] = await db.update(notificationHistory)
      .set({ status: "sent" as const }) // Temporarily mark as "sent" to claim it
      .where(and(
        eq(notificationHistory.id, id),
        eq(notificationHistory.status, "scheduled")
      ))
      .returning();
    return !!result;
  }

  async createRecurringNotification(notification: InsertRecurringNotification): Promise<RecurringNotification> {
    const [result] = await db.insert(recurringNotifications).values({
      title: notification.title,
      body: notification.body,
      hour: notification.hour,
      minute: notification.minute,
    }).returning();
    return result;
  }

  async getRecurringNotifications(): Promise<RecurringNotification[]> {
    return await db.select().from(recurringNotifications).orderBy(recurringNotifications.hour);
  }

  async updateRecurringNotificationLastSent(id: string, date: string): Promise<void> {
    await db.update(recurringNotifications)
      .set({ lastSentDate: date })
      .where(eq(recurringNotifications.id, id));
  }

  async deleteRecurringNotification(id: string): Promise<void> {
    await db.delete(recurringNotifications).where(eq(recurringNotifications.id, id));
  }

  async toggleRecurringNotification(id: string, enabled: boolean): Promise<void> {
    await db.update(recurringNotifications)
      .set({ enabled: enabled ? 1 : 0 })
      .where(eq(recurringNotifications.id, id));
  }
}

export const storage = new DatabaseStorage();
