import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronDown, Check, AlertCircle, Building2, Wallet2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface PriceData {
  holdings: {
    id: string;
    symbol: string;
    name: string;
    iconUrl: string | null;
    iconColor: string;
    price: number;
    balanceUsd: number;
    changePercent: number;
    balance: number;
  }[];
  totalBalance: number;
  dailyChangePercent: number;
  dailyChange: number;
  interestBalance: number;
}

type WithdrawStep = "choose-method" | "wallet-form" | "bank-form" | "wallet-blocked" | "bank-pending";

const NETWORKS = ["Solana", "Ethereum", "Base", "BSC"];

const COIN_NETWORK_MAP: Record<string, string> = {
  BTC: "Bitcoin",
  ETH: "Ethereum",
  SOL: "Solana",
  XRP: "XRP Ledger",
  USDC: "Ethereum",
  USDT: "Ethereum",
  DOGE: "Dogecoin",
  LINK: "Ethereum",
  BNB: "BSC",
  LTC: "Litecoin",
};

interface WithdrawScreenProps {
  onClose: () => void;
  userId?: string | null;
}

export function WithdrawScreen({ onClose, userId }: WithdrawScreenProps) {
  const [step, setStep] = useState<WithdrawStep>("choose-method");
  const [walletAddress, setWalletAddress] = useState("");
  const [walletAmount, setWalletAmount] = useState("");
  const [selectedCoin, setSelectedCoin] = useState("BTC");
  const [selectedNetwork, setSelectedNetwork] = useState("Bitcoin");
  const [showCoinPicker, setShowCoinPicker] = useState(false);
  const [showNetworkPicker, setShowNetworkPicker] = useState(false);

  const [bankName, setBankName] = useState("");
  const [bankAccountNumber, setBankAccountNumber] = useState("");
  const [bankRoutingNumber, setBankRoutingNumber] = useState("");
  const [bankAmount, setBankAmount] = useState("");
  const [submittingBank, setSubmittingBank] = useState(false);

  const { data: priceData } = useQuery<PriceData>({
    queryKey: ["/api/prices"],
  });

  const holdings = priceData?.holdings ?? [];
  const selectedHolding = holdings.find(h => h.symbol === selectedCoin);

  useEffect(() => {
    if (holdings.length > 0 && !holdings.find(h => h.symbol === selectedCoin)) {
      const first = holdings[0];
      setSelectedCoin(first.symbol);
      setSelectedNetwork(COIN_NETWORK_MAP[first.symbol] || "Ethereum");
    }
  }, [holdings]);

  const handleSelectCoin = (symbol: string) => {
    setSelectedCoin(symbol);
    setSelectedNetwork(COIN_NETWORK_MAP[symbol] || "Ethereum");
    setShowCoinPicker(false);
  };

  const handleBankSubmit = async () => {
    if (!userId) return;
    setSubmittingBank(true);
    try {
      await apiRequest("POST", `/api/users/${userId}/transactions`, {
        type: "bank_transfer_withdrawal",
        asset: "USD",
        amount: parseFloat(bankAmount) || 0,
        amountUsd: parseFloat(bankAmount) || 0,
        status: "pending",
        description: `Bank transfer to ${bankName}`,
        metadata: JSON.stringify({
          accountHolderName: bankName,
          accountNumber: bankAccountNumber,
          routingNumber: bankRoutingNumber,
        }),
      });
    } catch {
    } finally {
      setSubmittingBank(false);
      setStep("bank-pending");
    }
  };

  return (
    <motion.div
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
      className="fixed inset-0 bg-black z-50 flex flex-col"
    >
      <AnimatePresence mode="wait">
        {step === "choose-method" && (
          <ChooseWithdrawMethod
            key="choose-method"
            onClose={onClose}
            onChooseWallet={() => setStep("wallet-form")}
            onChooseBank={() => setStep("bank-form")}
          />
        )}

        {step === "wallet-form" && (
          <WalletWithdrawForm
            key="wallet-form"
            walletAddress={walletAddress}
            onAddressChange={setWalletAddress}
            walletAmount={walletAmount}
            onAmountChange={setWalletAmount}
            selectedCoin={selectedCoin}
            selectedNetwork={selectedNetwork}
            holdings={holdings}
            selectedHolding={selectedHolding}
            showCoinPicker={showCoinPicker}
            setShowCoinPicker={setShowCoinPicker}
            showNetworkPicker={showNetworkPicker}
            setShowNetworkPicker={setShowNetworkPicker}
            onSelectCoin={handleSelectCoin}
            onSelectNetwork={(n) => { setSelectedNetwork(n); setShowNetworkPicker(false); }}
            onClose={() => setStep("choose-method")}
            onSubmit={() => setStep("wallet-blocked")}
          />
        )}

        {step === "bank-form" && (
          <BankTransferForm
            key="bank-form"
            bankName={bankName}
            onBankNameChange={setBankName}
            bankAccountNumber={bankAccountNumber}
            onAccountNumberChange={setBankAccountNumber}
            bankRoutingNumber={bankRoutingNumber}
            onRoutingNumberChange={setBankRoutingNumber}
            bankAmount={bankAmount}
            onAmountChange={setBankAmount}
            onClose={() => setStep("choose-method")}
            onSubmit={handleBankSubmit}
            submitting={submittingBank}
          />
        )}

        {step === "wallet-blocked" && (
          <WalletBlocked
            key="wallet-blocked"
            onClose={onClose}
          />
        )}

        {step === "bank-pending" && (
          <BankTransferPending
            key="bank-pending"
            bankName={bankName}
            amount={bankAmount}
            onClose={onClose}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function ChooseWithdrawMethod({
  onClose,
  onChooseWallet,
  onChooseBank,
}: {
  onClose: () => void;
  onChooseWallet: () => void;
  onChooseBank: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col h-full"
    >
      <div className="flex items-center justify-between px-4 pt-4 pb-4">
        <button onClick={onClose} className="p-2">
          <X className="w-6 h-6 text-white" />
        </button>
        <h1 className="text-lg font-semibold text-white">Withdraw</h1>
        <div className="w-10" />
      </div>

      <div className="flex-1 px-4 pt-6 space-y-4">
        <p className="text-[#8E8E93] text-sm text-center mb-6">Choose how you'd like to withdraw</p>

        <button
          data-testid="button-choose-wallet"
          onClick={onChooseWallet}
          className="w-full flex items-center gap-4 p-5 bg-[#1c1c1e] rounded-2xl text-left active:bg-[#2c2c2e] transition-colors"
        >
          <div className="w-12 h-12 bg-[#0A84FF]/20 rounded-2xl flex items-center justify-center flex-shrink-0">
            <Wallet2 className="w-6 h-6 text-[#0A84FF]" />
          </div>
          <div>
            <p className="text-white font-semibold text-base">Crypto Wallet</p>
            <p className="text-[#8E8E93] text-sm mt-0.5">Send to an external wallet address</p>
          </div>
        </button>

        <button
          data-testid="button-choose-bank"
          onClick={onChooseBank}
          className="w-full flex items-center gap-4 p-5 bg-[#1c1c1e] rounded-2xl text-left active:bg-[#2c2c2e] transition-colors"
        >
          <div className="w-12 h-12 bg-[#30D158]/20 rounded-2xl flex items-center justify-center flex-shrink-0">
            <Building2 className="w-6 h-6 text-[#30D158]" />
          </div>
          <div>
            <p className="text-white font-semibold text-base">Bank Transfer</p>
            <p className="text-[#8E8E93] text-sm mt-0.5">Transfer funds to your bank account</p>
          </div>
        </button>
      </div>
    </motion.div>
  );
}

function BankTransferForm({
  bankName,
  onBankNameChange,
  bankAccountNumber,
  onAccountNumberChange,
  bankRoutingNumber,
  onRoutingNumberChange,
  bankAmount,
  onAmountChange,
  onClose,
  onSubmit,
  submitting,
}: {
  bankName: string;
  onBankNameChange: (v: string) => void;
  bankAccountNumber: string;
  onAccountNumberChange: (v: string) => void;
  bankRoutingNumber: string;
  onRoutingNumberChange: (v: string) => void;
  bankAmount: string;
  onAmountChange: (v: string) => void;
  onClose: () => void;
  onSubmit: () => void;
  submitting: boolean;
}) {
  const isValid =
    bankName.trim().length > 1 &&
    bankAccountNumber.trim().length >= 6 &&
    bankRoutingNumber.trim().length === 9 &&
    parseFloat(bankAmount) > 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col h-full"
    >
      <div className="flex items-center justify-between px-4 pt-4 pb-4">
        <button data-testid="button-bank-back" onClick={onClose} className="p-2">
          <X className="w-6 h-6 text-white" />
        </button>
        <h1 className="text-lg font-semibold text-white">Bank Transfer</h1>
        <div className="w-10" />
      </div>

      <div className="flex-1 overflow-y-auto px-4 space-y-4">
        <div>
          <label className="text-[#8E8E93] text-xs font-medium mb-2 block">Account Holder Name</label>
          <input
            data-testid="input-bank-name"
            type="text"
            value={bankName}
            onChange={(e) => onBankNameChange(e.target.value)}
            placeholder="Full name on account"
            className="w-full p-3 bg-[#1c1c1e] rounded-2xl text-white text-sm placeholder:text-[#48484A] outline-none"
          />
        </div>

        <div>
          <label className="text-[#8E8E93] text-xs font-medium mb-2 block">Account Number</label>
          <input
            data-testid="input-bank-account-number"
            type="text"
            inputMode="numeric"
            value={bankAccountNumber}
            onChange={(e) => onAccountNumberChange(e.target.value.replace(/\D/g, ""))}
            placeholder="Enter account number"
            className="w-full p-3 bg-[#1c1c1e] rounded-2xl text-white text-sm placeholder:text-[#48484A] outline-none font-mono tracking-wider"
          />
        </div>

        <div>
          <label className="text-[#8E8E93] text-xs font-medium mb-2 block">Routing Number</label>
          <input
            data-testid="input-bank-routing-number"
            type="text"
            inputMode="numeric"
            value={bankRoutingNumber}
            onChange={(e) => onRoutingNumberChange(e.target.value.replace(/\D/g, "").slice(0, 9))}
            placeholder="9-digit routing number"
            className="w-full p-3 bg-[#1c1c1e] rounded-2xl text-white text-sm placeholder:text-[#48484A] outline-none font-mono tracking-wider"
          />
          {bankRoutingNumber.length > 0 && bankRoutingNumber.length !== 9 && (
            <p className="text-[#FF453A] text-xs mt-1 px-1">Routing number must be 9 digits</p>
          )}
        </div>

        <div>
          <label className="text-[#8E8E93] text-xs font-medium mb-2 block">Amount (USD)</label>
          <div className="flex items-center gap-2 p-3 bg-[#1c1c1e] rounded-2xl">
            <span className="text-[#8E8E93] text-sm">$</span>
            <input
              data-testid="input-bank-amount"
              type="text"
              inputMode="decimal"
              value={bankAmount}
              onChange={(e) => onAmountChange(e.target.value)}
              placeholder="0.00"
              className="flex-1 bg-transparent text-white text-sm placeholder:text-[#48484A] outline-none"
            />
            <span className="text-[#8E8E93] text-sm">USD</span>
          </div>
        </div>

        <div className="bg-[#1c1c1e] rounded-2xl p-4">
          <p className="text-[#8E8E93] text-xs leading-relaxed">
            Bank transfers typically take <span className="text-white font-semibold">3-5 business days</span> to arrive. Funds will be debited immediately upon submission.
          </p>
        </div>
      </div>

      <div className="px-4 pb-8 pt-4">
        <button
          data-testid="button-submit-bank-transfer"
          disabled={!isValid || submitting}
          onClick={onSubmit}
          className={`w-full py-4 rounded-full text-base font-semibold transition-colors ${
            isValid && !submitting
              ? "bg-[#30D158] text-black active:bg-[#28b34d]"
              : "bg-[#2c2c2e] text-[#48484A]"
          }`}
        >
          {submitting ? "Submitting..." : "Submit Transfer"}
        </button>
      </div>
    </motion.div>
  );
}

function BankTransferPending({
  bankName,
  amount,
  onClose,
}: {
  bankName: string;
  amount: string;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col h-full items-center justify-center px-6"
    >
      <div className="w-20 h-20 bg-[#30D158]/20 rounded-full flex items-center justify-center mb-6">
        <Building2 className="w-10 h-10 text-[#30D158]" />
      </div>

      <h2 className="text-2xl font-bold text-white mb-3 text-center" data-testid="text-bank-pending-title">
        Transfer Submitted
      </h2>

      <div className="bg-[#1c1c1e] rounded-2xl p-5 mt-2 mb-4 w-full space-y-3">
        {amount && (
          <div className="flex justify-between">
            <span className="text-[#8E8E93] text-sm">Amount</span>
            <span className="text-white text-sm font-semibold">${parseFloat(amount).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
        )}
        {bankName && (
          <div className="flex justify-between">
            <span className="text-[#8E8E93] text-sm">Account Holder</span>
            <span className="text-white text-sm">{bankName}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-[#8E8E93] text-sm">Status</span>
          <span className="text-[#FF9F0A] text-sm font-semibold">Pending</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#8E8E93] text-sm">Estimated Arrival</span>
          <span className="text-white text-sm font-semibold">3-5 Business Days</span>
        </div>
      </div>

      <p className="text-[#8E8E93] text-sm text-center mb-8 leading-relaxed" data-testid="text-bank-pending-msg">
        Your bank transfer is being processed. It will appear in your activity and typically arrives within <span className="text-white font-semibold">3-5 business days</span>.
      </p>

      <button
        data-testid="button-bank-pending-done"
        onClick={onClose}
        className="w-full py-4 bg-[#2c2c2e] text-white rounded-full text-base font-semibold active:bg-[#3c3c3e]"
      >
        Done
      </button>
    </motion.div>
  );
}

function WalletWithdrawForm({
  walletAddress,
  onAddressChange,
  walletAmount,
  onAmountChange,
  selectedCoin,
  selectedNetwork,
  holdings,
  selectedHolding,
  showCoinPicker,
  setShowCoinPicker,
  showNetworkPicker,
  setShowNetworkPicker,
  onSelectCoin,
  onSelectNetwork,
  onClose,
  onSubmit,
}: {
  walletAddress: string;
  onAddressChange: (v: string) => void;
  walletAmount: string;
  onAmountChange: (v: string) => void;
  selectedCoin: string;
  selectedNetwork: string;
  holdings: PriceData["holdings"];
  selectedHolding: PriceData["holdings"][0] | undefined;
  showCoinPicker: boolean;
  setShowCoinPicker: (v: boolean) => void;
  showNetworkPicker: boolean;
  setShowNetworkPicker: (v: boolean) => void;
  onSelectCoin: (c: string) => void;
  onSelectNetwork: (n: string) => void;
  onClose: () => void;
  onSubmit: () => void;
}) {
  const maxBalance = selectedHolding?.balance ?? 0;
  const numAmount = parseFloat(walletAmount) || 0;
  const isValid = walletAddress.length > 10 && numAmount > 0 && numAmount <= maxBalance;

  const handleMax = () => {
    onAmountChange(maxBalance.toString());
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      onAddressChange(text);
    } catch {
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col h-full"
    >
      <div className="flex items-center justify-between px-4 pt-4 pb-4">
        <button data-testid="button-wallet-back" onClick={onClose} className="p-2">
          <X className="w-6 h-6 text-white" />
        </button>
        <h1 className="text-lg font-semibold text-white">Send to Wallet</h1>
        <div className="w-10" />
      </div>

      <div className="flex-1 overflow-y-auto px-4 space-y-4">
        <div>
          <label className="text-[#8E8E93] text-xs font-medium mb-2 block">Coin</label>
          <button
            data-testid="button-select-coin"
            onClick={() => setShowCoinPicker(!showCoinPicker)}
            className="w-full flex items-center gap-3 p-3 bg-[#1c1c1e] rounded-2xl"
          >
            {selectedHolding?.iconUrl ? (
              <img src={selectedHolding.iconUrl} alt={selectedCoin} className="w-8 h-8 rounded-full" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-[#333] flex items-center justify-center text-xs font-bold text-white">
                {selectedCoin.charAt(0)}
              </div>
            )}
            <span className="text-white font-medium flex-1 text-left">{selectedHolding?.name || selectedCoin}</span>
            <span className="text-[#8E8E93] text-sm mr-1">
              {maxBalance < 1 ? maxBalance.toFixed(6) : maxBalance.toLocaleString("en-US", { maximumFractionDigits: 2 })} {selectedCoin}
            </span>
            <ChevronDown className="w-4 h-4 text-[#48484A]" />
          </button>

          <AnimatePresence>
            {showCoinPicker && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="bg-[#1c1c1e] rounded-2xl mt-2 overflow-hidden">
                  {holdings.map(h => (
                    <button
                      key={h.id}
                      data-testid={`button-coin-${h.symbol}`}
                      onClick={() => onSelectCoin(h.symbol)}
                      className={`w-full flex items-center gap-3 p-3 active:bg-[#2c2c2e] ${h.symbol === selectedCoin ? "bg-[#2c2c2e]" : ""}`}
                    >
                      {h.iconUrl ? (
                        <img src={h.iconUrl} alt={h.symbol} className="w-7 h-7 rounded-full" />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-[#333] flex items-center justify-center text-xs font-bold text-white">
                          {h.symbol.charAt(0)}
                        </div>
                      )}
                      <span className="text-white text-sm font-medium flex-1 text-left">{h.name}</span>
                      <span className="text-[#8E8E93] text-xs">
                        {h.balance < 1 ? h.balance.toFixed(4) : h.balance.toLocaleString("en-US", { maximumFractionDigits: 2 })} {h.symbol}
                      </span>
                      {h.symbol === selectedCoin && <Check className="w-4 h-4 text-[#30D158] ml-1" />}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div>
          <label className="text-[#8E8E93] text-xs font-medium mb-2 block">Network</label>
          <button
            data-testid="button-select-network"
            onClick={() => setShowNetworkPicker(!showNetworkPicker)}
            className="w-full flex items-center gap-3 p-3 bg-[#1c1c1e] rounded-2xl"
          >
            <span className="text-white font-medium flex-1 text-left">{selectedNetwork}</span>
            <ChevronDown className="w-4 h-4 text-[#48484A]" />
          </button>

          <AnimatePresence>
            {showNetworkPicker && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="bg-[#1c1c1e] rounded-2xl mt-2 overflow-hidden">
                  {NETWORKS.map(n => (
                    <button
                      key={n}
                      data-testid={`button-network-${n}`}
                      onClick={() => onSelectNetwork(n)}
                      className={`w-full flex items-center gap-3 p-3 active:bg-[#2c2c2e] ${n === selectedNetwork ? "bg-[#2c2c2e]" : ""}`}
                    >
                      <span className="text-white text-sm font-medium flex-1 text-left">{n}</span>
                      {n === selectedNetwork && <Check className="w-4 h-4 text-[#30D158]" />}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div>
          <label className="text-[#8E8E93] text-xs font-medium mb-2 block">Wallet Address</label>
          <div className="flex items-center gap-2 p-3 bg-[#1c1c1e] rounded-2xl">
            <input
              data-testid="input-wallet-address"
              type="text"
              value={walletAddress}
              onChange={(e) => onAddressChange(e.target.value)}
              placeholder="Paste wallet address"
              className="flex-1 bg-transparent text-white text-sm placeholder:text-[#48484A] outline-none"
            />
            <button
              data-testid="button-paste-address"
              onClick={handlePaste}
              className="text-[#30D158] text-sm font-medium px-2 py-1"
            >
              Paste
            </button>
          </div>
        </div>

        <div>
          <label className="text-[#8E8E93] text-xs font-medium mb-2 block">Amount</label>
          <div className="flex items-center gap-2 p-3 bg-[#1c1c1e] rounded-2xl">
            <input
              data-testid="input-wallet-amount"
              type="text"
              inputMode="decimal"
              value={walletAmount}
              onChange={(e) => onAmountChange(e.target.value)}
              placeholder="0.00"
              className="flex-1 bg-transparent text-white text-sm placeholder:text-[#48484A] outline-none"
            />
            <span className="text-[#8E8E93] text-sm mr-2">{selectedCoin}</span>
            <button
              data-testid="button-max-amount"
              onClick={handleMax}
              className="text-[#30D158] text-sm font-medium px-2 py-1"
            >
              Max
            </button>
          </div>
          {selectedHolding && (
            <p className="text-[#8E8E93] text-xs mt-1 px-1">
              Available: {maxBalance < 1 ? maxBalance.toFixed(6) : maxBalance.toLocaleString("en-US", { maximumFractionDigits: 2 })} {selectedCoin}
              {" "}(${selectedHolding.balanceUsd.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })})
            </p>
          )}
        </div>
      </div>

      <div className="px-4 pb-8 pt-4">
        <button
          data-testid="button-submit-wallet-withdraw"
          disabled={!isValid}
          onClick={onSubmit}
          className={`w-full py-4 rounded-full text-base font-semibold transition-colors ${
            isValid
              ? "bg-[#30D158] text-black active:bg-[#28b34d]"
              : "bg-[#2c2c2e] text-[#48484A]"
          }`}
        >
          Withdraw
        </button>
      </div>
    </motion.div>
  );
}

function WalletBlocked({ onClose }: { onClose: () => void }) {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0, expired: false });

  useEffect(() => {
    const getImportTime = () => {
      try {
        const data = localStorage.getItem("rh_wallet_setup");
        if (data) {
          const parsed = JSON.parse(data);
          if (parsed.setupDate) return new Date(parsed.setupDate).getTime();
        }
      } catch {}
      return Date.now();
    };

    const importTime = getImportTime();
    const deadline = importTime + 48 * 60 * 60 * 1000;

    const tick = () => {
      const now = Date.now();
      const diff = deadline - now;
      if (diff <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0, expired: true });
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft({ hours, minutes, seconds, expired: false });
      }
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col h-full items-center justify-center px-6"
    >
      <AlertCircle className="w-16 h-16 text-[#FF453A] mb-6" />

      <h2 className="text-2xl font-bold text-white mb-3 text-center" data-testid="text-withdraw-disabled">
        Withdrawal Disabled
      </h2>

      <div className="bg-[#1c1c1e] rounded-2xl p-5 mt-2 mb-4 w-full">
        <p className="text-[#8E8E93] text-[14px] leading-relaxed text-center" data-testid="text-withdraw-blocked-msg">
          For security purposes, withdrawals are disabled for <span className="text-white font-semibold">48 hours</span> after importing to a new wallet.
        </p>
      </div>

      <div className="bg-[#1c1c1e] rounded-2xl p-5 mb-8 w-full flex flex-col items-center">
        <p className="text-[#636366] text-xs uppercase tracking-wider mb-3">Time Remaining</p>
        <div className="flex items-center gap-3" data-testid="text-countdown">
          <div className="flex flex-col items-center">
            <span className="text-white text-3xl font-bold font-mono">{pad(timeLeft.hours)}</span>
            <span className="text-[#636366] text-[10px] mt-1">HRS</span>
          </div>
          <span className="text-[#636366] text-2xl font-bold -mt-4">:</span>
          <div className="flex flex-col items-center">
            <span className="text-white text-3xl font-bold font-mono">{pad(timeLeft.minutes)}</span>
            <span className="text-[#636366] text-[10px] mt-1">MIN</span>
          </div>
          <span className="text-[#636366] text-2xl font-bold -mt-4">:</span>
          <div className="flex flex-col items-center">
            <span className="text-white text-3xl font-bold font-mono">{pad(timeLeft.seconds)}</span>
            <span className="text-[#636366] text-[10px] mt-1">SEC</span>
          </div>
        </div>
      </div>

      <button
        data-testid="button-blocked-done"
        onClick={onClose}
        className="w-full py-4 bg-[#2c2c2e] text-white rounded-full text-base font-semibold active:bg-[#3c3c3e]"
      >
        Go Back
      </button>
    </motion.div>
  );
}
