# Chapter Walkthrough Audit — Narrative/Dialogue Pass

Auditor: Claude · Date: 2026-07-19 · Basis: commit `177be3e` (checkpoint: preserve documentary rebuild)
Scope: **page-level narrative audit** — story, dialogue, claims, pacing — from full-source extraction of all 15 scenes + story.ts. Per the ledger's ratings rule these are NOT final scores; Codex's rendered end-to-end walkthrough re-rates after repairs. No scene/data/system files were edited.

Scale: 1–10. Truth = fidelity to ledger + JP ground truth. Drama = does the beat land. Play = is it fun to play. Depth = emotional weight earned. Clarity = does a stranger follow it.

## Scoreboard

| Chapter | Truth | Drama | Play | Depth | Clarity | One-line diagnosis |
|---|---|---|---|---|---|---|
| Intro | 10 | 8 | – | 8 | 10 | Correct. Don't touch. Delete the dead alt-intro. |
| Home | 6 | 7 | 8 | 7 | 6 | Warm and playable; internal contradictions + fabricated numbers |
| Santa Barbara | 7 | 7 | 9 | 7 | 6 | Great fun; **missing The Choice scene** — the game's biggest story gap |
| Weed Rise | 8 | 8 | 7 | 8 | 8 | The template chapter. Everything else should match its restraint |
| Wrong Crowd | 5 | 9 | 8 | 8 | 7 | Best drama; worst invented-numbers violation + over-told dread |
| Court | 7 | 9 | – | 8 | 7 | Nearly right; missing JP's one essential line |
| Locked Up | 6 | 8 | 8 | 7 | 6 | Good phases; JP enters already-reformed, exits over-praised |
| Release | 6 | 8 | – | 8 | 7 | Visually strong; "truth always prevails" must go |
| Caymus | 7 | 8 | 8 | 8 | 8 | Strong chapter; AI discovery is instant-destiny, not curiosity |
| Come Up | 9 | 8 | 9 | 9 | 8 | **Best chapter in the game.** Protect it |
| LA | 4 | 5 | – | 4 | 7 | Cost-free victory montage — most off-brief scene remaining |
| Operator | 4 | 6 | 7 | 5 | 7 | Praise inversion + invented résumé numbers |
| Vegas | 8 | 8 | 6 | 7 | 8 | Active version correct; 460 lines of banned legacy code must die |
| Home Return | 6 | 8 | 7 | 8 | 8 | Ivy perfect; Mom resolves too tidily; Pops speech too long |
| Ending | 5 | 6 | 6 | 5 | 6 | Stats screen good; narrative end is still a sales funnel |

---

## Cross-cutting findings (fix these first)

### 1. THE MISSING CHOICE SCENE (Santa Barbara) — top structural gap
The approved spine is LUNA loss → **conscious choice** → weed. The choice does not exist. JP arrives in SB already mid-operation (`ch1_setup` "running three hustles", `ch1_bong` "The boys buy from me", weed props as "inventory"), and after the LUNA crash the plug call **auto-fires** with zero player input. The one beat the whole causal engine depends on — JP choosing the shortcut — is skipped. Needed: strip the pre-existing-dealer ambience from Day 1, and stage one small played decision between the crash and the call (even just a dialable phone with a choice prompt and one beat of hesitation). "One run. Make the money back. Then I'm done." is already the right line; it needs a player-owned moment to hang on.

### 2. Praise inversion in the back half
Front half is disciplined (Weed Rise: zero praise; Come Up: zero gifted-clients, all struggle). Back half collapses: **Locked Up Phase III** has ~8 NPCs telling JP he's changed/special (peak: Guard "maybe ten people actually change in here. You're one of them"); **Operator** has ~9–10 characters affirming JP with ~0 friction. Ledger says use "different" sparingly and prove it through playable behavior. Cut to ≤1 earned praise beat per chapter (keep Bird's "Don't waste it" — he's the one praiser with his own problem; keep ONE Operator affirmation, make the rest neutral or demanding).

