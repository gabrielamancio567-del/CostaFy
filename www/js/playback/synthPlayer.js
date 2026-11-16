// Motor de reprodução ATUAL (sintetizador Web Audio), movido do HTML original
// sem alterar a lógica. Etapa 3 vai generalizá-lo em PlaybackEngine + fontes.
// Obs.: ao carregar, calcula melodia/duração e as grava nos objetos do catálogo.
import { TRACKS as T } from "../core/catalog.js";

function mul(a) { return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296 } }
const SC = { pm: [0, 3, 5, 7, 10], pM: [0, 2, 4, 7, 9] }, PR = { pm: [0, 5, 3, 7], pM: [0, 9, 4, 7] };
T.forEach(t => { const sc = SC[t.s], ex = [...sc, ...sc.map(x => x + 12), 24], r = mul(t.d); let i = 5; t.m = []; for (let k = 0; k < 64; k++) { i = Math.max(0, Math.min(ex.length - 1, i + Math.floor(r() * 5) - 2)); t.m.push(r() < .35 ? null : ex[i]) } t.sd = 30 / t.b; t.steps = Math.round(88 / t.sd / 16) * 16; t.dur = t.steps * t.sd });

let ctx, master, an, bus, nb, cur = 0, started = false, playing = false, step = 0, base = 0, t0 = 0, nt = 0, shuf = false, volume = .7, listener = () => {};
const f = m => 440 * Math.pow(2, (m - 69) / 12);

export const onChange = fn => { listener = fn };
export const getState = () => ({ cur, started, playing, shuf });
export const getAnalyser = () => an;
export const setVolume = p => { volume = p; if (master) master.gain.value = p };
export const elapsed = () => started ? Math.min(T[cur].dur, Math.max(0, base + ctx.currentTime - t0)) : 0;

function init() {
  if (ctx) return;
  ctx = new (window.AudioContext || window.webkitAudioContext)();
  master = ctx.createGain(); master.gain.value = volume;
  an = ctx.createAnalyser(); an.fftSize = 512;
  master.connect(an); an.connect(ctx.destination);
  nb = ctx.createBuffer(1, ctx.sampleRate * .1, ctx.sampleRate);
  const d = nb.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  setInterval(tick, 60);
}
function tone(fr, t, d, type, v) { const o = ctx.createOscillator(), g = ctx.createGain(); o.type = type; o.frequency.value = fr; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + .012); g.gain.exponentialRampToValueAtTime(.0001, t + d); o.connect(g); g.connect(bus); o.start(t); o.stop(t + d + .05) }
function kick(t) { const o = ctx.createOscillator(), g = ctx.createGain(); o.frequency.setValueAtTime(130, t); o.frequency.exponentialRampToValueAtTime(40, t + .12); g.gain.setValueAtTime(.5, t); g.gain.exponentialRampToValueAtTime(.001, t + .18); o.connect(g); g.connect(bus); o.start(t); o.stop(t + .2) }
function hat(t) { const s = ctx.createBufferSource(), h = ctx.createBiquadFilter(), g = ctx.createGain(); s.buffer = nb; h.type = "highpass"; h.frequency.value = 7000; g.gain.setValueAtTime(.08, t); g.gain.exponentialRampToValueAtTime(.001, t + .05); s.connect(h); h.connect(g); g.connect(bus); s.start(t); s.stop(t + .06) }
function tick() { if (!playing) return; const t = T[cur]; while (nt < ctx.currentTime + .3 && step < t.steps) { const s = step, m = t.m[s % 64]; if (m != null) tone(f(t.r + 12 + m), nt, t.sd * 1.8, t.w, t.w == "sine" ? .22 : .1); if (s % 2 == 0) tone(f(t.r - 12 + PR[t.s][(s >> 4) % 4]), nt, t.sd * 3.5, "sine", .32); if (t.k && s % 4 == 0) kick(nt); if (t.x && s % 2 == 1) hat(nt); nt += t.sd; step++ } }

export function start(i, at = 0) {
  init(); cur = i; started = true; const t = T[i];
  step = Math.round(at / t.sd); base = step * t.sd;
  if (bus) { const b = bus; b.gain.setTargetAtTime(0, ctx.currentTime, .02); setTimeout(() => b.disconnect(), 400) }
  bus = ctx.createGain(); bus.connect(master);
  nt = ctx.currentTime + .06; t0 = nt; playing = true; ctx.resume(); listener();
}
export function toggle() {
  if (!started) return start(cur);
  if (playing) { ctx.suspend(); playing = false } else { ctx.resume(); playing = true }
  listener();
}
export function go(d) {
  let n;
  if (shuf && T.length > 1) { do { n = Math.floor(Math.random() * T.length) } while (n == cur) }
  else n = (cur + d + T.length) % T.length;
  start(n);
}
export function prev() { if (started && elapsed() > 3) start(cur); else go(-1) }
export function toggleShuffle() { shuf = !shuf; listener() }
