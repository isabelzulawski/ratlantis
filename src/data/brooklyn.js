// Provisional creative choices for review: dialogue, pitches and fixed phrases.
export const SINGING = {
  notes: [
    { label: "C", hz: 261.63, mark: "●" },
    { label: "D", hz: 293.66, mark: "◆" },
    { label: "E", hz: 329.63, mark: "▲" },
    { label: "G", hz: 392.0, mark: "★" },
  ],
  melodies: [
    [0, 1, 2],
    [2, 1, 0, 3],
    [0, 2, 3, 2, 0],
  ],
  noteMs: 500,
  gapMs: 220,
  retryMs: 950,
};
export const BUSKER = {
  greeting: "I don't perform anymore.",
  choices: [
    "I'm trying to audition on Broadway.",
    "Were you a singer?",
    "Am I interrupting?",
  ],
  replies: [
    "Broadway, eh? I used to fill a whole platform. Might still teach a short phrase. Hard to think on an empty stomach, though.",
    "A busker. There's a difference. Twenty years of trains trying to drown me out. Today it's my stomach making the noise.",
    "Only my retirement. Not much of a performance these days. Haven't had a bite since morning.",
  ],
  thanks:
    "Well. That's better. All right, listen closely. A short phrase is all you need to start.",
  ready:
    "Four notes. Listen first, then sing them back in order. Take your time.",
  restart: "No hurry. Listen again; we'll take this phrase from the top.",
  success: "There it is. You've got a voice worth using.",
  revisit: "Still remember your notes? I knew you had it in you.",
  gift: [
    ["Busker", "Good luck. Have this ferry ticket."],
    ["Rat", "You’re sure?"],
    ["Busker", "Who am I kidding? I’m never leaving this place anyway. Might as well get some use out of it."],
  ],
  ticketBack: "Ask for the rat with the mop",
};