### 3. Dead code carrying banned content — regression risk
Never executed but still in source, one refactor away from resurrecting cut material:
- `VegasScene.playLegacyStep` (649–1110): golden DEAL-MOMENT flash, "Everybody in the room owns something," **"A year ago you were in a cell… Now look at us"** — the cell-to-boardroom framing JP cut.
- `story.ts:20–49 introDialogue`: 7-line narrator opening that breaks the intro rule AND calls JP "a kid from Santa Barbara" (wrong — origin is North Bay).
- `story.ts ch0_nolan_call`: second, contradictory Nolan script (SBCC/"nothing shady" vs the used frat-house version).
- `TractorScene.playAIDiscoveryCutscene` (948+): unused duplicate AI-discovery with "Everything changed in this moment."
- `BeachScene.playRollingContest` + `playBeerPongRound2`: fully built, never callable.
Recommend deleting all five blocks (Codex's lane; listed here so it's one sweep).

### 4. Numeric self-contradictions
- College letters: UI says **Oregon / Hawai'i / Arizona State**; computer Mail says **UC Davis / Sac State / Sonoma State**. → QUESTION 2 below, then unify.
- Missed calls in Wrong Crowd: **3** (scene) vs **12** (`ch2_phone`) vs "twice" (`ch2_pops_missed` extra).
- Jail pushups: Day1 caption "twenty" vs Day2 "came in doing thirty."
- Compound Effect: "reading it for two weeks" vs "read it three times."
- Come Up payment cutscene counts to **$300** while Sticker Smith is stated **~$1K** (ladder vs invoice — make the montage visibly multi-payday or re-anchor to $1K).
- Jail intro card "Attempted murder. **13 years.**" contradicts the Court outcome the player just watched (plea = 1 year). Card should carry the plea result; 13 was what he *faced*.
- LA step 2 "30th floor" vs step 3 "penthouse."
- Home timeline: record player "not 2023", clocks at 11:42 PM under morning framing, journal "De La Salle" (East Bay school in a North Bay story — QUESTION 4).
- Name discipline: Release narration says "**Jordi** walked out" — ledger reserves Jordan for Mom/court, JP/Jordi for friends; narrator has used Jordan elsewhere. Pick one narrator register.

### 5. Invented operational/résumé numbers (ledger: "if the number is not important, omit it")
- **Wrong Crowd `ch2_computer` spreadsheet — worst offender in the game**: "31 lbs remaining / $189,000 CASH YTD / $18,400 monthly / 89 customers / 52% repeat." Fabricated scale-bragging that reads as quasi-how-to. Cut the spreadsheet; the $20K desk-cash beat already carries the point.
- **Operator**: "$15K/mo — Recurring. Zero downtime," "$10K+/mo" portfolio label, 8 team / 12 projects, crypto portfolio $12,847.33 with per-coin gains, "metrics up 40%." Replace with unlabeled/qualitative proof or tie to the real four (Sticker Smith, WCT, DHL Translator, Vacaville).
- **Home**: Coinbase overlay $5,000→$7,200 (+44%) with per-coin prices — also conflicts with SB's Portfolio Tracker ($1,200 pre-LUNA). Pick ONE pre-LUNA number story or abstract it like the LUNA overlay does ("ALL IN" → "$0.00" — that pattern is correct).
- **SB Portfolio Tracker** leaks −$3,200 net worth / −$3,400 debt in an optional menu while the main scene deliberately keeps money private. Align with the abstraction.
- **Caymus**: $12/hr and $487.32 — QUESTION 6; if unconfirmed, "two weeks of work for what I used to make in a night" already does the job without the decimals.

### 6. Over-telling hot spots (the environment already says it)
- **Wrong Crowd**: ≥8 "something's wrong/off" lines + 3× "probably nothing." Keep TWO (intro card + Jose's "Something don't feel right tonight"); cut the rest — the tension system, plateless sedan, leg-bounce, and silence do the work.
- **Release**: "The truth always prevails" — cut (plea ≠ exoneration; explicitly on JP's cut list). "I knew it. / God showed." stays (JP's real words) but appears TWICE (Day-3 bed caption pre-echo) — cut the pre-echo. "Not because jail changed him. Because he changed himself." — cut or halve; the sunlight walk already says it.
- **Caymus AI discovery**: "This changes everything" + "This is the door. I just walked through it" = instant destiny. Approved direction: strange and open-ended first. Keep the search-query typewriter (great device), end on curiosity ("…it just answers. Why is nobody talking about this?") and let Come Up deliver the conviction. No first-ugly-build exists anywhere — add one beat in Come Up's typing minigame (first render is broken/ugly, fix it live) rather than in Caymus.
- **Home**: exit narration explains the Pops dap-up subtext; Mom walkaway captioned after it's shown; several theme-stating examines ("That's the problem."). Trim the double-tells, keep the objects.
- **Home Return**: Pops speech is 14 lines + dim + memory-flash. The two lines that matter: "Son." and "I just needed you home." Cut most of the rest; move the websites-pride content to Mom's line (she's the one who showed him).

