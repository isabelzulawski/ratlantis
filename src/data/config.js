export const MOVEMENT = {
  speed: 205,
  jump: 425,
  gravity: 1050,
  upwardThreshold: 58,
  jumpDeadzone: 28,
  coyoteMs: 100,
  acceleration: 1400,
  pointerGain: 6,
  stopRadius: 8,
  pizzaSpeed: 175,
  recoveryY: 665,
};
export const FURS = {
  Gray: "#898681",
  Brown: "#876a50",
  Charcoal: "#494d56",
  Cream: "#d4c4a2",
  "Rusty brown": "#98654e",
  "Blue-gray": "#738894",
};
export const ITEMS = { pizza: { name: "Pizza piece", picture: "pizza" } };
export const DIALOGUE = {
  billboard: [
    "Maybe I could try.",
    "I do look the part.",
    "Just a little closer look.",
  ],
  map: "Hmm... Broadway-Lafayette station? Isn't Lafayette that guy from that other musical? Sounds like this is the way to go!",
  dockChoices: [
    "Sorry. Where am I?",
    "Is there a way back up?",
    "I’m trying to get to a Broadway audition.",
  ],
  dockReplies: [
    "Ratlantis. Mind the deliveries.",
    "That entry pipe is too high to reach from here.",
    "A retired singer in Brooklyn may be able to help.",
  ],
};
export const SCENES = {
  street: {
    title: "Times Square · street level",
    width: 2200,
    spawn: [130, 535],
    platforms: [
      [0, 580, 2200, 90],
      [420, 540, 160, 40],
      [700, 510, 155, 70],
    ],
    exit: 2070,
    next: "station",
  },
  station: {
    title: "Broadway–Lafayette · entrance & platform",
    width: 1800,
    spawn: [110, 310],
    platforms: [
      [0, 360, 250, 24],
      [230, 400, 120, 24],
      [330, 440, 120, 24],
      [430, 480, 120, 24],
      [530, 520, 120, 24],
      [630, 580, 1170, 90],
    ],
    exit: 1580,
    next: "ride",
  },
  ride: {
    title: "Subway · in transit",
    width: 1200,
    spawn: [200, 535],
    platforms: [[0, 580, 1200, 90]],
  },
  arrivalStation: {
    title: "Subway · arrival platform",
    width: 1350,
    spawn: [140, 535],
    platforms: [[0, 580, 1350, 90]],
    exit: 1200,
    next: "fall",
  },
  fall: {
    title: "Drainage passage",
    width: 1200,
    spawn: [125, 155],
    platforms: [],
  },
  sewer: {
    title: "Ratlantis · arrival",
    width: 1800,
    spawn: [190, 485],
    platforms: [
      [100, 550, 220, 22],
      [320, 505, 220, 22],
      [540, 505, 1260, 30],
    ],
    exit: 1660,
    next: "neighborhood",
  },
  neighborhood: {
    title: "Ratlantis · neighborhood",
    width: 2100,
    spawn: [130, 485],
    platforms: [
      [0, 535, 2100, 40],
      [800, 465, 180, 20],
      [1370, 465, 180, 20],
      [1740, 450, 180, 20],
    ],
  },
};
