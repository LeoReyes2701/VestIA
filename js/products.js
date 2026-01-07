let listaGlobalProductos = [];
let paginaActual = 1;
const productosPorPagina = 20;

async function cargarProductos() {
    try {
        const respuesta = await fetch('https://dummyjson.com/products?limit=0');
        const datos = await respuesta.json();

        const categoriasPermitidas = [
            'mens-shirts',
            'mens-shoes',
            'mens-watches',
            'womens-dresses',
            'womens-shoes',
            'womens-watches',
            'womens-bags',
            'womens-jewellery',
            'tops',
            'sunglasses',
            'fragrances',
            'beauty',
            'skin-care'
        ];

        listaGlobalProductos = datos.products.filter(producto => 
            categoriasPermitidas.includes(producto.category)
        );

        cambiarPagina(1);
        
    } catch (error) {
        console.error("Error:", error);
    }
}

function cambiarPagina(pagina) {
    const totalPaginas = Math.ceil(listaGlobalProductos.length / productosPorPagina);
    
    if (pagina < 1) pagina = 1;
    if (pagina > totalPaginas) pagina = totalPaginas;

    paginaActual = pagina;

    const inicio = (paginaActual - 1) * productosPorPagina;
    const fin = inicio + productosPorPagina;
    
    const productosPagina = listaGlobalProductos.slice(inicio, fin);

    mostrarProductos(productosPagina);
    renderizarBotonesPaginacion(totalPaginas);
}

function mostrarProductos(listaDeProductos) {
    const contenedor = document.getElementById('contenedor-productos');
    contenedor.innerHTML = '';

    if (listaDeProductos.length === 0) {
        contenedor.innerHTML = '<p class="text-center">No encontramos productos.</p>';
        return;
    }

    listaDeProductos.forEach(producto => {
        const tarjetaHtml = `
            <div class="col-md-6 col-lg-4">
                <div class="card h-100 shadow-sm">
                    <img src="${producto.thumbnail}" class="card-img-top" alt="${producto.title}" style="height: 200px; object-fit: cover;">
                    <div class="card-body d-flex flex-column">
                        <h6 class="card-title text-truncate" title="${producto.title}">${producto.title}</h6>
                        <p class="card-text text-muted small">${producto.category}</p>
                        <div class="mt-auto d-flex justify-content-between align-items-center">
                            <span class="fw-bold">$${producto.price}</span>
                            <button class="btn btn-sm btn-primary" onclick="agregarAlCarrito(${producto.id})">Agregar</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        contenedor.innerHTML += tarjetaHtml;
    });
}

function renderizarBotonesPaginacion(totalPaginas) {
    const contenedorPaginacion = document.getElementById('paginacion-lista');
    contenedorPaginacion.innerHTML = '';

    const claseAnterior = paginaActual === 1 ? 'disabled' : '';
    let htmlBotones = `
        <li class="page-item ${claseAnterior}">
            <button class="page-link" onclick="cambiarPagina(${paginaActual - 1})">Anterior</button>
        </li>
    `;

    for (let i = 1; i <= totalPaginas; i++) {
        const claseActiva = i === paginaActual ? 'active' : '';
        htmlBotones += `
            <li class="page-item ${claseActiva}">
                <button class="page-link" onclick="cambiarPagina(${i})">${i}</button>
            </li>
        `;
    }

    const claseSiguiente = paginaActual === totalPaginas ? 'disabled' : '';
    htmlBotones += `
        <li class="page-item ${claseSiguiente}">
            <button class="page-link" onclick="cambiarPagina(${paginaActual + 1})">Siguiente</button>
        </li>
    `;

    contenedorPaginacion.innerHTML = htmlBotones;
}