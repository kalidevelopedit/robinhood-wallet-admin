import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search, Info, Sparkles } from "lucide-react";
import type { CryptoToken } from "@shared/schema";

const networks = ["Solana", "Ethereum", "Base", "BSC"];

interface SwapSelectScreenProps {
  tokens: CryptoToken[];
  onClose: () => void;
  onSelect: (token: CryptoToken) => void;
}

export function SwapSelectScreen({ tokens, onClose, onSelect }: SwapSelectScreenProps) {
  const [search, setSearch] = useState("");
  const [selectedNetwork, setSelectedNetwork] = useState("Solana");

  const filtered = tokens.filter(
    (t) =>
      (t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.symbol.toLowerCase().includes(search.toLowerCase())) &&
      t.network === selectedNetwork
  );

  return (
    <motion.div
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ type: "spring", damping: 30, stiffness: 300 }}
      className="fixed inset-0 bg-black z-[60] flex flex-col"
    >
      <div className="flex items-center justify-between px-4 py-4">
        <button data-testid="button-close-swap-select" onClick={onClose} className="p-2">
          <X className="w-6 h-6 text-white" />
        </button>
        <h2 className="text-white font-semibold text-base" data-testid="text-swap-select-title">
          Swap to...
        </h2>
        <button data-testid="button-swap-info" onClick={onClose} className="p-2">
          <Info className="w-5 h-5 text-white" />
        </button>
      </div>

      <div className="px-4 mb-4">
        <div className="flex items-center gap-3 bg-[#1c1c1e] rounded-full px-4 py-3">
          <Search className="w-5 h-5 text-[#888]" />
          <input
            data-testid="input-search-swap"
            type="text"
            placeholder="Search by name or address"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-white text-base placeholder:text-[#888] outline-none flex-1"
          />
        </div>
      </div>

      <div className="flex gap-2 px-4 mb-4 overflow-x-auto scrollbar-hide">
        {networks.map((network) => (
          <button
            key={network}
            data-testid={`button-network-${network}`}
            onClick={() => setSelectedNetwork(network)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              selectedNetwork === network
                ? "bg-white text-black"
                : "bg-[#1c1c1e] text-white"
            }`}
          >
            <div
              className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold"
              style={{
                backgroundColor:
                  network === "Solana" ? "#00ffa320" :
                  network === "Ethereum" ? "#627eea20" :
                  network === "Base" ? "#0052ff20" :
                  "#f3ba2f20",
                color:
                  selectedNetwork === network ? "#000" :
                  network === "Solana" ? "#00ffa3" :
                  network === "Ethereum" ? "#627eea" :
                  network === "Base" ? "#0052ff" :
                  "#f3ba2f",
              }}
            >
              {network[0]}
            </div>
            {network}
          </button>
        ))}
      </div>

      <div className="mx-4 mb-4 bg-[#1c1c1e] rounded-xl p-4 flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
        <p className="text-[#BDBDBD] text-sm leading-relaxed">
          Get your Solana network fees covered through 2026.{" "}
          <button onClick={onClose} className="text-white underline font-medium" data-testid="link-get-started-fees">Get started</button>
        </p>
      </div>

      <div className="flex-1 overflow-y-auto">
        <AnimatePresence>
          {filtered.map((token, i) => (
            <motion.button
              key={token.id}
              data-testid={`button-select-${token.symbol}`}
              onClick={() => onSelect(token)}
              className="flex items-center justify-between w-full px-6 py-4 text-left"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <div className="flex items-center gap-4">
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
                <span className="text-white text-base font-medium">{token.name}</span>
              </div>
              {token.marketCap && (
                <span className="text-[#888] text-sm">{token.marketCap}</span>
              )}
            </motion.button>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
