import { motion } from "framer-motion";
import { X, Copy, Share2, Check } from "lucide-react";
import { useState } from "react";
import type { CryptoToken } from "@shared/schema";

interface DepositDetailProps {
  token: CryptoToken;
  onClose: () => void;
}

const WALLET_ADDRESSES: Record<string, string> = {
  Bitcoin: "bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4",
  Ethereum: "0xa549d8d8e3f2b54c1d5e2f3a4b5c6d7e8f9a0b1c",
  Solana: "HPZti7vK9jZ5F2x4bG8cN9mD3kR7qW1pY6sT0hJ4b59CV",
  Base: "0xa549d8d8e3f2b54c1d5e2f3a4b5c6d7e8f9a0b1c",
  BSC: "0x7F3e9c8D2b1A4f5E6c7D8e9F0a1B2c3D4e5F6a7B",
  Dogecoin: "DPxCz9K3rWvHjN5mS8qE2pL7bA4tF6uX1yG0wR3tCMtC",
};

export function DepositDetail({ token, onClose }: DepositDetailProps) {
  const [copied, setCopied] = useState(false);
  const address = WALLET_ADDRESSES[token.network] || WALLET_ADDRESSES["Ethereum"];

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: `Deposit ${token.symbol}`,
        text: `My ${token.symbol} deposit address: ${address}`,
      });
    } catch {}
  };

  return (
    <motion.div
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ type: "spring", damping: 30, stiffness: 300 }}
      className="fixed inset-0 bg-black z-[70] flex flex-col"
    >
      <div className="flex items-center justify-between px-4 py-4">
        <button data-testid="button-close-deposit-detail" onClick={onClose} className="p-2">
          <X className="w-6 h-6 text-white" />
        </button>
        <h2 className="text-white font-semibold text-base" data-testid="text-deposit-detail-title">
          Deposit {token.symbol}
        </h2>
        <div className="w-10" />
      </div>

      <div className="flex-1 flex flex-col items-center px-6 pt-4">
        <div className="mb-6">
          {token.iconUrl ? (
            <img src={token.iconUrl} alt={token.symbol} className="w-16 h-16 rounded-full" data-testid="img-deposit-token" />
          ) : (
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold"
              style={{ backgroundColor: token.iconColor + "20", color: token.iconColor }}
            >
              {token.symbol[0]}
            </div>
          )}
        </div>

        <p className="text-[#8E8E93] text-sm text-center mb-6" data-testid="text-deposit-instructions">
          Send only <span className="text-white font-medium">{token.name} ({token.symbol})</span> to this address on the <span className="text-white font-medium">{token.network}</span> network.
        </p>

        <div className="w-48 h-48 bg-white rounded-2xl p-3 mb-6 flex items-center justify-center" data-testid="qr-code-container">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {generateQRPattern().map((rect, i) => (
              <rect key={i} x={rect.x} y={rect.y} width={rect.s} height={rect.s} fill="black" />
            ))}
          </svg>
        </div>

        <p className="text-[#8E8E93] text-xs mb-3">Your {token.symbol} address</p>

        <div className="w-full bg-[#1c1c1e] rounded-2xl p-4 mb-6">
          <p className="text-white text-sm font-mono text-center break-all leading-relaxed" data-testid="text-deposit-address">
            {address}
          </p>
        </div>

        <div className="flex gap-4 w-full">
          <button
            data-testid="button-copy-address"
            onClick={handleCopy}
            className="flex-1 flex items-center justify-center gap-2 py-4 bg-[#1c1c1e] rounded-full text-white font-medium"
          >
            {copied ? <Check className="w-5 h-5 text-[#30D158]" /> : <Copy className="w-5 h-5" />}
            {copied ? "Copied" : "Copy"}
          </button>
          <button
            data-testid="button-share-address"
            onClick={handleShare}
            className="flex-1 flex items-center justify-center gap-2 py-4 bg-[#1c1c1e] rounded-full text-white font-medium"
          >
            <Share2 className="w-5 h-5" />
            Share
          </button>
        </div>
      </div>

      <div className="px-6 pb-8">
        <div className="bg-[#1c1c1e] rounded-2xl p-4">
          <p className="text-[#8E8E93] text-xs leading-relaxed text-center">
            Only send {token.symbol} on the {token.network} network. Sending other assets or using a different network may result in permanent loss.
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function generateQRPattern() {
  const rects: { x: number; y: number; s: number }[] = [];
  const s = 4;

  for (let x = 0; x < 7; x++) {
    for (let y = 0; y < 7; y++) {
      if (x === 0 || x === 6 || y === 0 || y === 6 || (x >= 2 && x <= 4 && y >= 2 && y <= 4)) {
        rects.push({ x: x * s + 2, y: y * s + 2, s });
        rects.push({ x: (x + 18) * s + 2, y: y * s + 2, s });
        rects.push({ x: x * s + 2, y: (y + 18) * s + 2, s });
      }
    }
  }

  const seed = 42;
  for (let i = 0; i < 80; i++) {
    const px = ((seed * (i + 7) * 13) % 15) + 8;
    const py = ((seed * (i + 3) * 17) % 15) + 8;
    if (px < 25 && py < 25) {
      rects.push({ x: px * s + 2, y: py * s + 2, s });
    }
  }

  return rects;
}
