// Separate browser-wide preferences let the title/loading screens share music
// with the adventure, without depending on a save or Phaser scene lifecycle.
const KEY = "ratlantis-audio-v1";
let saved;
try { saved = JSON.parse(localStorage.getItem(KEY)); } catch {}
export const audioPreferences = {
  music: typeof saved?.music === "boolean" ? saved.music : true,
  effects: typeof saved?.effects === "boolean" ? saved.effects : true,
};
export const music = new Audio(`${import.meta.env.BASE_URL}audio/orchestral-adventure-theme.mp3`);
music.loop = true;
music.preload = "auto";
music.volume = 0.045;
let context = "loading", unlocked = false, fade;
const levels = { game: 0.045, menu: 0.18, loading: 0.14 };
function sync() {
  music.muted = !audioPreferences.music;
  if (!audioPreferences.music || document.hidden) {
    music.pause();
    return;
  }
  if (unlocked && music.paused) music.play().catch(() => {});
}
export function setMusicContext(next) {
  context = next;
  clearInterval(fade);
  const target = levels[context] ?? levels.game;
  // Independent of Phaser timers, which pause while HTML panels are open.
  fade = setInterval(() => {
    const delta = target - music.volume;
    music.volume = Math.max(0, Math.min(1, music.volume + delta * 0.25));
    if (Math.abs(delta) < 0.001) { music.volume = target; clearInterval(fade); }
  }, 30);
  sync();
}
export function setAudioPreference(kind, enabled) {
  audioPreferences[kind] = Boolean(enabled);
  try { localStorage.setItem(KEY, JSON.stringify(audioPreferences)); } catch {}
  sync();
}
export function unlockAudio() {
  unlocked = true;
  sync();
}
document.addEventListener("pointerdown", unlockAudio, {capture:true});
document.addEventListener("keydown", unlockAudio, {capture:true});
document.addEventListener("visibilitychange", sync);
