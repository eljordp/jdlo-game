"use client";

import { useCallback, useEffect, useMemo, useState, type RefObject } from "react";
import type Phaser from "phaser";
import { SCALED_TILE } from "@/game/config";

type DirectorGameRef = RefObject<Phaser.Game | null>;

type DirectorTarget = {
  id: string;
  label: string;
  type: "interaction" | "npc";
  x: number;
  y: number;
};

type DirectorScene = Phaser.Scene & {
  chapterTitle?: string;
  player?: Phaser.GameObjects.Sprite;
  interactions?: {
    getVisuals?: () => Array<{ id: string; x: number; y: number }>;
  };
  npcs?: Array<{ id: string; sprite: Phaser.GameObjects.Sprite; dialogue: unknown[] }>;
  dialogue?: {
    isActive?: () => boolean;
    advance?: () => void;
    inputCooldown?: number;
  };
  collisionTiles?: Set<string>;
  mapWidth?: number;
  mapHeight?: number;
  facing?: "down" | "up" | "left" | "right";
  frozen?: boolean;
  currentDay?: number;
  requiredInteractionId?: string;
  requiredDone?: boolean;
  getChapterDialogue?: () => { npcs: Record<string, unknown[]> };
  refreshObjectiveHint?: () => void;
  directorTriggerTarget?: (targetId: string, targetType: "npc" | "interaction") => boolean;
  [key: string]: unknown;
};

const SCENES = [
  { group: "Opening", key: "MenuScene", label: "Main menu" },
  { group: "Opening", key: "IntroScene", label: "Documentary intro" },
  { group: "Chapters", key: "HomeScene", label: "1. Home" },
  { group: "Chapters", key: "BeachScene", label: "2. Santa Barbara" },
  { group: "Chapters", key: "WeedRiseScene", label: "3. Weed Rise" },
  { group: "Chapters", key: "WrongCrowdScene", label: "4. Wrong Crowd" },
  { group: "Transitions", key: "CourtScene", label: "Court" },
  { group: "Chapters", key: "JailScene", label: "5. Locked Up" },
  { group: "Transitions", key: "ReleaseScene", label: "Release" },
  { group: "Chapters", key: "TractorScene", label: "6. Caymus" },
  { group: "Chapters", key: "ComeUpScene", label: "7. Come Up" },
  { group: "Transitions", key: "LAScene", label: "LA" },
  { group: "Chapters", key: "OperatorScene", label: "8. Operator Mode" },
  { group: "Transitions", key: "VegasScene", label: "Vegas" },
  { group: "Transitions", key: "HomeReturnScene", label: "Home Return" },
  { group: "Ending", key: "EndScene", label: "Ending" },
] as const;

const MINIGAMES: Record<string, Array<{ label: string; method: string }>> = {
  HomeScene: [
    { label: "Nolan Call", method: "triggerPhoneCall" },
    { label: "Fit Check", method: "playFitCheck" },
    { label: "Stash Hide", method: "playStashHide" },
    { label: "Lifting", method: "playLiftingMinigame" },
    { label: "Fishing", method: "playFishing" },
    { label: "BMW Pull-Off", method: "playBMWPullOff" },
  ],
  BeachScene: [
    { label: "LUNA Collapse", method: "playLunaTrade" },
    { label: "The Choice", method: "playChoiceCall" },
    { label: "Farm Drive", method: "triggerBMWDrive" },
    { label: "Party Night", method: "triggerPartyNight" },
    { label: "Beer Pong", method: "playBeerPong" },
    { label: "Volleyball", method: "playVolleyballMinigame" },
    { label: "Arm Wrestle", method: "playArmWrestle" },
    { label: "Rolling Contest", method: "playRollingContest" },
    { label: "Rap Battle", method: "playRapBattle" },
    { label: "Beer Pong Bracket", method: "playBeerPongTournament" },
  ],
  WeedRiseScene: [
    { label: "Bag The Run", method: "playWeighingRun" },
    { label: "Order Rush", method: "playOrderRush" },
    { label: "Delivery Route", method: "playDeliveryRun" },
  ],
  WrongCrowdScene: [
    { label: "Weighing", method: "playWeighingMinigame" },
    { label: "Driving", method: "playDrivingCutscene" },
  ],
  JailScene: [
    { label: "Old Habits", method: "playPhaseOneRelapseChoice" },
    { label: "Fight", method: "playBattleScene" },
    { label: "Fight Complete", method: "directorMarkFightComplete" },
    { label: "Pushups", method: "playPushupMinigame" },
    { label: "Dice", method: "playDiceMinigame" },
    { label: "Final Montage", method: "playFinalMontage" },
  ],
  TractorScene: [
    { label: "Tractor", method: "playTractorMinigame" },
    { label: "AI Discovery", method: "directorLaunchAIDiscovery" },
  ],
  ComeUpScene: [
    { label: "Client Triage", method: "playClientTriage" },
    { label: "Website Rescue", method: "playWebsiteRescue" },
    { label: "Rejection Montage", method: "playRejectionMontage" },
    { label: "Typing", method: "playTypingMinigame" },
    { label: "First Payment", method: "playPaymentCutscene" },
  ],
  OperatorScene: [
    { label: "Corvette", method: "playCorvetteScene" },
    { label: "Client Pitch", method: "playClientPitch" },
    { label: "Dashboard", method: "playDashboardShowcase" },
    { label: "Equal Moment", method: "playEqualMoment" },
  ],
};

