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
