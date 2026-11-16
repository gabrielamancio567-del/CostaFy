// Catálogo atual: somente faixas sintetizadas (originais, geradas no aparelho).
// REGRA: o campo "id" é ESTÁVEL. Nunca altere ou reutilize um id existente,
// pois as curtidas (e futuramente playlists e histórico) apontam para ele.
// Formato do id: "<provedor>:<identificador>".
export const TRACKS = [
  { id: "synth:mare-alta",         n: "Maré Alta",         a: "Dona Aurora",   b: 92,  r: 57, s: "pm", w: "triangle", h: 195, k: 1, x: 0, d: 3  },
  { id: "synth:por-do-sol",        n: "Pôr do Sol",        a: "Ventos do Sul", b: 104, r: 60, s: "pM", w: "sine",     h: 28,  k: 0, x: 1, d: 7  },
  { id: "synth:rua-das-palmeiras", n: "Rua das Palmeiras", a: "Nina Costa",    b: 118, r: 62, s: "pM", w: "square",   h: 140, k: 1, x: 1, d: 11 },
  { id: "synth:madrugada-azul",    n: "Madrugada Azul",    a: "Lume",          b: 72,  r: 55, s: "pm", w: "sine",     h: 235, k: 0, x: 0, d: 5  },
  { id: "synth:farol",             n: "Farol",             a: "Os Marujos",    b: 126, r: 57, s: "pm", w: "sawtooth", h: 340, k: 1, x: 1, d: 19 },
  { id: "synth:brisa-lenta",       n: "Brisa Lenta",       a: "Tom Costa",     b: 84,  r: 59, s: "pM", w: "triangle", h: 170, k: 0, x: 1, d: 23 }
];
