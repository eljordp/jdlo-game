// ─── Story & Dialogue Data ─────────────────────────────────────────────
// All narrative content for JP's life-story RPG.
// Imported by scene files to drive dialogue boxes, intro/outro cards, etc.

// ─── Types ─────────────────────────────────────────────────────────────

export type DialogueLine = { speaker?: string; text: string };

export type NPCData = {
  id: string;
  x: number;
  y: number;
  sprite: string;
  dialogue: DialogueLine[];
};

// ─── Intro (Professor-Rowan-style opening) ─────────────────────────────

export const introDialogue: DialogueLine[] = [
  {
    speaker: 'Narrator',
    text: 'This is a story about building something from nothing.',
  },
  {
    speaker: 'Narrator',
    text: 'No trust fund. No connections. No playbook handed down.',
  },
  {
    speaker: 'Narrator',
    text: 'Just a kid from Santa Barbara who hit rock bottom and decided that was the foundation, not the ending.',
  },
  {
    speaker: 'Narrator',
    text: 'He taught himself everything. Made every mistake you can make. Lost time he\'ll never get back.',
  },
  {
    speaker: 'Narrator',
    text: 'But somewhere between the worst day of his life and right now, he figured it out.',
  },
  {
    speaker: 'Narrator',
    text: 'Not because he was special. Because he refused to stay down.',
  },
  {
    speaker: 'Narrator',
    text: 'This is JP\'s story. And you\'re going to live it.',
  },
];

// ─── Chapter 0: Home ─────────────────────────────────────────────────

export const chapter0IntroText: string[] = [
  'Before the streets. Before the hustle. Before everything.',
  'Just a kid at home trying to figure it out.',
];

export const chapter0NPCs: NPCData[] = [
  {
    id: 'ch0_pops',
    x: 12,
    y: 9,
    sprite: 'npc_pops',
    dialogue: [
      { speaker: 'Pops', text: 'You been in your room all day.' },
      { speaker: 'JP', text: 'Just thinking.' },
      { speaker: 'Pops', text: 'I know you\'re trying to figure things out. That\'s okay.' },
      { speaker: 'Pops', text: 'I didn\'t have it figured out at your age either. Nobody does.' },
      { speaker: 'Pops', text: 'Just don\'t sit still too long. Life doesn\'t wait.' },
      { speaker: 'JP', text: 'I know, Pops.' },
      { speaker: 'Pops', text: 'I\'m not going anywhere. But the world is. Get moving, son.' },
    ],
  },
  {
    id: 'ch0_mom',
    x: 6,
    y: 5,
    sprite: 'npc_female',
    dialogue: [
      { speaker: 'Mom', text: 'Dinner\'s at six.' },
      { speaker: 'JP', text: 'Okay.' },
      { speaker: 'Mom', text: 'You need to start thinking about what you\'re gonna do.' },
      { speaker: 'JP', text: 'I am thinking about it.' },
      { speaker: 'Mom', text: 'Thinking and doing are two different things.' },
    ],
  },
  {
    id: 'ch0_sister',
    x: 6,
    y: 6,
    sprite: 'npc_sister',
    dialogue: [
      { speaker: 'Sister', text: 'JP! Come play with me!' },
      { speaker: 'JP', text: 'Not right now.' },
      { speaker: 'Sister', text: 'You\'re always in your room.' },
      { speaker: 'JP', text: 'I know. I\'m sorry.' },
      { speaker: 'Sister', text: 'Mommy and Daddy were fighting again.' },
      { speaker: 'JP', text: '...I know.' },
      { speaker: 'Sister', text: 'Are you gonna leave like Mommy says?' },
      { speaker: 'JP', text: 'I\'m not going anywhere. Not yet.' },
    ],
  },
  {
    id: 'ch0_frenchie',
    x: 14,
    y: 11,
    sprite: 'npc_frenchie',
    dialogue: [
      { speaker: 'Narrator', text: 'The Frenchie wags his whole body when he sees JP.' },
      { speaker: 'Narrator', text: 'He doesn\'t care about your problems. He just wants belly rubs.' },
      { speaker: 'JP', text: 'At least you\'re happy to see me.' },
      { speaker: 'Narrator', text: 'Sometimes the dog is the only one who gets it.' },
    ],
  },
];

export const chapter0OutroText: string[] = [
  'JP packed a bag. Hugged his sister. Dapped up Pops.',
  'Didn\'t look back.',
];

// ─── Chapter 1: Santa Barbara ──────────────────────────────────────────

export const chapter1IntroText: string[] = [
  'Santa Barbara',
  'Frat house by the beach. Hot tub. Weed. Girls.',
  'Looks like paradise. Feels like a trap.',
];

export const chapter1NPCs: NPCData[] = [
  {
    id: 'ch1_homie1',
    x: 6,
    y: 4,
    sprite: 'npc_kid',
    dialogue: [
      { speaker: 'Danny', text: 'Bro we got a half pound coming in tomorrow.' },
      { speaker: 'JP', text: 'Bet. Same guy?' },
      { speaker: 'Danny', text: 'Yeah. Easy money.' },
      { speaker: 'Narrator', text: 'They talk like this is normal. Because it is.' },
    ],
  },
  {
    id: 'ch1_homie2',
    x: 18,
    y: 10,
    sprite: 'npc_generic',
    dialogue: [
      { speaker: 'Marcus', text: 'Hot tub\'s heated up. Girls are coming over later.' },
      { speaker: 'JP', text: 'Again?' },
      { speaker: 'Marcus', text: 'What else we gonna do?' },
      { speaker: 'Narrator', text: 'This is the cycle.' },
    ],
  },
  {
    id: 'ch1_girl1',
    x: 10,
    y: 5,
    sprite: 'npc_bikini1',
    dialogue: [
      { speaker: 'Narrator', text: 'She\'s passed out on the couch. It\'s 2 PM.' },
    ],
  },
  {
    id: 'ch1_girl2',
    x: 20,
    y: 10,
    sprite: 'npc_bikini2',
    dialogue: [
      { speaker: 'Girl', text: 'You got a light?' },
      { speaker: 'JP', text: 'Yeah here.' },
      { speaker: 'Girl', text: 'Thanks. You live here?' },
      { speaker: 'JP', text: 'For now.' },
    ],
  },
];

