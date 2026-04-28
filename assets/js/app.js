/* ════════════════════════════════════════════
   ORION HUB — assets/js/app.js
   ════════════════════════════════════════════ */

// ═══════════════════════════════════════════
//  CONFIG — edit sesuai setup kamu
// ═══════════════════════════════════════════
const GAS_URL    = "https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec";
const SECRET_KEY = "orion_hub_2026_x9A2";

// ═══════════════════════════════════════════
//  DONATE LINKS — ganti dengan link kamu
// ═══════════════════════════════════════════
const DONATE = {
  saweria:  "https://saweria.co/YOUR_USERNAME",
  trakteer: "https://trakteer.id/YOUR_USERNAME",
  paypal:   "https://paypal.me/YOUR_USERNAME",
  ko:       "https://ko-fi.com/YOUR_USERNAME",
};

// Supporters yang muncul di ticker (tambah manual / dari backend)
const SUPPORTERS = [
  { name: "Anonymous", amount: "Rp 10.000" },
  { name: "rizky_dev",  amount: "Rp 25.000" },
  { name: "nightcoder", amount: "$2" },
  { name: "Anonymous", amount: "Rp 15.000" },
  { name: "shadowfan",  amount: "Rp 50.000" },
  { name: "Anonymous", amount: "$5" },
  { name: "devlover99", amount: "Rp 20.000" },
];

// ═══════════════════════════════════════════
//  APP REGISTRY
// ═══════════════════════════════════════════
const APPS = [
  {
    id:        "sonix",
    name:      "Sonix Music",
    icon:      "🎵",
    iconClass: "icon-blue",
    cardClass: "blue",
    desc:      "Sleek music player & downloader. Multi-format, custom playlists, offline playback — 100% free.",
    tags:      ["Music", "Player", "Downloader", "Windows"],
    status:    "live",
    repo:      "sonix",
    downloadUrl: null,
    githubUrl: "https://github.com/ShadowNightDev/Sonix-Music",
    progress:  null,
  },
  {
    id:        "aetherstream",
    name:      "AetherStream",
    icon:      "📡",
    iconClass: "icon-violet",
    cardClass: "violet",
    desc:      "Lightweight streaming utility for seamless media consumption. Built for speed — launching soon.",
    tags:      ["Streaming", "Media", "Utility"],
    status:    "soon",
    repo:      "aetherstream",
    downloadUrl: null,
    githubUrl: "https://github.com/ShadowNightDev/AetherStream",
    progress:  85,
  },
  // Tambah app baru di sini ↓
];

// ═══════════════════════════════════════════
//  STATE
// ═══════════════════════════════════════════
const appData = {};

// ═══════════════════════════════════════════
//  FETCH STATS
// ═══════════════════════════════════════════
async function fetchAllStats() {
  try {
    const url = `${GAS_URL}?key=${SECRET_KEY}&action=stats_all`;
    const res  = await fetch(url);
    const data = await res.json();
    if (data.success && data.repos) {
      Object.assign(appData, data.repos);
      updateCardStats();
      updateGlobalStats();
    }
  } catch (err) {
    console.warn("GAS fetch failed:", err.message);
  }
}

function updateCardStats() {
  APPS.forEach(app => {
    const d = appData[app.repo];
    if (!d || !d.success) return;

    const vEl = document.querySelector(`[data-card="${app.id}"] .meta-version`);
    if (vEl) vEl.textContent = d.version || "";

    const dlEl = document.querySelector(`[data-card="${app.id}"] .meta-downloads`);
    if (dlEl) dlEl.textContent = formatNum(d.downloads) + " downloads";

    const btnEl = document.querySelector(`[data-card="${app.id}"] .btn-dl`);
    if (btnEl && d.downloadUrl) {
      btnEl.disabled = false;
      btnEl.classList.remove("loading");
      btnEl.dataset.url = d.downloadUrl;
      btnEl.innerHTML = `
        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
          <path d="M12 3v13m-5-5 5 5 5-5"/><path d="M3 20h18"/>
        </svg>
        Download ${d.version || ""}
      `;
    }
  });
}

