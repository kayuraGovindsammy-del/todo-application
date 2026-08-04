"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";

import Link from "next/link";

type Status = "Todo" | "In-Progress" | "Complete";

type Task = {
  id: number;
  title: string;
  description: string;
  due_date: string;
  topic: string;
  status: Status;
  archived: number;
  created_at: string;
};

type TaskForm = {
  title: string;
  description: string;
  due_date: string;
  topic: string;
  status: Status;
};

const emptyForm: TaskForm = {
  title: "",
  description: "",
  due_date: "",
  topic: "",
  status: "Todo",
};

function getToday(): string {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function isTaskOverdue(task: Task): boolean {
  return task.status !== "Complete" && task.due_date < getToday();
}

function getStatusStyles(status: Status): string {
  switch (status) {
    case "Todo":
      return "border-blue-200 bg-blue-100 text-blue-700 focus:ring-blue-200";

    case "In-Progress":
      return "border-amber-200 bg-amber-100 text-amber-700 focus:ring-amber-200";

    case "Complete":
      return "border-green-200 bg-green-100 text-green-700 focus:ring-green-200";

    default:
      return "border-slate-200 bg-slate-100 text-slate-700 focus:ring-slate-200";
  }
}

function getTaskBorderColour(
  task: Task,
  overdue: boolean
): string {
  if (overdue) {
    return "border-red-500";
  }

  switch (task.status) {
    case "Todo":
      return "border-blue-500";

    case "In-Progress":
      return "border-amber-500";

    case "Complete":
      return "border-green-500";

    default:
      return "border-slate-400";
  }
}

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [form, setForm] = useState<TaskForm>(emptyForm);
   const [editingTaskId, setEditingTaskId] =
    useState<number | null>(null);
  const [sortBy, setSortBy] = useState<
  "topic" | "status" | "due_date"
>("due_date");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  

  const loadTasks = useCallback(async () => {
    try {
      setError("");

      const response = await fetch("/api/tasks", {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Failed to load tasks");
      }

      const data = (await response.json()) as Task[];
      setTasks(data);
    } catch (error) {
      console.error(error);
      setError("Could not load tasks.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadTasks();
  }, [loadTasks]);

  function updateForm<K extends keyof TaskForm>(
  field: K,
  value: TaskForm[K]
) {
  setForm((currentForm) => ({
    ...currentForm,
    [field]: value,
  }));
}

  async function handleSubmit(
  event: FormEvent<HTMLFormElement>
) {
  event.preventDefault();

  try {
    setSubmitting(true);
    setError("");

    const url =
      editingTaskId === null
        ? "/api/tasks"
        : `/api/tasks/${editingTaskId}`;

    const method =
      editingTaskId === null ? "POST" : "PATCH";

    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message ??
          (editingTaskId === null
            ? "Failed to create task"
            : "Failed to update task")
      );
    }

    if (editingTaskId === null) {
      setTasks((currentTasks) => [
        data as Task,
        ...currentTasks,
      ]);
    } else {
      setTasks((currentTasks) =>
        currentTasks.map((task) =>
          task.id === editingTaskId
            ? (data as Task)
            : task
        )
      );
    }

    setForm(emptyForm);
    setEditingTaskId(null);
  } catch (error) {
    console.error(error);

    setError(
      error instanceof Error
        ? error.message
        : "Could not save the task."
    );
  } finally {
    setSubmitting(false);
  }
}

  async function updateTaskStatus(
  taskId: number,
  status: Status
) {
  try {
    setError("");

    const response = await fetch(`/api/tasks/${taskId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message ?? "Failed to update task status"
      );
    }

    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === taskId ? (data as Task) : task
      )
    );
  } catch (error) {
    console.error(error);

    setError(
      error instanceof Error
        ? error.message
        : "Could not update the task status."
    );
  }
}

async function archiveTask(taskId: number) {
  try {
    setError("");

    const response = await fetch(`/api/tasks/${taskId}`, {
      method: "DELETE",
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message ?? "Failed to archive task"
      );
    }

    setTasks((currentTasks) =>
      currentTasks.filter((task) => task.id !== taskId)
    );
    if (editingTaskId === taskId) {
       setEditingTaskId(null);
       setForm(emptyForm);
    }
    
  } catch (error) {
    console.error(error);

    setError(
      error instanceof Error
        ? error.message
        : "Could not archive the task."
    );
  }
}

function startEditingTask(task: Task) {
  setEditingTaskId(task.id);

  setForm({
    title: task.title,
    description: task.description,
    due_date: task.due_date,
    topic: task.topic,
    status: task.status,
  });

  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
}

function cancelEditing() {
  setEditingTaskId(null);
  setForm(emptyForm);
  setError("");
}

const sortedTasks = [...tasks].sort((taskA, taskB) => {
  if (sortBy === "topic") {
    return taskA.topic.localeCompare(taskB.topic);
  }

  if (sortBy === "status") {
    const statusOrder: Record<Status, number> = {
      Todo: 0,
      "In-Progress": 1,
      Complete: 2,
    };

    return (
      statusOrder[taskA.status] -
      statusOrder[taskB.status]
    );
  }

  return taskA.due_date.localeCompare(taskB.due_date);
});

  return (
  <main className="min-h-screen bg-gradient-to-br from-sky-50 via-indigo-50 to-violet-100 px-4 py-10">
      <section className="mx-auto max-w-5xl">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="bg-gradient-to-r from-sky-600 via-indigo-600 to-purple-600 bg-clip-text text-4xl font-bold text-transparent">
              Todo Application
            </h1>

            <p className="mt-2 text-slate-600">
              Create and manage your tasks.
            </p>
          </div>

          <Link
            href="/archived"
            className="rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-5 py-2 font-semibold text-white shadow-md transition duration-200 hover:scale-105 hover:shadow-lg"
          >
            View archived tasks
          </Link>
        </header>

        <section
          aria-labelledby="create-task-heading"
          className="rounded-2xl border border-sky-100 bg-white p-6 shadow-lg"
        >
          <h2
            id="create-task-heading"
            className="text-2xl font-semibold text-slate-900"
          >
            {editingTaskId === null
              ? "Create a task"
              : "Edit task"}
          </h2>

          <form
            onSubmit={handleSubmit}
            className="mt-6"
          >
            <fieldset className="grid gap-5 border-0 p-0 md:grid-cols-2">
              <legend className="sr-only">
                Task details
              </legend>

              <label className="flex flex-col gap-2">
                <strong className="font-medium text-slate-700">
                  Title
                </strong>

                <input
                  type="text"
                  value={form.title}
                  onChange={(event) =>
                    updateForm(
                      "title",
                      event.target.value
                    )
                  }
                  required
                  className="rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
              </label>

              <label className="flex flex-col gap-2">
                <strong className="font-medium text-slate-700">
                  Topic
                </strong>

                <input
                  type="text"
                  value={form.topic}
                  onChange={(event) =>
                    updateForm(
                      "topic",
                      event.target.value
                    )
                  }
                  required
                  className="rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
              </label>

              <label className="flex flex-col gap-2 md:col-span-2">
                <strong className="font-medium text-slate-700">
                  Description
                </strong>

                <textarea
                  value={form.description}
                  onChange={(event) =>
                    updateForm(
                      "description",
                      event.target.value
                    )
                  }
                  required
                  rows={4}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
              </label>

              <label className="flex flex-col gap-2">
                <strong className="font-medium text-slate-700">
                  Due date
                </strong>

                <input
                  type="date"
                  value={form.due_date}
                  onChange={(event) =>
                    updateForm(
                      "due_date",
                      event.target.value
                    )
                  }
                  required
                  className="rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
              </label>

              <label className="flex flex-col gap-2">
                <strong className="font-medium text-slate-700">
                  Status
                </strong>

                <select
                  value={form.status}
                  onChange={(event) =>
                    updateForm(
                      "status",
                      event.target.value as Status
                    )
                  }
                  className={`rounded-lg border px-3 py-2 font-semibold outline-none transition focus:ring-2 ${getStatusStyles(
                    form.status
                  )}`}
                >
                  <option value="Todo">
                    Todo
                  </option>

                  <option value="In-Progress">
                    In-Progress
                  </option>

                  <option value="Complete">
                    Complete
                  </option>
                </select>
              </label>

              <footer className="flex flex-wrap gap-3 md:col-span-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className={`rounded-lg px-5 py-2 font-semibold text-white shadow-sm transition duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${
                    editingTaskId === null
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "bg-green-600 hover:bg-green-700"
                  }`}
                >
                  {submitting
                    ? editingTaskId === null
                      ? "Creating..."
                      : "Saving..."
                    : editingTaskId === null
                      ? "Create task"
                      : "Save changes"}
                </button>

                {editingTaskId !== null && (
                  <button
                    type="button"
                    onClick={cancelEditing}
                    disabled={submitting}
                    className="rounded-lg bg-slate-300 px-5 py-2 font-semibold text-slate-700 transition hover:bg-slate-400 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Cancel
                  </button>
                )}
              </footer>
            </fieldset>
          </form>

          {error && (
            <p
              role="alert"
              className="mt-4 rounded-lg border border-red-200 bg-red-100 p-3 font-medium text-red-700"
            >
              {error}
            </p>
          )}
        </section>

        <section
          aria-labelledby="active-tasks-heading"
          className="mt-8"
        >
          <header className="flex flex-wrap items-center justify-between gap-4">
            <h2
              id="active-tasks-heading"
              className="text-2xl font-semibold text-slate-900"
            >
              Active tasks
            </h2>

            <label className="flex items-center gap-2 text-slate-700">
              <span className="font-medium">
                Sort by
              </span>

              <select
                value={sortBy}
                onChange={(event) =>
                  setSortBy(
                    event.target.value as
                      | "topic"
                      | "status"
                      | "due_date"
                  )
                }
                className="rounded-lg border border-indigo-200 bg-white px-3 py-2 font-medium text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              >
                <option value="due_date">
                  Due date
                </option>

                <option value="topic">
                  Topic
                </option>

                <option value="status">
                  Status
                </option>
              </select>
            </label>
          </header>

          {loading ? (
            <p
              role="status"
              className="mt-4 text-slate-600"
            >
              Loading tasks...
            </p>
          ) : tasks.length === 0 ? (
            <p className="mt-4 rounded-2xl border border-indigo-100 bg-white p-6 text-slate-600 shadow">
              There are no active tasks yet.
            </p>
          ) : (
            <ul className="mt-4 grid list-none gap-4 p-0">
              {sortedTasks.map((task) => {
                const overdue =
                  isTaskOverdue(task);

                const borderColour =
                  getTaskBorderColour(
                    task,
                    overdue
                  );

                return (
                  <li key={task.id}>
                    <article
                      className={`rounded-2xl border-l-8 bg-white p-5 shadow-md transition duration-200 hover:-translate-y-1 hover:shadow-xl ${borderColour}`}
                    >
                      <header className="flex flex-wrap items-start justify-between gap-3">
                        <section>
                          <h3 className="text-xl font-semibold text-slate-900">
                            {task.title}
                          </h3>

                          <p className="mt-2 inline-block rounded-full bg-purple-100 px-3 py-1 text-sm font-semibold text-purple-700">
                            {task.topic}
                          </p>
                        </section>

                        <label className="flex items-center gap-2">
                          <span className="sr-only">
                            Status for{" "}
                            {task.title}
                          </span>

                          <select
                            value={task.status}
                            onChange={(event) =>
                              void updateTaskStatus(
                                task.id,
                                event.target
                                  .value as Status
                              )
                            }
                            className={`rounded-full border px-4 py-2 text-sm font-bold shadow-sm outline-none transition focus:ring-2 ${getStatusStyles(
                              task.status
                            )}`}
                            aria-label={`Change status for ${task.title}`}
                          >
                            <option value="Todo">
                              Todo
                            </option>

                            <option value="In-Progress">
                              In-Progress
                            </option>

                            <option value="Complete">
                              Complete
                            </option>
                          </select>
                        </label>
                      </header>

                      <p className="mt-4 whitespace-pre-wrap text-slate-700">
                        {task.description}
                      </p>

                      <footer className="mt-4 flex flex-wrap items-center gap-3 text-sm">
                        <p className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-600">
                          Due:{" "}
                          <time
                            dateTime={
                              task.due_date
                            }
                          >
                            {task.due_date}
                          </time>
                        </p>

                        {overdue && (
                          <strong className="animate-pulse rounded-full bg-red-500 px-3 py-1 font-bold text-white">
                            Overdue
                          </strong>
                        )}

                        <button
                          type="button"
                          onClick={() =>
                            startEditingTask(task)
                          }
                          className="ml-auto rounded-lg bg-violet-500 px-4 py-2 font-semibold text-white transition hover:bg-violet-600"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            void archiveTask(
                              task.id
                            )
                          }
                          className="rounded-lg bg-orange-500 px-4 py-2 font-semibold text-white transition hover:bg-orange-600"
                        >
                          Archive
                        </button>
                      </footer>
                    </article>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </section>
    </main>
  );
}