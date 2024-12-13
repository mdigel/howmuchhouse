import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").unique().notNull(),
  password: text("password").notNull()
});

export const aiChats = pgTable("ai_chats", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  hasPaid: boolean("has_paid").default(false),
  questionCount: integer("question_count").default(0),
  createdAt: timestamp("created_at").defaultNow()
});

export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);
