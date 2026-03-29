// ─── Story & Dialogue Data ─────────────────────────────────────────────
// All narrative content for JP's life-story RPG.
// Imported by scene files to drive dialogue boxes, intro/outro cards, etc.

// ─── Types ─────────────────────────────────────────────────────────────

export type DialogueChoice = { text: string; next?: DialogueLine[] };
export type DialogueLine = { speaker?: string; text: string; choices?: DialogueChoice[] };

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

export const chapter0IntroText: string[] = [];

export const chapter0NPCs: NPCData[] = [
  {
    id: 'ch0_pops',
    x: 8,
    y: 10,
    sprite: 'npc_pops',
    dialogue: [
      { speaker: 'Pops', text: 'You been on that computer all day.' },
      { speaker: 'JP', text: 'I\'m looking at crypto.' },
      { speaker: 'Pops', text: 'Crypto? Just don\'t lose your shirt.' },
      { speaker: 'JP\'s Mind', text: 'Everyone else seems to know what they\'re doing.' },
      { speaker: 'JP\'s Mind', text: 'Maybe Pops did too at my age. Maybe not.' },
      { speaker: 'JP', text: '', choices: [
        { text: '"I won\'t. I\'ve been studying it."', next: [
          { speaker: 'Pops', text: 'Studying. That\'s good. Just don\'t bet the house.' },
        ]},
        { text: '"I don\'t really know what I\'m doing yet."', next: [
          { speaker: 'Pops', text: 'At least you\'re honest about it. Most people aren\'t.' },
        ]},
      ]},
      { speaker: 'Pops', text: 'Whatever you do, just do it all the way. Don\'t half-ass it.' },
    ],
  },
  {
    id: 'ch0_mom',
    x: 18,
    y: 10,
    sprite: 'npc_female',
    dialogue: [
      { speaker: 'Mom', text: 'Those college letters are still on the counter.' },
      { speaker: 'JP', text: 'I\'m not going, Mom.' },
      { speaker: 'Mom', text: 'You got accepted to three schools, Jordan.' },
      { speaker: 'JP', text: '', choices: [
        { text: '"I can learn more on my own, Mom."', next: [
          { speaker: 'Mom', text: 'You sound just like your father.' },
        ]},
        { text: '"I know it\'s hard to understand."', next: [
          { speaker: 'Mom', text: '...I just want you to have options, Jordan.' },
        ]},
      ]},
      { speaker: 'JP', text: 'I know. But I\'m not spending forty thousand a year for something I can learn myself.' },
      { speaker: 'Mom', text: '...' },
      { speaker: 'Narrator', text: 'She walks away. She doesn\'t agree but she\'s done arguing.' },
    ],
  },
  {
    id: 'ch0_sister',
    x: 12,
    y: 2,
    sprite: 'npc_sister',
    dialogue: [
      { speaker: 'Sister', text: 'JP! Come play with me!' },
      { speaker: 'JP', text: 'Not right now, I\'m busy.' },
      { speaker: 'Sister', text: 'You\'re ALWAYS busy.' },
      { speaker: 'JP', text: 'I know. I\'m sorry.' },
      { speaker: 'Sister', text: 'Will you be here for my birthday?' },
      { speaker: 'JP', text: '', choices: [
        { text: '"Of course. I promise."', next: [
          { speaker: 'Sister', text: 'Pinky promise?' },
          { speaker: 'JP', text: 'Pinky promise.' },
          { speaker: 'JP\'s Mind', text: 'Jordan meant it. But life doesn\'t always let you keep promises.' },
        ]},
        { text: '"I\'ll try my best."', next: [
          { speaker: 'Sister', text: '...okay.' },
          { speaker: 'JP\'s Mind', text: 'She didn\'t believe him. Smart kid.' },
        ]},
      ]},
    ],
  },
  {
    id: 'ch0_frenchie',
    x: 15,
    y: 18,
    sprite: 'npc_frenchie',
    dialogue: [
      { speaker: 'Narrator', text: 'Ivy wags her whole body when she sees Jordan. Tan Frenchie energy.' },
      { speaker: 'Narrator', text: 'She doesn\'t care about your problems. She just wants belly rubs.' },
      { speaker: 'JP', text: 'Hey Ivy. At least you\'re happy to see me.' },
      { speaker: 'Narrator', text: 'Sometimes the dog is the only one who gets it.' },
    ],
  },
];

export const chapter0OutroText: string[] = [
  'Jordan packed a bag. Left the acceptance letters on the counter. Hugged his sister. Dapped up Pops.',
  'Santa Barbara was calling.',
];

// ─── Chapter 1: Santa Barbara ──────────────────────────────────────────

export const chapter1IntroText: string[] = [
  'Santa Barbara',
  'Townhouse by the beach. Hot tub. Weed. Girls.',
  'Looks like paradise. Feels like a trap.',
];

export const chapter1NPCs: NPCData[] = [
  {
    id: 'ch1_homie1',
    x: 6,
    y: 4,
    sprite: 'npc_nolan',
    dialogue: [
      { speaker: 'Nolan', text: 'Bro let\'s go to LA this weekend. Melrose.' },
      { speaker: 'JP', text: 'Again? We always end up in Hollywood.' },
      { speaker: 'Nolan', text: 'That\'s the point. Last time we linked with those TikTok girls.' },
      { speaker: 'JP', text: 'And spent $400 on dinner for people we\'ll never see again.' },
      { speaker: 'Nolan', text: 'It\'s networking bro.', choices: [
        { text: '"That\'s not networking, that\'s burning money."', next: [
          { speaker: 'Nolan', text: 'You sound like your pops right now.' },
          { speaker: 'JP', text: 'Maybe he was right about some things.' },
          { speaker: 'Nolan', text: 'Don\'t start. We\'re 20. We\'re supposed to blow money on dumb shit.' },
          { speaker: 'JP', text: 'I\'m supposed to be building something.' },
          { speaker: 'Nolan', text: 'Building what? Bro you don\'t even have a plan.' },
          { speaker: 'JP\'s Mind', text: 'He\'s not wrong. But hearing it out loud stings.' },
        ]},
        { text: '"Alright. One more time."', next: [
          { speaker: 'Nolan', text: 'That\'s my boy. I\'ll drive.' },
          { speaker: 'Nolan', text: 'We should bring Cooper. He always knows somebody.' },
          { speaker: 'JP\'s Mind', text: 'Same plan. Same weekend. Same nothing at the end of it.' },
        ]},
      ]},
    ],
  },
  {
    id: 'ch1_homie2',
    x: 18,
    y: 10,
    sprite: 'npc_david',
    dialogue: [
      { speaker: 'David', text: 'Hot tub\'s heated up. Girls are coming over later.' },
      { speaker: 'JP', text: 'Again?' },
      { speaker: 'David', text: 'What else we gonna do?' },
      { speaker: 'JP', text: '', choices: [
        { text: '"Something productive?"', next: [
          { speaker: 'David', text: 'Bro. We live in Santa Barbara. By the beach. With a hot tub.' },
          { speaker: 'David', text: 'What\'s more productive than enjoying life?' },
          { speaker: 'JP', text: 'I don\'t know. Something that lasts longer than tonight.' },
          { speaker: 'David', text: '...you good?' },
          { speaker: 'JP\'s Mind', text: 'No. But he can\'t explain it to someone who doesn\'t feel it.' },
        ]},
        { text: '"Who\'s coming?"', next: [
          { speaker: 'David', text: 'Ashley. Her friends. That girl from the volleyball game.' },
          { speaker: 'David', text: 'She was asking about you, by the way.' },
          { speaker: 'JP', text: 'Cool.' },
          { speaker: 'David', text: 'Cool? That\'s it? Bro she\'s bad.' },
          { speaker: 'JP\'s Mind', text: 'He\'s trying to keep me here. Keep me happy. Keep me distracted.' },
        ]},
      ]},
    ],
  },
  {
    id: 'ch1_cooper',
    x: 5,
    y: 2,
    sprite: 'npc_cooper',
    dialogue: [
      { speaker: 'Cooper', text: 'Bro this house is insane.' },
      { speaker: 'JP', text: 'It\'s alright.' },
      { speaker: 'Cooper', text: 'Alright? We got a hot tub and no landlord checking on us.' },
      { speaker: 'JP', text: 'That\'s the problem.' },
      { speaker: 'Cooper', text: 'What do you mean?' },
      { speaker: 'JP', text: 'Nobody checking on us means nobody stopping us.' },
      { speaker: 'Cooper', text: '...isn\'t that the point?' },
      { speaker: 'JP', text: '', choices: [
        { text: '"Yeah. I guess."', next: [
          { speaker: 'Cooper', text: 'Don\'t overthink it, bro. We\'re living.' },
          { speaker: 'JP\'s Mind', text: 'Living. Is that what this is?' },
        ]},
        { text: '"Nah. That\'s the problem."', next: [
          { speaker: 'Cooper', text: 'You always get like this. Just relax.' },
          { speaker: 'Cooper', text: 'Go hit the hot tub. Get out of your head.' },
          { speaker: 'JP\'s Mind', text: 'Everyone\'s answer is the same. Stop thinking. Have fun. Repeat.' },
        ]},
      ]},
    ],
  },
  {
    id: 'ch1_girl1',
    x: 10,
    y: 5,
    sprite: 'npc_bikini1',
    dialogue: [
      { speaker: 'Girl', text: 'You live here?' },
      { speaker: 'JP', text: 'Yeah.' },
      { speaker: 'Girl', text: 'This place is crazy. Who\'s throwing tonight?' },
      { speaker: 'JP', text: 'We always throwing.' },
      { speaker: 'Girl', text: 'Must be nice. I wish I had a spot like this.' },
      { speaker: 'JP', text: '', choices: [
        { text: '"It\'s not as cool as it looks."', next: [
          { speaker: 'Girl', text: 'Boy please. You\'re on the beach with a hot tub and cute friends.' },
          { speaker: 'Girl', text: 'What\'s not cool about that?' },
          { speaker: 'JP\'s Mind', text: 'She sees the highlight reel. Not the 3 AM version.' },
        ]},
        { text: '"Yeah. It\'s not bad."', next: [
          { speaker: 'Girl', text: 'Not bad? You\'re funny. I like that.' },
          { speaker: 'JP\'s Mind', text: 'She\'s cool. But she\'ll be gone by tomorrow. They all are.' },
        ]},
      ]},
    ],
  },
  {
    id: 'ch1_girl2',
    x: 20,
    y: 10,
    sprite: 'npc_bikini2',
    dialogue: [
      { speaker: 'Girl', text: 'You got a light?' },
      { speaker: 'JP', text: '', choices: [
        { text: '"Yeah, here."', next: [
          { speaker: 'Girl', text: 'Thanks. You seem different from the other guys here.' },
          { speaker: 'JP', text: 'Different how?' },
          { speaker: 'Girl', text: 'I don\'t know. Like you\'re here but you\'re not really here.' },
          { speaker: 'JP', text: 'Yeah. I get that a lot.' },
          { speaker: 'JP\'s Mind', text: 'She clocked it in five minutes. These guys I live with still haven\'t.' },
        ]},
        { text: '"Nah."', next: [
          { speaker: 'Girl', text: 'Whatever.' },
          { speaker: 'JP\'s Mind', text: 'Didn\'t feel like talking. That\'s becoming more frequent.' },
        ]},
      ]},
    ],
  },
  {
    id: 'ch1_terrell',
    x: 13,
    y: 4,
    sprite: 'npc_terrell',
    dialogue: [
      { speaker: 'Terrell', text: 'Bro you been up since noon?' },
      { speaker: 'JP', text: 'I been up since 8. Working on something.' },
      { speaker: 'Terrell', text: 'Working on what? We don\'t have jobs.' },
      { speaker: 'JP', text: 'Exactly. That\'s the problem.' },
      { speaker: 'Terrell', text: '...that\'s deep for a Tuesday morning.' },
      { speaker: 'JP', text: 'You ever think about what happens after this?' },
      { speaker: 'Terrell', text: 'After what?' },
      { speaker: 'JP', text: 'After SB. After the parties. After the money runs out.' },
      { speaker: 'Terrell', text: 'Nah. I try not to think about that.' },
      { speaker: 'JP', text: 'I can\'t stop thinking about it.' },
      { speaker: 'Terrell', text: 'That\'s your problem, bro. You think too much.' },
      { speaker: 'JP\'s Mind', text: 'Or maybe he doesn\'t think enough.' },
    ],
  },
  {
    id: 'ch1_bigbart',
    x: 20,
    y: 5,
    sprite: 'npc_bigbart',
    dialogue: [
      { speaker: 'Big Bart', text: 'JPPPPP! What\'s good big dawg!' },
      { speaker: 'Narrator', text: 'Big Bart bear-hugs JP before he can answer.' },
      { speaker: 'JP', text: 'Bart. Chill. You\'re crushing me.' },
      { speaker: 'Big Bart', text: 'Bro I\'m just HYPED! This house is CRAZY!' },
      { speaker: 'Big Bart', text: 'I already broke a chair. Don\'t tell Nolan.' },
      { speaker: 'JP', text: 'It\'s been one day, Bart.' },
      { speaker: 'Big Bart', text: 'AND IT\'S ALREADY THE BEST DAY OF MY LIFE!' },
    ],
  },
  {
    id: 'ch1_gf_k',
    x: 14,
    y: 5,
    sprite: 'npc_female',
    dialogue: [
      { speaker: 'Narrator', text: 'K stirs. Opens her eyes.' },
      { speaker: 'K', text: 'Mmm... hey baby.' },
      { speaker: 'JP', text: 'Hey. Morning.' },
      { speaker: 'K', text: 'What time is it?' },
      { speaker: 'JP', text: 'Like 11.' },
      { speaker: 'K', text: 'Shit. I gotta go. UCLA orientation stuff today.' },
      { speaker: 'Narrator', text: 'She gets up. Fixes her hair in his mirror.' },
      { speaker: 'K', text: 'Have a good day okay? Work hard. Don\'t just smoke all day.' },
      { speaker: 'JP', text: 'I won\'t.' },
      { speaker: 'K', text: 'I\'m serious JP.' },
      { speaker: 'Narrator', text: 'She kisses him. Grabs her bag.' },
      { speaker: 'K', text: 'Be safe. I love you.' },
      { speaker: 'JP', text: 'Love you too.' },
      { speaker: 'Narrator', text: 'The door closes. The room gets quiet.' },
      { speaker: 'JP\'s Mind', text: 'She\'s the only person who actually cares if I make it.' },
    ],
  },
];

export const chapter1OutroText: string[] = [
  'Same house. Same people. Same bags. Same nothing.',
  'But Jordan didn\'t see it yet.',
];

// ─── Chapter 2: Wrong Crowd ────────────────────────────────────────────

export const chapter2IntroText: string[] = [
  'Wrong Crowd',
  '3:33 AM. The house is quiet. Jordan is not.',
  'Something feels off. But the money doesn\'t wait.',
];

export const chapter2NPCs: NPCData[] = [
  {
    id: 'ch2_homie_door',
    x: 12,
    y: 7,
    sprite: 'npc_kid',
    dialogue: [
      { speaker: 'Jose', text: 'Bro. It\'s 3 in the morning.' },
      { speaker: 'JP', text: 'I know.' },
      { speaker: 'Jose', text: 'You going to dude\'s spot again?' },
      { speaker: 'JP', text: '', choices: [
        { text: '"Last time. I\'m done after this."', next: [
          { speaker: 'Jose', text: 'You said that three drops ago, bro.' },
          { speaker: 'Jose', text: 'I\'m serious. Something don\'t feel right tonight.' },
        ]},
        { text: '"Don\'t worry about it."', next: [
          { speaker: 'Jose', text: 'See, that\'s what worries me. You used to tell me everything.' },
          { speaker: 'Jose', text: 'Now you just... disappear at 3 AM and come back different.' },
        ]},
      ]},
      { speaker: 'JP', text: 'I\'ll be fine. I\'m always fine.' },
      { speaker: 'Jose', text: 'Nah. You\'re always lucky. That\'s different.' },
      { speaker: 'Jose', text: 'Just... text me when you\'re back. For real this time.' },
      { speaker: 'JP\'s Mind', text: 'Jose is the only one who still checks. Everyone else stopped asking.' },
    ],
  },
  {
    id: 'ch2_lookout',
    x: 19,
    y: 21,
    sprite: 'npc_shady',
    dialogue: [
      { speaker: '???', text: 'Yo. Stop.' },
      { speaker: 'JP', text: '', choices: [
        { text: '"I\'m here for the pickup."', next: [
          { speaker: '???', text: '...' },
          { speaker: '???', text: 'How many times you been here?' },
          { speaker: 'JP', text: 'Enough.' },
          { speaker: '???', text: 'Aight. He\'s inside. Don\'t take long.' },
          { speaker: '???', text: 'And don\'t be coming back here every week. People notice.' },
        ]},
        { text: '"Who are you?"', next: [
          { speaker: '???', text: 'I\'m the reason nobody\'s run up on this spot yet.' },
          { speaker: '???', text: 'He\'s inside. Go.' },
          { speaker: 'JP\'s Mind', text: 'Something about the way he said that. Like a warning.' },
        ]},
      ]},
    ],
  },
  {
    id: 'ch2_buyer',
    x: 24,
    y: 23,
    sprite: 'npc_generic',
    dialogue: [
      { speaker: 'Buyer', text: 'You\'re late.' },
      { speaker: 'JP', text: 'Traffic.' },
      { speaker: 'Buyer', text: 'At 3 AM? Whatever. You got it?' },
      { speaker: 'JP', text: 'Right here.' },
      { speaker: 'Buyer', text: 'Let me see.' },
      { speaker: 'Narrator', text: 'The buyer takes his time. Weighs it. Smells it. Looks at JP.' },
      { speaker: 'Buyer', text: 'This is light.' },
      { speaker: 'JP', text: 'It\'s not light. That\'s a full zip.' },
      { speaker: 'Buyer', text: 'Nah. I\'m saying the quality. Last batch was better.' },
      { speaker: 'JP', text: '', choices: [
        { text: '"Same stuff. Same price. Take it or leave it."', next: [
          { speaker: 'Buyer', text: 'Relax. I\'m taking it.' },
          { speaker: 'Buyer', text: 'You always this tense?' },
          { speaker: 'JP\'s Mind', text: 'Yes.' },
        ]},
        { text: '"Then go somewhere else."', next: [
          { speaker: 'Buyer', text: 'Easy, easy. I didn\'t say I don\'t want it.' },
          { speaker: 'Buyer', text: 'Just making conversation.' },
          { speaker: 'JP\'s Mind', text: 'Nobody makes conversation at a deal. Something\'s off.' },
        ]},
      ]},
      { speaker: 'Buyer', text: 'Aight. We good. Same time next week?' },
      { speaker: 'JP', text: 'We\'ll see.' },
      { speaker: 'JP\'s Mind', text: 'That took too long. He was stalling.' },
    ],
  },
];

export const chapter2OutroText: string[] = [
  'Just another drop. Until it wasn\'t.',
  'Doors kicked in. Flashlights. Shouting.',
  'Face down on the floor.',
];

// ─── Chapter 3: Jail ───────────────────────────────────────────────────

export const chapter3IntroText: string[] = [
  'Locked Up',
  '"Jordan Lopez. Attempted murder. 13 years."',
  'A bed. A toilet. And time.',
  'Nothing but time.',
];

