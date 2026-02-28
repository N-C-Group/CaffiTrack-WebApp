import { GoogleAuth } from "google-auth-library";

interface NotificationPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
}

let auth: GoogleAuth | null = null;

function getAuth(): GoogleAuth {
  if (!auth) {
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (!serviceAccountJson) {
      throw new Error("FIREBASE_SERVICE_ACCOUNT environment variable not set");
    }
    
    const credentials = JSON.parse(serviceAccountJson);
    auth = new GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/firebase.messaging"],
    });
  }
  return auth;
}

function getProjectId(): string {
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!serviceAccountJson) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT environment variable not set");
  }
  const credentials = JSON.parse(serviceAccountJson);
  return credentials.project_id;
}

export async function sendTopicNotification(
  topic: string,
  notification: NotificationPayload
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const authClient = getAuth();
    const projectId = getProjectId();
    const client = await authClient.getClient();
    const accessTokenResponse = await client.getAccessToken();
    const accessToken = accessTokenResponse.token;
    
    if (!accessToken) {
      throw new Error("Failed to get access token");
    }

    const message = {
      message: {
        topic,
        notification: {
          title: notification.title,
          body: notification.body,
        },
        data: notification.data || {},
        android: {
          priority: "high" as const,
          notification: {
            sound: "default",
            channelId: "caffitrack_notifications",
          },
        },
        apns: {
          payload: {
            aps: {
              sound: "default",
              badge: 1,
            },
          },
        },
      },
    };

    const response = await fetch(
      `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(message),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      console.error("FCM Error:", result);
      return { success: false, error: result.error?.message || "Failed to send notification" };
    }

    return { success: true, messageId: result.name };
  } catch (error: any) {
    console.error("FCM Error:", error);
    return { success: false, error: error.message };
  }
}
