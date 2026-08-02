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

    const body = await request.json();
    const status = body.status as Status;

    const allowedStatuses: Status[] = [
      "Todo",
      "In-Progress",
      "Complete",
    ];

    if (!allowedStatuses.includes(status)) {
      return NextResponse.json(
        { message: "Invalid task status" },
        { status: 400 }
      );
    }

    const result = db
      .prepare(`
        UPDATE tasks
        SET status = ?
        WHERE id = ? AND archived = 0
      `)
      .run(status, taskId);

    if (result.changes === 0) {
      return NextResponse.json(
        { message: "Task not found" },
        { status: 404 }
      );
    }

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
    console.error("Failed to update task status:", error);

    return NextResponse.json(
      { message: "Failed to update task status" },
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