import {
  listaGlobalProductos,
  setProductosVista,
  resetProductosVista
} from "./products.js";

export function initFilters() {
  const selectCategoria = document.getElementById("filtro-categoria");
  const inputPrecio = document.getElementById("filtro-precio");
  const btnLimpiar = document.getElementById("boton-limpiar-filtros");

  if (!selectCategoria || !inputPrecio) return;

  selectCategoria.addEventListener("change", aplicarFiltros);
  inputPrecio.addEventListener("input", aplicarFiltros);

  btnLimpiar?.addEventListener("click", () => {
    selectCategoria.value = "";
    inputPrecio.value = "";
    localStorage.removeItem("filtro-precio");
    resetProductosVista();
  });

  // restaurar precio guardado (si existe)
  const guardado = localStorage.getItem("filtro-precio");
  if (guardado !== null && guardado !== "" && Number.isFinite(Number(guardado))) {
    inputPrecio.value = guardado;
  }

  aplicarFiltros();

  function aplicarFiltros() {
    const categoria = selectCategoria.value;     // "" => todas
    const precioMax = parseFloat(inputPrecio.value);
    const precioValido = Number.isFinite(precioMax) ? precioMax : Infinity;

    if (precioValido === Infinity) localStorage.removeItem("filtro-precio");
    else localStorage.setItem("filtro-precio", String(precioValido));

    let result = listaGlobalProductos;

    if (categoria) {
      result = result.filter(p => p.category === categoria);
    }

    result = result.filter(p => p.price <= precioValido);

    const sinCategoria = !categoria;
    const sinPrecio = precioValido === Infinity;

    if (sinCategoria && sinPrecio) resetProductosVista();
    else setProductosVista(result);
  }
}