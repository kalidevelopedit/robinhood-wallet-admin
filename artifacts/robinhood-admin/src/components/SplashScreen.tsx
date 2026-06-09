import { useEffect } from "react";
import { motion } from "framer-motion";

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 4000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 bg-black flex items-center justify-center z-50"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="flex flex-col items-center"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div
          className="w-64 h-64 overflow-hidden flex items-center justify-center"
          data-testid="img-splash-logo"
          style={{ borderRadius: 0 }}
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
        </div>
      </motion.div>
    </motion.div>
  );
}
