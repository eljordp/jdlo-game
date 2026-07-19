# Chapter Walkthrough Re-audit — Rendered Comparative Pass

Auditor: Codex  
Date: 2026-07-19  
Previous baseline: `177be3e` and `CHAPTER_WALKTHROUGH_AUDIT.md`  
Current basis: `4ae8427` plus the repairs documented below  

## What this pass actually proves

This is a rendered chapter-by-chapter comparison, not another source-only review. Every one of the 15 Director destinations was opened in the running game. The pass also exercised representative chapter interactions, inspected every old audit finding in current source, checked browser errors, ran `npx tsc --noEmit`, and completed a production build.

The browser connection reset during two long dialogue-advance sequences. That was not a game exception. Because of that, this pass does **not** claim an exact normal-speed playtime or a single uninterrupted 1x completion. It proves rendered scene availability, key causal gates, current source paths, and production build health. A separate 1x timing run is still required for an honest length score.

## Honest whole-game rating

The old `6.3` assessment was fair for the pre-repair build. The game in this pass is a **7.8/10 playable documentary alpha**. Its narrative spine is closer to **8.6**, while its presentation/polish layer is closer to **7.2**. That distinction matters: the story is now coherent enough to recommend, but several scenes still look or play like a strong prototype.

| Dimension | Current | Evidence / limit |
|---|---:|---|
| Documentary truth | 8.8 | The invented résumé claims and major numeric contradictions are gone. A dormant fake spreadsheet and the last Caymus wage contradiction were found and removed in this pass. |
| Story causality | 8.7 | LUNA → Nikki dinner → private call → player-owned decision → BMW farm drive → weed rise now exists as one readable chain. |
| Drama | 8.6 | Wrong Crowd, Court, Jail, Release, and Home Return carry real consequence. LA remains too montage-like. |
| Dialogue | 8.0 | Much more specific and restrained. Some theme-stating and Operator affirmation still survive. |
| Emotional depth | 8.3 | Jail now costs something, Release is faith rather than vindication, and Pops is an enforced payoff. |
| Chapter flow | 8.3 | The major transitions make sense. Home Return had a skip-the-Pops bug; fixed in this pass. |
| Characters / relationships | 7.7 | Nikki, K, Pops, Ivy, Bird, Ernesto, Nolan, clients, and ghosts recur with echoes. Many optional NPCs are still closer to moments than full people. |
| Activities / minigames | 7.6 | Strong variety now: party games, driving, weighing, jail fights/training, tractor, route pressure, Client Triage, Website Rescue, pitch/dashboard. Some older activities still share timing-bar DNA. |
| Maps / materials | 7.3 | Santa Barbara, Weed Rise, Jail, Caymus, and Come Up are much stronger. Operator's client workshop and parts of Home Return remain visually sparse or stage-like. |
| Motion / atmosphere | 7.5 | Moving pedestrians, workers, crates, vehicles, club crowds, patrols, vineyard motion, and jail routines are present. Motion is not equally dense in every interior. |
| Audio storytelling | 7.1 | Per-scene emotional worlds and controls exist. This pass verified wiring, not a studio-quality listening/mastering pass. |
| Usability / QA | 7.7 | Continue, chapter select, settings, speed, Director targets, required gates, and console-clean scene jumps work. Director overrides can still be mistaken for player-path proof. |
| Enticeability | 8.0 | The first half is fun, the middle turn lands, and the back half has forward pull. Passive LA and the ending funnel still soften the finish. |

## Chapter score comparison

Scores rate the implementation now, not potential. `Old → Current` uses the previous audit's scale.