export const chapter1OutroText: string[] = [
  'Same house. Same people. Same bags. Same nothing.',
  'But JP didn\'t see it yet.',
];

// ─── Chapter 2: Wrong Crowd ────────────────────────────────────────────

export const chapter2IntroText: string[] = [
  'Wrong Crowd',
  'Same routine. Grab the bags. Hit the block.',
  'JP didn\'t think twice about it anymore.',
];

export const chapter2NPCs: NPCData[] = [
  {
    id: 'ch2_homie_door',
    x: 12,
    y: 7,
    sprite: 'npc_kid',
    dialogue: [
      { speaker: 'Marcus', text: 'Ayo be safe out there.' },
      { speaker: 'JP', text: 'Always.' },
      { speaker: 'Marcus', text: 'Text me when you\'re back.' },
    ],
  },
  {
    id: 'ch2_lookout',
    x: 19,
    y: 21,
    sprite: 'npc_shady',
    dialogue: [
      { speaker: 'Lookout', text: 'You JP?' },
      { speaker: 'JP', text: 'Yeah.' },
      { speaker: 'Lookout', text: 'He\'s inside. Make it quick.' },
    ],
  },
  {
    id: 'ch2_buyer',
    x: 24,
    y: 23,
    sprite: 'npc_generic',
    dialogue: [
      { speaker: 'Buyer', text: 'You got that zip?' },
      { speaker: 'JP', text: 'Right here.' },
      { speaker: 'Buyer', text: 'Cool cool. Lemme get—' },
    ],
  },
];

export const chapter2OutroText: string[] = [
  'Just another drop. Until it wasn\'t.',
  'The consequences came fast.',
];

// ─── Chapter 3: Jail ───────────────────────────────────────────────────

export const chapter3IntroText: string[] = [
  'Chapter 4 — Locked Up',
  '365 days. A bed, a toilet, and time.',
  'What you do with it is on you.',
];

export const chapter3NPCs: NPCData[] = [
  {
    id: 'ch3_cellmate',
    x: 4,
    y: 6,
    sprite: 'npc_inmate',
    dialogue: [
      { speaker: 'OG', text: 'First time?' },
      { speaker: 'JP', text: 'Yeah.' },
      { speaker: 'OG', text: 'I been here three times. Don\'t be like me.' },
      { speaker: 'OG', text: 'Most dudes in here had one moment where they could\'ve walked away. They didn\'t.' },
      { speaker: 'OG', text: 'When you get out — and you will — don\'t come back. That\'s the only thing that matters.' },
    ],
  },
  {
    id: 'ch3_guard',
    x: 16,
    y: 13,
    sprite: 'npc_guard',
    dialogue: [
      { speaker: 'Guard', text: 'You\'re quieter than most of the new ones.' },
      { speaker: 'JP', text: 'Nothing to say.' },
      { speaker: 'Guard', text: 'That\'s the smartest thing I\'ve heard in here all week.' },
      { speaker: 'Guard', text: 'Keep that energy when you\'re out. Loud gets you caught. Quiet gets you somewhere.' },
    ],
  },
  {
    id: 'ch3_mind',
    x: 13,
    y: 11,
    sprite: 'npc_mirror',
    dialogue: [
      { speaker: 'JP\'s Mind', text: 'Look at where you are.' },
      { speaker: 'JP\'s Mind', text: 'Pops tried to tell you. Marcus tried to tell you. You didn\'t listen.' },
      { speaker: 'JP\'s Mind', text: 'Time you\'ll never get back. People who stopped picking up the phone. A reputation you gotta rebuild from scratch.' },
      { speaker: 'JP\'s Mind', text: 'So what now? Feel sorry for yourself? Blame somebody?' },
      { speaker: 'JP\'s Mind', text: 'Nah. That\'s done.' },
      { speaker: 'JP\'s Mind', text: 'Stop being a bitch. Change everything.' },
      { speaker: 'JP\'s Mind', text: 'When these doors open, you become somebody different. For real this time.' },
    ],
  },
];

export const chapter3OutroText: string[] = [
  'The doors opened. JP walked out a different person.',
  'Not because jail changed him. Because he changed himself.',
];

// ─── Chapter 4: Caymus Vineyards ─────────────────────────────────────

export const chapter4IntroText: string[] = [
  'Caymus Vineyards',
  'Napa Valley. Honest work. Dirt under the nails.',
  'And a screen that was about to change everything.',
];