### 7. LA — the most off-brief scene remaining
Four steps of pure glamour ("This is what they don't show you about making it out," steak, penthouse) with zero cost. The approved flow requires LA to carry cost (unstable money, sleep, overextension). Cheapest fix without a rebuild: recut step 1 or 3 so one friend-line or JP-thought lands the load ("Rent's three weeks of not knowing" / laptops open AT the steak dinner because delivery is due — the visual is already there, the words currently celebrate it instead).

### 8. Ending funnel
~7 interactive CTA surfaces (@jdlo ×5, jdlo.site ×2) + "now runs operations from an LA highrise" as present fact. Keep: stats screen, grade, share card, "story is still being written," Zay post-credit (correctly framed as future — "Everywhere." is a great last word). Cut CTAs to ONE quiet "@jdlo" at the very end, drop "runs operations from an LA highrise" (Operator already showed the room), and note "From Santa Barbara to the boardroom" (share card) + "From the bedroom to the boardroom" (MenuScene) are the same banned résumé shape wearing a different city.

---

## What is RIGHT — do not sand these off
- **Weed Rise, whole chapter**: gate-chain loop, zero real numbers, competence framed as loss ("They do not shake anymore"), the car-slows-outside beat ("Probably nothing." / "It keeps driving."). This is the house style. 
- **LUNA staging**: "ALL IN" → "$0.00", money kept private, loss → phone in one camera move.
- **Come Up ghosting mechanics**: the prospect NPC that physically walks away; "Seen. He still watches every story." Real, specific, novel.
- **The K wake-up scene** (44 lines): the only fully human relationship scene in the game; Day-2 unanswered texts pay it off brutally.
- **Jose's arm-grab** and the raid's silence beat.
- **Court's plea framing**: 13 YEARS strikethrough → 1 YEAR as relief-not-victory; lawyer not PD.
- **Caymus coworkers**: Ernesto/Juan/Eliseo Spanish dialogue, "Perspective." beat, crash→quit causality.
- **Psychology course + anger management 3-beat arcs** in jail (walks past it → shows up → getting an A). The books should copy this gradual shape.
- **Vegas active path**: process-language deal tags, "Some became work. Others stayed Vegas talk."
- **Ivy** everywhere, and "Ivy remembers."
- Intro. Exactly as is.

