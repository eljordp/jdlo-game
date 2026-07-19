# JDLO Map Art Direction

Target: a 2000s handheld Pokemon world with documentary specificity. Maps should be readable in one glance, navigable without confusion, and materially distinct by chapter.

## The current failure

The maps are technically large but visually small. Repeating one texture, placing one-tile furniture in oversized rooms, and leaving long empty runs makes the world read like objects on a grid. More tiles do not create a better place.

## Global layout rules

- Every room needs a clear purpose, an entry path, a focal point, and believable circulation.
- Furniture sits against walls or groups around an activity. It does not float as isolated inventory icons.
- Use negative space for movement, not as filler.
- A player should reach the next meaningful beat within roughly five to eight seconds of movement.
- Important exits use architecture, lighting, or a landmark. Do not rely on floating exclamation points alone.
- Interiors need contact shadows where walls and furniture meet the floor.
- Rugs and textiles are room-scale objects. They should visually connect furniture, not look like postage stamps.
- Large outdoor maps need districts and landmarks, not uniform grass or concrete.
- Camera scale should make character acting and material detail readable.
- Every interior must either be compact or earn its footprint with furniture,
  personal artifacts, material zones, activity, and circulation. If a room is
  still an empty rectangle after decoration, shrink the map.

## Material rules

- Carpet: one continuous textile field, low-contrast pile variation, no visible square border per tile.
- Hardwood: staggered planks, warm grain, controlled variation, consistent plank direction within a room.
- Generic floor: stone or porcelain, visually distinct from hardwood.
- Concrete: aggregate, stains, and cracks without an expansion-joint cross repeated on every tile.
- Drywall: warm painted plaster with edge depth, not a cream checkerboard.
- Sand and dirt: irregular natural patches. Avoid repeated decorative marks at the same coordinate.
- Roads: larger markings and wear patterns should be authored at map scale rather than baked into every tile.

## Chapter palettes and landmarks

### Home

- Materials: warm oak, continuous beige carpet, cream plaster, dark asphalt, maintained lawn.
- Landmarks: JP's bedroom, family kitchen, staircase, driveway/BMW, basketball court, Ivy's route.
- Mood: safe, familiar, slightly stagnant. It should not look poor or broken.

### Santa Barbara

- Materials: sun-faded stucco, warm interior wood, beach sand, pool/hot-tub tile, late-day light.
- Landmarks: townhouse social center, JP and Nolan rooms, hot tub, beach path, volleyball area.
- Mood: attractive first, repetitive second. It is not a generic tropical resort.

### Wrong Crowd

- Materials: the same Santa Barbara world at night, with harsher asphalt, dirty interior surfaces, headlights, and constrained sightlines.
- Landmarks: JP's room, street crossing, buyer house, BMW route.
- Mood: familiar space becoming threatening.

### Weed Rise

- Materials: the same Santa Barbara/North Bay continuity, but increasingly
  organized around weighing, phones, storage, parking, and delivery routes.
- Landmarks: scale table, phone/order station, BMW, composite buyer stops,
  stash return.
- Mood: competence becoming routine, then routine becoming surveillance.

### Locked Up

- Materials: sealed concrete, painted block, steel, worn rubber, institutional fluorescent light.
- Landmarks: cell block, yard, commissary, phones, class/reading area, faith beat.
- Mood: compressed and repetitive, with visual progression across the phases.

### Caymus

- Materials: dry soil, vine rows, yellow machinery, dust, irrigation, work sheds.
- Landmarks: Caymus winery facade, barrel/work area, D8/tractor, lunch-break
  phone spot, foreman area, trellised grape rows, long vineyard perspective.
- Mood: physical scale and honest routine.

### Come Up

- Materials: modest bedroom/desk, cheap office surfaces, laptop glow, scattered proposals and proof.
- Landmarks: workstation, rejection wall, first payment, client progression.
- Mood: pressure and momentum, not wealth.

### Operator Mode

- Materials: cleaner glass, concrete, dark wood, screens, LA night light.
- Landmarks: office, client room, dashboard, Corvette, phone calls home.
- Mood: expanded access with unfinished tension.

### Vegas

- Materials: resort stone, pool water, cabanas, LED club light, velvet, glass,
  penthouse finishes, Strip asphalt and neon.
- Landmarks: Strip/supercars, dayclub pool, Marquee, Omnia chandelier, strip
  club, penthouse.
- Motion: crowds, women and dancers, owners, bottle service, food and drinks,
  smoke, cars, and contact/deal exchanges throughout every event.
- Mood: overstimulation, access, opportunity, appetite, and the question of
  whether every exciting conversation becomes anything after sunrise.

## Implementation order

1. Shared material rendering and camera scale.
2. Home as the reference-quality interior/layout pass.
3. Santa Barbara and Wrong Crowd together so the same place transforms across time.
4. Jail phase progression.
5. Caymus world scale.
6. Come Up and Operator contrast.

Each map pass requires a screenshot review. Code completion alone does not count as visual completion.
