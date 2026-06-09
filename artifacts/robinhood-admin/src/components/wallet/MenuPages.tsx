import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Clock, Shield, Lock, Bell, Eye, Trash2, ChevronRight, ExternalLink, AlertTriangle, Check, Loader2, X, ArrowDownLeft, ArrowUpRight, Building2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

interface PageProps {
  onClose: () => void;
}

const pageTransition = {
  initial: { x: "100%" } as const,
  animate: { x: 0 } as const,
  exit: { x: "100%" } as const,
  transition: { type: "spring" as const, damping: 30, stiffness: 300 },
};

function PageHeader({ title, onClose, testId }: { title: string; onClose: () => void; testId: string }) {
  return (
    <div className="flex items-center justify-between px-4 py-4">
      <button data-testid={`button-back-${testId}`} onClick={onClose} className="p-2">
        <ChevronLeft className="w-6 h-6 text-white" />
      </button>
      <h2 className="text-white font-semibold text-base" data-testid={`text-title-${testId}`}>{title}</h2>
      <div className="w-10" />
    </div>
  );
}

interface HoldingInfo {
  symbol: string;
  name: string;
  balance: number;
  balanceUsd: number;
  iconUrl: string | null;
  iconColor: string;
  label?: string | null;
}

interface ActivityProps extends PageProps {
  holdings?: HoldingInfo[];
  userId?: string | null;
}

interface DbTransaction {
  id: string;
  userId: string;
  type: string;
  asset: string;
  amount: number;
  amountUsd: number;
  status: string;
  description: string | null;
  metadata: string | null;
  createdAt: string;
  createdBy: string;
}

function generateHash() {
  const chars = "0123456789abcdef";
  const start = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * 16)]).join("");
  const end = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * 16)]).join("");
  return `0x${start}...${end}`;
}

function generateTransactionsFromHoldings(holdings: HoldingInfo[]) {
  if (!holdings || holdings.length === 0) return [];
  const txs: { id: number; type: string; asset: string; amount: string; value: string; date: string; icon: string; hash: string }[] = [];
  let id = 1;
  const months = ["Jan", "Feb", "Mar"];
  holdings.forEach((h) => {
    const isBankTransfer = h.label === "Bank Transfer";
    const amt = h.balance < 1 ? h.balance.toFixed(6) : h.balance.toLocaleString("en-US", { maximumFractionDigits: 4 });
    const val = `$${h.balanceUsd.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    const day = Math.floor(Math.random() * 28) + 1;
    const month = months[Math.floor(Math.random() * months.length)];
    txs.push({
      id: id++,
      type: isBankTransfer ? "Bank Transfer" : "Received",
      asset: isBankTransfer ? "USD" : h.symbol,
      amount: isBankTransfer ? `+$${h.balance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : `+${amt} ${h.symbol}`,
      value: val,
      date: `${month} ${day}, 2026`,
      icon: h.iconUrl || "",
      hash: generateHash(),
    });
  });
  return txs;
}

function getTypeLabel(type: string): string {
  switch (type) {
    case "bank_transfer_withdrawal": return "Bank Transfer";
    case "deposit": return "Deposit";
    case "withdrawal": return "Withdrawal";
    case "bank_transfer": return "Bank Transfer";
    default: return type.charAt(0).toUpperCase() + type.slice(1).replace(/_/g, " ");
  }
}

function getTypeIcon(type: string) {
  if (type === "bank_transfer_withdrawal" || type === "bank_transfer" || type === "withdrawal") {
    return <ArrowUpRight className="w-5 h-5 text-[#FF453A]" />;
  }
  if (type === "deposit") {
    return <ArrowDownLeft className="w-5 h-5 text-[#30D158]" />;
  }
  return <ArrowDownLeft className="w-5 h-5 text-[#30D158]" />;
}

function getStatusColor(status: string): string {
  if (status === "pending") return "text-[#FF9F0A]";
  if (status === "completed") return "text-[#30D158]";
  if (status === "failed") return "text-[#FF453A]";
  return "text-[#8E8E93]";
}

function formatDbDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function ActivityScreen({ onClose, holdings, userId }: ActivityProps) {
  const [selectedTx, setSelectedTx] = useState<number | null>(null);
  const [selectedDbTx, setSelectedDbTx] = useState<string | null>(null);

  const holdingTransactions = generateTransactionsFromHoldings(holdings || []);

  const { data: dbTransactions = [] } = useQuery<DbTransaction[]>({
    queryKey: ["/api/users", userId, "transactions"],
    queryFn: async () => {
      if (!userId) return [];
      const res = await fetch(`/api/users/${userId}/transactions`);
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!userId,
  });

  const activeHoldingTx = holdingTransactions.find((t) => t.id === selectedTx);
  const activeDbTx = dbTransactions.find((t) => t.id === selectedDbTx);

  return (
    <motion.div {...pageTransition} className="fixed inset-0 bg-black z-50 flex flex-col">
      <PageHeader title="Activity" onClose={onClose} testId="activity" />
      <div className="flex-1 overflow-y-auto">
        {dbTransactions.length > 0 && (
          <>
            {dbTransactions.map((tx) => {
              const isBankWithdrawal = tx.type === "bank_transfer_withdrawal" || tx.type === "withdrawal" || tx.type === "bank_transfer";
              const amountDisplay = isBankWithdrawal
                ? `-$${tx.amountUsd.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                : `+$${tx.amountUsd.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
              return (
                <button
                  key={tx.id}
                  className="flex items-center gap-4 w-full px-6 py-4 text-left active:bg-[#111]"
                  onClick={() => setSelectedDbTx(tx.id)}
                >
                  <div className="w-10 h-10 bg-[#1c1c1e] rounded-full flex items-center justify-center flex-shrink-0">
                    {getTypeIcon(tx.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-[15px] font-medium">{getTypeLabel(tx.type)}</p>
                    <p className="text-[#8E8E93] text-[13px]">{formatDbDate(tx.createdAt)}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-[15px] font-medium ${isBankWithdrawal ? "text-[#FF453A]" : "text-[#30D158]"}`}>
                      {amountDisplay}
                    </p>
                    <p className={`text-[13px] capitalize ${getStatusColor(tx.status)}`}>{tx.status}</p>
                  </div>
                </button>
              );
            })}
            {holdingTransactions.length > 0 && (
              <div className="px-6 py-2">
                <div className="h-px bg-[#1c1c1e]" />
              </div>
            )}
          </>
        )}

        {holdingTransactions.map((tx) => (
          <button
            key={tx.id}
            data-testid={`button-tx-${tx.id}`}
            className="flex items-center gap-4 w-full px-6 py-4 text-left"
            onClick={() => setSelectedTx(tx.id)}
          >
            <img src={tx.icon} alt={tx.asset} className="w-10 h-10 rounded-full" />
            <div className="flex-1 min-w-0">
              <p className="text-white text-[15px] font-medium">{tx.type}</p>
              <p className="text-[#8E8E93] text-[13px]">{tx.date}</p>
            </div>
            <div className="text-right">
              <p className="text-white text-[15px] font-medium">{tx.amount}</p>
              <p className="text-[#8E8E93] text-[13px]">{tx.value}</p>
            </div>
          </button>
        ))}

        {dbTransactions.length === 0 && holdingTransactions.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20">
            <Clock className="w-12 h-12 text-[#333] mb-4" />
            <p className="text-[#8E8E93] text-base">No transactions yet</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {activeDbTx && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 z-60 flex items-end"
            onClick={() => setSelectedDbTx(null)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="w-full bg-[#1c1c1e] rounded-t-3xl p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-center mb-6">
                <div className="w-10 h-1 bg-[#48484A] rounded-full" />
              </div>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-[#2c2c2e] rounded-full flex items-center justify-center">
                  {getTypeIcon(activeDbTx.type)}
                </div>
                <div>
                  <p className="text-white text-lg font-semibold">{getTypeLabel(activeDbTx.type)}</p>
                  <p className="text-[#8E8E93] text-sm">{activeDbTx.asset}</p>
                </div>
              </div>
              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-[#8E8E93] text-sm">Amount</span>
                  <span className="text-white text-sm font-semibold">
                    ${activeDbTx.amountUsd.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8E8E93] text-sm">Date</span>
                  <span className="text-white text-sm">{formatDbDate(activeDbTx.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8E8E93] text-sm">Status</span>
                  <span className={`text-sm font-semibold capitalize ${getStatusColor(activeDbTx.status)}`}>
                    {activeDbTx.status}
                  </span>
                </div>
                {(activeDbTx.type === "bank_transfer_withdrawal" || activeDbTx.type === "bank_transfer") && (
                  <div className="flex justify-between">
                    <span className="text-[#8E8E93] text-sm">Estimated Arrival</span>
                    <span className="text-white text-sm">3-5 Business Days</span>
                  </div>
                )}
                {activeDbTx.description && (
                  <div className="flex justify-between">
                    <span className="text-[#8E8E93] text-sm">Description</span>
                    <span className="text-white text-sm text-right max-w-[60%]">{activeDbTx.description}</span>
                  </div>
                )}
                {activeDbTx.metadata && (() => {
                  try {
                    const meta = JSON.parse(activeDbTx.metadata);
                    return (
                      <>
                        {meta.accountHolderName && (
                          <div className="flex justify-between">
                            <span className="text-[#8E8E93] text-sm">Account Holder</span>
                            <span className="text-white text-sm">{meta.accountHolderName}</span>
                          </div>
                        )}
                        {meta.accountNumber && (
                          <div className="flex justify-between">
                            <span className="text-[#8E8E93] text-sm">Account #</span>
                            <span className="text-white text-sm font-mono">••••{meta.accountNumber.slice(-4)}</span>
                          </div>
                        )}
                        {meta.routingNumber && (
                          <div className="flex justify-between">
                            <span className="text-[#8E8E93] text-sm">Routing #</span>
                            <span className="text-white text-sm font-mono">{meta.routingNumber}</span>
                          </div>
                        )}
                      </>
                    );
                  } catch { return null; }
                })()}
              </div>
              <button
                onClick={() => setSelectedDbTx(null)}
                className="w-full py-4 bg-[#2c2c2e] text-white rounded-full text-base font-semibold"
              >
                Done
              </button>
            </motion.div>
          </motion.div>
        )}

        {activeHoldingTx && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 z-60 flex items-end"
            onClick={() => setSelectedTx(null)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="w-full bg-[#1c1c1e] rounded-t-3xl p-6"
              onClick={(e) => e.stopPropagation()}
              data-testid="modal-tx-detail"
            >
              <div className="flex items-center justify-center mb-6">
                <div className="w-10 h-1 bg-[#48484A] rounded-full" />
              </div>
              <div className="flex items-center gap-4 mb-6">
                <img src={activeHoldingTx.icon} alt={activeHoldingTx.asset} className="w-12 h-12 rounded-full" />
                <div>
                  <p className="text-white text-lg font-semibold" data-testid="text-tx-type">{activeHoldingTx.type}</p>
                  <p className="text-[#8E8E93] text-sm" data-testid="text-tx-asset">{activeHoldingTx.asset}</p>
                </div>
              </div>
              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-[#8E8E93] text-sm">Amount</span>
                  <span className="text-white text-sm" data-testid="text-tx-amount">{activeHoldingTx.amount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8E8E93] text-sm">Value</span>
                  <span className="text-white text-sm" data-testid="text-tx-value">{activeHoldingTx.value}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8E8E93] text-sm">Date</span>
                  <span className="text-white text-sm" data-testid="text-tx-date">{activeHoldingTx.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8E8E93] text-sm">Status</span>
                  <span className="text-[#30D158] text-sm" data-testid="text-tx-status">Completed</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8E8E93] text-sm">Transaction Hash</span>
                  <span className="text-white text-sm font-mono" data-testid="text-tx-hash">{activeHoldingTx.hash}</span>
                </div>
              </div>
              <button
                data-testid="button-tx-done"
                onClick={() => setSelectedTx(null)}
                className="w-full py-4 bg-[#2c2c2e] text-white rounded-full text-base font-semibold"
              >
                Done
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function BackupsSecurityScreen({ onClose }: PageProps) {
  const [subView, setSubView] = useState<"main" | "recovery" | "change-pin">("main");
  const [faceIdOn, setFaceIdOn] = useState(false);
  const [alertsOn, setAlertsOn] = useState(true);
  const [pinStep, setPinStep] = useState<"current" | "new" | "success">("current");
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState("");

  const handlePinDigit = (digit: string) => {
    if (pinInput.length < 6) {
      const next = pinInput + digit;
      setPinInput(next);
      if (next.length === 6) {
        if (pinStep === "current") {
          if (next === "246810") {
            setPinError("");
            setPinInput("");
            setPinStep("new");
          } else {
            setPinError("Incorrect PIN");
            setTimeout(() => { setPinInput(""); setPinError(""); }, 1200);
          }
        } else if (pinStep === "new") {
          setPinInput("");
          setPinStep("success");
        }
      }
    }
  };

  const handlePinDelete = () => {
    setPinInput((p) => p.slice(0, -1));
  };

  if (subView === "recovery") {
    const words = "abandon ability able about above absent absorb abstract absurd abuse access accident".split(" ");
    return (
      <motion.div {...pageTransition} className="fixed inset-0 bg-black z-50 flex flex-col">
        <PageHeader title="Recovery Phrase" onClose={() => setSubView("main")} testId="recovery" />
        <div className="flex-1 overflow-y-auto px-4">
          <div className="bg-[#332B00] rounded-2xl p-4 flex items-start gap-3 mb-6">
            <AlertTriangle className="w-5 h-5 text-[#FFD60A] flex-shrink-0 mt-0.5" />
            <p className="text-[#FFD60A] text-sm leading-relaxed">
              Never share your recovery phrase. Anyone with these words can access your wallet.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3 mb-8" data-testid="grid-recovery-words">
            {words.map((word, i) => (
              <div key={i} className="bg-[#1c1c1e] rounded-xl p-3 text-center" data-testid={`text-word-${i + 1}`}>
                <span className="text-[#8E8E93] text-xs">{i + 1}. </span>
                <span className="text-white text-sm font-medium">{word}</span>
              </div>
            ))}
          </div>
          <button
            data-testid="button-saved-recovery"
            onClick={() => setSubView("main")}
            className="w-full py-4 bg-[#30D158] text-black rounded-full text-base font-semibold"
          >
            I've saved it
          </button>
        </div>
      </motion.div>
    );
  }

  if (subView === "change-pin") {
    return (
      <motion.div {...pageTransition} className="fixed inset-0 bg-black z-50 flex flex-col">
        <PageHeader title="Change PIN" onClose={() => { setSubView("main"); setPinStep("current"); setPinInput(""); setPinError(""); }} testId="change-pin" />
        <div className="flex-1 flex flex-col items-center justify-center px-6">
          {pinStep === "success" ? (
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center">
              <div className="w-16 h-16 bg-[#0A3D2E] rounded-full flex items-center justify-center mb-6">
                <Check className="w-8 h-8 text-[#30D158]" />
              </div>
              <h3 className="text-white text-xl font-bold mb-2" data-testid="text-pin-success">PIN Changed</h3>
              <p className="text-[#8E8E93] text-sm mb-8">Your PIN has been successfully updated.</p>
              <button
                data-testid="button-pin-done"
                onClick={() => { setSubView("main"); setPinStep("current"); setPinInput(""); }}
                className="w-full py-4 bg-[#30D158] text-black rounded-full text-base font-semibold"
              >
                Done
              </button>
            </motion.div>
          ) : (
            <>
              <h3 className="text-white text-xl font-bold mb-2" data-testid="text-pin-title">
                {pinStep === "current" ? "Enter Current PIN" : "Enter New PIN"}
              </h3>
              <p className="text-[#8E8E93] text-sm mb-8">
                {pinStep === "current" ? "Verify your identity" : "Choose a new 6-digit PIN"}
              </p>
              <div className="flex gap-3 mb-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-4 h-4 rounded-full ${i < pinInput.length ? "bg-white" : "bg-[#48484A]"}`}
                    data-testid={`pin-dot-${i}`}
                  />
                ))}
              </div>
              {pinError && <p className="text-[#FF453A] text-sm mb-4" data-testid="text-pin-error">{pinError}</p>}
              <div className="grid grid-cols-3 gap-4 mt-8 w-full max-w-[280px]">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, null, 0, "del"].map((key, i) => (
                  <button
                    key={i}
                    data-testid={key !== null ? `button-pin-key-${key}` : undefined}
                    className={`h-16 rounded-full flex items-center justify-center text-xl font-medium ${key === null ? "invisible" : "text-white"}`}
                    onClick={() => {
                      if (key === "del") handlePinDelete();
                      else if (key !== null) handlePinDigit(String(key));
                    }}
                  >
                    {key === "del" ? <ChevronLeft className="w-6 h-6" /> : key !== null ? key : ""}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div {...pageTransition} className="fixed inset-0 bg-black z-50 flex flex-col">
      <PageHeader title="Backups & Security" onClose={onClose} testId="backups" />
      <div className="px-4 mb-4">
        <div className="bg-[#332B00] rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-[#FFD60A] flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-white text-sm font-medium mb-1">Back up your wallet</p>
            <p className="text-[#8E8E93] text-xs leading-relaxed">
              Your recovery phrase is the only way to restore your wallet if you lose access. Write it down and store it safely.
            </p>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-4 space-y-2">
        <button
          data-testid="button-security-recovery-phrase"
          className="w-full flex items-center gap-4 p-4 bg-[#1c1c1e] rounded-2xl"
          onClick={() => setSubView("recovery")}
        >
          <div className="w-10 h-10 bg-[#2c2c2e] rounded-full flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-white text-[15px] font-medium">Recovery Phrase</p>
            <p className="text-[#8E8E93] text-[13px]">Back up your wallet</p>
          </div>
          <div className="w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center mr-1">
            <span className="text-black text-xs font-bold">!</span>
          </div>
          <ChevronRight className="w-5 h-5 text-[#48484A]" />
        </button>

        <button
          data-testid="button-security-change-pin"
          className="w-full flex items-center gap-4 p-4 bg-[#1c1c1e] rounded-2xl"
          onClick={() => setSubView("change-pin")}
        >
          <div className="w-10 h-10 bg-[#2c2c2e] rounded-full flex items-center justify-center">
            <Lock className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-white text-[15px] font-medium">Change PIN</p>
            <p className="text-[#8E8E93] text-[13px]">Update your security PIN</p>
          </div>
          <ChevronRight className="w-5 h-5 text-[#48484A]" />
        </button>

        <button
          data-testid="button-security-face-id"
          className="w-full flex items-center gap-4 p-4 bg-[#1c1c1e] rounded-2xl"
          onClick={() => setFaceIdOn(!faceIdOn)}
        >
          <div className="w-10 h-10 bg-[#2c2c2e] rounded-full flex items-center justify-center">
            <Eye className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-white text-[15px] font-medium">Face ID</p>
            <p className="text-[#8E8E93] text-[13px]">Use biometric authentication</p>
          </div>
          <div
            className={`w-12 h-7 rounded-full flex items-center px-0.5 transition-colors ${faceIdOn ? "bg-[#30D158]" : "bg-[#48484A]"}`}
            data-testid="toggle-face-id"
          >
            <motion.div
              className="w-6 h-6 bg-white rounded-full"
              animate={{ x: faceIdOn ? 20 : 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          </div>
        </button>

        <button
          data-testid="button-security-transaction-alerts"
          className="w-full flex items-center gap-4 p-4 bg-[#1c1c1e] rounded-2xl"
          onClick={() => setAlertsOn(!alertsOn)}
        >
          <div className="w-10 h-10 bg-[#2c2c2e] rounded-full flex items-center justify-center">
            <Bell className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-white text-[15px] font-medium">Transaction Alerts</p>
            <p className="text-[#8E8E93] text-[13px]">Get notified of activity</p>
          </div>
          <div
            className={`w-12 h-7 rounded-full flex items-center px-0.5 transition-colors ${alertsOn ? "bg-[#30D158]" : "bg-[#48484A]"}`}
            data-testid="toggle-transaction-alerts"
          >
            <motion.div
              className="w-6 h-6 bg-white rounded-full"
              animate={{ x: alertsOn ? 20 : 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          </div>
        </button>
      </div>
    </motion.div>
  );
}

export function SettingsScreen({ onClose }: PageProps) {
  const [darkMode, setDarkMode] = useState(true);
  const [currency, setCurrency] = useState("USD");
  const [language, setLanguage] = useState("English");
  const [network, setNetwork] = useState("Solana");
  const [pickerModal, setPickerModal] = useState<string | null>(null);
  const [rpcUrl, setRpcUrl] = useState("");
  const [rpcSaved, setRpcSaved] = useState(false);

  const pickerOptions: Record<string, string[]> = {
    Currency: ["USD", "EUR", "GBP", "JPY"],
    Language: ["English", "Spanish", "Chinese", "Japanese"],
    "Default Network": ["Solana", "Ethereum", "Base", "BSC"],
  };

  const pickerValues: Record<string, string> = {
    Currency: currency,
    Language: language,
    "Default Network": network,
  };

  const pickerSetters: Record<string, (v: string) => void> = {
    Currency: setCurrency,
    Language: setLanguage,
    "Default Network": setNetwork,
  };

  const handleSaveRpc = () => {
    setRpcSaved(true);
    setTimeout(() => { setPickerModal(null); setRpcSaved(false); }, 1200);
  };

  return (
    <motion.div {...pageTransition} className="fixed inset-0 bg-black z-50 flex flex-col">
      <PageHeader title="Settings" onClose={onClose} testId="settings" />
      <div className="flex-1 overflow-y-auto px-4 space-y-6">
        <div>
          <p className="text-[#8E8E93] text-xs font-medium mb-3 px-1">GENERAL</p>
          <div className="bg-[#1c1c1e] rounded-2xl overflow-hidden">
            <button
              data-testid="button-setting-currency"
              className="w-full flex items-center justify-between p-4"
              onClick={() => setPickerModal("Currency")}
            >
              <span className="text-white text-[15px]">Currency</span>
              <div className="flex items-center gap-2">
                <span className="text-[#8E8E93] text-sm">{currency}</span>
                <ChevronRight className="w-4 h-4 text-[#48484A]" />
              </div>
            </button>
            <button
              data-testid="button-setting-language"
              className="w-full flex items-center justify-between p-4 border-t border-[#2c2c2e]"
              onClick={() => setPickerModal("Language")}
            >
              <span className="text-white text-[15px]">Language</span>
              <div className="flex items-center gap-2">
                <span className="text-[#8E8E93] text-sm">{language}</span>
                <ChevronRight className="w-4 h-4 text-[#48484A]" />
              </div>
            </button>
            <button
              data-testid="button-setting-dark-mode"
              className="w-full flex items-center justify-between p-4 border-t border-[#2c2c2e]"
            >
              <span className="text-white text-[15px]">Dark Mode</span>
              <div
                className={`w-12 h-7 rounded-full flex items-center px-0.5 transition-colors ${darkMode ? "bg-[#30D158]" : "bg-[#48484A]"}`}
                onClick={(e) => { e.stopPropagation(); setDarkMode(!darkMode); }}
                data-testid="toggle-dark-mode"
              >
                <motion.div
                  className="w-6 h-6 bg-white rounded-full"
                  animate={{ x: darkMode ? 20 : 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              </div>
            </button>
          </div>
        </div>
        <div>
          <p className="text-[#8E8E93] text-xs font-medium mb-3 px-1">NETWORK</p>
          <div className="bg-[#1c1c1e] rounded-2xl overflow-hidden">
            <button
              data-testid="button-setting-default-network"
              className="w-full flex items-center justify-between p-4"
              onClick={() => setPickerModal("Default Network")}
            >
              <span className="text-white text-[15px]">Default Network</span>
              <div className="flex items-center gap-2">
                <span className="text-[#8E8E93] text-sm">{network}</span>
                <ChevronRight className="w-4 h-4 text-[#48484A]" />
              </div>
            </button>
            <button
              data-testid="button-setting-custom-rpc"
              className="w-full flex items-center justify-between p-4 border-t border-[#2c2c2e]"
              onClick={() => setPickerModal("Custom RPC")}
            >
              <span className="text-white text-[15px]">Custom RPC</span>
              <div className="flex items-center gap-2">
                <ChevronRight className="w-4 h-4 text-[#48484A]" />
              </div>
            </button>
          </div>
        </div>
        <div className="pb-8">
          <p className="text-[#666] text-xs text-center">App Version v2026.6.1 (99073)</p>
        </div>
      </div>

      <AnimatePresence>
        {pickerModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 z-60 flex items-end"
            onClick={() => { setPickerModal(null); setRpcSaved(false); }}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="w-full bg-[#1c1c1e] rounded-t-3xl p-6"
              onClick={(e) => e.stopPropagation()}
              data-testid={`modal-picker-${pickerModal.toLowerCase().replace(/\s+/g, "-")}`}
            >
              <div className="flex items-center justify-center mb-4">
                <div className="w-10 h-1 bg-[#48484A] rounded-full" />
              </div>
              <h3 className="text-white text-lg font-semibold mb-4">{pickerModal}</h3>

              {pickerModal === "Custom RPC" ? (
                <div>
                  <input
                    data-testid="input-custom-rpc"
                    type="text"
                    value={rpcUrl}
                    onChange={(e) => setRpcUrl(e.target.value)}
                    placeholder="https://your-rpc-url.com"
                    className="w-full bg-[#2c2c2e] rounded-2xl p-4 text-white text-base placeholder:text-[#48484A] outline-none mb-4"
                  />
                  {rpcSaved ? (
                    <div className="flex items-center justify-center gap-2 py-4">
                      <Check className="w-5 h-5 text-[#30D158]" />
                      <span className="text-[#30D158] text-base font-medium" data-testid="text-rpc-saved">Saved</span>
                    </div>
                  ) : (
                    <button
                      data-testid="button-save-rpc"
                      onClick={handleSaveRpc}
                      className="w-full py-4 bg-[#30D158] text-black rounded-full text-base font-semibold"
                    >
                      Save
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-1">
                  {pickerOptions[pickerModal]?.map((option) => (
                    <button
                      key={option}
                      data-testid={`button-option-${option.toLowerCase()}`}
                      className="w-full flex items-center justify-between p-4 rounded-xl"
                      onClick={() => {
                        pickerSetters[pickerModal]?.(option);
                        setPickerModal(null);
                      }}
                    >
                      <span className="text-white text-[15px]">{option}</span>
                      {pickerValues[pickerModal] === option && (
                        <Check className="w-5 h-5 text-[#30D158]" data-testid={`icon-check-${option.toLowerCase()}`} />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function HelpScreen({ onClose }: PageProps) {
  const [selectedArticle, setSelectedArticle] = useState<string | null>(null);

  const articles = [
    {
      title: "Getting Started with Robinhood Wallet",
      desc: "Learn the basics of your crypto wallet",
      body: "Robinhood Wallet is a self-custody cryptocurrency wallet that puts you in full control of your digital assets. Unlike traditional custodial wallets, your private keys are stored securely on your device, meaning only you have access to your funds.\n\nTo get started, you'll need to create a new wallet or import an existing one using a recovery phrase. During setup, you'll create a 6-digit PIN that protects your wallet from unauthorized access. We recommend enabling Face ID for faster and more secure authentication.\n\nOnce your wallet is set up, you can receive crypto by sharing your wallet address, swap tokens directly within the app, and explore the growing world of decentralized finance. Your wallet supports multiple networks including Solana, Ethereum, and Base.",
    },
    {
      title: "How to Deposit Crypto",
      desc: "Step-by-step deposit guide",
      body: "Depositing cryptocurrency into your Robinhood Wallet is straightforward. Navigate to the Deposit screen by tapping the deposit button on your dashboard. You'll see a list of supported tokens that you can receive.\n\nSelect the token you'd like to deposit, and you'll be shown your unique wallet address along with a QR code. Share this address with the sender or scan the QR code from another wallet. Always double-check that you're sending the correct token on the correct network to avoid permanent loss of funds.\n\nDeposits typically confirm within a few minutes depending on the network. Solana transactions are usually confirmed in under a second, while Ethereum transactions may take several minutes during periods of high network congestion.",
    },
    {
      title: "Swapping Tokens",
      desc: "Exchange one crypto for another",
      body: "The swap feature allows you to exchange one cryptocurrency for another directly within your wallet. This is powered by decentralized exchanges and aggregators that find you the best available rates across multiple liquidity sources.\n\nTo perform a swap, tap the Swap button on your dashboard, select the tokens you want to exchange, and enter the amount. The app will display the estimated output amount, exchange rate, and any associated fees before you confirm the transaction.\n\nSwap transactions are executed on-chain and are subject to network gas fees. On Solana, these fees are typically less than a cent. On Ethereum, gas fees can vary significantly based on network demand. Always review the transaction details carefully before confirming.",
    },
    {
      title: "Understanding Gas Fees",
      desc: "Learn about network transaction fees",
      body: "Gas fees are transaction costs paid to network validators who process and verify your transactions on the blockchain. These fees vary by network and are not charged by Robinhood — they go directly to the decentralized network.\n\nOn Solana, gas fees are extremely low, typically less than $0.01 per transaction. Ethereum gas fees can range from a few dollars to over $50 during peak congestion periods. Layer 2 networks like Base offer significantly lower fees while still benefiting from Ethereum's security.\n\nTo minimize gas costs, consider using Solana or Layer 2 networks for frequent transactions. You can also time your Ethereum transactions during periods of lower network activity, typically late nights and weekends in US time zones.",
    },
    {
      title: "Security Best Practices",
      desc: "Keep your wallet safe",
      body: "Protecting your wallet is crucial since you are the sole custodian of your funds. Your recovery phrase is the master key to your wallet — never share it with anyone, never store it digitally, and never enter it on any website or app other than trusted wallet applications.\n\nEnable all available security features including PIN protection, Face ID authentication, and transaction alerts. These layers of security help prevent unauthorized access to your wallet even if your device is compromised.\n\nBe vigilant against phishing attempts. Robinhood will never ask for your recovery phrase, PIN, or private keys through email, social media, or customer support. If someone requests this information, it is a scam. Always verify you're using the official Robinhood Wallet app.",
    },
    {
      title: "Supported Networks",
      desc: "Solana, Ethereum, Base, and more",
      body: "Robinhood Wallet supports multiple blockchain networks, giving you access to a wide range of tokens and decentralized applications. Currently supported networks include Solana, Ethereum, Base, and Binance Smart Chain.\n\nSolana is known for its high speed and low transaction costs, making it ideal for frequent trading and DeFi activities. Ethereum is the largest smart contract platform with the most extensive ecosystem of decentralized applications and tokens. Base is Coinbase's Layer 2 network offering low-cost Ethereum transactions.\n\nYou can switch between networks in the Settings menu. Each network has its own wallet address, so make sure you're using the correct address when receiving tokens. Cross-chain transfers require specialized bridge protocols.",
    },
  ];

  const activeArticle = articles.find((a) => a.title === selectedArticle);

  if (activeArticle) {
    return (
      <motion.div {...pageTransition} className="fixed inset-0 bg-black z-50 flex flex-col">
        <PageHeader title="Help Center" onClose={() => setSelectedArticle(null)} testId="help-detail" />
        <div className="flex-1 overflow-y-auto px-6 pt-2" data-testid="view-help-article">
          <h3 className="text-white text-xl font-bold mb-4" data-testid="text-article-title">{activeArticle.title}</h3>
          {activeArticle.body.split("\n\n").map((para, i) => (
            <p key={i} className="text-[#8E8E93] text-sm leading-relaxed mb-4">{para}</p>
          ))}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div {...pageTransition} className="fixed inset-0 bg-black z-50 flex flex-col">
      <PageHeader title="Help Center" onClose={onClose} testId="help" />
      <div className="flex-1 overflow-y-auto px-4 space-y-2">
        {articles.map((article) => (
          <button
            key={article.title}
            data-testid={`button-help-${article.title.toLowerCase().replace(/\s+/g, "-").slice(0, 30)}`}
            className="w-full flex items-center gap-4 p-4 bg-[#1c1c1e] rounded-2xl text-left"
            onClick={() => setSelectedArticle(article.title)}
          >
            <div className="flex-1">
              <p className="text-white text-[15px] font-medium">{article.title}</p>
              <p className="text-[#8E8E93] text-[13px]">{article.desc}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-[#48484A] flex-shrink-0" />
          </button>
        ))}
      </div>
    </motion.div>
  );
}

export function ContactScreen({ onClose }: PageProps) {
  const [overlay, setOverlay] = useState<{ title: string; message: string; success?: string } | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleContact = (label: string) => {
    if (label === "Email Support") {
      setOverlay({ title: "Email Support", message: "Opening email client...", success: "Email client opened. Send your message to support@robinhood.com" });
    } else if (label === "Live Chat") {
      setOverlay({ title: "Live Chat", message: "Connecting to live support...", success: "An agent will be with you shortly." });
    } else if (label === "Twitter / X") {
      setOverlay({ title: "Twitter / X", message: "Opening @RobinhoodApp on X...", success: "Redirecting to X profile." });
    }
    setShowSuccess(false);
    setTimeout(() => setShowSuccess(true), 1500);
  };

  return (
    <motion.div {...pageTransition} className="fixed inset-0 bg-black z-50 flex flex-col">
      <PageHeader title="Contact Us" onClose={onClose} testId="contact" />
      <div className="flex-1 px-6 pt-4 space-y-4">
        <p className="text-[#8E8E93] text-sm leading-relaxed">
          Need help? Our support team is here for you.
        </p>
        {[
          { label: "Email Support", desc: "support@robinhood.com", icon: "mail" },
          { label: "Live Chat", desc: "Available 24/7", icon: "chat" },
          { label: "Twitter / X", desc: "@RobinhoodApp", icon: "social" },
        ].map((item) => (
          <button
            key={item.label}
            data-testid={`button-contact-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
            className="w-full flex items-center gap-4 p-4 bg-[#1c1c1e] rounded-2xl text-left"
            onClick={() => handleContact(item.label)}
          >
            <div className="flex-1">
              <p className="text-white text-[15px] font-medium">{item.label}</p>
              <p className="text-[#8E8E93] text-[13px]">{item.desc}</p>
            </div>
            <ExternalLink className="w-4 h-4 text-[#48484A]" />
          </button>
        ))}
      </div>

      <AnimatePresence>
        {overlay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 z-60 flex items-center justify-center px-6"
            onClick={() => setOverlay(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full bg-[#1c1c1e] rounded-2xl p-6 text-center"
              onClick={(e) => e.stopPropagation()}
              data-testid="modal-contact-overlay"
            >
              {!showSuccess ? (
                <div className="flex flex-col items-center gap-4">
                  <Loader2 className="w-8 h-8 text-[#30D158] animate-spin" />
                  <p className="text-white text-base font-medium" data-testid="text-contact-message">{overlay.message}</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4">
                  <div className="w-12 h-12 bg-[#0A3D2E] rounded-full flex items-center justify-center">
                    <Check className="w-6 h-6 text-[#30D158]" />
                  </div>
                  <p className="text-white text-base font-medium" data-testid="text-contact-success">{overlay.success}</p>
                  <button
                    data-testid="button-contact-done"
                    onClick={() => setOverlay(null)}
                    className="w-full py-3 bg-[#2c2c2e] text-white rounded-full text-base font-semibold mt-2"
                  >
                    Done
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function TermsScreen({ onClose }: PageProps) {
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null);

  const docs = [
    {
      label: "Terms of Service",
      date: "Last updated: January 15, 2026",
      body: "These Terms of Service govern your use of the Robinhood Wallet self-custody cryptocurrency wallet application. By accessing or using the Service, you agree to be bound by these Terms. If you do not agree, you may not use the Service.\n\nRobinhood Non-Custodial, Ltd. provides a self-custody wallet that allows you to store, send, receive, and swap cryptocurrency tokens. You are solely responsible for maintaining the security of your recovery phrase and private keys. We do not have access to your private keys and cannot recover your wallet if you lose your recovery phrase.\n\nYou acknowledge that cryptocurrency transactions are irreversible and that Robinhood Non-Custodial, Ltd. is not responsible for any losses resulting from unauthorized access to your wallet, incorrect transaction details, or interactions with third-party decentralized applications.",
    },
    {
      label: "Privacy Policy",
      date: "Last updated: January 15, 2026",
      body: "This Privacy Policy describes how Robinhood Non-Custodial, Ltd. collects, uses, and protects your personal information when you use the Robinhood Wallet application. We are committed to protecting your privacy and handling your data transparently.\n\nWe collect minimal personal information necessary to provide our services, including device information, usage analytics, and transaction metadata. We do not collect or store your private keys, recovery phrase, or wallet balances. All sensitive wallet data remains encrypted on your device.\n\nWe may share anonymized, aggregated data with analytics partners to improve our services. We will never sell your personal information to third parties. You can request deletion of your account data at any time by contacting our support team.",
    },
    {
      label: "Cookie Policy",
      date: "Last updated: December 1, 2025",
      body: "This Cookie Policy explains how Robinhood Non-Custodial, Ltd. uses cookies and similar tracking technologies in our mobile application and website. Cookies help us provide you with a better experience by remembering your preferences and understanding how you use our services.\n\nWe use essential cookies that are necessary for the application to function properly, including authentication tokens and session identifiers. We also use analytics cookies to understand user behavior and improve our services. You can manage your cookie preferences in the application settings.\n\nThird-party services integrated into our application may also set cookies. We recommend reviewing the privacy policies of these services for more information about their data collection practices.",
    },
    {
      label: "Licenses",
      date: "Open source licenses",
      body: "Robinhood Wallet incorporates several open-source software components. We are grateful to the open-source community for making these tools available. Below is a summary of the major open-source licenses used in this application.\n\nThis application uses React and React Native, licensed under the MIT License. Cryptographic operations are performed using widely-audited open-source libraries including tweetnacl and noble-curves, also under the MIT License. Network communication utilizes axios and other standard HTTP libraries.\n\nFull license texts for all open-source dependencies are available in the application bundle. If you have questions about our use of open-source software or would like to report a licensing concern, please contact our development team at developers@robinhood.com.",
    },
  ];

  const activeDoc = docs.find((d) => d.label === selectedDoc);

  if (activeDoc) {
    return (
      <motion.div {...pageTransition} className="fixed inset-0 bg-black z-50 flex flex-col">
        <PageHeader title={activeDoc.label} onClose={() => setSelectedDoc(null)} testId="terms-detail" />
        <div className="flex-1 overflow-y-auto px-6 pt-2" data-testid="view-terms-detail">
          <p className="text-[#8E8E93] text-xs mb-4">{activeDoc.date}</p>
          {activeDoc.body.split("\n\n").map((para, i) => (
            <p key={i} className="text-[#8E8E93] text-sm leading-relaxed mb-4">{para}</p>
          ))}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div {...pageTransition} className="fixed inset-0 bg-black z-50 flex flex-col">
      <PageHeader title="Terms & Privacy" onClose={onClose} testId="terms" />
      <div className="flex-1 overflow-y-auto px-6 pt-4 space-y-4">
        {docs.map((item) => (
          <button
            key={item.label}
            data-testid={`button-terms-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
            className="w-full flex items-center gap-4 p-4 bg-[#1c1c1e] rounded-2xl text-left"
            onClick={() => setSelectedDoc(item.label)}
          >
            <div className="flex-1">
              <p className="text-white text-[15px] font-medium">{item.label}</p>
              <p className="text-[#8E8E93] text-[13px]">{item.date}</p>
            </div>
            <ExternalLink className="w-4 h-4 text-[#48484A]" />
          </button>
        ))}

        <div className="pt-4 pb-8">
          <p className="text-[#666] text-xs leading-relaxed">
            Self-custody cryptocurrency wallet and related services are offered through Robinhood Non-Custodial, Ltd. (NMLS ID: 123456789). Robinhood Non-Custodial, Ltd. is a limited company incorporated in the United States.
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export function DevelopersScreen({ onClose }: PageProps) {
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  const devContent: Record<string, { title: string; content: string }> = {
    "API Documentation": {
      title: "API Documentation",
      content: "Base URL: https://api.robinhood.com/wallet/v1\n\nEndpoints:\n\nGET /account/balance\nReturns the current wallet balance for all tokens.\n\nGET /account/transactions\nReturns a paginated list of recent transactions.\n\nPOST /transfers/send\nInitiate a token transfer. Requires amount, recipient, and token parameters.\n\nGET /market/prices?symbols=BTC,ETH,SOL\nReturns current market prices for specified tokens.\n\nAll endpoints require authentication via Bearer token in the Authorization header. Rate limits: 100 requests per minute.",
    },
    "SDK": {
      title: "SDK Installation",
      content: "JavaScript / TypeScript:\n\nnpm install @robinhood/wallet-sdk\n\nimport { RobinhoodWallet } from '@robinhood/wallet-sdk';\nconst wallet = new RobinhoodWallet({ apiKey: 'your-api-key' });\nconst balance = await wallet.getBalance();\n\nPython:\n\npip install robinhood-wallet\n\nfrom robinhood_wallet import WalletClient\nclient = WalletClient(api_key='your-api-key')\nbalance = client.get_balance()\n\nBoth SDKs support TypeScript/Python type hints, automatic retry logic, and WebSocket connections for real-time updates.",
    },
    "Webhooks": {
      title: "Webhook Setup",
      content: "Webhooks allow you to receive real-time notifications for wallet events.\n\nSupported Events:\n- transaction.confirmed: Fires when a transaction is confirmed on-chain\n- transaction.pending: Fires when a new transaction is detected\n- balance.changed: Fires when your wallet balance changes\n- swap.completed: Fires when a token swap is finalized\n\nSetup:\n1. Navigate to Dashboard > Webhooks\n2. Add your endpoint URL (must be HTTPS)\n3. Select events to subscribe to\n4. Copy your webhook signing secret\n\nAll webhook payloads include an HMAC-SHA256 signature in the X-Webhook-Signature header for verification.",
    },
    "GitHub": {
      title: "GitHub Repositories",
      content: "Open Source Repositories:\n\ngithub.com/robinhood/wallet-sdk\nOfficial JavaScript/TypeScript SDK for Robinhood Wallet integration. MIT License.\n\ngithub.com/robinhood/wallet-sdk-python\nOfficial Python SDK. Supports Python 3.8+. MIT License.\n\ngithub.com/robinhood/wallet-examples\nExample applications and integration guides for various frameworks including React, Next.js, and Express.\n\ngithub.com/robinhood/wallet-contracts\nSmart contract source code for swap aggregator and bridge contracts. Audited by Trail of Bits.\n\nContributions welcome! Please see CONTRIBUTING.md in each repository for guidelines.",
    },
  };

  if (selectedItem && devContent[selectedItem]) {
    const item = devContent[selectedItem];
    return (
      <motion.div {...pageTransition} className="fixed inset-0 bg-black z-50 flex flex-col">
        <PageHeader title={item.title} onClose={() => setSelectedItem(null)} testId="dev-detail" />
        <div className="flex-1 overflow-y-auto px-6 pt-2" data-testid="view-dev-detail">
          {item.content.split("\n\n").map((block, i) => (
            <div key={i} className="mb-4">
              {block.split("\n").map((line, j) => (
                <p key={j} className={`text-sm leading-relaxed mb-1 ${line.startsWith("GET ") || line.startsWith("POST ") || line.startsWith("npm ") || line.startsWith("pip ") || line.startsWith("import ") || line.startsWith("from ") || line.startsWith("const ") || line.startsWith("github.com") ? "text-[#30D158] font-mono text-xs" : "text-[#8E8E93]"}`}>
                  {line}
                </p>
              ))}
            </div>
          ))}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div {...pageTransition} className="fixed inset-0 bg-black z-50 flex flex-col">
      <PageHeader title="Developers" onClose={onClose} testId="developers" />
      <div className="flex-1 px-6 pt-4 space-y-4">
        <p className="text-[#8E8E93] text-sm leading-relaxed">
          Build on Robinhood Wallet with our developer tools and APIs.
        </p>
        {[
          { label: "API Documentation", desc: "RESTful APIs for wallet integration" },
          { label: "SDK", desc: "JavaScript and Python SDKs" },
          { label: "Webhooks", desc: "Real-time transaction notifications" },
          { label: "GitHub", desc: "Open source repositories" },
        ].map((item) => (
          <button
            key={item.label}
            data-testid={`button-dev-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
            className="w-full flex items-center gap-4 p-4 bg-[#1c1c1e] rounded-2xl text-left"
            onClick={() => setSelectedItem(item.label)}
          >
            <div className="flex-1">
              <p className="text-white text-[15px] font-medium">{item.label}</p>
              <p className="text-[#8E8E93] text-[13px]">{item.desc}</p>
            </div>
            <ExternalLink className="w-4 h-4 text-[#48484A]" />
          </button>
        ))}
      </div>
    </motion.div>
  );
}

export function RemoveWalletScreen({ onClose, onConfirm }: PageProps & { onConfirm: () => void }) {
  const [confirmText, setConfirmText] = useState("");

  return (
    <motion.div {...pageTransition} className="fixed inset-0 bg-black z-50 flex flex-col">
      <PageHeader title="Remove Wallet" onClose={onClose} testId="remove" />
      <div className="flex-1 px-6 pt-4">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-[#3a1c1c] rounded-full flex items-center justify-center mb-4">
            <Trash2 className="w-8 h-8 text-[#FF453A]" />
          </div>
          <h3 className="text-white text-xl font-bold mb-2">Are you sure?</h3>
          <p className="text-[#8E8E93] text-sm text-center leading-relaxed">
            Removing your wallet will delete all data from this device. Make sure you have your recovery phrase backed up before proceeding.
          </p>
        </div>

        <div className="bg-[#1c1c1e] rounded-2xl p-4 mb-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-[#FF453A] flex-shrink-0 mt-0.5" />
            <p className="text-[#8E8E93] text-xs leading-relaxed">
              Without your recovery phrase, you will permanently lose access to your funds. This action cannot be undone.
            </p>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-[#8E8E93] text-xs mb-2">Type "REMOVE" to confirm</p>
          <input
            data-testid="input-confirm-remove"
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="REMOVE"
            className="w-full bg-[#1c1c1e] rounded-2xl p-4 text-white text-base placeholder:text-[#48484A] outline-none"
          />
        </div>

        <button
          data-testid="button-confirm-remove"
          disabled={confirmText !== "REMOVE"}
          onClick={onConfirm}
          className={`w-full py-4 rounded-full text-base font-semibold transition-colors ${
            confirmText === "REMOVE"
              ? "bg-[#FF453A] text-white"
              : "bg-[#2c2c2e] text-[#48484A]"
          }`}
        >
          Remove Wallet
        </button>
      </div>
    </motion.div>
  );
}

export function DepositFromRobinhoodScreen({ onClose }: PageProps) {
  const [linkState, setLinkState] = useState<"idle" | "loading" | "done">("idle");

  const handleLink = () => {
    setLinkState("loading");
    setTimeout(() => setLinkState("done"), 2000);
  };

  return (
    <motion.div {...pageTransition} className="fixed inset-0 bg-black z-50 flex flex-col">
      <PageHeader title="Deposit from Robinhood" onClose={onClose} testId="deposit-rh" />
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        {linkState === "loading" ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center">
            <Loader2 className="w-12 h-12 text-[#30D158] animate-spin mb-6" data-testid="icon-loading-spinner" />
            <p className="text-white text-lg font-semibold" data-testid="text-linking">Linking account...</p>
            <p className="text-[#8E8E93] text-sm mt-2">Please wait while we connect</p>
          </motion.div>
        ) : linkState === "done" ? (
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center w-full">
            <div className="w-16 h-16 bg-[#0A3D2E] rounded-full flex items-center justify-center mb-6">
              <Check className="w-8 h-8 text-[#30D158]" />
            </div>
            <h3 className="text-white text-xl font-bold mb-3 text-center" data-testid="text-connection-pending">
              Connection Pending
            </h3>
            <p className="text-[#8E8E93] text-sm text-center leading-relaxed mb-8">
              We'll notify you when your Robinhood account is ready to transfer crypto to your wallet.
            </p>
            <button
              data-testid="button-link-done"
              onClick={onClose}
              className="w-full py-4 bg-[#30D158] text-black rounded-full text-base font-semibold"
            >
              Done
            </button>
          </motion.div>
        ) : (
          <>
            <div className="w-16 h-16 bg-[#0A3D2E] rounded-full flex items-center justify-center mb-6">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#30D158" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h3 className="text-white text-xl font-bold mb-3 text-center" data-testid="text-deposit-rh-title">
              Transfer from Robinhood
            </h3>
            <p className="text-[#8E8E93] text-sm text-center leading-relaxed mb-8">
              Link your Robinhood brokerage account to transfer crypto directly to your self-custody wallet.
            </p>
            <button
              data-testid="button-link-robinhood"
              className="w-full py-4 bg-[#30D158] text-black rounded-full text-base font-semibold"
              onClick={handleLink}
            >
              Link Robinhood Account
            </button>
            <p className="text-[#666] text-xs text-center mt-4 leading-relaxed">
              You'll be redirected to Robinhood to authorize the connection.
            </p>
          </>
        )}
      </div>
    </motion.div>
  );
}

export function DiscoverScreen({ onClose }: PageProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = [
    { name: "DeFi", count: "2,400+ tokens" },
    { name: "NFTs", count: "Coming soon" },
    { name: "Gaming", count: "180+ tokens" },
    { name: "Layer 2", count: "45+ tokens" },
    { name: "Memecoins", count: "500+ tokens" },
    { name: "Stablecoins", count: "12 tokens" },
  ];

  const categoryTokens: Record<string, { name: string; symbol: string; price: string; change: string }[]> = {
    DeFi: [
      { name: "Uniswap", symbol: "UNI", price: "$12.45", change: "+3.2%" },
      { name: "Aave", symbol: "AAVE", price: "$285.30", change: "+1.8%" },
      { name: "Compound", symbol: "COMP", price: "$78.90", change: "-0.5%" },
      { name: "MakerDAO", symbol: "MKR", price: "$2,150.00", change: "+4.1%" },
      { name: "Curve", symbol: "CRV", price: "$0.85", change: "-1.2%" },
    ],
    NFTs: [
      { name: "ApeCoin", symbol: "APE", price: "$2.15", change: "+5.3%" },
      { name: "Blur", symbol: "BLUR", price: "$0.42", change: "-2.1%" },
      { name: "Immutable X", symbol: "IMX", price: "$1.89", change: "+0.8%" },
      { name: "SuperRare", symbol: "RARE", price: "$0.12", change: "+12.4%" },
    ],
    Gaming: [
      { name: "Axie Infinity", symbol: "AXS", price: "$9.75", change: "+2.1%" },
      { name: "The Sandbox", symbol: "SAND", price: "$0.58", change: "-0.3%" },
      { name: "Gala", symbol: "GALA", price: "$0.04", change: "+7.5%" },
      { name: "Illuvium", symbol: "ILV", price: "$105.20", change: "+1.9%" },
      { name: "Star Atlas", symbol: "ATLAS", price: "$0.005", change: "+15.2%" },
    ],
    "Layer 2": [
      { name: "Polygon", symbol: "MATIC", price: "$0.92", change: "+1.4%" },
      { name: "Arbitrum", symbol: "ARB", price: "$1.35", change: "+2.7%" },
      { name: "Optimism", symbol: "OP", price: "$2.85", change: "-0.9%" },
      { name: "zkSync", symbol: "ZK", price: "$0.18", change: "+3.8%" },
      { name: "StarkNet", symbol: "STRK", price: "$0.95", change: "+0.6%" },
    ],
    Memecoins: [
      { name: "Dogecoin", symbol: "DOGE", price: "$0.15", change: "+8.2%" },
      { name: "Shiba Inu", symbol: "SHIB", price: "$0.000028", change: "+5.1%" },
      { name: "Pepe", symbol: "PEPE", price: "$0.0000018", change: "+22.3%" },
      { name: "Bonk", symbol: "BONK", price: "$0.000032", change: "+11.7%" },
      { name: "Floki", symbol: "FLOKI", price: "$0.00025", change: "+3.4%" },
      { name: "dogwifhat", symbol: "WIF", price: "$0.82", change: "+9.8%" },
    ],
    Stablecoins: [
      { name: "Tether", symbol: "USDT", price: "$1.00", change: "0.0%" },
      { name: "USD Coin", symbol: "USDC", price: "$1.00", change: "0.0%" },
      { name: "Dai", symbol: "DAI", price: "$1.00", change: "+0.01%" },
      { name: "PYUSD", symbol: "PYUSD", price: "$1.00", change: "0.0%" },
    ],
  };

  if (selectedCategory && categoryTokens[selectedCategory]) {
    const tokens = categoryTokens[selectedCategory];
    return (
      <motion.div {...pageTransition} className="fixed inset-0 bg-black z-50 flex flex-col">
        <PageHeader title={selectedCategory} onClose={() => setSelectedCategory(null)} testId="discover-category" />
        <div className="flex-1 overflow-y-auto px-4 space-y-2" data-testid="view-category-tokens">
          {tokens.map((token) => (
            <div
              key={token.symbol}
              data-testid={`row-token-${token.symbol.toLowerCase()}`}
              className="flex items-center gap-4 p-4 bg-[#1c1c1e] rounded-2xl"
            >
              <div className="w-10 h-10 bg-[#2c2c2e] rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">{token.symbol.slice(0, 2)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-[15px] font-medium">{token.name}</p>
                <p className="text-[#8E8E93] text-[13px]">{token.symbol}</p>
              </div>
              <div className="text-right">
                <p className="text-white text-[15px] font-medium">{token.price}</p>
                <p className={`text-[13px] ${token.change.startsWith("+") ? "text-[#30D158]" : token.change.startsWith("-") ? "text-[#FF453A]" : "text-[#8E8E93]"}`}>
                  {token.change}
                </p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div {...pageTransition} className="fixed inset-0 bg-black z-50 flex flex-col">
      <PageHeader title="Discover" onClose={onClose} testId="discover" />
      <div className="flex-1 overflow-y-auto px-4 space-y-3">
        <p className="text-[#8E8E93] text-sm px-2 mb-2">Explore the crypto ecosystem</p>
        {categories.map((cat) => (
          <button
            key={cat.name}
            data-testid={`button-discover-${cat.name.toLowerCase()}`}
            className="w-full flex items-center gap-4 p-4 bg-[#1c1c1e] rounded-2xl text-left"
            onClick={() => setSelectedCategory(cat.name)}
          >
            <div className="flex-1">
              <p className="text-white text-[15px] font-medium">{cat.name}</p>
              <p className="text-[#8E8E93] text-[13px]">{cat.count}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-[#48484A]" />
          </button>
        ))}
      </div>
    </motion.div>
  );
}

export function FullDisclosureScreen({ onClose }: PageProps) {
  return (
    <motion.div {...pageTransition} className="fixed inset-0 bg-black z-50 flex flex-col">
      <PageHeader title="Full Disclosure" onClose={onClose} testId="disclosure" />
      <div className="flex-1 overflow-y-auto px-6 pt-4">
        <div className="space-y-4 text-[#8E8E93] text-sm leading-relaxed">
          <p>
            Self-custody cryptocurrency wallet and related services are offered through Robinhood Non-Custodial, Ltd. ("RNC"), a limited company.
          </p>
          <p>
            Cryptocurrency is not insured by any federal agency. The value of cryptocurrency may go up or down and you may lose money. Cryptocurrency trading is subject to a high degree of risk and may not be suitable for all investors.
          </p>
          <p>
            RNC is not a member of FINRA or SIPC. Cryptocurrencies held in the Robinhood Wallet are not securities and are not covered by SIPC.
          </p>
          <p>
            RNC does not provide investment, tax, or legal advice. Please consult with qualified professionals before making any financial decisions.
          </p>
          <p>
            Market data displayed is for informational purposes only and may be delayed. Past performance is not indicative of future results.
          </p>
          <p>
            By using Robinhood Wallet, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
        <div className="py-8">
          <p className="text-[#48484A] text-xs text-center">
            &copy; 2026 Robinhood Non-Custodial, Ltd. All rights reserved.
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export function Web3BrowserScreen({ onClose }: PageProps) {
  const [url, setUrl] = useState("");
  const dapps = [
    { name: "Uniswap", desc: "Decentralized exchange", logo: "https://assets.coingecko.com/coins/images/12504/large/uni.jpg", color: "#FF007A" },
    { name: "OpenSea", desc: "NFT marketplace", logo: "https://storage.googleapis.com/opensea-static/Logomark/Logomark-Blue.png", color: "#2081E2" },
    { name: "Aave", desc: "Lending & borrowing", logo: "https://assets.coingecko.com/coins/images/12645/large/AAVE.png", color: "#B6509E" },
    { name: "Raydium", desc: "Solana AMM", logo: "https://assets.coingecko.com/coins/images/13928/large/PSigc4ie_400x400.jpg", color: "#00FFA3" },
    { name: "Jupiter", desc: "Solana DEX aggregator", logo: "https://static.jup.ag/jup/icon.png", color: "#FFC107" },
    { name: "Magic Eden", desc: "NFT marketplace", logo: "https://assets.coingecko.com/coins/images/27913/large/magic_eden.png", color: "#E42575" },
  ];
  const [selectedDapp, setSelectedDapp] = useState<string | null>(null);

  if (selectedDapp) {
    const dapp = dapps.find(d => d.name === selectedDapp);
    return (
      <motion.div {...pageTransition} className="fixed inset-0 bg-black z-50 flex flex-col">
        <div className="flex items-center justify-between px-4 py-4">
          <button data-testid="button-back-dapp" onClick={() => setSelectedDapp(null)} className="p-2">
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <h2 className="text-white font-semibold text-base" data-testid="text-dapp-title">{selectedDapp}</h2>
          <div className="w-10" />
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-6">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center overflow-hidden mb-6"
            style={{ backgroundColor: dapp?.color + "20" }}
          >
            <img src={dapp?.logo} alt={dapp?.name} className="w-14 h-14 object-contain" />
          </div>
          <h3 className="text-white text-xl font-bold mb-2">{dapp?.name}</h3>
          <p className="text-[#8E8E93] text-sm text-center mb-6">{dapp?.desc}</p>
          <div className="bg-[#1c1c1e] rounded-2xl p-4 w-full mb-6">
            <p className="text-[#8E8E93] text-sm text-center leading-relaxed">
              Connect your wallet to interact with {dapp?.name}. Your self-custody wallet will be used to sign transactions securely.
            </p>
          </div>
          <button
            data-testid="button-connect-dapp"
            onClick={() => setSelectedDapp(null)}
            className="w-full py-4 bg-[#30D158] text-black rounded-full text-base font-semibold active:bg-[#28b34d]"
          >
            Connect Wallet
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div {...pageTransition} className="fixed inset-0 bg-black z-50 flex flex-col">
      <PageHeader title="Web3 Browser" onClose={onClose} testId="web3" />
      <div className="px-4 mb-4">
        <div className="flex items-center gap-3 bg-[#1c1c1e] rounded-full px-4 py-3">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12,2 A15,15 0 0 1 12,22 A15,15 0 0 1 12,2"/></svg>
          <input
            data-testid="input-web3-url"
            type="text"
            placeholder="Search or enter dApp URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="bg-transparent text-white text-sm placeholder:text-[#888] outline-none flex-1"
          />
        </div>
      </div>
      <div className="px-4">
        <p className="text-[#8E8E93] text-xs font-medium mb-3 px-1">POPULAR DAPPS</p>
      </div>
      <div className="flex-1 overflow-y-auto px-4 space-y-2">
        {dapps.map((dapp) => (
          <button
            key={dapp.name}
            data-testid={`button-dapp-${dapp.name.toLowerCase().replace(/\s+/g, "-")}`}
            onClick={() => setSelectedDapp(dapp.name)}
            className="w-full flex items-center gap-4 p-4 bg-[#1c1c1e] rounded-2xl text-left active:bg-[#2c2c2e] transition-colors"
          >
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden"
              style={{ backgroundColor: dapp.color + "20" }}
            >
              <img src={dapp.logo} alt={dapp.name} className="w-7 h-7 object-contain" />
            </div>
            <div className="flex-1">
              <p className="text-white text-[15px] font-medium">{dapp.name}</p>
              <p className="text-[#8E8E93] text-[13px]">{dapp.desc}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-[#48484A]" />
          </button>
        ))}
      </div>
    </motion.div>
  );
}
