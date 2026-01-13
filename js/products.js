import { addToCart } from "./cart.js";

export let listaGlobalProductos = [];

let productosVista = [];     
let paginaActual = 1;
const productosPorPagina = 18;

let modoFiltrado = false;   

export async function cargarProductos() {
  try {
    const respuesta = await fetch("https://dummyjson.com/products?limit=0");
    const datos = await respuesta.json();

    const categoriasPermitidas = [
      "mens-shirts","mens-shoes","mens-watches","womens-dresses","womens-shoes",
      "womens-watches","womens-bags","womens-jewellery","tops","sunglasses",
      "fragrances","beauty","skin-care",
    ];

    listaGlobalProductos = datos.products.filter((p) =>
      categoriasPermitidas.includes(p.category)
    );


    productosVista = listaGlobalProductos;
    modoFiltrado = false;

    inicializarEventosUI();
    cambiarPagina(1);
  } catch (error) {
    console.error("Error:", error);
  }
}


export function filtrarPorPrecio(min, max) {
    if (min === undefined || max === undefined || isNaN(min) || isNaN(max)) {
        return listaGlobalProductos; 
    }

    return listaGlobalProductos.filter(producto => producto.price <= max);
}


export function setProductosVista(nuevaLista) {
  productosVista = Array.isArray(nuevaLista) ? nuevaLista : [];
  modoFiltrado = true;
  cambiarPagina(1);
}

export function resetProductosVista() {
  productosVista = listaGlobalProductos;
  modoFiltrado = false;
  cambiarPagina(1);
}


function cambiarPagina(pagina) {
  const totalPaginas = modoFiltrado
    ? 1
    : Math.max(1, Math.ceil(productosVista.length / productosPorPagina));

  if (pagina < 1) pagina = 1;
  if (pagina > totalPaginas) pagina = totalPaginas;

  paginaActual = pagina;

  const productosPagina = modoFiltrado
    ? productosVista
    : productosVista.slice(
        (paginaActual - 1) * productosPorPagina,
        (paginaActual - 1) * productosPorPagina + productosPorPagina
      );

  mostrarProductos(productosPagina);
  renderizarBotonesPaginacion(totalPaginas);
}


function mostrarProductos(listaDeProductos) {
  const contenedor = document.getElementById("contenedor-productos");
  contenedor.innerHTML = "";

  if (!listaDeProductos || listaDeProductos.length === 0) {
    contenedor.innerHTML = '<p class="text-center">No encontramos productos.</p>';
    return;
  }

  contenedor.innerHTML = listaDeProductos
    .map(
      (producto) => `
        <div class="col-md-6 col-lg-4">
          <div class="card h-100 shadow-sm">
            <img src="${producto.thumbnail}" class="card-img-top" alt="${producto.title}"
                 style="height: 200px; object-fit: cover;">
            <div class="card-body d-flex flex-column">
              <h6 class="card-title text-truncate" title="${producto.title}">${producto.title}</h6>
              <p class="card-text text-muted small">${producto.category}</p>
              <div class="mt-auto d-flex justify-content-between align-items-center">
                <span class="fw-bold">$${producto.price}</span>
                <button class="btn btn-sm btn-primary btn-agregar" data-id="${producto.id}">
                  Agregar
                </button>
              </div>
            </div>
          </div>
        </div>
      `
    )
    .join("");
}

function renderizarBotonesPaginacion(totalPaginas) {
  const contenedorPaginacion = document.getElementById("paginacion-lista");

  if (modoFiltrado) {
    contenedorPaginacion.innerHTML = `
      <li class="page-item active">
        <button class="page-link" data-page="1">1</button>
      </li>
    `;
    return;
  }

  if (totalPaginas <= 1) {
    contenedorPaginacion.innerHTML = `
      <li class="page-item active">
        <button class="page-link" data-page="1">1</button>
      </li>
    `;
    return;
  }

  const prevDisabled = paginaActual === 1 ? "disabled" : "";
  const nextDisabled = paginaActual === totalPaginas ? "disabled" : "";

  let html = `
    <li class="page-item ${prevDisabled}">
      <button class="page-link" data-page="${paginaActual - 1}">Anterior</button>
    </li>
  `;

  for (let i = 1; i <= totalPaginas; i++) {
    const active = i === paginaActual ? "active" : "";
    html += `
      <li class="page-item ${active}">
        <button class="page-link" data-page="${i}">${i}</button>
      </li>
    `;
  }

  html += `
    <li class="page-item ${nextDisabled}">
      <button class="page-link" data-page="${paginaActual + 1}">Siguiente</button>
    </li>
  `;

  contenedorPaginacion.innerHTML = html;
}

let eventosInicializados = false;

function inicializarEventosUI() {
  if (eventosInicializados) return;
  eventosInicializados = true;

  document.getElementById("paginacion-lista")?.addEventListener("click", (e) => {
    const btn = e.target.closest("button.page-link");
    if (!btn) return;

    const li = btn.closest(".page-item");
    if (li?.classList.contains("disabled")) return;

    const page = parseInt(btn.dataset.page, 10);
    if (Number.isFinite(page)) cambiarPagina(page);
  });

document.getElementById("contenedor-productos")?.addEventListener("click", (e) => {
  const btn = e.target.closest(".btn-agregar");
  if (!btn) return;

  const id = parseInt(btn.dataset.id, 10);
  if (!Number.isFinite(id)) return;

  addToCart(id, 1);
});

}