export const chapter4NPCs: NPCData[] = [
  {
    id: 'ch4_boss',
    x: 5,
    y: 3,
    sprite: 'npc_farmer',
    dialogue: [
      { speaker: 'Frank', text: 'You show up on time. That already puts you ahead of the last three guys.' },
      { speaker: 'JP', text: 'I just wanna work.' },
      { speaker: 'Frank', text: 'Good. That D8 Cat needs to clear the east block by noon. Cab Sauv vines going in next week.' },
      { speaker: 'JP', text: 'I\'ll figure it out.' },
      { speaker: 'Frank', text: 'This is Caymus. We don\'t cut corners. The grapes don\'t lie and neither does the land. Ask if you\'re stuck.' },
    ],
  },
  {
    id: 'ch4_computer',
    x: 10,
    y: 6,
    sprite: 'npc_computer',
    dialogue: [
      { speaker: 'JP\'s Mind', text: 'What is this ChatGPT thing everyone\'s talking about...' },
      { speaker: 'JP\'s Mind', text: 'Wait. It just... answers anything? And it\'s free?' },
      { speaker: 'JP\'s Mind', text: 'I just asked it how to build a website and it gave me a full tutorial. In thirty seconds.' },
      { speaker: 'JP\'s Mind', text: 'My hands are shaking. This is real. This changes everything.' },
      { speaker: 'JP\'s Mind', text: 'Wix first. Okay that\'s cool but limited. What else is out there?' },
      { speaker: 'JP\'s Mind', text: 'Webflow. Then Lovable. Then something called Claude.' },
      { speaker: 'JP\'s Mind', text: 'I haven\'t felt this alive in years. I\'m not sleeping tonight. I\'m learning everything.' },
    ],
  },
  {
    id: 'ch4_coworker',
    x: 3,
    y: 8,
    sprite: 'npc_generic',
    dialogue: [
      { speaker: 'Mike', text: 'Bro what are you always doing on your phone? You don\'t even look up at lunch.' },
      { speaker: 'JP', text: 'Teaching myself how to build websites.' },
      { speaker: 'Mike', text: 'Websites? You drive a tractor for a living.' },
      { speaker: 'JP', text: 'Not for long.' },
      { speaker: 'Mike', text: 'Man, you\'re tripping.' },
      { speaker: 'JP', text: 'Maybe. But I\'m not doing this forever.' },
    ],
  },
];

export const chapter4OutroText: string[] = [
  'Five months. ChatGPT to Wix to Webflow to Lovable to Claude Code.',
  'Completely self-taught. No bootcamp. No degree. Just obsession.',
];

// ─── Chapter 5: The Come Up ────────────────────────────────────────────

export const chapter5IntroText: string[] = [
  'The Come Up',
  'First client. First dollar. First proof it was real.',
  'And it was only the beginning.',
];

export const chapter5NPCs: NPCData[] = [
  {
    id: 'ch5_first_client',
    x: 3,
    y: 4,
    sprite: 'npc_client',
    dialogue: [
      { speaker: 'Small Biz Owner', text: 'So you can really build me a website? How much?' },
      { speaker: 'JP', text: 'Three hundred. I\'ll have it done in a week.' },
      { speaker: 'Small Biz Owner', text: 'Three hundred?? My last quote was four thousand.' },
      { speaker: 'JP', text: 'Their quote. My price. And mine will look better.' },
      { speaker: 'Small Biz Owner', text: 'Alright, let\'s do it.' },
    ],
  },
  {
    id: 'ch5_sticker',
    x: 8,
    y: 3,
    sprite: 'npc_sticker',
    dialogue: [
      { speaker: 'Sticker Smith', text: 'JP, this site is clean. Like, actually clean.' },
      { speaker: 'JP', text: 'Told you I\'d handle it.' },
      { speaker: 'Sticker Smith', text: 'You did the Google Business thing too? We\'re getting calls now.' },
      { speaker: 'JP', text: 'That was week one. Wait till we set up the marketing.' },
      { speaker: 'Sticker Smith', text: 'Bro, you\'re different. Most people just talk.' },
    ],
  },
  {
    id: 'ch5_mentor',
    x: 12,
    y: 6,
    sprite: 'npc_mentor',
    dialogue: [
      { speaker: 'Mentor', text: 'You built all this in five months? Self-taught?' },
      { speaker: 'JP', text: 'Yeah. AI helped a lot. But I had to learn how to use it right.' },
      { speaker: 'Mentor', text: 'Most people with CS degrees can\'t ship this fast.' },
      { speaker: 'Mentor', text: 'Stop charging a thousand. You\'re leaving money on the table.' },
      { speaker: 'JP', text: 'I\'m getting there.' },
      { speaker: 'Mentor', text: 'You\'re already there. You just don\'t believe it yet.' },
    ],
  },
  {
    id: 'ch5_impressed',
    x: 6,
    y: 8,
    sprite: 'npc_biz',
    dialogue: [
      { speaker: 'Client', text: 'Wait, you built the site AND the AI receptionist AND the email system?' },
      { speaker: 'JP', text: 'Yeah. It\'s all connected.' },
      { speaker: 'Client', text: 'My last agency had six people and took three months to do less than this.' },
      { speaker: 'JP', text: 'Different approach. I use AI as my team.' },
    ],
  },
];

export const chapter5OutroText: string[] = [
  'WCT. Sticker Smith. DHL. Vacaville Appliance. fw.wheels.',
  'The clients kept coming. The builds kept shipping. JP was operating.',
];

// ─── Chapter 6: Operator Mode ──────────────────────────────────────────

export const chapter6IntroText: string[] = [
  'Operator Mode',
  'COO at Pomaika\'i Co. Office Kult. Enterprise clients. Vegas meetings.',
  'The kid from Santa Barbara was gone. The operator showed up.',
];

export const chapter6NPCs: NPCData[] = [
  {
    id: 'ch6_malachi',
    x: 4,
    y: 4,
    sprite: 'npc_malachi',
    dialogue: [
      { speaker: 'Malachi', text: 'JP. That dashboard you built for the team — everyone\'s using it.' },
      { speaker: 'JP', text: 'Good. That was the point.' },
      { speaker: 'Malachi', text: 'I got us a meeting with a new client. Big one. You ready?' },
      { speaker: 'JP', text: 'Send me the details. I\'ll have the proposal ready by morning.' },
      { speaker: 'Malachi', text: 'That\'s why you\'re COO, bro.' },
    ],
  },
  {
    id: 'ch6_big_client',
    x: 9,
    y: 3,
    sprite: 'npc_suit',
    dialogue: [
      { speaker: 'Enterprise Client', text: 'We need a full system. Website. AI receptionist. CRM. Booking.' },
      { speaker: 'JP', text: 'I can have a working demo by end of week.' },
      { speaker: 'Enterprise Client', text: 'End of week? Our last vendor quoted eight weeks.' },
      { speaker: 'JP', text: 'I\'m not your last vendor.' },
      { speaker: 'Enterprise Client', text: 'Clearly. Let\'s talk numbers.' },
    ],
  },
  {
    id: 'ch6_equal',
    x: 12,
    y: 7,
    sprite: 'npc_whale',
    dialogue: [
      { speaker: 'Big Player', text: 'JP, that automation you set up saved us twenty hours a week. Minimum.' },
      { speaker: 'JP', text: 'Appreciate that. How\'s the revenue looking?' },
      { speaker: 'Big Player', text: 'We did four hundred K last month. Best month yet.' },
      { speaker: 'JP', text: 'Let me show you what else we can automate.' },
      { speaker: 'Big Player', text: 'This is why I keep you close, man. You see the system before anyone explains it.' },
      { speaker: 'JP', text: 'Pattern recognition. That\'s the edge.' },
    ],
  },
];

