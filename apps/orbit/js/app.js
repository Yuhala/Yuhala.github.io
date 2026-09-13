import { PLANETS, SUN, getBody } from "./data.js";
import { startStarfield } from "./stars.js";

const systemEl = document.getElementById("system");
const systemStage = document.getElementById("system-stage");
const localSystem = document.getElementById("local-system");
const planetStage = document.getElementById("planet-stage");
const viewSystem = document.getElementById("view-system");
const viewPlanet = document.getElementById("view-planet");
const dossier = document.getElementById("dossier");
const pauseBtn = document.getElementById("pause-btn");
const speedInput = document.getElementById("speed");
const eyebrow = document.getElementById("eyebrow");
const hint = document.getElementById("hint");

const state = {
  paused: false,
  speed: 1,
  selected: null,
  localSelected: null,
  startedAt: performance.now(),
  pausedAt: 0,
  elapsed: 0,
};

function formatNumber(n) {
  return n.toLocaleString("en-US");
}

function discoveredRow(body) {
  return body.discovered && body.discovered !== "—"
    ? [["Known since", body.discovered]]
    : [];
}

function statsFor(body, extras = []) {
  return [
    ["Diameter", `${formatNumber(body.diameterKm)} km`],
    ["Mass", body.mass],
    ["Day", body.dayLength],
    ["Year", body.year],
    ["Distance", body.distance],
    ["Gravity", body.gravity],
    ["Temperature", body.temperature],
    ["Moons", String(body.moons ?? body.satellites?.length ?? 0)],
    ...extras,
  ];
}

function renderStats(el, rows) {
  el.innerHTML = rows
    .map(
      ([label, value]) =>
        `<div><dt>${label}</dt><dd>${value}</dd></div>`,
    )
    .join("");
}

function paintWorld(el, body) {
  el.style.width = `${body.size}px`;
  el.style.height = `${body.size}px`;
  el.style.backgroundColor = body.color ?? "#4a4038";

  const light =
    body.id === "sun"
      ? "radial-gradient(circle at 32% 30%, rgba(255, 246, 200, 0.28), transparent 55%)"
      : "linear-gradient(var(--light, 210deg), transparent 36%, rgba(5, 3, 12, 0.55) 82%)";
  const fallback =
    body.surface ??
    `radial-gradient(circle at 32% 30%, ${body.accent ?? "#fff"} 0 8%, ${body.color} 42%, #1a120c 100%)`;

  const apply = (base) => {
    el.style.backgroundImage = `${light}, ${base}`;
    el.style.backgroundSize = "cover, cover";
    el.style.backgroundPosition = "center, center";
  };

  if (body.texture) {
    apply(`url("${body.texture}")`);
    const probe = new Image();
    probe.onerror = () => apply(fallback);
    probe.src = body.texture;
    return;
  }
  apply(fallback);
}

function createWorldButton(body, className) {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = `world ${className}`;
  btn.dataset.id = body.id;
  btn.setAttribute("aria-label", body.name);
  paintWorld(btn, body);

  if (body.hasRings) {
    const rings = document.createElement("span");
    rings.className = `rings${body.ringTilt ? " ice" : ""}`;
    rings.style.borderColor = body.ringColor;
    btn.append(rings);
    if (!body.ringTilt) {
      const inner = document.createElement("span");
      inner.className = "rings inner";
      btn.append(inner);
    }
  }

  const label = document.createElement("span");
  label.className = "world-label";
  label.textContent = body.name;
  btn.append(label);
  return btn;
}

function buildAsteroids() {
  const belt = document.createElement("div");
  belt.className = "asteroid-belt";
  const radius = 292;
  for (let i = 0; i < 90; i += 1) {
    const rock = document.createElement("span");
    rock.className = "asteroid";
    const angle = (Math.PI * 2 * i) / 90 + Math.random() * 0.08;
    const r = radius + (Math.random() - 0.5) * 28;
    rock.style.left = `${Math.cos(angle) * r}px`;
    rock.style.top = `${Math.sin(angle) * r}px`;
    rock.style.width = `${1.5 + Math.random() * 2}px`;
    rock.style.height = rock.style.width;
    rock.style.opacity = String(0.28 + Math.random() * 0.5);
    belt.append(rock);
  }
  return belt;
}

