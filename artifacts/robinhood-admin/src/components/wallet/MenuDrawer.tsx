import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  RefreshCw,
  Zap,
  Clock,
  Lock,
  Settings,
  HelpCircle,
  MessageSquare,
  FileText,
  Code2,
  LogOut,
  ChevronRight,
  Copy,
  Check,
} from "lucide-react";

type MenuItemLabel = "Deposit from Robinhood" | "Activity" | "Backups & security" | "Settings" | "Help center" | "Contact us" | "Terms & Privacy Policy" | "Developers" | "Remove wallet";

export interface WalletAddressInfo {
  symbol: string;
  name: string;
  iconUrl: string;
  iconColor: string;
  address: string;
}

interface MenuDrawerProps {
  open: boolean;
  onClose: () => void;
  onDeposit: () => void;
  onSwap: () => void;
  onWithdraw: () => void;
  onMenuItem: (label: MenuItemLabel) => void;
  userAddresses?: WalletAddressInfo[];
}

const menuItems: { icon: typeof Zap; label: MenuItemLabel; alert?: boolean }[] = [
  { icon: Zap, label: "Deposit from Robinhood" },
  { icon: Clock, label: "Activity" },
  { icon: Lock, label: "Backups & security", alert: true },
  { icon: Settings, label: "Settings" },
  { icon: HelpCircle, label: "Help center" },
  { icon: MessageSquare, label: "Contact us" },
  { icon: FileText, label: "Terms & Privacy Policy" },
  { icon: Code2, label: "Developers" },
  { icon: LogOut, label: "Remove wallet" },
];

const COIN_ICONS: Record<string, string> = {
  BTC: "\u20BF",
  ETH: "\u25C6",
  SOL: "\u25C8",
  XRP: "\u2715",
  DOGE: "\u00D0",
  LTC: "\u0141",
  BNB: "\u25C7",
  USDC: "$",
  USDT: "$",
  LINK: "\u26D3",
};

function CopyableAddress({ addr }: { addr: WalletAddressInfo }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(addr.address).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const truncated = addr.address.length > 16
    ? `${addr.address.slice(0, 8)}...${addr.address.slice(-5)}`
    : addr.address;

  return (
    <button
      data-testid={`button-copy-${addr.symbol.toLowerCase()}-address`}
      onClick={handleCopy}
      className="flex items-center gap-2 py-1 w-full text-left active:opacity-70 transition-opacity"
    >
      <span style={{ color: addr.iconColor }} className="text-sm font-bold">
        {COIN_ICONS[addr.symbol] || addr.symbol.charAt(0)}
      </span>
      <span className="text-white text-sm font-medium">{addr.name}</span>
      <span className="text-[#888] text-sm flex-1 truncate">{truncated}</span>
      {copied ? (
        <Check className="w-3.5 h-3.5 text-[#30D158]" />
      ) : (
        <Copy className="w-3.5 h-3.5 text-[#555]" />
      )}
    </button>
  );
}

export function MenuDrawer({ open, onClose, onDeposit, onSwap, onWithdraw, onMenuItem, userAddresses }: MenuDrawerProps) {
  const addresses = userAddresses && userAddresses.length > 0
    ? userAddresses
    : [
        { symbol: "ETH", name: "Ethereum", iconUrl: "", iconColor: "#627eea", address: "0xa549d...5b7b4" },
        { symbol: "BTC", name: "Bitcoin", iconUrl: "", iconColor: "#f7931a", address: "bc1qw...t0gzd" },
        { symbol: "SOL", name: "Solana", iconUrl: "", iconColor: "#00ffa3", address: "HPZti...b59CV" },
      ];

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/60 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed top-0 left-0 bottom-0 w-[85%] max-w-[360px] bg-black z-50 flex flex-col"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
          >
            <div className="flex items-center justify-between p-6 pb-4">
              <h2 className="text-2xl font-bold text-white" data-testid="text-menu-title">My Wallet</h2>
              <button data-testid="button-menu-chevron" onClick={onClose}>
                <ChevronRight className="w-6 h-6 text-white" />
              </button>
            </div>

            <div className="px-6 pb-4">
              {addresses.map((addr) => (
                <CopyableAddress key={addr.symbol} addr={addr} />
              ))}
            </div>

            <div className="px-6 pb-6">
              <div className="flex gap-3">
                <button
                  data-testid="button-menu-deposit"
                  onClick={() => { onClose(); onDeposit(); }}
                  className="flex-1 flex flex-col items-center gap-2 py-4 border border-[#333] rounded-xl"
                >
                  <ArrowDownToLine className="w-5 h-5 text-white" />
                  <span className="text-white text-xs font-medium">Deposit</span>
                </button>
                <button
                  data-testid="button-menu-withdraw"
                  onClick={() => { onClose(); onWithdraw(); }}
                  className="flex-1 flex flex-col items-center gap-2 py-4 border border-[#333] rounded-xl"
                >
                  <ArrowUpFromLine className="w-5 h-5 text-white" />
                  <span className="text-white text-xs font-medium">Withdraw</span>
                </button>
                <button
                  data-testid="button-menu-swap"
                  onClick={() => { onClose(); onSwap(); }}
                  className="flex-1 flex flex-col items-center gap-2 py-4 border border-[#333] rounded-xl"
                >
                  <RefreshCw className="w-5 h-5 text-white" />
                  <span className="text-white text-xs font-medium">Swap</span>
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-2">
              {menuItems.map((item) => (
                <button
                  key={item.label}
                  data-testid={`button-menu-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
                  onClick={() => { onClose(); onMenuItem(item.label); }}
                  className="flex items-center gap-4 w-full px-4 py-4 text-left"
                >
                  <item.icon className="w-5 h-5 text-[#888]" />
                  <span className="text-white text-base flex-1">{item.label}</span>
                  {item.alert && (
                    <div className="w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center">
                      <span className="text-black text-xs font-bold">!</span>
                    </div>
                  )}
                </button>
              ))}
            </div>

            <div className="px-6 py-4">
              <p className="text-[#666] text-xs" data-testid="text-version">v2026.6.1 (99073)</p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