export const chapter6OutroText: string[] = [
  'From a cell to the boardroom. Five months from zero to full-stack operator.',
  'But this isn\'t the end. It\'s the launchpad.',
];

// ─── End Screen ────────────────────────────────────────────────────────

export const endScreenStats: string[] = [
  '5 months: Zero to full-stack operator',
  '6+ clients served',
  'Built with: Next.js, React, AI, Claude Code',
  'Self-taught. No degree. No bootcamp.',
  'From a cell to the boardroom',
];

export const endScreenCTA =
  'Now you know my story. Let\'s write the next chapter together.';

export const endScreenLinks = {
  instagram: '@jdlo',
  site: 'jdlo.site',
};

// ─── Convenience: All chapters indexed ─────────────────────────────────

export const chapters = [
  {
    id: 1,
    title: 'Santa Barbara',
    introText: chapter1IntroText,
    npcs: chapter1NPCs,
    outroText: chapter1OutroText,
  },
  {
    id: 2,
    title: 'Wrong Crowd',
    introText: chapter2IntroText,
    npcs: chapter2NPCs,
    outroText: chapter2OutroText,
  },
  {
    id: 3,
    title: 'Locked Up',
    introText: chapter3IntroText,
    npcs: chapter3NPCs,
    outroText: chapter3OutroText,
  },
  {
    id: 4,
    title: 'Caymus Vineyards',
    introText: chapter4IntroText,
    npcs: chapter4NPCs,
    outroText: chapter4OutroText,
  },
  {
    id: 5,
    title: 'The Come Up',
    introText: chapter5IntroText,
    npcs: chapter5NPCs,
    outroText: chapter5OutroText,
  },
  {
    id: 6,
    title: 'Operator Mode',
    introText: chapter6IntroText,
    npcs: chapter6NPCs,
    outroText: chapter6OutroText,
  },
] as const;

// ─── Chapter count ─────────────────────────────────────────────────────

export const TOTAL_CHAPTERS = chapters.length;

// ─── Bridge exports for scene files ──────────────────────────────────
// Scenes import { beachDialogue } etc. and expect:
// { intro: DialogueLine[], npcs: Record<string, DialogueLine[]> }

function buildChapterDialogue(
  introText: string[],
  npcs: NPCData[],
  outroText: string[],
  extras?: Record<string, DialogueLine[]>
): { intro: DialogueLine[]; npcs: Record<string, DialogueLine[]> } {
  const introLines: DialogueLine[] = introText.map((t) => ({ text: t }));
  const outroLines: DialogueLine[] = outroText.map((t) => ({ text: t }));
  const npcMap: Record<string, DialogueLine[]> = {};

  for (const npc of npcs) {
    npcMap[npc.id] = npc.dialogue;
  }

  // Merge extra interactable dialogues
  if (extras) {
    for (const [key, lines] of Object.entries(extras)) {
      npcMap[key] = lines;
    }
  }

  // Add outro as a special NPC trigger key
  npcMap['__outro__'] = outroLines;

  return { intro: introLines, npcs: npcMap };
}

// ─── Chapter 0 extras ──────────────────────────────────────────────────

const ch0Extras: Record<string, DialogueLine[]> = {
  ch0_bed: [
    { speaker: 'JP\'s Mind', text: 'Another night staring at the ceiling. What am I doing with my life?' },
    { speaker: 'JP\'s Mind', text: 'Everyone I grew up with is either working or locked up. And I\'m just... here.' },
  ],
  ch0_window: [
    { speaker: 'JP\'s Mind', text: 'Everyone else seems to have it figured out.' },
    { speaker: 'JP\'s Mind', text: 'Same neighborhood. Same view. Same nothing changing.' },
  ],
  ch0_fridge: [
    { speaker: 'JP\'s Mind', text: 'Nothing in the fridge. Story of my life.' },
    { speaker: 'JP\'s Mind', text: 'Mom\'s been working doubles. Pops picks up what he can. And I\'m just eating their food.' },
  ],
  ch0_tv: [
    { speaker: 'JP\'s Mind', text: 'Same shows. Same couch. Same nothing.' },
    { speaker: 'JP\'s Mind', text: 'I could sit here forever and nobody would notice. That\'s the scary part.' },
  ],
  ch0_goodbye: [
    { speaker: 'Pops', text: 'You sure about this?' },
    { speaker: 'JP', text: 'I gotta go, Pops.' },
    { speaker: 'Pops', text: 'I know. Just... be smart out there.' },
    { speaker: 'Narrator', text: 'They dap up. Pops holds it a second longer than usual.' },
    { speaker: 'Mom', text: '...' },
    { speaker: 'Narrator', text: 'Mom doesn\'t say much. Just watches him from the kitchen doorway.' },
    { speaker: 'Sister', text: 'You\'re coming back right?' },
    { speaker: 'JP', text: 'Always.' },
    { speaker: 'Narrator', text: 'The Frenchie whines at the door. He knows.' },
  ],
};

