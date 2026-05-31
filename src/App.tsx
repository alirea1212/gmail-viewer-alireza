import { useState } from "react";
import LandingPage from "./components/LandingPage";
import HandDetector from "./components/HandDetector";

export type DeviceMode = "computer" | "mobile" | null;

export default function App() {
  const [deviceMode, setDeviceMode] = useState<DeviceMode>(null);

  if (!deviceMode) {
    return <LandingPage onSelect={setDeviceMode} />;
  }

  return <HandDetector deviceMode={deviceMode} onBack={() => setDeviceMode(null)} />;
}
