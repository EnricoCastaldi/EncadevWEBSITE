const statsSection = document.querySelector("#home-stats");
const homeTotals = {
  clients: 50,
  projects: 100,
  development: document.querySelectorAll("#solutions .cards > article").length+8,
  advisory: statsSection.querySelectorAll(".home-advisory > article").length+21
};
const minimumTotals = new Set(["clients", "projects"]);

const homeChart = statsSection.querySelector(".home-stats-chart");
const counters = statsSection.querySelector(".home-stats-counters");
const chartMax = Math.max(1, ...Object.values(homeTotals));
const homeBars = [...homeChart.querySelectorAll("[data-bar]")].map((row) => ({
  total: homeTotals[row.dataset.bar],
  suffix: minimumTotals.has(row.dataset.bar) ? "+" : "",
  value: row.querySelector(".stat-chart-value"),
  bar: row.querySelector(".stat-bar")
}));
const homeMetrics = [...counters.querySelectorAll("[data-stat]")].map((row) => ({
  total: homeTotals[row.dataset.stat],
  suffix: minimumTotals.has(row.dataset.stat) ? "+" : "",
  label: row.querySelector(".stat-total"),
  counter: row.querySelector(".stat-counter")
}));

let formatTotal;
let counterProgress = 1;

function drawChart(progress) {
  for (const entry of homeBars) {
    entry.bar.style.width = (entry.total / chartMax * progress * 100) + "%";
  }
}

function drawCounters(progress) {
  counterProgress = progress;
  for (const metric of homeMetrics) {
    const value = formatTotal.format(Math.round(metric.total * progress));
    metric.counter.textContent = progress === 1 ? value + metric.suffix : value;
  }
}

function refreshHomeTotalsLanguage() {
  formatTotal = new Intl.NumberFormat(document.documentElement.lang);
  for (const entry of homeBars) entry.value.textContent = formatTotal.format(entry.total) + entry.suffix;
  for (const metric of homeMetrics) metric.label.textContent = formatTotal.format(metric.total) + metric.suffix;
  drawCounters(counterProgress);
}

function animateOnScroll(element, draw) {
  if (!("IntersectionObserver" in window) || paused || reducedMotion.matches) return;
  draw(0);
  const observer = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting || entry.intersectionRatio < 0.15) return;
    observer.disconnect();
    if (paused || reducedMotion.matches) {
      draw(1);
      return;
    }

    const startedAt = performance.now();
    function step(time) {
      const linear = paused || reducedMotion.matches ? 1 : Math.min(1, (time - startedAt) / 1350);
      draw(linear * linear * (3 - 2 * linear));
      if (linear < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }, { threshold: 0.15 });
  observer.observe(element);
}

document.addEventListener("languagechange", refreshHomeTotalsLanguage);
refreshHomeTotalsLanguage();
drawChart(1);
animateOnScroll(homeChart, drawChart);
animateOnScroll(counters, drawCounters);


const homeFlow = document.querySelector(".home-flow");
if ("IntersectionObserver" in window) {
  const flowObserver = new IntersectionObserver(([entry]) => {
    homeFlow.classList.toggle("flow-visible", entry.isIntersecting);
  });
  flowObserver.observe(homeFlow.querySelector(".flow-board"));
}
