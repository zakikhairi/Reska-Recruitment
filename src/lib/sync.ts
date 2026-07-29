// Database Sync Utility
// Provides functions to sync localStorage database with server

const DB_KEY = "kai_recruitment_db";

// Get database from localStorage
export function getLocalDB(): any {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(DB_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  }
  return null;
}

// Save database to localStorage
export function saveLocalDB(db: any): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(DB_KEY, JSON.stringify(db));
}

// Sync database from server response
export function syncFromServerResponse(response: any): void {
  if (response.db) {
    saveLocalDB(response.db);
  }
}

// Fetch with database sync
export async function syncFetch(url: string, options: RequestInit = {}): Promise<any> {
  const localDB = getLocalDB();

  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  // If it's a POST/PATCH request, include localDB
  if (options.method === "POST" || options.method === "PATCH") {
    const body = JSON.parse(options.body as string || "{}");
    body.db = localDB;
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const result = await response.json();

  // Sync from server response
  syncFromServerResponse(result);

  return result;
}

// Get data from server with optional db parameter
export async function syncGet(url: string): Promise<any> {
  const response = await fetch(url, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  const result = await response.json();
  syncFromServerResponse(result);
  return result;
}
