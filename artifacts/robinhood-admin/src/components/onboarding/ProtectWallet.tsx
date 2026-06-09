import { motion } from "framer-motion";

interface ProtectWalletProps {
  onNext: () => void;
}

export function ProtectWallet({ onNext }: ProtectWalletProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col min-h-screen bg-black text-white"
    >
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <motion.div
          className="w-[260px] h-[260px] mb-10 flex items-center justify-center"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <img
            src="/protect-wallet-keys.png"
            alt="Protect your wallet"
            className="w-full h-full object-contain"
            draggable={false}
            fetchPriority="high"
          />
        </motion.div>

        <motion.h1
          className="text-[32px] font-bold text-center leading-tight mb-4"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Protect your wallet
        </motion.h1>

        <motion.p
          className="text-[#BDBDBD] text-center text-base leading-relaxed max-w-[300px]"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Secure your wallet on this device so only you can access it.
        </motion.p>
      </div>

      <div className="px-6 pb-10">
        <motion.button
          data-testid="button-secure-pin"
          onClick={onNext}
          className="w-full py-4 bg-white text-black font-semibold text-lg rounded-full"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          whileTap={{ scale: 0.98 }}
        >
          Secure with PIN
        </motion.button>
      </div>
    </motion.div>
  );
}
