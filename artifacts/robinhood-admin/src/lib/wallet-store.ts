import { useState, useCallback } from "react";

export type OnboardingStep = 
  | "protect" 
  | "pin" 
  | "pin-confirm"
  | "backup" 
  | "backup-loading"
  | "backup-complete"
  | "notifications" 
  | "ready";

export type AppScreen = "onboarding" | "wallet" | "deposit" | "swap" | "swap-select";

export function useWalletState() {
  const [screen, setScreen] = useState<AppScreen>("onboarding");
  const [onboardingStep, setOnboardingStep] = useState<OnboardingStep>("protect");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedNetwork, setSelectedNetwork] = useState("Solana");

  const advanceOnboarding = useCallback(() => {
    const steps: OnboardingStep[] = ["protect", "pin", "pin-confirm", "backup", "backup-loading", "backup-complete", "notifications", "ready"];
    const currentIndex = steps.indexOf(onboardingStep);
    if (currentIndex < steps.length - 1) {
      setOnboardingStep(steps[currentIndex + 1]);
    } else {
      setScreen("wallet");
    }
  }, [onboardingStep]);

  return {
    screen, setScreen,
    onboardingStep, setOnboardingStep,
    pin, setPin,
    confirmPin, setConfirmPin,
    menuOpen, setMenuOpen,
    selectedNetwork, setSelectedNetwork,
    advanceOnboarding,
  };
}
