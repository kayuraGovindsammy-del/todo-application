# Database Design

## Overview

The application uses a single SQLite database named `todo.db`.

All task-related information is stored in one table called `tasks`. Because the application is designed as a local-first, single-user system, one table is sufficient and no additional relationships or user tables are required.

SQLite is suitable for this application because it is lightweight, requires no separate database server, and stores all data in a single local file.
---

# Table: tasks

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key. Automatically generated for each task. |
| title | TEXT | The title of the task. |
| description | TEXT | A detailed description of the task. |
| due_date | TEXT | The due date stored in `YYYY-MM-DD` format. |
| topic | TEXT | The category or topic associated with the task. |
| status | TEXT | The task status. Allowed values are Todo, In-Progress and Complete. |
| archived | INTEGER | Indicates whether the task has been archived. `0` = active, `1` = archived. |
| created_at | TEXT | Timestamp recording when the task was created. |

---

## Primary Key

The `id` column is the primary key.

It uses SQLite's `AUTOINCREMENT` feature to generate a unique numeric identifier whenever a new task is created.

This identifier is used when editing, archiving, or retrieving a specific task
---

## Relationships

This application contains a single table.

There is only one user and no user accounts, Hence there are no relationships between multiple tables.

Every task is stored independently inside the `tasks` table.

---

## Archiving

Tasks are never deleted from the database.

Instead, the `archived` column stores whether a task is active or archived.

- `0` → Active task
- `1` → Archived task

This allows archived tasks to remain accessible while preventing them from appearing in the active task list.

---

## Task Status

Each task has one of three possible statuses:

- Todo
- In-Progress
- Complete

These fixed values. 
The database uses a CHECK constraint to prevent invalid status values from being stored.

---

## Overdue Tasks

The application does **not** store an `overdue` column.

Instead, overdue status is calculated whenever tasks are displayed.

A task is considered overdue when:

- its due date is earlier than today's date, and
- its status is not `Complete`.

This avoids storing redundant data and ensures the overdue status is always accurate.

---


## Data integrity 

The database schema includes several constraints to protect the stored data:

title, description, due_date, topic, and status cannot be NULL.
status must contain one of the supported values.
archived must contain either 0 or 1.
archived defaults to 0, meaning new tasks are active.
status defaults to Todo.
created_at is automatically set when a task is created.

These constraints help prevent invalid or incomplete records from being inserted into the database.

## Database Schema

```sql
CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    due_date TEXT NOT NULL,
    topic TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Todo',
    archived INTEGER NOT NULL DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```