| Chapter | Truth | Drama | Play | Depth | Clarity | Current diagnosis |
|---|---:|---:|---:|---:|---:|---|
| Intro | 10 → 10 | 8 → 8 | – | 8 → 8 | 10 → 10 | Still exactly right. Do not add explanation. |
| Home | 6 → 8.5 | 7 → 8 | 8 → 8 | 7 → 8 | 6 → 8 | Colleges and crypto arc are coherent; the house is personal and playable, though still dialogue-dense. |
| Santa Barbara | 7 → 9 | 7 → 8.5 | 9 → 9 | 7 → 8.5 | 6 → 9 | The Choice is now a real warm dinner, Nikki is the pseudonym, and the call/farm/yes chain is playable. |
| Weed Rise | 8 → 9 | 8 → 9 | 7 → 8 | 8 → 9 | 8 → 9 | Dense, active, increasingly paranoid, with pressure choices and route activity. Still the visual/narrative house style. |
| Wrong Crowd | 5 → 8.5 | 9 → 9 | 8 → 8 | 8 → 8.5 | 7 → 8 | Strong night atmosphere and fixed Pops choice. The live computer is crypto, not the fake résumé sheet. |
| Court | 7 → 9 | 9 → 9 | – | 8 → 9 | 7 → 8.5 | Plea math is clear and JP now says he never tried to hurt anyone, once. The incident stays mysterious. |
| Locked Up | 6 → 8.5 | 8 → 9 | 8 → 8 | 7 → 8.5 | 6 → 8 | It now looks like a jail and plays as fall → fight → realization → routine → books/faith. Cell, yard, and chapel gates have explicit open paths. |
| Release | 6 → 9 | 8 → 9 | – | 8 → 8.5 | 7 → 9 | No vindication fantasy: “The doors opened. Faith came with him.” / “I gained faith in there.” |
| Caymus | 7 → 9 | 8 → 8.5 | 8 → 8 | 8 → 8 | 8 → 8.5 | Vineyard identity, tractor work, crash, coworkers, and $20-ish wage are coherent. AI discovery was re-cut to curiosity in this pass. |
| Come Up | 9 → 9 | 8 → 9 | 9 → 9 | 9 → 9 | 8 → 9 | Still the best complete chapter: self-taught work, ghosting, paid proof, Website Rescue, Client Triage, and real client places. |
| LA | 4 → 7 | 5 → 7 | – | 4 → 6.5 | 7 → 8 | Rent, unpaid pressure, and work-at-dinner now add cost. It is still a passive montage, not a chapter the player owns. |
| Operator | 4 → 7.5 | 6 → 7.5 | 7 → 8 | 5 → 7 | 7 → 8 | Fake dashboard glory became real work pressure and named outcomes. Client workshop/office visuals are still the weakest back-half workplace. |
| Vegas | 8 → 9 | 8 → 9 | 6 → 7 | 7 → 8 | 8 → 9 | The real trip and crew now replace the fake contract fantasy; venues have motion and identity. It remains mostly a directed experience. |
| Home Return | 6 → 8 | 8 → 9 | 7 → 7.5 | 8 → 9 | 8 → 9 | Ivy, Mom, sister, and Pops land. Pops is now mechanically required before the ending. Some large rooms remain sparse. |
| Ending | 5 → 7 | 6 → 8 | 6 → 7 | 5 → 7 | 6 → 8 | Stats plus YOUR RUN vs JP is the right documentary payoff. The first stats screen still offers Continue, Share Card, and Play Again at once, and later social prompts remain excessive. |

## Previous audit findings: current status

### 1. Missing Choice scene — fixed

Rendered evidence: a warm four-person dinner places JP beside Nikki; Nikki's mom later calls behind her husband's back; the BMW keys/farm path follows. The weed turn now belongs to the player without changing the historical destination.

### 2. Praise inversion — mostly fixed

