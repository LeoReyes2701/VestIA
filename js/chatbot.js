import { API_KEY, API_URL } from "./config.js";
import { listaGlobalProductos, setProductosVista } from "./products.js";
import { getResumenPerfil } from "./profile.js";

// --- REFERENCIAS AL DOM (UI) ---
const chatBody = document.getElementById("cuerpo-chat");
const inputChat = document.getElementById("entrada-chat");
const btnEnviar = document.getElementById("boton-enviar");
const inputFoto = document.getElementById("adjuntar-foto");
const previewZona = document.getElementById("previsualizacion-imagen");

// --- ESTADO Y MEMORIA ---
let imagenBase64 = null; 
// Ahora el historial guardará objetos con el formato exacto de Gemini: { role: "user/model", parts: [...] }
let historialChat = [];  

// --- INICIALIZACIÓN ---
export function initChatbot() {
    if (!btnEnviar) return;

    btnEnviar.addEventListener("click", enviarMensaje);

    inputChat.addEventListener("keypress", (e) => {
        if (e.key === "Enter") enviarMensaje();
    });

    inputFoto.addEventListener("change", procesarImagen);
    
    // Mensaje de bienvenida (sin guardarlo en historial API para no ensuciar)
    setTimeout(() => {
        if (chatBody.children.length === 0) {
            agregarMensajeIA("¡Hola! Soy VestIA 👗. ¿Buscas un outfit específico o necesitas ayuda combinando algo?");
        }
    }, 500);
}

// --- LÓGICA PRINCIPAL ---
async function enviarMensaje() {
    const texto = inputChat.value.trim();
    if (!texto && !imagenBase64) return;

    // 1. Mostrar visualmente
    agregarMensajeUsuario(texto, imagenBase64); 
    
    // Guardamos referencia local para la llamada
    const imagenParaEnviar = imagenBase64; 
    const textoParaEnviar = texto; // Guardamos el texto

    inputChat.value = "";
    limpiarImagenPrevia();
    
    const loadingId = agregarLoading();

    try {
        // 2. Llamar a Gemini enviando TODO el contexto
        const respuestaIA = await llamarAGemini(textoParaEnviar, imagenParaEnviar);
        
        removerLoading(loadingId);
        procesarRespuestaIA(respuestaIA);

        // 3. ACTUALIZAR MEMORIA (AQUÍ ESTABA EL FALLO ANTES)
        // Guardamos lo que dijo el usuario (solo texto para ahorrar memoria)
        historialChat.push({ 
            role: "user", 
            parts: [{ text: textoParaEnviar }] 
        });

        // Guardamos lo que respondió la IA
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

// --- CONEXIÓN CON LA API (CORREGIDA PARA TENER MEMORIA) ---
async function llamarAGemini(mensajeUsuario, imagenData) {
    if (!API_KEY || API_KEY.includes("TU_CLAVE")) {
        return "⚠️ Error: Falta configurar la API Key en js/config.js";
    }

    // 1. Contexto del Catálogo (System Prompt)
    const inventario = listaGlobalProductos.map(p => 
        `- ID:${p.id} | ${p.title} | $${p.price} | Cat:${p.category}`
    ).join("\n");

    const datosUsuario = getResumenPerfil(); 

    const instruccionesSistema = `
    Eres "VestIA", asesora de moda personal.

    CONTEXTO DEL USUARIO:
    ${datosUsuario}

    INVENTARIO DISPONIBLE:
    ${inventario}

    REGLAS:
    1. Recomienda productos del inventario basándote en los gustos del usuario (si los hay).
    2. Si recomiendas, termina con: FILTER_CMD:[id1, id2]
    3. MANTÉN EL CONTEXTO de la conversación.
    4. Sé amable y usa el nombre del usuario si lo sabes.
    `;

    // 2. Construir la "Cadena de Conversación" (Payload)
    // El truco es enviar: [Instrucciones] + [Historial Pasado] + [Mensaje Nuevo]
    let contenidos = [];

    // A. Instrucción inicial (Simulamos que es el primer mensaje de usuario para dar contexto)
    contenidos.push({ 
        role: "user", 
        parts: [{ text: instruccionesSistema }] 
    });
    
    contenidos.push({ 
        role: "model", 
        parts: [{ text: "Entendido, soy VestIA y conozco el inventario. ¿En qué te ayudo?" }] 
    });

    // B. Añadir todo el historial previo (Lo que habéis hablado antes)
    // Usamos .slice(-10) para recordar solo los últimos 10 mensajes y no saturar
    contenidos = contenidos.concat(historialChat.slice(-10));

    // C. Añadir el mensaje ACTUAL (con imagen si hay)
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

    // 3. Enviar todo a Google
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

// --- PROCESAMIENTO DE RESPUESTA ---
function procesarRespuestaIA(textoCompleto) {
    // Detectar filtro
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

// --- FUNCIONES VISUALES (UI) - SIN CAMBIOS ---
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