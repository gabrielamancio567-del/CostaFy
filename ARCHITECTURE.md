# Costafy — Arquitetura e plano técnico

Estado: **Etapa 1.1 concluída** (modularização sem mudança de aparência ou comportamento).
Próxima etapa só começa com autorização explícita.

## 1. Objetivo

Evoluir o Costafy (player de música em HTML) para um app Android híbrido (Capacitor),
com três módulos próprios: **Music Search Engine**, **Playback Engine** e **Music Library**.

Princípios: sem dependências desnecessárias; sem extração não autorizada de áudio;
sem APIs fictícias; preservar o que já funciona.

## 2. Referências e licenças

| Projeto | Licença | O que é |
|---|---|---|
| InnerTune (z-huang) | GPL-3.0 | Cliente Android nativo (Kotlin) do YouTube Music |
| InterTune (ItzSkyeYT) | GPL-3.0 | Fork do OuterTune (que veio do InnerTune); inclui suporte a arquivos locais |

- Ambos têm como núcleo a API privada do YouTube Music (InnerTube) e a obtenção de streams
  a partir dela. O InterTune documenta contornar uma exigência de verificação do YouTube
  para manter a reprodução. Isso é **extração não autorizada** e **não será usado**.
- Código GPL-3.0 copiado obrigaria o Costafy a ser GPL-3.0. Por isso eles servem **só como
  inspiração de funcionalidades** (busca, fila, biblioteca, arquivos locais, serviço de mídia
  em segundo plano). Todo código do Costafy é escrito do zero.

## 3. Diagnóstico do HTML original (resumo)

- Player acoplado ao sintetizador Web Audio; não toca arquivo nem URL.
- Faixas em array fixo; curtidas salvas por índice (frágil) -> corrigido na Etapa 1.1 com IDs estáveis.
- Sem fila real, playlists ou histórico; persistência só em localStorage.
- Busca apenas filtra a lista local.
- Visualizador (`AnalyserNode`) fica mudo com áudio remoto sem CORS.
- Fonte do Google exige internet (há fallback do sistema).

## 4. Estrutura do repositório

```
index.html                 redireciona para www/ (necessário para o GitHub Pages)
ARCHITECTURE.md
legacy/costafy.html        backup integral do original (não editar)
www/                       app (futuro webDir do Capacitor)
  index.html
  css/app.css
  js/
    main.js                ponto de entrada
    core/       catalog.js (faixas e IDs estáveis), format.js
    library/    LibraryStore.js, migrate.js
    playback/   synthPlayer.js (motor atual, lógica inalterada)
    search/     localSearch.js (busca local atual)
    ui/         app.js (telas/eventos), icons.js
```

Sem bundler: ES modules nativos. Exige servidor HTTP(S) (GitHub Pages serve);
abrir por `file://` não funciona.

## 5. Contratos (alvo das próximas etapas)

**Track** (modelo único):
`{ id: "provedor:id", title, artists[], album?, durationMs, artworkUrl?, source: { provider, kind: "full"|"preview"|"local"|"synth" }, license?, attribution?, externalUrl? }`

**SearchProvider**:
`{ id, capabilities: { tracks, artists, albums, playlists, fullTracks }, search(query, { type, limit, offset, signal }) -> { items, next? }, getStream?(track) }`

**PlaybackSource** (Etapa 3): `load(track) | play() | pause() | seek(s) | currentTime | duration | on(evento)`.
Implementações: sintetizador (atual), `<audio>` (locais/URLs) e, depois, ponte para Media3.

**Library** (Etapa 2, IndexedDB): `tracks`, `favorites`, `playlists`, `playlist_items`, `history`, `local_files`.
Interface já existente: `Library.favorites.has/toggle/all`.

## 6. Migração das curtidas (feita na Etapa 1.1)

- Chave antiga `costafy-likes` (índices) -> nova `costafy:v2:favorites` (`{v:1, ids:[...]}`).
- Roda uma vez (`costafy:migrated:likes-v1`), faz união com favoritos já existentes,
  ignora índices inválidos e **não apaga** a chave antiga (permite voltar ao `legacy/`).
- A tabela índice -> id em `migrate.js` é congelada. Nunca alterar.
- O armazenamento é por origem: curtidas feitas em outro endereço (ex.: a página
  publicada no claude.ai) não aparecem no GitHub Pages.

## 7. Limitações e dependências reais

- Capacitor Android exige Node.js, JDK e Android SDK. Não roda no celular de forma prática:
  compilar via GitHub Actions (Etapa 5) ou computador.
- Chamadas HTTP a APIs de terceiros costumam esbarrar em CORS no navegador; no app usar o
  `CapacitorHttp` (HTTP nativo). Não existe plugin oficial do Capacitor para o Media3:
  segundo plano exige plugin nativo próprio ou avaliação de plugins da comunidade.
- Arquivos locais: seletor de arquivos do navegador/WebView; cópia no armazenamento do app
  (usa espaço); acesso nativo por SAF só depois. Leitura de tags (ID3) exigirá avaliar uma
  biblioteca e sua licença.
- Fontes candidatas (ler os termos de cada uma antes de usar): Jamendo (músicas completas de
  independentes, exige client_id gratuito), iTunes Search e Deezer (prévias de 30 s),
  MusicBrainz + Cover Art Archive (metadados e capas; User-Agent próprio e limite de ~1 req/s),
  Internet Archive (licença varia por item). Chaves dentro do APK podem ser extraídas.
- Catálogo popular completo não é possível sem licenciamento; só prévias.
- Visualizador só funciona com áudio sintetizado/local (CORS).

## 8. Etapas

| Etapa | Entrega | Status |
|---|---|---|
| 0 | Repositório e GitHub Pages | feita pelo usuário |
| 1.1 | Modularização + migração de curtidas + ARCHITECTURE.md | **concluída** |
| 2 | Library: IndexedDB, playlists, histórico | pendente (requer autorização) |
| 3 | PlaybackEngine: fila e arquivos locais (`<audio>`) | pendente |
| 4 | SearchEngine + provedores reais | pendente |
| 5 | Capacitor + build do APK via GitHub Actions | pendente |
| 6 | Segundo plano (Media3) e Media Session | pendente |

## 9. Trabalhar pelo celular

- Editar: app/site do GitHub; `github.dev` (trocar `github.com` por `github.dev`) abre editor no navegador.
- Testar UI/biblioteca: GitHub Pages (`https://USUARIO.github.io/costafy/`).
- Provedores externos: só no APK (Etapa 5).
- Compilar APK: GitHub Actions; baixar o `.apk` pelo celular.
