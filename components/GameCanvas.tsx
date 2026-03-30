"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Phaser from "phaser";
import { BootScene } from "@/game/scenes/BootScene";
import { MenuScene } from "@/game/scenes/MenuScene";
import { IntroScene } from "@/game/scenes/IntroScene";
import { HomeScene } from "@/game/scenes/HomeScene";
import { BeachScene } from "@/game/scenes/BeachScene";
import { WrongCrowdScene } from "@/game/scenes/WrongCrowdScene";
import { CourtScene } from "@/game/scenes/CourtScene";
import { JailScene } from "@/game/scenes/JailScene";
import { TractorScene } from "@/game/scenes/TractorScene";
import { ComeUpScene } from "@/game/scenes/ComeUpScene";
import { LAScene } from "@/game/scenes/LAScene";
import { OperatorScene } from "@/game/scenes/OperatorScene";
import { ReleaseScene } from "@/game/scenes/ReleaseScene";
import { EndScene } from "@/game/scenes/EndScene";
import { VegasScene } from "@/game/scenes/VegasScene";
import { HomeReturnScene } from "@/game/scenes/HomeReturnScene";
import { TransitionScene } from "@/game/scenes/TransitionScene";
import { GAME_WIDTH, GAME_HEIGHT } from "@/game/config";
import { MusicSystem } from "@/game/systems/MusicSystem";

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
  cancelJustPressed: false,
  phoneJustPressed: false,
  emoteJustPressed: false,
  inventoryJustPressed: false,
  gameSpeed: 1,
};

// Expose to window for Playwright/automation testing
if (typeof window !== 'undefined') {
  (window as unknown as Record<string, unknown>).vi = virtualInput;
  (window as unknown as Record<string, unknown>).move = (dir: string, ms = 300) => {
    virtualInput[dir as 'up' | 'down' | 'left' | 'right'] = true;
    setTimeout(() => { virtualInput[dir as 'up' | 'down' | 'left' | 'right'] = false; }, ms);
  };
  (window as unknown as Record<string, unknown>).act = () => {
    virtualInput.action = true;
    virtualInput.actionJustPressed = true;
    setTimeout(() => { virtualInput.actionJustPressed = false; virtualInput.action = false; }, 150);
  };
  // walk(steps) — queue tile-by-tile moves for Playwright. Example: walk('rrrdddd') = right 3, down 4
  (window as unknown as Record<string, unknown>).walk = (steps: string): Promise<void> => {
    const dirMap: Record<string, string> = { u: 'up', d: 'down', l: 'left', r: 'right' };
    return new Promise((resolve) => {
      let i = 0;
      const next = () => {
        if (i >= steps.length) { resolve(); return; }
        const dir = dirMap[steps[i]] || steps[i];
        i++;
        virtualInput[dir as 'up' | 'down' | 'left' | 'right'] = true;
        setTimeout(() => {
          virtualInput[dir as 'up' | 'down' | 'left' | 'right'] = false;
          setTimeout(next, 100); // small gap between moves
        }, 250);
      };
      next();
    });
  };
  // dismiss(n) — press act n times with delays to clear dialogue
  (window as unknown as Record<string, unknown>).dismiss = (n = 15): Promise<void> => {
    return new Promise((resolve) => {
      let i = 0;
      const go = () => {
        if (i >= n) { resolve(); return; }
        i++;
        virtualInput.action = true;
        virtualInput.actionJustPressed = true;
        setTimeout(() => { virtualInput.actionJustPressed = false; virtualInput.action = false; }, 100);
        setTimeout(go, 250);
      };
      go();
    });
  };
  // Dev helpers for Playwright/console testing
  // Usage: scene() — get active scene, tp(x,y) — teleport player, day2() — skip to day 2
  (window as unknown as Record<string, unknown>).getScene = () => {
    const g = (window as unknown as Record<string, unknown>).game as Phaser.Game | undefined;
    return g ? g.scene.getScenes(true)[0] : null;
  };
  (window as unknown as Record<string, unknown>).tp = (tileX: number, tileY: number) => {
    const g = (window as unknown as Record<string, unknown>).game as Phaser.Game | undefined;
    if (!g) return;
    const s = g.scene.getScenes(true)[0] as unknown as Record<string, unknown>;
    if (s?.player) {
      const SCALED_TILE = 64;
      (s.player as Phaser.GameObjects.Sprite).setPosition(
        tileX * SCALED_TILE + SCALED_TILE / 2,
        tileY * SCALED_TILE + SCALED_TILE / 2
      );
    }
  };
  (window as unknown as Record<string, unknown>).day2 = () => {
    const g = (window as unknown as Record<string, unknown>).game as Phaser.Game | undefined;
    if (!g) return;
    const s = g.scene.getScenes(true)[0] as unknown as Record<string, unknown>;
    if (s && 'currentDay' in s) (s as Record<string, unknown>).currentDay = 2;
  };
  (window as unknown as Record<string, unknown>).unfreeze = () => {
    const g = (window as unknown as Record<string, unknown>).game as Phaser.Game | undefined;
    if (!g) return;
    const s = g.scene.getScenes(true)[0] as unknown as Record<string, unknown>;
    if (s && 'frozen' in s) (s as Record<string, unknown>).frozen = false;
  };
}

