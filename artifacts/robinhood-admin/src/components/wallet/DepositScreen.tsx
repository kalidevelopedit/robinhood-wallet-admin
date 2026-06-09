import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search } from "lucide-react";
import type { CryptoToken } from "@shared/schema";

interface DepositScreenProps {
  tokens: CryptoToken[];
  onClose: () => void;
  onSelectToken: (token: CryptoToken) => void;
}

export function DepositScreen({ tokens, onClose, onSelectToken }: DepositScreenProps) {
  const [search, setSearch] = useState("");

  const depositTokens = tokens.filter(
    (t, i, arr) => arr.findIndex(x => x.symbol === t.symbol) === i
  );

  const filtered = depositTokens.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.symbol.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ type: "spring", damping: 30, stiffness: 300 }}
      className="fixed inset-0 bg-black z-50 flex flex-col"
    >
      <div className="flex items-center justify-between px-4 py-4">
        <button data-testid="button-close-deposit" onClick={onClose} className="p-2">
          <X className="w-6 h-6 text-white" />
        </button>
        <h2 className="text-white font-semibold text-base" data-testid="text-deposit-title">
          Choose crypto to deposit
        </h2>
        <div className="w-10" />
      </div>

      <div className="px-4 mb-4">
        <div className="flex items-center gap-3 bg-[#1c1c1e] rounded-full px-4 py-3">
          <Search className="w-5 h-5 text-[#888]" />
          <input
            data-testid="input-search-crypto"
            type="text"
            placeholder="Search crypto"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-white text-base placeholder:text-[#888] outline-none flex-1"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <AnimatePresence>
          {filtered.map((token, i) => (
            <motion.button
              key={token.id}
              data-testid={`button-deposit-${token.symbol}`}
              onClick={() => onSelectToken(token)}
              className="flex items-center gap-4 w-full px-6 py-4 text-left"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              {token.iconUrl ? (
                <img src={token.iconUrl} alt={token.symbol} className="w-10 h-10 rounded-full" />
              ) : (
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
                  style={{ backgroundColor: token.iconColor + "20", color: token.iconColor }}
                >
                  {token.symbol[0]}
                </div>
              )}
              <div>
                <p className="text-white text-base font-medium">{token.name}</p>
                <p className="text-[#888] text-sm">{token.symbol}</p>
              </div>
            </motion.button>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
