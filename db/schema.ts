import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").unique().notNull(),
  password: text("password").notNull()
});

export const aiChats = pgTable("ai_chats", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  message: text("message").notNull(),
  response: text("response").notNull(),
  characterCount: integer("character_count").notNull(),
  hasPaid: boolean("has_paid").default(false),
  isHelpful: boolean("is_helpful").default(null),
  createdAt: timestamp("created_at").defaultNow()
});

export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  stripeSessionId: text("stripe_session_id").notNull(),
  status: text("status").notNull(),
  amount: integer("amount").notNull(),
  createdAt: timestamp("created_at").defaultNow()
});

export const featureFlags = pgTable("feature_flags", {
  id: serial("id").primaryKey(),
  name: text("name").unique().notNull(),
  enabled: boolean("enabled").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow()
});

export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);