function updateGlobalStats() {
  let totalDl = 0, totalStars = 0;
  Object.values(appData).forEach(d => {
    if (!d.success) return;
    totalDl    += d.downloads || 0;
    totalStars += d.stars     || 0;
  });
  const dlEl = document.getElementById("stat-dl");
  if (dlEl && totalDl > 0) dlEl.textContent = formatNum(totalDl);
  const stEl = document.getElementById("stat-stars");
  if (stEl && totalStars > 0) stEl.textContent = formatNum(totalStars);
}

// ═══════════════════════════════════════════
//  DOWNLOAD
// ═══════════════════════════════════════════
function handleDownload(btn, appId) {
  const app = APPS.find(a => a.id === appId);
  if (!app) return;
  const url = btn?.dataset?.url || app.downloadUrl;
  if (!url) { showToast("Belum tersedia — stay tuned!", "info"); return; }
  showToast(`Starting download ${app.name}…`, "success");
  const a = document.createElement("a");
  a.href = url; a.target = "_blank"; a.rel = "noopener noreferrer";
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
}

// ═══════════════════════════════════════════
//  RENDER APPS
// ═══════════════════════════════════════════
function renderApps() {
  const grid = document.getElementById("apps-grid");
  if (!grid) return;
  grid.innerHTML = "";

  const badgeMap   = { live:"badge-live", soon:"badge-soon", planned:"badge-planned" };
  const badgeLabel = { live:"● Live",     soon:"◐ Coming Soon", planned:"○ Planned" };

  APPS.forEach(app => {
    const card = document.createElement("div");
    card.className = `app-card ${app.cardClass}`;
    card.dataset.card = app.id;

    const tags = app.tags.map(t => `<span class="tag">${t}</span>`).join("");
    const accentDot = app.cardClass === "blue" ? "dot-blue" : app.cardClass === "violet" ? "dot-violet" : "dot-teal";

    const progressBar = (app.status === "soon" && app.progress != null) ? `
      <div class="progress-bar"><div class="progress-fill" style="width:${app.progress}%"></div></div>
      <div class="progress-label">${app.progress}% complete</div>` : "";

    const dlDisabled = app.status !== "live" ? "disabled" : "";
    const dlLabel    = app.status === "live" ? "Download" : app.status === "soon" ? "Coming Soon" : "Planned";

    card.innerHTML = `
      <span class="card-badge ${badgeMap[app.status]}">${badgeLabel[app.status]}</span>
      <div class="card-icon ${app.iconClass}">${app.icon}</div>
      <div class="card-name">${app.name}</div>
      <div class="card-desc">${app.desc}</div>
      <div class="card-meta">
        <span><div class="dot ${accentDot}"></div><span class="meta-version">—</span></span>
        <span class="meta-downloads">—</span>
      </div>
      <div class="card-tags">${tags}</div>
      ${progressBar}
      <div class="card-actions">
        <button class="btn-card btn-dl ${app.status==="live"?"loading":""}" ${dlDisabled} onclick="handleDownload(this,'${app.id}')">
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path d="M12 3v13m-5-5 5 5 5-5"/><path d="M3 20h18"/></svg>
          ${dlLabel}
        </button>
        ${app.githubUrl ? `
          <a class="btn-card btn-secondary-card" href="${app.githubUrl}" target="_blank" rel="noopener">
            <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.483 0-.237-.009-.868-.013-1.703-2.782.604-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.741 0 .269.18.579.688.481C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z"/></svg>
            GitHub
          </a>` : ""}
      </div>
      ${app.status === "planned" ? `<div class="coming-overlay"><span class="coming-text">Planned</span></div>` : ""}
    `;

    card.addEventListener("mousemove", e => {
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", ((e.clientX-r.left)/r.width*100)+"%");
      card.style.setProperty("--my", ((e.clientY-r.top)/r.height*100)+"%");
    });

    grid.appendChild(card);
  });
}

