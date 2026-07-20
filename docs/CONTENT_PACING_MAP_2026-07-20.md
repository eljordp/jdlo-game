# Content & Pacing Map — the "what's weak / too long / add / cut / merge" doc

Method: 3 parallel code-readers measured every scene — required-path line counts,
optional-beat counts, repeated-motif counts, wall-of-text stacks. Every item below
has a location. This is grounded in counts, not vibes.

Legend: 🟢 SAFE-TO-AUTO-FIX (mechanical, no story call) · 🟡 NEEDS-JP-CALL (creative/canon)

---

## Per-chapter verdict table

| Chapter | Verdict | The one-line reason |
|---|---|---|
| Home | TIGHT→DRAGS | Nolan call (15 lines) stacked right after 8-line opening; heavy filler-examine layer |
| Santa Barbara | **DRAGS** | Day 1 = 3 cutscenes back-to-back with no interactive break (worst stretch in the game) |
| Weed Rise | TIGHT / **THIN** | Whole era carried by 5 intro lines; the shipping escalation isn't dramatized |
| Spiral | TIGHT | Best-paced piece in the game — leave it alone |
| Wrong Crowd | TIGHT required / bloated optional | Surveillance foreshadow told 4×; several 4–5 line monologues |
| Court | TIGHT | Right length for a watch |
| Jail | earned spine / **BLOATED optional** | 42 objects × 3 days ≈ 126 optional nodes; Day-2 praise cluster (6 NPCs, one note) |
| Release | TIGHT / padded closers | "The doors opened" appears 3× |
| Caymus | TIGHT | But ch4_crash is the longest forced convo in the game (~30 lines, double quit-choice) |
| Come Up | TIGHT req / bloated optional | ~27 optional beats around a ~13-line spine |
| LA | TIGHT | but the whip + delivery choice are two stacked "what do you do tonight" decisions |
| Operator | TIGHT req / **SEVERELY bloated** | 50+ optional beats incl. 9 near-identical "how far I've come" lines |
| Vegas | **DRAGS** | steps 0/4/5/6 each fire 6–7 stacked text blocks — paragraph walls at 1x |
| Home Return | TIGHT | but the emotional PEAK (vineyard walk) is OPTIONAL — a rushing player misses it |
| End | **DRAGS** | 4 screens (~45–50s) after the emotional button; re-hypes after the quiet |

---

## TOO LONG — trim these (all 🟢 unless noted)

1. 🟢 **Santa Barbara Day 1** — K-goodbye (16, BeachScene 776-793) → plug/weed-choice (~15) → morning-after (9-line monologue, 1466-1477) are three cutscenes with no interactive beat between. Cut the morning-after monologue from 9 mind-lines to 3–4. **Biggest pacing win in the game.**
2. 🟢 **Vegas text-walls** — steps 0/4/5/6 fire 6–7 `showText` blocks each (VegasScene ~694-702, 766-802, 807-813, 831-847). Cap at 3–4 per step. **Second-biggest win.**
3. 🟡 **Caymus crash** (~30 forced lines, story 2375-2407) — remove the redundant SECOND quit-choice (2395-2404, same decision twice). One quit, not two.
4. 🟢 **Nolan phone call** — 15-line "Tell me more" branch (HomeScene 2381-2390) right after the 8-line opening. Cut to ~6.
5. 🟢 **The End sequence** — 4 screens after Home Return's button. Move stats before the emotional close or merge; see CUT #—re-hype below.
6. 🟢 **>3-line inner monologues to break up:** morning-after 9 (Beach 1468-1476), LUNA 4+4 (Beach 928-938), ch2_gun 5 (story 1654-1658), ch3_transformation 5 (story 2307-2312), ch4_vines 4 (2342-2345). Intercut a Narrator/action line or cut one each.

## CUT — redundant / off-tone / dead (all 🟢 unless noted)