export const chapter3NPCs: NPCData[] = [
  {
    id: 'ch3_mikey',
    x: 4,
    y: 6,
    sprite: 'npc_inmate',
    dialogue: [
      { speaker: 'Mikey', text: 'Bro, keep your head down. First week is the worst.' },
      { speaker: 'Mikey', text: 'I been here 8 months. You learn who to trust real quick.' },
      { speaker: 'Mikey', text: 'Don\'t talk to nobody you don\'t know. And don\'t look at nobody\'s food.' },
    ],
  },
  {
    id: 'ch3_chris',
    x: 7,
    y: 3,
    sprite: 'npc_inmate2',
    dialogue: [
      { speaker: 'Chris', text: 'JP? Damn. When\'d they get you?' },
      { speaker: 'Chris', text: 'Don\'t worry, we got you in here. Mikey, Bird, and me.' },
      { speaker: 'Chris', text: 'Just don\'t do nothing stupid the first month.' },
    ],
  },
  {
    id: 'ch3_bird',
    x: 7,
    y: 7,
    sprite: 'npc_inmate3',
    dialogue: [
      { speaker: 'Bird', text: 'Ayo JP, I saved you a spot in the cell block. Top bunk.' },
      { speaker: 'Bird', text: 'Food\'s trash but commissary hits different. I\'ll put you on.' },
    ],
  },
  {
    id: 'ch3_og',
    x: 4,
    y: 10,
    sprite: 'npc_inmate4',
    dialogue: [
      { speaker: 'OG Inmate', text: 'Fresh fish. What you in for?' },
      { speaker: 'JP', text: 'Attempted murder.' },
      { speaker: 'OG Inmate', text: '...you don\'t look like the type.' },
      { speaker: 'JP', text: 'I\'m not.' },
      { speaker: 'OG Inmate', text: 'Then keep your head down and you might make it out.' },
    ],
  },
  {
    id: 'ch3_guard',
    x: 16,
    y: 13,
    sprite: 'npc_guard',
    dialogue: [
      { speaker: 'Guard', text: 'New intake. Lopez. Cell 3.' },
      { speaker: 'Guard', text: 'Don\'t make me learn your name for the wrong reasons.' },
    ],
  },
  {
    id: 'ch3_mind',
    x: 13,
    y: 11,
    sprite: 'npc_mirror',
    dialogue: [
      { speaker: 'JP\'s Mind', text: 'Look at where you are.' },
      { speaker: 'JP\'s Mind', text: 'Pops tried to tell you. Jose tried to tell you. You didn\'t listen.' },
      { speaker: 'JP\'s Mind', text: 'Time you\'ll never get back. People who stopped picking up the phone. A reputation you gotta rebuild from scratch.' },
      { speaker: 'JP\'s Mind', text: 'So what now? Feel sorry for yourself? Blame somebody?' },
      { speaker: 'JP\'s Mind', text: 'Nah. That\'s done.' },
      { speaker: 'JP\'s Mind', text: 'Stop being a bitch. Change everything.' },
      { speaker: 'JP\'s Mind', text: 'When these doors open, you become somebody different. For real this time.' },
    ],
  },
];

export const chapter3OutroText: string[] = [
  '...',
];

// ─── Chapter 4: Caymus Vineyards ─────────────────────────────────────

export const chapter4IntroText: string[] = [
  'Caymus Vineyards',
  'Most people don\'t make it out of that situation.',
  'Jordan did. Now he\'s got dirt under his nails and $12 an hour.',
  'But he\'s free. And that\'s enough to start.',
];

