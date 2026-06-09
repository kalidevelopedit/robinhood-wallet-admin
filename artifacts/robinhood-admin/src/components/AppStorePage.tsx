import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Share2, ChevronRight } from "lucide-react";

interface AppStorePageProps {
  onComplete: () => void;
}

const screenshots = [
  "/images/appstore-ss-1.png",
  "/images/appstore-ss-2.png",
  "/images/appstore-ss-3.png",
  "/images/appstore-ss-4.png",
  "/images/appstore-ss-5.png",
  "/images/appstore-ss-6.png",
  "/images/appstore-ss-7.png",
  "/images/appstore-ss-8.png",
];

function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as any).standalone === true
  );
}

export function AppStorePage({ onComplete }: AppStorePageProps) {
  const [installState, setInstallState] = useState<"idle" | "installing" | "installed">(
    isStandalone() ? "installed" : "idle"
  );
  const [showAddToHome, setShowAddToHome] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const mql = window.matchMedia("(display-mode: standalone)");
    const handler = () => {
      if (mql.matches) setInstallState("installed");
    };
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  const handleInstall = () => {
    if (installState === "installed") {
      onComplete();
      return;
    }
    setInstallState("installing");
    setProgress(0);

    const duration = 3000;
    const interval = 30;
    const steps = duration / interval;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      const p = Math.min((step / steps) * 100, 100);
      setProgress(p);
      if (step >= steps) {
        clearInterval(timer);
        setInstallState("installed");
        setShowAddToHome(true);
      }
    }, interval);
  };

  const renderStars = () => {
    return (
      <div className="flex items-center gap-[1px]">
        {[1, 2, 3, 4].map((i) => (
          <Star key={i} className="w-[10px] h-[10px] text-[#FF9500]" fill="#FF9500" />
        ))}
        <div className="relative w-[10px] h-[10px]">
          <Star className="w-[10px] h-[10px] text-[#48484A]" fill="#48484A" />
          <div className="absolute inset-0 overflow-hidden" style={{ width: "30%" }}>
            <Star className="w-[10px] h-[10px] text-[#FF9500]" fill="#FF9500" />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen min-h-[100dvh] bg-black text-white overflow-y-auto">
      <AnimatePresence mode="wait">
        {!showAddToHome ? (
          <motion.div
            key="store"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pb-8"
          >
            <div className="sticky top-0 z-10 bg-black/90 backdrop-blur-md border-b border-[#1C1C1E]">
              <div className="flex items-center justify-between px-4 py-2.5">
                <div className="flex items-center gap-1">
                  <svg viewBox="0 0 24 24" className="w-4 h-4 text-[#007AFF]" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                  <span className="text-[13px] text-[#8E8E93]">App Store</span>
                </div>
              </div>
            </div>

            <div className="px-5 pt-5">
              <div className="flex items-start gap-4 mb-5">
                <div className="w-[76px] h-[76px] rounded-[18px] overflow-hidden flex-shrink-0 bg-[#1C1C1E]">
                  <img
                    src="/images/robinhood-wallet-icon.svg"
                    alt="Robinhood Wallet"
                    className="w-full h-full object-cover"
                    data-testid="img-app-icon"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <h1 className="text-[17px] font-semibold leading-tight" data-testid="text-app-title">
                    Robinhood Wallet
                  </h1>
                  <p className="text-[#8E8E93] text-[13px] mt-0.5">
                    Discover, swap, and store crypto
                  </p>

                  <div className="flex items-center gap-3 mt-2.5">
                    {installState === "idle" ? (
                      <button
                        data-testid="button-install"
                        onClick={handleInstall}
                        className="bg-[#007AFF] text-white text-[15px] font-bold px-7 py-[5px] rounded-full min-w-[75px] text-center"
                      >
                        GET
                      </button>
                    ) : installState === "installing" ? (
                      <div className="relative w-[28px] h-[28px]" data-testid="status-installing">
                        <svg className="w-[28px] h-[28px] -rotate-90" viewBox="0 0 28 28">
                          <circle cx="14" cy="14" r="12" fill="none" stroke="#3A3A3C" strokeWidth="2.5" />
                          <circle
                            cx="14" cy="14" r="12"
                            fill="none"
                            stroke="#007AFF"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeDasharray={`${2 * Math.PI * 12}`}
                            strokeDashoffset={`${2 * Math.PI * 12 * (1 - progress / 100)}`}
                            style={{ transition: "stroke-dashoffset 30ms linear" }}
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-[6px] h-[6px] bg-[#007AFF]" style={{ borderRadius: 1 }} />
                        </div>
                      </div>
                    ) : (
                      <button
                        data-testid="button-open"
                        onClick={handleInstall}
                        className="bg-[#007AFF] text-white text-[15px] font-bold px-7 py-[5px] rounded-full min-w-[75px] text-center"
                      >
                        OPEN
                      </button>
                    )}

                    <button className="ml-auto" data-testid="button-share">
                      <Share2 className="w-5 h-5 text-[#007AFF]" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between py-3 border-t border-b border-[#2C2C2E]">
                <div className="flex flex-col items-center flex-1">
                  <span className="text-[13px] font-bold text-[#8E8E93]">4.3</span>
                  {renderStars()}
                  <span className="text-[10px] text-[#636366] mt-1">4.7M Ratings</span>
                </div>

                <div className="w-px h-10 bg-[#2C2C2E]" />

                <div className="flex flex-col items-center flex-1">
                  <span className="text-[13px] font-bold text-[#8E8E93]">18+</span>
                  <span className="text-[10px] text-[#636366] mt-1">In-App Controls</span>
                </div>

                <div className="w-px h-10 bg-[#2C2C2E]" />

                <div className="flex flex-col items-center flex-1">
                  <svg viewBox="0 0 24 24" className="w-5 h-5 text-[#8E8E93] mb-0.5" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="2" y="3" width="20" height="14" rx="2" />
                    <path d="M8 21h8M12 17v4" />
                  </svg>
                  <span className="text-[10px] text-[#636366]">Finance</span>
                </div>

                <div className="w-px h-10 bg-[#2C2C2E]" />

                <div className="flex flex-col items-center flex-1">
                  <span className="text-[13px] font-bold text-[#8E8E93]">EN</span>
                  <span className="text-[10px] text-[#636366] mt-1">English</span>
                </div>

                <div className="w-px h-10 bg-[#2C2C2E]" />

                <div className="flex flex-col items-center flex-1">
                  <span className="text-[13px] font-bold text-[#8E8E93]">732.2</span>
                  <span className="text-[10px] text-[#636366] mt-1">MB</span>
                </div>
              </div>

              <div className="py-4">
                <div className="flex gap-2.5 overflow-x-auto pb-2" style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}>
                  {screenshots.map((src, i) => {
                    const gradients = [
                      "from-[#1a1a2e] to-[#16213e]",
                      "from-[#0d1117] to-[#00c805]/20",
                      "from-[#1c1c1e] to-[#2c2c2e]",
                      "from-[#0a0a0a] to-[#1a1a1a]",
                      "from-[#001f3f] to-[#0d1b2a]",
                      "from-[#1a0a0a] to-[#2d1b1b]",
                      "from-[#0a1a0a] to-[#1b2d1b]",
                      "from-[#1a1a0a] to-[#2d2d1b]",
                    ];
                    return (
                      <div
                        key={i}
                        className={`w-[220px] h-[390px] flex-shrink-0 rounded-xl overflow-hidden bg-gradient-to-b ${gradients[i % gradients.length]} flex items-center justify-center`}
                      >
                        <img
                          src={src}
                          alt={`Screenshot ${i + 1}`}
                          className="w-full h-full object-cover"
                          data-testid={`img-screenshot-${i}`}
                          loading="lazy"
                          onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="border-t border-[#2C2C2E] py-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[15px] font-semibold">Description</p>
                  <ChevronRight className="w-4 h-4 text-[#48484A]" />
                </div>
                <p className="text-[13px] text-[#8E8E93] leading-[1.4]">
                  Robinhood Wallet is the easiest way to manage your crypto. Discover, swap, and store your favorite tokens across multiple networks including Solana, Ethereum, Base, and more.
                </p>
              </div>

              <div className="border-t border-[#2C2C2E] py-4">
                <div className="flex items-center justify-between">
                  <span className="text-[15px] font-semibold">What's New</span>
                  <ChevronRight className="w-4 h-4 text-[#48484A]" />
                </div>
                <p className="text-[13px] text-[#8E8E93] mt-2 leading-[1.4]">
                  Bug fixes and performance improvements.
                </p>
              </div>

              <div className="border-t border-[#2C2C2E] py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] text-[#636366] uppercase tracking-wide">Developer</p>
                    <p className="text-[15px] mt-0.5">Robinhood Non-Custodial, Ltd.</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#48484A]" />
                </div>
              </div>

              <div className="border-t border-[#2C2C2E] py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] text-[#636366] uppercase tracking-wide">Compatibility</p>
                    <p className="text-[15px] mt-0.5">iPhone, Apple Watch</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#48484A]" />
                </div>
              </div>

              <div className="border-t border-[#2C2C2E] py-4">
                <p className="text-[15px] font-semibold mb-3">Ratings & Reviews</p>
                <div className="flex items-start gap-4">
                  <div className="text-center">
                    <p className="text-[48px] font-bold leading-none">4.3</p>
                    <p className="text-[11px] text-[#636366] mt-1">out of 5</p>
                  </div>
                  <div className="flex-1 space-y-[3px] pt-1">
                    {[
                      { stars: 5, pct: 58 },
                      { stars: 4, pct: 18 },
                      { stars: 3, pct: 8 },
                      { stars: 2, pct: 5 },
                      { stars: 1, pct: 11 },
                    ].map((r) => (
                      <div key={r.stars} className="flex items-center gap-1.5">
                        <div className="flex gap-[1px]">
                          {Array.from({ length: 5 }, (_, i) => (
                            <Star
                              key={i}
                              className="w-[8px] h-[8px]"
                              fill={i < r.stars ? "#FF9500" : "#48484A"}
                              color={i < r.stars ? "#FF9500" : "#48484A"}
                            />
                          ))}
                        </div>
                        <div className="flex-1 h-[3px] bg-[#3A3A3C] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#8E8E93] rounded-full"
                            style={{ width: `${r.pct}%` }}
                          />
                        </div>
                      </div>
                    ))}
                    <p className="text-[10px] text-[#636366] text-right">4.7M Ratings</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-[#2C2C2E] py-4">
                <p className="text-[11px] text-[#636366] uppercase tracking-wide mb-1">Information</p>
                <div className="space-y-3 mt-3">
                  {[
                    { label: "Seller", value: "Robinhood Non-Custodial, Ltd." },
                    { label: "Size", value: "732.2 MB" },
                    { label: "Category", value: "Finance" },
                    { label: "Compatibility", value: "iPhone" },
                    { label: "Languages", value: "English" },
                    { label: "Age Rating", value: "18+" },
                    { label: "Price", value: "Free" },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between py-1 border-b border-[#1C1C1E]">
                      <span className="text-[13px] text-[#8E8E93]">{item.label}</span>
                      <span className="text-[13px] text-[#8E8E93]">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="add-home"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col px-6 min-h-screen min-h-[100dvh] bg-black"
          >
            <div className="pt-14 pb-6 flex flex-col items-center">
              <div className="w-[72px] h-[72px] rounded-[16px] overflow-hidden mb-5 shadow-lg">
                <img
                  src="/images/robinhood-wallet-icon.svg"
                  alt="Robinhood Wallet"
                  className="w-full h-full object-cover"
                />
              </div>

              <h2 className="text-[22px] font-bold text-center mb-2" data-testid="text-add-homescreen">
                Add to Home Screen
              </h2>

              <p className="text-[#8E8E93] text-center text-[14px] leading-relaxed max-w-[300px]">
                Install this app on your iPhone for a full-screen experience
              </p>
            </div>

            <div className="flex-1">
              <div className="w-full space-y-2.5">
                {/* Step 1 */}
                <div className="flex items-center gap-4 bg-[#1C1C1E] rounded-2xl p-4">
                  <div className="w-11 h-11 rounded-xl bg-[#007AFF] flex items-center justify-center flex-shrink-0">
                    {/* iOS Share icon (box with arrow) */}
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                      <path d="M12 2L12 16" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                      <path d="M8 6L12 2L16 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M6 10H5C3.89543 10 3 10.8954 3 12V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V12C21 10.8954 20.1046 10 19 10H18" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-[15px] font-semibold text-white">Tap the Share button</p>
                    <p className="text-[13px] text-[#8E8E93] mt-0.5 flex items-center gap-1.5">
                      Look for
                      <span className="inline-flex items-center">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M12 3L12 15" stroke="#007AFF" strokeWidth="2" strokeLinecap="round"/>
                          <path d="M8 7L12 3L16 7" stroke="#007AFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M6 11H5C3.89543 11 3 11.8954 3 13V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V13C21 11.8954 20.1046 11 19 11H18" stroke="#007AFF" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                      </span>
                      at the bottom of Safari
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex items-center gap-4 bg-[#1C1C1E] rounded-2xl p-4">
                  <div className="w-11 h-11 rounded-xl bg-[#30D158] flex items-center justify-center flex-shrink-0">
                    {/* Plus in square icon */}
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                      <rect x="3" y="3" width="18" height="18" rx="4" stroke="white" strokeWidth="2"/>
                      <path d="M12 8V16M8 12H16" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-[15px] font-semibold text-white">Tap "Add to Home Screen"</p>
                    <p className="text-[13px] text-[#8E8E93] mt-0.5 flex items-center gap-1.5">
                      Look for
                      <span className="inline-flex items-center gap-1">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                          <rect x="3" y="3" width="18" height="18" rx="4" stroke="#8E8E93" strokeWidth="2"/>
                          <path d="M12 8V16M8 12H16" stroke="#8E8E93" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                        <span className="text-white font-medium">Add to Home Screen</span>
                      </span>
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex items-center gap-4 bg-[#1C1C1E] rounded-2xl p-4">
                  <div className="w-11 h-11 rounded-xl bg-[#5E5CE6] flex items-center justify-center flex-shrink-0">
                    {/* Checkmark */}
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                      <path d="M5 13L9 17L19 7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-[15px] font-semibold text-white">Tap "Add" to confirm</p>
                    <p className="text-[13px] text-[#8E8E93] mt-0.5">
                      Top right corner - then open from your home screen
                    </p>
                  </div>
                </div>
              </div>

              {/* Visual hint - Safari bottom bar mockup */}
              <div className="mt-6 mx-auto max-w-[300px]">
                <p className="text-[11px] text-[#636366] text-center mb-2 uppercase tracking-wider">Safari toolbar</p>
                <div className="bg-[#1C1C1E] rounded-2xl p-3 flex items-center justify-around">
                  {/* Back */}
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M15 18L9 12L15 6" stroke="#48484A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {/* Forward */}
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M9 18L15 12L9 6" stroke="#48484A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {/* Share - highlighted */}
                  <div className="relative">
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
                      <div className="bg-[#007AFF] text-white text-[10px] font-bold px-2.5 py-1 rounded-lg">
                        TAP THIS
                      </div>
                      <div className="w-0 h-0 border-l-[5px] border-r-[5px] border-t-[5px] border-l-transparent border-r-transparent border-t-[#007AFF] mx-auto" />
                    </div>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                      <path d="M12 3L12 15" stroke="#007AFF" strokeWidth="2" strokeLinecap="round"/>
                      <path d="M8 7L12 3L16 7" stroke="#007AFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M6 11H5C3.89543 11 3 11.8954 3 13V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V13C21 11.8954 20.1046 11 19 11H18" stroke="#007AFF" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </div>
                  {/* Bookmarks */}
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M19 21L12 16L5 21V5C5 3.89543 5.89543 3 7 3H17C18.1046 3 19 3.89543 19 5V21Z" stroke="#48484A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {/* Tabs */}
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <rect x="4" y="4" width="16" height="16" rx="2" stroke="#48484A" strokeWidth="2"/>
                    <rect x="8" y="1" width="14" height="14" rx="2" stroke="#48484A" strokeWidth="1.5" fill="none" opacity="0.4"/>
                  </svg>
                </div>
              </div>
            </div>

            <div className="pb-4" style={{ paddingBottom: "max(1.5rem, env(safe-area-inset-bottom, 1.5rem))" }}>
              <button
                data-testid="button-continue-app"
                onClick={onComplete}
                className="w-full py-[14px] bg-white text-black font-semibold text-[16px] rounded-full"
              >
                Continue to App
              </button>

              <button
                onClick={onComplete}
                className="w-full text-[#8E8E93] text-[13px] text-center mt-3 py-2"
                data-testid="button-skip-homescreen"
              >
                Skip, continue in browser
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
