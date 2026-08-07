# Todo Application

A local-first todo application built with **Next.js**, **TypeScript**, and **SQLite**.

The application allows a single user to create, edit, organise and archive tasks. All task data is stored locally using SQLite, allowing information to persist after the application is closed and reopened.

---

## Features

- Create tasks
- Edit existing tasks
- Archive tasks
- View archived tasks
- Sort tasks by:
  - Due date
  - Topic
  - Status
- Display overdue tasks
- Persistent SQLite database
- Automated unit tests

---

## Requirements

- Node.js **20** or later
- npm (included with Node.js)

---

## Installation

Clone the repository:

```bash
git clone https://github.com/<kayuraGovindsammy-del>/todo-application.git
```

Move into the project folder:

```bash
cd todo-application
```

Install dependencies:

```bash
npm install
```

---

## Running the application

Start the development server:

```bash
npm run dev
```

Open browser and navigate to:

```
http://localhost:3000
```

---

## Running the tests

Execute all automated tests:

```bash
npm test
```

---

## Project Structure

```
todo-application
│
├── app/
│   ├── api/
│   ├── archived/
│   └── page.tsx
│
├── lib/
│   ├── db.ts
│   ├── schema.ts
│   └── tasks.ts
│
├── tests/
│
├── public/
│
├── package.json
└── README.md
```

---

## Task Fields

Each task stores:

- Title
- Description
- Topic
- Due Date
- Status
- Archive Status
- Creation Date

The available task statuses are:

- Todo
- In-Progress
- Complete

Tasks are never deleted. When archived, they are removed from the active task list but remain available through the Archived Tasks page.

---

## Persistence

Task data is stored locally in a SQLite database (`todo.db`).

The database is automatically created the first time the application runs.

---

## Technologies Used

- Next.js
- React
- TypeScript
- SQLite
- better-sqlite3
- Tailwind CSS
- Vitest

---

## Author

Kayura Govindsammy
2681381

COMS3011A Lab 1
