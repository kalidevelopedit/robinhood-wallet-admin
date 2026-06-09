import { motion, AnimatePresence } from "framer-motion";
import { X, Delete } from "lucide-react";

interface PinEntryProps {
  title: string;
  pin: string;
  onPinChange: (pin: string) => void;
  onComplete: (pin: string) => void;
  onClose?: () => void;
  maxLength?: number;
  error?: string;
}

export function PinEntry({ title, pin, onPinChange, onComplete, onClose, maxLength = 6, error }: PinEntryProps) {
  const handleDigit = (digit: string) => {
    if (pin.length < maxLength) {
      const newPin = pin + digit;
      onPinChange(newPin);
      if (newPin.length === maxLength) {
        setTimeout(() => onComplete(newPin), 200);
      }
    }
  };

  const handleDelete = () => {
    onPinChange(pin.slice(0, -1));
  };

  const dots = Array.from({ length: maxLength }, (_, i) => i < pin.length);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col min-h-screen min-h-[100dvh] bg-black text-white"
    >
      {onClose && (
        <div className="p-4">
          <button data-testid="button-close-pin" onClick={onClose} className="p-2">
            <X className="w-6 h-6 text-white" />
          </button>
        </div>
      )}

      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <motion.h1
          className="text-2xl font-bold mb-8"
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          {title}
        </motion.h1>

        <div className="flex gap-4 mb-4" data-testid="pin-dots">
          {dots.map((filled, i) => (
            <motion.div
              key={i}
              className={`w-3.5 h-3.5 rounded-full border-2 ${
                error
                  ? "border-red-500" + (filled ? " bg-red-500" : "")
                  : filled
                  ? "bg-white border-white"
                  : "border-white/40"
              }`}
              animate={
                error
                  ? { x: [0, -8, 8, -8, 8, 0] }
                  : filled
                  ? { scale: [1, 1.2, 1] }
                  : {}
              }
              transition={{ duration: error ? 0.4 : 0.2 }}
            />
          ))}
        </div>

        <AnimatePresence>
          {error && (
            <motion.p
              data-testid="text-pin-error"
              className="text-red-500 text-sm mt-2 mb-8"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        {!error && <div className="mb-12" />}
      </div>

      <div className="px-8 pb-12">
        <div className="grid grid-cols-3 gap-y-6">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "del"].map((key) => (
            <div key={key || "empty"} className="flex items-center justify-center">
              {key === "" ? (
                <div className="w-20 h-16" />
              ) : key === "del" ? (
                <button
                  data-testid="button-pin-delete"
                  onClick={handleDelete}
                  className="w-20 h-16 flex items-center justify-center"
                >
                  <Delete className="w-7 h-7 text-white" />
                </button>
              ) : (
                <button
                  data-testid={`button-pin-${key}`}
                  onClick={() => handleDigit(key)}
                  className="w-20 h-16 flex items-center justify-center text-[28px] font-medium text-white active:opacity-50 transition-opacity"
                >
                  {key}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
