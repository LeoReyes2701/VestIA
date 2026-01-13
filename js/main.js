import { cargarProductos, listaGlobalProductos } from "./products.js";
import { initCartUI } from "./cart.js";
import { initFilters } from "./filters.js";

document.addEventListener("DOMContentLoaded", async () => {
  await cargarProductos();               
  initCartUI(() => listaGlobalProductos); 
    initFilters();
});
