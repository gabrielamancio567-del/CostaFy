// Migração das curtidas antigas (índices numéricos) para IDs estáveis.
// - Roda uma única vez (marcador DONE_KEY).
// - NÃO apaga a chave antiga: permite voltar ao legacy/costafy.html sem perder dados.
// - É idempotente e nunca lança exceção para fora.

const OLD_KEY = "costafy-likes";
const DONE_KEY = "costafy:migrated:likes-v1";

// Ordem do catálogo na versão ANTIGA (índice -> id). NUNCA altere esta lista.
const LEGACY_INDEX_IDS = Object.freeze([
  "synth:mare-alta",
  "synth:por-do-sol",
  "synth:rua-das-palmeiras",
  "synth:madrugada-azul",
  "synth:farol",
  "synth:brisa-lenta"
]);

// add(listaDeIds) deve incorporar os ids aos favoritos e persistir.
export function migrateLegacyLikes(add) {
  try {
    if (localStorage.getItem(DONE_KEY)) return { status: "already-done" };
    const raw = localStorage.getItem(OLD_KEY);
    let ids = [];
    let ignored = 0;
    if (raw) {
      const arr = JSON.parse(raw);
      if (!Array.isArray(arr)) throw new Error("formato inesperado em " + OLD_KEY);
      const mapped = arr.map(i => (Number.isInteger(i) ? LEGACY_INDEX_IDS[i] : undefined));
      ignored = mapped.filter(x => !x).length;
      ids = [...new Set(mapped.filter(Boolean))];
    }
    if (ids.length) add(ids);
    localStorage.setItem(DONE_KEY, String(Date.now()));
    return { status: "migrated", migrated: ids.length, ignored };
  } catch (e) {
    console.warn("Costafy: migração de curtidas não concluída (tentará de novo na próxima abertura).", e);
    return { status: "error" };
  }
}
