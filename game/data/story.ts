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
    text: 'Just a kid from California who hit rock bottom and decided that was the foundation, not the ending.',
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

// ─── Chapter 1: The Beach ──────────────────────────────────────────────

export const chapter1IntroText: string[] = [
  'Chapter 1 — The Beach',
  'Coastal California. Sun, sand, and not much of a plan.',
  'Before everything changed.',
];

export const chapter1NPCs: NPCData[] = [
  {
    id: 'ch1_mom',
    x: 4,
    y: 3,
    sprite: 'npc_female',
    dialogue: [
      { speaker: 'Mom', text: 'You need to eat something before you go out.' },
      { speaker: 'Mom', text: 'I swear you\'re never home anymore.' },
      { speaker: 'JP', text: 'I\'m good, Ma. I\'ll be back later.' },
      { speaker: 'Mom', text: 'Later. It\'s always later with you.' },
    ],
  },
  {
    id: 'ch1_pops',
    x: 6,
    y: 5,
    sprite: 'npc_pops',
    dialogue: [
      { speaker: 'Pops', text: 'Aye. You got a minute?' },
      { speaker: 'JP', text: 'What\'s up, Pops?' },
      { speaker: 'Pops', text: 'I know you\'re young. I know you think you got all the time in the world.' },
      { speaker: 'Pops', text: 'But the people you surround yourself with... that becomes your life. Choose carefully.' },
      { speaker: 'JP', text: 'I hear you.' },
      { speaker: 'Pops', text: 'Hearing and listening ain\'t the same thing, son.' },
    ],
  },
  {
    id: 'ch1_friend',
    x: 10,
    y: 8,
    sprite: 'npc_kid',
    dialogue: [
      { speaker: 'Danny', text: 'Bro we hitting the pier later or what?' },
      { speaker: 'JP', text: 'Yeah I\'m down. Same spot?' },
      { speaker: 'Danny', text: 'Always. Bring your board. Waves looked decent this morning.' },
      { speaker: 'JP', text: 'Say less.' },
    ],
  },
  {
    id: 'ch1_stranger',
    x: 13,
    y: 4,
    sprite: 'npc_shady',
    dialogue: [
      { speaker: '???', text: 'You look like you\'re from around here.' },
      { speaker: 'JP', text: 'Born and raised. Why?' },
      { speaker: '???', text: 'No reason. Just... enjoy it while it\'s simple, kid.' },
      { speaker: '???', text: 'Things have a way of getting complicated real fast.' },
    ],
  },
];

export const chapter1OutroText: string[] = [
  'The beach wasn\'t going anywhere. But JP was.',
  'He just didn\'t know where yet.',
];

// ─── Chapter 2: Wrong Crowd ────────────────────────────────────────────

export const chapter2IntroText: string[] = [
  'Chapter 2 — Wrong Crowd',
  'Different streets. Different energy.',
  'The kind of fun that stops being fun.',
];

export const chapter2NPCs: NPCData[] = [
  {
    id: 'ch2_shady',
    x: 3,
    y: 6,
    sprite: 'npc_shady',
    dialogue: [
      { speaker: 'Rico', text: 'Yo JP, why you still working that dead-end thing?' },
      { speaker: 'JP', text: 'It\'s not that bad.' },
      { speaker: 'Rico', text: 'Nah bro, I made eight hundred last night. Easy.' },
      { speaker: 'Rico', text: 'No boss. No schedule. Just gotta be smart about it.' },
      { speaker: 'JP', text: '...how?' },
      { speaker: 'Rico', text: 'I\'ll show you. Pull up tonight.' },
    ],
  },
  {
    id: 'ch2_warning',
    x: 8,
    y: 3,
    sprite: 'npc_kid',
    dialogue: [
      { speaker: 'Marcus', text: 'Bro, I\'m hearing things about the people you\'re running with.' },
      { speaker: 'JP', text: 'It\'s not like that. We just kick it.' },
      { speaker: 'Marcus', text: 'That\'s what everybody says right before something goes sideways.' },
      { speaker: 'Marcus', text: 'I\'m not your dad. But I\'m telling you — those dudes don\'t care about you.' },
      { speaker: 'JP', text: 'I can handle myself.' },
    ],
  },
  {
    id: 'ch2_random',
    x: 12,
    y: 7,
    sprite: 'npc_generic',
    dialogue: [
      { speaker: 'Guy on Corner', text: 'You got a light?' },
      { speaker: 'JP', text: 'Nah.' },
      { speaker: 'Guy on Corner', text: 'Whatever.' },
    ],
  },
];

