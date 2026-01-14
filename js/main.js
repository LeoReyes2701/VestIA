import { cargarProductos, listaGlobalProductos } from "./products.js";
import { initCartUI } from "./cart.js";
import { initFilters } from "./filters.js";
import { initChatbot } from "./chatbot.js";
import { initProfile } from "./profile.js";

document.addEventListener("DOMContentLoaded", async () => {
  await cargarProductos();               
  initCartUI(() => listaGlobalProductos); 
  initFilters();
  initChatbot();
  initProfile();
});