// Busca local atual: filtra o catálogo por título + artista e devolve os índices.
// Etapa 4: será um provedor dentro do SearchEngine (junto de outras fontes).
export function searchLocal(tracks, query) {
  return tracks
    .map((t, i) => i)
    .filter(i => (tracks[i].n + " " + tracks[i].a).toLowerCase().includes(query));
}