// ─── Chapter 1 extras ──────────────────────────────────────────────────

const ch1Extras: Record<string, DialogueLine[]> = {
  ch1_weed1: [
    { speaker: 'JP\'s Mind', text: 'Bags on bags. At least a QP sitting on the desk.' },
    { speaker: 'JP\'s Mind', text: 'This used to feel exciting. Now it\'s just inventory.' },
  ],
  ch1_weed2: [
    { speaker: 'JP\'s Mind', text: 'More bags under the bed. This is the stash.' },
    { speaker: 'JP\'s Mind', text: 'If the cops kicked this door in right now... nah, don\'t think about that.' },
  ],
  ch1_weed3: [
    { speaker: 'JP\'s Mind', text: 'Weed on the coffee table. Nobody even hides it anymore.' },
    { speaker: 'JP\'s Mind', text: 'We got so comfortable we forgot this was illegal.' },
  ],
  ch1_bottles: [
    { speaker: 'JP\'s Mind', text: 'Empty bottles everywhere. Last night was crazy. Or was that Tuesday?' },
    { speaker: 'JP\'s Mind', text: 'Every night blurs into the next one.' },
  ],
  ch1_hottub: [
    { speaker: 'JP\'s Mind', text: 'Hot tub\'s still running. Nobody\'s cleaned it in weeks.' },
    { speaker: 'JP\'s Mind', text: 'We spend more on the electric bill for this thing than rent. Priorities.' },
  ],
  ch1_mess: [
    { speaker: 'JP\'s Mind', text: 'Clothes, trash, plates. This house is disgusting.' },
    { speaker: 'JP\'s Mind', text: 'Nobody cleans. Nobody cares. That tells you everything.' },
  ],
  ch1_view: [
    { speaker: 'JP\'s Mind', text: 'Santa Barbara sunset. Beautiful place to waste your life.' },
    { speaker: 'JP\'s Mind', text: 'Everybody visits and says they wish they lived here. I live here and I\'m going nowhere.' },
  ],
};

// ─── Chapter 2 extras ──────────────────────────────────────────────────

const ch2Extras: Record<string, DialogueLine[]> = {
  ch2_grab_weed: [
    { speaker: 'JP\'s Mind', text: 'JP grabs two zips off the desk. Stuffs them in his jacket.' },
    { speaker: 'JP\'s Mind', text: 'Same routine. Didn\'t even think about it anymore.' },
  ],
  ch2_car: [
    { speaker: 'JP\'s Mind', text: 'Black 2008 BMW 335i. Not flashy. Just enough.' },
    { speaker: 'JP\'s Mind', text: 'JP gets in and drives down the block.' },
  ],
  ch2_mirror: [
    { speaker: 'JP\'s Mind', text: 'JP checks the rearview. Nothing behind him.' },
    { speaker: 'JP\'s Mind', text: 'For now.' },
  ],
  ch2_buyer_house: [
    { speaker: 'JP\'s Mind', text: 'This is the spot. In and out. Two minutes.' },
  ],
  ch2_alley: [
    { speaker: 'JP\'s Mind', text: 'This is where bad decisions happen at 2 AM.' },
    { speaker: 'JP\'s Mind', text: 'Dark alley. No cameras. No witnesses. The kind of place where your life changes in one second.' },
  ],
  ch2_phone: [
    { speaker: 'JP\'s Mind', text: '12 missed calls from Pops. I\'ll call him back. Tomorrow.' },
    { speaker: 'JP\'s Mind', text: 'He knows. He always knows. And I keep dodging because I don\'t want to hear the truth.' },
  ],
  ch2_graffiti: [
    { speaker: 'JP\'s Mind', text: 'Someone tagged \'NO WAY OUT\' on the wall. Felt that.' },
    { speaker: 'JP\'s Mind', text: 'Whoever wrote this probably believed it. I\'m starting to.' },
  ],
};

// ─── Chapter 3 inmate dialogue + interactables ──────────────────────

