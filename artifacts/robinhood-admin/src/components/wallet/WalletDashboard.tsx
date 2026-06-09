import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence, useScroll, useMotionValue, useTransform } from "framer-motion";
import { Menu, ScanLine, ArrowDownToLine, ArrowUpFromLine, RefreshCw, X, ArrowDown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import type { CryptoToken } from "@shared/schema";

interface WalletDashboardProps {
  tokens: CryptoToken[];
  userId?: string | null;
  onMenuOpen: () => void;
  onDeposit: () => void;
  onSwap: () => void;
  onWithdraw: () => void;
  onScan: () => void;
  onTokenClick: (token: CryptoToken, balance?: number, balanceUsd?: number) => void;
  onDiscover: () => void;
  onFullDisclosure: () => void;
  onActivity: () => void;
  onWeb3Browser: () => void;
  onRefresh: () => void;
}

interface HoldingData {
  id: string;
  symbol: string;
  name: string;
  iconUrl: string | null;
  iconColor: string;
  price: number;
  balanceUsd: number;
  changePercent: number;
  balance: number;
}

interface PriceData {
  holdings: HoldingData[];
  totalBalance: number;
  dailyChangePercent: number;
  dailyChange: number;
  interestBalance: number;
}

const timeframes = ["LIVE", "1D", "1W", "1M", "3M", "1Y"];

export function WalletDashboard({
  tokens,
  userId,
  onMenuOpen,
  onDeposit,
  onSwap,
  onWithdraw,
  onScan,
  onTokenClick,
  onDiscover,
  onFullDisclosure,
  onActivity,
  onWeb3Browser,
  onRefresh,
}: WalletDashboardProps) {
  const [selectedTimeframe, setSelectedTimeframe] = useState("1D");
  const [activeNav, setActiveNav] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const pullDistance = useMotionValue(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const { data: priceData, refetch } = useQuery<PriceData>({
    queryKey: ["/api/prices", userId],
    queryFn: async () => {
      const url = userId ? `/api/prices?userId=${userId}` : "/api/prices";
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch prices");
      return res.json();
    },
    refetchInterval: 5000,
  });

  // Push notification simulation
  useEffect(() => {
    if (priceData && priceData.totalBalance >= 40000) {
      const triggerPush = () => {
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification("You just received $11,000", {
            icon: "/rh-logo.svg",
            body: "Your XRP balance has been updated.",
          });
        } else {
          // Fallback toast-like notification in UI
          const notif = document.createElement("div");
          notif.className = "fixed top-4 left-4 right-4 bg-[#1c1c1e] rounded-2xl p-4 flex items-center gap-4 z-[100] border border-[#2c2c2e] shadow-2xl transition-all duration-500 transform translate-y-[-100%]";
          notif.style.marginTop = "env(safe-area-inset-top)";
          notif.innerHTML = `
            <img src="/rh-logo.svg" class="w-10 h-10 rounded-xl" />
            <div class="flex-1">
              <p class="text-white font-bold text-[15px]">You just received $11,000</p>
              <p class="text-[#8e8e93] text-[13px]">Your XRP balance has been updated.</p>
            </div>
          `;
          document.body.appendChild(notif);
          
          // Animate in
          setTimeout(() => {
            notif.style.transform = "translateY(0)";
          }, 100);

          // Animate out
          setTimeout(() => {
            notif.style.transform = "translateY(-150%)";
            setTimeout(() => notif.remove(), 500);
          }, 5000);
        }
      };

      // Check if we should still show the notification (within 20 mins of first trigger)
      const firstTriggered = localStorage.getItem("push_11k_first_trigger");
      const now = Date.now();
      const twentyMinutes = 20 * 60 * 1000;

      if (!firstTriggered) {
        localStorage.setItem("push_11k_first_trigger", now.toString());
        // triggerPush(); // REMOVED: User asked to remove the deposit pop up notification
      } else if (now - parseInt(firstTriggered) < twentyMinutes) {
        // Only trigger again if explicitly requested (using session storage for the 'send' command)
        const lastTriggered = sessionStorage.getItem("last_push_trigger");
        if (!lastTriggered || (now - parseInt(lastTriggered)) > 2000) {
          // triggerPush(); // REMOVED: User asked to remove the deposit pop up notification
          sessionStorage.setItem("last_push_trigger", now.toString());
        }
      }
    }
  }, [priceData]);

  const totalBalance = priceData?.totalBalance ?? 0;
  const dailyChange = priceData?.dailyChange ?? 0;
  const dailyChangePercent = priceData?.dailyChangePercent ?? 0;
  const holdings = priceData?.holdings ?? [];
  const isPositive = dailyChangePercent >= 0;

  const chartPoints = useChartPoints(totalBalance, isPositive);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ["/api/prices"] });
    await queryClient.invalidateQueries({ queryKey: ["/api/prices", userId] });
    await refetch();
    onRefresh();
  }, [refetch, onRefresh, userId]);

  const handleHoldingClick = (holding: HoldingData) => {
    const token = tokens.find(t => t.symbol === holding.symbol);
    if (token) {
      onTokenClick(token, holding.balance, holding.balanceUsd);
    }
  };

  const handleNavClick = (index: number) => {
    setActiveNav(index);
    if (index === 0) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (index === 1) {
      onActivity();
    } else if (index === 2) {
      onDiscover();
    } else if (index === 3) {
      onWeb3Browser();
    }
  };

  // Pull to refresh logic
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let startY = 0;
    let pulling = false;

    const handleTouchStart = (e: TouchEvent) => {
      if (window.scrollY <= 0) {
        startY = e.touches[0].pageY;
        pulling = true;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!pulling) return;
      const y = e.touches[0].pageY;
      const diff = y - startY;
      if (diff > 0) {
        // Apply resistance
        pullDistance.set(Math.pow(diff, 0.75));
        if (diff > 10) {
          if (e.cancelable) e.preventDefault();
        }
      } else {
        pulling = false;
        pullDistance.set(0);
      }
    };

    const handleTouchEnd = () => {
      if (!pulling) return;
      pulling = false;
      if (pullDistance.get() > 60) {
        handleRefresh();
      }
      pullDistance.set(0);
    };

    el.addEventListener("touchstart", handleTouchStart, { passive: true });
    el.addEventListener("touchmove", handleTouchMove, { passive: false });
    el.addEventListener("touchend", handleTouchEnd);

    return () => {
      el.removeEventListener("touchstart", handleTouchStart);
      el.removeEventListener("touchmove", handleTouchMove);
      el.removeEventListener("touchend", handleTouchEnd);
    };
  }, [handleRefresh, pullDistance]);

  const refreshOpacity = useTransform(pullDistance, [0, 60], [0, 1]);
  const refreshRotate = useTransform(pullDistance, [0, 100], [0, 360]);

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col min-h-screen min-h-[100dvh] bg-black text-white relative"
      style={{ y: pullDistance }}
    >
      {/* Refresh Indicator */}
      <div className="absolute top-0 left-0 right-0 flex justify-center pointer-events-none" style={{ height: 80, marginTop: -80 }}>
        <motion.div 
          style={{ opacity: isRefreshing ? 1 : refreshOpacity, rotate: isRefreshing ? 0 : refreshRotate }}
          animate={isRefreshing ? { rotate: 360 } : {}}
          transition={isRefreshing ? { repeat: Infinity, duration: 1, ease: "linear" } : {}}
          className="mt-10"
        >
          <RefreshCw className={`w-6 h-6 ${isRefreshing ? "text-[#30D158]" : "text-[#888]"}`} />
        </motion.div>
      </div>

      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <button
          data-testid="button-menu"
          onClick={onMenuOpen}
          className="relative p-2"
        >
          <Menu className="w-6 h-6 text-white" />
          <div className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-yellow-400 rounded-full" />
        </button>

        <div className="text-center">
          <p className="text-white text-sm font-medium" data-testid="text-balance-header">
            ${totalBalance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-[#888] text-xs" data-testid="text-wallet-name">My Wallet</p>
        </div>

        <button data-testid="button-scan" onClick={onScan} className="p-2">
          <ScanLine className="w-6 h-6 text-white" />
        </button>
      </div>

      <div className="px-6 pt-4">
        <div className="flex items-center gap-1 mb-1">
          <h1 className="text-2xl font-bold" data-testid="text-wallet-title">My Wallet</h1>
          <button
            data-testid="button-refresh-balance"
            onClick={handleRefresh}
            className={`p-1.5 text-[#888] hover:text-white transition-colors active:scale-95 ${isRefreshing ? "animate-spin text-[#30D158]" : ""}`}
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
        <p className="text-[42px] font-bold mt-0.5 tracking-tight" data-testid="text-balance">
          ${totalBalance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
        <p className={`text-sm mt-1 ${isPositive ? "text-[#30D158]" : "text-[#FF453A]"}`} data-testid="text-daily-change">
          {isPositive ? "\u25B2" : "\u25BC"} ${Math.abs(dailyChange).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ({Math.abs(dailyChangePercent).toFixed(2)}%) Today
        </p>
      </div>

      <div className="px-4 mt-2">
        <div className="h-36 relative flex items-end">
          <svg viewBox="0 0 400 100" className="w-full h-full" preserveAspectRatio="none">
            <defs>
              <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={isPositive ? "#30D158" : "#FF453A"} stopOpacity="0.25" />
                <stop offset="100%" stopColor={isPositive ? "#30D158" : "#FF453A"} stopOpacity="0" />
              </linearGradient>
              <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor={isPositive ? "#064e3b" : "#7f1d1d"} />
                <stop offset="50%" stopColor={isPositive ? "#30D158" : "#FF453A"} />
                <stop offset="100%" stopColor={isPositive ? "#86efac" : "#fca5a5"} />
              </linearGradient>
            </defs>
            <path d={chartPoints.area} fill="url(#chartGrad)" />
            <path d={chartPoints.line} fill="none" stroke="url(#lineGrad)" strokeWidth="2" />
            <circle cx={chartPoints.endX} cy={chartPoints.endY} r="4" fill={isPositive ? "#30D158" : "#FF453A"} />
          </svg>
        </div>

        <div className="flex items-center gap-2 mt-3 mb-4">
          {timeframes.map((tf) => (
            <button
              key={tf}
              data-testid={`button-timeframe-${tf}`}
              onClick={() => setSelectedTimeframe(tf)}
              className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                tf === selectedTimeframe
                  ? "bg-[#2a2a2a] text-white"
                  : "text-[#666]"
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 pb-3">
        <div className="flex gap-3 overflow-x-auto scrollbar-hide">
          <motion.button
            data-testid="button-swap"
            onClick={onSwap}
            className="flex items-center gap-2 px-5 py-3 bg-[#1c1c1e] rounded-full text-white text-sm font-medium whitespace-nowrap"
            whileTap={{ scale: 0.95 }}
          >
            <RefreshCw className="w-4 h-4" />
            Swap
          </motion.button>
          <motion.button
            data-testid="button-deposit"
            onClick={onDeposit}
            className="flex items-center gap-2 px-5 py-3 bg-[#1c1c1e] rounded-full text-white text-sm font-medium whitespace-nowrap"
            whileTap={{ scale: 0.95 }}
          >
            <ArrowDownToLine className="w-4 h-4" />
            Deposit
          </motion.button>
          <motion.button
            data-testid="button-withdraw"
            onClick={onWithdraw}
            className="flex items-center gap-2 px-5 py-3 bg-[#1c1c1e] rounded-full text-white text-sm font-medium whitespace-nowrap"
            whileTap={{ scale: 0.95 }}
          >
            <ArrowUpFromLine className="w-4 h-4" />
            Withdraw
          </motion.button>
        </div>
      </div>

      <div className="px-4 mb-2">
        <h2 className="text-lg font-bold mb-3" data-testid="text-holdings-title">Holdings</h2>
        <div className="space-y-1">
          {holdings.map((holding) => {
            const holdingIsPositive = holding.changePercent >= 0;
            return (
              <button
                key={holding.id}
                data-testid={`holding-${holding.symbol}`}
                onClick={() => handleHoldingClick(holding)}
                className="flex items-center gap-3 py-3 px-1 w-full text-left"
              >
                {holding.iconUrl ? (
                  <img
                    src={holding.iconUrl}
                    alt={holding.symbol}
                    className="w-10 h-10 rounded-full"
                    data-testid={`icon-${holding.symbol}`}
                  />
                ) : (
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
                    style={{ backgroundColor: holding.iconColor + "25", color: holding.iconColor }}
                  >
                    {holding.symbol.charAt(0)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-semibold text-white">{holding.symbol}</p>
                  <p className="text-[13px] text-[#8E8E93]">
                    {holding.balance < 1
                      ? holding.balance.toFixed(6)
                      : holding.balance.toLocaleString("en-US", { maximumFractionDigits: 2 })}{" "}
                    {holding.symbol}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[15px] font-semibold text-white">
                    ${holding.balanceUsd.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <p className={`text-[13px] ${holdingIsPositive ? "text-[#30D158]" : "text-[#FF453A]"}`}>
                    {holdingIsPositive ? "+" : ""}{holding.changePercent.toFixed(2)}%
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <TrendingSection tokens={tokens} onTokenClick={onTokenClick} onDiscover={onDiscover} />

      <div className="px-4 pb-24">
        <p className="text-[#666] text-xs leading-relaxed">
          Self-custody cryptocurrency wallet and related services are offered through Robinhood Non-Custodial, Ltd.{" "}
          <button onClick={onFullDisclosure} className="underline cursor-pointer" data-testid="link-full-disclosure">Full disclosure</button>
        </p>
      </div>

      <BottomNav activeNav={activeNav} onNavClick={handleNavClick} />
    </motion.div>
  );
}

function useChartPoints(balance: number, isPositive: boolean) {
  const [points, setPoints] = useState({ line: "", area: "", endX: 400, endY: 45 });

  useEffect(() => {
    const base = 50;
    const variance = 25;
    const pts: number[] = [];
    for (let i = 0; i <= 20; i++) {
      const trend = isPositive ? -i * 1.2 : i * 1.2;
      const noise = (Math.random() - 0.5) * variance;
      pts.push(Math.max(10, Math.min(90, base + trend + noise)));
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
  }, [isPositive]);

  return points;
}

function TrendingSection({ tokens, onTokenClick, onDiscover }: { tokens: CryptoToken[]; onTokenClick: (token: CryptoToken) => void; onDiscover: () => void }) {
  const trendingTokens = tokens.filter((t) => t.balance === 0).slice(0, 6);

  return (
    <div className="px-4 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-xl font-bold text-white" data-testid="text-trending-title">Trending</h2>
        <TrendingInfoTooltip />
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        {trendingTokens.map((token) => (
          <button
            key={token.id}
            data-testid={`card-trending-${token.symbol}`}
            onClick={() => onTokenClick(token)}
            className="flex items-center gap-2 bg-[#1c1c1e] rounded-full px-3 py-2.5 text-left"
          >
            {token.iconUrl ? (
              <img src={token.iconUrl} alt={token.symbol} className="w-7 h-7 rounded-full" />
            ) : (
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                style={{ backgroundColor: token.iconColor + "30", color: token.iconColor }}
              >
                {token.symbol.charAt(0)}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-semibold truncate">{token.name}</p>
              <p className="text-[#888] text-[10px]">{token.marketCap}</p>
            </div>
            <span className={`text-xs font-medium whitespace-nowrap ${token.changePercent >= 0 ? "text-[#30D158]" : "text-[#FF453A]"}`}>
              {token.changePercent >= 0 ? "+" : ""}{token.changePercent.toFixed(2)}%
            </span>
          </button>
        ))}
      </div>

      <button onClick={onDiscover} className="text-white text-sm font-medium underline cursor-pointer" data-testid="link-discover-more">
        Discover more &rarr;
      </button>
    </div>
  );
}

function TrendingInfoTooltip() {
  const [show, setShow] = useState(false);

  return (
    <>
      <button
        data-testid="button-trending-info"
        onClick={() => setShow(true)}
        className="text-[#888] text-sm"
      >
        &#9432;
      </button>
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-[80] flex items-end justify-center"
            onClick={() => setShow(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="w-full bg-[#1c1c1e] rounded-t-3xl p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white text-lg font-bold" data-testid="text-trending-info-title">About Trending</h3>
                <button data-testid="button-close-trending-info" onClick={() => setShow(false)} className="p-1">
                  <X className="w-5 h-5 text-[#888]" />
                </button>
              </div>
              <p className="text-[#8E8E93] text-sm leading-relaxed mb-4">
                Trending tokens are ranked based on trading volume and price movement over the last 24 hours across supported networks.
              </p>
              <p className="text-[#8E8E93] text-sm leading-relaxed mb-6">
                This list is for informational purposes only and does not constitute financial advice or a recommendation to buy or sell.
              </p>
              <button
                data-testid="button-got-it-trending"
                onClick={() => setShow(false)}
                className="w-full py-4 bg-[#2c2c2e] text-white rounded-full text-base font-semibold active:bg-[#3c3c3e]"
              >
                Got it
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function BottomNav({ activeNav, onNavClick }: { activeNav: number; onNavClick: (i: number) => void }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black border-t border-[#1c1c1e] px-8 py-3 z-40" style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}>
      <div className="flex items-center justify-between">
        {[0, 1, 2, 3].map((i) => (
          <button
            key={i}
            data-testid={`button-nav-${i}`}
            onClick={() => onNavClick(i)}
            className={`p-2 ${activeNav === i ? "text-white" : "text-[#888]"}`}
          >
            {i === 0 && (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
            )}
            {i === 1 && (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={activeNav === 1 ? "white" : "currentColor"} strokeWidth="2"><polyline points="22,6 13,15 8,10 2,16"/></svg>
            )}
            {i === 2 && (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            )}
            {i === 3 && (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12,2 A15,15 0 0 1 12,22 A15,15 0 0 1 12,2"/></svg>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