Jail praise was cut to earned echoes, with Bird carrying the strongest recognition. Operator now contains friction, open work, unpaid follow-ups, pending invoices, and scope pressure. Two affirmation-shaped beats remain (Malachi's earned COO explanation and the Big Player system line); that is close to the limit, not a reason to add more.

### 3. Dead banned copy — fixed, with one regression caught here

The Vegas legacy route, alternate intro, false boardroom claims, and fake financial dashboards are gone from active code. This pass found the old `$189,000 YTD / 89 customers / 52% repeat` Wrong Crowd block still dormant in `story.ts`. Even though the rendered computer opened crypto, the block was removed so a future refactor cannot resurrect it.

### 4. Numeric contradictions — fixed after one surviving Caymus line

The college set is Oregon / Hawai'i / ASU. Court says faced 13 years, took one. Release uses JP. The LA penthouse contradiction is gone. Caymus consistently says around twenty an hour after this pass removed the last `$12` line.

### 5. Invented résumé numbers — fixed

The old Wrong Crowd spreadsheet, Operator recurring-revenue flex, fake Vegas deal, and inflated funnel language no longer define the game. Real work is named with honest outcome labels: delivered, operational, unpaid, pending, ghosted, or approximately paid where the amount matters.

### 6. Over-telling — improved, not finished

Wrong Crowd now lets the unmarked car, silence, buyer movement, and route do more work. Release no longer explains vindication. Caymus was the main remaining violation: “this changes everything / this is the door” was replaced with the shift ending, one question becoming ten, and uncertainty about what comes next. Some Home examines and Operator dialogue still state themes after the environment has already shown them.

### 7. LA cost-free victory — improved, still a weak chapter

The car is paid for but next month is not; laptops stay open at dinner; delivery is due; the “penthouse” lie was replaced with the actual price of the view. This is no longer false victory, but it still asks the player to watch instead of decide or perform.

### 8. Ending funnel — partially fixed

YOUR RUN vs JP is a genuine documentary mechanic and improves the ending substantially. The funnel problem is not fully solved: the stats screen presents three equal CTAs, then the ending later exposes more social/follow surfaces. Keep Share Card optional, but the authored ending should have one clear forward action and one quiet credit/follow line.

## New findings from rendered play

### A. Home Return could skip its emotional climax — fixed in this pass

The source claimed Pops was required, but `requiredInteractionId` was empty. Base exit logic interprets an empty requirement as open, so the player could walk straight to EndScene. Home Return now uses `ch0_pops` as the requirement; the custom Pops reunion marks it complete only after “I just needed you home.” Director now shows `NPC · Pops` as the open required action.

### B. Director “Mark complete” is an override, not path proof

In Jail, the button can mark the displayed requirement complete without satisfying the scene's Phase-I relapse, fight, realization, Day-II training, or Day-III book/faith flags. This is useful for production, but the UI should say `QA OVERRIDE — MARK GATE COMPLETE` so future agents do not repeat the old fake-party QA mistake.

### C. Operator's room identity is better than its first impression

Source includes workshop furniture, presentation samples, active offices, DHL motion, client pressure, and patrols. In the rendered initial camera, the workshop still reads as a gray box with a table and tiny props. Increase object silhouette/scale and wall detail before expanding the map again. The problem is legibility, not raw object count.

### D. Home Return reuses a large map successfully, but several interiors still feel staged

The house is intentionally big and has many personalized objects. The return route benefits from recognition. The living/den areas can still show more history through larger readable clusters—family photos, worn seating, Ivy's things, Pops' work objects—rather than more tiny one-tile examines.

### E. Exact playtime remains unknown

Director coverage is not a length test. Do one uninterrupted 1x run with optional content skipped, then one 1x completionist sample. Report both. Any single duration before that is a guess.

## What should happen next

1. **Finish the usability truth pass:** rename Director's override button, test both Home Return gate states, verify every visible exit/door on keyboard and controller/mobile, and run the two real timing samples.
2. **Make Operator read at a glance:** larger workstation silhouettes, obvious samples/packing/client materials, fewer tiny floating items, and a tighter camera/room crop where possible.
3. **Give LA one player-owned pressure action:** choose what to delay, answer a client during dinner, route between delivery and the night, or decide whether to promise a deadline. Same historical destination; more ownership.
4. **Simplify the ending:** Continue should be primary; Share Card and Play Again secondary; one quiet `@jdlo` only after the documentary payoff.
5. **Do an actual audio mastering pass:** listen at normal volume across every transition, balance music/SFX/dialogue ducking, and add silence deliberately around the raid, plea, denied appeal, release, and Pops reunion.

## Repairs made during this re-audit

- Removed dormant fake Wrong Crowd spreadsheet and invented business metrics.
- Replaced the last Caymus `$12/hour` contradiction with the confirmed around-$20 framing.
- Removed an unnecessary exact weed-weight claim under the bed.
- Recut both Caymus AI-discovery paths from instant destiny to open-ended curiosity.
- Made Pops the actual Home Return exit gate and renamed the chapter heading from `Home` to `Home Return`.
- Verified no browser console errors across chapter jumps.
- Verified `git diff --check`, TypeScript, and production build.
