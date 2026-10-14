import "./style.css";
import { Newspaper } from "./data/Newspaper.js";
import "./reference-ui.css";
if (new URLSearchParams(location.search).get("data") === "newspaper") {
  // Read-only presentation entry: no Phaser scene, save load, or progress writes.
  window.cityRecords = new Newspaper();
  window.cityRecords.open("newspaper");
} else {
  async function startAdventure() {
    document.querySelector("#overlay").innerHTML =
      '<section class="panel"><p id="loading-progress" role="status">Opening Ratlantis…</p></section>';
    const [{ default: Phaser }, { Opening }] = await Promise.all([
      import("phaser"),
      import("./scenes/Opening.js"),
    ]);
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
  }
  startAdventure();
}