export const chapter2OutroText: string[] = [
  'Wrong place. Wrong time. Wrong people.',
  'The consequences came fast.',
];

// ─── Chapter 3: Jail ───────────────────────────────────────────────────

export const chapter3IntroText: string[] = [
  'Chapter 3 — Locked Up',
  'Four walls. No phone. No distractions.',
  'Just JP and the truth about who he\'d been.',
];

export const chapter3NPCs: NPCData[] = [
  {
    id: 'ch3_cellmate',
    x: 4,
    y: 4,
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
    x: 2,
    y: 7,
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
    x: 6,
    y: 5,
    sprite: 'npc_mirror',
    dialogue: [
      { speaker: 'JP\'s Mind', text: 'Look at where you are.' },
      { speaker: 'JP\'s Mind', text: 'Pops tried to tell you. Marcus tried to tell you. You didn\'t listen.' },
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

// ─── Chapter 4: The Tractor ────────────────────────────────────────────

export const chapter4IntroText: string[] = [
  'Chapter 4 — The Tractor',
  'Honest work. Dirt under the nails. No shortcuts.',
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
      { speaker: 'Frank', text: 'Good. Tractor needs the east field done by noon. Think you can handle it?' },
      { speaker: 'JP', text: 'I\'ll figure it out.' },
      { speaker: 'Frank', text: 'That\'s what I like to hear. Ask if you\'re stuck, don\'t just wing it and break something.' },
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
      { speaker: 'JP\'s Mind', text: 'What if I asked it how to build a website?' },
      { speaker: 'JP\'s Mind', text: 'Wix... okay that\'s cool but limited. What else is out there?' },
      { speaker: 'JP\'s Mind', text: 'Webflow. Then Lovable. Then something called Claude.' },
      { speaker: 'JP\'s Mind', text: 'I\'m not going back to the old life. This is it. I\'m learning everything.' },
    ],
  },
  {
    id: 'ch4_coworker',
    x: 3,
    y: 8,
    sprite: 'npc_generic',
    dialogue: [
      { speaker: 'Mike', text: 'What are you always looking at on your phone, man?' },
      { speaker: 'JP', text: 'Teaching myself how to build websites.' },
      { speaker: 'Mike', text: 'On a phone? That\'s crazy.' },
      { speaker: 'JP', text: 'Not crazier than doing this forever.' },
      { speaker: 'Mike', text: '...fair point.' },
    ],
  },
];

export const chapter4OutroText: string[] = [
  'Five months. ChatGPT to Wix to Webflow to Lovable to Claude Code.',
  'Completely self-taught. No bootcamp. No degree. Just obsession.',
];

// ─── Chapter 5: The Come Up ────────────────────────────────────────────

export const chapter5IntroText: string[] = [
  'Chapter 5 — The Come Up',
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
  'Chapter 6 — Operator Mode',
  'COO at Pomaika\'i. Systems for enterprise clients. Vegas meetings.',
  'The kid from the beach was gone. The operator showed up.',
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
    title: 'The Beach',
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
    title: 'The Tractor',
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
  outroText: string[]
): { intro: DialogueLine[]; npcs: Record<string, DialogueLine[]> } {
  const introLines: DialogueLine[] = introText.map((t) => ({ text: t }));
  const outroLines: DialogueLine[] = outroText.map((t) => ({ text: t }));
  const npcMap: Record<string, DialogueLine[]> = {};

  for (const npc of npcs) {
    npcMap[npc.id] = npc.dialogue;
  }

  // Add outro as a special NPC trigger key
  npcMap['__outro__'] = outroLines;

  return { intro: introLines, npcs: npcMap };
}

export const beachDialogue = buildChapterDialogue(chapter1IntroText, chapter1NPCs, chapter1OutroText);
export const wrongCrowdDialogue = buildChapterDialogue(chapter2IntroText, chapter2NPCs, chapter2OutroText);
export const jailDialogue = buildChapterDialogue(chapter3IntroText, chapter3NPCs, chapter3OutroText);
export const tractorDialogue = buildChapterDialogue(chapter4IntroText, chapter4NPCs, chapter4OutroText);
export const comeUpDialogue = buildChapterDialogue(chapter5IntroText, chapter5NPCs, chapter5OutroText);
export const operatorDialogue = buildChapterDialogue(chapter6IntroText, chapter6NPCs, chapter6OutroText);

export const endScreenData = {
  stats: endScreenStats,
  cta: endScreenCTA,
  links: endScreenLinks,
};
