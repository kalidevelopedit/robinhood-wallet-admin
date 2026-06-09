import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronDown, ArrowRight, Delete, Check, X, Info } from "lucide-react";

const SOL_ICON = "https://cdn.jsdelivr.net/gh/simplr-sh/coin-logos/images/solana/standard.png";
const USDT_ICON = "https://cdn.jsdelivr.net/gh/simplr-sh/coin-logos/images/tether/standard.png";

interface HoldingInfo {
  symbol: string;
  name: string;
  balance: number;
  balanceUsd: number;
  iconUrl: string | null;
  iconColor: string;
}

interface SwapScreenProps {
  onClose: () => void;
  onSelectToken: () => void;
  amount: string;
  onAmountChange: (amount: string) => void;
  holdings?: HoldingInfo[];
}

export function SwapScreen({ onClose, onSelectToken, amount, onAmountChange, holdings }: SwapScreenProps) {
  const setAmount = onAmountChange;
  const [inputMode, setInputMode] = useState<"USD" | "SOL">("USD");
  const [showReview, setShowReview] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSwapInfo, setShowSwapInfo] = useState(false);
  const [showFailed, setShowFailed] = useState(false);

  const hasBalance = holdings && holdings.length > 0 && holdings.some(h => h.balance > 0);
  const solHolding = holdings?.find(h => h.symbol === "SOL");

  const handleDigit = (digit: string) => {
    if (digit === "." && amount.includes(".")) return;
    if (amount === "0" && digit !== ".") {
      setAmount(digit);
    } else {
      setAmount(amount + digit);
    }
  };

  const handleDelete = () => {
    if (amount.length <= 1) {
      setAmount("0");
    } else {
      setAmount(amount.slice(0, -1));
    }
  };

  const handleMax = () => {
    setAmount("0");
  };

  const quickAmounts = ["$10", "$50", "$100"];
  const numericAmount = parseFloat(amount) || 0;
  const canReview = numericAmount > 0;

  return (
    <motion.div
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ type: "spring", damping: 30, stiffness: 300 }}
      className="fixed inset-0 bg-black z-50 flex flex-col"
    >
      <div className="flex items-center justify-between px-4 py-4">
        <button data-testid="button-swap-back" onClick={onClose} className="p-2">
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>
        <h2 className="text-white font-semibold text-base" data-testid="text-swap-title">
          Swap on Solana
        </h2>
        <div className="w-10" />
      </div>

      <div className="flex items-center gap-3 px-4 mb-6">
        <button
          data-testid="button-swap-from"
          onClick={onSelectToken}
          className="flex-1 flex items-center gap-2 bg-[#1c1c1e] rounded-full px-4 py-3"
        >
          <img src={SOL_ICON} alt="SOL" className="w-7 h-7 rounded-full" />
          <span className="text-white font-medium text-sm">SOL</span>
          <ChevronDown className="w-4 h-4 text-[#888] ml-auto" />
        </button>

        <ArrowRight className="w-5 h-5 text-[#888] flex-shrink-0" />

        <button
          data-testid="button-swap-to"
          onClick={onSelectToken}
          className="flex-1 flex items-center gap-2 bg-[#1c1c1e] rounded-full px-4 py-3"
        >
          <img src={USDT_ICON} alt="USDT" className="w-7 h-7 rounded-full" />
          <span className="text-white font-medium text-sm">USDT</span>
          <ChevronDown className="w-4 h-4 text-[#888] ml-auto" />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <motion.p
          className="text-6xl font-bold text-white mb-6"
          data-testid="text-swap-amount"
          key={amount}
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
        >
          ${amount}
        </motion.p>

        <div className="flex items-center bg-[#2a2a2a] rounded-full p-1 mb-8">
          <button
            data-testid="button-mode-sol"
            onClick={() => setInputMode("SOL")}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
              inputMode === "SOL" ? "bg-[#444] text-white" : "text-[#888]"
            }`}
          >
            SOL
          </button>
          <button
            data-testid="button-mode-usd"
            onClick={() => setInputMode("USD")}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
              inputMode === "USD" ? "bg-[#444] text-white" : "text-[#888]"
            }`}
          >
            $
          </button>
        </div>

        <div className="flex items-center gap-2 mb-6">
          <img src={SOL_ICON} alt="SOL" className="w-5 h-5 rounded-full" />
          <span className="text-[#888] text-sm">
            <span className="text-white font-medium">$0.00</span> of SOL available
          </span>
          <button
            data-testid="button-swap-info"
            onClick={() => setShowSwapInfo(true)}
            className="text-[#888] text-sm"
          >
            &#9432;
          </button>
        </div>

        <div className="flex gap-3 mb-4">
          {quickAmounts.map((qa) => (
            <button
              key={qa}
              data-testid={`button-quick-${qa}`}
              onClick={() => setAmount(qa.replace("$", ""))}
              className="px-5 py-2.5 border border-[#444] rounded-full text-white text-sm font-medium active:bg-[#333] transition-colors"
            >
              {qa}
            </button>
          ))}
          <button
            data-testid="button-swap-max"
            onClick={handleMax}
            className="px-5 py-2.5 border border-[#444] rounded-full text-[#888] text-sm font-medium active:bg-[#333] transition-colors"
          >
            MAX
          </button>
        </div>
      </div>

      <div className="px-8 pb-4">
        <div className="grid grid-cols-3 gap-y-3">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "del"].map((key) => (
            <div key={key} className="flex items-center justify-center">
              {key === "del" ? (
                <button
                  data-testid="button-swap-delete"
                  onClick={handleDelete}
                  className="w-20 h-14 flex items-center justify-center active:opacity-50 transition-opacity"
                >
                  <Delete className="w-6 h-6 text-white" />
                </button>
              ) : (
                <button
                  data-testid={`button-swap-key-${key}`}
                  onClick={() => handleDigit(key)}
                  className="w-20 h-14 flex items-center justify-center text-[26px] font-medium text-white active:opacity-50 transition-opacity"
                >
                  {key}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="px-6 pb-8">
        <button
          data-testid="button-review-swap"
          disabled={!canReview}
          onClick={() => setShowReview(true)}
          className={`w-full py-4 rounded-full text-base font-semibold transition-colors ${
            canReview
              ? "bg-[#30D158] text-black active:bg-[#28b34d]"
              : "bg-[#2c2c2e] text-[#48484A]"
          }`}
        >
          Review Swap
        </button>
      </div>

      <AnimatePresence>
        {showReview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-[60] flex items-end justify-center"
            onClick={() => setShowReview(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="w-full bg-[#1c1c1e] rounded-t-3xl p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-white text-lg font-bold" data-testid="text-review-title">Review Swap</h3>
                <button data-testid="button-close-review" onClick={() => setShowReview(false)} className="p-1">
                  <X className="w-5 h-5 text-[#888]" />
                </button>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-[#8E8E93] text-sm">You pay</span>
                  <div className="flex items-center gap-2">
                    <img src={SOL_ICON} alt="SOL" className="w-5 h-5 rounded-full" />
                    <span className="text-white font-medium" data-testid="text-review-pay">${amount} in SOL</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#8E8E93] text-sm">You receive</span>
                  <div className="flex items-center gap-2">
                    <img src={USDT_ICON} alt="USDT" className="w-5 h-5 rounded-full" />
                    <span className="text-white font-medium" data-testid="text-review-receive">~{numericAmount.toFixed(2)} USDT</span>
                  </div>
                </div>
                <div className="border-t border-[#333] pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[#8E8E93] text-sm">Rate</span>
                    <span className="text-white text-sm">1 SOL = ~84.00 USDT</span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[#8E8E93] text-sm">Network fee</span>
                    <span className="text-[#30D158] text-sm">Free</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#8E8E93] text-sm">Price impact</span>
                    <span className="text-white text-sm">&lt;0.01%</span>
                  </div>
                </div>
              </div>

              <button
                data-testid="button-confirm-swap"
                onClick={() => {
                  setShowReview(false);
                  if (!hasBalance) {
                    setShowFailed(true);
                  } else {
                    setShowConfirm(true);
                  }
                }}
                className="w-full py-4 bg-[#30D158] text-black rounded-full text-base font-semibold active:bg-[#28b34d]"
              >
                Confirm Swap
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-[70] flex flex-col items-center justify-center px-6"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", damping: 15, stiffness: 200 }}
              className="w-20 h-20 bg-[#0A3D2E] rounded-full flex items-center justify-center mb-6"
            >
              <Check className="w-10 h-10 text-[#30D158]" />
            </motion.div>

            <h2 className="text-2xl font-bold text-white mb-3 text-center" data-testid="text-swap-success">
              Swap Submitted
            </h2>
            <p className="text-[#8E8E93] text-center text-[15px] mb-8" data-testid="text-swap-details">
              Swapping ${amount} of SOL for ~{numericAmount.toFixed(2)} USDT
            </p>

            <button
              data-testid="button-swap-done"
              onClick={() => { setShowConfirm(false); setAmount("0"); onClose(); }}
              className="w-full py-4 bg-[#30D158] text-black rounded-full text-base font-semibold active:bg-[#28b34d]"
            >
              Done
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showFailed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-[70] flex flex-col items-center justify-center px-6"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", damping: 15, stiffness: 200 }}
              className="w-20 h-20 bg-[#3D0A0A] rounded-full flex items-center justify-center mb-6"
            >
              <X className="w-10 h-10 text-[#FF453A]" />
            </motion.div>

            <h2 className="text-2xl font-bold text-white mb-3 text-center" data-testid="text-swap-failed">
              Swap Failed
            </h2>
            <p className="text-[#8E8E93] text-center text-[15px] mb-8" data-testid="text-swap-failed-reason">
              Insufficient balance to complete this swap. Please deposit funds and try again.
            </p>

            <button
              data-testid="button-swap-failed-done"
              onClick={() => { setShowFailed(false); setAmount("0"); onClose(); }}
              className="w-full py-4 bg-[#FF453A] text-white rounded-full text-base font-semibold active:bg-[#cc3730]"
            >
              Done
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSwapInfo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-[60] flex items-end justify-center"
            onClick={() => setShowSwapInfo(false)}
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
                <h3 className="text-white text-lg font-bold" data-testid="text-swap-info-title">Available Balance</h3>
                <button data-testid="button-close-swap-info" onClick={() => setShowSwapInfo(false)} className="p-1">
                  <X className="w-5 h-5 text-[#888]" />
                </button>
              </div>
              <p className="text-[#8E8E93] text-sm leading-relaxed mb-4">
                Your available balance shows the amount of SOL you can swap after accounting for network fees. A small amount is reserved to cover transaction costs on the Solana network.
              </p>
              <p className="text-[#8E8E93] text-sm leading-relaxed mb-6">
                Network fees on Solana are typically very low (less than $0.01 per transaction) and are covered through 2026.
              </p>
              <button
                data-testid="button-got-it-swap-info"
                onClick={() => setShowSwapInfo(false)}
                className="w-full py-4 bg-[#2c2c2e] text-white rounded-full text-base font-semibold active:bg-[#3c3c3e]"
              >
                Got it
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
