// API Route: Upload Applicant Photo
// POST /api/applicant/photo

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("photo") as File | null;
    const userId = formData.get("userId") as string | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "Tidak ada file yang diupload" },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User ID diperlukan" },
        { status: 400 }
      );
    }

    // Validate file type - only allow JPG/JPEG
    const allowedTypes = ["image/jpeg", "image/jpg", "image/pjpeg"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: "Hanya format JPG/JPEG yang diizinkan" },
        { status: 400 }
      );
    }

    // Validate file size (max 2MB)
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: "Ukuran file maksimal 2MB" },
        { status: 400 }
      );
    }

    // Get applicant by userId
    const applicant = await prisma.applicant.findUnique({
      where: { userId },
    });

    if (!applicant) {
      return NextResponse.json(
        { success: false, error: "Pelamar tidak ditemukan" },
        { status: 404 }
      );
    }

    // Create uploads directory if not exists
    const uploadsDir = path.join(process.cwd(), "public", "uploads", "photos");
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Generate unique filename
    const fileExtension = file.name.split(".").pop() || "jpg";
    const fileName = `photo_${userId}_${Date.now()}.${fileExtension}`;
    const filePath = path.join(uploadsDir, fileName);

    // Write file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Update database with photo URL
    const photoUrl = `/uploads/photos/${fileName}`;
    await prisma.applicant.update({
      where: { id: applicant.id },
      data: { photoUrl },
    });

    console.log("[PHOTO] Uploaded:", photoUrl);

    return NextResponse.json({
      success: true,
      message: "Foto berhasil diupload",
      photoUrl,
    });

  } catch (error) {
    console.error("Upload photo error:", error);
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

// DELETE /api/applicant/photo - Delete photo
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User ID diperlukan" },
        { status: 400 }
      );
    }

    const applicant = await prisma.applicant.findUnique({
      where: { userId },
    });

    if (!applicant) {
      return NextResponse.json(
        { success: false, error: "Pelamar tidak ditemukan" },
        { status: 404 }
      );
    }

    // Delete photo from database
    await prisma.applicant.update({
      where: { id: applicant.id },
      data: { photoUrl: null },
    });

    return NextResponse.json({
      success: true,
      message: "Foto berhasil dihapus",
    });

  } catch (error) {
    console.error("Delete photo error:", error);
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
