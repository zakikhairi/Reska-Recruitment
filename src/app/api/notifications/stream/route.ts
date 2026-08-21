import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

// Store for active connections (in-memory for demo)
const clients = new Map<string, Set<string>>();

// Add client to notification stream
export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "userId required" }, { status: 400 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // Add client to subscribers
      if (!clients.has(userId)) {
        clients.set(userId, new Set());
      }
      clients.get(userId)!.add(userId);

      // Send initial connection message
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "connected", timestamp: Date.now() })}\n\n`));

      // Keep-alive ping every 30 seconds
      const pingInterval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "ping", timestamp: Date.now() })}\n\n`));
        } catch {
          clearInterval(pingInterval);
        }
      }, 30000);

      // Store cleanup function
      request.signal.addEventListener("abort", () => {
        clearInterval(pingInterval);
        clients.get(userId)?.delete(userId);
        if (clients.get(userId)?.size === 0) {
          clients.delete(userId);
        }
      });
    },
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}

// Function to send notification to specific user
export async function sendNotification(userId: string, notification: {
  type: string;
  title: string;
  message: string;
  data?: any;
}) {
  if (!clients.has(userId)) {
    console.log(`User ${userId} not connected, notification skipped`);
    return;
  }

  const encoder = new TextEncoder();
  const data = JSON.stringify({
    type: "notification",
    timestamp: Date.now(),
    ...notification,
  });

  // Store notification in database
  try {
    await prisma.notification.create({
      data: {
        userId,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        data: notification.data ? JSON.stringify(notification.data) : null,
        isRead: false,
      },
    });
  } catch (error) {
    console.error("Failed to store notification:", error);
  }
}

// Broadcast to all connected clients
export async function broadcast(notification: {
  type: string;
  title: string;
  message: string;
  data?: any;
  userIds?: string[];
}) {
  const encoder = new TextEncoder();
  const data = JSON.stringify({
    type: "notification",
    timestamp: Date.now(),
    ...notification,
  });

  const { userIds, ...notificationData } = notification;

  // If specific userIds provided, only send to them
  const targetUserIds = userIds || Array.from(clients.keys());

  for (const userId of targetUserIds) {
    if (clients.has(userId)) {
      // Store notification in database
      try {
        await prisma.notification.create({
          data: {
            userId,
            type: notification.type,
            title: notification.title,
            message: notification.message,
            data: notification.data ? JSON.stringify(notification.data) : null,
            isRead: false,
          },
        });
      } catch (error) {
        console.error("Failed to store notification:", error);
      }
    }
  }
}
