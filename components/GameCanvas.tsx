"use client";

import { useEffect, useRef } from "react";
import Phaser from "phaser";
import { BootScene } from "@/game/scenes/BootScene";
import { IntroScene } from "@/game/scenes/IntroScene";
import { BeachScene } from "@/game/scenes/BeachScene";
import { WrongCrowdScene } from "@/game/scenes/WrongCrowdScene";
import { JailScene } from "@/game/scenes/JailScene";
import { TractorScene } from "@/game/scenes/TractorScene";
import { ComeUpScene } from "@/game/scenes/ComeUpScene";
import { OperatorScene } from "@/game/scenes/OperatorScene";
import { EndScene } from "@/game/scenes/EndScene";
import { GAME_WIDTH, GAME_HEIGHT } from "@/game/config";

export default function GameCanvas() {
  const gameRef = useRef<Phaser.Game | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (gameRef.current || !containerRef.current) return;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: GAME_WIDTH,
      height: GAME_HEIGHT,
      parent: containerRef.current,
      pixelArt: true,
      roundPixels: true,
      antialias: false,
      backgroundColor: "#000000",
      physics: {
        default: "arcade",
        arcade: {
          gravity: { x: 0, y: 0 },
          debug: false,
        },
      },
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      scene: [
        BootScene,
        IntroScene,
        BeachScene,
        WrongCrowdScene,
        JailScene,
        TractorScene,
        ComeUpScene,
        OperatorScene,
        EndScene,
      ],
    };

    gameRef.current = new Phaser.Game(config);

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-screen h-screen bg-black flex items-center justify-center"
    />
  );
}