function buildSystem() {
  systemEl.innerHTML = "";
  for (const planet of PLANETS) {
    const ring = document.createElement("div");
    ring.className = `orbit-ring${planet.dwarf ? " dwarf" : ""}`;
    ring.style.width = `${planet.orbitRadius * 2}px`;
    ring.style.height = `${planet.orbitRadius * 2}px`;
    systemEl.append(ring);
  }
  systemEl.append(buildAsteroids());

  const sunBtn = createWorldButton({ ...SUN, size: 120, accent: "#fff6c8", color: "#ff9a2e" }, "sun");
  systemEl.append(sunBtn);

  for (const planet of PLANETS) {
    systemEl.append(createWorldButton(planet, "planet"));
  }

  systemEl.addEventListener("click", (event) => {
    const btn = event.target.closest(".world");
    if (!btn) return;
    openDossier(btn.dataset.id);
  });
}

function fitSystem(stage, root, span) {
  const rect = stage.getBoundingClientRect();
  const scale = Math.min(rect.width, rect.height) / (span * 2 + 48);
  root.style.transform = `scale(${Math.max(scale, 0.18)})`;
}

function angleFor(period, offset = 0) {
  const seconds = state.elapsed / 1000;
  return (seconds / period) * Math.PI * 2 * state.speed + offset;
}

function place(el, radius, period, offset = 0) {
  const angle = angleFor(period, offset);
  const x = Math.cos(angle) * radius;
  const y = Math.sin(angle) * radius;
  el.style.left = `${x}px`;
  el.style.top = `${y}px`;
  el.style.setProperty("--light", `${(angle * 180) / Math.PI + 180}deg`);
}

function tick(now) {
  if (!state.paused) {
    state.elapsed = now - state.startedAt;
  }

  if (!viewSystem.hidden) {
    for (const planet of PLANETS) {
      const el = systemEl.querySelector(`[data-id="${planet.id}"]`);
        if (el) place(el, planet.orbitRadius, planet.period, planet.phase);
    }
  }

  if (!viewPlanet.hidden) {
    const planet = getBody(location.hash.replace("#/planet/", ""));
    if (planet?.satellites) {
      planet.satellites.forEach((moon, index) => {
        const el = localSystem.querySelector(`[data-id="${moon.id}"]`);
        if (el) place(el, moon.orbitRadius, moon.period, index * 0.7);
      });
    }
  }

  requestAnimationFrame(tick);
}

function openDossier(id) {
  const body = getBody(id);
  if (!body) return;
  state.selected = id;
  systemEl.querySelectorAll(".world").forEach((el) => {
    el.classList.toggle("is-selected", el.dataset.id === id);
  });

  document.getElementById("dossier-kicker").textContent = body.type;
  document.getElementById("dossier-title").textContent = body.name;
  document.getElementById("dossier-tag").textContent = body.tagline;
  document.getElementById("dossier-copy").textContent = body.description;
  renderStats(document.getElementById("dossier-stats"), statsFor(body, discoveredRow(body)));
  document.getElementById("dossier-facts").innerHTML = body.facts
    .map((fact) => `<li>${fact}</li>`)
    .join("");

  const cta = document.getElementById("dossier-cta");
  if (id === "sun") {
    cta.hidden = true;
  } else {
    cta.hidden = false;
    cta.href = `#/planet/${id}`;
    cta.textContent = body.satellites?.length
      ? `Explore ${body.name} and its moons`
      : `Visit ${body.name}`;
  }

  dossier.hidden = false;
  viewSystem.classList.add("is-open");
  fitSystem(systemStage, systemEl, 620);
}

function closeDossier() {
  state.selected = null;
  dossier.hidden = true;
  viewSystem.classList.remove("is-open");
  systemEl.querySelectorAll(".world").forEach((el) => el.classList.remove("is-selected"));
  fitSystem(systemStage, systemEl, 620);
}

function selectMoon(moon, planet) {
  state.localSelected = moon.id;
  document.getElementById("moon-kicker").textContent = `Moon of ${planet.name}`;
  document.getElementById("moon-title").textContent = moon.name;
  document.getElementById("moon-copy").textContent = `${moon.note} Diameter ${formatNumber(moon.diameterKm)} km · discovered ${moon.discovered}.`;
  document.getElementById("moon-note").hidden = false;
  localSystem.querySelectorAll(".world").forEach((el) => {
    el.classList.toggle("is-selected", el.dataset.id === moon.id);
  });
  document.querySelectorAll(".moon-card").forEach((card) => {
    card.classList.toggle("is-active", card.dataset.id === moon.id);
  });
}

