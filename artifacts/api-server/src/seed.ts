import { db } from "@workspace/db";
import { cryptoTokens } from "@workspace/db";
import { sql } from "drizzle-orm";

const SEED_TOKENS = [
  { name: "Bitcoin",  symbol: "BTC",  iconColor: "#f7931a", network: "Solana",   marketCap: "1.36T MCap",  price: 68829,    changePercent: -4.79, balance: 0, balanceUsd: 0, iconUrl: "https://cdn.jsdelivr.net/gh/simplr-sh/coin-logos/images/bitcoin/standard.png" },
  { name: "Ethereum", symbol: "ETH",  iconColor: "#627eea", network: "Solana",   marketCap: "247B MCap",   price: 2054.38,  changePercent: -6.92, balance: 0, balanceUsd: 0, iconUrl: "https://cdn.jsdelivr.net/gh/simplr-sh/coin-logos/images/ethereum/standard.png" },
  { name: "Solana",   symbol: "SOL",  iconColor: "#00ffa3", network: "Solana",   marketCap: "41.2B MCap",  price: 83.97,    changePercent: -8.72, balance: 0, balanceUsd: 0, iconUrl: "https://cdn.jsdelivr.net/gh/simplr-sh/coin-logos/images/solana/standard.png" },
  { name: "XRP",      symbol: "XRP",  iconColor: "#00AAE4", network: "Solana",   marketCap: "82.5B MCap",  price: 1.4263,   changePercent: -1.56, balance: 0, balanceUsd: 0, iconUrl: "https://assets.coingecko.com/coins/images/44/standard/xrp-symbol-white-128.png" },
  { name: "USDC",     symbol: "USDC", iconColor: "#2775ca", network: "Solana",   marketCap: "73.0B MCap",  price: 1.0,      changePercent: 0.01,  balance: 0, balanceUsd: 0, iconUrl: "https://cdn.jsdelivr.net/gh/simplr-sh/coin-logos/images/usd-coin/standard.png" },
  { name: "Tether",   symbol: "USDT", iconColor: "#26a17b", network: "Solana",   marketCap: "183B MCap",   price: 1.0,      changePercent: 0.0,   balance: 0, balanceUsd: 0, iconUrl: "https://cdn.jsdelivr.net/gh/simplr-sh/coin-logos/images/tether/standard.png" },
  { name: "Dogecoin", symbol: "DOGE", iconColor: "#c2a633", network: "Solana",   marketCap: "18.5B MCap",  price: 0.128,    changePercent: -5.42, balance: 0, balanceUsd: 0, iconUrl: "https://cdn.jsdelivr.net/gh/simplr-sh/coin-logos/images/dogecoin/standard.png" },
  { name: "Chainlink",symbol: "LINK", iconColor: "#2a5ada", network: "Solana",   marketCap: "6.25B MCap",  price: 12.45,    changePercent: -3.21, balance: 0, balanceUsd: 0, iconUrl: "https://cdn.jsdelivr.net/gh/simplr-sh/coin-logos/images/chainlink/standard.png" },
  { name: "BNB",      symbol: "BNB",  iconColor: "#f3ba2f", network: "BSC",      marketCap: "85B MCap",    price: 560,      changePercent: -2.15, balance: 0, balanceUsd: 0, iconUrl: "https://assets.coingecko.com/coins/images/825/standard/bnb-icon2_2x.png" },
  { name: "Litecoin", symbol: "LTC",  iconColor: "#bfbbbb", network: "Solana",   marketCap: "5.5B MCap",   price: 73.50,    changePercent: -3.10, balance: 0, balanceUsd: 0, iconUrl: "https://cdn.jsdelivr.net/gh/simplr-sh/coin-logos/images/litecoin/standard.png" },
  { name: "Avalanche",symbol: "AVAX", iconColor: "#e84142", network: "Solana",   marketCap: "7.8B MCap",   price: 21.8,     changePercent: -5.80, balance: 0, balanceUsd: 0, iconUrl: "https://cdn.jsdelivr.net/gh/simplr-sh/coin-logos/images/avalanche-2/standard.png" },
  { name: "Cardano",  symbol: "ADA",  iconColor: "#0033ad", network: "Solana",   marketCap: "22.1B MCap",  price: 0.692,    changePercent: -4.10, balance: 0, balanceUsd: 0, iconUrl: "https://cdn.jsdelivr.net/gh/simplr-sh/coin-logos/images/cardano/standard.png" },
  { name: "Polkadot", symbol: "DOT",  iconColor: "#e6007a", network: "Solana",   marketCap: "5.8B MCap",   price: 4.11,     changePercent: -6.20, balance: 0, balanceUsd: 0, iconUrl: "https://cdn.jsdelivr.net/gh/simplr-sh/coin-logos/images/polkadot/standard.png" },
  { name: "Uniswap",  symbol: "UNI",  iconColor: "#ff007a", network: "Ethereum", marketCap: "3.5B MCap",   price: 5.89,     changePercent: -7.40, balance: 0, balanceUsd: 0, iconUrl: "https://cdn.jsdelivr.net/gh/simplr-sh/coin-logos/images/uniswap/standard.png" },
  { name: "Aave",     symbol: "AAVE", iconColor: "#b6509e", network: "Ethereum", marketCap: "2.2B MCap",   price: 146.2,    changePercent: -4.90, balance: 0, balanceUsd: 0, iconUrl: "https://cdn.jsdelivr.net/gh/simplr-sh/coin-logos/images/aave/standard.png" },
  { name: "Arbitrum", symbol: "ARB",  iconColor: "#28a0f0", network: "Ethereum", marketCap: "1.2B MCap",   price: 0.32,     changePercent: -8.10, balance: 0, balanceUsd: 0, iconUrl: "https://cdn.jsdelivr.net/gh/simplr-sh/coin-logos/images/arbitrum/standard.png" },
  { name: "Optimism", symbol: "OP",   iconColor: "#ff0420", network: "Ethereum", marketCap: "0.9B MCap",   price: 0.71,     changePercent: -9.30, balance: 0, balanceUsd: 0, iconUrl: "https://cdn.jsdelivr.net/gh/simplr-sh/coin-logos/images/optimism/standard.png" },
  { name: "Polygon",  symbol: "POL",  iconColor: "#7b3fe4", network: "Ethereum", marketCap: "2.1B MCap",   price: 0.234,    changePercent: -6.50, balance: 0, balanceUsd: 0, iconUrl: "https://cdn.jsdelivr.net/gh/simplr-sh/coin-logos/images/matic-network/standard.png" },
  { name: "Pepe",     symbol: "PEPE", iconColor: "#00b04f", network: "Ethereum", marketCap: "3.1B MCap",   price: 0.00000782, changePercent: -5.10, balance: 0, balanceUsd: 0, iconUrl: "https://cdn.jsdelivr.net/gh/simplr-sh/coin-logos/images/pepe/standard.png" },
  { name: "dogwifhat",symbol: "WIF",  iconColor: "#9945ff", network: "Solana",   marketCap: "0.9B MCap",   price: 0.98,     changePercent: -11.20, balance: 0, balanceUsd: 0, iconUrl: "https://cdn.jsdelivr.net/gh/simplr-sh/coin-logos/images/dogwifcoin/standard.png" },
  { name: "Shiba Inu",symbol: "SHIB", iconColor: "#ffa409", network: "Ethereum", marketCap: "6.2B MCap",   price: 0.00001234, changePercent: -6.80, balance: 0, balanceUsd: 0, iconUrl: "https://cdn.jsdelivr.net/gh/simplr-sh/coin-logos/images/shiba-inu/standard.png" },
  { name: "Ethereum", symbol: "ETH",  iconColor: "#627eea", network: "Ethereum", marketCap: "247B MCap",   price: 2054.38,  changePercent: -6.92, balance: 0, balanceUsd: 0, iconUrl: "https://cdn.jsdelivr.net/gh/simplr-sh/coin-logos/images/ethereum/standard.png" },
  { name: "USDC",     symbol: "USDC", iconColor: "#2775ca", network: "Ethereum", marketCap: "73.0B MCap",  price: 1.0,      changePercent: 0.01,  balance: 0, balanceUsd: 0, iconUrl: "https://cdn.jsdelivr.net/gh/simplr-sh/coin-logos/images/usd-coin/standard.png" },
  { name: "Tether",   symbol: "USDT", iconColor: "#26a17b", network: "Ethereum", marketCap: "183B MCap",   price: 1.0,      changePercent: 0.0,   balance: 0, balanceUsd: 0, iconUrl: "https://cdn.jsdelivr.net/gh/simplr-sh/coin-logos/images/tether/standard.png" },
  { name: "USDC",     symbol: "USDC", iconColor: "#2775ca", network: "Base",     marketCap: "73.0B MCap",  price: 1.0,      changePercent: 0.01,  balance: 0, balanceUsd: 0, iconUrl: "https://cdn.jsdelivr.net/gh/simplr-sh/coin-logos/images/usd-coin/standard.png" },
  { name: "Ethereum", symbol: "ETH",  iconColor: "#627eea", network: "Base",     marketCap: "247B MCap",   price: 2054.38,  changePercent: -6.92, balance: 0, balanceUsd: 0, iconUrl: "https://cdn.jsdelivr.net/gh/simplr-sh/coin-logos/images/ethereum/standard.png" },
  { name: "Tether",   symbol: "USDT", iconColor: "#26a17b", network: "BSC",      marketCap: "183B MCap",   price: 1.0,      changePercent: 0.0,   balance: 0, balanceUsd: 0, iconUrl: "https://cdn.jsdelivr.net/gh/simplr-sh/coin-logos/images/tether/standard.png" },
];

export async function seedTokenPrices() {
  try {
    const rows = await db.execute(sql`SELECT COUNT(*) as count FROM crypto_tokens WHERE price > 0`);
    const count = Number((rows as any)[0]?.count ?? 0);
    if (count > 0) {
      console.log(`[seed] crypto_tokens already seeded (${count} tokens with prices)`);
      return;
    }
    await db.execute(sql`DELETE FROM crypto_tokens`);
    await db.insert(cryptoTokens).values(SEED_TOKENS);
    console.log(`[seed] Seeded ${SEED_TOKENS.length} crypto tokens with prices`);
  } catch (err) {
    console.error("[seed] Failed to seed tokens:", err);
  }
}
