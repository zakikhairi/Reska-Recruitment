// Shared Database via API
// This API route acts as a bridge between client-side localStorage and server-side processing

import { NextRequest, NextResponse } from "next/server";

// In-memory cache (persists during server runtime)
let serverCache: any = null;

export async function GET() {
  return NextResponse.json({ db: serverCache });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { db } = body;

    if (db) {
      serverCache = db;
      return NextResponse.json({ success: true, message: "Database synced to server" });
    }

    return NextResponse.json({ success: false, error: "No database data provided" }, { status: 400 });
  } catch (error) {
    console.error("Error syncing database:", error);
    return NextResponse.json({ success: false, error: "Sync failed" }, { status: 500 });
  }
}
