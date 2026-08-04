# Third-Party Code

This project makes use of the following third-party libraries and packages.

| Package | Purpose |
|---------|---------|
| Next.js | Provides the React framework used to build the application, including routing and API routes. |
| React | Used to build the user interface using reusable components and state management. |
| TypeScript | Adds static typing to improve code reliability and maintainability. |
| Tailwind CSS | Provides utility classes for styling the user interface quickly and consistently. |
| better-sqlite3 | Allows the application to communicate with the local SQLite database. Chosen because it is simple, fast and works well with local Node.js applications. |
| Vitest | Used to implement and run automated unit tests. |
| ESLint | Analyses the source code to detect potential errors and enforce consistent coding practices. |

---

## Why they were chosen

### Next.js

Next.js provides the project structure, page routing, API routes and development server.
### React

React manages the user interface through reusable components and state updates. It simplifies rendering and updating the task list whenever changes occur.

### TypeScript

TypeScript improves code quality by detecting type errors during development and providing better editor support.

### Tailwind CSS

Tailwind CSS provides a fast way to build a clean and responsive user interface without writing large CSS files.

### better-sqlite3

The application stores all data locally using SQLite. The `better-sqlite3` package provides a simple synchronous API for reading and writing task data.

### Vitest

Vitest was selected as the testing framework because it integrates well with modern TypeScript projects and allows automated unit tests to be executed with a single command.

### ESLint

ESLint helps identify potential programming mistakes and encourages consistent coding standards throughout the project.