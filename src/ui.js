import { audioPreferences, setAudioPreference } from "./audio.js";
import { journalNotes } from "./data/journal.js";
import { FURS, DIALOGUE, ITEMS } from "./data/config.js";
import { FUR_FILTER, itemPicture, assetUrl } from "./art/assets.js";
import { fresh, load } from "./state.js";
import { Newspaper } from "./data/Newspaper.js";
import { BUSKER } from "./data/brooklyn.js";
export class UI {
  constructor(scene) {
    this.scene = scene;
    this.root = document.querySelector("#overlay");
    this.records = new Newspaper(this);
    for (const event of [
      "pointerdown",
      "pointerup",
      "mousedown",
      "mouseup",
      "click",
    ])
      this.root.addEventListener(event, (e) => e.stopPropagation());
  }
  clear() {
    this.bubbleTarget = null;
    this.root.innerHTML = "";
    this.scene.objectPress = null;
    this.scene.inputBlockedUntil = performance.now() + 100;
    this.scene.physics.resume();
    this.scene.time.paused = false;
    this.scene.tweens.resumeAll();
    this.scene.locked = false;
    this.scene.held = false;
  }
  panel(html, wide = false) {
    // Opening another interface cancels lesson playback; completed rounds stay saved.
    if (this.scene.chapter?.lessonUI?.card?.isConnected)
      this.scene.chapter.lessonUI.cancel();
    if (this.scene.finale?.dance?.card?.isConnected)
      this.scene.finale.dance.cancel();
    this.scene.freeze();
    this.scene.physics.pause();
    this.scene.time.paused = true;
    this.scene.tweens.pauseAll();
    this.root.innerHTML = `<section class="panel ${wide ? "wide" : ""}">${html}</section>`;
    return this.root.firstChild;
  }
  audioControls() {
    return `<div class="audio-controls"><button id="music">Music: ${audioPreferences.music ? "on" : "off"}</button><button id="sound">Sound FX: ${audioPreferences.effects ? "on" : "off"}</button></div>`;
  }
  refreshAudioControls() {
    document.querySelectorAll("#music").forEach(button => {
      button.textContent = `Music: ${audioPreferences.music ? "on" : "off"}`;
    });
    document.querySelectorAll("#sound, [data-sound]").forEach(button => {
      button.textContent = `Sound FX: ${audioPreferences.effects ? "on" : "off"}`;
    });
  }
  bindAudioControls(root) {
    for (const [id, kind] of [["music", "music"], ["sound", "effects"]]) {
      root.querySelector(`#${id}`).onclick = () => {
        setAudioPreference(kind, !audioPreferences[kind]);
        this.scene.audioToggle();
        if (this.scene.state) this.scene.persist();
        this.refreshAudioControls();
      };
    }
  }
  title() {
    const existing = load();
    this.panel(
      `<h1><img class="wordmark" src="${assetUrl("art/title-wordmark-v2.webp")}" alt="Ratlantis"></h1>${existing ? '<button id="continue">Continue</button><button class="secondary" id="new">New Game</button>' : '<button id="new">Begin</button>'}`,
    );
    this.root.firstChild.classList.add("title-panel");
    this.root.firstChild.insertAdjacentHTML("beforeend", this.audioControls());
    this.bindAudioControls(this.root);
    this.root.querySelector("#continue")?.addEventListener("click", () => {
      this.scene.state = existing;
      this.clear();
      this.scene.enter(existing.scene);
    });
    this.root.querySelector("#new").onclick = () => {
      if (existing)
        (this.panel(
          '<h2>Start a new adventure?</h2><p>Your current save will be replaced only when you finish character creation.</p><button id="yes">Create a new rat</button><button id="cancel" class="secondary">Keep my save</button>',
        ),
          (this.root.querySelector("#yes").onclick = () => this.creation()),
          (this.root.querySelector("#cancel").onclick = () => this.title()));
      else this.creation();
    };
  }
  creation() {
    let fur = "Gray";
    this.panel(
      `<h2>Create your rat</h2><div class="preview"></div><label for="name">Name</label><input id="name" maxlength="24" autocomplete="off" placeholder="Enter your rat’s name"><div class="colors">${Object.entries(
        FURS,
      )
        .map(
          ([n, c]) =>
            `<button class="swatch ${n === fur ? "selected" : ""}" title="${n}" aria-label="${n}" data-fur="${n}" style="background:${c}"></button>`,
        )
        .join(
          "",
        )}</div><p id="colorName">Gray</p><div class="creation-actions"><button id="back" class="secondary">Back</button><button id="start">Explore →</button></div><p id="error" class="notice"></p>`,
    );
    const preview = () =>
      (this.root.querySelector(".preview").innerHTML =
        `<img src="${this.scene.textures.getBase64("rat-atlas", "idle")}" alt="Rat wearing a fabric backpack" style="filter:${FUR_FILTER[fur]}">`);
    preview();
    this.root.querySelectorAll(".swatch").forEach(
      (b) =>
        (b.onclick = () => {
          fur = b.dataset.fur;
          this.root
            .querySelectorAll(".swatch")
            .forEach((e) => e.classList.toggle("selected", e === b));
          this.root.querySelector("#colorName").textContent = fur;
          preview();
        }),
    );
    this.root.querySelector("#back").onclick = () => this.title();
    this.root.querySelector("#start").onclick = () => {
      const name = this.root.querySelector("#name").value.trim();
      if (!name) {
        this.root.querySelector("#error").textContent = "Please enter a name.";
        return;
      }
      this.scene.state = fresh(name, fur);
      this.clear();
      this.scene.persist();
      this.scene.enter("street");
    };
  }
  dialogue(text, choices, target = null, speaker = null, className = "") {
    this.panel(
      `<p class="eyebrow">${this.scene.state.name.replace(/[<>&]/g, "")}</p><h2>${text}</h2><div class="choices">${choices.map((c, i) => `<button data-choice="${i}">${c.text}</button>`).join("")}</div>`,
    );
    this.root.firstChild.classList.add("speech", "character-bubble");
    if (className) this.root.firstChild.classList.add(className);
    this.bubbleTarget = target;
    this.root.querySelector(".eyebrow").textContent =
      speaker || this.scene.state.name;
    this.positionBubble();
    this.root.querySelectorAll("[data-choice]").forEach((b) => {
      b.setAttribute("aria-label", choices[+b.dataset.choice].text);
      b.onclick = () => choices[+b.dataset.choice].action();
    });
  }
  positionBubble() {
    this.positionCue();
    const bubble = this.root.querySelector(".character-bubble");
    if (!bubble || !this.scene.player) return;
    const r = this.scene.game.canvas.getBoundingClientRect(),
      camera = this.scene.cameras.main;
    const target = this.bubbleTarget;
    const x = target?.x ?? this.scene.player.body.center.x;
    const y = target
      ? target.y - (target.displayHeight || 70) * 0.75
      : this.scene.player.body.bottom - 60;
    const anchorX = r.left + ((x - camera.scrollX) * r.width) / 1200;
    const anchorY = r.top + ((y - camera.scrollY) * r.height) / 675;
    const left = Math.max(
      10,
      Math.min(
        innerWidth - bubble.offsetWidth - 10,
        anchorX - bubble.offsetWidth * 0.5,
      ),
    );
    bubble.style.left = `${left}px`;
    bubble.style.top = `${Math.max(10, anchorY - bubble.offsetHeight - 35)}px`;
    bubble.style.setProperty(
      "--bubble-anchor",
      `${Math.max(25, Math.min(bubble.offsetWidth - 25, anchorX - left))}px`,
    );
  }
  worldCue(target, text, action) {
    document.querySelector("#world-cue")?.remove();
    const cue = document.createElement("button");
    cue.id = "world-cue";
    cue.className = `world-thought-cue${text === "…" ? " quiet-cue" : ""}`;
    cue.textContent = text;
    for (const event of ["pointerdown", "pointerup", "mousedown", "mouseup"])
      cue.addEventListener(event, (e) => e.stopPropagation());
    cue.onclick = () => {
      if (this.cue?.element === cue) this.cue.dismissed = true;
      cue.hidden = true;
      action();
    };
    document.body.append(cue);
    this.cue = { element: cue, target };
    this.positionCue();
  }
  positionCue() {
    if (!this.cue) return;
    const { element, target } = this.cue;
    const r = this.scene.game.canvas.getBoundingClientRect(),
      c = this.scene.cameras.main;
    const offscreen = target.x < c.scrollX || target.x > c.scrollX + c.width;
    element.hidden = !!this.root.firstChild || this.cue.dismissed || offscreen;
    if (element.hidden) return;
    const x = r.left + ((target.x - c.scrollX) * r.width) / 1200,
      y =
        r.top +
        ((target.y - (target.displayHeight || 70) * 0.8 - c.scrollY) *
          r.height) /
          675;
    element.style.left = `${x - element.offsetWidth * 0.5}px`;
    element.style.top = `${Math.max(10, y - element.offsetHeight - 15)}px`;
  }
  message(text, after = () => {}, target = null, speaker = null) {
    this.dialogue(
      text,
      [
        {
          text: "Continue",
          action: () => {
            this.clear();
            after();
          },
        },
      ],
      target,
      speaker,
    );
  }
  backpack() {
    const state = this.scene.state;
    this.panel(
      `<h2>Backpack</h2><p class="footer">Drag an item onto a nearby target to use it. Click the newspaper to read it.</p><div id="items">${
        state.inventory.length
          ? state.inventory
              .filter((id) => ITEMS[id])
              .map(
                (id) =>
                  `<${ITEMS[id].readable ? "button" : "div"} class="item ${ITEMS[id].readable ? "readable-item" : ""}" data-item="${id}"><img src="${id === "newspaper" ? assetUrl("art/newspaper-item-v2.webp") : itemPicture(this.scene, ITEMS[id].picture)}" alt="${ITEMS[id].name}"><span>${ITEMS[id].name}</span>${ITEMS[id].readable ? "<small>Read</small>" : ""}</${ITEMS[id].readable ? "button" : "div"}>`,
              )
              .join("")
          : "<p>No items packed.</p>"
      }</div><p id="dropNotice" class="notice"></p><div class="journal"><h3>Journal</h3><div class="journal-notes"></div><div class="journal-paging"></div></div><button id="close">Close backpack</button>`,
      true,
    );
    this.root.querySelector("#close").onclick = () => this.clear();
    const card = this.root.firstChild;
    card.classList.add("bag-panel");
    const heading = card.querySelector("h2"),
      items = card.querySelector("#items"),
      notice = card.querySelector("#dropNotice"),
      journal = card.querySelector(".journal"),
      tip = card.querySelector(".footer"),
      close = card.querySelector("#close");
    const left = document.createElement("div");
    left.className = "bag-pocket";
    left.append(heading, items, tip, notice);
    const right = document.createElement("div");
    right.className = "bag-journal";
    right.append(journal);
    const notes = journalNotes(state);
    let journalPage = 0;
    const journalSize = innerWidth < 650 ? 2 : 4;
    const drawJournal = () => {
      const list = journal.querySelector(".journal-notes");
      list.replaceChildren();
      for (const text of notes.slice(journalPage * journalSize, journalPage * journalSize + journalSize)) {
        const p = document.createElement("p"); p.textContent = text; list.append(p);
      }
      if (!notes.length) list.textContent = "No notes yet.";
      const paging = journal.querySelector(".journal-paging");
      paging.replaceChildren();
      if (notes.length > journalSize) {
        const newer = document.createElement("button"), older = document.createElement("button"), page = document.createElement("span");
        newer.textContent = "←"; newer.setAttribute("aria-label", "Earlier notes"); newer.disabled = journalPage === 0;
        older.textContent = "→"; older.setAttribute("aria-label", "Later notes"); older.disabled = (journalPage + 1) * journalSize >= notes.length;
        page.textContent = `${journalPage + 1} / ${Math.ceil(notes.length / journalSize)}`;
        newer.onclick = () => {journalPage--; drawJournal();}; older.onclick = () => {journalPage++; drawJournal();};
        paging.append(newer, page, older);
      }
    };
    drawJournal();
    const layout = document.createElement("div");
    layout.className = "bag-layout";
    layout.append(left, right);
    card.replaceChildren(layout, close);
    if (this.scene.chapter?.canGiveFood()) {
      tip.textContent = "Click Give to busker below a food item, or drag it near him.";
      for (const item of this.root.querySelectorAll('[data-item="bread"], [data-item="pizza"]')) {
        const give = document.createElement("button");
        give.textContent = "Give to busker";
        give.className = "give-food";
        give.onpointerdown = event => event.stopPropagation();
        give.onclick = event => {
          event.stopPropagation();
          if (this.scene.chapter.give(item.dataset.item)) {
            this.clear();
            this.scene.chapter.afterFood();
          }
        };
        item.append(give);
      }
    }
    this.root
      .querySelector("[data-item='newspaper']")
      ?.addEventListener("click", () => {
        if (performance.now() < (this.suppressReadUntil || 0)) return;
        this.records.open("newspaper", () => this.backpack());
      });
    this.root
      .querySelector('[data-item="ticket"]')
      ?.addEventListener("click", () => {
        if (performance.now() < (this.suppressReadUntil || 0)) return;
        this.message(`On the back: “${BUSKER.ticketBack}.”`, () =>
          this.backpack(),
        );
      });
    this.root.querySelectorAll(".item").forEach((el) => {
      el.onpointerdown = (e) => {
        e.stopPropagation();
        if (e.button !== 0) return;
        const start = { x: e.clientX, y: e.clientY };
        let dragged = false,
          ghost = null;
        const move = (ev) => {
          if (
            !dragged &&
            Math.hypot(ev.clientX - start.x, ev.clientY - start.y) > 7
          ) {
            dragged = true;
            ghost = document.createElement("img");
            ghost.src = el.querySelector("img").src;
            ghost.className = "ghost";
            document.body.append(ghost);
            this.root.classList.add("inventory-dragging");
          }
          if (ghost) {
            ghost.style.left = `${ev.clientX - 40}px`;
            ghost.style.top = `${ev.clientY - 30}px`;
          }
        };
        const end = (ev) => {
          window.removeEventListener("pointermove", move);
          window.removeEventListener("pointerup", end, true);
          window.removeEventListener("pointercancel", end, true);
          window.removeEventListener("blur", end);
          ghost?.remove();
          this.root.classList.remove("inventory-dragging");
          this.scene.held = false;
          this.scene.objectPress = null;
          this.scene.inputBlockedUntil = performance.now() + 200;
          if (!dragged || ev.type !== "pointerup") return;
          this.suppressReadUntil = performance.now() + 300;
          const rect = this.scene.game.canvas.getBoundingClientRect(),
            camera = this.scene.cameras.main;
          const x =
            ((ev.clientX - rect.left) * 1200) / rect.width + camera.scrollX;
          const y =
            ((ev.clientY - rect.top) * 675) / rect.height + camera.scrollY;
          const accepted = this.scene.chapter?.drop(el.dataset.item, x, y);
          if (accepted) {
            this.clear();
            this.scene.chapter.afterFood();
          } else
            this.root.querySelector("#dropNotice").textContent =
              this.scene.chapter?.dropNotice(el.dataset.item) ||
              "No suitable target here. The item returned to your backpack.";
        };
        window.addEventListener("pointermove", move);
        window.addEventListener("pointerup", end, {
          once: true,
          capture: true,
        });
        window.addEventListener("pointercancel", end, {
          once: true,
          capture: true,
        });
        window.addEventListener("blur", end, { once: true });
      };
    });
  }

