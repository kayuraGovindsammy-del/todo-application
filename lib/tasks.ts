import type Database from "better-sqlite3";

export type Status = "Todo" | "In-Progress" | "Complete";

export type Task = {
  id: number;
  title: string;
  description: string;
  due_date: string;
  topic: string;
  status: Status;
  archived: number;
  created_at: string;
};

export type NewTask = {
  title: string;
  description: string;
  due_date: string;
  topic: string;
  status: Status;
};

export function createTask(
  db: Database.Database,
  task: NewTask
): Task {
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
    .run(
      task.title,
      task.description,
      task.due_date,
      task.topic,
      task.status
    );

  return db
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
    .get(result.lastInsertRowid) as Task;
}

export function getActiveTasks(
  db: Database.Database
): Task[] {
  return db
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
}

export function getArchivedTasks(
  db: Database.Database
): Task[] {
  return db
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
    .all() as Task[];
}

export function archiveTask(
  db: Database.Database,
  taskId: number
): boolean {
  const result = db
    .prepare(`
      UPDATE tasks
      SET archived = 1
      WHERE id = ? AND archived = 0
    `)
    .run(taskId);

  return result.changes === 1;
}

export function isTaskOverdue(
  task: Pick<Task, "due_date" | "status">,
  today: string
): boolean {
  return (
    task.status !== "Complete" &&
    task.due_date < today
  );
}