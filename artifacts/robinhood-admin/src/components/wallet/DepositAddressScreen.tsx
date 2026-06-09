import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Copy, Check } from "lucide-react";

interface DepositCoin {
  symbol: string;
  name: string;
  iconUrl: string;
  iconColor: string;
  walletAddress: string;
}

interface DepositAddressScreenProps {
  coins: DepositCoin[];
  onClose: () => void;
}

export function DepositAddressScreen({ coins, onClose }: DepositAddressScreenProps) {
  const [selectedCoin, setSelectedCoin] = useState<DepositCoin | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCopy = (address: string) => {
    navigator.clipboard.writeText(address).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (selectedCoin) {
    return (
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="fixed inset-0 bg-black z-50 flex flex-col"
      >
        <div className="flex items-center justify-between px-4 py-4">
          <button data-testid="button-back-deposit-address" onClick={() => setSelectedCoin(null)} className="p-2">
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <h2 className="text-white font-semibold text-base" data-testid="text-deposit-coin-title">Deposit {selectedCoin.symbol}</h2>
          <div className="w-10" />
        </div>

        <div className="flex-1 flex flex-col items-center px-6 pt-8">
          {selectedCoin.iconUrl ? (
            <img src={selectedCoin.iconUrl} alt={selectedCoin.symbol} className="w-16 h-16 rounded-full mb-4" />
          ) : (
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold mb-4"
              style={{ backgroundColor: selectedCoin.iconColor + "25", color: selectedCoin.iconColor }}
            >
              {selectedCoin.symbol.charAt(0)}
            </div>
          )}
          <h3 className="text-white text-lg font-bold mb-1">{selectedCoin.name}</h3>
          <p className="text-[#8E8E93] text-sm mb-8">Send only {selectedCoin.symbol} to this address</p>

          <div className="w-48 h-48 bg-white rounded-2xl p-3 mb-8">
            <div className="w-full h-full flex items-center justify-center">
              <QRCode value={selectedCoin.walletAddress} />
            </div>
          </div>

          <div className="w-full bg-[#1c1c1e] rounded-2xl p-4 mb-4">
            <p className="text-[#8E8E93] text-xs mb-2">Wallet Address</p>
            <p className="text-white text-sm font-mono break-all leading-relaxed" data-testid="text-deposit-address">
              {selectedCoin.walletAddress}
            </p>
          </div>

          <button
            data-testid="button-copy-deposit-address"
            onClick={() => handleCopy(selectedCoin.walletAddress)}
            className="w-full flex items-center justify-center gap-2 py-4 bg-white text-black rounded-full text-base font-semibold active:bg-gray-200 transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-5 h-5" />
                Copied
              </>
            ) : (
              <>
                <Copy className="w-5 h-5" />
                Copy Address
              </>
            )}
          </button>

          <p className="text-[#FF453A] text-xs text-center mt-4 px-4 leading-relaxed">
            Only send {selectedCoin.symbol} to this address. Sending any other coin may result in permanent loss.
          </p>
        </div>
      </motion.div>
    );
  }

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
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>
        <h2 className="text-white font-semibold text-base" data-testid="text-deposit-title">Deposit</h2>
        <div className="w-10" />
      </div>

      <div className="px-6 mb-4">
        <p className="text-[#8E8E93] text-sm">Choose a coin to deposit</p>
      </div>

      <div className="flex-1 overflow-y-auto">
        {coins.map((coin) => (
          <button
            key={coin.symbol}
            data-testid={`button-deposit-coin-${coin.symbol}`}
            onClick={() => setSelectedCoin(coin)}
            className="flex items-center gap-4 w-full px-6 py-4 text-left active:bg-[#1c1c1e] transition-colors"
          >
            {coin.iconUrl ? (
              <img src={coin.iconUrl} alt={coin.symbol} className="w-10 h-10 rounded-full" />
            ) : (
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
                style={{ backgroundColor: coin.iconColor + "25", color: coin.iconColor }}
              >
                {coin.symbol.charAt(0)}
              </div>
            )}
            <div className="flex-1">
              <p className="text-white text-[15px] font-medium">{coin.name}</p>
              <p className="text-[#8E8E93] text-[13px]">{coin.symbol}</p>
            </div>
            <p className="text-[#8E8E93] text-xs font-mono truncate max-w-[120px]">
              {coin.walletAddress ? `${coin.walletAddress.slice(0, 6)}...${coin.walletAddress.slice(-4)}` : "No address"}
            </p>
          </button>
        ))}
        {coins.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20">
            <p className="text-[#8E8E93] text-base">No deposit addresses available</p>
            <p className="text-[#48484A] text-sm mt-1">Contact admin to set up deposits</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function QRCode({ value }: { value: string }) {
  const size = 168;
  const modules = generateQRMatrix(value);
  const moduleCount = modules.length;
  const cellSize = size / moduleCount;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {modules.map((row, y) =>
        row.map((cell, x) =>
          cell ? (
            <rect
              key={`${x}-${y}`}
              x={x * cellSize}
              y={y * cellSize}
              width={cellSize}
              height={cellSize}
              fill="black"
            />
          ) : null
        )
      )}
    </svg>
  );
}

function generateQRMatrix(data: string): boolean[][] {
  const size = 25;
  const matrix: boolean[][] = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => false)
  );

  function addFinderPattern(startX: number, startY: number) {
    for (let y = 0; y < 7; y++) {
      for (let x = 0; x < 7; x++) {
        if (
          y === 0 || y === 6 || x === 0 || x === 6 ||
          (y >= 2 && y <= 4 && x >= 2 && x <= 4)
        ) {
          matrix[startY + y][startX + x] = true;
        }
      }
    }
  }

  addFinderPattern(0, 0);
  addFinderPattern(size - 7, 0);
  addFinderPattern(0, size - 7);

  for (let i = 8; i < size - 8; i++) {
    matrix[6][i] = i % 2 === 0;
    matrix[i][6] = i % 2 === 0;
  }

  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    hash = ((hash << 5) - hash + data.charCodeAt(i)) | 0;
  }

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (matrix[y][x]) continue;
      if (x < 9 && y < 9) continue;
      if (x > size - 9 && y < 9) continue;
      if (x < 9 && y > size - 9) continue;
      if (x === 6 || y === 6) continue;

      const seed = (hash + x * 37 + y * 53 + x * y) | 0;
      matrix[y][x] = (seed & 1) === 1 || ((seed >> 1) & 1) === 1;
    }
  }

  return matrix;
}
