// Biblioteca do usuário. Etapa 1.1: apenas favoritos, em localStorage, por ID estável.
// Etapa 2 troca o armazenamento por IndexedDB mantendo esta mesma interface.
import { migrateLegacyLikes } from "./migrate.js";

const KEY = "costafy:v2:favorites";
let ids = new Set();

function read() {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || "null");
    return v && Array.isArray(v.ids) ? v.ids.filter(x => typeof x === "string") : [];
  } catch (e) {
    return [];
  }
}

function write() {
  try {
    localStorage.setItem(KEY, JSON.stringify({ v: 1, ids: [...ids] }));
  } catch (e) {
    /* armazenamento indisponível: segue só em memória */
  }
}

export const Library = {
  init() {
    ids = new Set(read());
    const r = migrateLegacyLikes(list => {
      list.forEach(id => ids.add(id));
      write();
    });
    if (r.status === "migrated") console.info("Costafy: curtidas migradas", r);
  },
  favorites: {
    has: id => ids.has(id),
    all: () => [...ids],
    toggle(id) {
      ids.has(id) ? ids.delete(id) : ids.add(id);
      write();
      return ids.has(id);
    }
  }
};
