/* ============================================
   Estudio — lógica de la plataforma
   Contenido: /estudio/contenido/*.json
   Progreso: se guarda en este navegador (localStorage)
   ============================================ */
(function () {
  "use strict";

  const BASE = "/estudio/contenido/";
  const CLAVE = "estudio-progreso-v1";
  const LETRAS = ["A", "B", "C", "D", "E"];
  // Días hasta el próximo repaso según la caja (sistema Leitner)
  const INTERVALOS = [0, 1, 3, 7, 16, 35];

  const app = document.getElementById("app");
  const datos = { materias: [], colecciones: {} };

  // ---------- Utilidades ----------
  const esc = (t) =>
    String(t ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  // Formato mínimo: **negrita**, _cursiva_, `fórmula` y saltos de línea
  const fmt = (t) =>
    esc(t)
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/(^|[\s(])_(.+?)_(?=[\s.,;:)]|$)/g, "$1<em>$2</em>")
      .replace(/`(.+?)`/g, '<span class="formula">$1</span>')
      .replace(/\n/g, "<br>");

  const sinFormato = (t) => String(t ?? "").replace(/\*\*(.+?)\*\*/g, "$1").replace(/`(.+?)`/g, "$1");

  const barajar = (lista) => {
    const c = [...lista];
    for (let i = c.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [c[i], c[j]] = [c[j], c[i]];
    }
    return c;
  };

  const hoy = () => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  };
  const DIA = 86400000;

  // ---------- Progreso ----------
  function vacio() {
    return { completadas: {}, tests: {}, srs: {}, errores: {} };
  }
  let estado = vacio();
  try {
    estado = Object.assign(vacio(), JSON.parse(localStorage.getItem(CLAVE)) || {});
  } catch { /* sin almacenamiento */ }
  function guardar() {
    try { localStorage.setItem(CLAVE, JSON.stringify(estado)); } catch { /* sin almacenamiento */ }
    actualizarContadores();
  }

  // ---------- Acceso al contenido ----------
  const coleccion = (id) => datos.colecciones[id];
  const leccion = (col, id) => coleccion(col)?.lecciones.find((l) => l.id === id);
  const nombreColeccion = (id) => coleccion(id)?.nombre || id;
  const ref = (col, lec) => `${col}/${lec}`;

  function pregunta(qid) {
    const [col, lec, i] = qid.split("/");
    const l = leccion(col, lec);
    const q = l?.preguntas?.[Number(i)];
    return q ? { col, lec, i: Number(i), l, q } : null;
  }

  // ---------- Flashcards automáticas ----------
  // Se generan a partir de: conceptos (en ambos sentidos), ideas clave
  // con palabras en **negrita** (completar) y las preguntas del test.
  function generarTarjetas(col, l) {
    const tarjetas = [];
    (l.conceptos || []).forEach((c, k) => {
      tarjetas.push({ id: `${col}/${l.id}/c${k}`, tipo: "Concepto", frente: `¿Qué es **${c.termino}**?`, reverso: c.definicion });
      tarjetas.push({ id: `${col}/${l.id}/i${k}`, tipo: "¿Qué concepto es?", frente: c.definicion, reverso: `**${c.termino}**` });
    });
    (l.ideasClave || []).forEach((idea, k) => {
      const marcadas = idea.match(/\*\*(.+?)\*\*/g);
      if (marcadas) {
        const oculta = marcadas[0];
        tarjetas.push({
          id: `${col}/${l.id}/k${k}`, tipo: "Completa la idea",
          frente: idea.replace(oculta, "[ … ]").replace(/\*\*(.+?)\*\*/g, "$1"),
          reverso: idea,
        });
      } else {
        tarjetas.push({ id: `${col}/${l.id}/k${k}`, tipo: "Idea clave", frente: "Explica con tus palabras: " + idea.split(":")[0], reverso: idea });
      }
    });
    (l.preguntas || []).forEach((q, k) => {
      if (q.texto) return; // las de lectura necesitan el texto completo; se practican en el test
      tarjetas.push({
        id: `${col}/${l.id}/p${k}`, tipo: "Pregunta",
        frente: q.enunciado,
        reverso: `**${q.alternativas[q.correcta]}**\n\n${q.explicacion}`,
      });
    });
    (l.tarjetas || []).forEach((t, k) => tarjetas.push({ id: `${col}/${l.id}/t${k}`, tipo: "Tarjeta", frente: t.frente, reverso: t.reverso }));
    return tarjetas;
  }

  function todasLasTarjetas() {
    const lista = [];
    for (const [col, c] of Object.entries(datos.colecciones)) {
      for (const l of c.lecciones) lista.push(...generarTarjetas(col, l).map((t) => ({ ...t, col, lec: l.id })));
    }
    return lista;
  }

  const tarjetasPendientes = () => todasLasTarjetas().filter((t) => estado.srs[t.id] && estado.srs[t.id].proxima <= hoy());

  function calificarTarjeta(id, sabia) {
    const s = estado.srs[id] || { caja: 0, proxima: hoy() };
    s.caja = sabia ? Math.min(s.caja + 1, INTERVALOS.length - 1) : 1;
    s.proxima = hoy() + INTERVALOS[s.caja] * DIA;
    estado.srs[id] = s;
    guardar();
  }

  // ---------- Contadores del menú ----------
  function actualizarContadores() {
    if (!datos.materias.length) return;
    const p = tarjetasPendientes().length;
    const e = Object.values(estado.errores).filter((x) => !x.dominada).length;
    document.getElementById("c-repaso").textContent = p || "";
    document.getElementById("c-errores").textContent = e || "";
  }

  // ---------- Componentes ----------
  const miga = (...partes) =>
    `<nav class="miga" aria-label="Ruta">${partes.map(([t, h]) => (h ? `<a href="${h}">${esc(t)}</a>` : esc(t))).join(" / ")}</nav>`;

  function progresoMateria(m) {
    const ids = m.capitulos.flatMap((c) => c.lecciones);
    const hechas = ids.filter((id) => estado.completadas[ref(m.id, id)]).length;
    return { total: ids.length, hechas, pct: ids.length ? Math.round((hechas / ids.length) * 100) : 0 };
  }

  function listaFuentes(fuentes) {
    if (!fuentes?.length) return "";
    return `<ul class="fuentes-lista">${fuentes
      .map((f) => `<li>${f.url ? `<a href="${esc(f.url)}" target="_blank" rel="noopener">${esc(f.titulo)}</a>` : esc(f.titulo)}${f.nota ? ` — ${esc(f.nota)}` : ""}</li>`)
      .join("")}</ul>`;
  }

  // ---------- Páginas ----------
  function paginaInicio() {
    const pendientes = tarjetasPendientes().length;
    const errores = Object.values(estado.errores).filter((x) => !x.dominada).length;
    const completadas = Object.keys(estado.completadas).length;
    const tests = Object.values(estado.tests);
    const promedio = tests.length ? Math.round(tests.reduce((a, t) => a + t.ultimo, 0) / tests.length) : null;

    return `
      <span class="etiqueta">Tu espacio de estudio</span>
      <h1>Aprende desde lo más básico, paso a paso</h1>
      <p class="subtitulo">Lee la lección, repasa con flashcards, ponte a prueba con preguntas tipo PAES y vuelve a tus errores hasta dominarlos.</p>

      <div class="estadisticas">
        <div class="estadistica"><div class="valor">${pendientes}</div><div class="nombre">Flashcards para hoy</div></div>
        <div class="estadistica"><div class="valor">${errores}</div><div class="nombre">Errores por repasar</div></div>
        <div class="estadistica"><div class="valor">${completadas}</div><div class="nombre">Lecciones completadas</div></div>
        <div class="estadistica"><div class="valor">${promedio === null ? "—" : promedio + "%"}</div><div class="nombre">Promedio en tests</div></div>
      </div>

      ${pendientes || errores ? `
      <div class="tarjeta suave" style="margin-bottom:2.5rem">
        <h3>Hoy te conviene empezar por aquí</h3>
        <p style="margin-bottom:1rem">Recuperar lo que ya estudiaste antes de ver contenido nuevo fortalece la memoria a largo plazo.</p>
        <div class="botones">
          ${pendientes ? `<a class="boton" href="#/repaso">Repasar ${pendientes} flashcards</a>` : ""}
          ${errores ? `<a class="boton secundario" href="#/errores/repasar">Repasar errores</a>` : ""}
        </div>
      </div>` : ""}

      <h2>Asignaturas</h2>
      <div class="rejilla" style="margin-bottom:2.5rem">
        ${datos.materias
          .map((m) => {
            const p = progresoMateria(m);
            return `<a class="tarjeta" href="#/m/${m.id}">
              <h3>${esc(m.nombre)}</h3>
              <p>${esc(m.descripcion)}</p>
              <div class="barra"><span style="width:${p.pct}%"></span></div>
              <p class="tenue" style="margin-top:.5rem">${p.hechas} de ${p.total} lecciones</p>
            </a>`;
          })
          .join("")}
      </div>

      <div class="rejilla-2">
        <a class="tarjeta" href="#/aprender"><span class="etiqueta">Neurociencia y psicología</span><h3>Aprender a aprender</h3><p>Qué dice la evidencia sobre cómo funciona la memoria y cómo estudiar mejor.</p></a>
        <a class="tarjeta" href="#/pdf"><span class="etiqueta">Tus documentos</span><h3>Lecciones desde PDF</h3><p>Lecciones detalladas creadas a partir de los PDF que adjuntes.</p></a>
      </div>

      <hr class="separador" />
      <h3>Tu progreso</h3>
      <p class="tenue">Se guarda solo en este navegador. Para no perderlo o pasarlo a otro dispositivo, descarga una copia.</p>
      <div class="botones">
        <button class="boton secundario chico" data-accion="exportar">Descargar copia del progreso</button>
        <label class="boton secundario chico" style="cursor:pointer">Restaurar copia<input type="file" accept="application/json" data-accion="importar" hidden /></label>
      </div>`;
  }

  function paginaMateria(id) {
    const m = datos.materias.find((x) => x.id === id);
    if (!m) return paginaNoEncontrada();
    const col = coleccion(id);
    const totalPreguntas = col.lecciones.reduce((a, l) => a + (l.preguntas?.length || 0), 0);

    return `
      ${miga(["Inicio", "#/"], [m.nombre])}
      <h1>${esc(m.nombre)}</h1>
      <p class="subtitulo">${esc(m.descripcion)}</p>
      <div class="botones" style="margin:1.25rem 0 2rem">
        ${totalPreguntas >= 4 ? `<a class="boton" href="#/ensayo/${m.id}">Ensayo mixto de ${esc(m.nombre)}</a>` : ""}
      </div>
      ${m.capitulos
        .map(
          (c, i) => `
        <section class="capitulo">
          <div class="capitulo-cabeza">
            <span class="capitulo-num">Capítulo ${i + 1}</span>
            <div><h2>${esc(c.titulo)}</h2>${c.descripcion ? `<p>${esc(c.descripcion)}</p>` : ""}</div>
          </div>
          ${c.lecciones.length
            ? `<ul class="lista-lecciones">${c.lecciones
                .map((lid, j) => {
                  const l = leccion(id, lid);
                  if (!l) return "";
                  const r = ref(id, lid);
                  const t = estado.tests[r];
                  return `<li><a class="fila" href="#/l/${id}/${lid}">
                    <span class="marca-estado ${estado.completadas[r] ? "hecha" : ""}">${estado.completadas[r] ? "✓" : ""}</span>
                    <span class="titulo">${i + 1}.${j + 1} ${esc(l.titulo)}<small>${esc(l.resumen)}</small></span>
                    ${t ? `<span class="nota-test">Test ${t.mejor}%</span>` : ""}
                  </a></li>`;
                })
                .join("")}</ul>`
            : `<p class="proximamente">Próximamente: ${esc(c.temas || "lecciones en preparación")}</p>`}
        </section>`
        )
        .join("")}`;
  }

  function paginaLeccion(col, id) {
    const c = coleccion(col);
    const l = leccion(col, id);
    if (!l) return paginaNoEncontrada();
    const r = ref(col, id);
    const hecha = estado.completadas[r];
    const nTarjetas = generarTarjetas(col, l).length;
    const nPreg = l.preguntas?.length || 0;
    const volver = col === "aprender" ? ["Aprender a aprender", "#/aprender"] : col === "pdf" ? ["Lecciones desde PDF", "#/pdf"] : [c.nombre, `#/m/${col}`];

    const secciones = (l.secciones || [])
      .map(
        (s) => `
        <section class="seccion-leccion">
          <h2>${esc(s.titulo)}</h2>
          ${(s.texto || []).map((p) => `<p>${fmt(p)}</p>`).join("")}
          ${s.lista ? `<ul>${s.lista.map((x) => `<li>${fmt(x)}</li>`).join("")}</ul>` : ""}
          ${s.recuadro ? `<div class="recuadro">${fmt(s.recuadro)}</div>` : ""}
          ${s.ejemplo ? `
            <div class="ejemplo">
              <span class="etiqueta">Ejemplo resuelto</span>
              <p>${fmt(s.ejemplo.enunciado)}</p>
              <ol>${s.ejemplo.pasos.map((p) => `<li>${fmt(p)}</li>`).join("")}</ol>
            </div>` : ""}
        </section>`
      )
      .join("");

    return `
      ${miga(["Inicio", "#/"], volver, [l.titulo])}
      <header class="leccion-cabeza">
        ${l.documento ? `<span class="etiqueta">Basada en: ${esc(l.documento)}</span>` : ""}
        <h1>${esc(l.titulo)}</h1>
        <p class="subtitulo">${esc(l.resumen)}</p>
        <div class="acciones-leccion">
          ${nTarjetas ? `<a class="boton secundario" href="#/f/${col}/${id}">Flashcards (${nTarjetas})</a>` : ""}
          ${nPreg ? `<a class="boton secundario" href="#/t/${col}/${id}">Test tipo PAES (${nPreg})</a>` : ""}
        </div>
      </header>

      ${l.objetivos?.length ? `<div class="tarjeta suave objetivos"><h3>Al terminar podrás…</h3><ul>${l.objetivos.map((o) => `<li>${fmt(o)}</li>`).join("")}</ul></div>` : ""}

      ${secciones}

      ${l.conceptos?.length ? `
        <section class="seccion-leccion">
          <h2>Conceptos clave</h2>
          <dl class="conceptos">${l.conceptos.map((k) => `<div class="concepto"><dt>${esc(k.termino)}</dt><dd>${fmt(k.definicion)}</dd></div>`).join("")}</dl>
        </section>` : ""}

      ${l.ideasClave?.length ? `
        <section class="seccion-leccion">
          <h2>Para recordar</h2>
          <ul>${l.ideasClave.map((x) => `<li>${fmt(x)}</li>`).join("")}</ul>
        </section>` : ""}

      ${l.referencias?.length ? `
        <section class="seccion-leccion">
          <h2>Referencias</h2>
          <ol class="referencias">${l.referencias.map((x) => `<li>${fmt(x.cita)}${x.url ? ` <a href="${esc(x.url)}" target="_blank" rel="noopener">Ver</a>` : ""}</li>`).join("")}</ol>
        </section>` : ""}

      ${l.fuentes?.length ? `<section class="seccion-leccion"><h2>Fuentes y para profundizar</h2>${listaFuentes(l.fuentes)}</section>` : ""}

      <div class="cierre-leccion">
        <button class="boton ${hecha ? "secundario" : ""}" data-accion="completar" data-ref="${esc(r)}">${hecha ? "✓ Lección completada" : "Marcar como completada"}</button>
        <div class="botones">
          ${nTarjetas ? `<a class="boton secundario" href="#/f/${col}/${id}">Repasar con flashcards</a>` : ""}
          ${nPreg ? `<a class="boton" href="#/t/${col}/${id}">Hacer el test</a>` : ""}
        </div>
      </div>`;
  }

  // ---------- Sesión de flashcards ----------
  let sesion = null;

  function iniciarFlashcards(tarjetas, titulo, volver) {
    sesion = { cola: barajar(tarjetas), hechas: 0, total: tarjetas.length, titulo, volver, aciertos: 0 };
    mostrarTarjeta();
  }

  function mostrarTarjeta() {
    if (!sesion) return;
    if (!sesion.cola.length) {
      app.innerHTML = `
        <div class="flash-zona vacio">
          <span class="etiqueta">Sesión terminada</span>
          <h1>¡Bien hecho!</h1>
          <p>Repasaste ${sesion.total} tarjetas. Las que marcaste como sabidas volverán en unos días; las otras, antes.</p>
          <div class="botones" style="justify-content:center">
            <a class="boton" href="${sesion.volver[1]}">Volver a ${esc(sesion.volver[0])}</a>
            <a class="boton secundario" href="#/">Ir al inicio</a>
          </div>
        </div>`;
      sesion = null;
      actualizarContadores();
      return;
    }
    const t = sesion.cola[0];
    const caja = estado.srs[t.id]?.caja || 0;
    app.innerHTML = `
      ${miga(["Inicio", "#/"], sesion.volver, ["Flashcards"])}
      <div class="flash-zona">
        <h1 style="font-size:1.4rem">${esc(sesion.titulo)}</h1>
        <div class="flash-progreso"><span>Quedan ${sesion.cola.length}</span><span>Repasadas ${sesion.hechas}</span></div>
        <div class="barra"><span style="width:${(sesion.hechas / (sesion.hechas + sesion.cola.length)) * 100}%"></span></div>
        <button class="flash" data-accion="girar" aria-label="Girar tarjeta">
          <div class="flash-interior">
            <div class="flash-cara"><span class="tipo">${esc(t.tipo)}</span><div class="texto">${fmt(t.frente)}</div></div>
            <div class="flash-cara flash-atras"><span class="tipo">Respuesta</span><div class="texto">${fmt(t.reverso)}</div></div>
          </div>
        </button>
        <div class="flash-acciones">
          <button class="boton secundario" data-accion="no-sabia">No lo sabía</button>
          <button class="boton" data-accion="sabia">Lo sabía</button>
        </div>
        <p class="flash-ayuda">Intenta responder en voz alta o por escrito antes de girar la tarjeta.</p>
        <div class="caja-leitner" title="Nivel de dominio de esta tarjeta">${[1, 2, 3, 4, 5].map((n) => `<span class="${caja >= n ? "llena" : ""}"></span>`).join("")}</div>
      </div>`;
  }

  function responderTarjeta(sabia) {
    const t = sesion.cola.shift();
    calificarTarjeta(t.id, sabia);
    sesion.hechas++;
    // Si no la sabías, vuelve a aparecer al final de esta misma sesión
    if (!sabia) sesion.cola.push(t);
    mostrarTarjeta();
  }

  // ---------- Tests tipo PAES ----------
  let test = null;

  function iniciarTest(items, titulo, volver, clave) {
    test = {
      items: items.map((it) => ({ ...it, orden: barajar(it.q.alternativas.map((_, k) => k)) })),
      respuestas: [], actual: 0, titulo, volver, clave, inicio: Date.now(), corregido: false,
    };
    mostrarPregunta();
  }

  function mostrarPregunta() {
    const { items, actual, respuestas } = test;
    const it = items[actual];
    const q = it.q;
    app.innerHTML = `
      ${miga(["Inicio", "#/"], test.volver, ["Test"])}
      <div class="test">
        <div class="test-cabeza"><strong style="color:var(--texto)">${esc(test.titulo)}</strong><span>Pregunta ${actual + 1} de ${items.length}</span></div>
        <div class="puntos-nav">${items
          .map((_, k) => `<button class="punto ${respuestas[k] !== undefined ? "respondida" : ""} ${k === actual ? "actual" : ""}" data-accion="ir" data-k="${k}" aria-label="Pregunta ${k + 1}">${k + 1}</button>`)
          .join("")}</div>
        ${q.texto ? `<div class="texto-base">${q.texto.split("\n\n").map((p) => `<p>${fmt(p)}</p>`).join("")}</div>` : ""}
        <p class="enunciado">${fmt(q.enunciado)}</p>
        <div class="alternativas">
          ${it.orden
            .map(
              (k, pos) => `<button class="alternativa ${respuestas[actual] === k ? "elegida" : ""}" data-accion="elegir" data-k="${k}">
                <span class="letra">${LETRAS[pos]}</span><span>${fmt(q.alternativas[k])}</span></button>`
            )
            .join("")}
        </div>
        <div class="test-pie">
          <button class="boton secundario" data-accion="anterior" ${actual === 0 ? "disabled" : ""}>Anterior</button>
          ${actual < items.length - 1
            ? `<button class="boton" data-accion="siguiente">Siguiente</button>`
            : `<button class="boton" data-accion="entregar">Entregar y corregir</button>`}
        </div>
      </div>`;
  }

  function corregirTest() {
    const { items, respuestas } = test;
    let buenas = 0;
    items.forEach((it, k) => {
      const qid = `${it.col}/${it.lec}/${it.i}`;
      if (respuestas[k] === it.q.correcta) {
        buenas++;
        const e = estado.errores[qid];
        if (e) { e.aciertos = (e.aciertos || 0) + 1; if (e.aciertos >= 2) e.dominada = true; }
      } else {
        // Las preguntas incorrectas u omitidas van al banco de errores
        estado.errores[qid] = { fecha: Date.now(), aciertos: 0, dominada: false, veces: (estado.errores[qid]?.veces || 0) + 1, elegida: respuestas[k] ?? null };
      }
    });
    const pct = Math.round((buenas / items.length) * 100);
    if (test.clave) {
      const prev = estado.tests[test.clave];
      estado.tests[test.clave] = { ultimo: pct, mejor: Math.max(pct, prev?.mejor || 0), intentos: (prev?.intentos || 0) + 1 };
    }
    guardar();
    test.corregido = true;
    test.buenas = buenas;
    mostrarResultado();
  }

  function revisionPregunta(it, elegida, k, opciones = {}) {
    const q = it.q;
    const orden = it.orden || q.alternativas.map((_, n) => n);
    const estadoQ = elegida === undefined || elegida === null ? "omitida" : elegida === q.correcta ? "bien" : "mal";
    const sello = { bien: "Correcta", mal: "Incorrecta", omitida: "Omitida" }[estadoQ];
    const qid = `${it.col}/${it.lec}/${it.i}`;
    const enBanco = !!estado.errores[qid];
    return `
      <article class="revision">
        <div class="revision-cabeza">
          <span class="tenue">${k !== null ? `Pregunta ${k + 1} · ` : ""}${esc(nombreColeccion(it.col))} · ${esc(it.l.titulo)}</span>
          ${opciones.sinSello ? "" : `<span class="sello ${estadoQ}">${sello}</span>`}
        </div>
        ${q.texto ? `<details style="margin-bottom:1rem"><summary class="tenue" style="cursor:pointer">Ver el texto</summary><div class="texto-base" style="margin-top:.75rem">${q.texto.split("\n\n").map((p) => `<p>${fmt(p)}</p>`).join("")}</div></details>` : ""}
        <p class="enunciado">${fmt(q.enunciado)}</p>
        <div class="alternativas">
          ${orden
            .map((n, pos) => {
              const cls = n === q.correcta ? "correcta" : n === elegida ? "incorrecta" : "";
              return `<button class="alternativa ${cls}" disabled><span class="letra">${LETRAS[pos]}</span><span>${fmt(q.alternativas[n])}${n === elegida ? ' <span class="tenue">(tu respuesta)</span>' : ""}</span></button>`;
            })
            .join("")}
        </div>
        <div class="explicacion">
          <h4>Por qué es correcta</h4>
          <p>${fmt(q.explicacion)}</p>
          <h4>Por qué las otras no</h4>
          <ul class="descartes">
            ${orden
              .map((n, pos) => (n === q.correcta || !q.descartes?.[n] ? "" : `<li><span class="letra-chica">${LETRAS[pos]})</span>${fmt(q.descartes[n])}</li>`))
              .join("")}
          </ul>
          ${q.metodos?.length ? `
            <h4>Dos formas de resolverla</h4>
            <div class="metodos">
              ${q.metodos.map((m, j) => `<div class="metodo"><h5>Método ${j + 1}: ${esc(m.nombre)}</h5><ol>${m.pasos.map((p) => `<li>${fmt(p)}</li>`).join("")}</ol></div>`).join("")}
            </div>` : ""}
        </div>
        ${opciones.sinBoton ? "" : `<div style="margin-top:1rem">
          <button class="boton secundario chico" data-accion="${enBanco ? "quitar-error" : "guardar-error"}" data-qid="${esc(qid)}">${enBanco ? "Quitar del banco de errores" : "Guardar en banco de errores"}</button>
        </div>`}
      </article>`;
  }

  function mostrarResultado() {
    const { items, respuestas, buenas } = test;
    const pct = Math.round((buenas / items.length) * 100);
    const minutos = Math.max(1, Math.round((Date.now() - test.inicio) / 60000));
    const malas = items.length - buenas;
    app.innerHTML = `
      ${miga(["Inicio", "#/"], test.volver, ["Resultado"])}
      <div class="test">
        <div class="tarjeta resultado-cabeza">
          <span class="etiqueta">${esc(test.titulo)}</span>
          <div class="nota">${buenas}/${items.length}</div>
          <p class="tenue">${pct}% de logro · ${minutos} min</p>
          <p>${pct === 100 ? "Excelente. Vuelve a probarte en unos días para fijarlo." : pct >= 60 ? "Buen trabajo. Revisa las explicaciones de las que fallaste." : "Lee con calma cada explicación: equivocarse y corregir es una de las formas más eficaces de aprender."}</p>
          ${malas ? `<p class="tenue">${malas} ${malas === 1 ? "pregunta quedó guardada" : "preguntas quedaron guardadas"} en tu banco de errores.</p>` : ""}
          <div class="botones" style="justify-content:center">
            <button class="boton" data-accion="repetir-test">Intentar de nuevo</button>
            <a class="boton secundario" href="${test.volver[1]}">Volver</a>
          </div>
        </div>
        <h2>Revisión pregunta por pregunta</h2>
        ${items.map((it, k) => revisionPregunta(it, respuestas[k], k)).join("")}
      </div>`;
  }

  function paginaTest(col, id) {
    const l = leccion(col, id);
    if (!l || !l.preguntas?.length) return paginaNoEncontrada();
    const volver = [l.titulo, `#/l/${col}/${id}`];
    iniciarTest(l.preguntas.map((q, i) => ({ col, lec: id, i, l, q })), `Test: ${l.titulo}`, volver, ref(col, id));
    return null;
  }

  function paginaEnsayo(col) {
    const c = coleccion(col);
    if (!c) return paginaNoEncontrada();
    const todas = c.lecciones.flatMap((l) => (l.preguntas || []).map((q, i) => ({ col, lec: l.id, i, l, q })));
    if (!todas.length) return paginaNoEncontrada();
    iniciarTest(barajar(todas).slice(0, 10), `Ensayo mixto: ${c.nombre}`, [c.nombre, `#/m/${col}`], null);
    return null;
  }

  // ---------- Repaso espaciado ----------
  function paginaRepaso() {
    const pendientes = tarjetasPendientes();
    const activas = Object.keys(estado.srs).length;
    if (!pendientes.length) {
      const proximas = Object.values(estado.srs).map((s) => s.proxima).filter((p) => p > hoy()).sort((a, b) => a - b);
      const prox = proximas[0] ? Math.round((proximas[0] - hoy()) / DIA) : null;
      return `
        ${miga(["Inicio", "#/"], ["Repaso"])}
        <h1>Repaso de flashcards</h1>
        <p class="subtitulo">Aquí aparecen las tarjetas que ya estudiaste cuando llega el momento de repasarlas: justo antes de que se te olviden.</p>
        <div class="tarjeta suave vacio" style="margin-top:2rem">
          ${activas
            ? `<h3>No tienes tarjetas pendientes hoy</h3><p>${prox ? `Las próximas vuelven en ${prox} ${prox === 1 ? "día" : "días"}.` : ""} Mientras tanto, puedes avanzar con una lección nueva.</p>`
            : `<h3>Aún no has estudiado flashcards</h3><p>Abre cualquier lección y pulsa «Flashcards». Desde ahí entrarán al repaso automático.</p>`}
        </div>
        <hr class="separador" />
        <h3>¿Cómo funciona?</h3>
        <p class="tenue">Cada tarjeta tiene un nivel (las barritas bajo la tarjeta). Si la sabías, sube de nivel y vuelve más tarde: 1, 3, 7, 16 y 35 días. Si no la sabías, vuelve al nivel 1 y se repite mañana. Es el sistema Leitner, una forma sencilla de práctica espaciada.</p>`;
    }
    iniciarFlashcards(pendientes, `Repaso de hoy (${pendientes.length})`, ["Inicio", "#/"]);
    return null;
  }

  // ---------- Banco de errores ----------
  let filtroErrores = "todas";

  function paginaErrores() {
    const lista = Object.entries(estado.errores)
      .map(([qid, e]) => ({ qid, e, p: pregunta(qid) }))
      .filter((x) => x.p)
      .sort((a, b) => a.e.dominada - b.e.dominada || b.e.fecha - a.e.fecha);
    const cols = [...new Set(lista.map((x) => x.p.col))];
    const visibles = lista.filter((x) => filtroErrores === "todas" || x.p.col === filtroErrores);
    const pendientes = lista.filter((x) => !x.e.dominada).length;

    return `
      ${miga(["Inicio", "#/"], ["Banco de errores"])}
      <h1>Banco de errores</h1>
      <p class="subtitulo">Aquí quedan guardadas las preguntas que respondiste mal u omitiste. Repásalas hasta acertarlas dos veces seguidas: entonces se marcan como dominadas.</p>
      ${lista.length
        ? `
        <div class="botones" style="margin:1.25rem 0">
          <a class="boton ${pendientes ? "" : "secundario"}" href="#/errores/repasar">Repasar ${pendientes} pendientes</a>
        </div>
        <div class="filtros">
          <button class="chip ${filtroErrores === "todas" ? "activo" : ""}" data-accion="filtro" data-col="todas">Todas (${lista.length})</button>
          ${cols.map((c) => `<button class="chip ${filtroErrores === c ? "activo" : ""}" data-accion="filtro" data-col="${c}">${esc(nombreColeccion(c))}</button>`).join("")}
        </div>
        ${visibles
          .map(
            ({ qid, e, p }) => `
          <div class="error-item ${e.dominada ? "dominada" : ""}">
            <div>
              <div class="meta">${esc(nombreColeccion(p.col))} · ${esc(p.l.titulo)} · ${e.dominada ? "Dominada" : `Fallada ${e.veces || 1} ${(e.veces || 1) === 1 ? "vez" : "veces"}`}</div>
              <p>${fmt(p.q.enunciado)}</p>
            </div>
            <div class="botones" style="flex-shrink:0">
              <a class="boton secundario chico" href="#/errores/ver/${encodeURIComponent(qid)}">Ver solución</a>
              <button class="boton secundario chico" data-accion="quitar-error" data-qid="${esc(qid)}" aria-label="Quitar">Quitar</button>
            </div>
          </div>`
          )
          .join("")}`
        : `<div class="tarjeta suave vacio" style="margin-top:2rem"><h3>Tu banco está vacío</h3><p>Cuando falles una pregunta en un test, se guardará aquí automáticamente. También puedes guardar a mano las que acertaste por suerte.</p></div>`}`;
  }

  function paginaVerError(qid) {
    const p = pregunta(decodeURIComponent(qid));
    if (!p) return paginaNoEncontrada();
    const e = estado.errores[p.col + "/" + p.lec + "/" + p.i];
    return `
      ${miga(["Inicio", "#/"], ["Banco de errores", "#/errores"], ["Solución"])}
      <div class="test">
        ${revisionPregunta({ ...p }, e?.elegida ?? undefined, null, { sinSello: e?.elegida === undefined || e?.elegida === null })}
        <div class="botones"><a class="boton secundario" href="#/l/${p.col}/${p.lec}">Volver a la lección</a><a class="boton" href="#/errores">Volver al banco</a></div>
      </div>`;
  }

  function paginaRepasarErrores() {
    const items = Object.entries(estado.errores)
      .filter(([, e]) => !e.dominada)
      .map(([qid]) => pregunta(qid))
      .filter(Boolean);
    if (!items.length) {
      return `${miga(["Inicio", "#/"], ["Banco de errores", "#/errores"], ["Repasar"])}
        <div class="tarjeta suave vacio"><h3>No hay errores pendientes</h3><p>¡Todo dominado! Haz un test o un ensayo mixto para seguir practicando.</p><a class="boton" href="#/">Ir al inicio</a></div>`;
    }
    iniciarTest(barajar(items).slice(0, 15), "Repaso del banco de errores", ["Banco de errores", "#/errores"], null);
    return null;
  }

  // ---------- Secciones especiales ----------
  function paginaColeccionLibre(col, titulo, intro, vacioHtml) {
    const c = coleccion(col);
    const lecciones = c?.lecciones || [];
    return `
      ${miga(["Inicio", "#/"], [titulo])}
      ${intro}
      ${lecciones.length
        ? `<div class="capitulo" style="margin-top:2rem"><ul class="lista-lecciones">${lecciones
            .map((l, i) => {
              const r = ref(col, l.id);
              const t = estado.tests[r];
              return `<li><a class="fila" href="#/l/${col}/${l.id}">
                <span class="marca-estado ${estado.completadas[r] ? "hecha" : ""}">${estado.completadas[r] ? "✓" : ""}</span>
                <span class="titulo">${i + 1}. ${esc(l.titulo)}<small>${esc(l.resumen)}</small></span>
                ${t ? `<span class="nota-test">Test ${t.mejor}%</span>` : ""}
              </a></li>`;
            })
            .join("")}</ul></div>`
        : vacioHtml}`;
  }

  function paginaAprender() {
    return paginaColeccionLibre(
      "aprender",
      "Aprender a aprender",
      `<span class="etiqueta">Neurociencia y psicología del aprendizaje</span>
       <h1>Aprender a aprender</h1>
       <p class="subtitulo">Cómo se forma un recuerdo, por qué olvidamos y qué técnicas de estudio tienen respaldo científico sólido. Cada lección cita sus fuentes: revisiones sistemáticas, metaanálisis y artículos de revistas con revisión por pares.</p>
       <p class="aviso" style="margin-top:1.25rem">La ciencia avanza: aquí se distingue entre lo que tiene evidencia robusta y lo que todavía es incierto o fue exagerado.</p>`,
      `<p class="vacio">Pronto habrá contenido aquí.</p>`
    );
  }

  function paginaPdf() {
    return paginaColeccionLibre(
      "pdf",
      "Lecciones desde PDF",
      `<span class="etiqueta">Tus documentos</span>
       <h1>Lecciones desde PDF</h1>
       <p class="subtitulo">Lecciones detalladas y fáciles de entender creadas a partir de los PDF que adjuntes. Cada una incluye flashcards, test tipo PAES y entra en tu banco de errores, igual que las demás. No hay límite.</p>
       <div class="tarjeta suave" style="margin-top:1.5rem">
         <h3>Cómo crear una lección nueva</h3>
         <ol style="margin:0">
           <li>Abre Claude (en el chat donde trabajas este proyecto) y adjunta el PDF.</li>
           <li>Escribe, por ejemplo: <em>«Crea una lección para la sección de PDF del sitio de estudio con este documento»</em>. Puedes pedir varias lecciones de un mismo PDF, o indicar capítulos o páginas.</li>
           <li>Claude agrega la lección al archivo <code>estudio/contenido/pdf.json</code> y la sube a GitHub. En uno o dos minutos aparece aquí.</li>
         </ol>
       </div>`,
      `<div class="vacio"><p>Todavía no hay lecciones creadas desde PDF.</p></div>`
    );
  }

  function paginaFuentes() {
    const fuentes = new Map();
    for (const c of Object.values(datos.colecciones)) {
      for (const l of c.lecciones) for (const f of l.fuentes || []) if (f.url) fuentes.set(f.url, f);
    }
    const refs = (coleccion("aprender")?.lecciones || []).flatMap((l) => l.referencias || []);
    const unicas = [...new Map(refs.map((r) => [r.cita, r])).values()].sort((a, b) => a.cita.localeCompare(b.cita));
    return `
      ${miga(["Inicio", "#/"], ["Fuentes"])}
      <h1>Fuentes</h1>
      <p class="subtitulo">El contenido se basa en libros de texto abiertos con revisión por pares, organismos oficiales y literatura científica. Úsalas para profundizar.</p>
      <h2 style="margin-top:2rem">Libros y recursos de referencia</h2>
      ${listaFuentes([...fuentes.values()].sort((a, b) => a.titulo.localeCompare(b.titulo)))}
      <h2 style="margin-top:2rem">Literatura científica (Aprender a aprender)</h2>
      <ol class="referencias">${unicas.map((x) => `<li>${fmt(x.cita)}${x.url ? ` <a href="${esc(x.url)}" target="_blank" rel="noopener">Ver</a>` : ""}</li>`).join("")}</ol>
      <p class="aviso" style="margin-top:2rem">Las preguntas son de estilo PAES (formato de alternativas y habilidades evaluadas), pero no son preguntas oficiales del DEMRE. Para ensayos oficiales y temarios vigentes revisa <a href="https://demre.cl" target="_blank" rel="noopener">demre.cl</a>.</p>`;
  }

  function paginaFlashcards(col, id) {
    const l = leccion(col, id);
    if (!l) return paginaNoEncontrada();
    const tarjetas = generarTarjetas(col, l);
    if (!tarjetas.length) return paginaNoEncontrada();
    iniciarFlashcards(tarjetas, `Flashcards: ${l.titulo}`, [l.titulo, `#/l/${col}/${id}`]);
    return null;
  }

  function paginaNoEncontrada() {
    return `<div class="vacio"><h1>No encontramos esta página</h1><a class="boton" href="#/">Volver al inicio</a></div>`;
  }

  // ---------- Rutas ----------
  function navegar() {
    const partes = location.hash.replace(/^#\/?/, "").split("/").filter(Boolean);
    const [r, a, b] = partes;
    sesion = null;
    test = null;
    let html;
    switch (r) {
      case undefined: html = paginaInicio(); break;
      case "m": html = paginaMateria(a); break;
      case "l": html = paginaLeccion(a, b); break;
      case "f": html = paginaFlashcards(a, b); break;
      case "t": html = paginaTest(a, b); break;
      case "ensayo": html = paginaEnsayo(a); break;
      case "repaso": html = paginaRepaso(); break;
      case "errores":
        html = a === "repasar" ? paginaRepasarErrores() : a === "ver" ? paginaVerError(partes.slice(2).join("/")) : paginaErrores();
        break;
      case "pdf": html = paginaPdf(); break;
      case "aprender": html = paginaAprender(); break;
      case "fuentes": html = paginaFuentes(); break;
      default: html = paginaNoEncontrada();
    }
    if (html !== null) app.innerHTML = html;

    const activa = r === "m" ? "m-" + a : r === "l" || r === "f" || r === "t" ? (a === "aprender" || a === "pdf" ? a : "m-" + a) : r === "ensayo" ? "m-" + a : r || "inicio";
    document.querySelectorAll(".nav a").forEach((el) => el.classList.toggle("activo", el.dataset.ruta === activa));
    cerrarMenu();
    window.scrollTo(0, 0);
  }

  // ---------- Eventos ----------
  const lateral = document.getElementById("lateral");
  const botonMenu = document.getElementById("boton-menu");
  function cerrarMenu() {
    lateral.classList.remove("abierto");
    botonMenu.setAttribute("aria-expanded", "false");
    botonMenu.textContent = "Menú";
  }
  botonMenu.addEventListener("click", () => {
    const abierto = lateral.classList.toggle("abierto");
    botonMenu.setAttribute("aria-expanded", String(abierto));
    botonMenu.textContent = abierto ? "Cerrar" : "Menú";
  });

  app.addEventListener("click", (ev) => {
    const el = ev.target.closest("[data-accion]");
    if (!el) return;
    const accion = el.dataset.accion;

    if (accion === "completar") {
      const r = el.dataset.ref;
      if (estado.completadas[r]) delete estado.completadas[r];
      else estado.completadas[r] = Date.now();
      guardar();
      el.classList.toggle("secundario", !!estado.completadas[r]);
      el.textContent = estado.completadas[r] ? "✓ Lección completada" : "Marcar como completada";
    }

    if (accion === "girar") el.classList.toggle("girada");
    if (accion === "sabia" && sesion) responderTarjeta(true);
    if (accion === "no-sabia" && sesion) responderTarjeta(false);

    if (test && !test.corregido) {
      if (accion === "elegir") { test.respuestas[test.actual] = Number(el.dataset.k); mostrarPregunta(); }
      if (accion === "siguiente") { test.actual++; mostrarPregunta(); }
      if (accion === "anterior") { test.actual--; mostrarPregunta(); }
      if (accion === "ir") { test.actual = Number(el.dataset.k); mostrarPregunta(); }
      if (accion === "entregar") {
        const sin = test.items.length - test.respuestas.filter((x) => x !== undefined).length;
        if (sin && !confirm(`Te ${sin === 1 ? "queda 1 pregunta" : `quedan ${sin} preguntas`} sin responder. ¿Entregar de todas formas?`)) return;
        corregirTest();
      }
    }
    if (accion === "repetir-test" && test) {
      iniciarTest(test.items.map(({ orden, ...it }) => it), test.titulo, test.volver, test.clave);
      window.scrollTo(0, 0);
    }

    if (accion === "guardar-error" || accion === "quitar-error") {
      const qid = el.dataset.qid;
      if (accion === "guardar-error") estado.errores[qid] = { fecha: Date.now(), aciertos: 0, dominada: false, veces: 1, elegida: null };
      else delete estado.errores[qid];
      guardar();
      if (test) {
        el.dataset.accion = accion === "guardar-error" ? "quitar-error" : "guardar-error";
        el.textContent = accion === "guardar-error" ? "Quitar del banco de errores" : "Guardar en banco de errores";
      } else navegar();
    }

    if (accion === "filtro") { filtroErrores = el.dataset.col; app.innerHTML = paginaErrores(); }

    if (accion === "exportar") {
      const blob = new Blob([JSON.stringify(estado, null, 2)], { type: "application/json" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `progreso-estudio-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(a.href);
    }
  });

  app.addEventListener("change", (ev) => {
    const input = ev.target.closest('[data-accion="importar"]');
    if (!input?.files?.[0]) return;
    input.files[0].text().then((txt) => {
      try {
        const nuevo = JSON.parse(txt);
        if (typeof nuevo !== "object" || !nuevo.srs) throw new Error();
        if (!confirm("Esto reemplazará el progreso guardado en este navegador. ¿Continuar?")) return;
        estado = Object.assign(vacio(), nuevo);
        guardar();
        navegar();
      } catch {
        alert("El archivo no parece una copia válida del progreso.");
      }
    });
  });

  document.addEventListener("keydown", (ev) => {
    if (ev.target.closest("input, textarea, select")) return;
    if (sesion) {
      if (ev.key === " ") { ev.preventDefault(); document.querySelector(".flash")?.classList.toggle("girada"); }
      if (ev.key === "1") responderTarjeta(false);
      if (ev.key === "2") responderTarjeta(true);
    }
  });

  // ---------- Arranque ----------
  async function cargar(nombre) {
    const r = await fetch(BASE + nombre + ".json", { cache: "no-cache" });
    if (!r.ok) throw new Error(`No se pudo cargar ${nombre}.json`);
    try { return await r.json(); } catch { throw new Error(`El archivo ${nombre}.json tiene un error de formato`); }
  }

  (async () => {
    try {
      const indice = await cargar("materias");
      datos.materias = indice.materias;
      const ids = [...datos.materias.map((m) => m.id), "aprender", "pdf"];
      const archivos = await Promise.all(ids.map(cargar));
      ids.forEach((id, k) => {
        const m = datos.materias.find((x) => x.id === id);
        datos.colecciones[id] = { nombre: m ? m.nombre : id === "aprender" ? "Aprender a aprender" : "PDF", lecciones: archivos[k].lecciones || [] };
      });
      document.getElementById("nav-materias").innerHTML = datos.materias
        .map((m) => `<a href="#/m/${m.id}" data-ruta="m-${m.id}">${esc(m.nombre)}</a>`)
        .join("");
      window.addEventListener("hashchange", navegar);
      actualizarContadores();
      navegar();
    } catch (err) {
      app.innerHTML = `<div class="vacio"><h1>No se pudo cargar el contenido</h1><p>${esc(err.message)}</p></div>`;
      console.error(err);
    }
  })();
})();