export default function GameCanvas() {
  const gameRef = useRef<Phaser.Game | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [speedIndex, setSpeedIndex] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

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
        MenuScene,
        IntroScene,
        HomeScene,
        BeachScene,
        WrongCrowdScene,
        CourtScene,
        JailScene,
        ReleaseScene,
        TractorScene,
        ComeUpScene,
        LAScene,
        OperatorScene,
        VegasScene,
        HomeReturnScene,
        EndScene,
        TransitionScene,
      ],
    };

    gameRef.current = new Phaser.Game(config);

    // Expose game to window for Playwright/automation
    (window as unknown as Record<string, unknown>).game = gameRef.current;
    (window as unknown as Record<string, unknown>).goTo = (sceneName: string) => {
      if (!gameRef.current) return;
      const active = gameRef.current.scene.getScenes(true);
      for (const s of active) gameRef.current.scene.stop(s.scene.key);
      gameRef.current.scene.start(sceneName);
    };

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

  const toggleMute = useCallback(() => {
    const muted = MusicSystem.toggleMute();
    setIsMuted(muted);
  }, []);

  const cycleSpeed = useCallback(() => {
    const next = (speedIndex + 1) % SPEEDS.length;
    setSpeedIndex(next);
    if (gameRef.current) {
      const speed = SPEEDS[next].value;
      virtualInput.gameSpeed = speed;
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
  const pressCancel = useCallback(() => {
    virtualInput.cancelJustPressed = true;
    setTimeout(() => { virtualInput.cancelJustPressed = false; }, 100);
  }, []);

  return (
    <div
      className="relative w-screen h-screen bg-black overflow-hidden select-none touch-none"
      onClick={() => {
        // Re-focus canvas so Phaser keyboard input works after clicking HTML buttons
        const canvas = containerRef.current?.querySelector('canvas');
        if (canvas) canvas.focus();
      }}
    >
      <div
        ref={containerRef}
        className="w-full h-full"
      />

      {/* Top controls — always visible */}
      <div className="absolute top-3 right-3 z-20 flex gap-2">
        <button
          onClick={toggleMute}
          className="px-3 py-1.5 bg-black/70 border border-white/20 rounded text-white text-xs font-mono hover:bg-white/10 transition-colors cursor-pointer"
          title={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? "OFF" : "SND"}
        </button>
        <button
          onClick={cycleSpeed}
          className="px-3 py-1.5 bg-black/70 border border-white/20 rounded text-white text-xs font-mono hover:bg-white/10 transition-colors cursor-pointer"
        >
          {SPEEDS[speedIndex].label}
        </button>
      </div>

      {/* Chapter jump + dev controls — top left */}
      <div className="absolute top-3 left-3 z-20 flex gap-1">
        <select
          onChange={(e) => {
            const scene = e.target.value;
            if (!scene || !gameRef.current) return;
            const active = gameRef.current.scene.getScenes(true);
            for (const s of active) gameRef.current.scene.stop(s.scene.key);
            gameRef.current.scene.start(scene);
            e.target.value = '';
          }}
          className="px-2 py-1.5 bg-black/70 border border-white/20 rounded text-white text-xs font-mono cursor-pointer appearance-none"
          defaultValue=""
        >
          <option value="" disabled>CH</option>
          <option value="IntroScene">Intro</option>
          <option value="HomeScene">Ch1 Home</option>
          <option value="BeachScene">Ch2 SB</option>
          <option value="WrongCrowdScene">Ch3 Night</option>
          <option value="CourtScene">Court</option>
          <option value="JailScene">Ch4 Jail</option>
          <option value="ReleaseScene">Release</option>
          <option value="TractorScene">Ch5 Caymus</option>
          <option value="ComeUpScene">Ch6 Come Up</option>
          <option value="LAScene">LA Scene</option>
          <option value="OperatorScene">Ch7 LA</option>
          <option value="VegasScene">Vegas</option>
          <option value="HomeReturnScene">Home Return</option>
          <option value="EndScene">End</option>
          <option value="MenuScene">Menu</option>
        </select>
        <button
          onClick={() => {
            if (!gameRef.current) return;
            const s = gameRef.current.scene.getScenes(true)[0] as unknown as Record<string, unknown>;
            if (s && 'currentDay' in s) {
              const cur = s.currentDay as number;
              (s as Record<string, unknown>).currentDay = cur >= 3 ? 1 : cur + 1;
            }
          }}
          className="px-2 py-1.5 bg-black/70 border border-white/20 rounded text-white text-xs font-mono hover:bg-white/10 transition-colors cursor-pointer"
          title="Advance day (for multi-day scenes)"
        >
          DAY+
        </button>
        <button
          onClick={() => {
            if (!gameRef.current) return;
            const s = gameRef.current.scene.getScenes(true)[0] as unknown as Record<string, unknown>;
            if (s && 'frozen' in s) (s as Record<string, unknown>).frozen = false;
          }}
          className="px-2 py-1.5 bg-black/70 border border-white/20 rounded text-white text-xs font-mono hover:bg-white/10 transition-colors cursor-pointer"
          title="Unfreeze (unstick from stuck states)"
        >
          GO
        </button>
      </div>

      {/* Bottom right — phone, inventory, emote buttons (always visible) */}
      <div className="absolute bottom-3 right-3 z-20 flex gap-2">
        <button
          onClick={() => {
            virtualInput.emoteJustPressed = true;
            setTimeout(() => { virtualInput.emoteJustPressed = false; }, 100);
          }}
          className="px-3 py-2 bg-black/70 border border-white/20 rounded text-white text-sm font-mono hover:bg-white/10 transition-colors cursor-pointer"
          title="Emotes (E)"
        >
          😤
        </button>
        <button
          onClick={() => {
            virtualInput.inventoryJustPressed = true;
            setTimeout(() => { virtualInput.inventoryJustPressed = false; }, 100);
          }}
          className="px-3 py-2 bg-black/70 border border-white/20 rounded text-white text-sm font-mono hover:bg-white/10 transition-colors cursor-pointer"
          title="Inventory (I)"
        >
          🎒
        </button>
        <button
          onClick={() => {
            virtualInput.phoneJustPressed = true;
            setTimeout(() => { virtualInput.phoneJustPressed = false; }, 100);
          }}
          className="px-3 py-2 bg-black/70 border border-white/20 rounded text-white text-sm font-mono hover:bg-white/10 transition-colors cursor-pointer"
          title="Phone (TAB)"
        >
          📱
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

      {/* Mobile: portrait rotation prompt */}
      {isMobile && (
        <div className="absolute inset-0 z-50 bg-black flex flex-col items-center justify-center gap-6 portrait:flex landscape:hidden">
          <div className="text-4xl animate-bounce">📱</div>
          <p className="text-white font-mono text-sm text-center px-8">
            Rotate your phone for the best experience
          </p>
          <p className="text-white/40 font-mono text-xs">Landscape mode</p>
        </div>
      )}

      {/* Mobile controls — landscape overlay ON the game (DS/Pokemon style) */}
      {isMobile && (
        <div className="portrait:hidden landscape:block">
          {/* D-Pad — bottom left, cross pattern */}
          <div className="absolute bottom-4 left-4 z-30">
            <div className="relative" style={{ width: 156, height: 156 }}>
              {/* Center hub */}
              <div
                className="absolute rounded-full"
                style={{
                  width: 28, height: 28,
                  left: 64, top: 64,
                  backgroundColor: '#222222',
                }}
              />
              {/* Up */}
              <button
                className="absolute flex items-center justify-center rounded-t-xl active:brightness-150 transition-all"
                style={{
                  width: 60, height: 60,
                  left: 48, top: 0,
                  backgroundColor: '#333333',
                  border: '2px solid #444444',
                }}
                onTouchStart={(e) => { e.preventDefault(); pressDir("up"); }}
                onTouchEnd={() => releaseDir("up")}
                onTouchCancel={() => releaseDir("up")}
              >
                <span className="text-white text-xl font-bold" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>&#9650;</span>
              </button>
              {/* Down */}
              <button
                className="absolute flex items-center justify-center rounded-b-xl active:brightness-150 transition-all"
                style={{
                  width: 60, height: 60,
                  left: 48, top: 96,
                  backgroundColor: '#333333',
                  border: '2px solid #444444',
                }}
                onTouchStart={(e) => { e.preventDefault(); pressDir("down"); }}
                onTouchEnd={() => releaseDir("down")}
                onTouchCancel={() => releaseDir("down")}
              >
                <span className="text-white text-xl font-bold" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>&#9660;</span>
              </button>
              {/* Left */}
              <button
                className="absolute flex items-center justify-center rounded-l-xl active:brightness-150 transition-all"
                style={{
                  width: 60, height: 60,
                  left: 0, top: 48,
                  backgroundColor: '#333333',
                  border: '2px solid #444444',
                }}
                onTouchStart={(e) => { e.preventDefault(); pressDir("left"); }}
                onTouchEnd={() => releaseDir("left")}
                onTouchCancel={() => releaseDir("left")}
              >
                <span className="text-white text-xl font-bold" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>&#9664;</span>
              </button>
              {/* Right */}
              <button
                className="absolute flex items-center justify-center rounded-r-xl active:brightness-150 transition-all"
                style={{
                  width: 60, height: 60,
                  left: 96, top: 48,
                  backgroundColor: '#333333',
                  border: '2px solid #444444',
                }}
                onTouchStart={(e) => { e.preventDefault(); pressDir("right"); }}
                onTouchEnd={() => releaseDir("right")}
                onTouchCancel={() => releaseDir("right")}
              >
                <span className="text-white text-xl font-bold" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>&#9654;</span>
              </button>
            </div>
          </div>

          {/* A button — bottom right, large green circle (interact / advance dialogue) */}
          <button
            className="absolute z-30 flex items-center justify-center rounded-full active:brightness-150 transition-all"
            style={{
              width: 70, height: 70,
              bottom: 16, right: 20,
              backgroundColor: 'rgba(34, 204, 68, 0.45)',
              border: '3px solid rgba(34, 204, 68, 0.6)',
              boxShadow: '0 2px 8px rgba(34, 204, 68, 0.3), inset 0 -2px 4px rgba(0,0,0,0.3)',
            }}
            onTouchStart={(e) => { e.preventDefault(); pressAction(); }}
            onTouchEnd={() => releaseAction()}
            onTouchCancel={() => releaseAction()}
          >
            <span className="text-white font-mono font-bold text-lg" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>A</span>
          </button>

          {/* B button — above-left of A, smaller red circle (cancel / back) */}
          <button
            className="absolute z-30 flex items-center justify-center rounded-full active:brightness-150 transition-all"
            style={{
              width: 52, height: 52,
              bottom: 88, right: 80,
              backgroundColor: 'rgba(204, 34, 68, 0.45)',
              border: '3px solid rgba(204, 34, 68, 0.6)',
              boxShadow: '0 2px 8px rgba(204, 34, 68, 0.3), inset 0 -2px 4px rgba(0,0,0,0.3)',
            }}
            onTouchStart={(e) => { e.preventDefault(); pressCancel(); }}
          >
            <span className="text-white font-mono font-bold text-sm" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>B</span>
          </button>

          {/* Phone button — top right area */}
          <button
            className="absolute z-30 flex items-center justify-center rounded-lg active:brightness-150 transition-all"
            style={{
              width: 42, height: 42,
              bottom: 148, right: 24,
              backgroundColor: 'rgba(255,255,255,0.08)',
              border: '2px solid rgba(255,255,255,0.15)',
            }}
            onTouchStart={(e) => {
              e.preventDefault();
              virtualInput.phoneJustPressed = true;
              setTimeout(() => { virtualInput.phoneJustPressed = false; }, 100);
            }}
          >
            <span className="text-white/60 text-lg">&#128241;</span>
          </button>

          {/* Emote button — above phone */}
          <button
            className="absolute z-30 flex items-center justify-center rounded-lg active:brightness-150 transition-all"
            style={{
              width: 42, height: 42,
              bottom: 196, right: 24,
              backgroundColor: 'rgba(255,255,255,0.08)',
              border: '2px solid rgba(255,255,255,0.15)',
            }}
            onTouchStart={(e) => {
              e.preventDefault();
              virtualInput.emoteJustPressed = true;
              setTimeout(() => { virtualInput.emoteJustPressed = false; }, 100);
            }}
          >
            <span className="text-white/60 text-lg">&#128548;</span>
          </button>
        </div>
      )}
    </div>
  );
}
