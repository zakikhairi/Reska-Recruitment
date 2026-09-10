import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

// GET - Get conversations/messages for applicant
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");
    const conversationId = searchParams.get("conversationId");

    // If conversationId provided, get messages in that conversation
    if (conversationId) {
      const messages = await prisma.contactMessage.findMany({
        where: { conversationId },
        orderBy: { createdAt: "asc" },
      });

      // Mark messages as read
      await prisma.contactMessage.updateMany({
        where: {
          conversationId,
          senderType: "HR_ADMIN",
          isRead: false,
        },
        data: { isRead: true },
      });

      return NextResponse.json({
        success: true,
        messages,
      });
    }

    // Otherwise get the ACTIVE conversation for this email (only one)
    if (!email) {
      return NextResponse.json(
        { success: false, error: "Email atau conversationId diperlukan" },
        { status: 400 }
      );
    }

    // Get any conversation for this email (regardless of status)
    const conversation = await prisma.contactConversation.findFirst({
      where: {
        applicantEmail: email,
      },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
          take: 100, // Get all recent messages
        },
      },
      orderBy: { lastMessageAt: "desc" },
    });

    if (!conversation) {
      console.log(`[CHAT] No conversation found for email: ${email}`);
      return NextResponse.json({
        success: true,
        conversations: [],
      });
    }

    console.log(`[CHAT] Found conversation ${conversation.id} for ${email}, messages: ${conversation.messages.length}`);

    // Calculate unread count (HR_ADMIN messages that are not read)
    const unreadCount = await prisma.contactMessage.count({
      where: {
        conversationId: conversation.id,
        senderType: "HR_ADMIN",
        isRead: false,
      },
    });

    console.log(`[CHAT] Unread count: ${unreadCount}`);

    return NextResponse.json({
      success: true,
      conversations: [{ ...conversation, unreadCount }],
    });
  } catch (error) {
    console.error("Get messages error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: `Terjadi kesalahan server: ${errorMessage}` },
      { status: 500 }
    );
  }
}

// POST - Send new message or reply
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { conversationId, senderType, senderName, senderEmail, message } = body;

    // Validation
    if (!senderType || !senderName || !senderEmail || !message) {
      return NextResponse.json(
        { success: false, error: "Semua field harus diisi" },
        { status: 400 }
      );
    }

    if (!conversationId) {
      // Check if active conversation already exists for this email
      const existingConversation = await prisma.contactConversation.findFirst({
        where: {
          applicantEmail: senderEmail,
          status: "ACTIVE",
        },
        orderBy: { lastMessageAt: "desc" },
      });

      let conversationIdToUse = existingConversation?.id;

      if (!existingConversation) {
        // Create new conversation only if none exists
        const newConversation = await prisma.contactConversation.create({
          data: {
            applicantEmail: senderEmail,
            applicantName: senderName,
            status: "ACTIVE",
          },
        });
        conversationIdToUse = newConversation.id;
        console.log(`[CHAT] New conversation created for ${senderName} (${senderEmail})`);
      } else {
        console.log(`[CHAT] Using existing conversation ${conversationIdToUse} for ${senderName}`);
      }

      // Create message
      const newMessage = await prisma.contactMessage.create({
        data: {
          conversationId: conversationIdToUse!,
          senderType,
          senderName,
          senderEmail,
          message,
        },
      });

      // Update conversation lastMessageAt
      await prisma.contactConversation.update({
        where: { id: conversationIdToUse! },
        data: { lastMessageAt: new Date() },
      });

      return NextResponse.json({
        success: true,
        message: "Pesan terkirim",
        data: {
          conversationId: conversationIdToUse,
          messageId: newMessage.id,
        },
      });
    } else {
      // Add message to existing conversation
      const newMessage = await prisma.contactMessage.create({
        data: {
          conversationId,
          senderType,
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

      console.log(`[CHAT] Reply in ${conversationId} from ${senderType}: ${senderName}`);

      return NextResponse.json({
        success: true,
        message: "Pesan terkirim",
        data: {
          messageId: newMessage.id,
        },
      });
    }
  } catch (error) {
    console.error("Send message error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: `Terjadi kesalahan server: ${errorMessage}` },
      { status: 500 }
    );
  }
}
