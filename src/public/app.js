const pages = new Map(
  [...document.querySelectorAll(".view")].map((section) => [section.id, section])
);
const navigation = [...document.querySelectorAll("nav a")];
const viewLabel = document.querySelector("#view-label");
const motion = document.querySelector("#motion");
const motionIcon = document.querySelector("#motion-icon");
const motionText = document.querySelector("#motion-text");
const canvas = document.querySelector("#flow");
const context = canvas.getContext("2d");
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
let paused = reducedMotion.matches;
let activePage;
let animation;
let width = 0;
let height = 0;
let elapsed = 0;
let lastFrame;
const colors = ["#a985ff", "#696cfc", "#ef80c5", "#e3ad63", "#5cb9ee"];

function point(position, lane) {
  const mobile = width < 680;
  const x = position * width;
  const center = mobile ? height * 0.76 : height * 0.51;
  const wave = Math.sin(position * 9.4 - 1.25 + lane * 0.035) * height * 0.109;
  const envelope = Math.sin(position * Math.PI);
  const y = center + wave + (lane - 10) * (5 + 4 * envelope) + position * height * 0.08;
  return [x, y];
}

function paint() {
  if (!context || !width || !height) return;
  context.clearRect(0, 0, width, height);
  for (let lane = 0; lane < 22; lane++) {
    const tint = colors[Math.floor(lane / 2) % colors.length];
    const gradient = context.createLinearGradient(0, 0, width, 0);
    gradient.addColorStop(0, tint + "00");
    gradient.addColorStop(0.29, tint + "05");
    gradient.addColorStop(0.58, tint + "39");
    gradient.addColorStop(0.83, tint + "8a");
    gradient.addColorStop(1, tint + "35");
    context.beginPath();
    for (let step = 0; step <= 90; step++) {
      const [x, y] = point(step / 90, lane);
      if (step === 0) context.moveTo(x, y);
      else context.lineTo(x, y);
    }
    context.strokeStyle = gradient;
    context.lineWidth = lane % 4 === 0 ? 1.5 : 0.65;
    context.stroke();
    if (lane % 2 === 0) {
      const position = ((elapsed * (0.037 + lane * 0.001) + lane * 0.082) % 1);
      const [x, y] = point(position, lane);
      context.beginPath();
      context.fillStyle = tint;
      context.globalAlpha = Math.min(0.9, Math.max(0, (position - 0.36) * 2.5));
      context.shadowColor = tint;
      context.shadowBlur = 9;
      context.arc(x, y, 2, 0, Math.PI * 2);
      context.fill();
      context.globalAlpha = 1;
      context.shadowBlur = 0;
    }
  }
}

function frame(time) {
  const delta = lastFrame === undefined ? 0 : Math.min(time - lastFrame, 50) / 1000;
  elapsed += delta;
  lastFrame = time;
  paint();
  if (delta > 0) advanceCarousel(time, delta);
  animation = requestAnimationFrame(frame);
}

function syncMotion() {
  cancelAnimationFrame(animation);
  lastFrame = undefined;
  motion.hidden = !context;
  document.documentElement.classList.toggle("motion-paused", paused);
  motion.setAttribute("aria-pressed", String(paused));
  motionIcon.textContent = paused ? ">" : "||";
  motionText.textContent = t(paused ? "Play motion" : "Pause motion");
  if (!context) return;
  paint();
  if (!paused && !document.hidden) animation = requestAnimationFrame(frame);
}

function resize() {
  if (!context) return;
  const bounds = canvas.getBoundingClientRect();
  width = bounds.width;
  height = bounds.height;
  if (!width || !height) return;
  const ratio = Math.min(devicePixelRatio || 1, 2);
  canvas.width = Math.round(width * ratio);
  canvas.height = Math.round(height * ratio);
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  paint();
}

function updateViewLabel() {
  viewLabel.textContent = t(activePage[0].toUpperCase() + activePage.slice(1));
}

document.addEventListener("languagechange", () => {
  updateViewLabel();
  syncMotion();
});

const siteHeader = document.querySelector(".top");

function updateHeaderOnScroll() {
  siteHeader.classList.toggle("top-scrolled", window.scrollY > 24);
}

window.addEventListener("scroll", updateHeaderOnScroll, { passive: true });
window.addEventListener("pageshow", updateHeaderOnScroll);

function renderPage() {
  const requestedPage = location.hash.slice(1);
  activePage = pages.has(requestedPage) ? requestedPage : "home";
  for (const [id, section] of pages) section.hidden = id !== activePage;
  for (const link of navigation) {
    if (link.hash === "#" + activePage) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  }
  updateViewLabel();
  updateHeaderOnScroll();
  resize();
  syncMotion();
}

function focusExamples() {
  if (location.hash !== "#home-examples") return false;
  const heading = document.querySelector("#home-examples-title");
  heading.focus({ preventScroll: true });
  heading.closest("section").scrollIntoView({ block: "start" });
  return true;
}

document.querySelector("#scroll-cue").addEventListener("click", () => {
  document.querySelector("#stack-items").focus({ preventScroll: true });
  document.querySelector("#technology-stack").scrollIntoView({
    block: "start",
    behavior: paused ? "instant" : "smooth"
  });
});

motion.addEventListener("click", () => {
  paused = !paused;
  syncMotion();
});
reducedMotion.addEventListener("change", (event) => {
  paused = event.matches;
  syncMotion();
});
document.addEventListener("visibilitychange", syncMotion);
window.addEventListener("hashchange", () => {
  renderPage();
  if (focusExamples()) return;
  window.scrollTo(0, 0);
  const heading = pages.get(activePage).querySelector("h1");
  heading.tabIndex = -1;
  heading.focus({ preventScroll: true });
});
if (context) new ResizeObserver(resize).observe(canvas);
document.querySelector("#year").textContent = new Date().getFullYear();
renderPage();
focusExamples();

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      if (!paused) entry.target.classList.add("reveal-in");
      revealObserver.unobserve(entry.target);
    }
  }, { threshold: 0.15 });

  for (const element of document.querySelectorAll("[data-reveal]")) {
    revealObserver.observe(element);
  }
}

const contactForm = document.querySelector("#contact-form");
const contactFormStatus = document.querySelector("#contact-form-status");

contactForm.addEventListener("submit", (event) => {
  event.preventDefault();
  contactFormStatus.hidden = false;
});
contactForm.addEventListener("input", () => {
  contactFormStatus.hidden = true;
});
contactForm.querySelector('button[type="submit"]').disabled = false;
