import { pgTable, text, serial, integer, boolean, timestamp, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const wallets = pgTable("wallets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  address: text("address").notNull().unique(),
  isConnected: boolean("is_connected").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const tokens = pgTable("tokens", {
  id: serial("id").primaryKey(),
  symbol: text("symbol").notNull(),
  name: text("name").notNull(),
  address: text("address").notNull(),
  decimals: integer("decimals").notNull(),
  logoUrl: text("logo_url"),
});

export const portfolios = pgTable("portfolios", {
  id: serial("id").primaryKey(),
  walletId: integer("wallet_id").references(() => wallets.id),
  tokenId: integer("token_id").references(() => tokens.id),
  balance: decimal("balance", { precision: 36, scale: 18 }).notNull(),
  valueUsd: decimal("value_usd", { precision: 18, scale: 2 }),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  walletId: integer("wallet_id").references(() => wallets.id),
  hash: text("hash").notNull().unique(),
  type: text("type").notNull(), // 'swap', 'send', 'receive'
  fromToken: text("from_token"),
  toToken: text("to_token"),
  amount: decimal("amount", { precision: 36, scale: 18 }),
  valueUsd: decimal("value_usd", { precision: 18, scale: 2 }),
  gasUsed: decimal("gas_used", { precision: 18, scale: 2 }),
  status: text("status").notNull(), // 'pending', 'success', 'failed'
  timestamp: timestamp("timestamp").defaultNow(),
});

export const crmIntegrations = pgTable("crm_integrations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  provider: text("provider").notNull(), // 'salesforce', 'hubspot'
  isConnected: boolean("is_connected").default(false),
  apiKey: text("api_key"),
  lastSync: timestamp("last_sync"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertWalletSchema = createInsertSchema(wallets).omit({
  id: true,
  createdAt: true,
});

export const insertTokenSchema = createInsertSchema(tokens).omit({
  id: true,
});

export const insertPortfolioSchema = createInsertSchema(portfolios).omit({
  id: true,
  updatedAt: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  timestamp: true,
});

export const insertCrmIntegrationSchema = createInsertSchema(crmIntegrations).omit({
  id: true,
  lastSync: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertWallet = z.infer<typeof insertWalletSchema>;
export type Wallet = typeof wallets.$inferSelect;
export type InsertToken = z.infer<typeof insertTokenSchema>;
export type Token = typeof tokens.$inferSelect;
export type InsertPortfolio = z.infer<typeof insertPortfolioSchema>;
export type Portfolio = typeof portfolios.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;
export type InsertCrmIntegration = z.infer<typeof insertCrmIntegrationSchema>;
export type CrmIntegration = typeof crmIntegrations.$inferSelect;
