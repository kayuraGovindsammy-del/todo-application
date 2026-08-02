import db from "@/lib/db";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

type Task = {
  id: number;
  title: string;
  description: string;
  due_date: string;
  topic: string;
  status: "Todo" | "In-Progress" | "Complete";
  archived: number;
  created_at: string;
};

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
        WHERE archived = 0
        ORDER BY created_at DESC
      `)
      .all() as Task[];

    return NextResponse.json(tasks);
  } catch (error) {
    console.error("Failed to load tasks:", error);

    return NextResponse.json(
      { message: "Failed to load tasks" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const title = body.title?.trim();
    const description = body.description?.trim();
    const dueDate = body.due_date;
    const topic = body.topic?.trim();
    const status = body.status ?? "Todo";

    const allowedStatuses = ["Todo", "In-Progress", "Complete"];

    if (!title || !description || !dueDate || !topic) {
      return NextResponse.json(
        {
          message:
            "Title, description, due date and topic are all required",
        },
        { status: 400 }
      );
    }

    if (!allowedStatuses.includes(status)) {
      return NextResponse.json(
        { message: "Invalid task status" },
        { status: 400 }
      );
    }

    const result = db
      .prepare(`
        INSERT INTO tasks (
          title,
          description,
          due_date,
          topic,
          status
        )
        VALUES (?, ?, ?, ?, ?)
      `)
      .run(title, description, dueDate, topic, status);

    const newTask = db
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
        WHERE id = ?
      `)
      .get(result.lastInsertRowid);

    return NextResponse.json(newTask, { status: 201 });
  } catch (error) {
    console.error("Failed to create task:", error);

    return NextResponse.json(
      { message: "Failed to create task" },
      { status: 500 }
    );
  }
}