export const chapter4NPCs: NPCData[] = [
  {
    id: 'ch4_boss',
    x: 5,
    y: 3,
    sprite: 'npc_farmer',
    dialogue: [
      { speaker: 'Ernesto', text: 'Oye, llegas a tiempo. Eso ya te pone mejor que los últimos tres.' },
      { speaker: 'JP', text: 'Just wanna work.' },
      { speaker: 'Ernesto', text: 'Bueno. El D8 Cat necesita limpiar el bloque este antes del mediodía. Las viñas de Cab Sauv van la próxima semana.' },
      { speaker: 'JP\'s Mind', text: 'My Spanish is getting better every day out here. Not fluent. But enough.' },
      { speaker: 'Ernesto', text: '¿Lo puedes manejar?', choices: [
        { text: '"Sí. Lo voy a hacer."', next: [
          { speaker: 'Ernesto', text: 'Eso me gusta. Me recuerdas a mí cuando era joven.' },
          { speaker: 'Ernesto', text: 'Empecé aquí cortando uvas. Treinta años después, manejo toda la operación.' },
          { speaker: 'Ernesto', text: 'No le hagas menos al trabajo. Todo imperio empezó en la tierra.' },
        ]},
        { text: '"Honestly? I\'d rather be doing something else."', next: [
          { speaker: 'Ernesto', text: 'Todos queremos algo más. Pero sabes qué te enseña la viña?' },
          { speaker: 'Ernesto', text: 'Paciencia. Plantas hoy, no tomas el vino hasta en tres años.' },
          { speaker: 'Ernesto', text: 'Lo que hagas después — acuérdate de eso. Nada bueno es rápido.' },
        ]},
      ]},
      { speaker: 'Ernesto', text: 'Una cosa más. Te veo con el teléfono cada día en el almuerzo.' },
      { speaker: 'JP', text: '...' },
      { speaker: 'Ernesto', text: 'No me importa qué haces con él. Pero no lo lleves al tractor.' },
      { speaker: 'JP\'s Mind', text: 'He noticed. Of course he noticed.' },
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
    sprite: 'npc_jose',
    dialogue: [
      { speaker: 'Juan', text: '¿Qué haces siempre con el teléfono, güey? Ni comes.' },
      { speaker: 'JP', text: 'Estoy aprendiendo a hacer websites.' },
      { speaker: 'Juan', text: '¿Websites? Tú manejas un tractor, hermano.' },
      { speaker: 'JP', text: 'Por ahora.' },
      { speaker: 'Juan', text: 'Jaja, eso dicen todos. Y todos siguen aquí.' },
      { speaker: 'JP', text: '', choices: [
        { text: '"Yo no soy como ellos."', next: [
          { speaker: 'Juan', text: '¿A ver? ¿Qué hiciste? Enséñame.' },
          { speaker: 'JP', text: 'Mira. Este website lo hice yo. En mi teléfono. En el lunch.' },
          { speaker: 'Juan', text: '...no mames. ¿Tú hiciste eso?' },
          { speaker: 'JP', text: 'En tres días.' },
          { speaker: 'Juan', text: 'Órale. Te la rifas, güey.' },
        ]},
        { text: '"Ya veremos."', next: [
          { speaker: 'Juan', text: 'Sí, ya veremos.' },
          { speaker: 'JP\'s Mind', text: 'He doesn\'t believe me. That\'s fine. I don\'t need him to.' },
        ]},
      ]},
    ],
  },
  {
    id: 'ch4_eliseo',
    x: 20,
    y: 7,
    sprite: 'npc_generic',
    dialogue: [
      { speaker: 'Eliseo', text: 'Oye JP, ¿cómo se dice "irrigation" en español?' },
      { speaker: 'JP', text: 'Uh... ¿irrigación?' },
      { speaker: 'Eliseo', text: 'Jaja, casi. Riego. Se dice riego.' },
      { speaker: 'JP', text: 'Riego. Got it.' },
      { speaker: 'Eliseo', text: 'Oye, ¿sabes qué significa "chingón"?' },
      { speaker: 'JP', text: 'Yeah, Juan taught me that one the first week.' },
      { speaker: 'Eliseo', text: 'Jaja, claro que sí. ¿Y "no mames"? ¿"Pendejo"? ¿"A la verga"?' },
      { speaker: 'JP', text: 'Bro I knew Spanish before this. Y\'all just taught me the bad words.' },
      { speaker: 'Eliseo', text: 'Jaja, exacto. Así se aprende. Sin opción.' },
      { speaker: 'Eliseo', text: 'Sabes qué, me caes bien. La mayoría de los gringos no se molestan en hablar con nosotros.' },
      { speaker: 'JP', text: 'You guys are the hardest workers here. I\'d be stupid not to.' },
      { speaker: 'Eliseo', text: 'Eso. Respeto, hermano.' },
      { speaker: 'JP\'s Mind', text: 'Juan and Eliseo taught me more Spanish in three months than two years of high school ever did.' },
      { speaker: 'JP\'s Mind', text: 'They crossed a border for this job. I just drove thirty minutes. Perspective.' },
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
  'No clients. No portfolio. No reputation.',
  'Just a laptop, an internet connection, and six months of rage.',
];

export const chapter5NPCs: NPCData[] = [
  {
    id: 'ch5_first_client',
    x: 3,
    y: 4,
    sprite: 'npc_client',
    dialogue: [
      { speaker: 'Small Biz Owner', text: 'So you can really build me a website?' },
      { speaker: 'JP', text: '', choices: [
        { text: '"Yeah. I can do it."', next: [
          { speaker: 'Small Biz Owner', text: 'You got a portfolio? Something I can look at?' },
          { speaker: 'JP', text: 'Not yet. But I\'ll build yours for cheap and you can judge from that.' },
          { speaker: 'Small Biz Owner', text: 'Hmm. How cheap?' },
        ]},
        { text: '"I\'m still learning. But I\'ll make it work."', next: [
          { speaker: 'Small Biz Owner', text: 'At least you\'re honest. My last guy oversold and underdelivered.' },
          { speaker: 'Small Biz Owner', text: 'How much?' },
        ]},
      ]},
      { speaker: 'JP', text: '$300.' },
      { speaker: 'Small Biz Owner', text: 'Three hundred? My last quote was four thousand.' },
      { speaker: 'JP', text: 'Their quote. My price.' },
      { speaker: 'Small Biz Owner', text: 'You got one week. If it\'s good, I\'ll tell people.' },
      { speaker: 'JP', text: 'Deal.' },
      { speaker: 'JP\'s Mind', text: 'Hands are shaking under the table. This is the first real client.' },
      { speaker: 'JP\'s Mind', text: 'If I mess this up, there might not be a second one.' },
      { speaker: 'JP\'s Mind', text: 'Don\'t mess this up.' },
    ],
  },
  {
    id: 'ch5_sticker',
    x: 8,
    y: 3,
    sprite: 'npc_sticker_smith',
    dialogue: [
      { speaker: 'Sticker Smith', text: 'JP, this site is clean. Like, actually clean.' },
      { speaker: 'JP', text: 'Told you I\'d handle it.' },
      { speaker: 'Sticker Smith', text: 'We\'re getting calls now. Real calls. From Google.' },
      { speaker: 'JP', text: 'That\'s the SEO kicking in.' },
      { speaker: 'Sticker Smith', text: 'I don\'t know what that means but I love it.' },
      { speaker: 'Sticker Smith', text: 'How much for the full marketing setup?', choices: [
        { text: '"$1,000. Full package."', next: [
          { speaker: 'JP', text: 'Website, Google Business, SEO, social media templates.' },
          { speaker: 'Sticker Smith', text: 'Done. I trust you.' },
        ]},
        { text: '"Let me scope it and get back to you."', next: [
          { speaker: 'JP', text: 'I want to give you exactly what you need. Not just what\'s easy.' },
          { speaker: 'Sticker Smith', text: 'See? That\'s why I rock with you.' },
        ]},
      ]},
      { speaker: 'Sticker Smith', text: 'Bro, you\'re different. Most people just talk. You actually deliver.' },
      { speaker: 'Sticker Smith', text: 'I got people who need what you do. I\'m putting them on.' },
      { speaker: 'JP\'s Mind', text: 'First referral. One person believes in you and tells two more. This is how it starts.' },
    ],
  },
  {
    id: 'ch5_ghost',
    x: 12,
    y: 6,
    sprite: 'npc_generic',
    dialogue: [
      { speaker: 'Prospect', text: 'Yeah I saw your DM. What can you do for me?' },
      { speaker: 'JP', text: 'Website, branding, the whole setup. I can have something for you in a week.' },
      { speaker: 'Prospect', text: 'How much?' },
      { speaker: 'JP', text: '$500.' },
      { speaker: 'Prospect', text: 'Let me think about it.' },
      { speaker: 'JP\'s Mind', text: '"Let me think about it" means no. I already know.' },
      { speaker: 'JP\'s Mind', text: 'But I sent the message. That\'s one more than yesterday.' },
    ],
  },
  {
    id: 'ch5_rejected',
    x: 6,
    y: 8,
    sprite: 'npc_generic',
    dialogue: [
      { speaker: 'Business Owner', text: 'Look, I appreciate the offer. But I found someone on Fiverr for $50.' },
      { speaker: 'JP', text: '', choices: [
        { text: '"You get what you pay for."', next: [
          { speaker: 'Business Owner', text: 'Maybe. But $50 is $50.' },
          { speaker: 'JP\'s Mind', text: 'Lost to a guy in another country charging nothing. How do I compete with that?' },
        ]},
        { text: '"No worries. Good luck."', next: [
          { speaker: 'JP\'s Mind', text: 'Third rejection this week. Starting to wonder if this is real or if I\'m delusional.' },
        ]},
      ]},
      { speaker: 'JP\'s Mind', text: 'Normal people quit after three. I sent six more proposals that night.' },
    ],
  },
  {
    id: 'ch5_wct',
    x: 15,
    y: 10,
    sprite: 'npc_client',
    dialogue: [
      { speaker: 'WCT Owner', text: 'I need an online store. Products, cart, checkout. The whole thing.' },
      { speaker: 'JP', text: 'I can do that. $900.' },
      { speaker: 'WCT Owner', text: 'Can you handle it? This is my business.' },
      { speaker: 'JP', text: '', choices: [
        { text: '"I\'ve built three sites this month. I got you."', next: [
          { speaker: 'WCT Owner', text: 'Three? In a month?' },
          { speaker: 'JP', text: 'When you don\'t sleep, you ship.' },
        ]},
        { text: '"I\'ll be straight with you — I\'m still new. But I work harder than anyone."', next: [
          { speaker: 'WCT Owner', text: 'You know what, I respect that more than the guys who oversell.' },
        ]},
      ]},
      { speaker: 'WCT Owner', text: 'Alright. Two weeks. Don\'t let me down.' },
      { speaker: 'JP\'s Mind', text: '$900. Biggest project yet. Built in two weeks while working another gig during the day.' },
      { speaker: 'JP\'s Mind', text: 'A month ago I didn\'t know what a component was. Now I\'m shipping stores.' },
    ],
  },
  {
    id: 'ch5_vacaville',
    x: 8,
    y: 8,
    sprite: 'npc_generic',
    dialogue: [
      { speaker: 'Vacaville Appliance', text: 'You fixed our website and now we\'re getting 3x the calls.' },
      { speaker: 'JP', text: 'That\'s what happens when it actually works.' },
      { speaker: 'Vacaville Appliance', text: 'How much for Google Ads?' },
      { speaker: 'JP', text: 'I\'ll send a proposal tonight.' },
      { speaker: 'JP\'s Mind', text: 'Repeat client. They came back. That means the work is real.' },
    ],
  },
  {
    id: 'ch5_manza',
    x: 22,
    y: 8,
    sprite: 'npc_manza',
    dialogue: [
      { speaker: 'Manza', text: 'JP, the website is fire. Exactly what I needed.' },
      { speaker: 'JP', text: 'Told you I\'d come through.' },
      { speaker: 'Manza', text: 'I got like five friends who need sites. I\'m sending them all your way.' },
      { speaker: 'JP', text: 'That\'s what I like to hear.' },
      { speaker: 'Manza', text: 'Real talk, you\'re different from the other web guys. You actually care.' },
      { speaker: 'JP\'s Mind', text: 'Word of mouth. The only marketing that matters when you\'re starting from zero.' },
    ],
  },
];

export const chapter5OutroText: string[] = [
  '$300. Then $500. Then $900. Then $1,000.',
  'The prices went up because the work got better.',
  'Jordan was building something. And people were starting to notice.',
];

// ─── Chapter 6: Operator Mode ──────────────────────────────────────────

export const chapter6IntroText: string[] = [
  'Operator Mode',
  'Enterprise clients. Closing deals. Building teams.',
  'The kid from the vineyard is running the operation now.',
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
      { speaker: 'Malachi', text: 'I gotta be real with you. When I first met you I thought you were just another guy talking big.' },
      { speaker: 'JP', text: 'And now?' },
      { speaker: 'Malachi', text: 'Now you\'re the reason this company runs. Every system, every workflow, every automation — that\'s you.' },
      { speaker: 'Malachi', text: 'Big meeting tomorrow. New client. You ready?', choices: [
        { text: '"Always ready."', next: [
          { speaker: 'Malachi', text: 'That\'s why you\'re COO. Not because of a title. Because you operate.' },
          { speaker: 'JP\'s Mind', text: 'COO at 22. No degree. No connections. Just work.' },
        ]},
        { text: '"Send me the details. I\'ll have the proposal by morning."', next: [
          { speaker: 'Malachi', text: 'By morning? You\'re insane. That\'s why this works.' },
          { speaker: 'JP\'s Mind', text: 'He doesn\'t know I was up until 4 AM last night building the last system. But he trusts me.' },
        ]},
      ]},
    ],
  },
  {
    id: 'ch6_big_client',
    x: 9,
    y: 3,
    sprite: 'npc_suit',
    dialogue: [
      { speaker: 'Client', text: 'We need the full stack. Website, CRM, AI receptionist, booking.', choices: [
        { text: '"End of week."', next: [
          { speaker: 'Client', text: 'End of week?! Our last vendor quoted eight weeks.' },
          { speaker: 'JP', text: 'I\'m not your last vendor.' },
        ]},
        { text: '"Tell me more about the business first."', next: [
          { speaker: 'Client', text: 'Smart. Most devs just start coding without understanding the problem.' },
          { speaker: 'JP', text: 'That\'s why they take eight weeks.' },
        ]},
      ]},
      { speaker: 'Client', text: 'Clearly. Let\'s talk numbers.' },
    ],
  },
  {
    id: 'ch6_equal',
    x: 12,
    y: 7,
    sprite: 'npc_whale',
    dialogue: [
      { speaker: 'Big Player', text: 'That automation saved us twenty hours a week. What else can you do?', choices: [
        { text: '"What do you need?"', next: [
          { speaker: 'Big Player', text: 'I need someone who sees the whole system. Not just pieces.' },
          { speaker: 'JP', text: 'That\'s literally what I do.' },
        ]},
        { text: '"I can automate your entire pipeline."', next: [
          { speaker: 'Big Player', text: 'The whole thing? What would that cost?' },
          { speaker: 'JP', text: 'Less than what it\'s costing you now.' },
        ]},
      ]},
      { speaker: 'Big Player', text: 'This is why I keep you close, man. You see the system before anyone explains it.' },
      { speaker: 'JP', text: 'Pattern recognition. That\'s the edge.' },
    ],
  },
  {
    id: 'ch6_office_kult',
    x: 6,
    y: 4,
    sprite: 'npc_tech',
    dialogue: [
      { speaker: 'Office Kult Rep', text: 'Office Kult wants you on the creative team.' },
      { speaker: 'JP', text: 'I\'m already running three systems for them.' },
      { speaker: 'Office Kult Rep', text: 'Exactly. That\'s why they want you full-time.' },
      { speaker: 'JP', text: 'Tell them I\'m an operator, not an employee.' },
    ],
  },
  {
    id: 'ch6_tony',
    x: 12,
    y: 8,
    sprite: 'npc_suit',
    dialogue: [
      { speaker: 'Tony', text: 'JP, I got connections at Flamingo and Caesars. They need a promoter bot.' },
      { speaker: 'JP', text: 'Send me the specs. I\'ll have a demo by Friday.' },
      { speaker: 'Tony', text: 'This is why I keep calling you, man.' },
    ],
  },
  {
    id: 'ch6_client2',
    x: 24,
    y: 4,
    sprite: 'npc_business',
    dialogue: [
      { speaker: 'New Client', text: 'We need the full stack. Website, CRM, AI receptionist, booking system.' },
      { speaker: 'JP', text: 'End of week.' },
      { speaker: 'New Client', text: 'Our last vendor quoted eight weeks.' },
      { speaker: 'JP', text: 'I\'m not your last vendor.' },
    ],
  },
  {
    id: 'ch6_team_member',
    x: 19,
    y: 13,
    sprite: 'npc_generic',
    dialogue: [
      { speaker: 'Team Member', text: 'JP, the dashboard you built is saving us 10 hours a week minimum.' },
      { speaker: 'JP', text: 'That\'s the point. Automate the boring stuff so you can focus on closing.' },
    ],
  },
  {
    id: 'ch6_manza',
    x: 30,
    y: 11,
    sprite: 'npc_manza',
    dialogue: [
      { speaker: 'Manza', text: 'My boy just hit me up. He needs a site by Friday. You want it?' },
      { speaker: 'JP', text: 'Send it over.' },
      { speaker: 'Manza', text: 'Already did. Check your DMs. I told him you\'re the guy.' },
    ],
  },
  {
    id: 'ch6_dhl',
    x: 28,
    y: 11,
    sprite: 'npc_dhl_client',
    dialogue: [
      { speaker: 'DHL Manager', text: 'We have a problem. Our warehouse team speaks four different languages.' },
      { speaker: 'DHL Manager', text: 'Safety protocols aren\'t getting through. Three incidents this quarter.' },
      { speaker: 'DHL Manager', text: 'Our dev team\'s been working on a translator app for two months. Nothing.' },
      { speaker: 'JP', text: '', choices: [
        { text: '"I can have a demo by Friday."', next: [
          { speaker: 'DHL Manager', text: 'End of WEEK? Our team said six months minimum.' },
          { speaker: 'JP', text: 'Different tools. Different approach.' },
          { speaker: 'DHL Manager', text: 'You\'re serious?' },
          { speaker: 'JP', text: 'Dead serious.' },
        ]},
        { text: '"People\'s safety is on the line. I\'ll figure it out."', next: [
          { speaker: 'DHL Manager', text: 'That\'s the right answer. Most devs ask about the budget first.' },
          { speaker: 'JP\'s Mind', text: 'Enterprise. Lives depending on code I haven\'t written yet.' },
        ]},
      ]},
      { speaker: 'DHL Manager', text: 'We\'ll pay whatever it takes. This is infrastructure, not a website.' },
      { speaker: 'JP\'s Mind', text: 'Their whole dev team couldn\'t crack it. And I\'m about to do it alone in a week.' },
      { speaker: 'JP\'s Mind', text: 'That\'s the play. Move fast. Figure it out. Ship it.' },
    ],
  },
  {
    id: 'ch6_mentor',
    x: 20,
    y: 8,
    sprite: 'npc_generic',
    dialogue: [
      { speaker: 'Mentor', text: 'You built all this in five months? Self-taught?' },
      { speaker: 'JP', text: 'Yeah. AI helped. But I had to learn how to use it right.' },
      { speaker: 'Mentor', text: 'Most people with CS degrees can\'t ship this fast.' },
      { speaker: 'Mentor', text: 'Stop charging a thousand. You\'re leaving money on the table.' },
      { speaker: 'JP', text: 'I\'m getting there.' },
      { speaker: 'Mentor', text: 'You\'re already there. You just don\'t believe it yet.' },
      { speaker: 'JP\'s Mind', text: 'First time someone in this industry looked at me like an equal. Not a kid. Not a project. An equal.' },
    ],
  },
  {
    id: 'ch6_elijah',
    x: 12,
    y: 5,
    sprite: 'npc_elijah',
    dialogue: [
      { speaker: 'Elijah', text: 'The API integration is live. Pushed it this morning.' },
      { speaker: 'JP', text: 'Already? I just sent you the spec yesterday.' },
      { speaker: 'Elijah', text: 'You write clean specs. Makes my job easy.' },
      { speaker: 'JP', text: '', choices: [
        { text: '"That\'s why I brought you on. You don\'t need babysitting."', next: [
          { speaker: 'Elijah', text: 'Appreciate that. Most people micromanage.' },
          { speaker: 'Elijah', text: 'You just say what you need and let me cook.' },
        ]},
        { text: '"We\'re building something real here."', next: [
          { speaker: 'Elijah', text: 'I know. That\'s why I\'m here.' },
          { speaker: 'Elijah', text: 'Lot of people talk. You actually ship.' },
        ]},
      ]},
    ],
  },
];

export const chapter6OutroText: string[] = [
  'From a cell to a courtroom to a vineyard to a laptop to the boardroom.',
  'Self-taught. No degree. No bootcamp. No connections. No excuses.',
  'The story isn\'t over. It\'s just getting started.',
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
  // --- JP's Room ---
  ch0_computer: [
    { speaker: 'Narrator', text: 'Crypto charts open. Coinbase tab. Discord servers.' },
    { speaker: 'Narrator', text: 'A folder called \'Ideas\' with 47 files in it.' },
    { speaker: 'Narrator', text: 'Half-finished projects everywhere. This kid is trying everything.' },
  ],
  ch0_crypto: [
    { speaker: 'Narrator', text: 'JP\'s phone. Coinbase notification: "BTC up 4% today."' },
    { speaker: 'JP\'s Mind', text: 'Check the computer for the full portfolio.' },
  ],
  ch0_college: [
    { speaker: 'Narrator', text: 'Oregon. Hawaii. Arizona State. All accepted. All collecting dust.' },
    { speaker: 'JP\'s Mind', text: 'JP did the math — $40K/year to learn what YouTube teaches for free.' },
    { speaker: 'JP\'s Mind', text: 'He chose Santa Barbara and the network instead.' },
  ],
  ch0_bed: [
    { speaker: 'JP\'s Mind', text: 'My bed. Same sheets since high school.' },
    { speaker: 'JP\'s Mind', text: 'At least it\'s comfortable.' },
  ],
  ch0_poster: [
    { speaker: 'Narrator', text: 'A poster on the wall. Big bold letters:' },
    { speaker: 'Poster', text: '"THE ONLY PERSON YOU\'RE COMPETING WITH IS WHO YOU WERE YESTERDAY."' },
    { speaker: 'Narrator', text: 'JP put it up as a joke. But some mornings, it\'s the first thing he reads.' },
    { speaker: 'JP\'s Mind', text: 'Yesterday I did nothing. So the bar is low.' },
  ],
  ch0_nolan_call: [
    { speaker: 'Narrator', text: 'JP\'s phone rings. It\'s Nolan.' },
    { speaker: 'Nolan', text: 'Yo JP. You still stuck at home?' },
    { speaker: 'JP', text: 'Doing nothing bro.' },
    { speaker: 'Nolan', text: 'Come down to Santa Barbara. Me and the boys got a spot by the beach.' },
    { speaker: 'Nolan', text: 'We\'re all going to SBCC. It\'s chill. Good vibes, good weather, good people.' },
    { speaker: 'JP', text: 'School? For real?' },
    { speaker: 'Nolan', text: 'Yeah bro. Figure it out down here. Better than sitting in your room.' },
    { speaker: 'JP', text: '', choices: [
      { text: '"I need to get out of here. I\'m in."', next: [
        { speaker: 'Nolan', text: 'Let\'s go. I\'ll send you the address.' },
      ]},
      { text: '"Let me think about it."', next: [
        { speaker: 'Nolan', text: 'Don\'t think too long. Room\'s almost gone.' },
        { speaker: 'JP', text: '...alright. I\'m in.' },
      ]},
    ]},
    { speaker: 'JP\'s Mind', text: 'Nolan wasn\'t offering anything shady. Just a fresh start. JP needed that.' },
  ],
  ch0_hidden_stash: [
    { speaker: 'Narrator', text: 'A bag tucked behind the desk. JP pockets it.' },
  ],
  ch0_journal: [
    { speaker: 'Narrator', text: 'A journal with one entry:' },
    { speaker: 'Narrator', text: '\'I\'m going to be somebody. I just don\'t know how yet.\'' },
    { speaker: 'Narrator', text: 'Dated six months ago.' },
  ],
  ch0_papers: [
    { speaker: 'Narrator', text: 'RAW blacks. JP always keeps a pack in the nightstand.' },
  ],
  // --- Sister's Room ---
  ch0_sister_bed: [
    { speaker: 'Narrator', text: 'Pink comforter. Stuffed animals lined up like an army.' },
    { speaker: 'Narrator', text: 'She makes her bed every morning. JP doesn\'t.' },
  ],
  ch0_sister_toys: [
    { speaker: 'Narrator', text: 'Her drawings are all over the walls.' },
    { speaker: 'Narrator', text: 'One of them is JP with a cape. He didn\'t ask for that but it hits different.' },
  ],
  ch0_sister_mirror: [
    { speaker: 'Narrator', text: 'Little vanity mirror with stickers all over the frame.' },
    { speaker: 'Narrator', text: 'She\'s growing up fast.' },
  ],
  // --- Parents' Room ---
  ch0_parents_bed: [
    { speaker: 'Narrator', text: 'King size. Mom\'s side is always perfectly made. Pops\' side... not so much.' },
  ],
  ch0_family_photo: [
    { speaker: 'Narrator', text: 'Family photo from when JP was 12.' },
    { speaker: 'Narrator', text: 'Everyone\'s smiling. Simpler times.' },
  ],
  ch0_parents_tv: [
    { speaker: 'Narrator', text: 'Small TV in the corner. Mom watches Japanese dramas on it.' },
    { speaker: 'Narrator', text: 'Pops pretends he doesn\'t like them. He does.' },
  ],
  // --- Office (was spare room) ---
  ch0_parents_bookshelf: [
    { speaker: 'Narrator', text: 'Mom\'s bookshelf. Bible. Photo albums from the 90s. A couple self-help books.' },
    { speaker: 'Narrator', text: 'Pops doesn\'t touch this side of the room.' },
  ],
  ch0_parents_closet: [
    { speaker: 'Narrator', text: 'Walk-in closet. Mom\'s side is organized. Pops\' side... not so much.' },
    { speaker: 'Narrator', text: 'A couple suits in the back. Never worn.' },
  ],
  ch0_parents_dresser: [
    { speaker: 'Narrator', text: 'Family photos on the dresser. JP as a baby. First day of school.' },
    { speaker: 'Narrator', text: 'Back when everything was simple.' },
  ],
  // --- Bathroom ---
  ch0_mirror: [
    { speaker: 'JP\'s Mind', text: 'JP looks at himself in the mirror.' },
    { speaker: 'JP', text: 'What are you doing, bro?' },
    { speaker: 'Narrator', text: 'No answer.' },
  ],
  ch0_upstairs_tv: [
    { speaker: 'Narrator', text: 'Small TV upstairs. JP and his sister watch cartoons here on weekends.' },
  ],
  ch0_upstairs_couch: [
    { speaker: 'Narrator', text: 'Love seat. Sister falls asleep here every night watching TV.' },
    { speaker: 'JP\'s Mind', text: 'She\'s always out by the second episode.' },
  ],
  ch0_yoga_mat: [
    { speaker: 'Narrator', text: 'A worn-out yoga mat. More for stretching than yoga.' },
    { speaker: 'JP\'s Mind', text: 'Gotta warm up before the weights.' },
  ],
  ch0_weights: [
    { speaker: 'Narrator', text: 'Dumbbells. 25s and 35s. JP\'s been hitting these before school.' },
    { speaker: 'JP\'s Mind', text: 'Gotta stay disciplined.' },
  ],
  ch0_family_albums: [
    { speaker: 'Narrator', text: 'Photo albums. Thick ones, from before phones had cameras.' },
    { speaker: 'Narrator', text: 'JP at 3. Sister\'s first birthday. Pops with a full head of hair.' },
    { speaker: 'JP\'s Mind', text: 'We looked happy.' },
    { speaker: 'JP\'s Mind', text: 'We were happy.' },
  ],
  ch0_sister_nightlight: [
    { speaker: 'Narrator', text: 'A nightlight shaped like a butterfly. Still plugged in.' },
  ],
  ch0_den_couch: [
    { speaker: 'Narrator', text: 'The big couch. This is where the family watches movies.' },
  ],
  ch0_den_tv: [
    { speaker: 'Narrator', text: 'Big TV. Pops watches the game every Sunday.' },
  ],
  ch0_den_rug: [
    { speaker: 'Narrator', text: 'Area rug. Sister spilled juice on it last month. Mom flipped.' },
  ],
  ch0_lounge_rug: [
    { speaker: 'Narrator', text: 'Mom picked this rug. Nobody touches it with shoes on.' },
  ],
  ch0_den_lamp: [
    { speaker: 'Narrator', text: 'Floor lamp. The one that flickers when you bump it.' },
  ],
  ch0_den_plant: [
    { speaker: 'Narrator', text: 'Mom\'s plant. She talks to it. JP\'s not sure if it helps.' },
  ],
  ch0_den_shelf: [
    { speaker: 'Narrator', text: 'Family bookshelf. DVDs, board games, a Bible, old yearbooks.' },
  ],
  ch0_den_table: [
    { speaker: 'Narrator', text: 'Side table. Remote, coasters, a candle Mom never lights.' },
  ],
  ch0_shower: [
    { speaker: 'Narrator', text: 'JP hops in the shower.' },
    { speaker: 'Narrator', text: 'Hits the blinkers on the cart. Gets faded.' },
    { speaker: 'Narrator', text: 'Steam fills the bathroom. Best part of the day.' },
    { speaker: 'JP\'s Mind', text: 'This is where all the good ideas come from.' },
  ],
  // --- Hallway ---
  ch0_hallway_photo: [
    { speaker: 'Narrator', text: 'School photos going back to kindergarten. JP in every one.' },
    { speaker: 'Narrator', text: 'The smile gets smaller each year.' },
  ],
  // --- Living Room ---
  ch0_tv: [
    { speaker: 'Narrator', text: 'ESPN on mute. Dad\'s been watching the same game for three hours.' },
  ],
  ch0_couch: [
    { speaker: 'Narrator', text: 'This couch has seen every family argument and every movie night.' },
    { speaker: 'Narrator', text: 'Same fabric.' },
  ],
  ch0_window_view: [
    { speaker: 'Narrator', text: 'View of the front yard through the window. Quiet neighborhood.' },
    { speaker: 'JP\'s Mind', text: 'Same view every day. Same street. Same everything.' },
  ],
  // --- Kitchen ---
  ch0_fridge: [
    { speaker: 'Narrator', text: 'Fridge is stocked. Mom keeps it right even when everything else is tense.' },
  ],
  ch0_food: [
    { speaker: 'Narrator', text: 'Leftovers from last night. Mom\'s cooking.' },
    { speaker: 'JP\'s Mind', text: 'Best food in the world and she doesn\'t even know it.' },
  ],
  ch0_mail: [
    { speaker: 'Narrator', text: 'Stack of mail on the counter. Bills, coupons, and JP\'s college acceptance letters.' },
    { speaker: 'Narrator', text: 'Mom keeps moving them to the top of the pile.' },
  ],
  // --- Garage ---
  ch0_garage_car: [
    { speaker: 'Narrator', text: 'Pops\' truck. Dented, dusty, still runs perfect.' },
    { speaker: 'Narrator', text: 'He\'s had it since before JP was born.' },
  ],
  ch0_garage_tools: [
    { speaker: 'Narrator', text: 'Toolbox, extension cords, half a bag of concrete.' },
    { speaker: 'Narrator', text: 'Pops can fix anything in this house. Always has.' },
  ],
  // --- Yard ---
  ch0_fishing: [
    { speaker: 'Pops', text: 'Grab a rod. Let\'s see if they\'re biting.' },
  ],
  ch0_bbq: [
    { speaker: 'Narrator', text: 'Pops\' BBQ grill.' },
    { speaker: 'Narrator', text: 'Summer Sundays used to be the best day of the week.' },
  ],
  // --- Surprise Elements ---
  ch0_rooftop: [
    { speaker: 'Narrator', text: 'JP climbs up the trellis. Sits on the roof edge.' },
    { speaker: 'Narrator', text: 'From up here, the whole neighborhood fits in one frame.' },
    { speaker: 'Narrator', text: 'Everything looks small from up here. That\'s the problem.' },
    { speaker: 'JP', text: '...' },
    { speaker: 'JP\'s Mind', text: 'One day I\'ll look at something and it\'ll feel big enough.' },
  ],
  ch0_record_player: [
    { speaker: 'Narrator', text: 'Dusty record player in the corner of the garage. A crate of vinyl next to it.' },
    { speaker: 'JP', text: 'Grandpa\'s?' },
    { speaker: 'Pops', text: 'Your grandpa\'s. He had taste. Marvin Gaye, Stevie Wonder, Curtis Mayfield.' },
    { speaker: 'Pops', text: 'Put one on.' },
    { speaker: 'Narrator', text: 'A warm crackle fills the garage. For a second, it\'s not 2023.' },
  ],
  ch0_shoebox: [
    { speaker: 'Narrator', text: 'Old shoebox under the bed. Nike. Size 10.' },
    { speaker: 'Narrator', text: 'Inside: a stack of photos, a lighter, a fake ID that says "Jordan Perez, age 22."' },
    { speaker: 'JP\'s Mind', text: 'Everyone\'s got a box they don\'t show people.' },
    { speaker: 'Narrator', text: 'He puts it back. Some things stay under the bed.' },
  ],
  ch0_tv_sitdown: [
    { speaker: 'Pops', text: 'Sit down. Watch this play.' },
    { speaker: 'Narrator', text: 'They sit. No phones. No talking. Just the game.' },
    { speaker: 'Narrator', text: 'Pops leans forward on a big play. JP does the same without realizing.' },
    { speaker: 'Narrator', text: 'Some moments don\'t need words.' },
  ],
  ch0_mirror_deep: [
    { speaker: 'Narrator', text: 'Jordan stares at himself. Really stares.' },
    { speaker: 'Narrator', text: 'Tries to see what everyone else sees.' },
    { speaker: 'JP\'s Mind', text: 'I don\'t know who this person is yet. But I think I\'m about to find out.' },
  ],
  ch0_sister_drawing: [
    { speaker: 'Narrator', text: 'A crayon drawing taped to the fridge.' },
    { speaker: 'Narrator', text: 'Two stick figures holding hands. One big, one small. "ME AND JP" in wobbly letters.' },
    { speaker: 'JP\'s Mind', text: '...' },
    { speaker: 'Narrator', text: 'He doesn\'t take it off the fridge. But he stares at it longer than he should.' },
  ],
  ch0_mom_food: [
    { speaker: 'Narrator', text: 'A plate of food on the counter. Still warm. No note.' },
    { speaker: 'JP\'s Mind', text: 'She\'s mad. But she still made me a plate.' },
    { speaker: 'Narrator', text: 'That\'s a mom.' },
  ],
  ch0_parents_safe: [
    { speaker: 'Narrator', text: 'Something behind the dresser. A small safe.' },
    { speaker: 'JP', text: 'I know the code. 0714. Sister\'s birthday.' },
    { speaker: 'Narrator', text: 'Cash inside. Emergency fund. JP doesn\'t touch it.' },
    { speaker: 'JP\'s Mind', text: 'That\'s Pops\' retirement money. Off limits.' },
  ],
  ch0_sister_drawing_wall: [
    { speaker: 'Narrator', text: 'A crayon drawing of the family. Everyone holding hands.' },
    { speaker: 'Narrator', text: 'JP is the tallest one. She gave him a cape.' },
    { speaker: 'JP\'s Mind', text: '...a cape.' },
    { speaker: 'JP\'s Mind', text: 'She thinks I\'m a superhero.' },
  ],
  ch0_cookie_jar: [
    { speaker: 'Narrator', text: 'Mom\'s cookie jar. Shaped like a bear. Sister painted it.' },
    { speaker: 'Narrator', text: 'JP opens it. Empty.' },
    { speaker: 'JP', text: 'Of course.' },
    { speaker: 'Narrator', text: 'He checks behind the cereal box. Finds two Oreos.' },
    { speaker: 'JP\'s Mind', text: 'Mom hides the good ones.' },
  ],
  ch0_kitchen_knife: [
    { speaker: 'Narrator', text: 'Knife block. Mom keeps them sharp.' },
  ],
  ch0_workbench: [
    { speaker: 'Narrator', text: 'Pops\' workbench. Sawdust, screws, a half-finished birdhouse.' },
    { speaker: 'JP\'s Mind', text: 'He\'s been working on that birdhouse for like three years.' },
    { speaker: 'JP\'s Mind', text: 'He\'ll finish it. He finishes everything. Eventually.' },
  ],
  ch0_patio: [
    { speaker: 'Narrator', text: 'Patio chairs. This is where the family sits on summer nights.' },
    { speaker: 'JP\'s Mind', text: 'Pops on the grill. Mom on the phone. Sister running around.' },
    { speaker: 'JP\'s Mind', text: 'Simple. I didn\'t appreciate it enough.' },
  ],
  ch0_pops_truck: [
    { speaker: 'Narrator', text: 'Pops\' truck. Dented, dusty, runs perfect.' },
    { speaker: 'Narrator', text: 'He\'s had it since before JP was born.' },
  ],
  ch0_jp_car: [
    { speaker: 'JP\'s Mind', text: 'My car. Nothing special yet but it gets me around.' },
    { speaker: 'JP\'s Mind', text: 'One day I\'ll have something worth looking at in this driveway.' },
  ],
  ch0_basketball: [
    { speaker: 'Narrator', text: 'JP shoots from the free throw line.' },
    { speaker: 'Narrator', text: 'Swish. Nothing but net.' },
    { speaker: 'JP\'s Mind', text: 'Used to be out here every day after school.' },
    { speaker: 'JP\'s Mind', text: 'Haven\'t touched a ball in months.' },
  ],
  ch0_window_jp: [
    { speaker: 'Narrator', text: 'JP\'s window. Faces the backyard. Good for sneaking out.' },
  ],
  ch0_window_sister: [
    { speaker: 'Narrator', text: 'Sister\'s window. Stickers on the glass. A handprint from when she was little.' },
  ],
  ch0_window_parents: [
    { speaker: 'Narrator', text: 'Parents\' bedroom window. Blinds always halfway closed.' },
  ],
  ch0_window_bath: [
    { speaker: 'Narrator', text: 'Bathroom window. Frosted glass. You can barely see the tree outside.' },
  ],
  ch0_window_kitchen: [
    { speaker: 'Narrator', text: 'Kitchen window. Mom watches the yard from here when she does dishes.' },
  ],
  ch0_ivy_gift: [
    { speaker: 'Narrator', text: 'Ivy drops something at JP\'s feet. It\'s... a sock.' },
    { speaker: 'Narrator', text: 'She wags her tail. This is her best sock.' },
    { speaker: 'JP', text: 'Thanks Ivy.' },
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
    { speaker: 'Narrator', text: 'Ivy whines at the door. She knows.' },
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
    { speaker: 'JP\'s Mind', text: 'Hot tub bubbling at 2 PM on a Wednesday. Three girls in bikinis. Nobody has a job.' },
    { speaker: 'JP\'s Mind', text: 'One of them keeps looking at me. Her friend is whispering something.' },
    { speaker: 'JP\'s Mind', text: 'This is what the good life looks like when you\'re 20 and selling weed in Santa Barbara.' },
    { speaker: 'JP\'s Mind', text: 'Ask me in a year if it was worth it.' },
  ],
  ch1_smoke: [
    { speaker: 'Narrator', text: 'JP rolls up. Takes a long hit.' },
    { speaker: 'JP\'s Mind', text: 'This is the only time my brain slows down.' },
    { speaker: 'JP\'s Mind', text: 'Everybody in this house smokes. It\'s not a party thing. It\'s a lifestyle.' },
    { speaker: 'JP\'s Mind', text: 'Wake up. Smoke. Sell. Smoke. Sleep. Repeat.' },
  ],
  ch1_blunt: [
    { speaker: 'Nolan', text: 'Pass that.' },
    { speaker: 'JP', text: 'Here.' },
    { speaker: 'Cooper', text: 'This is good. Where\'d you get it?' },
    { speaker: 'JP', text: 'Don\'t worry about it.' },
    { speaker: 'Narrator', text: 'They laugh. The sun is going down. Nobody\'s thinking about tomorrow.' },
  ],
  ch1_bong: [
    { speaker: 'Narrator', text: 'The bong sits on the kitchen counter like it lives there. Because it does.' },
    { speaker: 'JP\'s Mind', text: 'I go through an ounce a week myself. The boys buy from me.' },
  ],
  ch1_girl3: [
    { speaker: 'Girl', text: 'JP! Get in the hot tub!' },
    { speaker: 'JP', text: 'Maybe later.' },
    { speaker: 'Girl', text: 'You always say that. You\'re so boring.' },
    { speaker: 'JP', text: '', choices: [
      { text: '"I got stuff to do."', next: [
        { speaker: 'Girl', text: 'Stuff? Like what? Sitting in your room with all those bags?' },
        { speaker: 'JP', text: '...mind your business.' },
      ]},
      { text: '"Alright alright, I\'m coming."', next: [
        { speaker: 'Girl', text: 'Finally! Someone get this man a drink.' },
      ]},
    ]},
  ],
  ch1_girl_couch: [
    { speaker: 'Narrator', text: 'Some girl from the party. Already asleep. It\'s 2 PM.' },
    { speaker: 'JP\'s Mind', text: 'Everyone here is just... floating.' },
  ],
  ch1_mess: [
    { speaker: 'JP\'s Mind', text: 'Clothes, trash, plates. This house is disgusting.' },
    { speaker: 'JP\'s Mind', text: 'Nobody cleans. Nobody cares. That tells you everything.' },
  ],
  ch1_view: [
    { speaker: 'JP\'s Mind', text: 'Santa Barbara sunset. Beautiful place to waste your life.' },
    { speaker: 'JP\'s Mind', text: 'Everybody visits and says they wish they lived here. I live here and I\'m going nowhere.' },
  ],
  ch1_volleyball1: [
    { speaker: 'Guy', text: 'Yo you play?' },
    { speaker: 'JP', text: 'Nah I\'m good.' },
    { speaker: 'Guy', text: 'Your loss bro!' },
  ],
  ch1_volleyball2: [
    { speaker: 'Narrator', text: 'Some kid from UCSB. Shirtless, backwards cap.' },
    { speaker: 'Kid', text: 'You play? We need a fourth.' },
    { speaker: 'JP', text: 'I play everything.' },
  ],
  ch1_sunbather: [
    { speaker: 'Narrator', text: 'Someone passed out on a towel. Empty Modelo next to her.' },
    { speaker: 'Narrator', text: 'This is what Tuesday looks like in Santa Barbara.' },
  ],
  ch1_setup: [
    { speaker: 'JP\'s Mind', text: 'Dual monitors. Crypto charts on one, Depop on the other.' },
    { speaker: 'JP\'s Mind', text: 'Trading crypto. Selling clothes. Moving weed. All from this desk.' },
    { speaker: 'JP\'s Mind', text: 'Everyone out there partying and I\'m in here running three hustles.' },
  ],
  ch1_beerpong: [
    { speaker: 'Narrator', text: 'Beer pong table. Red cups ready.' },
  ],
  ch1_computer: [
    { speaker: 'Narrator', text: 'JP opens his laptop. The spreadsheet loads.' },
    { speaker: 'Narrator', text: '━━━━━━━━━━━━━━━━━━━━━━━━━━' },
    { speaker: 'Narrator', text: 'INVENTORY: 83 lbs in rotation' },
    { speaker: 'Narrator', text: 'CASH COLLECTED: $247,000 YTD' },
    { speaker: 'Narrator', text: 'MONTHLY AVG: $31,200' },
    { speaker: 'Narrator', text: 'ACTIVE CUSTOMERS: 142' },
    { speaker: 'Narrator', text: 'REPEAT RATE: 78%' },
    { speaker: 'Narrator', text: '━━━━━━━━━━━━━━━━━━━━━━━━━━' },
    { speaker: 'JP\'s Mind', text: 'Real business metrics. Inventory, logistics, customer retention.' },
    { speaker: 'JP\'s Mind', text: 'I built a whole operation and I\'m 20 years old.' },
    { speaker: 'JP\'s Mind', text: 'If I put this energy into something legal...' },
  ],
  ch1_closet: [
    { speaker: 'JP\'s Mind', text: 'Clothes everywhere. Half designer, half thrift.' },
    { speaker: 'JP\'s Mind', text: 'JP\'s style is "I have money but I don\'t want you to know how I got it."' },
  ],
  ch1_speaker: [
    { speaker: 'JP\'s Mind', text: 'Bluetooth speaker playing the same playlist on repeat. Playboi Carti. Travis Scott.' },
    { speaker: 'JP\'s Mind', text: 'The vibe never changes.' },
  ],
  ch1_bed: [
    { speaker: 'JP\'s Mind', text: 'Unmade bed. Sheets smell like weed and cologne.' },
    { speaker: 'JP\'s Mind', text: 'Can\'t remember the last time he slept before 4 AM.' },
  ],
  ch1_shower: [
    { speaker: 'JP\'s Mind', text: 'Frat house shower. At least the water\'s hot.' },
  ],
  // --- Living Room ---
  ch1_couch: [
    { speaker: 'Narrator', text: 'Couch has seen better days. Stains from parties nobody remembers.' },
    { speaker: 'JP\'s Mind', text: 'This couch has more stories than I do.' },
  ],
  ch1_tv: [
    { speaker: 'Narrator', text: 'Flat screen. Someone left FIFA paused from last night.' },
  ],
  ch1_poster: [
    { speaker: 'Narrator', text: 'Bob Marley poster. Obviously.' },
  ],
  ch1_clothes: [
    { speaker: 'Narrator', text: 'JP\'s clothes all over the floor. Mom would lose her mind.' },
    { speaker: 'JP\'s Mind', text: 'I\'ll pick it up later. Probably.' },
  ],
  // --- Kitchen ---
  ch1_fridge: [
    { speaker: 'Narrator', text: 'Fridge has beer, leftover pizza, and a jar of pickles nobody claims.' },
    { speaker: 'JP\'s Mind', text: 'Five dudes. Zero groceries.' },
  ],
  ch1_counter: [
    { speaker: 'Narrator', text: 'Counter covered in red solo cups and a sticky bottle of Hennessy.' },
  ],
  ch1_food: [
    { speaker: 'Narrator', text: 'Leftover In-N-Out. Animal style. Cold but still hits.' },
  ],
  // --- Nolan's Room ---
  ch1_nolan_bed: [
    { speaker: 'Narrator', text: 'King size bed. Sheets half on the floor. This bed has SEEN things.' },
    { speaker: 'JP\'s Mind', text: 'Nolan\'s room is nicer than any room I\'ve ever had.' },
  ],
  ch1_nolan_tv: [
    { speaker: 'Narrator', text: '65 inch TV mounted on the wall. PS5 underneath. LED strip glowing behind it.' },
    { speaker: 'JP\'s Mind', text: 'This man has a whole theater in his bedroom.' },
  ],
  ch1_nolan_setup: [
    { speaker: 'Narrator', text: 'Gaming setup. RGB keyboard, dual monitors, headset hanging off the chair.' },
    { speaker: 'Narrator', text: 'Nolan doesn\'t even game that much. He just likes how it looks.' },
  ],
  ch1_nolan_weed: [
    { speaker: 'Narrator', text: 'A jar of top shelf on Nolan\'s nightstand. This isn\'t the mid they sell — this is personal.' },
  ],
  ch1_surfboard: [
    { speaker: 'Narrator', text: 'Nolan\'s surfboard. He goes out every morning before anyone\'s awake.' },
    { speaker: 'JP\'s Mind', text: 'He found his thing. Surfing, parties, vibes. He\'s home here.' },
    { speaker: 'JP\'s Mind', text: 'I\'m still looking.' },
  ],
  ch1_nolan_speaker: [
    { speaker: 'Narrator', text: 'JBL Boombox. Bass shakes the whole room. Right now it\'s Travis Scott on low.' },
  ],
  ch1_nolan_poster: [
    { speaker: 'Narrator', text: 'Poster of some surf competition in Hawaii. Nolan circled a date on it.' },
  ],
  // --- Beach ---
  ch1_towels: [
    { speaker: 'Narrator', text: 'Beach towels laid out. Someone left sunscreen and a half-read book.' },
  ],
  ch1_cooler: [
    { speaker: 'Narrator', text: 'Cooler full of Modelos and White Claws. The essentials.' },
    { speaker: 'JP\'s Mind', text: 'Tuesday afternoon and we\'re drinking on the beach. This can\'t last.' },
  ],
  ch1_bonfire: [
    { speaker: 'Narrator', text: 'Bonfire pit from last weekend. Ashes and a couple burnt marshmallow sticks.' },
    { speaker: 'JP\'s Mind', text: 'That night was different. Everyone was actually talking. Not just drinking.' },
  ],
  ch1_surfboards: [
    { speaker: 'Narrator', text: 'Surfboards stuck in the sand. Nolan\'s, David\'s, and a rental nobody returned.' },
  ],
  ch1_shells: [
    { speaker: 'Narrator', text: 'Shells. JP picks one up. Puts it back.' },
    { speaker: 'JP\'s Mind', text: 'Sister would love this. Maybe I\'ll grab one before I leave.' },
  ],
  ch1_sunset: [
    { speaker: 'Narrator', text: 'The sun is starting to drop. Orange light across the water.' },
    { speaker: 'Narrator', text: 'Santa Barbara sunsets hit different. Even JP can\'t deny that.' },
    { speaker: 'JP\'s Mind', text: 'If I could freeze one moment... it might be this one.' },
  ],
};

// ─── Chapter 2 extras ──────────────────────────────────────────────────

const ch2Extras: Record<string, DialogueLine[]> = {
  ch2_grab_weed: [
    { speaker: 'Narrator', text: 'JP grabs a duffel bag. Fills it with product.' },
    { speaker: 'JP\'s Mind', text: 'Bags on bags. More than anyone needs for a Tuesday night.' },
    { speaker: 'JP\'s Mind', text: 'Same routine. Didn\'t even think about it anymore.' },
  ],
  ch2_bed_pile_L: [
    { speaker: 'Narrator', text: 'Bags stacked to the mattress. Spilling onto the floor.' },
    { speaker: 'JP\'s Mind', text: 'This used to be one bag. Now there\'s 25 pounds in this room.' },
  ],
  ch2_bed_pile_L2: [
    { speaker: 'JP\'s Mind', text: 'The pile doesn\'t even fit anymore. Pounds on pounds crushed at the bottom.' },
  ],
  ch2_bed_pile_L3: [
    { speaker: 'JP\'s Mind', text: 'Bags on the floor. Kicked one under the bed this morning.' },
  ],
  ch2_bed_pile_R: [
    { speaker: 'Narrator', text: 'More bags on the other side. Both sides of the bed. Like bookends.' },
    { speaker: 'JP\'s Mind', text: 'He sleeps in a fort made of weed. That\'s where he\'s at.' },
  ],
  ch2_bed_pile_R2: [
    { speaker: 'JP\'s Mind', text: 'Stacked two high. One wrong move and they all tumble.' },
  ],
  ch2_bed_under: [
    { speaker: 'Narrator', text: 'Bags poking out from under the bed. Stacked deep.' },
    { speaker: 'JP\'s Mind', text: 'Probably 25 Ps under there. Lost count a while ago.' },
  ],
  ch2_closet: [
    { speaker: 'Narrator', text: 'JP opens the closet.' },
    { speaker: 'Narrator', text: 'Three bags tumble out onto the floor.' },
    { speaker: 'JP', text: 'Shit—' },
    { speaker: 'Narrator', text: 'He shoves them back in. Pushes the door shut with his shoulder.' },
    { speaker: 'Narrator', text: 'The door doesn\'t close all the way. A corner of a bag sticks out.' },
    { speaker: 'JP\'s Mind', text: 'This is getting out of hand.' },
  ],
  ch2_car: [
    { speaker: 'JP\'s Mind', text: 'Black 2008 BMW 335i. N54 twin turbo.' },
    { speaker: 'JP\'s Mind', text: 'Catless downpipes, intake, tuned. This car is the one thing that\'s actually his.' },
    { speaker: 'JP\'s Mind', text: 'He bought it with cash. Didn\'t ask where the cash came from.' },
    { speaker: 'JP\'s Mind', text: 'Keys in the ignition. Deep breath. Let\'s go.' },
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
  ch2_gun: [
    { speaker: 'JP\'s Mind', text: 'Glock on the dresser. Right next to the weed.' },
    { speaker: 'JP\'s Mind', text: 'Never fired it. Never plan to.' },
    { speaker: 'JP\'s Mind', text: 'But in this life, you don\'t get to choose when it becomes real.' },
    { speaker: 'JP\'s Mind', text: 'The fact that it\'s here means something went wrong a long time ago.' },
    { speaker: 'JP\'s Mind', text: 'JP leaves it. He always leaves it.' },
  ],
  ch2_computer: [
    { speaker: 'Narrator', text: 'JP opens his laptop. The spreadsheet loads.' },
    { speaker: 'Narrator', text: '━━━━━━━━━━━━━━━━━━━━━━━━━━' },
    { speaker: 'Narrator', text: 'INVENTORY: 31 lbs remaining  ▼' },
    { speaker: 'Narrator', text: 'CASH COLLECTED: $189,000 YTD  ▼' },
    { speaker: 'Narrator', text: 'MONTHLY AVG: $18,400  ▼▼' },
    { speaker: 'Narrator', text: 'ACTIVE CUSTOMERS: 89  ▼' },
    { speaker: 'Narrator', text: 'REPEAT RATE: 52%  ▼▼' },
    { speaker: 'Narrator', text: 'SUPPLIER: ??? (ghosted 2 weeks)' },
    { speaker: 'Narrator', text: '━━━━━━━━━━━━━━━━━━━━━━━━━━' },
    { speaker: 'JP\'s Mind', text: 'Numbers are down across the board.' },
    { speaker: 'JP\'s Mind', text: 'Supplier ghosted. Customers finding other plugs.' },
    { speaker: 'JP\'s Mind', text: 'The whole thing is falling apart and nobody sees it but me.' },
    { speaker: 'JP\'s Mind', text: 'I know I can build something real. I just need the right path.' },
  ],
  ch2_bed: [
    { speaker: 'JP\'s Mind', text: 'Unmade bed. Hasn\'t slept in it in two days.' },
    { speaker: 'JP\'s Mind', text: 'Bags under the bed. Bags in the closet. Bags on the desk.' },
    { speaker: 'JP\'s Mind', text: 'This room used to feel like freedom. Now it feels like a trap he built himself.' },
    { speaker: 'JP\'s Mind', text: 'Can\'t sleep. Can\'t stop. Can\'t tell anyone why.' },
  ],
  ch2_graffiti: [
    { speaker: 'JP\'s Mind', text: 'Someone tagged \'NO WAY OUT\' on the wall. Felt that.' },
    { speaker: 'JP\'s Mind', text: 'Whoever wrote this probably believed it. I\'m starting to.' },
  ],
  ch2_corner_guy: [
    { speaker: 'Guy', text: 'You lost?' },
    { speaker: 'JP', text: 'Nah. I know where I\'m going.' },
    { speaker: 'Guy', text: 'That\'s what they all say around here.' },
  ],
  ch2_street_kid: [
    { speaker: '???', text: 'Aye, you holding?' },
    { speaker: 'JP', text: 'Not for you.' },
    { speaker: '???', text: 'Whatever man.' },
  ],
  ch2_store: [
    { speaker: 'JP\'s Mind', text: 'Corner store. Bulletproof glass at the register. This neighborhood is different.' },
    { speaker: 'JP\'s Mind', text: 'JP buys a water and leaves. Head down. Business face on.' },
  ],
  ch2_nervous: [
    { speaker: 'JP\'s Mind', text: 'Hands are steady but the heart is racing. Every drop feels like the last one.' },
    { speaker: 'JP\'s Mind', text: 'One more. Just one more. Then I\'m done. That\'s what he said last time too.' },
  ],
  ch2_streetlight: [
    { speaker: 'JP\'s Mind', text: 'Streetlight flickering. Half the lights on this block are out.' },
    { speaker: 'JP\'s Mind', text: 'Nobody fixes anything here. Not the lights. Not the roads. Not the people.' },
  ],
  ch2_light1: [
    { speaker: 'JP\'s Mind', text: '3:33 AM. Nobody else is up.' },
    { speaker: 'JP\'s Mind', text: 'House feels different when it\'s empty.' },
  ],
  ch2_light2: [
    { speaker: 'JP\'s Mind', text: 'Kitchen light flickers. Bulb\'s been out for weeks.' },
    { speaker: 'JP\'s Mind', text: 'Nobody fixes anything around here.' },
  ],
  ch2_money_stack: [
    { speaker: 'JP\'s Mind', text: 'Stacks on the dresser. More than a 20-year-old should have in cash.' },
    { speaker: 'JP\'s Mind', text: 'None of it legal. None of it safe.' },
    { speaker: 'JP\'s Mind', text: 'He counts it every night. Not because he needs to. Because it\'s the only thing that makes this feel worth it.' },
    { speaker: 'JP\'s Mind', text: 'One day this money runs out. Then what?' },
  ],
  ch2_designer: [
    { speaker: 'JP\'s Mind', text: 'Designer bags. Gucci. Louis. All bought with drug money.' },
    { speaker: 'JP\'s Mind', text: 'Looks good. Feels empty.' },
  ],
  ch2_mirror_room: [
    { speaker: 'Narrator', text: 'JP looks at himself. Shaggy hair. Bags under his eyes.' },
    { speaker: 'JP\'s Mind', text: 'When\'s the last time he slept a full night?' },
  ],
  ch2_hottub_night: [
    { speaker: 'JP\'s Mind', text: 'Hot tub\'s off. Water\'s cold and still.' },
    { speaker: 'JP\'s Mind', text: '12 hours ago this place was full of people. Music. Laughing.' },
    { speaker: 'JP\'s Mind', text: 'Now it\'s just me. And whatever\'s in the duffel bag.' },
  ],
  ch2_fridge: [
    { speaker: 'JP\'s Mind', text: 'Fridge is empty except for beer and a Gatorade from last week.' },
    { speaker: 'JP\'s Mind', text: 'Nobody in this house eats real food.' },
  ],
  ch2_front_door: [
    { speaker: 'JP\'s Mind', text: 'Deep breath.' },
    { speaker: 'JP\'s Mind', text: 'Every time he walks out this door at 3 AM, he knows it could be the last time.' },
    { speaker: 'JP\'s Mind', text: 'But he opens it anyway.' },
  ],
  ch2_street_walk: [
    { speaker: 'JP\'s Mind', text: 'Street is dead. Not a single car.' },
    { speaker: 'JP\'s Mind', text: 'That\'s either really good or really bad.' },
  ],
  ch2_parking_lot: [
    { speaker: 'JP\'s Mind', text: 'Buyer\'s driveway has three cars in it. There\'s usually one.' },
    { speaker: 'JP\'s Mind', text: 'Don\'t overthink it. Just make the drop.' },
  ],
  ch2_pops_missed: [
    { speaker: 'JP\'s Mind', text: 'Pops called again. Twice.' },
    { speaker: 'JP\'s Mind', text: 'He doesn\'t leave voicemails anymore. He just calls. And waits.' },
    { speaker: 'JP\'s Mind', text: 'I\'ll call him tomorrow. That\'s what I said yesterday.' },
  ],
  ch2_unmarked_car: [
    { speaker: 'JP\'s Mind', text: 'Black sedan. Tinted. No plates.' },
    { speaker: 'JP\'s Mind', text: 'That car wasn\'t here last time.' },
    { speaker: 'JP\'s Mind', text: '...probably nothing.' },
  ],
  ch2_flashback_spot: [
    { speaker: 'Narrator', text: 'This is where they used to sit. JP and Jose. After school.' },
    { speaker: 'Narrator', text: 'Back when the biggest problem was who was buying the blunts.' },
    { speaker: 'JP\'s Mind', text: 'That was two years ago. Feels like twenty.' },
    { speaker: 'JP\'s Mind', text: 'Jose\'s still here. I\'m the one who changed.' },
  ],
  ch2_alley_2: [
    { speaker: 'JP\'s Mind', text: 'Dark alley. Don\'t look.' },
    { speaker: 'JP\'s Mind', text: 'You hear something. Footsteps? Or just your own heartbeat.' },
    { speaker: 'JP\'s Mind', text: 'Keep walking.' },
  ],
  ch2_residential: [
    { speaker: 'Narrator', text: 'Normal houses. Porch lights on. Cars in driveways.' },
    { speaker: 'Narrator', text: 'People sleeping. Kids in beds. Tomorrow is a school day.' },
    { speaker: 'JP\'s Mind', text: 'They don\'t know I exist. I\'m a ghost in their neighborhood at 3 AM.' },
    { speaker: 'JP\'s Mind', text: 'One day I\'ll be the one sleeping at a normal hour.' },
  ],
  ch2_drunk_guy: [
    { speaker: 'Drunk', text: '*mumbles* ...you got a light?' },
    { speaker: 'JP', text: 'Nah bro.' },
    { speaker: 'Narrator', text: 'He doesn\'t even look up.' },
  ],
  ch2_girl_walking: [
    { speaker: 'Narrator', text: 'She crosses the street when she sees JP coming.' },
    { speaker: 'JP\'s Mind', text: 'Can\'t blame her. 3 AM. Hooded up. I\'d cross too.' },
  ],
  ch2_shadow_figure: [
    { speaker: 'Narrator', text: 'Someone in the alley. Just standing there.' },
    { speaker: 'JP\'s Mind', text: 'Don\'t make eye contact.' },
    { speaker: 'JP\'s Mind', text: '...is that an earpiece?' },
  ],
  ch2_weigh_result: [
    { speaker: 'JP\'s Mind', text: 'Perfect weight. Not a gram over.' },
    { speaker: 'JP\'s Mind', text: 'That\'s the part nobody sees. The precision. The discipline.' },
    { speaker: 'JP\'s Mind', text: 'If I put this energy into something legal...' },
  ],
};

// ─── Chapter 3: Day-based NPC dialogue ──────────────────────────────
// Each NPC has dialogue for Day 1, Day 2, and Day 3.
// JailScene swaps which set is active based on currentDay.

const ch3Day1NPCDialogue: Record<string, DialogueLine[]> = {
  ch3_mikey: [
    { speaker: 'Mikey', text: 'Bro, keep your head down. First week is the worst.' },
    { speaker: 'Mikey', text: 'I been here 8 months. You learn who to trust real quick.' },
    { speaker: 'Mikey', text: 'Don\'t talk to nobody you don\'t know. And don\'t look at nobody\'s food.' },
  ],
  ch3_chris: [
    { speaker: 'Chris', text: 'JP? Damn. When\'d they get you?' },
    { speaker: 'Chris', text: 'Don\'t worry, we got you in here. Mikey, Bird, and me.' },
    { speaker: 'Chris', text: 'Just don\'t do nothing stupid the first month.' },
  ],
  ch3_bird: [
    { speaker: 'Bird', text: 'Ayo JP, I saved you a spot in the cell block. Top bunk.' },
    { speaker: 'Bird', text: 'Food\'s trash but commissary hits different. I\'ll put you on.' },
  ],
  ch3_og: [
    { speaker: 'OG Inmate', text: 'Fresh fish. What you in for?' },
    { speaker: 'JP', text: 'Attempted murder.' },
    { speaker: 'OG Inmate', text: '...you don\'t look like the type.' },
    { speaker: 'JP', text: 'I\'m not.' },
    { speaker: 'OG Inmate', text: 'Then keep your head down and you might make it out.' },
  ],
  ch3_guard: [
    { speaker: 'Guard', text: 'New intake. Lopez. Cell 3.' },
    { speaker: 'Guard', text: 'Don\'t make me learn your name for the wrong reasons.' },
  ],
  ch3_mind: [
    { speaker: 'JP\'s Mind', text: 'Look at where you are.' },
    { speaker: 'JP\'s Mind', text: 'Pops tried to tell you. Jose tried to tell you. You didn\'t listen.' },
    { speaker: 'JP\'s Mind', text: 'Time you\'ll never get back. People who stopped picking up the phone. A reputation you gotta rebuild from scratch.' },
    { speaker: 'JP\'s Mind', text: 'So what now? Feel sorry for yourself? Blame somebody?' },
    { speaker: 'JP\'s Mind', text: 'Nah. That\'s done.' },
    { speaker: 'JP\'s Mind', text: 'Stop being a bitch. Change everything.' },
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
  ch3_book_inmate: [
    { speaker: 'Inmate', text: 'Two years in here, man. Two years.' },
    { speaker: 'Inmate', text: 'My lawyer says we got a shot at appeal but I don\'t even believe him anymore.' },
    { speaker: 'Inmate', text: 'I keep replaying that night in my head. One stupid decision.' },
    { speaker: 'JP', text: '...' },
    { speaker: 'Inmate', text: 'You\'re smart not to talk much. Just do your time and get out.' },
  ],
};

const ch3Day2NPCDialogue: Record<string, DialogueLine[]> = {
  ch3_mikey: [
    { speaker: 'Mikey', text: 'You been putting in work, bro. I see you doing pushups every morning.' },
    { speaker: 'Mikey', text: 'That\'s the move. Keep the body right, the mind follows.' },
  ],
  ch3_chris: [
    { speaker: 'Chris', text: 'Yo JP, we playing dice in the yard. You in?' },
    { speaker: 'Chris', text: 'Commissary on the line. Don\'t bet what you can\'t lose.' },
  ],
  ch3_bird: [
    { speaker: 'Bird', text: 'JP looking different already. You filling out, bro.' },
    { speaker: 'Bird', text: 'Keep it up. People respect strength in here.' },
  ],
  ch3_og: [
    { speaker: 'Fighter Inmate', text: 'Ayo you the one doing pushups every morning?' },
    { speaker: 'Fighter Inmate', text: 'Think you\'re tough? Let\'s see it then.' },
    { speaker: 'JP', text: 'You wanna go?' },
    { speaker: 'Fighter Inmate', text: 'Pushups. Right here. Right now. Winner gets respect.' },
  ],
  ch3_guard: [
    { speaker: 'Guard', text: 'Lopez. You\'re quieter than most. Keep it that way.' },
  ],
  ch3_mind: [
    { speaker: 'JP\'s Mind', text: 'Three months in. Starting to know the rhythm of this place.' },
    { speaker: 'JP\'s Mind', text: 'Wake up. Pushups. Yard. Read. Sleep. Repeat.' },
    { speaker: 'JP\'s Mind', text: 'It\'s not freedom but it\'s structure. And structure is all I got.' },
  ],
  ch3_fighter1: [
    { speaker: 'Fighter', text: 'You been putting in work, new fish. I see you.' },
    { speaker: 'Fighter', text: 'Respect.' },
  ],
  ch3_fighter2: [
    { speaker: 'Inmate', text: 'JP\'s different from most guys that come through here.' },
    { speaker: 'Inmate', text: 'Quiet. Focused. That scares people more than loud.' },
  ],
  ch3_dice1: [
    { speaker: 'Dice Player', text: 'JP! You playing today or just watching again?' },
    { speaker: 'JP', text: 'Might roll a few.' },
    { speaker: 'Dice Player', text: 'That\'s what I like to hear. Don\'t cry when you lose.' },
  ],
  ch3_dice2: [
    { speaker: 'Dice Player 2', text: 'JP\'s been on a streak. Three days running.' },
    { speaker: 'Dice Player 2', text: 'Lucky bastard.' },
  ],
  ch3_tattoo: [
    { speaker: 'Tattoo Guy', text: 'JP, you sure you don\'t want ink? I\'m doing good work these days.' },
    { speaker: 'JP', text: 'I\'m good. Saving my skin for when I get out.' },
    { speaker: 'Tattoo Guy', text: 'Smart man.' },
  ],
  ch3_smoker: [
    { speaker: 'Smoker', text: 'JP still don\'t smoke huh? Disciplined.' },
    { speaker: 'JP', text: 'Trying to be.' },
    { speaker: 'Smoker', text: 'Keep that energy when you get out. Harder on the outside.' },
  ],
  ch3_pullups: [
    { speaker: 'Workout Inmate', text: 'JP! You hit a new PR yesterday. How many was that?' },
    { speaker: 'JP', text: 'Eighty.' },
    { speaker: 'Workout Inmate', text: 'Damn. You came in here doing thirty.' },
  ],
  ch3_book_inmate: [
    { speaker: 'Inmate', text: 'My appeal got denied. Two more years minimum.' },
    { speaker: 'JP', text: 'That\'s rough, man. I\'m sorry.' },
    { speaker: 'Inmate', text: 'Don\'t be sorry for me. Be smart for you. Get out and stay out.' },
  ],
};

const ch3Day3NPCDialogue: Record<string, DialogueLine[]> = {
  ch3_mikey: [
    { speaker: 'Mikey', text: 'Bro you\'re reading AGAIN? What is that, your fifth book this week?' },
    { speaker: 'JP', text: 'The Compound Effect. It\'s about how small things add up.' },
    { speaker: 'Mikey', text: 'Like pushups?' },
    { speaker: 'JP', text: 'Like everything.' },
  ],
  ch3_chris: [
    { speaker: 'Chris', text: 'JP signed up for that psychology course. Getting college credit in here.' },
    { speaker: 'Chris', text: 'I\'m proud of you, bro. Most people come out worse. You\'re gonna come out better.' },
  ],
  ch3_bird: [
    { speaker: 'Bird', text: 'JP, real talk. When you get out, don\'t come back to the bullshit.' },
    { speaker: 'Bird', text: 'You\'re different now. I can see it. Don\'t waste it.' },
    { speaker: 'JP\'s Mind', text: 'Bird\'s been in here three times. He knows what coming back looks like.' },
  ],
  ch3_og: [
    { speaker: 'OG Inmate', text: 'Lopez. I been watching you.' },
    { speaker: 'OG Inmate', text: 'You came in here scared. Now you walk different. Talk different.' },
    { speaker: 'OG Inmate', text: 'Don\'t ever forget what this place taught you. But don\'t ever come back.' },
  ],
  ch3_guard: [
    { speaker: 'Guard', text: 'Lopez. Your release date is coming up.' },
    { speaker: 'Guard', text: 'In all my years, I\'ve seen maybe ten people actually change in here. You\'re one of them.' },
  ],
  ch3_mind: [
    { speaker: 'JP\'s Mind', text: 'I walked in here a kid who thought he was tough.' },
    { speaker: 'JP\'s Mind', text: 'I\'m walking out a man who knows what strength actually is.' },
    { speaker: 'JP\'s Mind', text: 'Discipline. Patience. Faith.' },
    { speaker: 'JP\'s Mind', text: 'When these doors open, I\'m never looking back.' },
  ],
  ch3_fighter1: [
    { speaker: 'Fighter', text: 'JP, you\'re getting out soon right?' },
    { speaker: 'JP', text: 'Yeah.' },
    { speaker: 'Fighter', text: 'Do something with it, man. For all of us who can\'t.' },
  ],
  ch3_fighter2: [
    { speaker: 'Inmate', text: 'JP\'s leaving soon. Place won\'t be the same.' },
    { speaker: 'Inmate', text: 'He was the only one in here who actually changed.' },
  ],
  ch3_dice1: [
    { speaker: 'Dice Player', text: 'JP quit playing dice weeks ago. Says he don\'t gamble anymore.' },
    { speaker: 'Dice Player', text: 'Smarter than all of us.' },
  ],
  ch3_dice2: [
    { speaker: 'Dice Player 2', text: 'I tried to read one of JP\'s books. Couldn\'t finish the first chapter.' },
    { speaker: 'Dice Player 2', text: 'That boy built different.' },
  ],
  ch3_tattoo: [
    { speaker: 'Tattoo Guy', text: 'JP, before you go — I made you something.' },
    { speaker: 'Tattoo Guy', text: '*hands JP a drawing*' },
    { speaker: 'Tattoo Guy', text: 'It\'s the yard. So you remember where you came from.' },
    { speaker: 'JP', text: 'Appreciate that, bro.' },
  ],
  ch3_smoker: [
    { speaker: 'Smoker', text: 'JP getting out. Good for you, man.' },
    { speaker: 'Smoker', text: 'I got three more years. Maybe I\'ll start reading too.' },
    { speaker: 'JP', text: 'You should. Changed everything for me.' },
  ],
  ch3_pullups: [
    { speaker: 'Workout Inmate', text: 'JP. Last workout together?' },
    { speaker: 'JP', text: 'Let\'s make it count.' },
    { speaker: 'Workout Inmate', text: 'When you get out, don\'t stop. The gym is the one thing from in here worth keeping.' },
  ],
  ch3_book_inmate: [
    { speaker: 'Book Inmate', text: 'Oye JP, you finished The Intelligent Investor yet?' },
    { speaker: 'JP', text: 'Yeah. Blew my mind. Who sent you that?' },
    { speaker: 'Book Inmate', text: 'My girl. She sends me a book every month.' },
    { speaker: 'JP', text: 'That\'s love, bro.' },
  ],
};

// ─── Chapter 3: Day-based interactable dialogue ─────────────────────

const ch3Day1Extras: Record<string, DialogueLine[]> = {
  ch3_wall_1: [
    { speaker: 'JP\'s Mind', text: 'Day 1. This is real.' },
    { speaker: 'JP\'s Mind', text: 'The door locked behind me and that sound... I\'ll never forget that sound.' },
  ],
  ch3_wall_2: [
    { speaker: 'JP\'s Mind', text: 'Scratches on the wall. Someone was counting days.' },
    { speaker: 'JP\'s Mind', text: 'How many before they stopped counting?' },
  ],
  ch3_wall_3: [
    { speaker: 'JP\'s Mind', text: 'Names carved into the concrete. Ghost stories of everyone who sat here before.' },
  ],
  ch3_wall_4: [
    { speaker: 'JP\'s Mind', text: '"TRUST NO ONE" scratched into the wall.' },
    { speaker: 'JP\'s Mind', text: 'Noted.' },
  ],
  ch3_phone: [
    { speaker: 'JP', text: 'JP calls his Pops.' },
    { speaker: 'JP', text: 'I\'m okay. I\'m figuring it out.' },
    { speaker: 'JP\'s Mind', text: 'Long pause.' },
    { speaker: 'Pops', text: 'I\'m proud of you for staying strong, son.' },
  ],
  ch3_bed: [
    { speaker: 'JP\'s Mind', text: 'First night. Can\'t sleep.' },
    { speaker: 'JP\'s Mind', text: 'The walls are too close. The sounds are too loud.' },
    { speaker: 'JP\'s Mind', text: 'What did I get myself into.' },
  ],
  ch3_toilet: [
    { speaker: 'JP\'s Mind', text: 'Prison toilet. Rock bottom looks like this.' },
  ],
  ch3_window: [
    { speaker: 'JP\'s Mind', text: 'A sliver of sky. That\'s all you get.' },
    { speaker: 'JP\'s Mind', text: 'Make it enough.' },
  ],
  ch3_commissary: [
    { speaker: 'JP\'s Mind', text: 'Bird wasn\'t lying. Soups, chips, candy bars.' },
    { speaker: 'JP\'s Mind', text: 'JP\'s locker stays full.' },
  ],
  ch3_dice_watch: [
    { speaker: 'JP\'s Mind', text: 'Everyone\'s gambling commissary. JP watches but doesn\'t play.' },
    { speaker: 'JP\'s Mind', text: 'That\'s the old him.' },
  ],
  ch3_fight_watch: [
    { speaker: 'JP\'s Mind', text: 'Two guys going at it over nothing. Guard doesn\'t even flinch.' },
    { speaker: 'JP\'s Mind', text: 'This is normal here.' },
  ],
  ch3_pushups: [
    { speaker: 'JP\'s Mind', text: 'JP drops and does twenty pushups.' },
    { speaker: 'JP\'s Mind', text: 'It\'s not much. But it\'s a start.' },
  ],
  ch3_book: [
    { speaker: 'JP\'s Mind', text: 'Someone left a book behind. Some self-help thing. Normally I\'d never touch this.' },
    { speaker: 'JP\'s Mind', text: 'But what else am I gonna do in here? Stare at the wall?' },
    { speaker: 'JP\'s Mind', text: 'JP picks it up and starts reading. First book he\'s finished in years.' },
  ],
  ch3_tablet: [
    { speaker: 'JP\'s Mind', text: 'Nothing on the tablet worth watching. Just noise.' },
  ],
  ch3_music: [
    { speaker: 'JP\'s Mind', text: 'Headphones in. The noise fades.' },
    { speaker: 'JP\'s Mind', text: 'For a minute, it\'s just JP and the beat.' },
  ],
  ch3_letter_home: [
    { speaker: 'JP\'s Mind', text: 'Nothing to write home about yet. Not until I have something real to say.' },
  ],
  ch3_birthday: [
    { speaker: 'JP\'s Mind', text: 'Calendar on the wall. 364 more days at least.' },
    { speaker: 'JP\'s Mind', text: 'Don\'t think about it. Just survive today.' },
  ],
  ch3_yard: [
    { speaker: 'JP\'s Mind', text: 'The yard. Concrete and chain link.' },
    { speaker: 'JP\'s Mind', text: 'First time seeing the sky in days. Doesn\'t feel real.' },
  ],
  ch3_psych_course: [
    { speaker: 'JP\'s Mind', text: 'Sign-up sheet for classes. JP walks past it.' },
    { speaker: 'JP\'s Mind', text: 'Not ready for that yet.' },
  ],
  ch3_transformation: [
    { speaker: 'JP\'s Mind', text: 'JP catches his reflection. Bags under his eyes. Jaw tight.' },
    { speaker: 'JP\'s Mind', text: 'This is what it looks like when everything falls apart.' },
  ],
  ch3_faith: [
    { speaker: 'JP\'s Mind', text: 'A Bible on the shelf. JP hasn\'t opened one in years.' },
    { speaker: 'JP\'s Mind', text: 'Not yet. But soon.' },
  ],
  ch3_anger_management: [
    { speaker: 'JP\'s Mind', text: 'Anger management flyer on the board. "Tuesdays at 2 PM."' },
    { speaker: 'JP\'s Mind', text: 'JP rips the flyer down and tosses it. "I\'m not angry."' },
    { speaker: 'JP\'s Mind', text: '...right?' },
  ],
  ch3_mirror_day2: [
    { speaker: 'JP\'s Mind', text: 'Mirror\'s cracked. Just like everything else in here.' },
  ],
  ch3_mirror_day3: [
    { speaker: 'JP\'s Mind', text: 'Can\'t even see your full face. Just fragments.' },
  ],
};

const ch3Day2Extras: Record<string, DialogueLine[]> = {
  ch3_wall_1: [
    { speaker: 'JP\'s Mind', text: 'JP adds his own mark to the wall. Day 90.' },
  ],
  ch3_wall_2: [
    { speaker: 'JP\'s Mind', text: 'The scratches don\'t bother him anymore. They\'re just marks.' },
  ],
  ch3_wall_3: [
    { speaker: 'JP\'s Mind', text: 'Halfway through a sentence — the walls start to feel smaller.' },
  ],
  ch3_wall_4: [
    { speaker: 'JP\'s Mind', text: '"TRUST NO ONE" — JP crosses it out and writes "TRUST YOURSELF."' },
  ],
  ch3_phone: [
    { speaker: 'JP', text: 'Pops. I enrolled in a course.' },
    { speaker: 'Pops', text: 'A course? In there?' },
    { speaker: 'JP', text: 'Psychology. Getting college credit.' },
    { speaker: 'Pops', text: 'That\'s my boy.' },
  ],
  ch3_bed: [
    { speaker: 'JP\'s Mind', text: 'Can\'t believe it\'s been three months.' },
    { speaker: 'JP\'s Mind', text: 'Starting to feel normal. That\'s the scary part.' },
  ],
  ch3_toilet: [
    { speaker: 'JP\'s Mind', text: 'Still a prison toilet. But JP doesn\'t even notice anymore.' },
  ],
  ch3_window: [
    { speaker: 'JP\'s Mind', text: 'Same sliver of sky. But it looks different now.' },
    { speaker: 'JP\'s Mind', text: 'Not a reminder of what he\'s missing. A promise of what\'s coming.' },
  ],
  ch3_commissary: [
    { speaker: 'JP\'s Mind', text: 'JP trades half his commissary for a notebook.' },
    { speaker: 'JP\'s Mind', text: 'Everybody thinks he\'s crazy. He doesn\'t care.' },
  ],
  ch3_dice_watch: [
    { speaker: 'JP\'s Mind', text: 'Chris is playing dice. Wants JP to join.' },
    { speaker: 'JP\'s Mind', text: 'Might be fun. Blow off some steam.' },
  ],
  ch3_fight_watch: [
    { speaker: 'JP\'s Mind', text: 'Another fight in the common area. JP doesn\'t even look up anymore.' },
    { speaker: 'JP\'s Mind', text: 'Not his business. Not his energy.' },
  ],
  ch3_pushups: [
    { speaker: 'JP\'s Mind', text: 'JP drops and does fifty pushups. No excuses.' },
    { speaker: 'JP\'s Mind', text: 'Clear mind. Strong body. That\'s the only way out of here as a better person.' },
    { speaker: 'JP\'s Mind', text: 'Forty-eight... forty-nine... fifty. Done. Tomorrow it\'s sixty.' },
  ],
  ch3_book: [
    { speaker: 'JP\'s Mind', text: 'Atomic Habits by James Clear. Third book this month.' },
    { speaker: 'JP\'s Mind', text: '"You don\'t rise to the level of your goals. You fall to the level of your systems."' },
    { speaker: 'JP\'s Mind', text: 'JP reads that line three times.' },
  ],
  ch3_tablet: [
    { speaker: 'JP\'s Mind', text: 'JP pulls out his tablet. While everyone else is doing nothing, he\'s reading about business.' },
    { speaker: 'JP\'s Mind', text: 'About systems. About getting out and staying out.' },
  ],
  ch3_music: [
    { speaker: 'JP\'s Mind', text: 'Same playlist, but it hits different now.' },
    { speaker: 'JP\'s Mind', text: 'The hunger in the lyrics — JP feels it in his chest.' },
  ],
  ch3_letter_home: [
    { speaker: 'JP', text: 'Dear Pops,' },
    { speaker: 'JP', text: 'I enrolled in a college course. Psychology. Getting an A.' },
    { speaker: 'JP', text: 'Working out every day. Reading every night. I\'m different.' },
    { speaker: 'JP', text: '- JP' },
  ],
  ch3_birthday: [
    { speaker: 'JP\'s Mind', text: 'It\'s July. JP turns 21 today.' },
    { speaker: 'JP\'s Mind', text: 'His friends are at bars. He\'s staring at a concrete ceiling.' },
    { speaker: 'JP\'s Mind', text: 'No call from Mom.' },
  ],
  ch3_yard: [
    { speaker: 'JP\'s Mind', text: 'The yard. Concrete and sky. JP does laps every morning now.' },
    { speaker: 'JP\'s Mind', text: 'Some of the other inmates join him. Respect is earned here.' },
  ],
  ch3_psych_course: [
    { speaker: 'JP\'s Mind', text: 'Psychology 101. College credit from behind bars.' },
    { speaker: 'JP\'s Mind', text: 'JP reads about behavioral patterns. Addiction. Identity formation.' },
    { speaker: 'JP\'s Mind', text: 'He sees himself in every chapter.' },
  ],
  ch3_transformation: [
    { speaker: 'JP\'s Mind', text: 'JP catches his reflection again.' },
    { speaker: 'JP\'s Mind', text: 'Same face. But the eyes are different. Sharper. More focused.' },
  ],
  ch3_mirror_day2: [
    { speaker: 'JP\'s Mind', text: 'JP looks at himself. Three months in.' },
    { speaker: 'JP\'s Mind', text: 'Bags under his eyes are fading. Arms are bigger.' },
    { speaker: 'JP\'s Mind', text: 'Starting to look like someone who gives a damn.' },
  ],
  ch3_mirror_day3: [
    { speaker: 'JP\'s Mind', text: 'Same cracked mirror. Doesn\'t matter. JP knows who he is now.' },
  ],
  ch3_faith: [
    { speaker: 'JP\'s Mind', text: 'JP picks up the Bible. Starts in Proverbs.' },
    { speaker: 'JP\'s Mind', text: '"Trust in the Lord with all your heart and lean not on your own understanding."' },
    { speaker: 'JP\'s Mind', text: 'Heavy.' },
  ],
  ch3_anger_management: [
    { speaker: 'JP\'s Mind', text: 'Anger management class. JP actually showed up this time.' },
    { speaker: 'JP\'s Mind', text: 'The instructor says anger isn\'t the problem. It\'s a signal.' },
    { speaker: 'JP\'s Mind', text: 'JP thinks about every time he got angry. She might be right.' },
  ],
  ch3_battle_won: [
    { speaker: 'Fighter', text: 'You got hands, huh? Respect.' },
    { speaker: 'Narrator', text: 'He nods. No more problems after that.' },
  ],
  ch3_battle_lost: [
    { speaker: 'Fighter', text: 'Told you not to step up.' },
    { speaker: 'JP\'s Mind', text: 'Last time I fight in here. For real.' },
  ],
  ch3_pushup_beast: [
    { speaker: 'Pullups Guy', text: 'Bro you went CRAZY out there. You need to help me train the new guys.' },
    { speaker: 'JP', text: 'Say less.' },
  ],
  ch3_dice_broke: [
    { speaker: 'Bird', text: 'Told you not to gamble in here, bro. That\'s soup money.' },
    { speaker: 'JP\'s Mind', text: 'He\'s right. Stupid move.' },
  ],
};

const ch3Day3Extras: Record<string, DialogueLine[]> = {
  ch3_wall_1: [
    { speaker: 'JP\'s Mind', text: 'JP looks at all the marks on the wall. Hundreds of them.' },
    { speaker: 'JP\'s Mind', text: 'Tomorrow he won\'t need to count anymore.' },
  ],
  ch3_wall_2: [
    { speaker: 'JP\'s Mind', text: 'These walls have heard a lot of prayers. JP\'s were answered.' },
  ],
  ch3_wall_3: [
    { speaker: 'JP\'s Mind', text: 'Last time looking at these walls. Thank God.' },
  ],
  ch3_wall_4: [
    { speaker: 'JP\'s Mind', text: '"TRUST YOURSELF" — still there. JP smiles.' },
  ],
  ch3_phone: [
    { speaker: 'JP', text: 'Pops. I\'m coming home.' },
    { speaker: 'JP\'s Mind', text: 'JP can hear his Pops crying through the phone.' },
    { speaker: 'Pops', text: 'I\'ll be there. Right at the gate.' },
  ],
  ch3_bed: [
    { speaker: 'JP\'s Mind', text: 'Last night. Tomorrow the doors open.' },
    { speaker: 'JP\'s Mind', text: 'I knew it.' },
    { speaker: 'JP\'s Mind', text: 'God showed.' },
    { speaker: 'JP\'s Mind', text: 'The truth always prevails.' },
  ],
  ch3_toilet: [
    { speaker: 'JP\'s Mind', text: 'Last time using this thing. That alone is worth celebrating.' },
  ],
  ch3_window: [
    { speaker: 'JP\'s Mind', text: 'Tomorrow I\'ll see the whole sky. Not just a sliver.' },
    { speaker: 'JP\'s Mind', text: 'Can\'t wait.' },
  ],
  ch3_commissary: [
    { speaker: 'JP\'s Mind', text: 'JP gives away his commissary to the guys who helped him through it.' },
    { speaker: 'JP\'s Mind', text: 'Won\'t need any of this where he\'s going.' },
  ],
  ch3_dice_watch: [
    { speaker: 'JP\'s Mind', text: 'The dice game is still going. JP hasn\'t played in months.' },
    { speaker: 'JP\'s Mind', text: 'No more gambling. On anything.' },
  ],
  ch3_fight_watch: [
    { speaker: 'JP\'s Mind', text: 'No more fights. Not in here. Not out there. Never again.' },
  ],
  ch3_pushups: [
    { speaker: 'JP\'s Mind', text: 'One hundred pushups. Last set in this yard.' },
    { speaker: 'JP\'s Mind', text: 'He started at twenty. Now he doesn\'t even count.' },
    { speaker: 'JP\'s Mind', text: 'The Compound Effect in action.' },
  ],
  ch3_book: [
    { speaker: 'JP\'s Mind', text: 'The Compound Effect by Darren Hardy. JP\'s read it three times.' },
    { speaker: 'JP\'s Mind', text: 'Small daily decisions. That\'s the whole secret. Not some massive change. Just 1% better every day.' },
  ],
  ch3_tablet: [
    { speaker: 'JP\'s Mind', text: 'JP\'s been studying business models on this tablet for months.' },
    { speaker: 'JP\'s Mind', text: 'When he gets out, he\'s not getting a job. He\'s building something.' },
  ],
  ch3_music: [
    { speaker: 'JP\'s Mind', text: 'Last time with these headphones. Last time the music has to drown out this place.' },
    { speaker: 'JP\'s Mind', text: 'From now on, the music is a celebration. Not an escape.' },
  ],
  ch3_letter_home: [
    { speaker: 'JP\'s Mind', text: 'Letter from Pops. "I\'m proud of you, Jordan. Keep going."' },
    { speaker: 'JP\'s Mind', text: 'JP reads it every night.' },
  ],
  ch3_birthday: [
    { speaker: 'JP\'s Mind', text: 'That birthday in here... worst day of his life.' },
    { speaker: 'JP\'s Mind', text: 'Next birthday he\'ll be free. And he\'ll make it count.' },
  ],
  ch3_yard: [
    { speaker: 'JP\'s Mind', text: 'Last walk around the yard.' },
    { speaker: 'JP\'s Mind', text: 'Concrete and sky. He\'ll never forget this place. But he\'ll never come back.' },
  ],
  ch3_psych_course: [
    { speaker: 'JP\'s Mind', text: 'Introduction to Psychology. JP\'s getting an A.' },
    { speaker: 'JP\'s Mind', text: 'College credit from behind bars. Pops would be proud.' },
  ],
  ch3_transformation: [
    { speaker: 'JP\'s Mind', text: 'JP looks in the mirror one last time.' },
    { speaker: 'JP\'s Mind', text: 'Six months ago he couldn\'t look at himself.' },
    { speaker: 'JP\'s Mind', text: 'Now he sees someone he respects.' },
  ],
  ch3_mirror_day2: [
    { speaker: 'JP\'s Mind', text: 'The gym mirror. JP sees the change. Lean, strong, clear.' },
  ],
  ch3_mirror_day3: [
    { speaker: 'JP\'s Mind', text: 'JP looks at himself. Six months of pushups, reading, and discipline.' },
    { speaker: 'JP\'s Mind', text: 'Same face. Completely different person behind it.' },
    { speaker: 'JP\'s Mind', text: 'Strong. Healthy. Clear-eyed. Ready.' },
  ],
  ch3_faith: [
    { speaker: 'JP\'s Mind', text: 'Most people don\'t make it out of this situation.' },
    { speaker: 'JP\'s Mind', text: 'I don\'t know anyone that did.' },
    { speaker: 'JP\'s Mind', text: 'I need to rededicate my life to having faith. That\'s all I got right now.' },
    { speaker: 'JP\'s Mind', text: 'God knows I never attempted to cause harm to anyone.' },
    { speaker: 'JP\'s Mind', text: 'He knows that.' },
  ],
  ch3_anger_management: [
    { speaker: 'JP\'s Mind', text: 'Anger management class. JP used to think it was bullshit.' },
    { speaker: 'JP\'s Mind', text: 'But it taught him something — the anger isn\'t the problem. It\'s what you do with it.' },
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
    { speaker: 'JP', text: 'Yellow D8 Cat. Time to mow the east field.' },
    { speaker: 'Narrator', text: 'Back and forth. Row after row. The sun is beating down.' },
    { speaker: 'Narrator', text: 'One hand on the wheel. One on his phone. YouTube video about making money online.' },
    { speaker: 'Narrator', text: 'CRUNCH.' },
    { speaker: 'Narrator', text: 'The D8 lurches. Metal screams. JP just drove through an irrigation line.' },
    { speaker: 'Narrator', text: 'Ernesto comes sprinting from the farmhouse.' },
    { speaker: 'Ernesto', text: '¡¿QUÉ HICISTE?!' },
    { speaker: 'JP', text: 'I... it was an accident.', choices: [
      { text: '"The line was already cracked."', next: [
        { speaker: 'Ernesto', text: '¿Cracked? ¡Esa línea era nueva! ¡Estabas con el teléfono!' },
        { speaker: 'JP', text: '...' },
      ]},
      { text: '"Estaba con el teléfono."', next: [
        { speaker: 'Ernesto', text: '¡LO SABÍA! Ese teléfono te va a costar el trabajo.' },
        { speaker: 'JP', text: 'Maybe that\'s the point.' },
      ]},
    ]},
    { speaker: 'Ernesto', text: '¡Esa línea de riego cuesta más que tu cheque!' },
    { speaker: 'JP\'s Mind', text: 'This is it. I can\'t do this forever. $12 an hour while people make thousands online.' },
    { speaker: 'JP', text: 'Ernesto, ya no puedo más.', choices: [
      { text: '"I appreciate everything. But I gotta go."', next: [
        { speaker: 'Ernesto', text: '¿A dónde? ¿A hacer qué?' },
        { speaker: 'JP', text: 'I don\'t know yet. But not this.' },
      ]},
      { text: '"This isn\'t my life."', next: [
        { speaker: 'Ernesto', text: '¿Tu vida? Mijo, esto es un TRABAJO.' },
        { speaker: 'JP', text: 'Exactly. I need more than a job.' },
      ]},
    ]},
    { speaker: 'Ernesto', text: '...buena suerte, mijo.' },
    { speaker: 'JP\'s Mind', text: 'I need a computer and an internet connection. That\'s the whole plan.' },
  ],
  ch4_vineyard_row: [
    { speaker: 'JP\'s Mind', text: 'Cabernet Sauvignon grapes. Caymus is famous for these.' },
    { speaker: 'JP\'s Mind', text: 'JP doesn\'t drink wine but he respects the craft.' },
    { speaker: 'JP\'s Mind', text: 'Rows and rows of vines, perfectly spaced. There\'s something about this kind of discipline.' },
  ],
  ch4_juan_watches: [
    { speaker: 'Juan', text: '¡Órale, pinche JP! ¡Dale!' },
    { speaker: 'Narrator', text: 'Juan watches from the path, shaking his head and grinning.' },
  ],
  ch4_phone_first: [
    { speaker: 'Juan', text: 'Otra vez con el teléfono, güey.' },
    { speaker: 'JP\'s Mind', text: 'He\'s not wrong.' },
  ],
  ch4_farmhouse: [
    { speaker: 'Narrator', text: 'The farmhouse. White paint peeling. Screen door that never closes right.' },
    { speaker: 'Narrator', text: 'Ernesto\'s been running this vineyard for 30 years.' },
  ],
  ch4_radio: [
    { speaker: 'Narrator', text: 'Old radio on the windowsill. Norteño music crackling through the speaker.' },
    { speaker: 'JP\'s Mind', text: 'This song has been playing since I got here. Nobody changes it.' },
  ],
  ch4_water_cooler: [
    { speaker: 'Narrator', text: 'Water jug. Lukewarm. Everyone drinks from the same cup.' },
    { speaker: 'JP\'s Mind', text: 'Hydrate or die out here.' },
  ],
  ch4_tools: [
    { speaker: 'Narrator', text: 'Pruning shears, wire cutters, gloves with holes in them.' },
    { speaker: 'Narrator', text: 'These tools are older than JP.' },
  ],
  ch4_truck: [
    { speaker: 'Narrator', text: 'Ernesto\'s truck. 1998 Ford F-150. Dents on every panel.' },
    { speaker: 'Narrator', text: 'Rosary hanging from the mirror. Mexican flag sticker on the bumper.' },
    { speaker: 'JP\'s Mind', text: 'This man works harder than anyone I know.' },
  ],
  ch4_grape_row1: [
    { speaker: 'Narrator', text: 'Cabernet Sauvignon vines. Thick trunks, heavy clusters.' },
    { speaker: 'Narrator', text: 'Each one pruned by hand. Thousands of them.' },
    { speaker: 'JP\'s Mind', text: 'This is real work. No shortcuts.' },
  ],
  ch4_grape_row2: [
    { speaker: 'Narrator', text: 'These vines have been here longer than the freeway.' },
    { speaker: 'JP\'s Mind', text: 'Something about growing things that takes patience I never had.' },
  ],
  ch4_shade_tree: [
    { speaker: 'Narrator', text: 'Massive oak tree. The only shade for a quarter mile.' },
    { speaker: 'Narrator', text: 'Everyone eats lunch here. Names carved in the trunk.' },
    { speaker: 'JP\'s Mind', text: 'Juan carved "J+M" with a heart. Won\'t say who M is.' },
  ],
  ch4_snake: [
    { speaker: 'Narrator', text: 'JP freezes. Rattlesnake. Coiled up between the vines.' },
    { speaker: 'JP', text: 'YO!' },
    { speaker: 'Ernesto', text: '¡No te muevas!' },
    { speaker: 'Narrator', text: 'Ernesto walks over calm as hell. Picks it up with a stick and flings it.' },
    { speaker: 'JP', text: 'BRO WHAT.' },
    { speaker: 'Ernesto', text: 'Es normal. Don\'t be a baby.' },
    { speaker: 'JP\'s Mind', text: 'This man just picked up a rattlesnake like it was a garden hose.' },
  ],
  ch4_break_spot: [
    { speaker: 'Narrator', text: 'Wooden bench under the shade. Water cooler. Napkins from yesterday.' },
    { speaker: 'Narrator', text: 'This is where the crew takes breaks. Ernesto times them.' },
  ],
  ch4_dust: [
    { speaker: 'Narrator', text: 'Dust everywhere. In JP\'s hair. In his lungs. In his shoes.' },
    { speaker: 'JP\'s Mind', text: 'I used to complain about traffic in SB. Now I\'m eating dirt for $12 an hour.' },
  ],
  ch4_hat: [
    { speaker: 'Narrator', text: 'Straw hat on a fence post. Nobody claims it.' },
    { speaker: 'Juan', text: 'Put it on, güero. Your head is burning.' },
    { speaker: 'JP', text: 'I told you to stop calling me that.' },
    { speaker: 'Juan', text: 'Then stop being so white.' },
  ],
  ch4_spanish_radio: [
    { speaker: 'Narrator', text: 'Someone\'s phone propped against a vine post. Corridos playing.' },
    { speaker: 'Narrator', text: 'JP doesn\'t understand all the words yet. But he feels it.' },
    { speaker: 'JP\'s Mind', text: 'Eliseo said this song is about a guy who left home and never came back.' },
    { speaker: 'JP\'s Mind', text: 'Heavy.' },
  ],
  ch4_grape_crate1: [
    { speaker: 'Narrator', text: 'Wooden crates stacked three high. Full of Cabernet grapes.' },
    { speaker: 'JP\'s Mind', text: 'These things are heavy as hell when they\'re full.' },
  ],
  ch4_grape_crate2: [
    { speaker: 'Narrator', text: 'More crates. Someone wrote "BLOCK 4" in marker on the side.' },
  ],
  ch4_water_barrel: [
    { speaker: 'Narrator', text: 'A big blue water barrel. The handle on the spigot is taped.' },
    { speaker: 'JP\'s Mind', text: 'At least the water\'s cold.' },
  ],
  ch4_wheelbarrow: [
    { speaker: 'Narrator', text: 'A beat-up wheelbarrow. One tire is low.' },
  ],
  ch4_hose: [
    { speaker: 'Narrator', text: 'A coiled irrigation hose. Green, cracked from the sun.' },
  ],
  ch4_grape_bucket: [
    { speaker: 'Narrator', text: 'A five-gallon bucket half full of clipped grape clusters.' },
  ],
  ch4_pruning: [
    { speaker: 'Narrator', text: 'Pruning shears stuck blade-down in the dirt.' },
    { speaker: 'JP\'s Mind', text: 'My hands are already cut up from these.' },
  ],
  ch4_water_jug: [
    { speaker: 'Narrator', text: 'A gallon jug. Someone wrote "JUAN" on it in Sharpie.' },
  ],
  ch4_crate_stack: [
    { speaker: 'Narrator', text: 'Empty crates ready for tomorrow\'s pick.' },
  ],
  ch4_shade_bench: [
    { speaker: 'Narrator', text: 'A wooden bench under the tree. Carved initials in the armrest.' },
    { speaker: 'JP\'s Mind', text: 'This is where Ernesto eats lunch every day. Same spot.' },
  ],
  ch4_irrigation: [
    { speaker: 'Narrator', text: 'Drip irrigation line running between the rows.' },
    { speaker: 'JP\'s Mind', text: 'Juan showed me how to fix these when they crack.' },
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
  ch5_print_shop: [
    { speaker: 'JP\'s Mind', text: 'The Sticker Smith\'s print shop. JP rebuilt their whole online presence.' },
    { speaker: 'JP\'s Mind', text: 'They\'re getting calls now. Real leads. Real revenue from a real website.' },
    { speaker: 'JP\'s Mind', text: 'This is what it looks like when you actually deliver.' },
  ],
  ch5_dhl_building: [
    { speaker: 'JP\'s Mind', text: 'DHL warehouse. JP built them a translator app so workers could understand safety protocols.' },
    { speaker: 'JP\'s Mind', text: 'Enterprise client. The kind of project that changes how people see you.' },
    { speaker: 'JP\'s Mind', text: 'Their dev team couldn\'t crack it. I did it in a week.' },
  ],
  ch5_first_site: [
    { speaker: 'JP\'s Mind', text: 'JP\'s first website. $300. Took him a week.' },
    { speaker: 'JP\'s Mind', text: 'Looking back, it was ugly as hell. But it WORKED. And the client paid.' },
  ],
  ch5_3am: [
    { speaker: 'JP\'s Mind', text: '3:47 AM. Red Bull empty. Eyes burning.' },
    { speaker: 'JP\'s Mind', text: 'But the client site is deploying. JP watches the Vercel build logs scroll.' },
    { speaker: 'JP\'s Mind', text: 'Green checkmark. It\'s live.' },
  ],
  ch5_pricing: [
    { speaker: 'JP\'s Mind', text: '$300... $500... $1,000... $3,000... $5,000.' },
    { speaker: 'JP\'s Mind', text: 'The prices kept going up because the work kept getting better.' },
  ],
  ch5_github: [
    { speaker: 'JP\'s Mind', text: '60+ repos on GitHub. Some abandoned. Most shipped.' },
    { speaker: 'JP\'s Mind', text: 'Every one taught JP something. Every failure was a lesson. Every build was proof.' },
  ],
  ch5_stack: [
    { speaker: 'JP\'s Mind', text: 'Next.js. React. Tailwind. Supabase. Vercel. Claude.' },
    { speaker: 'JP\'s Mind', text: 'The stack that changed everything.' },
  ],
  ch5_doubt: [
    { text: 'Phone buzzes. It\'s a client.' },
    { text: '"Hey, I found someone cheaper. We\'re going with them."' },
    { text: 'JP stares at the phone.' },
    { speaker: 'JP\'s Mind', text: 'Maybe I\'m not cut out for this.' },
    { speaker: 'JP\'s Mind', text: 'Everyone else has a degree. A portfolio. Experience.' },
    { speaker: 'JP\'s Mind', text: 'I have... a laptop and six months of YouTube tutorials.' },
    { text: '...' },
    { speaker: 'JP\'s Mind', text: 'But I have something they don\'t.' },
    { speaker: 'JP\'s Mind', text: 'I have nothing to lose.' },
  ],
  ch5_client_returns: [
    { speaker: 'First Client', text: 'Hey! The site is already getting traffic!' },
    { speaker: 'First Client', text: 'My buddy wants one too. Can I give him your number?' },
    { speaker: 'JP', text: 'Yeah. Send him over.' },
    { speaker: 'JP\'s Mind', text: 'Word of mouth. The best kind of marketing.' },
  ],
  ch5_ghost_leaves: [
    { speaker: 'Narrator', text: 'He sees you coming and suddenly has somewhere to be.' },
    { speaker: 'JP\'s Mind', text: 'Some people just waste your time. Learn to spot them.' },
  ],
  ch5_fiverr: [
    { speaker: 'Narrator', text: 'Fiverr inbox. "Your gig has been removed for violating terms."' },
    { speaker: 'JP\'s Mind', text: 'They want me to charge $5 for a logo and then they ban me anyway?' },
    { speaker: 'JP\'s Mind', text: 'Forget Fiverr. I\'ll find my own clients.' },
  ],
  ch5_cold_email: [
    { speaker: 'Narrator', text: 'Gmail. 47 cold emails sent this week. 2 replies. Both "not interested."' },
    { speaker: 'JP\'s Mind', text: '2 out of 47. That\'s... bad.' },
    { speaker: 'JP\'s Mind', text: 'But two people read it. That\'s more than zero.' },
  ],
  ch5_portfolio: [
    { speaker: 'Narrator', text: 'JP\'s portfolio site. Three projects. One of them is his own.' },
    { speaker: 'JP\'s Mind', text: 'Gotta start somewhere. Even if "somewhere" looks embarrassing.' },
  ],
  ch5_coffee: [
    { speaker: 'Narrator', text: 'Cold coffee. Made it 4 hours ago. Forgot about it.' },
    { speaker: 'JP\'s Mind', text: 'Still drinking it.' },
  ],
  ch5_whiteboard: [
    { speaker: 'Narrator', text: 'Whiteboard on the wall. Written in marker:' },
    { speaker: 'Narrator', text: '"GOAL: $1,000/mo by December"' },
    { speaker: 'Narrator', text: '"10 clients. $100 each. Simple."' },
    { speaker: 'JP\'s Mind', text: 'Simple on paper. Nothing about this is simple.' },
  ],
  ch5_invoice: [
    { speaker: 'Narrator', text: 'First real invoice. Sent from a Gmail account with a Google Doc template.' },
    { speaker: 'Narrator', text: '"Website Development — $300. Due on completion."' },
    { speaker: 'JP\'s Mind', text: 'It\'s not professional. But it\'s mine.' },
  ],
  ch5_rejection: [
    { speaker: 'Narrator', text: 'Text message: "Hey JP, we decided to go with someone else. Thanks though."' },
    { speaker: 'JP\'s Mind', text: '...' },
    { speaker: 'JP\'s Mind', text: 'That one stung. I spent 3 hours on that proposal.' },
    { speaker: 'JP\'s Mind', text: 'Whatever. Next.' },
  ],
  ch5_testimonial: [
    { speaker: 'Narrator', text: 'Email from WCT: "JP built our site in a week. Already getting traffic. Highly recommend."' },
    { speaker: 'JP\'s Mind', text: 'First testimonial. First proof that this works.' },
    { speaker: 'JP\'s Mind', text: 'Screenshot that. Put it everywhere.' },
  ],
  ch5_youtube: [
    { speaker: 'Narrator', text: 'YouTube. "How to Build a Website in 2024" — 14 hour watch time this week.' },
    { speaker: 'JP\'s Mind', text: 'My real college. Free tuition. No degree. Better education.' },
  ],
  ch5_ramen: [
    { speaker: 'Narrator', text: 'Ramen noodles. Third time this week.' },
    { speaker: 'JP\'s Mind', text: 'Pops would kill me if he saw what I\'m eating.' },
    { speaker: 'JP\'s Mind', text: 'One day I\'ll eat steak every night. Not yet.' },
  ],
  ch5_bank_app: [
    { speaker: 'Narrator', text: 'Bank app. Checking: $127.43.' },
    { speaker: 'JP\'s Mind', text: 'Rent is $400. That\'s due Friday.' },
    { speaker: 'JP\'s Mind', text: 'I need two more clients this week or I\'m cooked.' },
    { speaker: 'Narrator', text: 'He closes the app. Opens his laptop instead.' },
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
    { speaker: 'JP\'s Mind', text: 'Sticker Smith. WCT. DHL. Vacaville Appliance. Manza Visuals. And it\'s still just the beginning.' },
    { speaker: 'JP\'s Mind', text: 'People doing $400K a month treat me like an equal. Because I earned it.' },
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
  ch6_pomaikai_office: [
    { speaker: 'JP\'s Mind', text: 'Pomaika\'i Co headquarters. JP built this operation from the ground up.' },
    { speaker: 'JP\'s Mind', text: 'Dashboard, team workflows, client pipeline — all running. All built by one person with a laptop.' },
    { speaker: 'JP\'s Mind', text: 'Malachi had the vision. I built the machine that makes it real.' },
    { speaker: 'JP\'s Mind', text: 'COO at 22. No degree. No connections. Just work.' },
  ],
  ch6_slack: [
    { speaker: 'JP\'s Mind', text: 'Team Slack is blowing up. Three clients need updates. Two proposals due. A new lead from Instagram.' },
    { speaker: 'JP\'s Mind', text: 'JP handles all of it before lunch.' },
  ],
  ch6_revenue: [
    { speaker: 'JP\'s Mind', text: 'Revenue tracker: $2,550 collected. Pomaika\'i retainer pending. More coming.' },
    { speaker: 'JP\'s Mind', text: 'The snowball is rolling.' },
  ],
  ch6_instagram: [
    { speaker: 'JP\'s Mind', text: '@jdlo. The page JP kept deleting posts from. Not anymore.' },
    { speaker: 'JP\'s Mind', text: 'Every post is proof. Every build is a receipt.' },
  ],
  ch6_future: [
    { speaker: 'JP\'s Mind', text: 'LLC paperwork on the desk. Contracts drafted. Invoicing system ready.' },
    { speaker: 'JP\'s Mind', text: 'This isn\'t freelancing anymore. This is a business.' },
  ],
  ch6_equal_moment: [
    { speaker: 'JP\'s Mind', text: 'A guy doing $400K a month just asked JP to build his AI system.' },
    { speaker: 'JP\'s Mind', text: 'Not as a favor. As a client. Because JP is that good.' },
  ],
  ch6_elijah_update: [
    { speaker: 'Elijah', text: 'Dashboard metrics are up 40% since the redesign.' },
    { speaker: 'JP', text: 'That\'s what happens when you build for the user, not the stakeholder.' },
  ],
  ch6_security: [
    { speaker: 'Security', text: 'JP.' },
    { speaker: 'JP', text: 'How\'s it going?' },
    { speaker: 'Security', text: 'All clear. Your 2 o\'clock is here.' },
    { speaker: 'JP', text: 'Send them in.' },
  ],
  // Block 2 — restaurant, coworking, luxury
  ch6_steak_dinner: [
    { speaker: 'Narrator', text: 'The same restaurant where they celebrated the first deal.' },
    { speaker: 'JP\'s Mind', text: 'Steak medium rare. Same order every time.' },
  ],
  ch6_cowork_laptop: [
    { speaker: 'Narrator', text: 'Laptops open. Slack pinging. People building things.' },
    { speaker: 'JP\'s Mind', text: 'This is what it looks like when everyone\'s locked in.' },
  ],
  ch6_luxury_view: [
    { speaker: 'Narrator', text: 'Floor-to-ceiling windows. The city stretches out below.' },
    { speaker: 'JP\'s Mind', text: 'A year ago I couldn\'t afford the view. Now I\'m in the building.' },
  ],
  ch6_restaurant: [
    { speaker: 'Hostess', text: 'Welcome back. Your usual table?' },
    { speaker: 'JP', text: 'Yeah. Thanks.' },
    { speaker: 'Narrator', text: 'They know his name here now.' },
  ],
  ch6_coworker1: [
    { speaker: 'Dev', text: 'Yo JP, your dashboard template is insane. Can I fork it?' },
    { speaker: 'JP', text: 'Go ahead. Just credit the team.' },
  ],
  ch6_coworker2: [
    { speaker: 'Designer', text: 'You built that client site in how long?' },
    { speaker: 'JP', text: 'Two days. Claude helped.' },
    { speaker: 'Designer', text: '...I need to learn that.' },
  ],
  ch6_luxury_npc: [
    { speaker: 'Investor', text: 'I keep hearing your name. What exactly do you do?' },
    { speaker: 'JP', text: 'I build systems. Websites, AI tools, ops dashboards. Whatever moves the needle.' },
    { speaker: 'Investor', text: 'We should talk.' },
  ],
  ch6_park_bench: [
    { speaker: 'Narrator', text: 'JP sits for a minute. Watches the city move.' },
    { speaker: 'JP\'s Mind', text: 'Sometimes you gotta stop and look at what you built.' },
  ],
  ch6_malachi_impressed: [
    { speaker: 'Malachi', text: 'You talked to everyone already? That\'s why I brought you on.' },
    { speaker: 'Malachi', text: 'Most people wait to be told. You just move.' },
  ],
  ch6_team_thanks: [
    { speaker: 'Team Member', text: 'That dashboard update you did? Game changer.' },
    { speaker: 'Team Member', text: 'The whole team can see metrics now. No more guessing.' },
    { speaker: 'JP', text: 'That\'s the point.' },
  ],
  ch6_dhl_solved: [
    { speaker: 'DHL Manager', text: 'The translator app is live. Zero incidents this week.' },
    { speaker: 'DHL Manager', text: 'You might have saved someone\'s life with that thing.' },
    { speaker: 'JP\'s Mind', text: 'That one hit different.' },
  ],
  // Block 3 — Gym, Coffee Shop, Highrise Lobby
  ch6_gym_weights: [
    { speaker: 'Narrator', text: 'JP works out. Keeps sharp.' },
    { speaker: 'JP\'s Mind', text: 'Can\'t run a business if your body\'s broken.' },
  ],
  ch6_coffee: [
    { speaker: 'Narrator', text: 'JP\'s daily order.' },
    { speaker: 'JP\'s Mind', text: 'Iced americano. Every morning. Non-negotiable.' },
  ],
  ch6_lobby_desk: [
    { speaker: 'Doorman', text: 'Mr. Lopez. Package at the front desk.' },
    { speaker: 'JP', text: 'Thanks Marcus. I\'ll grab it on the way up.' },
  ],
  ch6_gym_bro: [
    { speaker: 'Gym Bro', text: 'Bro you\'re getting strong. What\'s your split?' },
    { speaker: 'JP', text: 'Push pull legs. No days off.' },
  ],
  ch6_barista: [
    { speaker: 'Barista', text: 'The usual?' },
    { speaker: 'JP', text: 'You already know.' },
  ],
  ch6_doorman: [
    { speaker: 'Doorman', text: 'Evening Mr. Lopez.' },
    { speaker: 'JP', text: 'Marcus. How\'s the family?' },
    { speaker: 'Doorman', text: 'Good, good. Little one started walking.' },
    { speaker: 'JP', text: 'No way. Tell her I said congrats.' },
  ],
  // Block 4 — JP's World
  ch6_corvette: [
    { speaker: 'Narrator', text: 'Dark metallic green C8. The car JP dreamed about on the tractor.' },
    { speaker: 'JP\'s Mind', text: 'Not a reward. A reminder of what happens when you don\'t stop.' },
    { speaker: 'Narrator', text: 'He runs his hand along the hood. Still can\'t believe it\'s real.' },
    { speaker: 'JP\'s Mind', text: 'Every mile on this thing is a mile away from who I used to be.' },
  ],
  ch6_food_truck_menu: [
    { speaker: 'Narrator', text: 'Street tacos.' },
    { speaker: 'JP\'s Mind', text: 'Best tacos in LA. JP eats here twice a week.' },
  ],
  ch6_food_truck: [
    { speaker: 'JP', text: 'Dos tacos de asada por favor.' },
    { speaker: 'Vendor', text: 'You got it boss.' },
    { speaker: 'Narrator', text: 'The vendor knows the order before JP finishes saying it.' },
  ],
  ch6_mural: [
    { speaker: 'Narrator', text: 'Someone painted the whole wall. Abstract. Colors JP can\'t name.' },
    { speaker: 'JP\'s Mind', text: 'He stands here sometimes. Just looking.' },
    { speaker: 'JP\'s Mind', text: 'Not everything has to mean something. Some things just are.' },
  ],
  ch6_valet: [
    { speaker: 'Valet', text: 'Keys are with me whenever you\'re ready, Mr. Lopez.' },
    { speaker: 'JP', text: 'Appreciate you.' },
  ],
  ch6_pedestrian1: [
    { speaker: 'Stranger', text: 'Sup.' },
    { speaker: 'JP', text: 'Sup.' },
  ],
  ch6_pedestrian2: [
    { speaker: 'Stranger', text: 'Hey aren\'t you the guy who built that app?' },
    { speaker: 'JP', text: 'Which one?' },
    { speaker: 'Narrator', text: 'The stranger laughs. JP doesn\'t. He\'s serious.' },
  ],
  ch6_rooftop: [
    { speaker: 'Narrator', text: 'The balcony overlooks the whole block. Sunset hitting the buildings.' },
    { speaker: 'JP\'s Mind', text: 'This view. This is what they don\'t show you about the grind.' },
    { speaker: 'JP\'s Mind', text: 'The quiet moments where you just... breathe.' },
  ],
  ch6_whiteboard: [
    { speaker: 'Narrator', text: 'Office whiteboard. Quarterly goals, client pipeline, revenue targets.' },
    { speaker: 'JP\'s Mind', text: 'Six months ago I didn\'t know what a pipeline was. Now I run one.' },
  ],
  ch6_client_call: [
    { speaker: 'Narrator', text: 'Phone rings. New prospect.' },
    { speaker: 'JP', text: 'Hey, this is JP. How can I help?' },
    { speaker: 'Client', text: 'We need a full website rebuild. Our current one is garbage.' },
    { speaker: 'JP', text: 'I can fix that. Let me send you a proposal by end of day.' },
    { speaker: 'JP\'s Mind', text: 'Smooth. Didn\'t even flinch.' },
  ],
  ch6_printer: [
    { speaker: 'Narrator', text: 'Printer spitting out contracts. Real contracts. With real numbers.' },
  ],
  ch6_water_cooler: [
    { speaker: 'Narrator', text: 'Water cooler. Where the office gossip happens.' },
    { speaker: 'Narrator', text: 'JP doesn\'t gossip. He listens.' },
  ],
  ch6_elevator: [
    { speaker: 'Narrator', text: 'Elevator to the 14th floor. JP\'s apartment.' },
    { speaker: 'JP\'s Mind', text: 'From a cell to a highrise. God is good.' },
  ],
  ch6_view_city: [
    { speaker: 'Narrator', text: 'Floor-to-ceiling windows. Downtown LA spread out below.' },
    { speaker: 'Narrator', text: 'Lights everywhere. Each one is someone else grinding too.' },
    { speaker: 'JP\'s Mind', text: 'I used to look at buildings like this and wonder who lived in them.' },
    { speaker: 'JP\'s Mind', text: 'Now I know. People like me.' },
  ],
  ch6_closet: [
    { speaker: 'Narrator', text: 'JP\'s closet. Button-downs, clean sneakers, a couple suits.' },
    { speaker: 'Narrator', text: 'No orange jumpsuit. Never again.' },
  ],
  ch6_restaurant_menu: [
    { speaker: 'Narrator', text: 'Prix fixe menu. $85 per person. Wine pairings extra.' },
    { speaker: 'JP\'s Mind', text: '$85 for dinner. I used to live on $85 a week.' },
  ],
  ch6_fountain: [
    { speaker: 'Narrator', text: 'Fountain in the plaza. People eating lunch around it.' },
    { speaker: 'Narrator', text: 'Normal people with normal jobs on a normal Tuesday.' },
    { speaker: 'JP\'s Mind', text: 'Nothing about my path was normal. But I\'m here too.' },
  ],
  ch6_street_art: [
    { speaker: 'Narrator', text: 'Mural on the building. Angel wings. "You Are Enough."' },
    { speaker: 'JP\'s Mind', text: 'I used to walk past these and think it was corny.' },
    { speaker: 'JP\'s Mind', text: 'Hits different now.' },
  ],
  ch6_lambo: [
    { speaker: 'Narrator', text: 'Lamborghini SVJ. Parked next to JP\'s C8. Both green.' },
    { speaker: 'JP\'s Mind', text: 'His costs 4x mine. But we\'re in the same parking lot.' },
    { speaker: 'JP\'s Mind', text: 'Give me time.' },
  ],
  ch6_valet_stand: [
    { speaker: 'Narrator', text: 'Valet stand. The guy nods at JP like he knows him.' },
    { speaker: 'JP\'s Mind', text: 'He doesn\'t know me. But he recognizes the car.' },
  ],
  ch6_newspaper: [
    { speaker: 'Narrator', text: 'LA Times on a bench. Headline about tech layoffs.' },
    { speaker: 'JP\'s Mind', text: 'They\'re laying people off. I\'m hiring people.' },
    { speaker: 'JP\'s Mind', text: 'Different game when you own it.' },
  ],
  ch6_homeless: [
    { speaker: 'Narrator', text: 'Man on the sidewalk. Cardboard sign. Backpack that holds everything he owns.' },
    { speaker: 'JP\'s Mind', text: 'That could have been me. Easily.' },
    { speaker: 'JP\'s Mind', text: 'One wrong turn and that IS me.' },
    { speaker: 'Narrator', text: 'JP gives him $20. Doesn\'t say anything.' },
  ],
  ch6_billboard: [
    { speaker: 'Narrator', text: 'Billboard. Some tech company. "The Future is Now."' },
    { speaker: 'JP\'s Mind', text: 'They\'re right. I just didn\'t believe it until I built my own.' },
  ],
  ch6_pops_call: [
    { speaker: 'Narrator', text: 'Phone buzzes. Pops.' },
    { speaker: 'Pops', text: 'Just calling to say I\'m proud of you, son.' },
    { speaker: 'JP', text: '...thanks, Pops.' },
    { speaker: 'Pops', text: 'Your mom showed me the website you built. That\'s real.' },
    { speaker: 'JP', text: 'It\'s just a website.' },
    { speaker: 'Pops', text: 'No it\'s not. It\'s proof you can do anything you set your mind to.' },
    { speaker: 'JP\'s Mind', text: 'Don\'t cry. Don\'t cry. Don\'t cry.' },
  ],
};

// ─── Build bridge exports ──────────────────────────────────────────────

export const homeDialogue = buildChapterDialogue(chapter0IntroText, chapter0NPCs, chapter0OutroText, ch0Extras);
export const beachDialogue = buildChapterDialogue(chapter1IntroText, chapter1NPCs, chapter1OutroText, ch1Extras);
export const wrongCrowdDialogue = buildChapterDialogue(chapter2IntroText, chapter2NPCs, chapter2OutroText, ch2Extras);
export const jailDialogue = buildChapterDialogue(chapter3IntroText, chapter3NPCs, chapter3OutroText, { ...ch3Day1Extras, ...ch3Day1NPCDialogue });
export const jailDay1Dialogue = buildChapterDialogue(chapter3IntroText, chapter3NPCs, chapter3OutroText, { ...ch3Day1Extras, ...ch3Day1NPCDialogue });
export const jailDay2Dialogue = buildChapterDialogue(chapter3IntroText, chapter3NPCs, chapter3OutroText, { ...ch3Day2Extras, ...ch3Day2NPCDialogue });
export const jailDay3Dialogue = buildChapterDialogue(chapter3IntroText, chapter3NPCs, chapter3OutroText, { ...ch3Day3Extras, ...ch3Day3NPCDialogue });
export const tractorDialogue = buildChapterDialogue(chapter4IntroText, chapter4NPCs, chapter4OutroText, ch4Extras);
export const comeUpDialogue = buildChapterDialogue(chapter5IntroText, chapter5NPCs, chapter5OutroText, ch5Extras);
export const operatorDialogue = buildChapterDialogue(chapter6IntroText, chapter6NPCs, chapter6OutroText, ch6Extras);

// ─── HOME RETURN — Same house, different JP ─────────────────────────────
const homeReturnIntro: string[] = [
  'Same house. Same street. Same door.',
  'But everything behind it is different now.',
];

const homeReturnNPCs: NPCData[] = [
  {
    id: 'ch0_pops',
    x: 8,
    y: 13,
    sprite: 'npc_pops',
    dialogue: [
      { speaker: 'Pops', text: 'Son.' },
      { speaker: 'Narrator', text: 'Pops hugs him. Doesn\'t let go for a while.' },
      { speaker: 'Pops', text: 'I saw the websites. The businesses.' },
      { speaker: 'Pops', text: 'Your mom showed me. I don\'t understand half of it.' },
      { speaker: 'Pops', text: 'But I know you built it yourself.' },
      { speaker: 'Pops', text: 'Most people don\'t come back from what you went through, Jordan.' },
      { speaker: 'Pops', text: 'But you did. And you came back better.' },
      { speaker: 'Pops', text: 'Whatever you do, just do it all the way.' },
      { speaker: 'Pops', text: 'Don\'t half-ass it.' },
      { speaker: 'JP', text: 'You told me that before I left for SB.' },
      { speaker: 'Pops', text: 'And now you\'re finally listening.' },
    ],
  },
  {
    id: 'ch0_mom',
    x: 28,
    y: 13,
    sprite: 'npc_female',
    dialogue: [
      { speaker: 'Mom', text: 'Jordan.' },
      { speaker: 'Mom', text: 'I showed your dad those websites you built.' },
      { speaker: 'Mom', text: 'He didn\'t say much. But I could tell.' },
      { speaker: 'JP', text: 'Tell what?' },
      { speaker: 'Mom', text: 'He\'s proud. We both are.' },
      { speaker: 'Mom', text: '...I\'m sorry I didn\'t understand before.' },
      { speaker: 'JP', text: 'It\'s OK, Mom. I didn\'t either.' },
    ],
  },
  {
    id: 'ch0_sister',
    x: 13,
    y: 6,
    sprite: 'npc_sister',
    dialogue: [
      { speaker: 'Sister', text: 'JP! You\'re home!' },
      { speaker: 'JP', text: 'Hey kid. Miss me?' },
      { speaker: 'Sister', text: 'Mom says you\'re like a CEO now.' },
      { speaker: 'JP', text: 'COO. Close enough.' },
      { speaker: 'Sister', text: 'Can you build me a website?' },
      { speaker: 'JP', text: 'What kind?' },
      { speaker: 'Sister', text: 'I don\'t know yet. But I want one.' },
      { speaker: 'JP', text: 'When you figure it out, I got you.' },
    ],
  },
  {
    id: 'ch0_frenchie',
    x: 18,
    y: 20,
    sprite: 'npc_frenchie',
    dialogue: [
      { speaker: 'Narrator', text: 'Ivy sprints across the yard.' },
      { speaker: 'Narrator', text: 'She doesn\'t care about the clients. The revenue. The title.' },
      { speaker: 'Narrator', text: 'She just knows her person is home.' },
    ],
  },
];

const homeReturnExtras: Record<string, DialogueLine[]> = {
  ch0_computer: [
    { speaker: 'JP\'s Mind', text: 'Same desk. Same setup. This is where it all started.' },
    { speaker: 'JP\'s Mind', text: 'ChatGPT to Wix to Webflow to Claude Code. Five months.' },
  ],
  ch0_bed: [
    { speaker: 'JP\'s Mind', text: 'This bed. How many 3 AM nights did I spend here, staring at the ceiling?' },
    { speaker: 'JP\'s Mind', text: 'Now those nights are worth something.' },
  ],
  ch0_mirror: [
    { speaker: 'JP\'s Mind', text: 'Same face. Different person behind it.' },
  ],
  ch0_family_photo: [
    { speaker: 'JP\'s Mind', text: 'Family photo from before everything. Before SB. Before jail.' },
    { speaker: 'JP\'s Mind', text: 'We look the same. But nothing is the same.' },
  ],
  ch0_tv: [
    { speaker: 'JP\'s Mind', text: 'Pops still watches the same shows.' },
  ],
  ch0_couch: [
    { speaker: 'JP\'s Mind', text: 'This couch. How many times did Pops sit here while I was locked up?' },
  ],
  ch0_journal: [
    { speaker: 'JP\'s Mind', text: 'Old journal from before. The handwriting looks like a different person.' },
  ],
  ch0_bbq: [
    { speaker: 'JP\'s Mind', text: 'Need to fire this up soon. Invite the whole crew over.' },
  ],
  ch0_fishing: [
    { speaker: 'JP\'s Mind', text: 'The pond. Still here. Still quiet.' },
    { speaker: 'JP\'s Mind', text: 'Some things don\'t need to change.' },
  ],
  ch0_goodbye: [
    { speaker: 'JP\'s Mind', text: 'Everything I built. Every 3 AM session. Every rejection. Every client.' },
    { speaker: 'JP\'s Mind', text: 'It was all for this.' },
    { speaker: 'JP\'s Mind', text: 'To come home and make Pops proud.' },
  ],
  ch0_crypto: [
    { speaker: 'JP\'s Mind', text: 'Crypto phase. That was a lifetime ago.' },
  ],
  ch0_college: [
    { speaker: 'JP\'s Mind', text: 'College acceptance letters. Never opened most of them.' },
    { speaker: 'JP\'s Mind', text: 'Turned out OK anyway.' },
  ],
  ch0_hidden_stash: [
    { speaker: 'JP\'s Mind', text: '...Empty. Good.' },
  ],
  ch0_poster: [
    { speaker: 'JP\'s Mind', text: 'Old poster. Still up.' },
  ],
  ch0_mail: [
    { speaker: 'JP\'s Mind', text: 'Junk mail and bills. Some things never change.' },
  ],
  ch0_fridge: [
    { speaker: 'JP\'s Mind', text: 'Mom\'s cooking. Finally.' },
  ],
  ch0_nolan_call: [
    { speaker: 'JP\'s Mind', text: 'Should call Nolan. Tell him about Vegas.' },
  ],
  ch0_frenchie_ball: [
    { speaker: 'JP\'s Mind', text: 'Ivy\'s ball. She still plays with this thing every day.' },
  ],
  ch0_sister_toys: [
    { speaker: 'JP\'s Mind', text: 'She\'s getting older. Growing up fast.' },
  ],
};

export const homeReturnDialogue = buildChapterDialogue(homeReturnIntro, homeReturnNPCs, [], homeReturnExtras);

export const endScreenData = {
  stats: endScreenStats,
  cta: endScreenCTA,
  links: endScreenLinks,
};
