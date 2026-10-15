// Provisional final-chapter dialogue/layout choices. Edit freely here.
export const DANCE = {
  leadMs: 3200,
  intervalMs: 1700,
  windowMs: 700,
  required: 5,
  practice: ["left", "right", "jump"],
  cues: ["left", "right", "jump", "left", "jump", "right", "left", "jump"],
};
export const COSTUMES = {
  head: ["crown", "paperHat", "helmet"],
  body: ["cape", "vest", "sash"],
  prop: ["staff", "sword", "flower"],
};
export const COSTUME_NAMES = {
  crown: "Bottle-cap crown",
  paperHat: "Folded-paper hat",
  helmet: "Thimble helmet",
  cape: "Fabric cape",
  vest: "Navy waistcoat",
  sash: "Ribbon sash",
  staff: "Matchstick staff",
  sword: "Teaspoon sword",
  flower: "Button flower",
};
export const EMOTIONS = [
  {
    emotion: "joy",
    request: "The royal breadcrumb has been found. Show me joy.",
    choices: [
      "My crumb! Oh, what a wonderful day!",
      "All that searching, and now it is gone.",
      "Who dared touch my breadcrumb?",
    ],
    correct: 0,
  },
  {
    emotion: "sorrow",
    request: "The breadcrumb has fallen into the drain. Show me sorrow.",
    choices: [
      "A crumb fit for a celebration!",
      "My little crumb. I shall miss you.",
      "Bring it back this instant!",
    ],
    correct: 1,
  },
  {
    emotion: "anger",
    request: "Someone has stolen the last breadcrumb. Show me anger.",
    choices: [
      "What a lovely surprise!",
      "There is nothing left for me.",
      "Who took it? Return my breadcrumb!",
    ],
    correct: 2,
  },
];
export const FINAL_DIALOGUE = {
  ferryLocked: "A ferry ticket is needed for this crossing.",
  workerReady:
    "This ferry has always had great rhythm. Want to see what I mean?",
  workerDone:
    "You found it! Now you're ready to make your way to Queens. Take the passage to the right.",
  directorIntro:
    "Every audition needs a costume! Try anything on the rack. There is no wrong outfit.",
  directorWrong: "A different feeling. Try that line again.",
  directorDone:
    "Good. Crawl through the pipes back to Manhattan. Keep going until you see a warm light. That's the vent to the audition room.",
  ending: "End of Level One",
};
export const TRAVEL_NAMES = {
  neighborhood: "Ratlantis",
  bridge: "Brooklyn bridge",
  brooklyn: "Busker’s alcove",
  ferry: "Ferry deck",
  queens: "Queens theater",
  auditionPipe: "Manhattan conduit",
  vent: "Audition-room vent",
  auditionRoom: "At the open vent",
};
