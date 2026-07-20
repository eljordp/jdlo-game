# JDLO Documentary Impact Rating Rubric

Purpose: replace unanchored `7.8/10`-style opinions with scores that say what
was judged, against which standard, and with how much evidence.

This rubric does not make taste objective. It makes the judgment legible and
repeatable. Future audits should show the evidence beside every score and use
whole numbers only. A decimal implies precision the process does not have.

## Intended audience understanding

The game is not trying to prove that JP was always right or that other people
caused every mistake. It should leave a stranger with this understanding:

> JP made real choices and paid for them. He was young, hungry and
> misdirected—not evil, not innocent. The same intensity that once chased fast
> money became useful when it found discipline, faith and a better direction.

Context should explain the path without erasing agency. Consequence should not
turn into punishment spectacle. Growth should be shown through changed habits,
not a parade of characters announcing that JP is special.

## Evidence level

Every reported score must carry one evidence label:

| Label | Evidence available | What it can honestly support |
|---|---|---|
| `E0 — Source` | Code/dialogue read only | Structure and wording claims; no playability claim |
| `E1 — Rendered` | Scene opened and representative routes/interactions tested | Visual, navigation and local pacing claims |
| `E2 — Full run` | One uninterrupted normal-speed run by JP or another human | Whole-game flow, boredom, length and emotional carry |
| `E3 — Blind players` | At least three people unfamiliar with the build play without coaching | Comprehension, quitting, recall and intended perception |

Agreement between two agents does not increase the evidence level. Two agents
can still share the same blind spot.

## Reference set: compared against what

JDLO should not receive one vague head-to-head grade against finished games.
Use each reference for one relevant craft axis:

| Reference | Axis it anchors | What JDLO should study, not imitate |
|---|---|---|
| [That Dragon, Cancer](https://store.steampowered.com/app/419460/That_Dragon_Cancer/) | Autobiographical emotional truth and faith | Personal experience becomes interaction; restraint leaves room for the player to feel |
| [Cibele](https://store.steampowered.com/app/408120/) | Intimacy, artifacts and self-critical memoir | A creator can reveal context and changed identities without writing herself as purely victim or hero |
| [Papers, Please](https://store.steampowered.com/app/239030/Papers_Please/) | Mechanics carrying moral pressure | Repeated actions and constrained decisions produce the meaning instead of a speech explaining it |
| [Undertale](https://undertale.com/) | Remembered choices, relationships and replay | The game notices how the player behaved and makes consequence feel personal |
| Pokémon-era overworlds | Map readability, place identity and low-friction traversal | A player should understand boundaries, landmarks, exits and usable objects at a glance |

These are benchmarks, not a claim that JDLO currently equals them. A future
comparison must name the axis: `Jail route readability versus Pokémon-era map
legibility` is useful; `JDLO is an 8 next to Undertale` is not.

## Full-chapter score

Each dimension is scored from `0` to `4`, multiplied by its weight, then added
and rounded to a whole number out of 100.

`chapter score = sum(weight × level / 4)`

| Dimension | Weight | The question being measured |
|---|---:|---|
| Causal clarity | 15 | Can a stranger explain what caused the next choice or chapter? |
| Emotional truth | 20 | Does the feeling emerge from specific events, behavior and cost rather than theme-stating? |
| Understanding JP | 20 | Does the scene reveal what JP wanted, feared and believed while preserving responsibility? |
| Player embodiment | 15 | Does the player perform, choose, endure or meaningfully witness the beat instead of merely receiving exposition? |
| Documentary integrity | 15 | Are claims grounded, composites honest in spirit, private details protected and mystery used deliberately? |
| Craft delivery | 15 | Do pacing, dialogue, map, motion, audio, controls and transitions support the intended effect? |

### Level anchors

| Level | Anchor |
|---:|---|
| `0 — Breaks` | Contradicts canon, confuses the causal chain, blocks play, or creates the opposite impression |
| `1 — Weak` | The intent is detectable but generic, inconsistent, overly explained, or mechanically thin |
| `2 — Functional` | A stranger can follow it, but the beat is ordinary, passive, under-earned, or easy to forget |
| `3 — Strong` | Specific, coherent, playable, restrained and emotionally earned; only minor friction remains |
| `4 — Proven` | Memorable and unusually effective, with the intended understanding confirmed by blind-player evidence |

At `E0` or `E1`, a `4` should almost never be awarded. “Proven” means someone
outside the build process actually received the intended effect.

## Intro score

The four-second intro is a title beat, not a chapter. It should not receive
chapter scores for gameplay, relationships or map depth. Score it only on its
actual jobs:

| Intro job | Weight | Current evidence |
|---|---:|---|
| Promise fidelity | 30 | `Based on a true story.` establishes the documentary contract without adding false detail |
| Tone and mystery | 30 | Minimal presentation creates seriousness and restraint |
| Handoff into Home | 25 | The transition must create curiosity rather than feel like an isolated splash screen |
| Timing and presentation | 15 | Readability, duration, audio and skip behavior must feel intentional |

Current provisional intro rating: **83/100 · E1 — Rendered**.

Reason: promise fidelity is proven in the implementation; tone, handoff and
timing are strong but have not been validated with blind players. The old
`Truth 10 / Drama 8 / Depth 8 / Clarity 10` was an internally consistent
opinion, not a calibrated measurement.

## What humans will measure

After each test run, ask without leading the player:

1. What caused JP to make the next major move?
2. What did he want or fear in that chapter?
3. What choice or responsibility was his?
4. What moment stayed with you, if any?
5. What do you think about JP now?

Record observable data separately from opinion:

- chapter reached and exact quit point;
- normal-speed playtime;
- interactions missed or misunderstood;
- whether the player can retell the causal chain;
- whether their description of JP matches the intended understanding;
- unprompted emotional reactions and recalled moments;
- whether they voluntarily continue, replay, explore or share.

## Current design hypotheses to test

These are intended effects, not current findings:

| Hypothesis | Evidence that would support it | Evidence that would weaken it |
|---|---|---|
| Home and Santa Barbara lower the player's guard before the turn | Players independently describe the opening as warm, fun or familiar | Players call it slow, confusing or obviously ominous from the start |
| The farm choice feels understandable with the information available | Players can name the LUNA loss, the opportunity and their reason for choosing or refusing it | Players choose only because the game signals a required path or cannot explain the motive |
| Consequence creates understanding without absolution | Players describe both JP's context and his responsibility | Players conclude either “none of this was his fault” or “he was simply a bad person” |
| Jail makes the change feel earned | Players recall a survival/failure beat and can explain the turn toward routine, books and faith | Players say JP entered already reformed or that the chapter felt like a training victory montage |
| `YOUR RUN vs JP` creates reflection rather than a scoreboard flex | Players discuss why their choices differed and reconsider an earlier judgment | Players treat it as winning against JP, miss it, or feel lectured by it |

Do not report “most players choose the BMW” or “almost everyone answers Pops”
until play data exists. Before then, write `prediction`, not `result`.

Do not average three strangers into a fake scientific truth. Quote the pattern:
`3/3 understood why weed followed the LUNA loss`, `2/3 blamed other people for
JP's decisions`, or `all three tried to skip this dialogue`. Those statements
are more useful than another unsupported decimal.

## Reporting format

Use this format for every future chapter rating:

```text
LOCKED UP — 78/100 · E2 — Full run
Causal clarity 3/4 — the three phases and realization are understandable.
Emotional truth 3/4 — survival and routine feel earned; one speech overstates it.
Understanding JP 3/4 — context and responsibility both survive.
Player embodiment 3/4 — fights, training, books and faith are performed.
Documentary integrity 3/4 — specific without turning violence into spectacle.
Craft delivery 2/4 — one route dragged and chow audio repeated.
Main evidence: [specific observed moments]
Main weakness: [single most important miss]
Confidence limit: [what was not tested]
```

The number summarizes the reasons. It never replaces them.
