document.addEventListener('DOMContentLoaded', () => {
    const selectCategoria = document.getElementById('filtro-categoria');
    const inputPrecio = document.getElementById('filtro-precio');
    const spanPrecioMaximo = document.getElementById('texto-precio-maximo');
    const btnLimpiar = document.getElementById('boton-limpiar-filtros');

    inputPrecio.addEventListener('input', (e) => {
        spanPrecioMaximo.textContent = `$${e.target.value}`;
    }); //Actualiza el precio (500) de los filtros al deslizar

    function aplicarFiltros() {
        const categoriaSeleccionada = selectCategoria.value;
        const precioMaximo = parseFloat(inputPrecio.value);

        listaFiltrada = listaGlobalProductos.filter(producto => {
            const coincideCategoria = categoriaSeleccionada === "" || producto.category === categoriaSeleccionada;
            const coincidePrecio = producto.price <= precioMaximo;
            return coincideCategoria && coincidePrecio;
        });

        cambiarPagina(1);
    }

    selectCategoria.addEventListener('change', aplicarFiltros);
    inputPrecio.addEventListener('change', aplicarFiltros);

    btnLimpiar.addEventListener('click', () => {
        selectCategoria.value = "";
        inputPrecio.value = 500;
        spanPrecioMaximo.textContent = "$500";

        aplicarFiltros();
    });
});