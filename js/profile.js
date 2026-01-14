export function initProfile() {
    cargarPreferencias();
    
    const btnGuardar = document.getElementById("btn-guardar-perfil");
    if (btnGuardar) {
        btnGuardar.addEventListener("click", guardarPreferencias);
    }
}

function guardarPreferencias() {
    const nombre = document.getElementById("perfil-nombre").value;
    const talla = document.getElementById("perfil-talla").value;
    const estilo = document.getElementById("perfil-estilo").value;
    const color = document.getElementById("perfil-color").value;

    if (!nombre && !talla && !estilo && !color) {
        alert("Por favor, llena al menos un dato para que VestIA te conozca.");
        return;
    }

    const perfil = { nombre, talla, estilo, color };

    try {
        localStorage.setItem("vestia_perfil", JSON.stringify(perfil));
        console.log("Datos guardados:", perfil);
    } catch (e) {
        console.error("Error guardando en localStorage", e);
        alert("Hubo un error guardando tus datos.");
        return;
    }

    alert("¡Gustos guardados! Ahora VestIA personalizará sus respuestas para ti.");
    
    const botonCerrar = document.querySelector('#modalPerfil .btn-close');
    if (botonCerrar) {
        botonCerrar.click();
    } else {
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

export function getResumenPerfil() {
    const guardado = localStorage.getItem("vestia_perfil");
    
    if (!guardado) {
        return "El usuario es anónimo y no ha definido sus gustos todavía.";
    }

    const p = JSON.parse(guardado);
    return `PERFIL DEL CLIENTE:
    - Nombre: ${p.nombre || "No especificado"}
    - Talla de ropa: ${p.talla || "No especificada"}
    - Estilo favorito: ${p.estilo || "No especificado"}
    - Colores preferidos: ${p.color || "No especificado"}
    
    IMPORTANTE: Usa esta información SIEMPRE para filtrar tus recomendaciones. 
    Si el cliente pide algo y no especifica talla, asume que es la talla ${p.talla}.`;
}