const ch3InmateDialogue: Record<string, DialogueLine[]> = {
  ch3_inmate1: [
    { speaker: 'Inmate', text: 'Two years in here, man. Two years.' },
    { speaker: 'Inmate', text: 'My lawyer says we got a shot at appeal but I don\'t even believe him anymore.' },
    { speaker: 'Inmate', text: 'I keep replaying that night in my head. One stupid decision.' },
    { speaker: 'JP', text: '...' },
    { speaker: 'Inmate', text: 'You\'re smart not to talk much. Just do your time and get out.' },
  ],
  ch3_inmate2: [
    { speaker: 'Tatted Inmate', text: 'Yo new fish. You look stressed.' },
    { speaker: 'Tatted Inmate', text: 'I got something that\'ll take the edge off. Just a little something. Everybody does it in here.' },
    { speaker: 'JP', text: 'Nah, I\'m good.' },
    { speaker: 'Tatted Inmate', text: 'For real? You sure? It makes the time go by, trust me.' },
    { speaker: 'JP', text: 'I said I\'m good.' },
    { speaker: 'Tatted Inmate', text: 'Suit yourself, homie. Offer\'s always open.' },
  ],
  ch3_inmate3: [
    { speaker: 'Big Inmate', text: 'You see that dude at lunch? Tried to get tough with me.' },
    { speaker: 'Big Inmate', text: 'I put him on the floor in two seconds. Two seconds. Ask anybody.' },
    { speaker: 'Big Inmate', text: 'Nobody in here messes with me. You understand? Nobody.' },
    { speaker: 'JP\'s Mind', text: 'This dude\'s been in here so long he thinks this is his kingdom. Sad.' },
  ],
  ch3_inmate4: [
    { speaker: 'Quiet Inmate', text: '...' },
    { speaker: 'JP', text: 'How long you been here?' },
    { speaker: 'Quiet Inmate', text: 'Eight years.' },
    { speaker: 'JP', text: 'Damn.' },
    { speaker: 'Quiet Inmate', text: 'I\'ve seen hundreds of guys come through. Most of them come back.' },
    { speaker: 'Quiet Inmate', text: 'The ones who make it? They\'re the ones who use the time. Read. Work out. Plan.' },
    { speaker: 'Quiet Inmate', text: 'Don\'t just survive in here. Prepare for out there.' },
    { speaker: 'JP', text: 'I hear you.' },
    { speaker: 'Quiet Inmate', text: 'I hope you do, young man. I really hope you do.' },
  ],
  ch3_book: [
    { speaker: 'JP\'s Mind', text: 'Someone left a book behind. Some self-help thing. Normally I\'d never touch this.' },
    { speaker: 'JP\'s Mind', text: 'But what else am I gonna do in here? Stare at the wall?' },
    { speaker: 'JP\'s Mind', text: 'JP picks it up and starts reading. First book he\'s finished in years.' },
  ],
  ch3_pushups: [
    { speaker: 'JP\'s Mind', text: 'JP drops and does fifty pushups. No excuses.' },
    { speaker: 'JP\'s Mind', text: 'Clear mind. Strong body. That\'s the only way out of here as a better person.' },
    { speaker: 'JP\'s Mind', text: 'Forty-eight... forty-nine... fifty. Done. Tomorrow it\'s sixty.' },
  ],
  ch3_fighter1: [
    { speaker: 'Fighter', text: 'You looking at something?' },
    { speaker: 'JP\'s Mind', text: 'JP stays quiet.' },
    { speaker: 'Fighter', text: 'That\'s what I thought.' },
  ],
  ch3_fighter2: [
    { speaker: 'Inmate', text: 'Don\'t mind him. He\'s been in here too long.' },
    { speaker: 'Inmate', text: 'You\'re the quiet one huh? Smart.' },
  ],
  ch3_dice1: [
    { speaker: 'Dice Player', text: 'Ayo new fish, you rolling?' },
    { speaker: 'JP', text: 'Nah I\'m good.' },
    { speaker: 'Dice Player', text: 'Your loss. I\'m up three soups.' },
  ],
  ch3_dice2: [
    { speaker: 'Dice Player 2', text: 'This man been taking everybody\'s commissary all week.' },
    { speaker: 'Dice Player 2', text: '*laughs*' },
  ],
  ch3_tattoo: [
    { speaker: 'Tattoo Guy', text: 'Hold still bro... almost done.' },
    { speaker: 'Tattoo Guy', text: 'You want one?' },
    { speaker: 'JP', text: 'I\'m straight.' },
  ],
  ch3_smoker: [
    { speaker: 'Smoker', text: '*coughing*' },
    { speaker: 'Smoker', text: 'You want a hit?' },
    { speaker: 'JP', text: 'Nah.' },
    { speaker: 'Smoker', text: 'Suit yourself. Only thing that makes this place bearable.' },
  ],
  ch3_pullups: [
    { speaker: 'Workout Inmate', text: '*doing pullups, grunting*' },
    { speaker: 'Workout Inmate', text: 'You work out?' },
    { speaker: 'JP', text: 'Every day.' },
    { speaker: 'Workout Inmate', text: 'Good. Keeps your head right in here.' },
  ],
};

// ─── Chapter 3 extras ──────────────────────────────────────────────────

const ch3Extras: Record<string, DialogueLine[]> = {
  ch3_wall_1: [
    { speaker: 'JP\'s Mind', text: 'Day 1. This is real.' },
    { speaker: 'JP\'s Mind', text: 'The door locked behind me and that sound... I\'ll never forget that sound.' },
  ],
  ch3_wall_2: [
    { speaker: 'JP\'s Mind', text: 'Day 15. I keep thinking about what Pops said.' },
    { speaker: 'JP\'s Mind', text: '"The people you surround yourself with... that becomes your life." He was right about all of it.' },
  ],
  ch3_wall_3: [
    { speaker: 'JP\'s Mind', text: 'Day 30. I\'m not coming back here. Ever.' },
    { speaker: 'JP\'s Mind', text: 'Whatever it takes. Minimum wage. Night shifts. I don\'t care. Not this.' },
  ],
  ch3_wall_4: [
    { speaker: 'JP\'s Mind', text: 'Day 45. I have a plan. I just need to get out.' },
    { speaker: 'JP\'s Mind', text: 'I don\'t know what it looks like yet. But I know what it doesn\'t look like. And that\'s enough to start.' },
  ],
  ch3_phone: [
    { speaker: 'JP', text: 'JP calls his Pops.' },
    { speaker: 'JP', text: 'I\'m okay. I\'m figuring it out.' },
    { speaker: 'JP\'s Mind', text: 'Long pause.' },
    { speaker: 'Pops', text: 'I\'m proud of you for staying strong, son.' },
  ],
  ch3_tablet: [
    { speaker: 'JP\'s Mind', text: 'JP pulls out his tablet. While everyone else is doing nothing, he\'s reading about business.' },
    { speaker: 'JP\'s Mind', text: 'About systems. About getting out and staying out.' },
  ],
  ch3_music: [
    { speaker: 'JP\'s Mind', text: 'Headphones in. The noise fades.' },
    { speaker: 'JP\'s Mind', text: 'For a minute, it\'s just JP and the beat.' },
  ],
  ch3_bed: [
    { speaker: 'JP\'s Mind', text: 'Hard mattress. Thin blanket.' },
    { speaker: 'JP\'s Mind', text: 'But JP sleeps clear. No guilt. He earned this rest.' },
  ],
  ch3_toilet: [
    { speaker: 'JP\'s Mind', text: 'Prison toilet. Rock bottom looks like this.' },
  ],
  ch3_window: [
    { speaker: 'JP\'s Mind', text: 'A sliver of sky. That\'s all you get.' },
    { speaker: 'JP\'s Mind', text: 'Make it enough.' },
  ],
  ch3_dice_watch: [
    { speaker: 'JP\'s Mind', text: 'Everyone\'s gambling commissary. JP watches but doesn\'t play.' },
    { speaker: 'JP\'s Mind', text: 'That\'s the old him.' },
  ],
  ch3_fight_watch: [
    { speaker: 'JP\'s Mind', text: 'Two guys going at it over nothing. Guard doesn\'t even flinch.' },
    { speaker: 'JP\'s Mind', text: 'This is normal here.' },
  ],
};

