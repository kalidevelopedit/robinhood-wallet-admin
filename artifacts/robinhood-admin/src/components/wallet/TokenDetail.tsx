import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ArrowDownToLine, ArrowUpFromLine, RefreshCw } from "lucide-react";
import type { CryptoToken } from "@shared/schema";

interface TokenDetailProps {
  token: CryptoToken;
  balance?: number;
  balanceUsd?: number;
  onClose: () => void;
  onDeposit: () => void;
  onSwap: () => void;
  onWithdraw: () => void;
}

const timeframes = ["1D", "1W", "1M", "3M", "1Y", "ALL"];

export function TokenDetail({ token, balance, balanceUsd, onClose, onDeposit, onSwap, onWithdraw }: TokenDetailProps) {
  const [selectedTimeframe, setSelectedTimeframe] = useState("1D");
  const isPositive = (token.changePercent ?? 0) >= 0;
  const chartPoints = useTokenChart(isPositive, selectedTimeframe);

  // Use price from token if balanceUsd isn't providing the latest fluctuating price
  const displayBalanceUsd = balance !== undefined ? balance * (token.price ?? 0) : balanceUsd;

  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", damping: 30, stiffness: 300 }}
      className="fixed inset-0 bg-black z-50 flex flex-col overflow-y-auto"
    >
      <div className="flex items-center justify-between px-4 py-4">
        <button data-testid="button-token-back" onClick={onClose} className="p-2">
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>
        <div className="flex items-center gap-2">
          {token.iconUrl ? (
            <img src={token.iconUrl} alt={token.symbol} className="w-6 h-6 rounded-full" />
          ) : (
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
              style={{ backgroundColor: token.iconColor + "20", color: token.iconColor }}
            >
              {token.symbol[0]}
            </div>
          )}
          <span className="text-white font-semibold text-base" data-testid="text-token-name">{token.name}</span>
        </div>
        <div className="w-10" />
      </div>

      <div className="px-6 pt-2">
        <p className="text-[42px] font-bold text-white tracking-tight" data-testid="text-token-price">
          ${(token.price ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
        <p className={`text-sm mt-1 ${isPositive ? "text-[#30D158]" : "text-[#FF453A]"}`} data-testid="text-token-change">
          {isPositive ? "\u25B2" : "\u25BC"} {Math.abs(token.changePercent ?? 0).toFixed(2)}% Today
        </p>
      </div>

      <div className="px-4 mt-4">
        <div className="h-40 relative">
          <svg viewBox="0 0 400 100" className="w-full h-full" preserveAspectRatio="none">
            <defs>
              <linearGradient id="tokenChartGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={isPositive ? "#30D158" : "#FF453A"} stopOpacity="0.25" />
                <stop offset="100%" stopColor={isPositive ? "#30D158" : "#FF453A"} stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d={chartPoints.area} fill="url(#tokenChartGrad)" />
            <path d={chartPoints.line} fill="none" stroke={isPositive ? "#30D158" : "#FF453A"} strokeWidth="2" />
            <circle cx={chartPoints.endX} cy={chartPoints.endY} r="4" fill={isPositive ? "#30D158" : "#FF453A"} />
          </svg>
        </div>

        <div className="flex items-center gap-2 mt-3 mb-4">
          {timeframes.map((tf) => (
            <button
              key={tf}
              data-testid={`button-token-tf-${tf}`}
              onClick={() => setSelectedTimeframe(tf)}
              className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                tf === selectedTimeframe ? "bg-[#2a2a2a] text-white" : "text-[#666]"
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {(balance !== undefined && balance > 0) && (
        <div className="px-6 py-4">
          <h3 className="text-[#8E8E93] text-xs font-medium mb-3">YOUR BALANCE</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white text-lg font-bold" data-testid="text-token-balance">
                {balance < 1 ? balance.toFixed(6) : balance.toLocaleString("en-US", { maximumFractionDigits: 4 })} {token.symbol}
              </p>
              <p className="text-[#8E8E93] text-sm" data-testid="text-token-balance-usd">
                ${(displayBalanceUsd ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="px-4 pb-4">
        <div className="flex gap-3">
          <motion.button
            data-testid="button-token-swap"
            onClick={onSwap}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#1c1c1e] rounded-full text-white text-sm font-medium"
            whileTap={{ scale: 0.95 }}
          >
            <RefreshCw className="w-4 h-4" />
            Swap
          </motion.button>
          <motion.button
            data-testid="button-token-deposit"
            onClick={onDeposit}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#1c1c1e] rounded-full text-white text-sm font-medium"
            whileTap={{ scale: 0.95 }}
          >
            <ArrowDownToLine className="w-4 h-4" />
            Deposit
          </motion.button>
          <motion.button
            data-testid="button-token-withdraw"
            onClick={onWithdraw}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#1c1c1e] rounded-full text-white text-sm font-medium"
            whileTap={{ scale: 0.95 }}
          >
            <ArrowUpFromLine className="w-4 h-4" />
            Withdraw
          </motion.button>
        </div>
      </div>

      <div className="px-6 pb-4">
        <h3 className="text-[#8E8E93] text-xs font-medium mb-3">ABOUT {token.symbol}</h3>
        <div className="bg-[#1c1c1e] rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[#8E8E93] text-sm">Network</span>
            <span className="text-white text-sm font-medium" data-testid="text-token-network">{token.network}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#8E8E93] text-sm">Market Cap</span>
            <span className="text-white text-sm font-medium" data-testid="text-token-mcap">{token.marketCap || "N/A"}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#8E8E93] text-sm">Symbol</span>
            <span className="text-white text-sm font-medium">{token.symbol}</span>
          </div>
        </div>
      </div>

      <div className="px-6 pb-8">
        <p className="text-[#666] text-xs leading-relaxed">
          Cryptocurrency prices are volatile and subject to market risk. Past performance is not indicative of future results.
        </p>
      </div>
    </motion.div>
  );
}

function useTokenChart(isPositive: boolean, timeframe: string) {
  const [points, setPoints] = useState({ line: "", area: "", endX: 400, endY: 45 });

  useEffect(() => {
    const numPts = timeframe === "1D" ? 24 : timeframe === "1W" ? 28 : timeframe === "1M" ? 30 : 40;
    const base = 50;
    const variance = 20;
    const pts: number[] = [];
    for (let i = 0; i <= numPts; i++) {
      const trend = isPositive ? -i * (40 / numPts) : i * (40 / numPts);
      const noise = (Math.sin(i * 3.7 + numPts) * 0.5 + (Math.random() - 0.5) * 0.5) * variance;
      pts.push(Math.max(5, Math.min(95, base + trend + noise)));
    }

    const step = 400 / (pts.length - 1);
    let line = `M0,${pts[0]}`;
    for (let i = 1; i < pts.length; i++) {
      const x = i * step;
      const prevX = (i - 1) * step;
      const cpX = (prevX + x) / 2;
      line += ` C${cpX},${pts[i - 1]} ${cpX},${pts[i]} ${x},${pts[i]}`;
    }

    const lastX = (pts.length - 1) * step;
    const lastY = pts[pts.length - 1];
    const area = line + ` V100 H0 Z`;

    setPoints({ line, area, endX: lastX, endY: lastY });
  }, [isPositive, timeframe]);

  return points;
}
