import { fittedEntries, fittedTexture } from "../art/costume-fit.js";
import { COSTUMES, COSTUME_NAMES } from "../data/finale.js";
import { FUR_FILTER } from "../art/assets.js";
export function openWardrobe(s, rehearse = null) {
  s.state.outfit ??= {};
  const keys = s.state.flags.wardrobe ? COSTUMES : {};
  const card = s.ui.panel(
    `<div class="wardrobe-layout"><div class="wardrobe-preview"></div><div>${Object.entries(
      keys,
    )
      .map(
        ([slot, ids]) =>
          `<h3>${slot}</h3><div class="wardrobe-options">${ids.map((id) => `<button data-costume="${id}" data-slot="${slot}"><img src="${s.textures.getBase64(id === "vest" ? "art-waistcoat" : "art-costume-portraits", id === "vest" ? "idle" : id)}" alt="">${COSTUME_NAMES[id]}</button>`).join("")}<button data-remove="${slot}">None</button></div>`,
      )
      .join(
        "",
      )}<h3>Found along the way</h3><div class="wardrobe-options">${(s.state.accessories || []).map((id) => `<button data-accessory="${id}">${id}</button>`).join("") || "<p>No accessories found yet.</p>"}<button data-clear-accessories>Remove accessories</button></div></div></div>${rehearse ? "<button data-ready>Ready for rehearsal</button>" : ""}<button data-close>Close</button>`,
    true,
  );
  card.classList.add("wardrobe-panel");
  const render = () => {
    const preview = card.querySelector(".wardrobe-preview");
    preview.innerHTML = `<img src="${s.textures.getBase64(s.state.outfit.body === "vest" ? "art-waistcoat" : "rat-atlas", "idle")}" alt="Your rat" style="filter:${FUR_FILTER[s.state.fur]}">`;
    for (const id of fittedEntries(s.state)) {
      const img = document.createElement("img");
      img.src = s.textures.getBase64(fittedTexture(id), "idle");
      img.alt = "";
      img.className = "fitted-layer";
      preview.append(img);
    }
    if ((s.state.outfit?.body && s.state.outfit.body !== "vest") || s.state.outfit?.prop) {
      const paws = document.createElement("img");
      paws.src = s.textures.getBase64("art-costume-paws", "idle");
      paws.alt = "";
      paws.style.filter = FUR_FILTER[s.state.fur];
      preview.append(paws);
    }
    card
      .querySelectorAll("[data-costume]")
      .forEach((b) =>
        b.classList.toggle(
          "selected",
          s.state.outfit[b.dataset.slot] === b.dataset.costume,
        ),
      );
    s.persist();
    s.finale.updateAppearance();
  };
  card.querySelectorAll("[data-costume]").forEach(
    (b) =>
      (b.onclick = () => {
        s.state.outfit[b.dataset.slot] = b.dataset.costume;
        render();
      }),
  );
  card.querySelectorAll("[data-remove]").forEach(
    (b) =>
      (b.onclick = () => {
        delete s.state.outfit[b.dataset.remove];
        render();
      }),
  );
  card.querySelectorAll("[data-accessory]").forEach(
    (b) =>
      (b.onclick = () => {
        s.state.equippedAccessories ??= [];
        const id = b.dataset.accessory;
        s.state.equippedAccessories = s.state.equippedAccessories.includes(id)
          ? s.state.equippedAccessories.filter((a) => a !== id)
          : [
              ...s.state.equippedAccessories.filter((a) =>
                id === "glasses" || id === "cap"
                  ? a !== id
                  : a === "glasses" || a === "cap",
              ),
              id,
            ];
        render();
      }),
  );
  card.querySelector("[data-clear-accessories]").onclick = () => {
    s.state.equippedAccessories = [];
    render();
  };
  card.querySelector("[data-close]").onclick = () => s.ui.clear();
  if (rehearse)
    card.querySelector("[data-ready]").onclick = () => {
      s.ui.clear();
      rehearse();
    };
  render();
}
