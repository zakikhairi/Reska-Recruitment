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

    // Get all conversations grouped by applicant (merge same applicant into one)
    const where = status && status !== "all" ? { status } : {};

    const conversations = await prisma.contactConversation.findMany({
      where,
      include: {
        messages: {
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { lastMessageAt: "desc" },
    });

    // Get stats - count unique applicants
    const allConversations = await prisma.contactConversation.findMany({ where });
    const uniqueEmails = [...new Set(allConversations.map(c => c.applicantEmail))];
    const total = uniqueEmails.length;
    const active = [...new Set(
      allConversations.filter(c => c.status === "ACTIVE").map(c => c.applicantEmail)
    )].length;
    const closed = [...new Set(
      allConversations.filter(c => c.status === "CLOSED").map(c => c.applicantEmail)
    )].length;

    // Group conversations by applicant email and merge
    const groupedByEmail: Record<string, typeof conversations> = {};
    for (const conv of conversations) {
      if (!groupedByEmail[conv.applicantEmail]) {
        groupedByEmail[conv.applicantEmail] = [];
      }
      groupedByEmail[conv.applicantEmail].push(conv);
    }

    // Create merged conversations (one per applicant)
    const mergedConversations = await Promise.all(
      Object.entries(groupedByEmail).map(async ([email, convs]) => {
        // Sort by lastMessageAt
        convs.sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());

        const primaryConv = convs[0];
        const allMessages = convs.flatMap(c => c.messages);

        // Get last message
        const lastMessage = allMessages.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )[0];

        // Count total unread from all conversations for this applicant
        const unreadCount = await prisma.contactMessage.count({
          where: {
            conversationId: { in: convs.map(c => c.id) },
            senderType: "APPLICANT",
            isRead: false,
          },
        });

        return {
          id: primaryConv.id,
          applicantEmail: email,
          applicantName: primaryConv.applicantName,
          status: primaryConv.status,
          lastMessageAt: primaryConv.lastMessageAt,
          messages: [lastMessage].filter(Boolean),
          unreadCount,
          // Include all conversation IDs for reference
          allConversationIds: convs.map(c => c.id),
        };
      })
    );

    // Sort by lastMessageAt
    mergedConversations.sort(
      (a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
    );

    return NextResponse.json({
      success: true,
      conversations: mergedConversations,
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
