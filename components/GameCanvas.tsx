"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Phaser from "phaser";
import { BootScene } from "@/game/scenes/BootScene";
import { MenuScene } from "@/game/scenes/MenuScene";
import { IntroScene } from "@/game/scenes/IntroScene";
import { HomeScene } from "@/game/scenes/HomeScene";
import { BeachScene } from "@/game/scenes/BeachScene";
import { WeedRiseScene } from "@/game/scenes/WeedRiseScene";
import { StateStreetScene } from "@/game/scenes/StateStreetScene";
import { WrongCrowdScene } from "@/game/scenes/WrongCrowdScene";
import { SpiralScene } from "@/game/scenes/SpiralScene";
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
import { SoundEffects } from "@/game/systems/SoundEffects";
import DirectorPanel from "@/components/DirectorPanel";

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
  menuJustPressed: false,
  navUpJustPressed: false,
  navDownJustPressed: false,
  navLeftJustPressed: false,
  navRightJustPressed: false,
  gameSpeed: 1,
};

const directionReleaseTimers: Partial<Record<'up' | 'down' | 'left' | 'right', ReturnType<typeof setTimeout>>> = {};

// Kept separate from touch input so releasing a stick cannot cancel a finger
// that is still holding the on-screen D-pad.
export const gamepadInput = {
  left: false,
  right: false,
  up: false,
  down: false,
  actionJustPressed: false,
  cancelJustPressed: false,
  menuJustPressed: false,
  navUpJustPressed: false,
  navDownJustPressed: false,
  navLeftJustPressed: false,
  navRightJustPressed: false,
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
  const [isPortrait, setIsPortrait] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [controllerConnected, setControllerConnected] = useState(false);
  const [dialogueActive, setDialogueActive] = useState(false);
  const [showDirector, setShowDirector] = useState(false);
  const dialogueActiveRef = useRef(false);

  // Director panel is DEV-ONLY: players never see it. Access it by adding
  // ?dev to the URL (or on localhost). Keeps it to JP + Codex.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setShowDirector(
      params.has('dev') || params.has('director') || window.location.hostname === 'localhost'
    );
  }, []);

  useEffect(() => {
    // Detect mobile/touch device
    const checkMobileLayout = () => {
      setIsMobile(
        "ontouchstart" in window ||
        navigator.maxTouchPoints > 0 ||
        window.innerWidth < 900
      );
      setIsPortrait(window.innerHeight > window.innerWidth);
    };
    checkMobileLayout();
    window.addEventListener("resize", checkMobileLayout);
    window.addEventListener("orientationchange", checkMobileLayout);

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
        WeedRiseScene,
      SpiralScene,
        StateStreetScene,
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
      window.removeEventListener("resize", checkMobileLayout);
      window.removeEventListener("orientationchange", checkMobileLayout);
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    let frame = 0;
    let wasConnected = false;
    let previous = {
      up: false, down: false, left: false, right: false,
      action: false, cancel: false, menu: false, phone: false, inventory: false,
    };

    const pollGamepad = () => {
      const activeDialogue = Boolean(gameRef.current?.scene.getScenes(true).some((scene) => {
        const dialogue = (scene as unknown as { dialogue?: { isActive?: () => boolean } }).dialogue;
        return dialogue?.isActive?.();
      }));
      if (activeDialogue !== dialogueActiveRef.current) {
        dialogueActiveRef.current = activeDialogue;
        setDialogueActive(activeDialogue);
      }

      const pad = typeof navigator.getGamepads === "function"
        ? Array.from(navigator.getGamepads()).find((candidate): candidate is Gamepad => Boolean(candidate?.connected))
        : undefined;
      const connected = Boolean(pad);
      if (connected !== wasConnected) {
        wasConnected = connected;
        setControllerConnected(connected);
      }

      const pressed = (index: number) => Boolean(pad?.buttons[index]?.pressed);
      const horizontal = pad?.axes[0] ?? 0;
      const vertical = pad?.axes[1] ?? 0;
      const next = {
        up: pressed(12) || vertical < -0.35,
        down: pressed(13) || vertical > 0.35,
        left: pressed(14) || horizontal < -0.35,
        right: pressed(15) || horizontal > 0.35,
        action: pressed(0),
        cancel: pressed(1),
        menu: pressed(9),
        phone: pressed(2),
        inventory: pressed(3),
      };

      gamepadInput.up = next.up;
      gamepadInput.down = next.down;
      gamepadInput.left = next.left;
      gamepadInput.right = next.right;
      if (next.up && !previous.up) gamepadInput.navUpJustPressed = true;
      if (next.down && !previous.down) gamepadInput.navDownJustPressed = true;
      if (next.left && !previous.left) gamepadInput.navLeftJustPressed = true;
      if (next.right && !previous.right) gamepadInput.navRightJustPressed = true;
      if (next.action && !previous.action) gamepadInput.actionJustPressed = true;
      if (next.cancel && !previous.cancel) gamepadInput.cancelJustPressed = true;
      if (next.menu && !previous.menu) gamepadInput.menuJustPressed = true;
      if (next.phone && !previous.phone) {
        virtualInput.phoneJustPressed = true;
        setTimeout(() => { virtualInput.phoneJustPressed = false; }, 120);
      }
      if (next.inventory && !previous.inventory) {
        virtualInput.inventoryJustPressed = true;
        setTimeout(() => { virtualInput.inventoryJustPressed = false; }, 120);
      }
      previous = next;
      frame = requestAnimationFrame(pollGamepad);
    };

    frame = requestAnimationFrame(pollGamepad);
    return () => cancelAnimationFrame(frame);
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

  const applyDirectorSpeed = useCallback((speed: number) => {
    virtualInput.gameSpeed = speed;
    if (!gameRef.current) return;
    gameRef.current.scene.scenes.forEach((scene) => {
      if (scene.time) scene.time.timeScale = speed;
      if (scene.tweens) scene.tweens.timeScale = speed;
    });
  }, []);

  // D-pad handlers
  const pressDir = useCallback((dir: "up" | "down" | "left" | "right") => {
    const pendingRelease = directionReleaseTimers[dir];
    if (pendingRelease) clearTimeout(pendingRelease);
    virtualInput[dir] = true;
    const pulse = `${dir === "up" ? "navUp" : dir === "down" ? "navDown" : dir === "left" ? "navLeft" : "navRight"}JustPressed` as
      'navUpJustPressed' | 'navDownJustPressed' | 'navLeftJustPressed' | 'navRightJustPressed';
    virtualInput[pulse] = true;
  }, []);
  const releaseDir = useCallback((dir: "up" | "down" | "left" | "right") => {
    // Preserve a short pulse for quick taps so one touch cannot begin and end
    // between Phaser frames. Holding still behaves continuously.
    directionReleaseTimers[dir] = setTimeout(() => {
      virtualInput[dir] = false;
      delete directionReleaseTimers[dir];
    }, 70);
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
      onPointerDown={() => {
        MusicSystem.unlock();
        SoundEffects.unlock();
      }}
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

      {!isMobile && showDirector && <DirectorPanel gameRef={gameRef} onSpeedChange={applyDirectorSpeed} />}

      {/* Desktop shortcuts. Phone gets larger dedicated touch controls below. */}
      {!isMobile && <div className="absolute bottom-3 right-3 z-20 flex gap-2">
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
      </div>}

      {/* Controls hint — desktop only */}
      {!isMobile && (
        <div
          className={`absolute bottom-3 left-1/2 -translate-x-1/2 text-white/40 text-xs font-mono transition-opacity duration-1000 ${
            showControls ? "opacity-100" : "opacity-0"
          }`}
        >
          {controllerConnected
            ? 'Controller · A interact · B back · START menu · X phone · Y bag'
            : 'WASD / arrows move · Space interact · M menu · P phone · I bag'}
        </div>
      )}

      {/* Mobile: portrait rotation prompt */}
      {isMobile && isPortrait && (
        <div className="absolute inset-0 z-50 bg-black flex flex-col items-center justify-center gap-6">
          <div className="text-4xl animate-bounce">📱</div>
          <p className="text-white font-mono text-sm text-center px-8">
            Rotate your phone for the best experience
          </p>
          <p className="text-white/40 font-mono text-xs">Landscape mode</p>
        </div>
      )}

      {/* Mobile controls — landscape overlay ON the game (DS/Pokemon style) */}
      {isMobile && !isPortrait && (
        <div className="pointer-events-none">
          {/* D-Pad — bottom left, cross pattern */}
          <div
            style={{ left: 'calc(env(safe-area-inset-left, 0px) + 16px)', bottom: 'calc(env(safe-area-inset-bottom, 0px) + 30px)' }}
            className={`absolute z-30 transition-opacity duration-150 ${
            dialogueActive ? 'pointer-events-none opacity-0' : 'pointer-events-auto opacity-100'
          }`}>
            <div className="relative" style={{ width: 124, height: 124 }}>
              {/* Center hub */}
              <div
                className="absolute rounded-full"
                style={{
                  width: 22, height: 22,
                  left: 51, top: 51,
                  backgroundColor: '#222222',
                }}
              />
              {/* Up */}
              <button
                aria-label="Move up"
                className="absolute flex items-center justify-center rounded-t-xl active:brightness-150 transition-all"
                style={{
                  width: 48, height: 48,
                  left: 38, top: 0,
                  backgroundColor: '#333333',
                  border: '2px solid #444444',
                }}
                onPointerDown={(e) => { e.preventDefault(); pressDir("up"); }}
                onPointerUp={() => releaseDir("up")}
                onPointerCancel={() => releaseDir("up")}
                onPointerLeave={() => releaseDir("up")}
              >
                <span className="text-white text-xl font-bold" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>&#9650;</span>
              </button>
              {/* Down */}
              <button
                aria-label="Move down"
                className="absolute flex items-center justify-center rounded-b-xl active:brightness-150 transition-all"
                style={{
                  width: 48, height: 48,
                  left: 38, top: 76,
                  backgroundColor: '#333333',
                  border: '2px solid #444444',
                }}
                onPointerDown={(e) => { e.preventDefault(); pressDir("down"); }}
                onPointerUp={() => releaseDir("down")}
                onPointerCancel={() => releaseDir("down")}
                onPointerLeave={() => releaseDir("down")}
              >
                <span className="text-white text-xl font-bold" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>&#9660;</span>
              </button>
              {/* Left */}
              <button
                aria-label="Move left"
                className="absolute flex items-center justify-center rounded-l-xl active:brightness-150 transition-all"
                style={{
                  width: 48, height: 48,
                  left: 0, top: 38,
                  backgroundColor: '#333333',
                  border: '2px solid #444444',
                }}
                onPointerDown={(e) => { e.preventDefault(); pressDir("left"); }}
                onPointerUp={() => releaseDir("left")}
                onPointerCancel={() => releaseDir("left")}
                onPointerLeave={() => releaseDir("left")}
              >
                <span className="text-white text-xl font-bold" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>&#9664;</span>
              </button>
              {/* Right */}
              <button
                aria-label="Move right"
                className="absolute flex items-center justify-center rounded-r-xl active:brightness-150 transition-all"
                style={{
                  width: 48, height: 48,
                  left: 76, top: 38,
                  backgroundColor: '#333333',
                  border: '2px solid #444444',
                }}
                onPointerDown={(e) => { e.preventDefault(); pressDir("right"); }}
                onPointerUp={() => releaseDir("right")}
                onPointerCancel={() => releaseDir("right")}
                onPointerLeave={() => releaseDir("right")}
              >
                <span className="text-white text-xl font-bold" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>&#9654;</span>
              </button>
            </div>
          </div>

          {/* A button — bottom right, large green circle (interact / advance dialogue) */}
          <button
            aria-label="Interact"
            className={`absolute z-30 flex items-center justify-center rounded-full active:brightness-150 transition-all ${
              dialogueActive ? 'pointer-events-auto top-16 h-14 w-14' : 'pointer-events-auto h-[70px] w-[70px]'
            }`}
            style={{
              right: dialogueActive ? 'calc(env(safe-area-inset-right, 0px) + 16px)' : 'calc(env(safe-area-inset-right, 0px) + 20px)',
              ...(dialogueActive ? {} : { bottom: 'calc(env(safe-area-inset-bottom, 0px) + 34px)' }),
              backgroundColor: 'rgba(34, 204, 68, 0.45)',
              border: '3px solid rgba(34, 204, 68, 0.6)',
              boxShadow: '0 2px 8px rgba(34, 204, 68, 0.3), inset 0 -2px 4px rgba(0,0,0,0.3)',
            }}
            onPointerDown={(e) => { e.preventDefault(); pressAction(); }}
            onPointerUp={() => releaseAction()}
            onPointerCancel={() => releaseAction()}
            onPointerLeave={() => releaseAction()}
          >
            <span className="text-white font-mono font-bold text-lg" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>A</span>
          </button>

          {/* B button — above-left of A, smaller red circle (cancel / back) */}
          <button
            aria-label="Back"
            className={`absolute z-30 flex items-center justify-center rounded-full active:brightness-150 transition-all ${
              dialogueActive ? 'pointer-events-none opacity-0' : 'pointer-events-auto opacity-100'
            }`}
            style={{
              width: 52, height: 52,
              bottom: 'calc(env(safe-area-inset-bottom, 0px) + 104px)', right: 'calc(env(safe-area-inset-right, 0px) + 78px)',
              backgroundColor: 'rgba(204, 34, 68, 0.45)',
              border: '3px solid rgba(204, 34, 68, 0.6)',
              boxShadow: '0 2px 8px rgba(204, 34, 68, 0.3), inset 0 -2px 4px rgba(0,0,0,0.3)',
            }}
            onPointerDown={(e) => { e.preventDefault(); pressCancel(); }}
          >
            <span className="text-white font-mono font-bold text-sm" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>B</span>
          </button>

          {/* Phone button — top right area */}
          <button
            aria-label="Open phone"
            className={`absolute z-30 flex items-center justify-center rounded-lg active:brightness-150 transition-all ${
              dialogueActive ? 'pointer-events-none opacity-0' : 'pointer-events-auto opacity-100'
            }`}
            style={{
              width: 42, height: 42,
              bottom: 'calc(env(safe-area-inset-bottom, 0px) + 148px)', right: 'calc(env(safe-area-inset-right, 0px) + 24px)',
              backgroundColor: 'rgba(255,255,255,0.08)',
              border: '2px solid rgba(255,255,255,0.15)',
            }}
            onPointerDown={(e) => {
              e.preventDefault();
              virtualInput.phoneJustPressed = true;
              setTimeout(() => { virtualInput.phoneJustPressed = false; }, 100);
            }}
          >
            <span className="text-white/60 text-lg">&#128241;</span>
          </button>

          {/* Bag stays reachable on phones without crowding the A/B cluster. */}
          <button
            aria-label="Open bag"
            className={`absolute z-30 flex items-center justify-center rounded-lg active:brightness-150 transition-all ${
              dialogueActive ? 'pointer-events-none opacity-0' : 'pointer-events-auto opacity-100'
            }`}
            style={{
              width: 42, height: 42,
              bottom: 'calc(env(safe-area-inset-bottom, 0px) + 148px)', right: 'calc(env(safe-area-inset-right, 0px) + 72px)',
              backgroundColor: 'rgba(255,255,255,0.08)',
              border: '2px solid rgba(255,255,255,0.15)',
            }}
            onPointerDown={(e) => {
              e.preventDefault();
              virtualInput.inventoryJustPressed = true;
              setTimeout(() => { virtualInput.inventoryJustPressed = false; }, 100);
            }}
          >
            <span className="text-white/60 text-lg">&#127890;</span>
          </button>

          {/* Emote button — above phone */}
          <button
            aria-label="Emote"
            className={`absolute z-30 flex items-center justify-center rounded-lg active:brightness-150 transition-all ${
              dialogueActive ? 'pointer-events-none opacity-0' : 'pointer-events-auto opacity-100'
            }`}
            style={{
              width: 42, height: 42,
              bottom: 'calc(env(safe-area-inset-bottom, 0px) + 196px)', right: 'calc(env(safe-area-inset-right, 0px) + 24px)',
              backgroundColor: 'rgba(255,255,255,0.08)',
              border: '2px solid rgba(255,255,255,0.15)',
            }}
            onPointerDown={(e) => {
              e.preventDefault();
              virtualInput.emoteJustPressed = true;
              setTimeout(() => { virtualInput.emoteJustPressed = false; }, 100);
            }}
          >
            <span className="text-white/60 text-lg">&#128548;</span>
          </button>

          {/* Pause/menu button — reachable without a keyboard */}
          <button
            aria-label="Open menu"
            className={`absolute z-30 flex items-center justify-center rounded-lg active:brightness-150 transition-all ${
              dialogueActive ? 'pointer-events-none opacity-0' : 'pointer-events-auto opacity-100'
            }`}
            style={{
              width: 54, height: 34,
              bottom: 'calc(env(safe-area-inset-bottom, 0px) + 248px)', right: 'calc(env(safe-area-inset-right, 0px) + 18px)',
              backgroundColor: 'rgba(255,255,255,0.08)',
              border: '2px solid rgba(255,255,255,0.15)',
            }}
            onPointerDown={(e) => {
              e.preventDefault();
              virtualInput.menuJustPressed = true;
              setTimeout(() => { virtualInput.menuJustPressed = false; }, 100);
            }}
          >
            <span className="text-white/60 font-mono text-[9px]">MENU</span>
          </button>
        </div>
      )}
    </div>
  );
}
