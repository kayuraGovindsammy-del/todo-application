import Database from "better-sqlite3";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  test,
} from "vitest";

import { createSchema } from "../lib/schema";
import {
  archiveTask,
  createTask,
  getActiveTasks,
  getArchivedTasks,
  isTaskOverdue,
} from "../lib/tasks";

let db: Database.Database;

beforeEach(() => {
  db = new Database(":memory:");
  createSchema(db);
});

afterEach(() => {
  db.close();
});

describe("task behaviour", () => {
  test("creates and retrieves an active task", () => {
    const createdTask = createTask(db, {
      title: "Complete lab",
      description: "Finish the todo application",
      due_date: "2026-08-10",
      topic: "University",
      status: "Todo",
    });

    const activeTasks = getActiveTasks(db);

    expect(activeTasks).toHaveLength(1);
    expect(activeTasks[0].id).toBe(createdTask.id);
    expect(activeTasks[0].title).toBe("Complete lab");
    expect(activeTasks[0].topic).toBe("University");
    expect(activeTasks[0].archived).toBe(0);
  });

  test("archives a task without deleting it", () => {
    const task = createTask(db, {
      title: "Old task",
      description: "Archive this task",
      due_date: "2026-08-01",
      topic: "Personal",
      status: "Todo",
    });

    const archived = archiveTask(db, task.id);

    expect(archived).toBe(true);
    expect(getActiveTasks(db)).toHaveLength(0);

    const archivedTasks = getArchivedTasks(db);

    expect(archivedTasks).toHaveLength(1);
    expect(archivedTasks[0].id).toBe(task.id);
    expect(archivedTasks[0].archived).toBe(1);
  });

  test("marks an incomplete past-due task as overdue", () => {
    const task = {
      due_date: "2026-08-01",
      status: "Todo" as const,
    };

    expect(isTaskOverdue(task, "2026-08-03")).toBe(true);
  });

  test("does not mark a completed task as overdue", () => {
    const task = {
      due_date: "2026-08-01",
      status: "Complete" as const,
    };

    expect(isTaskOverdue(task, "2026-08-03")).toBe(false);
  });
});