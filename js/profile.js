// js/profile.js

export function initProfile() {
    // 1. Cargar datos al abrir la página
    cargarPreferencias();
    
    // 2. Escuchar el clic en el botón guardar
    const btnGuardar = document.getElementById("btn-guardar-perfil");
    if (btnGuardar) {
        btnGuardar.addEventListener("click", guardarPreferencias);
    }
}

function guardarPreferencias() {
    // A. Capturar los valores del formulario
    const nombre = document.getElementById("perfil-nombre").value;
    const talla = document.getElementById("perfil-talla").value;
    const estilo = document.getElementById("perfil-estilo").value;
    const color = document.getElementById("perfil-color").value;

    // Validación simple: Si todo está vacío, no guardar nada
    if (!nombre && !talla && !estilo && !color) {
        alert("Por favor, llena al menos un dato para que VestIA te conozca.");
        return;
    }

    const perfil = { nombre, talla, estilo, color };

    // B. Guardar en el navegador (LocalStorage)
    try {
        localStorage.setItem("vestia_perfil", JSON.stringify(perfil));
        console.log("Datos guardados:", perfil); // Para depurar en consola
    } catch (e) {
        console.error("Error guardando en localStorage", e);
        alert("Hubo un error guardando tus datos.");
        return;
    }
    
    // C. Feedback al usuario
    alert("¡Gustos guardados! Ahora VestIA personalizará sus respuestas para ti.");
    
    // D. CERRAR EL MODAL (Truco infalible)
    // Buscamos el botón de cerrar (la X) dentro del modal y le hacemos clic automáticamente
    const botonCerrar = document.querySelector('#modalPerfil .btn-close');
    if (botonCerrar) {
        botonCerrar.click();
    } else {
        // Plan B: Si no encuentra la X, forzamos remover la clase y el fondo oscuro
        const modal = document.getElementById('modalPerfil');
        modal.classList.remove('show');
        modal.style.display = 'none';
        document.body.classList.remove('modal-open');
        const backdrop = document.querySelector('.modal-backdrop');
        if (backdrop) backdrop.remove();
    }
}

function cargarPreferencias() {
    const guardado = localStorage.getItem("vestia_perfil");
    if (guardado) {
        try {
            const perfil = JSON.parse(guardado);
            if(perfil.nombre) document.getElementById("perfil-nombre").value = perfil.nombre;
            if(perfil.talla) document.getElementById("perfil-talla").value = perfil.talla;
            if(perfil.estilo) document.getElementById("perfil-estilo").value = perfil.estilo;
            if(perfil.color) document.getElementById("perfil-color").value = perfil.color;
        } catch (e) {
            console.error("Error cargando perfil", e);
        }
    }
}

// Esta función la usa el CHATBOT para leer los datos cada vez que hablas
export function getResumenPerfil() {
    const guardado = localStorage.getItem("vestia_perfil");
    
    if (!guardado) {
        return "El usuario es anónimo y no ha definido sus gustos todavía.";
    }

    const p = JSON.parse(guardado);
    // Construimos un texto claro para que la IA lo entienda
    return `PERFIL DEL CLIENTE:
    - Nombre: ${p.nombre || "No especificado"}
    - Talla de ropa: ${p.talla || "No especificada"}
    - Estilo favorito: ${p.estilo || "No especificado"}
    - Colores preferidos: ${p.color || "No especificado"}
    
    IMPORTANTE: Usa esta información SIEMPRE para filtrar tus recomendaciones. 
    Si el cliente pide algo y no especifica talla, asume que es la talla ${p.talla}.`;
}