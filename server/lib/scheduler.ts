import { storage } from "../storage";
import { sendTopicNotification } from "./firebase";

let schedulerInterval: NodeJS.Timeout | null = null;

function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0];
}

async function processRecurringNotifications() {
  try {
    const recurringNotifications = await storage.getRecurringNotifications();
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const todayDate = getTodayDateString();
    
    for (const notification of recurringNotifications) {
      if (notification.enabled !== 1) continue;
      if (notification.lastSentDate === todayDate) continue;
      
      // Check if it's time to send (within the current minute)
      if (notification.hour === currentHour && notification.minute === currentMinute) {
        try {
          const result = await sendTopicNotification("caffitrack", {
            title: notification.title,
            body: notification.body,
          });
          
          if (result.success) {
            await storage.updateRecurringNotificationLastSent(notification.id, todayDate);
            // Also log to notification history
            await storage.createNotification({
              title: notification.title,
              body: notification.body,
              status: "sent",
              messageId: result.messageId,
              sentAt: new Date(),
            });
            console.log(`Recurring notification sent: ${notification.title}`);
          } else {
            console.error(`Failed to send recurring notification: ${notification.title}`, result.error);
          }
        } catch (error: any) {
          console.error(`Error sending recurring notification: ${notification.title}`, error);
        }
      }
    }
  } catch (error) {
    console.error("Error processing recurring notifications:", error);
  }
}

async function processScheduledNotifications() {
  try {
    const pendingNotifications = await storage.getPendingScheduledNotifications();
    
    for (const notification of pendingNotifications) {
      try {
        // Mark as "sending" to prevent duplicate sends in race conditions
        const claimed = await storage.claimScheduledNotification(notification.id);
        if (!claimed) {
          console.log(`Notification ${notification.id} already claimed by another process`);
          continue;
        }
        
        const result = await sendTopicNotification("caffitrack", {
          title: notification.title,
          body: notification.body,
        });
        
        if (result.success) {
          await storage.updateNotificationStatus(notification.id, "sent", result.messageId);
          console.log(`Scheduled notification sent: ${notification.id}`);
        } else {
          await storage.updateNotificationStatus(notification.id, "failed", undefined, result.error);
          console.error(`Failed to send scheduled notification: ${notification.id}`, result.error);
        }
      } catch (error: any) {
        await storage.updateNotificationStatus(notification.id, "failed", undefined, error.message);
        console.error(`Error sending scheduled notification: ${notification.id}`, error);
      }
    }
  } catch (error) {
    console.error("Error processing scheduled notifications:", error);
  }
}

async function processAllNotifications() {
  await processScheduledNotifications();
  await processRecurringNotifications();
}

export function startScheduler() {
  if (schedulerInterval) {
    console.log("Scheduler already running");
    return;
  }
  
  console.log("Starting notification scheduler (checking every 60 seconds)");
  schedulerInterval = setInterval(processAllNotifications, 60 * 1000);
  
  processAllNotifications();
}

export function stopScheduler() {
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
    schedulerInterval = null;
    console.log("Notification scheduler stopped");
  }
}
