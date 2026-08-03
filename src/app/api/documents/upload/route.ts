// API Route: Upload Documents
// POST /api/documents/upload

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/jpg",
  "application/pdf",
];

const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".pdf"];

const DOCUMENT_TYPES = ["PHOTO", "CV", "IJAZAH", "TRANSCRIPT", "CERTIFICATE", "KTPCARD", "SKCK", "OTHER"];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const type = formData.get("type") as string | null;
    const applicantId = formData.get("applicantId") as string | null;

    // Validation
    if (!file) {
      return NextResponse.json(
        { success: false, error: "File tidak ditemukan" },
        { status: 400 }
      );
    }

    if (!type || !DOCUMENT_TYPES.includes(type)) {
      return NextResponse.json(
        { success: false, error: "Jenis dokumen tidak valid" },
        { status: 400 }
      );
    }

    if (!applicantId) {
      return NextResponse.json(
        { success: false, error: "ID pelamar tidak ditemukan" },
        { status: 400 }
      );
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: "Ukuran file maksimal 10MB" },
        { status: 400 }
      );
    }

    // Check file type
    const fileExtension = path.extname(file.name).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(fileExtension)) {
      return NextResponse.json(
        { success: false, error: "Format file tidak diizinkan. Gunakan JPG, PNG, atau PDF" },
        { status: 400 }
      );
    }

    // Verify applicant exists
    const applicant = await prisma.applicant.findUnique({
      where: { id: applicantId },
    });

    if (!applicant) {
      return NextResponse.json(
        { success: false, error: "Profil pelamar tidak ditemukan" },
        { status: 404 }
      );
    }

    // Create upload directory if not exists
    const uploadDir = path.join(process.cwd(), "public", "uploads", "documents", applicantId);
    await mkdir(uploadDir, { recursive: true });

    // Generate unique filename
    const timestamp = Date.now();
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const fileName = `${type}_${timestamp}_${sanitizedFileName}`;
    const filePath = path.join(uploadDir, fileName);

    // Save file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Create file URL
    const fileUrl = `/uploads/documents/${applicantId}/${fileName}`;

    // If type is PHOTO or CV, update applicant record too
    if (type === "PHOTO") {
      await prisma.applicant.update({
        where: { id: applicantId },
        data: { photoUrl: fileUrl },
      });
    } else if (type === "CV") {
      await prisma.applicant.update({
        where: { id: applicantId },
        data: { cvUrl: fileUrl },
      });
    }

    // Save document record
    const document = await prisma.document.create({
      data: {
        applicantId,
        type,
        fileName: file.name,
        fileUrl,
        fileSize: file.size,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Dokumen berhasil diupload",
      document: {
        id: document.id,
        type: document.type,
        fileName: document.fileName,
        fileUrl: document.fileUrl,
        fileSize: document.fileSize,
        uploadedAt: document.uploadedAt,
      },
    });
  } catch (error) {
    console.error("Upload document error:", error);
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan saat mengupload dokumen" },
      { status: 500 }
    );
  }
}

// GET: Get applicant's documents
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const applicantId = searchParams.get("applicantId");

    if (!applicantId) {
      return NextResponse.json(
        { success: false, error: "ID pelamar diperlukan" },
        { status: 400 }
      );
    }

    const documents = await prisma.document.findMany({
      where: { applicantId },
      orderBy: { uploadedAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      documents,
    });
  } catch (error) {
    console.error("Get documents error:", error);
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

// DELETE: Delete a document
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const documentId = searchParams.get("id");

    if (!documentId) {
      return NextResponse.json(
        { success: false, error: "ID dokumen diperlukan" },
        { status: 400 }
      );
    }

    const document = await prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      return NextResponse.json(
        { success: false, error: "Dokumen tidak ditemukan" },
        { status: 404 }
      );
    }

    // Delete file from filesystem
    try {
      const filePath = path.join(process.cwd(), "public", document.fileUrl);
      const { unlink } = await import("fs/promises");
      await unlink(filePath);
    } catch (fileError) {
      console.warn("Could not delete file:", fileError);
    }

    // Delete database record
    await prisma.document.delete({
      where: { id: documentId },
    });

    return NextResponse.json({
      success: true,
      message: "Dokumen berhasil dihapus",
    });
  } catch (error) {
    console.error("Delete document error:", error);
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