7. 🟢 **DEAD CODE: the share card.** `showShareCard` (EndScene 327-581) + `shareGame` (1181) are built but never called. Wire into the End funnel OR delete. (This is also the "social-share loop" that's requested-but-not-shown — see ADD.)
8. 🟢 **Jail Day-2 praise cluster** — 6 NPCs say "you've been putting in work / respect" (story 1874/1883/1890/1901/1928). Keep 2, cut 4. Makes Phase II feel like one note.
9. 🟢 **Operator "how far I've come" beats** — 9 near-identical (story 2819/2839/2867/2880/2883/2898/2909 + mirror/bench). Keep 2, cut 7.
10. 🟢 **Wrong Crowd surveillance foreshadow told 4×** (unmarked_car 1749 / shadow_figure 1781 / parking_lot 1739 / streetlight). Keep 1. Also dedupe "nobody fixes anything" (1696 = 1704).
11. 🟢 **Exact duplicate:** `ch0_garage_car` (story 1234) is verbatim `ch0_pops_truck` (1326). Delete one.
12. 🟢 **Pure filler:** `ch0_den_lamp` (1186), `ch0_kitchen_knife` (1313, faintly ominous in a warm chapter).
13. 🟢 **Release closers** — "The doors opened" 3× (Jail 1533, Release 555, 625). Keep one.
14. 🟡 **The End re-hype** — post-credits "where we going next / Everywhere" (EndScene 1011-1014) re-accelerates right after "I just needed you home." Your call: it's the forward-pull you wanted, but it steps on the quiet.
15. 🟡 **"COO. Close enough."** (story 2985) + duplicated "Self-taught. No degree. No bootcamp." (940 = 948) — the last résumé-flavored lines.

## MERGE — same job, combine (all 🟢)

16. **Rise "hollow-win" ambient beats** — 8 beats all restate "money/motion but something's off" (WeedRise 423-463: kitchen/receipts/takeout/laundry/trunk/mailbox/overlook/exit_note). Merge to 2–3. (Keep a couple — false-win melancholy is on-theme; 8 is sad-clown-on-repeat.)
17. **Jail 3 mirrors → 1** (transformation 2312 / mirror_day2 2199 / mirror_day3 2320) — one object, day-variant lines.
18. **ch0 filler sets** — 5 window one-liners (1340-1354) → 1; 3 rugs (1180-1185) → 1; 3 "sister drew me as a hero" (1090/1282/1300) → 1.
19. **ch1 weed/smoke** — 6 beats, 2 ideas (story 1377-1420) → ~3. **ch1 volleyball** ×2 (1450-1459) → 1.
20. **LA whip + delivery choice** — two stacked "what do you do tonight" decisions in one step (LAScene 120-207). Merge into one.
21. **In-N-Out 2AM gag appears verbatim twice** — LA whip (LAScene 151) + Operator ch6_corvette (1084-1085). Cut one.
22. **ch2_buyer (~15 lines) into ch2_sale (3-line gate)** — two buyer conversations at the same drop. Fold into one.
23. **Operator dupes:** restaurant ×3 (steak_dinner/restaurant/restaurant_menu), valet ×2, tacos ×2. Collapse each.

## ADD — thin spots / referenced-but-NOT-shown (all 🟡 — need JP)

24. **The Aug-2022 USPS shipping escalation is NOT in the game.** All selling is hand-to-hand; the mail-order jump — the actual risk escalation that leads to the bust — exists only as one hint (`rise_mailbox`, WeedRise 454). Rise's required narrative is 5 intro lines for a whole era. **This is the biggest THIN spot.**
25. **Psychedelics/reckless driving arrive cold in the Spiral.** Shrooms + ego-death + crash (SpiralScene 124-194) have zero setup in Rise (100% weed/cash). Plant one beat in Rise.
26. **Crypto-course: NOT shown.** Only the LUNA trade exists. The "sold a lil crypto course" beat is unbuilt.
27. **The habit-kick is told, never shown** — only a caption ("a floor at 4 AM, shaking… nobody watched him kick it," story 505-506). Candidate for a short Release→Caymus bridge beat.
28. **Vineyard walk (the emotional peak) is OPTIONAL** — needs a 2nd Pops talk (HomeReturn 431). Gate it onto the required path so nobody misses it.
29. **Social-media motion loop / dating apps / call options** — requested, not built as systems (only static lines + the DMSystem + a static crypto view).

## STRUCTURE — one real inconsistency (🟢)

30. **Chapter numbers disagree.** Scene titles say "Chapter 1/2/3" (Home/Beach/Rise) but the canonical `chapters` array (story 964) numbers Santa Barbara = 1, and Home/Rise/Spiral aren't in it at all. Off-by-one between UI and canon — pick one scheme.
31. **Home goodbye contradiction (🟡→🟢):** "He didn't say goodbye" (HomeScene 582-583) directly contradicts the very next card "Dapped up Pops" (story 110). Pick one; align `ch0_goodbye` (1360) to it.

---

## The honest summary
Nothing here is "the game is broken." Every problem is **too much**, not too little — except the 4 ADD items (shipping, crypto-course, habit-kick, the optional peak), which are the gap between the life you lived and the story that's currently playable. Fix priority: (1) the two DRAGS pacing walls — SB Day 1 + Vegas — are 80% of the felt problem; (2) the dead share card + duplicate lines are free wins; (3) the 4 ADDs are the real creative work and need your voice.