function renderPlanetPage(id) {
  const planet = getBody(id);
  if (!planet || planet.id === "sun") {
    location.hash = "#/";
    return;
  }

  document.title = `Orbit — ${planet.name}`;
  eyebrow.textContent = planet.name;
  hint.textContent = planet.satellites.length
    ? "Click a moon — in the sky or in the list — to learn its story."
    : `${planet.name} has no known natural satellites.`;

  document.getElementById("planet-kicker").textContent = planet.type;
  document.getElementById("planet-title").textContent = planet.name;
  document.getElementById("planet-tag").textContent = planet.tagline;
  document.getElementById("planet-copy").textContent = planet.description;
  renderStats(
    document.getElementById("planet-stats"),
    statsFor(planet, discoveredRow(planet)),
  );

  const cards = document.getElementById("moon-cards");
  if (!planet.satellites.length) {
    cards.innerHTML = `<p class="empty-moons">No moons keep company with ${planet.name}.</p>`;
  } else {
    cards.innerHTML = planet.satellites
      .map(
        (moon) => `
          <button type="button" class="moon-card" data-id="${moon.id}">
            <strong>${moon.name}</strong>
            <span>${formatNumber(moon.diameterKm)} km · found ${moon.discovered}</span>
          </button>
        `,
      )
      .join("");
    cards.querySelectorAll(".moon-card").forEach((card) => {
      card.addEventListener("click", () => {
        const moon = planet.satellites.find((item) => item.id === card.dataset.id);
        if (moon) selectMoon(moon, planet);
      });
    });
  }

  localSystem.innerHTML = "";
  for (const moon of planet.satellites) {
    const ring = document.createElement("div");
    ring.className = "orbit-ring";
    ring.style.width = `${moon.orbitRadius * 2}px`;
    ring.style.height = `${moon.orbitRadius * 2}px`;
    localSystem.append(ring);
  }

  const host = createWorldButton(
    { ...planet, size: Math.min(Math.max(planet.size * 2.15, 96), 168) },
    "planet host",
  );
  host.style.left = "0px";
  host.style.top = "0px";
  localSystem.append(host);

  for (const moon of planet.satellites) {
    localSystem.append(createWorldButton(moon, "moon"));
  }

  localSystem.onclick = (event) => {
    const btn = event.target.closest(".moon");
    if (!btn) return;
    const moon = planet.satellites.find((item) => item.id === btn.dataset.id);
    if (moon) selectMoon(moon, planet);
  };

  if (planet.satellites[0]) selectMoon(planet.satellites[0], planet);
  else document.getElementById("moon-note").hidden = true;

  fitSystem(planetStage, localSystem, 230);
}

function showSystem() {
  viewPlanet.hidden = true;
  viewSystem.hidden = false;
  document.title = "Orbit — The Solar System";
  eyebrow.textContent = "The Solar System";
  hint.textContent = "Click a world to open its dossier. Maps are NASA public-domain textures.";
  fitSystem(systemStage, systemEl, 620);
}

function route() {
  const hash = location.hash || "#/";
  const match = hash.match(/^#\/planet\/([a-z]+)/);
  if (match) {
    viewSystem.hidden = true;
    viewPlanet.hidden = false;
    renderPlanetPage(match[1]);
    return;
  }
  showSystem();
}

pauseBtn.addEventListener("click", () => {
  state.paused = !state.paused;
  if (state.paused) {
    state.pausedAt = performance.now();
  } else {
    state.startedAt += performance.now() - state.pausedAt;
  }
  pauseBtn.textContent = state.paused ? "Resume" : "Pause";
  pauseBtn.setAttribute("aria-pressed", String(state.paused));
});

speedInput.addEventListener("input", () => {
  state.speed = Number(speedInput.value);
});

document.getElementById("close-dossier").addEventListener("click", closeDossier);

systemStage.addEventListener("click", (event) => {
  if (!event.target.closest(".world")) closeDossier();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeDossier();
});

window.addEventListener("hashchange", route);
window.addEventListener("resize", () => {
  if (!viewSystem.hidden) fitSystem(systemStage, systemEl, 620);
  if (!viewPlanet.hidden) fitSystem(planetStage, localSystem, 230);
});

startStarfield(document.getElementById("stars"));
buildSystem();
route();
const selected = new URLSearchParams(location.search).get("select");
if (selected && viewPlanet.hidden) openDossier(selected);
requestAnimationFrame(tick);
