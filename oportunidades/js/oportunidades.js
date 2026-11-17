/* ============================================
   Oportunidades en Corea — buscador
   Datos: /oportunidades/opciones.json
   ============================================ */
(function () {
  "use strict";

  const ORDEN_PRESUPUESTO = { bajo: 0, medio: 1, alto: 2 };
  const NOMBRE_CAT = { estudio: "Estudiar", idioma: "Idioma", trabajo: "Trabajar" };
  let datos = null;
  let categoria = "todas";

  const esc = (t) => String(t ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const miles = (n) => Math.round(n).toLocaleString("es-CL");
  const redondear = (n) => Math.round(n / (n >= 100000 ? 1000 : 100)) * (n >= 100000 ? 1000 : 100);

  function convertirPrecios() {
    const { krwPorUsd, clpPorUsd } = datos.tiposDeCambio;
    const aClp = (k) => redondear((k / krwPorUsd) * clpPorUsd);
    document.querySelectorAll("[data-krw]").forEach((el) => {
      const [a, b] = el.dataset.krw.split("-").map(Number);
      const texto = `≈ $${miles(aClp(a))}${b ? "–" + miles(aClp(b)) : ""} CLP`;
      if (el.tagName === "TD") {
        const s = document.createElement("span");
        s.className = "conv";
        s.textContent = texto;
        el.appendChild(s);
      } else {
        el.textContent = `${el.textContent} (${texto})`;
      }
    });
    document.getElementById("nota-cambio").textContent =
      `Tipo de cambio usado: USD 1 ≈ ₩${miles(krwPorUsd)} y USD 1 ≈ $${miles(clpPorUsd)} CLP (${datos.actualizado}).`;
    document.querySelectorAll(".dato-actualizado").forEach((el) => (el.textContent = datos.actualizado));
  }

  function filtrar() {
    const edad = Number(document.getElementById("b-edad").value) || 0;
    const nivel = document.getElementById("b-nivel").value;
    const presupuesto = document.getElementById("b-presupuesto").value;
    const lista = datos.opciones.filter(
      (o) =>
        edad >= o.edadMin &&
        edad <= o.edadMax &&
        o.niveles.includes(nivel) &&
        ORDEN_PRESUPUESTO[o.presupuestoMin] <= ORDEN_PRESUPUESTO[presupuesto] &&
        (categoria === "todas" || o.categoria === categoria)
    );

    document.getElementById("conteo").textContent = lista.length
      ? `${lista.length} ${lista.length === 1 ? "oportunidad coincide" : "oportunidades coinciden"} con tu perfil`
      : "";

    document.getElementById("resultados").innerHTML = lista.length
      ? lista
          .map(
            (o) => `
        <details class="opcion">
          <summary>
            <div>
              <div class="sellos">
                <span class="sello ${o.presupuestoMin === "bajo" ? "verde" : ""}">${esc(o.tipo)}</span>
                <span class="sello">${esc(NOMBRE_CAT[o.categoria])}</span>
                <span class="sello">${o.edadMax >= 99 ? `Desde ${o.edadMin} años` : `${o.edadMin}–${o.edadMax} años`}</span>
              </div>
              <h3>${esc(o.nombre)}</h3>
              <p>${esc(o.resumen)}</p>
            </div>
            <span class="mas" aria-hidden="true">+</span>
          </summary>
          <div class="opcion-cuerpo">
            <dl>
              <dt>Qué cubre</dt><dd>${esc(o.cubre)}</dd>
              <dt>Requisitos</dt><dd>${esc(o.requisitos)}</dd>
              <dt>Coreano</dt><dd>${esc(o.coreano)}</dd>
              <dt>Plazos</dt><dd>${esc(o.plazos)}</dd>
              <dt>Fuente</dt><dd>${o.fuente.url ? `<a href="${esc(o.fuente.url)}" target="_blank" rel="noopener">${esc(o.fuente.nombre)}</a>` : esc(o.fuente.nombre)}</dd>
            </dl>
          </div>
        </details>`
          )
          .join("")
      : `<div class="vacio">No encontramos opciones exactas para esta combinación. Prueba con otra categoría o con un presupuesto mayor, y revisa la sección <a href="#edad">Según tu edad</a>: siempre hay un primer paso posible, como aprender coreano en Chile.</div>`;
  }

  function iniciar() {
    const selNivel = document.getElementById("b-nivel");
    const selPres = document.getElementById("b-presupuesto");
    selNivel.innerHTML = datos.niveles.map((n) => `<option value="${n.id}">${esc(n.nombre)}</option>`).join("");
    selPres.innerHTML = datos.presupuestos.map((p) => `<option value="${p.id}">${esc(p.nombre)}</option>`).join("");
    selNivel.value = "superior-curso";
    selPres.value = "bajo";
    document.getElementById("form-buscador").addEventListener("input", filtrar);
    document.getElementById("filtros-cat").addEventListener("click", (ev) => {
      const b = ev.target.closest("[data-cat]");
      if (!b) return;
      categoria = b.dataset.cat;
      document.querySelectorAll(".filtro").forEach((x) => x.classList.toggle("activo", x === b));
      filtrar();
    });
    convertirPrecios();
    filtrar();
  }

  // Índice activo al desplazarse
  const enlaces = [...document.querySelectorAll("#indice a")];
  if ("IntersectionObserver" in window) {
    const obs = new IntersectionObserver(
      (entradas) => {
        entradas.forEach((e) => {
          if (!e.isIntersecting) return;
          enlaces.forEach((a) => {
            const activo = a.getAttribute("href") === "#" + e.target.id;
            a.classList.toggle("activo", activo);
            if (activo) {
              const nav = a.parentElement;
              nav.scrollTo({ left: a.offsetLeft - nav.clientWidth / 2 + a.clientWidth / 2, behavior: "smooth" });
            }
          });
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    enlaces.forEach((a) => {
      const s = document.querySelector(a.getAttribute("href"));
      if (s) obs.observe(s);
    });
  }

  fetch("/oportunidades/opciones.json", { cache: "no-cache" })
    .then((r) => {
      if (!r.ok) throw new Error("No se pudo cargar opciones.json");
      return r.json();
    })
    .then((d) => {
      datos = d;
      iniciar();
    })
    .catch((err) => {
      console.error(err);
      document.getElementById("resultados").innerHTML = '<div class="vacio">No se pudieron cargar las oportunidades. Recarga la página.</div>';
    });
})();
