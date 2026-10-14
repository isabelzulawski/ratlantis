import Phaser from "phaser";
import "./style.css";
import { Opening } from "./scenes/Opening.js";
new Phaser.Game({
  type: Phaser.AUTO,
  parent: "game",
  width: 1200,
  height: 675,
  backgroundColor: "#0d2033",
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  physics: { default: "arcade", arcade: { debug: false } },
  scene: [Opening],
});
