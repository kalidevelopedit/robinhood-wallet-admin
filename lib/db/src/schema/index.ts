import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, real, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const wallets = pgTable("wallets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().default("My Wallet"),
  totalBalance: real("total_balance").notNull().default(0),
  dailyChange: real("daily_change").notNull().default(0),
  dailyChangePercent: real("daily_change_percent").notNull().default(0),
  interestBalance: real("interest_balance").notNull().default(0),
  interestLastUpdated: timestamp("interest_last_updated").defaultNow(),
  hasCompletedOnboarding: boolean("has_completed_onboarding").notNull().default(false),
  hasBackedUp: boolean("has_backed_up").notNull().default(false),
  hasNotifications: boolean("has_notifications").notNull().default(false),
  pin: text("pin"),
});

export const cryptoTokens = pgTable("crypto_tokens", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  symbol: text("symbol").notNull(),
  iconColor: text("icon_color").notNull().default("#FFFFFF"),
  iconUrl: text("icon_url"),
  network: text("network").notNull().default("Solana"),
  marketCap: text("market_cap"),
  price: real("price").notNull().default(0),
  changePercent: real("change_percent").notNull().default(0),
  address: text("address"),
  balance: real("balance").notNull().default(0),
  balanceUsd: real("balance_usd").notNull().default(0),
});

export const transactions = pgTable("transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: text("type").notNull(),
  tokenSymbol: text("token_symbol").notNull(),
  amount: real("amount").notNull(),
  amountUsd: real("amount_usd").notNull(),
  status: text("status").notNull().default("completed"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  seedPhrase: text("seed_phrase").notNull().unique(),
  walletAddress: text("wallet_address"),
  name: text("name").notNull().default("User"),
  pin: text("pin"),
  lastActive: timestamp("last_active"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  deviceInfo: text("device_info"),
  createdAt: timestamp("created_at").defaultNow(),
  depositsEnabled: boolean("deposits_enabled").notNull().default(true),
  withdrawalsEnabled: boolean("withdrawals_enabled").notNull().default(true),
  bankTransfersEnabled: boolean("bank_transfers_enabled").notNull().default(true),
});

export const userBalances = pgTable("user_balances", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  tokenSymbol: text("token_symbol").notNull(),
  tokenName: text("token_name").notNull(),
  balance: real("balance").notNull().default(0),
  walletAddress: text("wallet_address"),
  iconUrl: text("icon_url"),
  iconColor: text("icon_color").notNull().default("#FFFFFF"),
  label: text("label"),
});

export const userSessions = pgTable("user_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  openedAt: timestamp("opened_at").defaultNow(),
  closedAt: timestamp("closed_at"),
  durationSeconds: integer("duration_seconds"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  deviceInfo: text("device_info"),
  location: text("location"),
  screenInfo: text("screen_info"),
});

export const userTransactions = pgTable("user_transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  type: text("type").notNull(),
  asset: text("asset").notNull().default("USD"),
  amount: real("amount").notNull().default(0),
  amountUsd: real("amount_usd").notNull().default(0),
  status: text("status").notNull().default("completed"),
  description: text("description"),
  metadata: text("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
  createdBy: text("created_by").notNull().default("user"),
});

export const insertWalletSchema = createInsertSchema(wallets).omit({ id: true });
export const insertCryptoTokenSchema = createInsertSchema(cryptoTokens).omit({ id: true });
export const insertTransactionSchema = createInsertSchema(transactions).omit({ id: true });
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertUserBalanceSchema = createInsertSchema(userBalances).omit({ id: true });
export const insertUserSessionSchema = createInsertSchema(userSessions).omit({ id: true });
export const insertUserTransactionSchema = createInsertSchema(userTransactions).omit({ id: true });

export type Wallet = typeof wallets.$inferSelect;
export type InsertWallet = z.infer<typeof insertWalletSchema>;
export type CryptoToken = typeof cryptoTokens.$inferSelect;
export type InsertCryptoToken = z.infer<typeof insertCryptoTokenSchema>;
export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UserBalance = typeof userBalances.$inferSelect;
export type InsertUserBalance = z.infer<typeof insertUserBalanceSchema>;
export type UserSession = typeof userSessions.$inferSelect;
export type InsertUserSession = z.infer<typeof insertUserSessionSchema>;
export type UserTransaction = typeof userTransactions.$inferSelect;
export type InsertUserTransaction = z.infer<typeof insertUserTransactionSchema>;
