// Each chapter: intro dialogue → world exploration → battle → rankUp dialogue
// scenes: array of { speaker, lines[] }
// after last scene engine transitions to WORLD (or BATTLE if phase === 'pre_battle')

export const CHAPTERS = [
  {
    id: 0,
    title: 'The Fallen Sect',
    zone: 0,
    intro: [
      { speaker: null, lines: ['The mountains run red.', 'You wake amid ash and silence.', 'Every face you recognise is still.'] },
      { speaker: null, lines: ['Your sect — the Verdant Cloud — is gone.', 'Slaughtered in a single night by the Iron Sky Pavilion.'] },
      { speaker: 'Dying Elder', lines: ['You... you survived.', 'Take this token. The last of our lineage.', 'Do not waste it on grief.'] },
      { speaker: null, lines: ['You bury your master with your bare hands.', 'Then you walk south, with nothing but hunger and rage.'] },
    ],
    preBattle: [
      { speaker: null, lines: ['A patrol of Iron Sky enforcers blocks the valley road.', 'They wear your sect\'s crest as a trophy.'] },
      { speaker: 'Enforcer', lines: ['Another one crawled out of the rubble. Finish it.'] },
      { speaker: null, lines: ['Your hands tremble. But your feet do not move.'] },
    ],
    postBattle: [
      { speaker: null, lines: ['The enforcer falls. Your first kill.', 'You feel no satisfaction. Only the weight of what is coming.'] },
    ],
    rankUp: [
      { speaker: null, lines: ['The fight tempers something in your flesh.', 'Not qi — something older. Bone and blood, hardened by will.'] },
      { speaker: null, lines: ['Rank: Body Refining.', 'Your body is your first weapon. Now it knows it.'] },
    ],
    defeat: [
      { speaker: null, lines: ['The enforcer\'s boot finds your ribs.', '"Stay down, wretch. The dead don\'t fight back."', 'You retreat. For now.'] },
    ],
  },
  {
    id: 1,
    title: "The Old Man's Gift",
    zone: 1,
    intro: [
      { speaker: null, lines: ['Three days in the forest. No food. No shelter.', 'You find a vagrant dying against an old pine.'] },
      { speaker: 'Vagrant', lines: ['Ha. You have the look of someone who\'s lost everything.', 'Good. Attached men make weak cultivators.'] },
      { speaker: 'Vagrant', lines: ['Take this jade slip. The technique inside is forbidden.', 'The big sects would kill you for knowing it.', '...They\'ll try anyway.'] },
      { speaker: null, lines: ['He presses the slip into your palm and closes his eyes.'] },
      { speaker: 'Vagrant', lines: ['"The Beggar Sect taught me everything I know," he says, before he goes quiet.', '"We find truth in having nothing."'] },
      { speaker: null, lines: ['You sit with him until he stops breathing.', 'Then you open the slip.'] },
      { speaker: null, lines: ['Formless Qi Art — a technique with no stance, no form.', 'It reads the enemy\'s rhythm and mirrors it back tenfold.'] },
    ],
    preBattle: [
      { speaker: null, lines: ['At the forest edge, a cloaked figure has been following you since the village.', '"Hand over the jade slip. The old man stole it from us."'] },
      { speaker: 'Shadow Stalker', lines: ['Nothing personal. It\'s just property recovery.'] },
    ],
    postBattle: [
      { speaker: null, lines: ['The stalker dissolves into shadow and flees.', 'You pocket the slip. It is yours now.'] },
    ],
    rankUp: [
      { speaker: null, lines: ['The Formless Qi Art takes root.', 'The first thread of qi moves through you — unforced, inevitable.'] },
      { speaker: null, lines: ['Rank: Qi Refining.', 'You are no longer just angry. You are dangerous.'] },
    ],
    defeat: [
      { speaker: null, lines: ['The stalker\'s blade finds your shoulder.', '"I\'ll let you live. The slip won\'t help you anyway."', 'You retreat into the trees.'] },
    ],
  },
  {
    id: 2,
    title: 'The Underworld Market',
    zone: 2,
    intro: [
      { speaker: null, lines: ['Three weeks later. The black-market city of Ashgate.', 'Information costs spirit stones you don\'t have.', 'Violence costs nothing.'] },
      { speaker: 'Beggar Sect Contact', lines: ['Iron Sky Patriarch? Asking that name out loud takes nerve.', 'Good. Sit. This one\'s free — professional courtesy to a fallen sect.'] },
      { speaker: 'Beggar Sect Contact', lines: ['Ren Zhaotian. Void Return realm. Consolidated eleven sects in twenty years.', 'The Namgung merchants have been running weapons to him for two years.', 'Ask them about it and they\'ll deny it with a smile.'] },
      { speaker: 'Beggar Sect Contact', lines: ['Yours was the last holdout. He doesn\'t leave loose ends.', '...Yet here you are.'],
        choices: [
          {
            label: '"What do you want in return?"',
            response: { speaker: 'Beggar Sect Contact', lines: ['"Nothing. Consider it a gift."', '"The Beggar Sect remembers the Verdant Cloud. Good people."'] }
          },
          {
            label: '(Stay silent. Memorise everything.)',
            response: { speaker: null, lines: ['You say nothing. The silence carries its own weight.', 'He understands.'] }
          },
        ]
      },
      { speaker: null, lines: ['Ren Zhaotian. You repeat it until it has no room in your mouth for anything else.'] },
    ],
    preBattle: [
      { speaker: null, lines: ['The merchant had company. Three Iron Fang enforcers emerge from the alley.', '"The Patriarch sends his regards. And a message: stop looking."'] },
      { speaker: 'Iron Fang Elder', lines: ['Ashgate has a policy. No loose ends.'] },
    ],
    postBattle: [
      { speaker: null, lines: ['You leave them breathing. Barely.', 'You need them to carry the message back.'] },
    ],
    rankUp: [
      { speaker: null, lines: ['The battle crystallises something in your core.', 'Not a spark — a pillar. The foundation is laid.'] },
      { speaker: null, lines: ['Rank: Foundation.', 'Solid. Unshakeable. The golden core begins to take shape.'] },
    ],
    defeat: [
      { speaker: null, lines: ['Three against one is poor odds.', 'You escape through the market crowd, bleeding.', 'The core of your pride fractures. Not yet. Not yet.'] },
    ],
  },
  {
    id: 3,
    title: 'Blood and Iron',
    zone: 3,
    intro: [
      { speaker: null, lines: ['The ruins of the Hollow Ridge sect.', 'Another school Ren Zhaotian erased.', 'But something survived here — a map, hidden in the rubble.'] },
      { speaker: null, lines: ['It marks an ancestor\'s tomb to the north.', 'And something else: a name you recognise.', 'Crimson Viper — Thousand Poison Lord of the Poison Sect.', 'The man who carried the order to your sect\'s mountain.'] },
      { speaker: null, lines: ['He is here. Looting the ruins.'] },
    ],
    preBattle: [
      { speaker: 'Crimson Viper', lines: ['You. They said you died in the mountains.', 'I\'ll correct that record personally.'] },
      { speaker: null, lines: ['His poison qi seeps into the air. The stones beneath his feet crack.', 'This is the man who killed your sect.'] },
    ],
    postBattle: [
      { speaker: 'Crimson Viper', lines: ['...Impossible. A Foundation cultivator should not—'] },
      { speaker: null, lines: ['He doesn\'t finish the sentence.', 'You stand over him for a long time.', 'Then you take the map.'] },
    ],
    rankUp: [
      { speaker: null, lines: ['The first true revenge is done.', 'A golden mote — no longer small — ignites fully in your dantian.'] },
      { speaker: null, lines: ['Rank: Core Formation.', 'The golden core is born. Ren Zhaotian will know your name now.'] },
    ],
    defeat: [
      { speaker: null, lines: ['The poison clips you. You barely escape the ruins.', 'Crimson Viper watches you go.', '"Come back when you\'re worth killing properly."'] },
    ],
  },
  {
    id: 4,
    title: "The Ancestor's Tomb",
    zone: 4,
    intro: [
      { speaker: null, lines: ['The map leads to a sealed cave beneath a dry riverbed.', 'Inside: the tomb of a cultivator from a dead age.', 'But someone is already at the entrance.'] },
      { speaker: null, lines: ['A shaved head. Orange robes. No weapon.', 'He does not look surprised to see you.'] },
      { speaker: 'Shaolin Monk', lines: ['Shaolin Temple has kept watch over this tomb for three hundred years.', 'Those who seek power find only the guardian inside.'] },
      { speaker: 'Shaolin Monk', lines: ['But you...', 'You are not here for power, are you.'] },
      { speaker: null, lines: ['He steps aside without another word.'],
        choices: [
          {
            label: '(Bow deeply in thanks.)',
            response: { speaker: 'Shaolin Monk', lines: ['"No thanks are needed."', '"The tomb waited for someone like you. That is all."'] }
          },
          {
            label: '(Walk past without a word.)',
            response: { speaker: null, lines: ['He doesn\'t seem offended.', 'Perhaps he expected it.'] }
          },
        ]
      },
      { speaker: null, lines: ['On the stone: no name. Only a warning.', '"Those who enter seeking power will find only death. Those who enter seeking truth may pass."'] },
      { speaker: null, lines: ['You walk in.', 'The stone guardian activates.'] },
    ],
    preBattle: [
      { speaker: null, lines: ['The sentinel is not alive. It does not speak.', 'It only tests.', 'It has been testing cultivators for five hundred years.'] },
    ],
    postBattle: [
      { speaker: null, lines: ['The guardian shatters. Its stones land in a perfect circle around you.', 'In the centre of the tomb: a sealed cultivation chamber.', 'You step inside and sit.'] },
      { speaker: null, lines: ['You stay for seven days. When you emerge, the mountain has a small crack in it.'] },
    ],
    rankUp: [
      { speaker: null, lines: ['The ancestor left no name. But they left their understanding.', 'The nascent soul stirs inside the golden core — a soul forming within a soul.'] },
      { speaker: null, lines: ['Rank: Nascent Soul.', 'You are something new. Ren Zhaotian\'s advantage is narrowing.'] },
    ],
    defeat: [
      { speaker: null, lines: ['The guardian drives you back to the entrance.', 'It waits patiently inside.', '"Seek truth, not power." You think about that for a while.'] },
    ],
  },
  {
    id: 5,
    title: 'War of Sects',
    zone: 5,
    intro: [
      { speaker: null, lines: ['Iron Sky Pavilion has declared war on the remaining free sects.', 'The battlefield is the valley of a thousand steps.', 'You didn\'t plan to be here.'] },
      { speaker: null, lines: ['The air carries a faint scent of plum blossoms.', 'Mount Hua\'s disciples are holding the eastern flank — barely.', 'On the high ridge, Wudang elders watch in silence. They have not committed their disciples.'] },
      { speaker: 'Sect Leader', lines: ['Stranger — are you Iron Sky?'] },
      { speaker: null, lines: ['"No."', '"Then fight with us. We won\'t survive the hour otherwise."', 'You look at the banners. At the faces.', 'You nod.'] },
    ],
    preBattle: [
      { speaker: null, lines: ['The Iron Sky Warlord rides to the front of his army.', 'A Void Return cultivator. His soldiers stop attacking to watch.'] },
      { speaker: 'Warlord Chen', lines: ['Send me the strongest one you have.', 'I\'ll make it quick.'] },
      { speaker: null, lines: ['You step forward. The allied sect leader grabs your arm.', '"You can\'t—"', 'You\'re already walking.'] },
    ],
    postBattle: [
      { speaker: null, lines: ['Warlord Chen falls.', 'His army does not flee immediately. They stand in silence.', 'Then, slowly, they disperse.'] },
      { speaker: 'Sect Leader', lines: ['...Who are you?'] },
      { speaker: null, lines: ['"The last Verdant Cloud disciple."', 'You don\'t wait for a reply.'] },
    ],
    rankUp: [
      { speaker: null, lines: ['Something in the battle broke your ceiling.', 'The void you touched in the ancestor\'s tomb — you step fully into it.'] },
      { speaker: null, lines: ['Rank: Void Return.', 'Ren Zhaotian\'s realm. His advantage is gone.'] },
    ],
    defeat: [
      { speaker: null, lines: ['Chen\'s war hammer finds you mid-technique.', 'You survive. The battle does not.', 'The allied sects scatter. You disappear into the valley.'] },
    ],
  },
  {
    id: 6,
    title: "Heaven's Threshold",
    zone: 6,
    intro: [
      { speaker: null, lines: ['The war is over. The valley is quiet.', 'You are alone again, as you were at the beginning.'] },
      { speaker: null, lines: ['Ren Zhaotian\'s spire rises at the edge of the horizon.', 'You could walk there now.', 'But something is not finished.'] },
      { speaker: null, lines: ['You sit on a broken wall and close your eyes.', 'The void you entered in the tomb — you feel its edge still inside you.', 'Not a ceiling. A door.'] },
      { speaker: null, lines: ['A figure descends the mountain path.', 'Not Ren Zhaotian. His final guardian.'] },
      { speaker: 'Iron Crown Elder', lines: ['The Patriarch knew you\'d come eventually.', 'He asked me to test whether you were worthy of his time.'] },
    ],
    preBattle: [
      { speaker: 'Iron Crown Elder', lines: ['Void Return. I\'ve faced stronger men who lost to me.', 'Convince me you can reach the Patriarch\'s level.'] },
      { speaker: null, lines: ['He draws no weapon.', 'His qi alone bends the air around him.'] },
    ],
    postBattle: [
      { speaker: 'Iron Crown Elder', lines: ['...', 'You\'ve already crossed it, haven\'t you.'] },
      { speaker: null, lines: ['He laughs once — short, genuine — and steps aside.', '"Go on then. He\'s been waiting."'] },
    ],
    rankUp: [
      { speaker: null, lines: ['The last threshold shatters mid-fight.', 'Not with effort. With inevitability.', 'You are no longer climbing the mountain.'] },
      { speaker: null, lines: ['Rank: Immortal Sovereign.', 'The path is walked. What remains is the ending.'] },
    ],
    defeat: [
      { speaker: 'Iron Crown Elder', lines: ['Not yet.', 'Return when the void has settled in your bones.', 'The Patriarch will wait.'] },
    ],
  },
  {
    id: 7,
    title: 'The Peak',
    zone: 7,
    intro: [
      { speaker: null, lines: ['Iron Sky Pavilion. The tallest spire on the continent.', 'You walk in through the front gate.', 'No one stops you.'] },
      { speaker: null, lines: ['They\'ve all felt what you\'ve become.'] },
      { speaker: null, lines: ['Ren Zhaotian is at the top. Waiting.', '"I wondered when you\'d arrive," he says.', '"I\'ve been watching you since the mountains."'] },
      { speaker: 'Ren Zhaotian', lines: ['The Verdant Cloud was in my way. Nothing personal.', 'But you — you became something I didn\'t account for.', 'Sit. Let\'s talk before one of us dies.'] },
      { speaker: null, lines: ['You sit.', 'He pours tea.', 'You talk for an hour. He is not a monster.', 'He is something worse: a man with a plan.'] },
      { speaker: 'Ren Zhaotian', lines: ['"You want to know how I reached this realm," he says. It isn\'t a question.', '"The Thousand Mountains answered when I called."', '"The Heavenly Demon does not give gifts — only exchanges."'] },
      { speaker: 'Ren Zhaotian', lines: ['"I gave something I don\'t miss. The Iron Sky Pavilion gave me the rest."', 'He says it without shame. Without apology.', '"It was a fair trade."'],
        choices: [
          {
            label: '"It was not."',
            response: { speaker: 'Ren Zhaotian', lines: ['"...No. Perhaps not."', '"But I made it anyway."'] }
          },
          {
            label: '(Stand. Say nothing. Let the silence answer.)',
            response: { speaker: null, lines: ['He looks at you for a long moment.', 'Then he sets down his cup.'] }
          },
        ]
      },
      { speaker: null, lines: ['Then you stand.', '"Talking\'s done."'] },
    ],
    preBattle: [
      { speaker: 'Ren Zhaotian', lines: ['I hoped it wouldn\'t come to this.', 'But I didn\'t build the Iron Sky Pavilion by hoping.'] },
      { speaker: null, lines: ['The sky above the spire cracks.', 'He\'s been suppressing his true realm this entire conversation.'] },
    ],
    postBattle: [
      { speaker: 'Ren Zhaotian', lines: ['...You are the first.', 'The first in thirty years to push me this far.'] },
      { speaker: null, lines: ['He is not dead. You didn\'t come here for a corpse.', 'You came here for acknowledgement. For an ending.', 'This is close enough.'] },
      { speaker: null, lines: ['You dismantle the Iron Sky Pavilion over the following months.', 'Not with violence. With the weight of what you\'ve become.'] },
      { speaker: null, lines: ['No one forgets the last Verdant Cloud disciple.', 'The one who walked the full length of the dao alone.', 'And arrived at the peak.'] },
      { speaker: null, lines: ['— END —'] },
    ],
    defeat: [
      { speaker: 'Ren Zhaotian', lines: ['...Extraordinary.', 'Even at Immortal Sovereign realm, you pushed me.', 'Rest. Come back when the rage has cooled.', 'I\'ll be here.'] },
    ],
  },
];
