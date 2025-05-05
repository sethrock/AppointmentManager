// Script to push the database schema
import { migrate } from "drizzle-orm/neon-serverless/migrator";
import { db } from "./server/db.js";

console.log("Starting database migration...");

migrate(db, { migrationsFolder: "./drizzle" }).then(() => {
  console.log("Migration complete");
  process.exit(0);
}).catch((err) => {
  console.error("Error during migration:", err);
  process.exit(1);
});