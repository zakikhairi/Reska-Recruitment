// API Route: Chat Conversations (Admin)
// GET /api/admin/contacts - Get all conversations
// POST /api/admin/contacts - Send reply from admin

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const conversationId = searchParams.get("conversationId");

    // If conversationId provided, get messages
    if (conversationId) {
      const messages = await prisma.contactMessage.findMany({
        where: { conversationId },
        orderBy: { createdAt: "asc" },
      });

      // Mark messages as read
      await prisma.contactMessage.updateMany({
        where: {
          conversationId,
          senderType: "APPLICANT",
          isRead: false,
        },
        data: { isRead: true },
      });

      return NextResponse.json({
        success: true,
        messages,
      });
    }

    // Get all conversations
    const where = status && status !== "all" ? { status } : {};

    const conversations = await prisma.contactConversation.findMany({
      where,
      include: {
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: { lastMessageAt: "desc" },
    });

    // Get stats
    const total = await prisma.contactConversation.count();
    const active = await prisma.contactConversation.count({ where: { status: "ACTIVE" } });
    const closed = await prisma.contactConversation.count({ where: { status: "CLOSED" } });

    // Count unread per conversation
    const conversationsWithUnread = await Promise.all(
      conversations.map(async (conv) => {
        const unreadCount = await prisma.contactMessage.count({
          where: {
            conversationId: conv.id,
            senderType: "APPLICANT",
            isRead: false,
          },
        });
        return { ...conv, unreadCount };
      })
    );

    return NextResponse.json({
      success: true,
      conversations: conversationsWithUnread,
      stats: { total, active, closed },
    });
  } catch (error) {
    console.error("Admin get conversations error:", error);
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

// POST - Send reply from admin
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { conversationId, senderName, senderEmail, message } = body;

    if (!conversationId || !senderName || !senderEmail || !message) {
      return NextResponse.json(
        { success: false, error: "Semua field harus diisi" },
        { status: 400 }
      );
    }

    const newMessage = await prisma.contactMessage.create({
      data: {
        conversationId,
        senderType: "HR_ADMIN",
        senderName,
        senderEmail,
        message,
      },
    });

    // Update conversation lastMessageAt
    await prisma.contactConversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: new Date() },
    });

    console.log(`[CHAT] Admin replied in conversation ${conversationId}`);

    return NextResponse.json({
      success: true,
      message: "Balasan terkirim",
      data: { messageId: newMessage.id },
    });
  } catch (error) {
    console.error("Admin send reply error:", error);
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
