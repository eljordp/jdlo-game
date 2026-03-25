"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Phaser from "phaser";
import { BootScene } from "@/game/scenes/BootScene";
import { IntroScene } from "@/game/scenes/IntroScene";
import { BeachScene } from "@/game/scenes/BeachScene";
import { WrongCrowdScene } from "@/game/scenes/WrongCrowdScene";
import { CourtScene } from "@/game/scenes/CourtScene";
import { JailScene } from "@/game/scenes/JailScene";
import { TractorScene } from "@/game/scenes/TractorScene";
import { ComeUpScene } from "@/game/scenes/ComeUpScene";
import { LAScene } from "@/game/scenes/LAScene";
import { OperatorScene } from "@/game/scenes/OperatorScene";
import { EndScene } from "@/game/scenes/EndScene";
import { GAME_WIDTH, GAME_HEIGHT } from "@/game/config";

const SPEEDS = [
  { label: "1x", value: 1 },
  { label: "1.5x", value: 1.5 },
  { label: "2x", value: 2 },
  { label: "3x", value: 3 },
];

// Virtual input state — shared between React overlay and Phaser scenes
export const virtualInput = {
  left: false,
  right: false,
  up: false,
  down: false,
  action: false,
  actionJustPressed: false,
};

export default function GameCanvas() {
  const gameRef = useRef<Phaser.Game | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [speedIndex, setSpeedIndex] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Detect mobile/touch device
    const checkMobile = () => {
      setIsMobile(
        "ontouchstart" in window ||
        navigator.maxTouchPoints > 0 ||
        window.innerWidth < 768
      );
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);

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
      input: {
        activePointers: 3, // Support multi-touch (d-pad + action button)
      },
      scene: [
        BootScene,
        IntroScene,
        BeachScene,
        WrongCrowdScene,
        CourtScene,
        JailScene,
        TractorScene,
        ComeUpScene,
        LAScene,
        OperatorScene,
        EndScene,
      ],
    };

    gameRef.current = new Phaser.Game(config);

    const timer = setTimeout(() => setShowControls(false), 5000);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", checkMobile);
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
      const speed = SPEEDS[next].value;
      gameRef.current.scene.scenes.forEach((scene) => {
        if (scene.time) scene.time.timeScale = speed;
        if (scene.tweens) scene.tweens.timeScale = speed;
      });
    }
    setShowControls(true);
  }, [speedIndex]);

  // D-pad handlers
  const pressDir = useCallback((dir: "up" | "down" | "left" | "right") => {
    virtualInput[dir] = true;
  }, []);
  const releaseDir = useCallback((dir: "up" | "down" | "left" | "right") => {
    virtualInput[dir] = false;
  }, []);
  const pressAction = useCallback(() => {
    virtualInput.action = true;
    virtualInput.actionJustPressed = true;
    // Reset "just pressed" after a frame
    setTimeout(() => { virtualInput.actionJustPressed = false; }, 100);
  }, []);
  const releaseAction = useCallback(() => {
    virtualInput.action = false;
  }, []);

  return (
    <div className="relative w-screen h-screen bg-black overflow-hidden select-none touch-none">
      <div
        ref={containerRef}
        className="absolute inset-0 flex items-center justify-center"
      />

      {/* Speed control */}
      <div
        className={`absolute top-3 right-3 z-20 flex gap-2 transition-opacity duration-300 ${
          showControls ? "opacity-100" : "opacity-0 hover:opacity-100"
        }`}
        onMouseEnter={() => setShowControls(true)}
      >
        <button
          onClick={cycleSpeed}
          className="px-3 py-1.5 bg-black/70 border border-white/20 rounded text-white text-xs font-mono hover:bg-white/10 transition-colors cursor-pointer"
        >
          {SPEEDS[speedIndex].label}
        </button>
      </div>

      {/* Controls hint — desktop only */}
      {!isMobile && (
        <div
          className={`absolute bottom-3 left-1/2 -translate-x-1/2 text-white/40 text-xs font-mono transition-opacity duration-1000 ${
            showControls ? "opacity-100" : "opacity-0"
          }`}
        >
          Arrow keys / WASD to move · Space to interact
        </div>
      )}

      {/* Mobile controls */}
      {isMobile && (
        <>
          {/* D-Pad — bottom left */}
          <div className="absolute bottom-6 left-6 z-30">
            <div className="relative w-36 h-36">
              {/* Up */}
              <button
                className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-12 bg-white/15 rounded-lg active:bg-white/30 flex items-center justify-center border border-white/10"
                onTouchStart={(e) => { e.preventDefault(); pressDir("up"); }}
                onTouchEnd={() => releaseDir("up")}
                onTouchCancel={() => releaseDir("up")}
              >
                <span className="text-white/60 text-lg">▲</span>
              </button>
              {/* Down */}
              <button
                className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-12 bg-white/15 rounded-lg active:bg-white/30 flex items-center justify-center border border-white/10"
                onTouchStart={(e) => { e.preventDefault(); pressDir("down"); }}
                onTouchEnd={() => releaseDir("down")}
                onTouchCancel={() => releaseDir("down")}
              >
                <span className="text-white/60 text-lg">▼</span>
              </button>
              {/* Left */}
              <button
                className="absolute left-0 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/15 rounded-lg active:bg-white/30 flex items-center justify-center border border-white/10"
                onTouchStart={(e) => { e.preventDefault(); pressDir("left"); }}
                onTouchEnd={() => releaseDir("left")}
                onTouchCancel={() => releaseDir("left")}
              >
                <span className="text-white/60 text-lg">◀</span>
              </button>
              {/* Right */}
              <button
                className="absolute right-0 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/15 rounded-lg active:bg-white/30 flex items-center justify-center border border-white/10"
                onTouchStart={(e) => { e.preventDefault(); pressDir("right"); }}
                onTouchEnd={() => releaseDir("right")}
                onTouchCancel={() => releaseDir("right")}
              >
                <span className="text-white/60 text-lg">▶</span>
              </button>
              {/* Center dot */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-white/5 rounded-full" />
            </div>
          </div>

          {/* Action button — bottom right */}
          <button
            className="absolute bottom-10 right-10 z-30 w-16 h-16 bg-white/15 rounded-full active:bg-white/30 flex items-center justify-center border-2 border-white/20"
            onTouchStart={(e) => { e.preventDefault(); pressAction(); }}
            onTouchEnd={() => releaseAction()}
            onTouchCancel={() => releaseAction()}
          >
            <span className="text-white/70 text-xs font-mono font-bold">A</span>
          </button>

          {/* Speed button — top right, bigger for mobile */}
          <button
            className="absolute top-4 right-4 z-30 px-4 py-2 bg-black/70 border border-white/20 rounded-lg text-white text-sm font-mono active:bg-white/10"
            onClick={cycleSpeed}
          >
            {SPEEDS[speedIndex].label}
          </button>
        </>
      )}
    </div>
  );
}
