"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

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

export default function ArchivedTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadArchivedTasks = useCallback(async () => {
    try {
      setError("");

      const response = await fetch("/api/tasks/archived", {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Failed to load archived tasks");
      }

      const data = (await response.json()) as Task[];
      setTasks(data);
    } catch (error) {
      console.error(error);
      setError("Could not load archived tasks.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadArchivedTasks();
  }, [loadArchivedTasks]);

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-10">
      <section className="mx-auto max-w-5xl">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-slate-900">
              Archived Tasks
            </h1>

            <p className="mt-2 text-slate-600">
              View tasks that are no longer active.
            </p>
          </div>

          <Link
            href="/"
            className="rounded-md bg-slate-900 px-4 py-2 font-medium text-white hover:bg-slate-700"
          >
            Back to active tasks
          </Link>
        </header>

        {error && (
          <p
            role="alert"
            className="rounded-md bg-red-100 p-3 text-red-700"
          >
            {error}
          </p>
        )}

        {loading ? (
          <p role="status" className="text-slate-600">
            Loading archived tasks...
          </p>
        ) : tasks.length === 0 ? (
          <p className="rounded-xl bg-white p-6 text-slate-600 shadow">
            There are no archived tasks.
          </p>
        ) : (
          <ul className="grid list-none gap-4 p-0">
            {tasks.map((task) => (
              <li key={task.id}>
                <article className="rounded-xl border-l-4 border-slate-500 bg-white p-5 shadow">
                  <header className="flex flex-wrap items-start justify-between gap-3">
                    <section>
                      <h2 className="text-xl font-semibold text-slate-900">
                        {task.title}
                      </h2>

                      <p className="mt-1 text-sm font-medium text-slate-500">
                        {task.topic}
                      </p>
                    </section>

                    <span className="rounded-full bg-slate-200 px-3 py-1 text-sm font-medium text-slate-700">
                      {task.status}
                    </span>
                  </header>

                  <p className="mt-4 whitespace-pre-wrap text-slate-700">
                    {task.description}
                  </p>

                  <footer className="mt-4 text-sm text-slate-600">
                    Due:{" "}
                    <time dateTime={task.due_date}>
                      {task.due_date}
                    </time>
                  </footer>
                </article>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}