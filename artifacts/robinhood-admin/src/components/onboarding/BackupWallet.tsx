import { motion } from "framer-motion";
import { Loader2, Check } from "lucide-react";

interface BackupWalletProps {
  step: "backup" | "backup-loading" | "backup-complete";
  onBackup: () => void;
  onContinue: () => void;
}

export function BackupWallet({ step, onBackup, onContinue }: BackupWalletProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col min-h-screen bg-black text-white"
    >
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="w-4/5 max-w-[260px] mb-12">
          <motion.svg viewBox="0 0 240 280" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto"
            initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.6, ease: "easeOut" }}>
            <rect x="45" y="10" width="150" height="260" rx="24" fill="#111" stroke="#2a2a2a" strokeWidth="1.5"/>
            <rect x="58" y="28" width="124" height="210" rx="10" fill="#0a0a0a"/>
            <rect x="98" y="15" width="44" height="6" rx="3" fill="#1e1e1e"/>
            <rect x="70" y="48" width="100" height="2" rx="1" fill="#2a2a2a"/>
            <text x="120" y="70" textAnchor="middle" fontSize="9" fill="#888" fontFamily="system-ui">Seed Phrase</text>
            <rect x="70" y="80" width="46" height="22" rx="5" fill="#1c1c1c" stroke="#2e2e2e" strokeWidth="1"/>
            <text x="93" y="95" textAnchor="middle" fontSize="8" fill="#aaa" fontFamily="monospace">witch</text>
            <rect x="122" y="80" width="46" height="22" rx="5" fill="#1c1c1c" stroke="#2e2e2e" strokeWidth="1"/>
            <text x="145" y="95" textAnchor="middle" fontSize="8" fill="#aaa" fontFamily="monospace">collapse</text>
            <rect x="70" y="108" width="46" height="22" rx="5" fill="#1c1c1c" stroke="#2e2e2e" strokeWidth="1"/>
            <text x="93" y="123" textAnchor="middle" fontSize="8" fill="#aaa" fontFamily="monospace">practice</text>
            <rect x="122" y="108" width="46" height="22" rx="5" fill="#1c1c1c" stroke="#2e2e2e" strokeWidth="1"/>
            <text x="145" y="123" textAnchor="middle" fontSize="8" fill="#aaa" fontFamily="monospace">feed</text>
            <rect x="70" y="136" width="46" height="22" rx="5" fill="#1c1c1c" stroke="#2e2e2e" strokeWidth="1"/>
            <text x="93" y="151" textAnchor="middle" fontSize="8" fill="#aaa" fontFamily="monospace">random</text>
            <rect x="122" y="136" width="46" height="22" rx="5" fill="#1c1c1c" stroke="#2e2e2e" strokeWidth="1"/>
            <text x="145" y="151" textAnchor="middle" fontSize="8" fill="#aaa" fontFamily="monospace">silver</text>
            <rect x="70" y="178" width="100" height="28" rx="14" fill="#00C805"/>
            <text x="120" y="196" textAnchor="middle" fontSize="9" fill="black" fontFamily="system-ui" fontWeight="600">Copy to clipboard</text>
            <circle cx="120" cy="236" r="8" fill="none" stroke="#2a2a2a" strokeWidth="1.5"/>
          </motion.svg>
        </div>

        {step === "backup-complete" ? (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mb-6"
            >
              <Check className="w-8 h-8 text-green-400" />
            </motion.div>
            <motion.p
              className="text-white text-lg font-medium text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              Your wallet has been backed up.
            </motion.p>
          </>
        ) : (
          <>
            <motion.h1
              className="text-[32px] font-bold text-center leading-tight mb-4"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              Back up your wallet
            </motion.h1>

            <motion.p
              className="text-[#BDBDBD] text-center text-base leading-relaxed max-w-[320px] mb-4"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              If you lose or reset your device, you can easily recover your wallet with a backup.
            </motion.p>

            <motion.p
              className="text-[#888] text-center text-sm leading-relaxed max-w-[320px]"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.35 }}
            >
              If you don't back up your wallet, you risk losing all of your crypto. Robinhood Wallet doesn't have access to your wallet and can't help you recover it.{" "}
              <span className="text-white underline cursor-pointer" data-testid="link-learn-more">Learn more</span>
            </motion.p>
          </>
        )}
      </div>

      <div className="px-6 pb-10">
        {step === "backup" && (
          <motion.button
            data-testid="button-backup-now"
            onClick={onBackup}
            className="w-full py-4 bg-white text-black font-semibold text-lg rounded-full"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            whileTap={{ scale: 0.98 }}
          >
            Back up now
          </motion.button>
        )}

        {step === "backup-loading" && (
          <motion.button
            disabled
            className="w-full py-4 bg-white/80 text-black font-semibold text-lg rounded-full flex items-center justify-center gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Loader2 className="w-5 h-5 animate-spin" />
            Backing up...
          </motion.button>
        )}

        {step === "backup-complete" && (
          <motion.button
            data-testid="button-backup-continue"
            onClick={onContinue}
            className="w-full py-4 bg-white text-black font-semibold text-lg rounded-full"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            whileTap={{ scale: 0.98 }}
          >
            Continue
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}
