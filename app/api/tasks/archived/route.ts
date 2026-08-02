import db from "@/lib/db";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  try {
    const tasks = db
      .prepare(`
        SELECT
          id,
          title,
          description,
          due_date,
          topic,
          status,
          archived,
          created_at
        FROM tasks
        WHERE archived = 1
        ORDER BY created_at DESC
      `)
      .all();

    return NextResponse.json(tasks);
  } catch (error) {
    console.error("Failed to load archived tasks:", error);

    return NextResponse.json(
      { message: "Failed to load archived tasks" },
      { status: 500 }
    );
  }
}