import { motion } from "framer-motion";

interface WalletReadyProps {
  onStart: () => void;
}

export function WalletReady({ onStart }: WalletReadyProps) {
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
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <img
            src="/wallet-ready-ball.png"
            alt="Your wallet is ready"
            className="w-full h-full object-contain"
            draggable={false}
            fetchPriority="high"
          />
        </motion.div>

        <motion.h1
          className="text-[32px] font-bold text-center leading-tight mb-4"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Your wallet is ready!
        </motion.h1>

        <motion.p
          className="text-[#BDBDBD] text-center text-base leading-relaxed max-w-[320px]"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Discover tens of thousands of tokens to swap, transfer, store, and so much more.
        </motion.p>
      </div>

      <div className="px-6 pb-6">
        <motion.p
          className="text-[#888] text-center text-xs mb-6 leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Robinhood Wallet supports Solana, Ethereum, Bitcoin, Dogecoin, Base, BSC, Arbitrum, Polygon, and Optimism.
        </motion.p>

        <motion.button
          data-testid="button-lets-go"
          onClick={onStart}
          className="w-full py-4 bg-white text-black font-semibold text-lg rounded-full"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          whileTap={{ scale: 0.98 }}
        >
          Let's go
        </motion.button>
      </div>
    </motion.div>
  );
}
