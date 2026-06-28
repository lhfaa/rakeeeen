import { pgTable, text, serial, integer, numeric, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const roleEnum = pgEnum("user_role", ["user", "broker", "admin"]);
export const transactionStatusEnum = pgEnum("transaction_status", ["pending", "active", "paid", "completed", "closed", "cancelled"]);
export const messageTypeEnum = pgEnum("message_type", ["text", "system", "payment"]);

export const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  phone: text("phone").notNull(),
  countryCode: text("country_code").notNull(),
  role: roleEnum("role").notNull().default("user"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const brokersTable = pgTable("brokers", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  transactionCount: integer("transaction_count").notNull().default(0),
  successRate: numeric("success_rate", { precision: 5, scale: 2 }).notNull().default("99.00"),
  avgTime: text("avg_time").notNull().default("24 ساعة"),
  rating: numeric("rating", { precision: 3, scale: 1 }).notNull().default("4.9"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const transactionsTable = pgTable("transactions", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  type: text("type").notNull(),
  status: transactionStatusEnum("status").notNull().default("pending"),
  buyerId: integer("buyer_id").notNull().references(() => usersTable.id),
  sellerId: integer("seller_id").notNull().references(() => usersTable.id),
  brokerId: integer("broker_id").notNull().references(() => usersTable.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const messagesTable = pgTable("messages", {
  id: serial("id").primaryKey(),
  transactionId: integer("transaction_id").notNull().references(() => transactionsTable.id, { onDelete: "cascade" }),
  senderId: integer("sender_id").notNull().references(() => usersTable.id),
  content: text("content").notNull(),
  messageType: messageTypeEnum("message_type").notNull().default("text"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(usersTable).omit({ id: true, createdAt: true });
export const insertBrokerSchema = createInsertSchema(brokersTable).omit({ id: true, createdAt: true });
export const insertTransactionSchema = createInsertSchema(transactionsTable).omit({ id: true, createdAt: true });
export const insertMessageSchema = createInsertSchema(messagesTable).omit({ id: true, createdAt: true });

export type User = typeof usersTable.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Broker = typeof brokersTable.$inferSelect;
export type Transaction = typeof transactionsTable.$inferSelect;
export type Message = typeof messagesTable.$inferSelect;
