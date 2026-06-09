import { motion } from "framer-motion";
import { X, Flashlight } from "lucide-react";
import { useState } from "react";

interface ScanScreenProps {
  onClose: () => void;
}

export function ScanScreen({ onClose }: ScanScreenProps) {
  const [flashOn, setFlashOn] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black z-50 flex flex-col"
    >
      <div className="flex items-center justify-between px-4 py-4">
        <button data-testid="button-close-scan" onClick={onClose} className="p-2">
          <X className="w-6 h-6 text-white" />
        </button>
        <h2 className="text-white font-semibold text-base" data-testid="text-scan-title">Scan QR Code</h2>
        <button
          data-testid="button-flash-toggle"
          onClick={() => setFlashOn(!flashOn)}
          className="p-2"
        >
          <Flashlight className={`w-5 h-5 ${flashOn ? "text-yellow-400" : "text-white"}`} />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="relative w-64 h-64 mb-8">
          <div className="absolute inset-0 bg-[#1c1c1e] rounded-3xl" />

          <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-white rounded-tl-3xl" />
          <div className="absolute top-0 right-0 w-12 h-12 border-t-2 border-r-2 border-white rounded-tr-3xl" />
          <div className="absolute bottom-0 left-0 w-12 h-12 border-b-2 border-l-2 border-white rounded-bl-3xl" />
          <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-white rounded-br-3xl" />

          <motion.div
            className="absolute left-4 right-4 h-0.5 bg-[#30D158]"
            initial={{ top: "15%" }}
            animate={{ top: ["15%", "85%", "15%"] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />

          <div className="absolute inset-0 flex items-center justify-center">
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="0.5" className="opacity-30">
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="3" height="3" rx="0.5" />
              <rect x="18" y="14" width="3" height="3" rx="0.5" />
              <rect x="14" y="18" width="3" height="3" rx="0.5" />
              <rect x="18" y="18" width="3" height="3" rx="0.5" />
            </svg>
          </div>
        </div>

        <p className="text-white text-lg font-semibold mb-2" data-testid="text-scan-instruction">
          Point at a QR code
        </p>
        <p className="text-[#8E8E93] text-sm text-center leading-relaxed">
          Scan a wallet address QR code to send crypto instantly
        </p>
      </div>

      <div className="px-6 pb-8">
        <p className="text-[#666] text-xs text-center">
          Camera access is required to scan QR codes
        </p>
      </div>
    </motion.div>
  );
}
