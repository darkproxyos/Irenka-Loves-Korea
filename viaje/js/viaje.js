/* ============================================
   Viaje a Corea — interacciones
   Precios y tipos de cambio: /viaje/datos.json
   ============================================ */
(function () {
  "use strict";

  const CLAVE_LISTA = "viaje-corea-checklist";
  let datos = null;
  let moneda = "CLP";
  let estilo = "medio";

  // ---------- Formato ----------
  const miles = (n) => Math.round(n).toLocaleString("es-CL");
  const redondear = (n) => {
    const a = Math.abs(n);
    const paso = a >= 1e6 ? 10000 : a >= 100000 ? 1000 : a >= 10000 ? 100 : 10;
    return Math.round(n / paso) * paso;
  };
  const tasa = () => ({
    krw: Number(document.getElementById("c-krw")?.value) || datos.tiposDeCambio.krwPorUsd,
    clp: Number(document.getElementById("c-clp")?.value) || datos.tiposDeCambio.clpPorUsd,
  });
  const krwAClp = (k) => (k / tasa().krw) * tasa().clp;
  const krwAUsd = (k) => k / tasa().krw;
  const formato = {
    CLP: (k) => "$" + miles(redondear(krwAClp(k))),
    USD: (k) => "USD " + miles(krwAUsd(k)),
    KRW: (k) => "₩" + miles(k),
  };

  // ---------- Conversión de precios en la página ----------
  function rango(attr) {
    return String(attr).split("-").map(Number);
  }
  function convertirPrecios() {
    document.querySelectorAll("[data-krw]").forEach((el) => {
      const [a, b] = rango(el.dataset.krw);
      const texto = "≈ " + formato.CLP(a) + (b ? "–" + miles(redondear(krwAClp(b))) : "") + " CLP";
      let conv = el.querySelector(".conv");
      if (el.tagName === "TD") {
        if (!conv) { conv = document.createElement("span"); conv.className = "conv"; el.appendChild(conv); }
        conv.textContent = texto;
      } else {
        if (!el.dataset.base) el.dataset.base = el.textContent;
        el.textContent = `${el.dataset.base} (${texto})`;
      }
    });
    document.querySelectorAll("[data-equiv]").forEach((el) => {
      const k = Number(el.dataset.equiv);
      el.textContent = `${formato.CLP(k)} CLP o USD ${krwAUsd(k).toFixed(0)}`;
    });
    const t = datos.tiposDeCambio;
    document.getElementById("dato-cambio").textContent = `USD 1 ≈ ₩${miles(tasa().krw)}`;
    document.getElementById("texto-cambio").textContent =
      `La moneda es el won coreano (₩, KRW). Referencia (${datos.actualizado}): USD 1 ≈ ₩${miles(tasa().krw)} y USD 1 ≈ $${miles(tasa().clp)} CLP, así que ₩1.000 ≈ ${formato.CLP(1000)} CLP y ₩10.000 ≈ ${formato.CLP(10000)} CLP. Truco rápido: divide el precio en won por ${(tasa().krw / tasa().clp).toFixed(2).replace(".", ",")} para tenerlo en pesos.`;
    document.querySelectorAll(".dato-actualizado").forEach((el) => (el.textContent = datos.actualizado));
    void t;
  }

  // ---------- Tabla de estilos ----------
  function tablaEstilos() {
    const filas = [
      ["alojamiento", "Alojamiento"],
      ["comida", "Comida"],
      ["transporte", "Transporte local"],
      ["actividades", "Entradas y actividades"],
      ["extras", "Cafés, snacks y extras"],
    ];
    const e = datos.estilos;
    const ids = ["mochilero", "medio", "comodo"];
    const porPersona = (id, campo) => (campo === "alojamiento" && !e[id].alojamientoPorPersona ? e[id][campo] / 2 : e[id][campo]);
    const celda = (k) => `<td class="precio">₩${miles(k)}<span class="conv">≈ ${formato.CLP(k)} CLP</span></td>`;
    const cuerpo = filas.map(([c, n]) => `<tr><td>${n}</td>${ids.map((id) => celda(porPersona(id, c))).join("")}</tr>`).join("");
    const total = `<tr><td><strong>Total por día</strong></td>${ids
      .map((id) => celda(filas.reduce((s, [c]) => s + porPersona(id, c), 0)))
      .join("")}</tr>`;
    document.querySelector("#tabla-estilos tbody").innerHTML = cuerpo + total;
  }

  // ---------- Calculadora ----------
  function calcular() {
    const personas = Math.max(1, Number(document.getElementById("c-personas").value) || 1);
    const dias = Math.max(1, Number(document.getElementById("c-dias").value) || 1);
    const vueloUsd = Math.max(0, Number(document.getElementById("c-vuelo").value) || 0);
    const compras = Math.max(0, Number(document.getElementById("c-compras").value) || 0);
    const busan = document.getElementById("c-busan").checked;
    const jeju = document.getElementById("c-jeju").checked;
    const seguro = document.getElementById("c-seguro").checked;
    const esim = document.getElementById("c-esim").checked;
    const e = datos.estilos[estilo];
    const f = datos.costosFijos;
    const usdAKrw = (u) => u * tasa().krw;

    const noches = Math.max(dias - 1, 1);
    const habitaciones = Math.ceil(personas / 2);
    const alojamiento = e.alojamientoPorPersona ? e.alojamiento * noches * personas : e.alojamiento * noches * habitaciones;

    const partidas = [
      ["Pasajes de avión", usdAKrw(vueloUsd) * personas],
      [`Alojamiento (${noches} ${noches === 1 ? "noche" : "noches"})`, alojamiento],
      ["Comida", e.comida * dias * personas],
      ["Transporte local", (e.transporte * dias + f.aeropuertoKrw + f.tarjetaTransporteKrw) * personas],
      ["Entradas y actividades", e.actividades * dias * personas],
      ["Cafés, snacks y extras", e.extras * dias * personas],
      ["K-ETA", f.ketaKrw * personas],
    ];
    if (busan) partidas.push(["KTX Seúl–Busan ida y vuelta", f.ktxSeulBusanKrw * 2 * personas]);
    if (jeju) partidas.push(["Jeju: vuelo y arriendo de auto (3 días)", (f.vueloJejuIdaVueltaKrw + f.jejuExtraPorDiaKrw * 3) * personas]);
    if (seguro) partidas.push(["Seguro de viaje", usdAKrw(f.seguroUsdPorDia * (dias + 2)) * personas]);
    if (esim) partidas.push(["eSIM de datos", usdAKrw(f.esimUsd) * personas]);
    if (compras) partidas.push(["Compras y regalos", compras * personas]);

    const total = partidas.reduce((s, [, v]) => s + v, 0);
    const otras = ["CLP", "USD", "KRW"].filter((m) => m !== moneda);

    document.getElementById("c-total").textContent = formato[moneda](total);
    document.getElementById("c-otras").innerHTML =
      `${otras.map((m) => formato[m](total)).join(" · ")}<br>` +
      (personas > 1 ? `Por persona: <strong>${formato[moneda](total / personas)}</strong> · ` : "") +
      `Sin pasajes: ${formato[moneda](total - partidas[0][1])}`;
    document.getElementById("c-desglose").innerHTML =
      partidas.map(([n, v]) => `<tr><td>${n}</td><td>${formato[moneda](v)}</td></tr>`).join("") +
      `<tr class="suma"><td>Total (${personas} ${personas === 1 ? "persona" : "personas"}, ${dias} días)</td><td>${formato[moneda](total)}</td></tr>`;
    document.getElementById("c-estilo-desc").textContent = e.descripcion;
  }

  function iniciarCalculadora() {
    const cont = document.getElementById("c-estilos");
    cont.innerHTML = Object.entries(datos.estilos)
      .map(([id, e]) => `<button type="button" class="opcion-estilo ${id === estilo ? "activa" : ""}" data-estilo="${id}">${e.nombre}</button>`)
      .join("");
    cont.addEventListener("click", (ev) => {
      const b = ev.target.closest("[data-estilo]");
      if (!b) return;
      estilo = b.dataset.estilo;
      cont.querySelectorAll(".opcion-estilo").forEach((x) => x.classList.toggle("activa", x === b));
      calcular();
    });
    document.getElementById("c-moneda").addEventListener("click", (ev) => {
      const b = ev.target.closest("[data-moneda]");
      if (!b) return;
      moneda = b.dataset.moneda;
      document.querySelectorAll("#c-moneda button").forEach((x) => x.classList.toggle("activa", x === b));
      calcular();
    });
    document.getElementById("c-krw").value = datos.tiposDeCambio.krwPorUsd;
    document.getElementById("c-clp").value = datos.tiposDeCambio.clpPorUsd;
    document.getElementById("c-vuelo").value = datos.costosFijos.vueloUsd;
    document.getElementById("c-nota-cambio").textContent = datos.tiposDeCambio.nota;
    document.querySelector(".calculadora .campos").addEventListener("input", (ev) => {
      if (ev.target.id === "c-krw" || ev.target.id === "c-clp") { convertirPrecios(); tablaEstilos(); }
      calcular();
    });
    calcular();
  }

  // ---------- Itinerarios ----------
  document.querySelector(".pestanas").addEventListener("click", (ev) => {
    const b = ev.target.closest("[data-itinerario]");
    if (!b) return;
    document.querySelectorAll(".pestana").forEach((x) => {
      x.classList.toggle("activa", x === b);
      x.setAttribute("aria-selected", String(x === b));
    });
    document.querySelectorAll(".itinerario").forEach((x) => x.classList.toggle("activo", x.dataset.dias === b.dataset.itinerario));
  });

  // ---------- Frases con audio ----------
  const FRASES = [
    ["안녕하세요", "annyeonghaseyo", "Hola"],
    ["감사합니다", "gamsahamnida", "Gracias"],
    ["죄송합니다", "joesonghamnida", "Disculpe / lo siento"],
    ["저기요", "jeogiyo", "¡Disculpe! (para llamar al mesero)"],
    ["이거 주세요", "igeo juseyo", "Deme esto, por favor"],
    ["얼마예요?", "eolmayeyo?", "¿Cuánto cuesta?"],
    ["카드 돼요?", "kadeu dwaeyo?", "¿Aceptan tarjeta?"],
    ["화장실 어디예요?", "hwajangsil eodiyeyo?", "¿Dónde está el baño?"],
    ["영어 할 수 있어요?", "yeongeo hal su isseoyo?", "¿Habla inglés?"],
    ["물 주세요", "mul juseyo", "Agua, por favor"],
    ["덜 맵게 해 주세요", "deol maepge hae juseyo", "Menos picante, por favor"],
    ["고기 빼 주세요", "gogi ppae juseyo", "Sin carne, por favor"],
    ["알레르기가 있어요", "allereugiga isseoyo", "Tengo alergia"],
    ["포장해 주세요", "pojanghae juseyo", "Para llevar, por favor"],
    ["계산해 주세요", "gyesanhae juseyo", "La cuenta, por favor"],
    ["맛있어요!", "masisseoyo!", "¡Está delicioso!"],
    ["여기로 가 주세요", "yeogiro ga juseyo", "Lléveme aquí, por favor (taxi)"],
    ["사진 찍어 주실 수 있어요?", "sajin jjigeo jusil su isseoyo?", "¿Me puede tomar una foto?"],
    ["도와주세요!", "dowajuseyo!", "¡Ayuda!"],
    ["괜찮아요", "gwaenchanayo", "Está bien / no se preocupe"],
  ];
  const ICONO =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M16.5 8.5a5 5 0 0 1 0 7"/><path d="M19 6a8.5 8.5 0 0 1 0 12"/></svg>';
  const esc = (t) => String(t).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  document.getElementById("lista-frases").innerHTML = FRASES.map(
    ([ko, rom, es]) => `
    <div class="frase">
      <div><span class="ko" lang="ko">${esc(ko)}</span><span class="rom">${esc(rom)}</span><span class="es">${esc(es)}</span></div>
      <button class="audio" data-hablar="${esc(ko)}" aria-label="Escuchar ${esc(ko)}">${ICONO}</button>
    </div>`
  ).join("");
  document.getElementById("lista-frases").addEventListener("click", (ev) => {
    const b = ev.target.closest("[data-hablar]");
    if (!b || !("speechSynthesis" in window)) return;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(b.dataset.hablar);
    u.lang = "ko-KR";
    u.rate = 0.8;
    const voz = speechSynthesis.getVoices().find((v) => v.lang && v.lang.toLowerCase().startsWith("ko"));
    if (voz) u.voice = voz;
    speechSynthesis.speak(u);
  });
  if ("speechSynthesis" in window) speechSynthesis.getVoices();

  // ---------- Checklist ----------
  const LISTA = {
    "Documentos": [
      "Pasaporte con al menos 6 meses de vigencia",
      "K-ETA aprobada (captura o copia impresa)",
      "ESTA (si escalas en EE. UU.) o eTA (si escalas en Canadá)",
      "Pasajes de ida y vuelta",
      "Reservas de alojamiento con direcciones en coreano",
      "Seguro de viaje con cobertura médica",
      "Copias digitales de todo en la nube y en el celular",
      "Permiso Internacional de Conducir (solo si arrendarás auto)",
    ],
    "Dinero": [
      "Avisar al banco que viajarás",
      "Dos tarjetas de crédito o débito de bancos distintos",
      "Dólares en efectivo para cambiar en Corea",
      "Revisar comisiones de tu banco por compras y giros en el extranjero",
    ],
    "Tecnología": [
      "eSIM, SIM o WiFi portátil comprado",
      "Apps instaladas: Naver Map, Papago, Kakao T, KakaoTalk",
      "Batería externa (siempre en el equipaje de mano)",
      "Cargadores y adaptador tipo C/F si tus enchufes son de tres patas",
      "Mapas y documentos descargados para usar sin conexión",
    ],
    "Salud": [
      "Medicamentos personales en su envase original, con receta",
      "Botiquín básico: analgésico, antialérgico, curitas, para el estómago",
      "Mascarillas KF94 (sobre todo en primavera)",
      "Protector solar",
    ],
    "Maleta": [
      "Ropa según la estación (invierno muy frío; verano muy húmedo)",
      "Zapatos cómodos para caminar y fáciles de sacar",
      "Calcetines en buen estado (te sacarás los zapatos a menudo)",
      "Bolsa reutilizable (las bolsas plásticas se cobran)",
      "Espacio libre para compras, o un bolso plegable extra",
      "Pañuelos desechables y toallitas húmedas",
    ],
    "Al llegar a Corea": [
      "Comprar y cargar la tarjeta T-money o Climate Card",
      "Cambiar dólares a won",
      "Activar la eSIM o retirar la SIM o el WiFi portátil",
      "Guardar el número 1330 de ayuda al turista",
    ],
  };
  let marcados = {};
  try { marcados = JSON.parse(localStorage.getItem(CLAVE_LISTA)) || {}; } catch { marcados = {}; }
  const guardarLista = () => { try { localStorage.setItem(CLAVE_LISTA, JSON.stringify(marcados)); } catch { /* sin almacenamiento */ } };

  function pintarLista() {
    let n = 0;
    let total = 0;
    document.getElementById("lista").innerHTML = Object.entries(LISTA)
      .map(([grupo, items]) => `
        <div class="grupo-lista"><h4>${esc(grupo)}</h4>${items
          .map((item, i) => {
            const id = `${grupo}-${i}`;
            total++;
            if (marcados[id]) n++;
            return `<label class="item-lista ${marcados[id] ? "hecho" : ""}"><input type="checkbox" data-id="${esc(id)}" ${marcados[id] ? "checked" : ""} /><span>${esc(item)}</span></label>`;
          })
          .join("")}</div>`)
      .join("");
    document.getElementById("lista-cuenta").textContent = `${n} de ${total} listos`;
    document.getElementById("lista-barra").style.width = `${(n / total) * 100}%`;
  }
  document.getElementById("lista").addEventListener("change", (ev) => {
    const id = ev.target.dataset.id;
    if (!id) return;
    if (ev.target.checked) marcados[id] = true;
    else delete marcados[id];
    guardarLista();
    pintarLista();
  });
  document.getElementById("lista-reiniciar").addEventListener("click", () => {
    if (!confirm("¿Desmarcar todos los puntos de la checklist?")) return;
    marcados = {};
    guardarLista();
    pintarLista();
  });
  pintarLista();

  // ---------- Índice activo al desplazarse ----------
  const enlaces = [...document.querySelectorAll("#indice a")];
  const secciones = enlaces.map((a) => document.querySelector(a.getAttribute("href"))).filter(Boolean);
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
    secciones.forEach((s) => obs.observe(s));
  }

  // ---------- Arranque ----------
  fetch("/viaje/datos.json", { cache: "no-cache" })
    .then((r) => {
      if (!r.ok) throw new Error("No se pudo cargar datos.json");
      return r.json();
    })
    .then((d) => {
      datos = d;
      convertirPrecios();
      tablaEstilos();
      iniciarCalculadora();
    })
    .catch((err) => {
      console.error(err);
      document.getElementById("c-total").textContent = "No se pudieron cargar los precios";
    });
})();
