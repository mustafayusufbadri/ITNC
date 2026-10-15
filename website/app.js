/* Shared helpers for all pages */
const sb = window.supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_KEY);

const ITEMS = [
  { name: "Marriage", icon: "💍" },
  { name: "Own Business", icon: "💼" },
  { name: "Own House", icon: "🏠" },
  { name: "Children", icon: "👶" },
  { name: "Car", icon: "🚗" },
  { name: "Friends", icon: "👥" }
];
const ICONS = Object.fromEntries(ITEMS.map(i => [i.name, i.icon]));

/* Admin login: "ID + password" is mapped to a Supabase email + password. */
const ID_DOMAIN = "@itnc.app";
const authEmail = id => id.trim().toLowerCase() + ID_DOMAIN;
const authPass = pw => pw + "-itnc";

function esc(s) {
  return String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function slugify(s) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40);
}

function randomId() {
  if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
  return "id-" + Date.now() + "-" + Math.random().toString(36).slice(2, 12);
}

/* City slug from /c/<slug>, /live/<slug> or ?c=<slug> */
function getSlug() {
  const parts = location.pathname.split("/").filter(Boolean);
  if (parts.length >= 2 && (parts[0] === "c" || parts[0] === "live")) return decodeURIComponent(parts[1]);
  return new URLSearchParams(location.search).get("c") || "";
}

function cityLinks(slug) {
  return { form: location.origin + "/c/" + slug, live: location.origin + "/live/" + slug };
}

function toast(msg, type) {
  let t = document.getElementById("toast");
  if (!t) {
    t = document.createElement("div");
    t.id = "toast";
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.className = "show " + (type || "");
  clearTimeout(toast._t);
  toast._t = setTimeout(() => { t.className = ""; }, 2600);
}

/* QR drawing (needs qrcode-generator loaded) */
function drawQR(canvas, text, px) {
  const q = qrcode(0, "M");
  q.addData(text);
  q.make();
  const n = q.getModuleCount();
  const margin = 2;
  const cell = Math.max(2, Math.floor(px / (n + margin * 2)));
  const size = cell * (n + margin * 2);
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, size, size);
  ctx.fillStyle = "#683B2B";
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (q.isDark(r, c)) ctx.fillRect((c + margin) * cell, (r + margin) * cell, cell, cell);
    }
  }
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (e) {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try { ok = document.execCommand("copy"); } catch (e2) { ok = false; }
    ta.remove();
    return ok;
  }
}
