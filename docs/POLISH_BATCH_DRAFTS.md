# Polish Batch Drafts — ready to apply post-walkthrough

Prepared by Claude while Codex runs the 1x walkthrough (no source edits during the run —
hot reload would kill it). Each batch is scoped to named files, apply-ready.
Targets = the audit's remaining numbers: Vegas activities 7.0, party/Vegas NPCs 6.9,
driving 7.6.

---

## Batch A — Vegas penthouse follow-up triage (Vegas activities 7.0 → playable judgment)
File: `game/scenes/VegasScene.ts`, step 5 (penthouse). Gameplay-only choice (no jpReal — not on the truth screen).

Replace the passive deal-tag display with ONE decision: it's 4:18 AM, JP has juice left
for exactly one real conversation before sunrise. Three owners, three telegraphs:

- **The one who owned companies** — polite, vague: "Send me a deck sometime." (It's Vegas talk. Picking him = nothing lands; sunrise line: "The deck email bounced Monday.")
- **The one who owned the floor** — she watches who follows up: "I don't do decks. I do Tuesday, 10 AM." (The real one. Picking her = FOLLOW-UP SET locks; sunrise adds: "Tuesday held.")
- **The one who collected supercars** — loud, loves JP: "You're my guy! We're building an APP!" (Fun, empty. Picking him = a great story; sunrise line: "The app never got a name.")

Buttons styled like the LA choice (touch-friendly). Reading tell: the quiet specific one
beats the loud flattering one — same lesson as the yard, dressed in a penthouse.
Whichever is picked, the other two tags gray to 'VEGAS TALK'. "Some became work.
Others stayed Vegas talk." now happens BECAUSE of the player.

## Batch B — Vegas crowd wants (party/Vegas NPCs 6.9)
File: `game/scenes/VegasScene.ts`, steps 1–4. Three one-line micro-personas woven into
existing showText beats (no new systems):

- Dayclub: a woman at the cabana on her phone, not dancing — "Promoter says she's here every weekend. She's studying the bottle-service margins. Wants her own pool deck by 30."
- Marquee: a guy in the crowd filming nothing — "He's not filming the DJ. He's filming the crowd reaction for a club owner in Phoenix. Everyone working. Even at 1 AM."
- Rhino: one dancer counting, not performing, between sets — "Four more months of this pays off the nursing degree. She tips the DJ out first. Business is business."

Pattern: every room has somebody ELSE building something. JP isn't the only hustler in
Vegas — that's what makes the city honest.

## Batch C — Delivery heat (driving 7.6 → risk judgment)
File: `game/scenes/WeedRiseScene.ts`, delivery run. One choice before the route starts:

- **DRIVE NORMAL** — route takes the full montage; a stop's buyer line notes "Took you long enough."
- **SPEED** — montage shortens, but heat: one-time red/blue flicker beat in the rearview
  ("Not for you. This time.") + tension bump carried into Wrong Crowd's opening overlay.

Gameplay-only (no jpReal). The risk lesson previews the raid without spoiling it.

## Sequencing
A first (biggest audit gap), B same file same pass, C separate file after.
All three respect: no meters, reads over reflexes, reconverge by scene end.

---

## Batch D — Lar & Higo (post-walkthrough, JP canon 2026-07-19)
Files: `game/scenes/LAScene.ts` (+ VegasScene sprite swap). Apply AFTER Codex's continuous run reports.

1. **LA step 0 (C8 cruise)** — name the shotgun rider:
   "Higo rides shotgun — ginger Irish kid from the old days, up big on stocks this year."
2. **LA step 1 (steak dinner)** — the crew's arcs, one line each:
   "Lar's here too. First month out, him and JP moved 'designer' out a duffel — straight from China."
   "Now Lar sells golf clubs. Legit ones. Higo trades stocks. JP builds AI."
   "Everybody from the mud found a legal hustle. Nobody says it out loud. Everybody knows."
3. **VegasScene sunrise** — swap Patrick's sprite OFF npc_higo (use npc-friend variant/tint) so Higo keeps his identity for LA.
4. Optional Come Up echo (later): Lar text — "got a plug on clubs now. LEGIT clubs. proud of us gang."

## Batch D additions (JP canon, approved incl. item 4)
- **PATRICK (real persona)**: tall, white, jacked, bald, ~35. Special Olympics manager + construction manager, lives in Florida, loves fun. Signature move: espresso-martini room service at the Cosmo wraparound suite. VEGAS TIE-IN: Marquee is IN the Cosmopolitan — the crew's base was Patrick's wraparound upstairs. Add to Vegas step 2 (Marquee): "Patrick's wraparound is upstairs — espresso martinis on room service before the club. He manages Special Olympics teams in Florida. Strongest guy in the room, nicest guy in the building." Sprite: needs a bald/jacked look — flag to Codex for SpriteGenerator (npc_patrick), don't reuse npc_higo.
- **HOME ROUTE FIX (release-blocking, Codex finding)**: journal at tile (8,8) blocks only door (8,9) — move prop or make non-colliding. Land together with Batch D in one window, then Codex reruns start-to-finish.

## Batch E — Operator/DHL round two (code-ready, apply post-run)
File: OperatorScene.ts only. Goal: instant "serious operation" read.
1. SCAN LANE: conveyor strip (animated dash rects moving L->R), scanner arch with
   sweeping red laser line, boxes riding the belt every 4s, "SCAN" stencil.
2. LABEL WALL: 3x4 grid of white label cards behind the dispatch desk, one
   highlighted amber = current order; swaps every 8s (workflow visibly ticking).
3. PALLET FLOW: shrink-wrapped pallet stack (tint sheen), pallet jack worker on
   a loop: lift -> cross dock -> drop -> return (reuse crate-runner pattern).
4. AUTHORITY FRAME: dock number stencils (DOCK 1 / DOCK 2), yellow floor lanes,
   NO-STAND hatch marks near the belt, wall clock that actually ticks.
5. SOUND HOOKS (for audio pass): scanner beep every box, forklift reverse chirp.
All scene-layer, zero maps.ts, zero collision changes. ~90 lines.

## Batch F — Analytics rewire (WINDOW-READY, 30 seconds)
File: game/lib/supabase.ts (2-line swap). Old project pwsxoifwoskykotlddtv is DEAD (DNS).
New project (JP-owned, verified working 2026-07-20, test row id 1 landed):
  URL = https://bbluobewiwpyhuiifrku.supabase.co
  KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJibHVvYmV3aXdweWh1aWlmcmt1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ1MDk4MjcsImV4cCI6MjEwMDA4NTgyN30.Cp27U48Jhnbd2HIC_k9uCCVgRAum5Zgldtz5cM9-nLI
(anon key only — public by design; service key stays OUT of the repo.)
game_signals table live with RLS + anon insert/read + sequence grant. Apply in next
sanctioned window, delete the setup_test row after first real deploy verification.
