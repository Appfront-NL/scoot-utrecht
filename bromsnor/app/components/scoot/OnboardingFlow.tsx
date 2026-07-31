import { useState } from "react";
import { AuthScreen } from "./AuthScreen";
import { PlatePicker } from "./PlatePicker";
import { RulesDownload } from "./RulesDownload";
import { RulesScreen } from "./RulesScreen";

/**
 * The complete first-run chain: login → plate → rules download →
 * welcome rules. Composition of the four standalone screens; use
 * those directly if you need a different order.
 *
 * @example
 * <OnboardingFlow city={city} onDone={(vehicle) => start(vehicle)} onToast={show} />
 */
export function OnboardingFlow({ city, onDone, onToast }: {
  city: { name: string; rules: { title: string; text: string }[] };
  onDone: (vehicle: string) => void;
  onToast?: (text: string) => void;
}) {
  const [stage, setStage] = useState<"auth" | "plate" | "download" | "rules">("auth");
  const [vehicle, setVehicle] = useState("snorfiets");

  if (stage === "auth") return <AuthScreen onDone={() => setStage("plate")} onToast={onToast} />;
  if (stage === "plate") return <PlatePicker vehicle={vehicle} onSelect={setVehicle} onNext={() => setStage("download")} />;
  if (stage === "download") return <RulesDownload cityName={city.name} onDone={() => setStage("rules")} />;
  return <RulesScreen mode="welcome" city={city} vehicle={vehicle} onClose={() => onDone(vehicle)} />;
}
