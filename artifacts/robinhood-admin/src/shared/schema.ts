export type Wallet = {
  id: string;
  name: string;
  totalBalance: number;
  dailyChange: number;
  dailyChangePercent: number;
  interestBalance: number;
  interestLastUpdated: string | null;
  hasCompletedOnboarding: boolean;
  hasBackedUp: boolean;
  hasNotifications: boolean;
  pin: string | null;
};

export type CryptoToken = {
  id: string;
  name: string;
  symbol: string;
  iconColor: string;
  iconUrl: string | null;
  network: string;
  marketCap: string | null;
  price: number;
  changePercent: number;
  address: string | null;
  balance: number;
  balanceUsd: number;
};

export type Transaction = {
  id: string;
  type: string;
  tokenSymbol: string;
  amount: number;
  amountUsd: number;
  status: string;
  createdAt: string | null;
};

export type User = {
  id: string;
  seedPhrase: string;
  walletAddress: string | null;
  name: string;
  pin: string | null;
  lastActive: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  deviceInfo: string | null;
  createdAt: string | null;
  depositsEnabled: boolean;
  withdrawalsEnabled: boolean;
  bankTransfersEnabled: boolean;
};

export type UserBalance = {
  id: string;
  userId: string;
  tokenSymbol: string;
  tokenName: string;
  balance: number;
  walletAddress: string | null;
  iconUrl: string | null;
  iconColor: string;
  label: string | null;
};

export type UserSession = {
  id: string;
  userId: string;
  openedAt: string | null;
  closedAt: string | null;
  durationSeconds: number | null;
  ipAddress: string | null;
  userAgent: string | null;
  deviceInfo: string | null;
  location: string | null;
  screenInfo: string | null;
};

export type UserTransaction = {
  id: string;
  userId: string;
  type: string;
  asset: string;
  amount: number;
  amountUsd: number;
  status: string;
  description: string | null;
  metadata: string | null;
  createdAt: string | null;
  createdBy: string;
};

export type InsertWallet = Omit<Wallet, "id" | "interestBalance" | "interestLastUpdated">;
export type InsertCryptoToken = Omit<CryptoToken, "id">;
export type InsertTransaction = Omit<Transaction, "id" | "createdAt">;
export type InsertUser = Omit<User, "id" | "createdAt">;
export type InsertUserBalance = Omit<UserBalance, "id">;
export type InsertUserSession = Omit<UserSession, "id">;
export type InsertUserTransaction = Omit<UserTransaction, "id" | "createdAt">;
