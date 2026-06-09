import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface NotificationsProps {
  onEnable: () => void;
  onSkip: () => void;
}

export function Notifications({ onEnable, onSkip }: NotificationsProps) {
  const [showIOSDialog, setShowIOSDialog] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col min-h-screen bg-black text-white relative"
    >
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <motion.div
          className="w-[260px] h-[260px] mb-10 flex items-center justify-center"
          initial={{ scale: 0.8, opacity: 0, rotate: -5 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <img
            src="/notifications-bell.png"
            alt="Turn on notifications"
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
          Keep up with your crypto
        </motion.h1>

        <motion.p
          className="text-[#BDBDBD] text-center text-base leading-relaxed max-w-[320px]"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Turn on notifications to stay updated on wallet activity, price movements, and new features.
        </motion.p>
      </div>

      <div className="px-6 pb-10 flex flex-col items-center gap-4">
        <motion.button
          data-testid="button-enable-notifications"
          onClick={() => setShowIOSDialog(true)}
          className="w-full py-4 bg-white text-black font-semibold text-lg rounded-full"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          whileTap={{ scale: 0.98 }}
        >
          Turn on notifications
        </motion.button>

        <motion.button
          data-testid="button-skip-notifications"
          onClick={onSkip}
          className="text-white font-medium text-base underline underline-offset-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Maybe later
        </motion.button>
      </div>

      <AnimatePresence>
        {showIOSDialog && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center z-50"
            style={{ backgroundColor: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className="mx-8 rounded-[14px] overflow-hidden"
              style={{ backgroundColor: "#f2f2f7", width: "270px" }}
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            >
              <div className="px-4 pt-5 pb-4 text-center">
                <p
                  className="text-[17px] font-semibold leading-snug mb-[6px]"
                  style={{ color: "#000", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" }}
                >
                  "Wallet" Would Like to Send You Notifications
                </p>
                <p
                  className="text-[13px] leading-snug"
                  style={{ color: "#333", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" }}
                >
                  Notifications may include alerts, sounds, and icon badges. These can be configured in Settings.
                </p>
              </div>

              <div
                className="flex"
                style={{ borderTop: "0.5px solid #c6c6c8" }}
              >
                <button
                  className="flex-1 py-[11px] text-center text-[17px]"
                  style={{
                    color: "#007aff",
                    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
                    borderRight: "0.5px solid #c6c6c8",
                    background: "none",
                    fontWeight: 400,
                  }}
                  onClick={() => {
                    setShowIOSDialog(false);
                    onSkip();
                  }}
                >
                  Don't Allow
                </button>
                <button
                  className="flex-1 py-[11px] text-center text-[17px]"
                  style={{
                    color: "#007aff",
                    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
                    background: "none",
                    fontWeight: 600,
                  }}
                  onClick={() => {
                    setShowIOSDialog(false);
                    onEnable();
                  }}
                >
                  Allow
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
