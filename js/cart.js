const CART_KEY = "vestia_cart_v1";

function leerCarrito() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) ?? [];
  } catch {
    return [];
  }
}

function guardarCarrito(items) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}

export function getCartCount() {
  return leerCarrito().reduce((acc, item) => acc + item.qty, 0);
}

export function addToCart(productId, qty = 1) {
  const id = Number(productId);
  if (!Number.isFinite(id)) return;

  const items = leerCarrito();
  const found = items.find((x) => x.id === id);

  if (found) found.qty += qty;
  else items.push({ id, qty });

  guardarCarrito(items);
  actualizarBadge();
}

export function removeFromCart(productId) {
  const id = Number(productId);
  const items = leerCarrito().filter((x) => x.id !== id);
  guardarCarrito(items);
  actualizarBadge();
}

export function setQty(productId, qty) {
  const id = Number(productId);
  const q = Number(qty);

  if (!Number.isFinite(id)) return;

  const items = leerCarrito();

  const found = items.find((x) => x.id === id);
  if (!found) return;

  if (!Number.isFinite(q) || q <= 0) {
    // qty 0 => eliminar
    guardarCarrito(items.filter((x) => x.id !== id));
  } else {
    found.qty = Math.floor(q);
    guardarCarrito(items);
  }

  actualizarBadge();
}

export function clearCart() {
  guardarCarrito([]);
  actualizarBadge();
}

export function actualizarBadge() {
  const btn = document.getElementById("boton-carrito");
  if (!btn) return;
  btn.textContent = `Carrito (${getCartCount()})`;
}

export function renderCartModal(productos) {
  const cont = document.getElementById("carrito-contenido");
  const totalEl = document.getElementById("carrito-total");
  if (!cont || !totalEl) return;

  const items = leerCarrito();

  if (items.length === 0) {
    cont.innerHTML = `<p class="text-center text-muted mb-0">Tu carrito está vacío.</p>`;
    totalEl.textContent = "Total: $0";
    return;
  }

  const map = new Map(productos.map((p) => [p.id, p]));

  let total = 0;

  cont.innerHTML = `
    <div class="table-responsive">
      <table class="table align-middle">
        <thead>
          <tr>
            <th>Producto</th>
            <th style="width:120px">Precio</th>
            <th style="width:140px">Cantidad</th>
            <th style="width:120px">Subtotal</th>
            <th style="width:60px"></th>
          </tr>
        </thead>
        <tbody>
          ${items
            .map((it) => {
              const p = map.get(it.id);
              if (!p) return "";

              const subtotal = p.price * it.qty;
              total += subtotal;

              return `
                <tr>
                  <td>
                    <div class="d-flex gap-3 align-items-center">
                      <img src="${p.thumbnail}" alt="${p.title}" style="width:64px;height:64px;object-fit:cover;border-radius:10px;">
                      <div>
                        <div class="fw-semibold">${p.title}</div>
                        <div class="text-muted small">${p.category}</div>
                      </div>
                    </div>
                  </td>
                  <td>$${p.price}</td>
                  <td>
                    <input
                      type="number"
                      min="1"
                      class="form-control form-control-sm carrito-qty"
                      data-id="${p.id}"
                      value="${it.qty}"
                    >
                  </td>
                  <td>$${subtotal.toFixed(2)}</td>
                  <td>
                    <button class="btn btn-sm btn-outline-danger carrito-remove" data-id="${p.id}">x</button>
                  </td>
                </tr>
              `;
            })
            .join("")}
        </tbody>
      </table>
    </div>
  `;

  totalEl.textContent = `Total: $${total.toFixed(2)}`;
}


export function initCartUI(getProductosFn) {

  actualizarBadge();

  const btnCarrito = document.getElementById("boton-carrito");
  const btnVaciar = document.getElementById("carrito-vaciar");
  const btnCheckout = document.getElementById("carrito-checkout");

  btnCarrito?.addEventListener("click", () => {
    const productos = getProductosFn();
    renderCartModal(productos);

    const modalEl = document.getElementById("modalCarrito");
    const modal = new bootstrap.Modal(modalEl);
    modal.show();
  });

  document.getElementById("carrito-contenido")?.addEventListener("click", (e) => {
    const btnRemove = e.target.closest(".carrito-remove");
    if (btnRemove) {
      removeFromCart(btnRemove.dataset.id);
      renderCartModal(getProductosFn());
    }
  });

  document.getElementById("carrito-contenido")?.addEventListener("input", (e) => {
    const input = e.target.closest(".carrito-qty");
    if (input) {
      setQty(input.dataset.id, input.value);
      renderCartModal(getProductosFn());
    }
  });

  btnVaciar?.addEventListener("click", () => {
    clearCart();
    renderCartModal(getProductosFn());
  });

  btnCheckout?.addEventListener("click", () => {
    const count = getCartCount();
    if (count === 0) {
      alert("Tu carrito está vacío.");
      return;
    }
    alert("Checkout listo (falta implementar pago/envío).");
  });
}