// ═══════════════════════════════════════════
//  RENDER DONATE
// ═══════════════════════════════════════════
function renderDonate() {
  // Wire up donate buttons
  const map = {
    "donate-saweria":  DONATE.saweria,
    "donate-trakteer": DONATE.trakteer,
    "donate-paypal":   DONATE.paypal,
    "donate-ko":       DONATE.ko,
  };
  Object.entries(map).forEach(([id, url]) => {
    const el = document.getElementById(id);
    if (el && url) el.href = url;
  });

  // Render supporters ticker (duplicate for seamless loop)
  const track = document.getElementById("supporters-track");
  if (!track) return;
  const pills = SUPPORTERS.map(s =>
    `<span class="supporter-pill">💛 ${s.name} &nbsp;·&nbsp; ${s.amount}</span>`
  ).join("");
  track.innerHTML = pills + pills; // duplicate for seamless scroll
}

// ═══════════════════════════════════════════
//  TOAST
// ═══════════════════════════════════════════
let _toastTimer;
function showToast(msg, type = "success") {
  const t = document.getElementById("toast");
  const m = document.getElementById("toast-msg");
  t.className = type; m.textContent = msg;
  t.classList.add("show");
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => t.classList.remove("show"), 3200);
}

// ═══════════════════════════════════════════
//  STARS
// ═══════════════════════════════════════════
(function initStars() {
  const c = document.getElementById("star-canvas");
  const ctx = c.getContext("2d");
  let W, H, stars = [];
  function resize() { W = c.width = innerWidth; H = c.height = innerHeight; }
  resize(); window.addEventListener("resize", resize);
  for (let i = 0; i < 180; i++)
    stars.push({ x:Math.random(), y:Math.random(), r:Math.random()*1.3+.2, o:Math.random()*.6+.2, s:Math.random()*.0003+.0001 });
  (function draw() {
    ctx.clearRect(0,0,W,H);
    stars.forEach(s => {
      s.o += s.s*(Math.random()>.5?1:-1); s.o = Math.max(.1,Math.min(.8,s.o));
      ctx.beginPath(); ctx.arc(s.x*W,s.y*H,s.r,0,Math.PI*2);
      ctx.fillStyle = `rgba(200,210,255,${s.o})`; ctx.fill();
    });
    requestAnimationFrame(draw);
  })();
})();

// ═══════════════════════════════════════════
//  CURSOR
// ═══════════════════════════════════════════
(function initCursor() {
  const cursor = document.getElementById("cursor");
  const ring   = document.getElementById("cursor-ring");
  let rx=0,ry=0,mx=0,my=0;
  document.addEventListener("mousemove", e => {
    mx=e.clientX; my=e.clientY;
    cursor.style.left=mx+"px"; cursor.style.top=my+"px";
  });
  (function loop() {
    rx+=(mx-rx)*.12; ry+=(my-ry)*.12;
    ring.style.left=rx+"px"; ring.style.top=ry+"px";
    requestAnimationFrame(loop);
  })();
})();

// ═══════════════════════════════════════════
//  SCROLL REVEAL
// ═══════════════════════════════════════════
function initReveal() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.style.opacity   = "1";
        e.target.style.transform = "translateY(0)";
      }
    });
  }, { threshold: .1 });

  document.querySelectorAll(".app-card, .timeline-item, .stat-num, .donate-card").forEach(el => {
    el.style.opacity    = "0";
    el.style.transform  = "translateY(28px)";
    el.style.transition = "opacity .55s ease, transform .55s ease";
    obs.observe(el);
  });
}

// ═══════════════════════════════════════════
//  HELPERS
// ═══════════════════════════════════════════
function formatNum(n) {
  if (n >= 1000000) return (n/1000000).toFixed(1).replace(/\.0$/,"")+"M";
  if (n >= 1000)    return (n/1000).toFixed(1).replace(/\.0$/,"")+"k";
  return String(n);
}

// ═══════════════════════════════════════════
//  INIT
// ═══════════════════════════════════════════
renderApps();
renderDonate();
initReveal();
fetchAllStats();

