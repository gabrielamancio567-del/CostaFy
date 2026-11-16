// Ponto de entrada do Costafy (Etapa 1.1).
import { Library } from "./library/LibraryStore.js";
import { mountApp } from "./ui/app.js";

Library.init();   // carrega favoritos e migra curtidas antigas (uma vez)
mountApp();