// ─── Chapter 4 extras ──────────────────────────────────────────────────

const ch4Extras: Record<string, DialogueLine[]> = {
  ch4_tractor: [
    { speaker: 'JP\'s Mind', text: 'Yellow D8 Cat. Loud as hell. Honest work though.' },
    { speaker: 'JP\'s Mind', text: 'Six months ago I was in a cell. Now I\'m clearing land in Napa Valley. I\'ll take it.' },
  ],
  ch4_vines: [
    { speaker: 'JP\'s Mind', text: 'Caymus grows some of the best Cabernet in Napa. And I\'m here mowing their lawn.' },
    { speaker: 'JP\'s Mind', text: 'But you know what — somebody built this vineyard from nothing too. Dirt and a vision. That\'s it.' },
  ],
  ch4_ai_discovery: [
    { speaker: 'JP\'s Mind', text: 'I just typed a question into ChatGPT and it gave me a full answer. Like a person. But instant.' },
    { speaker: 'JP\'s Mind', text: 'My heart is pounding. This is not normal.' },
    { speaker: 'JP\'s Mind', text: 'I asked it to explain HTML like I\'m five and it did. Then I asked it to write me a website and it DID.' },
    { speaker: 'JP\'s Mind', text: 'I\'ve been looking for a way out and it was sitting on my phone this whole time.' },
    { speaker: 'JP\'s Mind', text: 'I\'m not sleeping tonight. Or tomorrow. I need to learn everything about this.' },
    { speaker: 'JP\'s Mind', text: 'This is the door. I can feel it. I just walked through it.' },
  ],
  ch4_phone: [
    { speaker: 'JP\'s Mind', text: 'Everyone else is on break scrolling Instagram. I\'m watching Wix tutorials.' },
    { speaker: 'JP\'s Mind', text: 'They think I\'m crazy. Maybe I am. But I built my first page today. On a phone. On a lunch break. At a vineyard.' },
    { speaker: 'JP\'s Mind', text: 'If that\'s crazy then I don\'t want to be sane.' },
  ],
  ch4_sunrise: [
    { speaker: 'JP\'s Mind', text: '5:30 AM. Sun coming up over Napa Valley. This is honest.' },
    { speaker: 'JP\'s Mind', text: 'Cold morning. Dirt road. Nobody out here but me and the vines. First time in years I feel clean.' },
  ],
  ch4_lunch: [
    { speaker: 'JP\'s Mind', text: 'Everyone else eats and scrolls. I eat and study.' },
    { speaker: 'JP\'s Mind', text: 'Thirty minutes. That\'s all I get. But thirty minutes a day adds up when you\'re hungry.' },
  ],
  ch4_paycheck: [
    { speaker: 'JP\'s Mind', text: '$12/hr. Not much, but it\'s mine. Earned clean.' },
    { speaker: 'JP\'s Mind', text: 'Used to make more in a day on the block. But this doesn\'t come with handcuffs.' },
  ],
  ch4_d8_seat: [
    { speaker: 'JP\'s Mind', text: 'Yellow D8 Caterpillar. Loud as hell. You learn to think in the noise.' },
    { speaker: 'JP\'s Mind', text: 'Eight hours on this thing and my back is done. But my mind is sharper than it\'s ever been.' },
  ],
  ch4_crash: [
    { speaker: 'Narrator', text: 'CRUNCH.' },
    { speaker: 'JP', text: 'Oh shit.' },
    { speaker: 'JP', text: 'Oh shit oh shit oh shit.' },
    { speaker: 'Narrator', text: 'Frank comes running from the farmhouse.' },
    { speaker: 'Frank', text: 'What did you hit?! What happened?!' },
    { speaker: 'JP', text: 'I... I don\'t know. Something was buried under the dirt.' },
    { speaker: 'Frank', text: 'That\'s an irrigation line! Do you know how much that costs?!' },
    { speaker: 'JP', text: 'I\'m sorry, Frank. I...' },
    { speaker: 'Frank', text: 'Sorry doesn\'t fix a busted pipe, kid!' },
    { speaker: 'JP\'s Mind', text: '...' },
    { speaker: 'JP\'s Mind', text: 'I can\'t do this anymore.' },
    { speaker: 'JP\'s Mind', text: 'Every day the same dirt. Same sun. Same $12 an hour. Same nothing.' },
    { speaker: 'JP', text: 'Frank.' },
    { speaker: 'Frank', text: 'What.' },
    { speaker: 'JP', text: 'I\'m done. I can\'t do this anymore.' },
    { speaker: 'Frank', text: 'You\'re quitting? Over a busted pipe?' },
    { speaker: 'JP', text: 'It\'s not about the pipe. It\'s about everything. I\'m not meant for this.' },
    { speaker: 'JP', text: 'Fuck this. I\'m going to find my own way.' },
    { speaker: 'Frank', text: '...Good luck, kid. You\'re gonna need it.' },
    { speaker: 'JP\'s Mind', text: 'He\'s wrong. I don\'t need luck. I need a computer and an internet connection.' },
  ],
};

// ─── Chapter 5 extras ──────────────────────────────────────────────────