const DEFAULT_REQUIREMENTS: Record<string, string> = {
  HomeScene: "ch0_nolan_call",
  BeachScene: "ch1_smoke",
  WeedRiseScene: "rise_stash",
  JailScene: "ch3_bed",
  TractorScene: "ch4_crash",
  ComeUpScene: "ch5_first_dollar",
  OperatorScene: "ch6_equal_moment",
};

function displayId(id: string): string {
  return id
    .replace(/^ch\d+_/, "")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function targetRefFor(target: DirectorTarget): string {
  return `${target.type}:${target.id}`;
}

function uniqueDirectorTargets(targets: DirectorTarget[]): DirectorTarget[] {
  const seen = new Set<string>();
  return targets.filter((target) => {
    const ref = targetRefFor(target);
    if (seen.has(ref)) return false;
    seen.add(ref);
    return true;
  });
}

function getScene(gameRef: DirectorGameRef): DirectorScene | null {
  const scenes = gameRef.current?.scene.getScenes(true) ?? [];
  const chapter = scenes.find((scene) => "player" in scene || "chapterTitle" in scene);
  return (chapter ?? scenes[0] ?? null) as DirectorScene | null;
}

export default function DirectorPanel({
  gameRef,
  onSpeedChange,
}: {
  gameRef: DirectorGameRef;
  onSpeedChange: (speed: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const [sceneKey, setSceneKey] = useState("MenuScene");
  const [sceneTitle, setSceneTitle] = useState("Main menu");
  const [targets, setTargets] = useState<DirectorTarget[]>([]);
  const [targetRef, setTargetRef] = useState("");
  const [requiredId, setRequiredId] = useState("");
  const [requiredDone, setRequiredDone] = useState(false);
  const [currentDay, setCurrentDay] = useState<number | null>(null);
  const [dialogueDraft, setDialogueDraft] = useState("");
  const [notice, setNotice] = useState("Ready");

  const refresh = useCallback(() => {
    const scene = getScene(gameRef);
    if (!scene) {
      setNotice("Game is still loading");
      return;
    }

    const nextTargets: DirectorTarget[] = [];
    for (const visual of scene.interactions?.getVisuals?.() ?? []) {
      nextTargets.push({
        id: visual.id,
        label: `Object · ${displayId(visual.id)}`,
        type: "interaction",
        x: visual.x,
        y: visual.y,
      });
    }
    for (const npc of scene.npcs ?? []) {
      nextTargets.push({
        id: npc.id,
        label: `NPC · ${displayId(npc.id)}`,
        type: "npc",
        x: Math.round((npc.sprite.x - SCALED_TILE / 2) / SCALED_TILE),
        y: Math.round((npc.sprite.y - SCALED_TILE / 2) / SCALED_TILE),
      });
    }
    nextTargets.sort((a, b) => a.label.localeCompare(b.label));
    const visibleTargets = uniqueDirectorTargets(nextTargets);

    setSceneKey(scene.scene.key);
    setSceneTitle(scene.chapterTitle || SCENES.find((item) => item.key === scene.scene.key)?.label || scene.scene.key);
    setTargets(visibleTargets);
    setRequiredId(scene.requiredInteractionId || DEFAULT_REQUIREMENTS[scene.scene.key] || "");
    setRequiredDone(Boolean(scene.requiredDone));
    setCurrentDay(typeof scene.currentDay === "number" ? scene.currentDay : null);
    setTargetRef((current) => current && visibleTargets.some((target) => targetRefFor(target) === current)
      ? current
      : (visibleTargets[0] ? targetRefFor(visibleTargets[0]) : ""));
  }, [gameRef]);

  useEffect(() => {
    if (!open) return;
    refresh();
    const timer = window.setInterval(refresh, 750);
    return () => window.clearInterval(timer);
  }, [open, refresh]);

  const run = useCallback((label: string, action: (scene: DirectorScene) => void) => {
    const scene = getScene(gameRef);
    if (!scene) {
      setNotice("Game is still loading");
      return;
    }
    try {
      action(scene);
      setNotice(label);
      window.setTimeout(refresh, 50);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Director action failed");
    }
  }, [gameRef, refresh]);

  const groupedScenes = useMemo(() => {
    return SCENES.reduce<Record<string, typeof SCENES[number][]>>((groups, scene) => {
      (groups[scene.group] ??= []).push(scene);
      return groups;
    }, {});
  }, []);

  const selectedTarget = targets.find((target) => targetRefFor(target) === targetRef);
  const sceneMinigames = MINIGAMES[sceneKey] ?? [];

  const clearActiveDialogue = (scene: DirectorScene) => {
    const dialogue = scene.dialogue;
    let guard = 0;
    while (dialogue?.isActive?.() && guard < 200) {
      dialogue.inputCooldown = 0;
      dialogue.advance?.();
      guard++;
    }
    scene.frozen = false;
  };

  const jumpScene = (nextScene: string) => {
    const game = gameRef.current;
    if (!game) return;
    for (const active of game.scene.getScenes(true)) game.scene.stop(active.scene.key);
    game.scene.start(nextScene);
    setNotice(`Opened ${SCENES.find((scene) => scene.key === nextScene)?.label ?? nextScene}`);
    window.setTimeout(refresh, 100);
  };

  const teleport = () => run(`Warped to ${selectedTarget?.label ?? targetRef}`, (scene) => {
    if (!selectedTarget || !scene.player) return;
    const candidates = [
      { x: selectedTarget.x, y: selectedTarget.y + 1, facing: "up" as const },
      { x: selectedTarget.x, y: selectedTarget.y - 1, facing: "down" as const },
      { x: selectedTarget.x + 1, y: selectedTarget.y, facing: "left" as const },
      { x: selectedTarget.x - 1, y: selectedTarget.y, facing: "right" as const },
    ];
    const destination = candidates.find((candidate) => {
      const inBounds = candidate.x >= 0 && candidate.y >= 0
        && candidate.x < (scene.mapWidth ?? Number.POSITIVE_INFINITY)
        && candidate.y < (scene.mapHeight ?? Number.POSITIVE_INFINITY);
      return inBounds && !scene.collisionTiles?.has(`${candidate.x},${candidate.y}`);
    }) ?? candidates[0];
    scene.player.setPosition(
      destination.x * SCALED_TILE + SCALED_TILE / 2,
      destination.y * SCALED_TILE + SCALED_TILE / 2,
    );
    scene.facing = destination.facing;
    scene.frozen = false;
  });

  const triggerTarget = () => run(`Triggered ${selectedTarget?.label ?? targetRef}`, (scene) => {
    if (!selectedTarget) throw new Error("Choose a target first");
    if (!scene.directorTriggerTarget) throw new Error("Direct target testing is unavailable in this scene");
    clearActiveDialogue(scene);
    const didTrigger = scene.directorTriggerTarget(selectedTarget.id, selectedTarget.type);
    if (!didTrigger) throw new Error("Target is hidden, already consumed, or dialogue is still active");
  });

  const loadDialogue = () => run("Loaded dialogue into the editor", (scene) => {
    const targetId = selectedTarget?.id;
    if (!targetId) return;
    const chapterLines = scene.getChapterDialogue?.().npcs[targetId];
    const npcLines = scene.npcs?.find((npc) => npc.id === targetId)?.dialogue;
    const lines = chapterLines ?? npcLines;
    if (!lines) throw new Error("This target has no dialogue block");
    setDialogueDraft(JSON.stringify(lines, null, 2));
  });

  const applyDialogue = () => run("Applied dialogue live", (scene) => {
    const targetId = selectedTarget?.id;
    if (!targetId) throw new Error("Choose a target first");
    const parsed = JSON.parse(dialogueDraft) as unknown[];
    if (!Array.isArray(parsed)) throw new Error("Dialogue must be a JSON array");
    const chapter = scene.getChapterDialogue?.();
    if (chapter) chapter.npcs[targetId] = parsed;
    const npc = scene.npcs?.find((item) => item.id === targetId);
    if (npc) npc.dialogue = parsed;
  });

  const skipDialogue = () => run("Cleared active dialogue", (scene) => {
    clearActiveDialogue(scene);
  });

  const setSpeed = (speed: number) => {
    onSpeedChange(speed);
    setNotice(`Game speed ${speed}x`);
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="absolute left-3 top-3 z-40 rounded border border-amber-300/50 bg-black/85 px-3 py-2 font-mono text-[11px] font-bold tracking-[0.18em] text-amber-200 shadow-lg hover:bg-amber-300/10"
        title="Open Director Mode"
      >
        DIRECTOR
      </button>
    );
  }

  return (
    <aside className="absolute inset-y-0 left-0 z-50 flex w-[430px] max-w-[94vw] flex-col border-r border-white/15 bg-[#080910]/95 text-white shadow-2xl backdrop-blur-md">
      <header className="flex items-start justify-between border-b border-white/10 px-4 py-4">
        <div>
          <p className="font-mono text-[10px] tracking-[0.24em] text-amber-300">DIRECTOR MODE</p>
          <h2 className="mt-1 text-sm font-semibold">{sceneTitle}</h2>
          <p className="mt-1 font-mono text-[10px] text-white/45">{notice}</p>
        </div>
        <button type="button" onClick={() => setOpen(false)} className="rounded border border-white/15 px-2 py-1 text-xs text-white/70 hover:bg-white/10">ESC</button>
      </header>

      <div className="flex-1 space-y-5 overflow-y-auto px-4 py-4 text-[13px]">
        <section className="space-y-2">
          <label className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/45">Chapter / scene</label>
          <select value={sceneKey} onChange={(event) => jumpScene(event.target.value)} className="w-full rounded border border-white/15 bg-white/5 px-3 py-2 text-white outline-none">
            {Object.entries(groupedScenes).map(([group, scenes]) => (
              <optgroup key={group} label={group}>
                {scenes.map((scene) => <option key={scene.key} value={scene.key}>{scene.label}</option>)}
              </optgroup>
            ))}
          </select>
          <div className="grid grid-cols-3 gap-2">
            <button type="button" onClick={() => run("Restarted scene", (scene) => scene.scene.restart())} className="director-btn">Restart</button>
            <button type="button" onClick={skipDialogue} className="director-btn">Skip text</button>
            <button type="button" onClick={() => run("Player unfrozen", (scene) => { scene.frozen = false; })} className="director-btn">Unstick</button>
          </div>
        </section>

        <section className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/45">Playback</label>
            {currentDay !== null && <span className="font-mono text-[10px] text-amber-200">DAY {currentDay}</span>}
          </div>
          <div className="grid grid-cols-5 gap-2">
            {[1, 2, 4, 8].map((speed) => <button key={speed} type="button" onClick={() => setSpeed(speed)} className="director-btn">{speed}x</button>)}
            <button type="button" onClick={() => run("Camera reset", (scene) => scene.cameras.main.setZoom(1.05))} className="director-btn">Cam</button>
          </div>
          {currentDay !== null && (
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3].map((day) => <button key={day} type="button" onClick={() => run(`Set day ${day}`, (scene) => { scene.currentDay = day; scene.refreshObjectiveHint?.(); })} className="director-btn">Day {day}</button>)}
            </div>
          )}
        </section>

        <section className="space-y-2">
          <label className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/45">Warp to any person or object</label>
          <select value={targetRef} onChange={(event) => { setTargetRef(event.target.value); setDialogueDraft(""); }} className="w-full rounded border border-white/15 bg-white/5 px-3 py-2 text-white outline-none">
            {targets.length === 0 && <option value="">No map targets in this scene</option>}
            {targets.map((target) => <option key={targetRefFor(target)} value={targetRefFor(target)}>{target.label} · {target.x},{target.y}</option>)}
          </select>
          <div className="grid grid-cols-2 gap-2">
            <button type="button" disabled={!selectedTarget} onClick={teleport} className="director-btn disabled:opacity-35">Warp beside target</button>
            <button type="button" disabled={!selectedTarget} onClick={triggerTarget} className="director-btn disabled:opacity-35">Trigger target now</button>
          </div>
        </section>

        <section className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/45">Required action</label>
            <span className={requiredDone ? "text-emerald-300" : "text-amber-300"}>{requiredDone ? "COMPLETE" : "OPEN"}</span>
          </div>
          <select value={requiredId} onChange={(event) => {
            const value = event.target.value;
            setRequiredId(value);
            run(`Requirement changed to ${displayId(value)}`, (scene) => {
              scene.requiredInteractionId = value;
              scene.requiredDone = false;
              scene.refreshObjectiveHint?.();
            });
          }} className="w-full rounded border border-white/15 bg-white/5 px-3 py-2 text-white outline-none">
            <option value="">No required action</option>
            {requiredId && !targets.some((target) => target.id === requiredId) && (
              <option value={requiredId}>Current story gate · {displayId(requiredId)}</option>
            )}
            {targets.map((target) => <option key={`required:${targetRefFor(target)}`} value={target.id}>{target.label}</option>)}
          </select>
          <button type="button" onClick={() => run("QA override: marked gate complete without playing its prerequisites", (scene) => { scene.requiredDone = true; scene.refreshObjectiveHint?.(); })} className="director-btn w-full">QA OVERRIDE — MARK GATE COMPLETE</button>
        </section>

        {sceneMinigames.length > 0 && (
          <section className="space-y-2">
            <label className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/45">Launch scene / minigame</label>
            <div className="grid grid-cols-2 gap-2">
              {sceneMinigames.map((minigame) => (
                <button key={minigame.method} type="button" onClick={() => run(`Launched ${minigame.label}`, (scene) => {
                  const method = scene[minigame.method];
                  if (typeof method !== "function") throw new Error(`${minigame.label} is not available in this build`);
                  clearActiveDialogue(scene);
                  (method as () => void).call(scene);
                })} className="director-btn">{minigame.label}</button>
              ))}
            </div>
          </section>
        )}

        <section className="space-y-2 pb-4">
          <div className="flex items-center justify-between">
            <label className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/45">Live dialogue JSON</label>
            <button type="button" onClick={loadDialogue} className="text-[10px] text-amber-200 hover:text-amber-100">LOAD TARGET</button>
          </div>
          <textarea value={dialogueDraft} onChange={(event) => setDialogueDraft(event.target.value)} spellCheck={false} placeholder={'[\n  { "speaker": "JP", "text": "New line" }\n]'} className="h-52 w-full resize-y rounded border border-white/15 bg-black/40 p-3 font-mono text-[10px] leading-5 text-white/80 outline-none focus:border-amber-300/50" />
          <button type="button" disabled={!dialogueDraft.trim()} onClick={applyDialogue} className="director-btn w-full disabled:opacity-35">Apply dialogue without restart</button>
          <p className="text-[10px] leading-4 text-white/35">Runtime edits last until the page reloads. Once the wording is right, move it into the story file.</p>
        </section>
      </div>

      <style jsx global>{`
        .director-btn {
          border: 1px solid rgba(255,255,255,.14);
          border-radius: .375rem;
          background: rgba(255,255,255,.055);
          padding: .55rem .6rem;
          color: rgba(255,255,255,.78);
          font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
          font-size: 11px;
          line-height: 1rem;
          transition: background .15s ease, border-color .15s ease, color .15s ease;
        }
        .director-btn:hover { background: rgba(251,191,36,.10); border-color: rgba(252,211,77,.38); color: #fde68a; }
      `}</style>
    </aside>
  );
}
