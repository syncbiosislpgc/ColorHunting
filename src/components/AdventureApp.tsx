"use client";

import { useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import {
  AlbumScreen,
  GenerateCollageScreen,
  JointPhotoScreen,
  TemplatesScreen,
} from "@/components/screens/CollageScreens";
import { BriefingScreen } from "@/components/screens/BriefingScreen";
import { ColorRevealScreen } from "@/components/screens/ColorRevealScreen";
import { ColorSwapScreen } from "@/components/screens/ColorSwapScreen";
import { EventScreen } from "@/components/screens/EventScreen";
import { FoodRouletteScreen } from "@/components/screens/FoodRouletteScreen";
import { MissionScreen } from "@/components/screens/MissionScreen";
import { PlayersScreen } from "@/components/screens/PlayersScreen";
import { ResultsScreen } from "@/components/screens/ResultsScreen";
import {
  ReadyScreen,
  SurpriseOneScreen,
  SurpriseTwoScreen,
} from "@/components/screens/SurpriseScreens";
import { SessionSetupScreen } from "@/components/screens/SessionSetupScreen";
import { WelcomeScreen } from "@/components/screens/WelcomeScreen";
import { WhoAmIScreen } from "@/components/screens/WhoAmIScreen";
import { useGame } from "@/hooks/useGame";
import { captureJoinFromUrl } from "@/lib/utils/joinLink";

export function AdventureApp() {
  const game = useGame();

  useEffect(() => {
    captureJoinFromUrl();
  }, []);

  if (!game.hydrated) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[#121018] text-[#fff4ea]">
        <p className="font-[family-name:var(--font-display)] text-2xl">Gabri × Tati</p>
      </div>
    );
  }

  const screen = game.state?.screen ?? "welcome";

  if (!game.state || screen === "welcome") {
    return <WelcomeScreen game={game} />;
  }

  return (
    <AnimatePresence mode="wait">
      <div key={screen}>
        {screen === "surpriseOne" && <SurpriseOneScreen game={game} />}
        {screen === "surpriseTwo" && <SurpriseTwoScreen game={game} />}
        {screen === "ready" && <ReadyScreen game={game} />}
        {screen === "whoAmI" && <WhoAmIScreen game={game} />}
        {screen === "sessionSetup" && <SessionSetupScreen game={game} />}
        {screen === "players" && <PlayersScreen game={game} />}
        {screen === "food" && <FoodRouletteScreen game={game} />}
        {screen === "colorGabri" && <ColorRevealScreen game={game} player="gabri" />}
        {screen === "colorTati" && <ColorRevealScreen game={game} player="tati" />}
        {screen === "briefing" && <BriefingScreen game={game} />}
        {screen === "mission" && <MissionScreen game={game} />}
        {screen === "colorSwap" && <ColorSwapScreen game={game} />}
        {screen === "event" && <EventScreen game={game} />}
        {screen === "collageGabri" && <AlbumScreen game={game} player="gabri" />}
        {screen === "collageTati" && <AlbumScreen game={game} player="tati" />}
        {screen === "collageJoint" && <JointPhotoScreen game={game} />}
        {screen === "collageTemplates" && <TemplatesScreen game={game} />}
        {screen === "collageGenerate" && <GenerateCollageScreen game={game} />}
        {screen === "results" && <ResultsScreen game={game} />}
      </div>
    </AnimatePresence>
  );
}