## Court/jail — the one essential missing line
Nowhere does JP say he never intended or attempted to hurt anyone. The only trace is implicit (Jail OG: "you don't look like the type." / "I'm not."). The ledger requires this on the record. One line in Court step 6 (spotlight, JP's Mind) or in the Jail Phase-I mirror monologue: state it plainly, once, without explaining the incident — which correctly stays mysterious. Also verify the jail intake card and add the deterioration JP actually described: Phase I should contain at least one played failure (a taken drag, a lost fight that costs something, a call home that goes wrong) BEFORE the discipline turn. Right now JP refuses every temptation from hour one, which makes the transformation a costume change.

## Dialogue cut list (chapter → line → action)
- SB `ch1_hottub` "when you're 20 and selling weed in SB" → cut (pre-choice dealer ambience; see finding 1). Same for `ch1_setup` "three hustles", `ch1_bong` "the boys buy from me", weed-prop "inventory" lines — move any survivors to Day 2+.
- Wrong Crowd: 6 of 8 "something's wrong" lines (keep intro card + Jose) → cut. `ch2_weigh_result` "The precision. The discipline." → cut ("If I put this energy into something legal…" can survive on its own). `ch2_computer` spreadsheet → cut entirely.
- Jail Phase III: Guard "you're one of them", Fighter1 "for all of us who can't", Dice "smarter than all of us", Chris "I'm proud of you bro" → cut or neutralize; keep Bird.
- Release: "The truth always prevails." → cut. Day-3 bed pre-echo of "God showed" → cut.
- Caymus: "This changes everything." / "This is the door. I can feel it. I just walked through it." → rewrite to open-ended curiosity.
- Operator: Malachi "That's why you're COO… Because you operate", Big Client "You see the system before anyone explains it", Investor "I keep hearing your name", Coworker praise ×2 → keep ONE, neutralize rest. "Self-taught. No degree. No bootcamp." appears 4+ times → keep once (end screen).
- LA: "This is what they don't show you about making it out." → replace with a cost line.
- Home Return: Pops speech → cut to core two lines; Sister "CEO"/"COO. Close enough." → QUESTION 9; Mom apology → QUESTION 8.
- Ending: CTA blocks ×3 → one; "now runs operations from an LA highrise" → cut.

---

## QUESTIONS FOR JP (uncertain claims — marked as questions, not facts; nothing above asserts these)
1. **$40K/year tuition** — is that the real number from the college argument, or should it stay a round "forty thousand" only if real?
2. **Which three colleges** actually accepted you — Oregon/Hawai'i/ASU, or UC Davis/Sac State/Sonoma State? (Game currently claims both.)
3. **Pre-LUNA portfolio size** — the game shows both $5,000→$7,200 and $1,200. Real ballpark, or keep it fully abstract ("ALL IN")?
4. **De La Salle** (journal, Sept 2017) — did you actually go there? It's a Concord school; reads odd in a North Bay story.
5. **Pops' voice** — he says "mijo" in the new basketball/driveway lines and Ernesto uses "mijo" at Caymus. Does Pops actually talk like that, or does that blur two men?
6. **$12/hr and $487.32 paycheck** at Caymus — real, or drop the decimals and keep "two weeks for what I used to make in a night"?
7. **The Choice** — when the weed opportunity actually arrived, what was the shape of it (who brought it, what was said)? A composite is fine per the ledger; the scene needs A shape, and only you know how it should feel.
8. **Mom today** — the reunion has her apologizing ("I'm sorry I didn't understand before") and fully approving. Is that where the relationship actually is, or should it stay warmer-but-unresolved per the "don't pretend it's repaired" rule?
9. **"COO. Close enough."** — keep the title beat in Home Return, or soften (the title is real at Office Kult per your records, but it's the one résumé claim left in the family scenes)?
10. **"To come home and make Pops proud. That was always the point."** — this is the game's stated thesis line. Confirm that IS the core motivation, or whether the real point is the never-again-at-zero engine (which is what the rest of the rebuilt game argues).
11. **Jail phase reality** — you described Phase 1 as drugs/fighting/old habits. How far is too far to show? (Current build shows zero relapse; adding any means depicting you using in jail — your call where the line is.)
12. **"God showed."** — confirmed as your exact words? It's load-bearing in Release.

---

## JP'S ANSWERS — CANON (2026-07-19, verbatim decisions; supersede the questions above)

1. **$40K/year tuition: KEEP** (JP believes accurate; if ever corrected, use the accurate number).
2. **Colleges: Oregon, Hawai'i, Arizona State.** Fix the computer Mail app (UC Davis/Sac State/Sonoma set is wrong — delete/replace).
3. **Crypto arc (REAL): put in $1K → grew to $5K → then $40K → full-ported LUNA → zero.** Use these real numbers, rendered realistically. This replaces both the $5,000→$7,200 Coinbase overlay (Home) and the $1,200 Portfolio Tracker (SB). Note: this makes the LUNA loss ~$40K — a much bigger, better-motivated wound than anything currently staged.
4. **De La Salle: REAL.** Keep the journal entry.
5. **Pops is Mexican; "mijo" is right — can emphasize.** Keep/lean into the voice.
6. **Caymus wage: $20/hour** (not $12/hr, not $487.32 — replace both).
7. **THE CHOICE (real shape, now canon):** JP was at dinner with a homegirl's parents. The wife later called JP behind her husband's back — come up to the farm, pick up in the BMW, start selling. Stage as: dinner scene (normal, warm) → the call → the drive to the farm → the yes. This is the missing Santa Barbara Choice beat.
   - **Character name (FINAL, JP 2026-07-19): "Nikki."** This is an in-game pseudonym used to protect the real person's name. Keep the parents as role labels and do not restore the private real name.
8. **Mom's apology in Home Return: KEEP** ("that's cool for mom").
9. **Sister's "COO. Close enough." beat: KEEP** (explained to JP; real title, self-deprecating).
10. **Final thesis: not locked to "make Pops proud."** JP wants an ending that makes sense, leaves impact, and is ENTICING — it's a game of his life but should pull people in. Direction: keep Pops-proud as an emotional beat inside the reunion; make the closing thesis the never-back-to-zero engine + forward pull (To be continued energy, Zay beat). Codex has latitude to craft it; optimize for impact.
11. **Jail Phase 1: REAL STRUGGLE.** JP falls into old habits (drugs/fighting) until the realization mid-sentence: "I need to straighten up or I'll end up like the rest of them." The turn is seeing the others (Bird's third time in, OG's denied appeal) — that's what flips him, not day-one discipline. Rebuild Phase I accordingly.
12. **Faith correction (IMPORTANT — replaces "God showed"):** JP didn't have a promise confirmed; he *gained* faith in jail. "I just had faith. I gained faith." Release's "I knew it. / God showed." must be rewritten to the gained-faith framing (e.g. walking out on faith he built, not vindication). Also cut "The truth always prevails" per the audit.
- **Bonus (Nolan call):** the dead SBCC/"fresh start" script is closer to accurate than the live frat-house one. Best version likely blends both: school as the frame, the life as the pull. Codex to merge into ONE call and delete the loser.

---

## INTERACTIVITY SPEC (JP-approved 2026-07-19)

Principle: **change the route, never the destination.** Every historical beat is fixed; every choice is the player's mindset inside it. All branches reconverge within their chapter. No alternate history, no persistent world forks — only dialogue variants, echo flags, and affinity counters.

### 1. Choice points (2–4 per chapter, at fixed events)
Candidates (Codex selects/final-places; existing ones marked ✓):
- **Home**: how honest with Mom about college; smoke inside or wait (✓ Mom-catches system exists); answer Nolan straight or deflect.
- **Santa Barbara**: how JP treats K that morning; hesitate on the farm call ✓; refuse/accept the blow ✓; loyal or not at the party ✓; what JP tells Nolan about the bag.
- **Weed Rise**: answer Jose or leave him on read; reply to the 3 AM buyer or sleep.
- **Wrong Crowd**: answer Pops' call or let it ring (JP let it ring — prime grading moment); take the quiet street or the fast one.
- **Jail**: fight or walk ✓; share commissary with Bird or keep it; join the dice game ✓; chapel or bunk.
- **Caymus**: look at the phone on the tractor or ignore it (the crash still comes — "you did it too" is the point); lunch with the crew or alone.
- **Come Up**: hold price or undercharge; chase the ghost or move on; take the $5 gig.
- **Operator**: take the unpaid "exposure" client or decline; check Slack at dinner or stay present.

### 2. Echo pairs (choice → later callback, cheap + high-impact)
- K morning warmth → tone of her Day-2 unanswered texts.
- Pops call answered/ignored → variant line in the Home Return reunion.
- Jail fights picked vs walked → Phase III yard reputation (fear vs respect dialogue pools).
- Commissary shared → Bird's line at JP's release.
- Blow refused → clear-morning variant of the Day-2 wake-up (same exit, different texture).
- Price held in Come Up → client-respect line in Operator.

### 3. Friend levels / affinity (JP's ask — deterministic, NOT live-AI)
Per-NPC affinity counter (-2..+2) driven by talk frequency + tagged choices. Thresholds swap dialogue pools and can trigger events:
- Jail: low affinity + high tension → that inmate presses you (reuse battle minigame); high affinity → warnings/protection (Mikey tips you before trouble).
- SB: party NPCs remember whether you played their games / passed the blow.
- Operator: team affinity changes whether people flag problems early.
Track in GameStats; expose in Director panel for QA. Live-LLM NPCs are explicitly OUT for v1 (cost/latency/untestable); optional v2 easter egg: one hidden AI-driven NPC.

### 4. End-screen: YOUR RUN vs JP
New section after stats: each major choice, side by side — what the player chose vs what JP really did, with a match count. ("You turned down the blow. JP didn't." / "You answered Pops. JP let it ring.") NEEDS: JP's real answer for each shipped choice point — collect as a short questionnaire once Codex finalizes the list. This section is the documentary payoff; keep it quiet, no grades-shaming, just truth.

### QA guardrail
Every branch must reconverge before the chapter transition; walkthrough tests both poles of each choice; affinity thresholds visible in Director panel.
