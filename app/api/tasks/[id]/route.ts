import db from "@/lib/db";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

type Status = "Todo" | "In-Progress" | "Complete";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(
  request: Request,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
    const taskId = Number(id);

    if (!Number.isInteger(taskId) || taskId <= 0) {
      return NextResponse.json(
        { message: "Invalid task ID" },
        { status: 400 }
      );
    }

    const existingTask = db
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
        WHERE id = ? AND archived = 0
      `)
      .get(taskId) as
      | {
          id: number;
          title: string;
          description: string;
          due_date: string;
          topic: string;
          status: Status;
          archived: number;
          created_at: string;
        }
      | undefined;

    if (!existingTask) {
      return NextResponse.json(
        { message: "Task not found" },
        { status: 404 }
      );
    }

    const body = await request.json();

    const title =
      typeof body.title === "string"
        ? body.title.trim()
        : existingTask.title;

    const description =
      typeof body.description === "string"
        ? body.description.trim()
        : existingTask.description;

    const dueDate =
      typeof body.due_date === "string"
        ? body.due_date
        : existingTask.due_date;

    const topic =
      typeof body.topic === "string"
        ? body.topic.trim()
        : existingTask.topic;

    const status =
      typeof body.status === "string"
        ? (body.status as Status)
        : existingTask.status;

    const allowedStatuses: Status[] = [
      "Todo",
      "In-Progress",
      "Complete",
    ];

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

    db.prepare(`
      UPDATE tasks
      SET
        title = ?,
        description = ?,
        due_date = ?,
        topic = ?,
        status = ?
      WHERE id = ? AND archived = 0
    `).run(
      title,
      description,
      dueDate,
      topic,
      status,
      taskId
    );

    const updatedTask = db
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
      .get(taskId);

    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error("Failed to update task:", error);

    return NextResponse.json(
      { message: "Failed to update task" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
    const taskId = Number(id);

    if (!Number.isInteger(taskId) || taskId <= 0) {
      return NextResponse.json(
        { message: "Invalid task ID" },
        { status: 400 }
      );
    }

    const result = db
      .prepare(`
        UPDATE tasks
        SET archived = 1
        WHERE id = ? AND archived = 0
      `)
      .run(taskId);

    if (result.changes === 0) {
      return NextResponse.json(
        { message: "Task not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Task archived",
    });
  } catch (error) {
    console.error("Failed to archive task:", error);

    return NextResponse.json(
      { message: "Failed to archive task" },
      { status: 500 }
    );
  }
}