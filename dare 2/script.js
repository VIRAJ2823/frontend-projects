/* CURSOR */
const cursor = document.getElementById("cursor");
const ring = document.getElementById("cursor-ring");

let mx = 0;
let my = 0;

let rx = 0;
let ry = 0;

document.addEventListener("mousemove", (e) => {
  mx = e.clientX;
  my = e.clientY;

  cursor.style.transform = `translate(${mx - 6}px, ${my - 6}px)`;
});

function animateRing() {
  rx += (mx - rx) * 0.12;
  ry += (my - ry) * 0.12;

  ring.style.transform = `translate(${rx - 18}px, ${ry - 18}px)`;

  requestAnimationFrame(animateRing);
}

animateRing();

/* TYPING EFFECT */
const words = ["DARE", "GROW", "LIVE", "RISE", "DARE"];

const target = document.getElementById("typing-text");

let wi = 0;
let ci = 0;
let deleting = false;

function typeStep() {
  const word = words[wi % words.length];

  if (!deleting) {
    target.textContent = word.slice(0, ++ci);

    if (ci === word.length) {
      deleting = true;
      setTimeout(typeStep, 1800);
      return;
    }
  } else {
    target.textContent = word.slice(0, --ci);

    if (ci === 0) {
      deleting = false;
      wi++;
      setTimeout(typeStep, 300);
      return;
    }
  }

  setTimeout(typeStep, deleting ? 60 : 100);
}

typeStep();

/* SCROLL REVEAL */
const reveals = document.querySelectorAll(".reveal");

const revealObs = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  },
  {
    threshold: 0.15,
  }
);

reveals.forEach((el) => revealObs.observe(el));

/* COUNTERS */
function animateCounter(el) {
  const target = parseFloat(el.dataset.count);
  const suffix = el.dataset.suffix || "";

  const isFloat = target % 1 !== 0;

  const duration = 2000;

  const start = performance.now();

  function update(now) {
    const elapsed = now - start;

    const progress = Math.min(elapsed / duration, 1);

    const ease = 1 - Math.pow(1 - progress, 3);

    const val = target * ease;

    el.textContent =
      (isFloat ? val.toFixed(1) : Math.round(val)) + suffix;

    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }

  requestAnimationFrame(update);
}

const counterObs = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (
        entry.isIntersecting &&
        !entry.target.dataset.animated
      ) {
        entry.target.dataset.animated = "1";

        animateCounter(entry.target);
      }
    });
  },
  {
    threshold: 0.5,
  }
);

document
  .querySelectorAll("[data-count]")
  .forEach((el) => counterObs.observe(el));

/* RIPPLE EFFECT */
function ripple(e, btn) {
  const container = btn.querySelector(".ripple-container");

  if (!container) return;

  const rect = btn.getBoundingClientRect();

  const ripple = document.createElement("div");

  ripple.className = "ripple";

  const size = Math.max(rect.width, rect.height) * 2;

  ripple.style.width = `${size}px`;
  ripple.style.height = `${size}px`;

  ripple.style.left = `${e.clientX - rect.left - size / 2}px`;

  ripple.style.top = `${e.clientY - rect.top - size / 2}px`;

  container.appendChild(ripple);

  setTimeout(() => ripple.remove(), 700);
}

/* CARD GLOW */
function cardGlow(e, card) {
  const rect = card.getBoundingClientRect();

  const x =
    ((e.clientX - rect.left) / rect.width) * 100;

  const y =
    ((e.clientY - rect.top) / rect.height) * 100;

  card.style.setProperty("--mx", `${x}%`);
  card.style.setProperty("--my", `${y}%`);
}

/* NAV SCROLL */
window.addEventListener("scroll", () => {
  const nav = document.querySelector("nav");

  nav.style.background =
    window.scrollY > 60
      ? "rgba(5,5,8,0.92)"
      : "rgba(5,5,8,0.6)";
});