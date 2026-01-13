import { API_KEY, API_URL } from "./config.js";
import { listaGlobalProductos, setProductosVista } from "./products.js";

const chatBody = document.getElementById("cuerpo-chat");
const inputChat = document.getElementById("entrada-chat");
const btnEnviar = document.getElementById("boton-enviar");
const inputFoto = document.getElementById("adjuntar-foto");
const previewZona = document.getElementById("previsualizacion-imagen");

let imagenBase64 = null; 
let historialChat = [];  

export function initChatbot() {
    if (!btnEnviar) return;
    btnEnviar.addEventListener("click", enviarMensaje);
    inputChat.addEventListener("keypress", (e) => {
        if (e.key === "Enter") enviarMensaje();
    });

    inputFoto.addEventListener("change", procesarImagen);
    setTimeout(() => {
        if (chatBody.children.length === 0) {
            agregarMensajeIA("¡Hola! Soy VestIA. ¿Buscas algo en específico?");
        }
    }, 500);
}

async function enviarMensaje() {
    const texto = inputChat.value.trim();
    if (!texto && !imagenBase64) return;

    agregarMensajeUsuario(texto, imagenBase64); 
    
    const imagenParaEnviar = imagenBase64; 
    const textoParaEnviar = texto;

    inputChat.value = "";
    limpiarImagenPrevia();
    
    const loadingId = agregarLoading();

    try {
        //Llama a la ia y envia texto e imagen
        const respuestaIA = await llamarAGemini(textoParaEnviar, imagenParaEnviar);
        
        removerLoading(loadingId);
        procesarRespuestaIA(respuestaIA);

        historialChat.push({ 
            role: "user", 
            parts: [{ text: textoParaEnviar }] 
        });

        historialChat.push({ 
            role: "model", 
            parts: [{ text: respuestaIA }] 
        });

    } catch (error) {
        removerLoading(loadingId);
        agregarMensajeIA("😵‍💫 Ups, error de conexión. Intenta de nuevo.");
        console.error(error);
    }
    
    imagenBase64 = null;
}

//Conexion con la api
async function llamarAGemini(mensajeUsuario, imagenData) {
    if (!API_KEY || API_KEY.includes("TU_CLAVE")) {
        return "⚠️ Error: Falta configurar la API Key en js/config.js";
    }

    const inventario = listaGlobalProductos.map(p => 
        `- ID:${p.id} | ${p.title} | $${p.price} | Cat:${p.category}`
    ).join("\n");

    const instruccionesSistema = `
    Eres "VestIA", asesora de moda.
    INVENTARIO:
    ${inventario}

    REGLAS:
    1. Recomienda productos del inventario.
    2. Si recomiendas, termina con: FILTER_CMD:[id1, id2]
    3. Si el usuario sube foto, analízala.
    4. MANTÉN EL CONTEXTO de la conversación.
    `;

    let contenidos = [];

    contenidos.push({ 
        role: "user", 
        parts: [{ text: instruccionesSistema }] 
    });
    
    contenidos.push({ 
        role: "model", 
        parts: [{ text: "Entendido, soy VestIA y conozco el inventario. ¿En qué te ayudo?" }] 
    });

    contenidos = contenidos.concat(historialChat.slice(-10));

    const partesNuevoMensaje = [];
    
    if (imagenData) {
        const base64Limpio = imagenData.split(',')[1]; 
        const mimeType = imagenData.split(';')[0].split(':')[1];
        partesNuevoMensaje.push({
            inline_data: { mime_type: mimeType, data: base64Limpio }
        });
        partesNuevoMensaje.push({ text: "Analiza esta imagen: " + mensajeUsuario });
    } else {
        partesNuevoMensaje.push({ text: mensajeUsuario });
    }

    contenidos.push({ 
        role: "user", 
        parts: partesNuevoMensaje 
    });

    // Se envia en el mensaje
    const response = await fetch(`${API_URL}?key=${API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: contenidos })
    });

    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error?.message || "Error en API");
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
}

function procesarRespuestaIA(textoCompleto) {
    const match = textoCompleto.match(/FILTER_CMD:\[(.*?)\]/);
    let textoFinal = textoCompleto;
    let idsProductos = [];

    if (match) {
        const idsRaw = match[1];
        idsProductos = idsRaw.split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n));
        textoFinal = textoCompleto.replace(match[0], "");
    }

    agregarMensajeIA(textoFinal);
    
    if (idsProductos.length > 0) {
        setTimeout(() => crearBotonDeFiltro(idsProductos), 400);
    }
}

//De aqui en adelante puras funciones visuales
function agregarMensajeUsuario(texto, imgData) {
    const div = document.createElement("div");
    div.className = "d-flex flex-column align-items-end mb-3 animate__animated animate__fadeInRight";
    
    let contenidoHtml = "";
    if (imgData) {
        contenidoHtml += `<img src="${imgData}" class="mb-2 rounded border shadow-sm" style="max-width: 150px;">`;
    }
    if (texto) {
        contenidoHtml += `<div class="bg-primary text-white p-3 rounded-3 shadow-sm" style="max-width: 85%;">${texto}</div>`;
    }
    div.innerHTML = contenidoHtml;
    chatBody.appendChild(div);
    scrollAlFondo();
}

function agregarMensajeIA(texto) {
    const textoFormateado = texto.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
    const div = document.createElement("div");
    div.className = "d-flex align-items-start mb-3 animate__animated animate__fadeInLeft";
    div.innerHTML = `
        <div class="me-2" style="font-size: 1.5rem;">🤖</div>
        <div class="bg-white border p-3 rounded-3 text-dark shadow-sm" style="max-width: 90%;">
            ${textoFormateado}
        </div>
    `;
    chatBody.appendChild(div);
    scrollAlFondo();
}

function crearBotonDeFiltro(ids) {
    const div = document.createElement("div");
    div.className = "d-grid gap-2 col-10 mx-auto mb-3 animate__animated animate__fadeInUp";
    div.innerHTML = `<button class="btn btn-outline-dark btn-sm rounded-pill border-2">✨ Ver sugerencias (${ids.length})</button>`;
    
    div.querySelector("button").addEventListener("click", () => {
        const filtrados = listaGlobalProductos.filter(p => ids.includes(p.id));
        setProductosVista(filtrados);
        div.querySelector("button").className = "btn btn-success btn-sm rounded-pill w-100";
        div.querySelector("button").innerText = "✅ Productos mostrados";
    });

    chatBody.appendChild(div);
    scrollAlFondo();
}

function agregarLoading() {
    const id = "loading-" + Date.now();
    const div = document.createElement("div");
    div.id = id;
    div.className = "d-flex align-items-center mb-3 text-muted ms-5";
    div.innerHTML = `<div class="spinner-grow spinner-grow-sm me-2"></div><small>Thinking...</small>`;
    chatBody.appendChild(div);
    scrollAlFondo();
    return id;
}

function removerLoading(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
}

function scrollAlFondo() {
    chatBody.scrollTop = chatBody.scrollHeight;
}

function procesarImagen(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(event) {
        imagenBase64 = event.target.result;
        previewZona.style.display = "block";
    };
    reader.readAsDataURL(file);
}

function limpiarImagenPrevia() {
    inputFoto.value = ""; 
    previewZona.style.display = "none";
}