// ═══════════════════════════════════════════
//  PROTECTION — Anti Inspect / DevTools
// ═══════════════════════════════════════════
(function protect() {

  // 1. Disable klik kanan
  document.addEventListener("contextmenu", e => e.preventDefault());

  // 2. Disable select teks
  document.addEventListener("selectstart", e => e.preventDefault());

  // 3. Block keyboard shortcuts
  document.addEventListener("keydown", e => {
    const k = e.key.toLowerCase();
    // F12
    if (e.key === "F12") { e.preventDefault(); return false; }
    // Ctrl+Shift+I / Ctrl+Shift+J / Ctrl+Shift+C (DevTools)
    if (e.ctrlKey && e.shiftKey && ["i","j","c"].includes(k)) { e.preventDefault(); return false; }
    // Ctrl+U (View Source)
    if (e.ctrlKey && k === "u") { e.preventDefault(); return false; }
    // Ctrl+S (Save)
    if (e.ctrlKey && k === "s") { e.preventDefault(); return false; }
    // Ctrl+A (Select All)
    if (e.ctrlKey && k === "a") { e.preventDefault(); return false; }
    // Ctrl+P (Print — bisa dipakai buat lihat source)
    if (e.ctrlKey && k === "p") { e.preventDefault(); return false; }
  });

  // 4. Deteksi DevTools terbuka (size threshold trick)
  //    Kalau window outer jauh lebih besar dari inner → devtools mungkin terbuka
  const THRESHOLD = 160;
  let devOpen = false;

  function checkDevTools() {
    const widthDiff  = window.outerWidth  - window.innerWidth;
    const heightDiff = window.outerHeight - window.innerHeight;
    const suspected  = widthDiff > THRESHOLD || heightDiff > THRESHOLD;

    if (suspected && !devOpen) {
      devOpen = true;
      triggerDefense();
    } else if (!suspected && devOpen) {
      devOpen = false;
      clearDefense();
    }
  }

  // 5. debugger loop trick — pause eksekusi kalau devtools terbuka
  //    (hanya aktif kalau suspected terbuka)
  let debugLoop = null;
  function startDebugLoop() {
    debugLoop = setInterval(() => {
      (function() {
        const start = performance.now();
        // eslint-disable-next-line no-debugger
        debugger;
        // Kalau devtools terbuka, debugger akan pause → jeda waktu panjang
        if (performance.now() - start > 100) {
          triggerDefense();
        }
      })();
    }, 1000);
  }
  function stopDebugLoop() {
    if (debugLoop) { clearInterval(debugLoop); debugLoop = null; }
  }

  // 6. Defense action — blur & overlay
  const overlay = document.createElement("div");
  overlay.id = "__guard__";
  Object.assign(overlay.style, {
    display:        "none",
    position:       "fixed",
    inset:          "0",
    zIndex:         "99999",
    background:     "rgba(4,5,10,0.97)",
    backdropFilter: "blur(12px)",
    alignItems:     "center",
    justifyContent: "center",
    flexDirection:  "column",
    gap:            "16px",
    fontFamily:     "'Syne', sans-serif",
    color:          "#e8eaf2",
    textAlign:      "center",
  });
  overlay.innerHTML = `
    <div style="font-size:3rem;filter:drop-shadow(0 0 20px #a259ff)">🔒</div>
    <div style="font-size:1.4rem;font-weight:800;letter-spacing:-.02em">Access Restricted</div>
    <div style="font-size:.9rem;color:#6b7299;max-width:320px;line-height:1.6">
      Developer tools detected.<br>Please close DevTools to continue.
    </div>
  `;
  document.body.appendChild(overlay);

  function triggerDefense() {
    overlay.style.display = "flex";
    document.body.style.filter = "blur(8px)";
    document.body.style.pointerEvents = "none";
    overlay.style.pointerEvents = "all";
    startDebugLoop();
  }

  function clearDefense() {
    overlay.style.display = "none";
    document.body.style.filter = "";
    document.body.style.pointerEvents = "";
    stopDebugLoop();
  }

  // Poll setiap 800ms
  setInterval(checkDevTools, 800);

  // 7. Console warning buat yang iseng buka console
  const _warn = [
    "%cSTOP!",
    "color:#ff5b7a;font-size:48px;font-weight:900;",
  ];
  const _msg = [
    "%cIni adalah fitur browser untuk developer.\nJika seseorang menyuruh kamu paste sesuatu di sini, itu adalah penipuan.",
    "color:#e8eaf2;font-size:14px;",
  ];
  setTimeout(() => {
    console.log(..._warn);
    console.log(..._msg);
  }, 500);

})();
