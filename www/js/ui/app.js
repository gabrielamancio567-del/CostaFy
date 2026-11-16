// Interface: renderização, eventos e laço de animação (mesma aparência e comportamento do original).
import { TRACKS as T } from "../core/catalog.js";
import { fmt } from "../core/format.js";
import { IP, IPA, CK, HEART } from "./icons.js";
import * as Player from "../playback/synthPlayer.js";
import { Library } from "../library/LibraryStore.js";
import { searchLocal } from "../search/localSearch.js";

const $ = s => document.querySelector(s);
let filt = "all", query = "", drag = false;
const liked = i => Library.favorites.has(T[i].id);
const hue = t => 130 + t.h / 12;

function row(t, i) {
  const { cur, started } = Player.getState();
  return `<div class="row${i == cur && started ? " on" : ""}" data-i="${i}"><div class="art" style="--h:${t.h}"></div><div class="m"><b>${t.n}</b><span>${t.a}</span></div><button class="ib" data-l="${i}" aria-label="Curtir ${t.n}">${CK(liked(i))}</button></div>`;
}

function render() {
  const { cur, started } = Player.getState();
  const L = T.map((t, i) => i).filter(i => filt == "all" || liked(i));
  $("#grid").innerHTML = `<button class="tile" data-v="lib"><div class="art lk">${HEART}</div><b>Músicas Curtidas</b></button>` +
    L.map(i => `<button class="tile${i == cur && started ? " on" : ""}" data-i="${i}"><div class="art" style="--h:${T[i].h}"></div><b>${T[i].n}</b></button>`).join("");
  $("#hs").innerHTML = T.map((t, i) => `<button class="card" data-i="${i}"><div class="art" style="--h:${t.h}"></div><b>${t.n}</b><span>${t.a}</span></button>`).join("");
  const s = searchLocal(T, query);
  $("#sl").innerHTML = s.length ? s.map(i => row(T[i], i)).join("") : '<p class="empty">Nenhum resultado. Tente outro nome de música ou artista.</p>';
  const l = T.map((t, i) => i).filter(liked);
  $("#ll").innerHTML = l.length ? l.map(i => row(T[i], i)).join("") : '<p class="empty">Sua biblioteca está vazia. Toque no + de uma música para salvar.</p>';
}

function ui() {
  const { cur, playing, shuf } = Player.getState();
  const t = T[cur], pi = playing ? IPA : IP, lab = playing ? "Pausar" : "Tocar";
  document.documentElement.style.setProperty("--tint", `hsl(${hue(t)} 45% 18%)`);
  ["#mart", "#fart"].forEach(s => $(s).style.setProperty("--h", t.h));
  $("#mt").textContent = t.n; $("#ma").textContent = t.a; $("#ft").textContent = t.n; $("#fa").textContent = t.a; $("#td").textContent = fmt(t.dur);
  ["#mpp", "#fpp"].forEach(s => { $(s).innerHTML = pi; $(s).setAttribute("aria-label", lab) });
  ["#mlk", "#flk"].forEach(s => $(s).innerHTML = CK(liked(cur)));
  $("#sh").classList.toggle("act", shuf); $("#sh").style.color = shuf ? "#1ED760" : "";
  render();
}

function show(v) {
  ["home", "search", "lib"].forEach(x => $("#v-" + x).hidden = x != v);
  document.querySelectorAll("nav button").forEach(b => b.setAttribute("aria-current", b.dataset.v == v));
  scrollTo(0, 0);
}

function like(i) { Library.favorites.toggle(T[i].id); ui(); }

export function mountApp() {
  Player.onChange(ui);

  document.addEventListener("click", e => {
    const l = e.target.closest("[data-l]"); if (l) return like(+l.dataset.l);
    const v = e.target.closest("[data-v]"); if (v) return show(v.dataset.v);
    const c = e.target.closest("[data-f]"); if (c) { filt = c.dataset.f; document.querySelectorAll(".chip").forEach(x => x.setAttribute("aria-pressed", x == c)); return render() }
    const r = e.target.closest("[data-i]"); if (r) return Player.start(+r.dataset.i);
  });
  $("#mini").onclick = e => { if (!e.target.closest("button")) $("#fp").hidden = false };
  $("#fc").onclick = () => $("#fp").hidden = true;
  $("#mpp").onclick = $("#fpp").onclick = Player.toggle;
  $("#mlk").onclick = $("#flk").onclick = () => like(Player.getState().cur);
  $("#nx").onclick = () => Player.go(1);
  $("#pv").onclick = Player.prev;
  $("#sh").onclick = Player.toggleShuffle;
  $("#q").oninput = e => { query = e.target.value.toLowerCase().trim(); render() };
  $("#vo").oninput = e => Player.setVolume(e.target.value / 100);
  $("#sk").addEventListener("input", () => { drag = true });
  $("#sk").addEventListener("change", e => { drag = false; const { started, cur } = Player.getState(); if (started) Player.start(cur, e.target.value / 1000 * T[cur].dur) });

  const cv = $("#cv"), cx = cv.getContext("2d"), buf = new Uint8Array(256);
  function frame() {
    requestAnimationFrame(frame);
    const { cur, started, playing } = Player.getState(), t = T[cur], e = Player.elapsed();
    $("#mpi").style.width = started ? e / t.dur * 100 + "%" : "0";
    if (started && playing && e >= t.dur - .05) Player.go(1);
    if ($("#fp").hidden) return;
    $("#tc").textContent = fmt(e); if (!drag) $("#sk").value = started ? e / t.dur * 1000 : 0;
    cx.clearRect(0, 0, 640, 56); cx.beginPath(); cx.lineWidth = 3; cx.lineCap = "round"; cx.strokeStyle = "#1ED760";
    const an = Player.getAnalyser();
    if (an && playing) an.getByteTimeDomainData(buf); else buf.fill(128);
    for (let i = 0; i < 256; i++) { const x = i / 255 * 640, y = 28 + (buf[i] - 128) / 128 * 26; i ? cx.lineTo(x, y) : cx.moveTo(x, y) }
    cx.stroke();
  }
  ui(); frame();
}
