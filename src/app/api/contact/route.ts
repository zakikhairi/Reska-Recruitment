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

    // Otherwise get all conversations for this email
    if (!email) {
      return NextResponse.json(
        { success: false, error: "Email atau conversationId diperlukan" },
        { status: 400 }
      );
    }

    const conversations = await prisma.contactConversation.findMany({
      where: { applicantEmail: email },
      include: {
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: { lastMessageAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      conversations,
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
      // Create new conversation
      const conversation = await prisma.contactConversation.create({
        data: {
          applicantEmail: senderEmail,
          applicantName: senderName,
          status: "ACTIVE",
        },
      });

      // Create first message
      const newMessage = await prisma.contactMessage.create({
        data: {
          conversationId: conversation.id,
          senderType,
          senderName,
          senderEmail,
          message,
        },
      });

      console.log(`[CHAT] New conversation from ${senderName} (${senderEmail})`);

      return NextResponse.json({
        success: true,
        message: "Pesan terkirim",
        data: {
          conversationId: conversation.id,
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
