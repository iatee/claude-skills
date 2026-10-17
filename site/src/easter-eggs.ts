// Small jokes for people who wander: imported once by the landing page and once by every guide.

// A tab left in the background for a few seconds gets a new title; it comes back on return.
const title = document.title;
let away = 0;
document.addEventListener("visibilitychange", () => {
  clearTimeout(away);
  if (document.hidden) away = window.setTimeout(() => (document.title = "Skill issues loading…"), 3000);
  else if (document.title !== title) {
    document.title = "Skills restored ✓";
    away = window.setTimeout(() => (document.title = title), 2000);
  }
});

// For whoever opens the devtools.
console.log(
  "%c👋 Reading the source? That's a skill.\n%cThe whole site is open: https://github.com/iatee/claude-skills",
  "font: 600 14px system-ui; color: #ff5cad",
  "font: 12px system-ui",
);

// The Konami code turns the magenta accent green, and back.
const konami = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
let progress = 0;
document.addEventListener("keydown", (event) => {
  progress = event.key === konami[progress] ? progress + 1 : event.key === konami[0] ? 1 : 0;
  if (progress < konami.length) return;
  progress = 0;
  const root = document.documentElement.style;
  root.filter = root.filter ? "" : "hue-rotate(180deg)";
});
