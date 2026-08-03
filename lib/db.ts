import Database from "better-sqlite3";
import path from "path";
import { createSchema } from "@/lib/schema";

const dbPath = path.join(process.cwd(), "todo.db");

const db = new Database(dbPath);

createSchema(db);

export default db;