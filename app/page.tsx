"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";

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

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [form, setForm] = useState<TaskForm>(emptyForm);
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

  function updateForm(
    field: keyof TaskForm,
    value: string
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

      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message ?? "Failed to create task");
      }

      setTasks((currentTasks) => [
        data as Task,
        ...currentTasks,
      ]);

      setForm(emptyForm);
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "Could not create the task."
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

  return (
  <main className="min-h-screen bg-slate-100 px-4 py-10">
    <section className="mx-auto max-w-5xl">
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900">
          Todo Application
        </h1>

        <p className="mt-2 text-slate-600">
          Create and manage your tasks.
        </p>
      </header>

      <section
        aria-labelledby="create-task-heading"
        className="rounded-xl bg-white p-6 shadow"
      >
        <h2
          id="create-task-heading"
          className="text-2xl font-semibold text-slate-900"
        >
          Create a task
        </h2>

        <form onSubmit={handleSubmit} className="mt-6">
          <fieldset className="grid gap-5 border-0 p-0 md:grid-cols-2">
            <legend className="sr-only">Task details</legend>

            <label className="flex flex-col gap-2">
              <strong className="font-medium text-slate-700">
                Title
              </strong>

              <input
                type="text"
                value={form.title}
                onChange={(event) =>
                  updateForm("title", event.target.value)
                }
                required
                className="rounded-md border border-slate-300 px-3 py-2 text-slate-900"
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
                  updateForm("topic", event.target.value)
                }
                required
                className="rounded-md border border-slate-300 px-3 py-2 text-slate-900"
              />
            </label>

            <label className="flex flex-col gap-2 md:col-span-2">
              <strong className="font-medium text-slate-700">
                Description
              </strong>

              <textarea
                value={form.description}
                onChange={(event) =>
                  updateForm("description", event.target.value)
                }
                required
                rows={4}
                className="rounded-md border border-slate-300 px-3 py-2 text-slate-900"
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
                  updateForm("due_date", event.target.value)
                }
                required
                className="rounded-md border border-slate-300 px-3 py-2 text-slate-900"
              />
            </label>

            <label className="flex flex-col gap-2">
              <strong className="font-medium text-slate-700">
                Status
              </strong>

              <select
                value={form.status}
                onChange={(event) =>
                  updateForm("status", event.target.value)
                }
                className="rounded-md border border-slate-300 px-3 py-2 text-slate-900"
              >
                <option value="Todo">Todo</option>
                <option value="In-Progress">
                  In-Progress
                </option>
                <option value="Complete">
                  Complete
                </option>
              </select>
            </label>

            <footer className="md:col-span-2">
              <button
                type="submit"
                disabled={submitting}
                className="rounded-md bg-slate-900 px-5 py-2 font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? "Creating..." : "Create task"}
              </button>
            </footer>
          </fieldset>
        </form>

        {error && (
          <p
            role="alert"
            className="mt-4 rounded-md bg-red-100 p-3 text-red-700"
          >
            {error}
          </p>
        )}
      </section>

      <section
        aria-labelledby="active-tasks-heading"
        className="mt-8"
      >
        <h2
          id="active-tasks-heading"
          className="text-2xl font-semibold text-slate-900"
        >
          Active tasks
        </h2>

        {loading ? (
          <p
            role="status"
            className="mt-4 text-slate-600"
          >
            Loading tasks...
          </p>
        ) : tasks.length === 0 ? (
          <p className="mt-4 rounded-xl bg-white p-6 text-slate-600 shadow">
            There are no active tasks yet.
          </p>
        ) : (
          <ul className="mt-4 grid list-none gap-4 p-0">
            {tasks.map((task) => {
              const overdue = isTaskOverdue(task);

              return (
                <li key={task.id}>
                  <article
                    className={`rounded-xl border-l-4 bg-white p-5 shadow ${
                      overdue
                        ? "border-red-500"
                        : "border-slate-400"
                    }`}
                  >
                    <header className="flex flex-wrap items-start justify-between gap-3">
                      <section>
                        <h3 className="text-xl font-semibold text-slate-900">
                          {task.title}
                        </h3>

                        <p className="mt-1 text-sm font-medium text-slate-500">
                          {task.topic}
                        </p>
                      </section>

                      <label className="flex items-center gap-2">
  <span className="sr-only">
    Status for {task.title}
  </span>

  <select
    value={task.status}
    onChange={(event) =>
      void updateTaskStatus(
        task.id,
        event.target.value as Status
      )
    }
    className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700"
    aria-label={`Change status for ${task.title}`}
  >
    <option value="Todo">Todo</option>
    <option value="In-Progress">In-Progress</option>
    <option value="Complete">Complete</option>
  </select>
</label>
                    </header>

                    <p className="mt-4 whitespace-pre-wrap text-slate-700">
                      {task.description}
                    </p>

                    <footer className="mt-4 flex flex-wrap items-center gap-3 text-sm">
                      <p className="text-slate-600">
                        Due:{" "}
                        <time dateTime={task.due_date}>
                          {task.due_date}
                        </time>
                      </p>

                      {overdue && (
                        <strong className="rounded-full bg-red-100 px-3 py-1 font-semibold text-red-700">
                          Overdue
                        </strong>
                      )}
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