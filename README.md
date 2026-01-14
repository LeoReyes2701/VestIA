# 👗 VestIA - Tu Estilista Personal con IA

¡Bienvenido al repositorio de **VestIA**! Este no es solo otro e-commerce de moda; es una prueba de concepto de cómo la Inteligencia Artificial puede ayudarte a elegir tu próximo outfit perfecto.

La idea principal es tener un asistente que no solo te vende ropa, sino que te aconseja **basándose en tus gustos reales** y en lo que ya tienes en tu armario.

## ✨ ¿Qué hace especial a este proyecto?

Lo más interesante está en el asistente virtual (en el chat a la derecha):

* **🧠 IA Integrada (Gemini):** Puedes hablarle naturalmente. Pregúntale *"¿Qué me pongo para una boda de día?"* y te responderá con sentido.
* **📸 Análisis de Imágenes:** ¿Tienes una camisa y no sabes con qué combinarla? Sube una foto en el chat y VestIA la analizará para sugerirte prendas que combinen.
* **👤 Memoria de Estilo:** En la sección "Mis Gustos", puedes guardar tu talla, estilo favorito (Casual, Formal, etc.) y colores. La IA usará esa información para personalizar sus respuestas.
* **🛍️ Carrito Inteligente:** Todo lo que agregas se guarda en tu navegador, así que no pierdes tu selección si recargas la página.

## 🛠️ Tecnologías que usamos

Este proyecto es puro **Frontend**, hecho tecnologías modernas:

* **HTML & CSS:** Estructura y diseño.
* **JavaScript:** Toda la lógica del cliente.
* **Bootstrap:** Para que se vea bien en móviles y PC.
* **Google Gemini API:** El cerebro detrás del chatbot.
* **LocalStorage:** Para guardar tu carrito y perfil sin necesidad de base de datos.
* **DummyJSON:** API para simular el catálogo de productos.

## 🚀 Cómo probar el proyecto en tu PC

Como es un proyecto estático (sin backend complejo), es muy fácil de correr:

1.  **Clona el repositorio:**
    ```bash
    git clone <URL_DEL_REPOSITORIO>
    ```
2.  **Abre la carpeta del proyecto** en Visual Studio Code.
3.  **Configura la API Key:**
    * Ve al archivo `js/config.js`.
    * Asegúrate de poner tu propia API KEY de Google Gemini donde dice `export const API_KEY = "..."`.
4.  **Ejecuta el proyecto:**
    * Al usar Módulos de JS (`import/export`), no puedes abrir el archivo `index.html` con doble clic directamente (el navegador lo bloqueará por seguridad).
    * Usa una extensión como **"Live Server"** en VS Code (clic derecho en `index.html` -> *Open with Live Server*).

---
Hecho por Leopoldo Micett, Daniel Gomez y Leonardo Reyes