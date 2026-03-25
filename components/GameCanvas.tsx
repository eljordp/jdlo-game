"use client";

import { useEffect, useRef, useState, useCallback } from "react";
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

const SPEEDS = [
  { label: "1x", value: 1 },
  { label: "1.5x", value: 1.5 },
  { label: "2x", value: 2 },
  { label: "3x", value: 3 },
];

export default function GameCanvas() {
  const gameRef = useRef<Phaser.Game | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [speedIndex, setSpeedIndex] = useState(0);
  const [showControls, setShowControls] = useState(true);

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

    // Auto-hide controls after 5 seconds
    const timer = setTimeout(() => setShowControls(false), 5000);

    return () => {
      clearTimeout(timer);
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  const cycleSpeed = useCallback(() => {
    const next = (speedIndex + 1) % SPEEDS.length;
    setSpeedIndex(next);
    if (gameRef.current) {
      // Set game time scale for all scenes
      const speed = SPEEDS[next].value;
      gameRef.current.scene.scenes.forEach((scene) => {
        if (scene.time) {
          scene.time.timeScale = speed;
        }
        if (scene.tweens) {
          scene.tweens.timeScale = speed;
        }
      });
    }
    setShowControls(true);
  }, [speedIndex]);

  return (
    <div className="relative w-screen h-screen bg-black">
      <div
        ref={containerRef}
        className="w-full h-full flex items-center justify-center"
      />

      {/* Speed control + help overlay */}
      <div
        className={`absolute top-3 right-3 flex gap-2 transition-opacity duration-300 ${
          showControls ? "opacity-100" : "opacity-0 hover:opacity-100"
        }`}
        onMouseEnter={() => setShowControls(true)}
      >
        <button
          onClick={cycleSpeed}
          className="px-3 py-1.5 bg-black/70 border border-white/20 rounded text-white text-xs font-mono hover:bg-white/10 transition-colors cursor-pointer select-none"
          title="Change game speed"
        >
          {SPEEDS[speedIndex].label}
        </button>
      </div>

      {/* Controls hint */}
      <div
        className={`absolute bottom-3 left-1/2 -translate-x-1/2 text-white/40 text-xs font-mono transition-opacity duration-1000 ${
          showControls ? "opacity-100" : "opacity-0"
        }`}
      >
        Arrow keys / WASD to move · Space to interact
      </div>
    </div>
  );
}