  help() {
    this.panel(
      `<h2>Pause & help</h2><p>Hold the mouse button to move toward the pointer.</p><p>Release with the pointer above your rat to jump.</p><p>Release elsewhere to stop.</p><p>The cursor previews JUMP or STOP. Click objects to inspect. Open the backpack to drag items. Falls return you to safe ground. ${this.scene.saveFailed ? "Browser storage is unavailable. Keep this tab open to preserve this session. Progress will be lost when you close or reload it." : "Progress saves automatically."}</p><button id="resume">Resume</button><button id="title" class="secondary">Title screen</button>`,
    );
    this.root.querySelector("#resume").onclick = () => this.clear();
    this.root.querySelector("#title").onclick = () => {
      this.scene.persist();
      this.scene.resetWorld();
      this.scene.showTitleArt();
      this.title();
    };
  }
  hud(title) {
    document.querySelector("#hud")?.remove();
    const h = document.createElement("aside");
    h.id = "hud";
    h.className = "hud";
    h.innerHTML = `<div class="location">${title.split(": ")[0]}</div><div><button id="bag" aria-label="Backpack"><img src="${itemPicture(this.scene, "backpack")}" alt=""><span>Backpack</span></button><button id="help" aria-label="Pause / Help">Pause / Help</button><button id="wardrobe">Wardrobe</button><button id="travel">Paths</button><button id="music">Music: ${audioPreferences.music ? "on" : "off"}</button><button id="sound">Sound FX: ${audioPreferences.effects ? "on" : "off"}</button></div>`;
    if (this.scene.id === "downtown")
      h.querySelector(".location").style.visibility = "hidden";
    for (const event of ["pointerdown", "pointerup"])
      h.addEventListener(event, () => {
        this.scene.held = false;
        this.scene.objectPress = null;
        this.scene.player?.body.setVelocityX(0);
      });
    document.body.append(h);
    h.querySelector("#wardrobe").onclick = () => this.scene.finale.wardrobe();
    h.querySelector("#travel").onclick = () => this.scene.finale.map();
    h.querySelector("#bag").onclick = () => this.backpack();
    h.querySelector("#help").onclick = () => this.help();
    this.bindAudioControls(h);
    document.querySelector(".hint")?.remove();
    const hint = document.createElement("div");
    hint.className = "hint";
    hint.textContent = "Hold to move. Release above your rat to jump.";
    hint.classList.add("first-hint");
    document.body.append(hint);
  }
}