const ch5Extras: Record<string, DialogueLine[]> = {
  ch5_wct_showcase: [
    { speaker: 'JP\'s Mind', text: 'WCT E-Commerce. Full online store. Product pages, cart, checkout.' },
    { speaker: 'JP\'s Mind', text: '$900. My biggest project yet. Built in two weeks.' },
    { speaker: 'JP\'s Mind', text: 'A month ago I didn\'t know what a component was. Now I\'m shipping stores.' },
  ],
  ch5_sticker_showcase: [
    { speaker: 'JP\'s Mind', text: 'The Sticker Smith. Complete brand overhaul. Website, Google Business, marketing.' },
    { speaker: 'JP\'s Mind', text: '$1,000. And they\'re getting real calls now. Real customers.' },
    { speaker: 'JP\'s Mind', text: 'I didn\'t just build a site. I built their pipeline.' },
  ],
  ch5_dhl_showcase: [
    { speaker: 'JP\'s Mind', text: 'DHL Translator App. Built a translation tool for warehouse workers.' },
    { speaker: 'JP\'s Mind', text: 'Enterprise client. Different league. They needed something their team of devs couldn\'t figure out.' },
    { speaker: 'JP\'s Mind', text: 'I built it in a week.' },
  ],
  ch5_first_dollar: [
    { speaker: 'JP\'s Mind', text: 'Payment received: $300. First real dollar from something I BUILT.' },
    { speaker: 'JP\'s Mind', text: 'Not hustled. Not finessed. Built. With my hands and my brain. This feeling is different.' },
  ],
  ch5_late_night: [
    { speaker: 'JP\'s Mind', text: 'Everyone\'s asleep. I\'m shipping a client site. This is the grind they don\'t show.' },
    { speaker: 'JP\'s Mind', text: '3 AM. Eyes burning. But the site is live. And the client doesn\'t know I just pulled an all-nighter for them.' },
  ],
  ch5_review: [
    { speaker: 'JP\'s Mind', text: 'First 5-star review.' },
    { speaker: 'JP\'s Mind', text: '\'JP delivered in 3 days what our last agency couldn\'t in 3 months.\'' },
    { speaker: 'JP\'s Mind', text: 'Screenshot that. Frame it. That\'s proof. That\'s not luck. That\'s work.' },
  ],
};

// ─── Chapter 6 extras ──────────────────────────────────────────────────

const ch6Extras: Record<string, DialogueLine[]> = {
  ch6_dashboard: [
    { speaker: 'JP\'s Mind', text: 'Built this in one session. The whole Pomaika\'i team uses it now.' },
    { speaker: 'JP\'s Mind', text: 'Malachi needed ops visibility. I gave him a full dashboard in four hours.' },
    { speaker: 'JP\'s Mind', text: 'That\'s the power move. Don\'t talk about what you can do. Just do it. Then show them.' },
  ],
  ch6_portfolio: [
    { speaker: 'JP\'s Mind', text: 'Six months ago I didn\'t know what HTML was.' },
    { speaker: 'JP\'s Mind', text: 'Now I\'m COO of Pomaika\'i. Systems operator at Office Kult. Running my own clients on the side.' },
    { speaker: 'JP\'s Mind', text: 'Sticker Smith. WCT. DHL. Vacaville Appliance. fw.wheels. And it\'s still just the beginning.' },
    { speaker: 'JP\'s Mind', text: 'People doing $400K a month treat me like an equal. Because I earned it.' },
  ],
  ch6_vegas: [
    { speaker: 'JP\'s Mind', text: 'Flew to Vegas for a business meeting. Six months ago I was on a tractor.' },
    { speaker: 'JP\'s Mind', text: 'Sitting across from people closing million-dollar deals. And they\'re asking ME for advice.' },
    { speaker: 'JP\'s Mind', text: 'Life doesn\'t change slowly. It waits until you\'re ready, then it hits you all at once.' },
  ],
  ch6_team: [
    { speaker: 'JP\'s Mind', text: 'Three people count on me now. Can\'t let them down.' },
    { speaker: 'JP\'s Mind', text: 'Used to only worry about myself. Now there\'s a team. Responsibilities. People who trust me.' },
    { speaker: 'JP\'s Mind', text: 'That weight? I\'d carry it twice over. This is what purpose feels like.' },
  ],
  ch6_mirror: [
    { speaker: 'JP\'s Mind', text: 'The kid from Santa Barbara would never believe this.' },
    { speaker: 'JP\'s Mind', text: 'COO. Operator. Builder. The guy people call when they need it done right.' },
    { speaker: 'JP\'s Mind', text: 'Same face. Different person behind it. And I\'m just getting started.' },
  ],
};

// ─── Build bridge exports ──────────────────────────────────────────────

export const homeDialogue = buildChapterDialogue(chapter0IntroText, chapter0NPCs, chapter0OutroText, ch0Extras);
export const beachDialogue = buildChapterDialogue(chapter1IntroText, chapter1NPCs, chapter1OutroText, ch1Extras);
export const wrongCrowdDialogue = buildChapterDialogue(chapter2IntroText, chapter2NPCs, chapter2OutroText, ch2Extras);
export const jailDialogue = buildChapterDialogue(chapter3IntroText, chapter3NPCs, chapter3OutroText, { ...ch3Extras, ...ch3InmateDialogue });
export const tractorDialogue = buildChapterDialogue(chapter4IntroText, chapter4NPCs, chapter4OutroText, ch4Extras);
export const comeUpDialogue = buildChapterDialogue(chapter5IntroText, chapter5NPCs, chapter5OutroText, ch5Extras);
export const operatorDialogue = buildChapterDialogue(chapter6IntroText, chapter6NPCs, chapter6OutroText, ch6Extras);

export const endScreenData = {
  stats: endScreenStats,
  cta: endScreenCTA,
  links: endScreenLinks,
};
