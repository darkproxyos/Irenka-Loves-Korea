/* ============================================
   Irenka Loves Korea — lógica del sitio
   El contenido vive en /contenido/*.json
   (no hace falta tocar este archivo para agregar lecciones o palabras).
   ============================================ */
(function () {
  "use strict";

  const app = document.getElementById("app");
  const datos = {};
  const PROGRESO_KEY = "ilk-progreso";
  const TONOS = ["rosa", "lavanda", "menta", "durazno", "cielo", "limon"];

  // ---------- Utilidades ----------
  const esc = (texto) =>
    String(texto ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const barajar = (lista) => {
    const copia = [...lista];
    for (let i = copia.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copia[i], copia[j]] = [copia[j], copia[i]];
    }
    return copia;
  };

  const dosDigitos = (n) => String(n).padStart(2, "0");

  const romano = (n) => {
    const tabla = [[10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"]];
    let r = "";
    for (const [v, s] of tabla) while (n >= v) { r += s; n -= v; }
    return r;
  };

  const tono = (color) => `var(--tono-${TONOS.includes(color) ? color : "rosa"})`;

  function leerProgreso() {
    try {
      return Object.assign({ lecciones: [], mejorQuiz: 0 }, JSON.parse(localStorage.getItem(PROGRESO_KEY)) || {});
    } catch {
      return { lecciones: [], mejorQuiz: 0 };
    }
  }

  function guardarProgreso(progreso) {
    try { localStorage.setItem(PROGRESO_KEY, JSON.stringify(progreso)); } catch { /* sin almacenamiento */ }
  }

  // Pronunciación con la voz del navegador (si tiene voz coreana)
  function hablar(texto) {
    if (!("speechSynthesis" in window) || !texto) return;
    window.speechSynthesis.cancel();
    const voz = new SpeechSynthesisUtterance(texto);
    voz.lang = "ko-KR";
    voz.rate = 0.8;
    const coreana = window.speechSynthesis.getVoices().find((v) => v.lang && v.lang.toLowerCase().startsWith("ko"));
    if (coreana) voz.voice = coreana;
    window.speechSynthesis.speak(voz);
  }

  const ICONO_AUDIO =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M16.5 8.5a5 5 0 0 1 0 7"/><path d="M19 6a8.5 8.5 0 0 1 0 12"/></svg>';

  const botonAudio = (texto) =>
    `<button class="audio" data-hablar="${esc(texto)}" aria-label="Escuchar ${esc(texto)}" title="Escuchar">${ICONO_AUDIO}</button>`;

  function celebrar(cantidad = 12) {
    for (let i = 0; i < cantidad; i++) {
      const c = document.createElement("span");
      c.className = "destello";
      c.textContent = "✦";
      c.style.left = Math.random() * 100 + "vw";
      c.style.fontSize = 0.8 + Math.random() * 1.2 + "rem";
      c.style.animationDelay = Math.random() * 0.7 + "s";
      document.body.appendChild(c);
      setTimeout(() => c.remove(), 3500);
    }
  }

  const todasLasPalabras = () =>
    datos.vocabulario.categorias.flatMap((cat) => cat.palabras.map((p) => ({ ...p, categoria: cat.id })));

  const encabezado = (etiqueta, titulo, texto, ko) => `
    <header class="encabezado-pagina envoltura">
      ${ko ? `<span class="ko-fondo" lang="ko">${esc(ko)}</span>` : ""}
      <span class="etiqueta">${etiqueta}</span>
      <h1>${titulo}</h1>
      ${texto ? `<p>${texto}</p>` : ""}
    </header>`;

  // ---------- Páginas ----------
  function paginaInicio() {
    const c = datos.config;
    const palabras = todasLasPalabras();
    const hoy = new Date();
    const indice = (hoy.getFullYear() * 372 + hoy.getMonth() * 31 + hoy.getDate()) % palabras.length;
    const palabra = palabras[indice];
    const progreso = leerProgreso();
    const total = datos.lecciones.lecciones.length;
    const hechas = progreso.lecciones.filter((id) => datos.lecciones.lecciones.some((l) => l.id === id)).length;
    const porcentaje = total ? Math.round((hechas / total) * 100) : 0;

    const cinta = palabras
      .slice(0, 12)
      .map((p) => `<span lang="ko">${esc(p.ko)}</span><span>${esc(p.es)}</span><span class="sep" aria-hidden="true">✦</span>`)
      .join("");

    const secciones = [
      ["#/hangul", "El alfabeto Hangul", "Vocales y consonantes, con su sonido."],
      ["#/lecciones", "Lecciones", "Explicaciones breves con ejemplos."],
      ["#/vocabulario", "Vocabulario", "Tarjetas para memorizar por temas."],
      ["#/practica", "Práctica", "Un pequeño examen para ponerte a prueba."],
    ];

    return `
      <section class="envoltura portada">
        <div>
          <span class="etiqueta">${esc(c.saludo)}</span>
          <h1>${esc(c.titulo)}${c.tituloDestacado ? ` <em>${esc(c.tituloDestacado)}</em>` : ""}</h1>
          <p class="descripcion">${esc(c.descripcion)}</p>
          <div class="acciones">
            <a class="boton" href="#/lecciones">Empezar a aprender <span class="flecha">→</span></a>
            <a class="boton contorno" href="#/hangul">Ver el Hangul</a>
          </div>
        </div>
        <div class="arco-marco" aria-hidden="true">
          <div class="arco">
            <span class="ko-grande" lang="ko">한</span>
            <span class="pie-arco">Hangul · 1443</span>
          </div>
          <span class="arco-estrella">✦</span>
          ${c.frase ? `<span class="arco-nota" lang="ko">${esc(c.frase)}</span>` : ""}
        </div>
      </section>

      <div class="cinta" aria-hidden="true"><div class="cinta-pista">${cinta}${cinta}</div></div>

      <section class="seccion">
        <div class="envoltura palabra-dia">
          <span class="numero">Palabra del día</span>
          <div>
            <div class="ko" lang="ko">${esc(palabra.ko)}</div>
            <div class="significado">${esc(palabra.es)}</div>
            <div class="rom">${esc(palabra.rom)}</div>
          </div>
          ${botonAudio(palabra.ko)}
        </div>
      </section>

      <div class="texto-gigante" aria-hidden="true"><span>Learn&nbsp;</span>Korean<span>&nbsp;Learn</span></div>

      <section class="seccion">
        <div class="envoltura indice">
          <div class="indice-intro">
            <span class="etiqueta">El programa</span>
            <h2>Todo lo que <em>necesitas</em></h2>
            <p>Empieza por el alfabeto, sigue con las lecciones y repasa el vocabulario. Cuando quieras, ponte a prueba.</p>
          </div>
          <ul class="lista-indice">
            ${secciones
              .map(
                ([href, titulo, desc], i) => `
              <li><a href="${href}">
                <span class="num">${romano(i + 1)}.</span>
                <span><span class="titulo">${titulo}</span><span class="desc">${desc}</span></span>
                <span class="flecha" aria-hidden="true">→</span>
              </a></li>`
              )
              .join("")}
          </ul>
        </div>
      </section>

      <section class="seccion rosa">
        <div class="envoltura">
          ${c.cita ? `<p class="cita">“${esc(c.cita)}”</p>` : ""}
          <div class="progreso">
            <div>
              <div class="cifra">${hechas}<small> / ${total}</small></div>
              <span class="etiqueta">Lecciones terminadas</span>
              <div class="barra" role="progressbar" aria-label="Progreso de lecciones" aria-valuenow="${porcentaje}" aria-valuemin="0" aria-valuemax="100"><span style="width:${porcentaje}%"></span></div>
            </div>
            <div>
              <div class="cifra">${progreso.mejorQuiz}<small> / 10</small></div>
              <span class="etiqueta">Mejor puntaje</span>
              <div class="barra"><span style="width:${progreso.mejorQuiz * 10}%"></span></div>
            </div>
          </div>
        </div>
      </section>`;
  }

  function paginaHangul(tipo) {
    if (tipo !== "consonantes") tipo = "vocales";
    const letras = datos.hangul[tipo] || [];
    const tarjetas = letras
      .map(
        (l) => `
        <button class="letra" data-hablar="${esc(l.sonido)}" aria-label="${esc(l.letra)}, se lee ${esc(l.rom)}">
          <span class="grande" lang="ko">${esc(l.letra)}</span>
          <span class="rom">${esc(l.rom)}</span>
          ${l.nombre ? `<span class="nombre" lang="ko">${esc(l.nombre)}</span>` : ""}
          ${l.ejemplo ? `<span class="ej"><span lang="ko">${esc(l.ejemplo.ko)}</span> · ${esc(l.ejemplo.es)}</span>` : ""}
        </button>`
      )
      .join("");

    return `
      ${encabezado("Capítulo I", "El alfabeto <em>Hangul</em>", "Toca cada letra para escuchar cómo suena.", "한글")}
      <section class="envoltura" style="padding-bottom:clamp(4rem,8vw,6rem)">
        <div class="pestanas" role="tablist">
          <button class="pestana ${tipo === "vocales" ? "activa" : ""}" data-hangul="vocales" role="tab" aria-selected="${tipo === "vocales"}">Vocales · <span lang="ko">모음</span></button>
          <button class="pestana ${tipo === "consonantes" ? "activa" : ""}" data-hangul="consonantes" role="tab" aria-selected="${tipo === "consonantes"}">Consonantes · <span lang="ko">자음</span></button>
        </div>
        <div class="letras">${tarjetas}</div>
        <div class="nota">
          <span class="num-grande">✦</span>
          <div>
            <span class="etiqueta">¿Sabías que…?</span>
            <h3>Un alfabeto <em>diseñado</em></h3>
            <p>Las vocales se basan en tres símbolos: el cielo (·), la tierra (ㅡ) y la persona (ㅣ). Las consonantes imitan la forma de la boca al pronunciarlas. Por eso Hangul es uno de los alfabetos más fáciles de aprender.</p>
          </div>
        </div>
      </section>`;
  }

  function paginaLecciones() {
    const progreso = leerProgreso();
    const filas = datos.lecciones.lecciones
      .map((l, i) => {
        const hecha = progreso.lecciones.includes(l.id);
        return `
        <li><a class="fila-leccion" href="#/leccion/${encodeURIComponent(l.id)}" style="--tono:${tono(l.color)}">
          <span class="num">${dosDigitos(i + 1)}</span>
          <span>
            <span class="etiqueta">${esc(l.nivel)}</span>
            <h3>${esc(l.titulo)}</h3>
            <p>${esc(l.resumen)}</p>
          </span>
          <span class="estado ${hecha ? "hecha" : ""}">${hecha ? "✦ Completada" : "Leer →"}</span>
        </a></li>`;
      })
      .join("");

    return `
      ${encabezado("Capítulo II", "Lecciones", "Ve una por una, a tu ritmo. Al terminar cada lección, márcala como completada.", "수업")}
      <section class="envoltura" style="padding-bottom:clamp(4rem,8vw,6rem)">
        ${filas ? `<ul class="lista-lecciones">${filas}</ul>` : '<p class="vacio">Pronto habrá lecciones aquí.</p>'}
      </section>`;
  }

  function paginaLeccion(id) {
    const lista = datos.lecciones.lecciones;
    const i = lista.findIndex((l) => l.id === id);
    if (i === -1) return paginaNoEncontrada();
    const l = lista[i];
    const hecha = leerProgreso().lecciones.includes(l.id);
    const anterior = lista[i - 1];
    const siguiente = lista[i + 1];

    const ejemplos = (l.ejemplos || [])
      .map(
        (e) => `
        <li class="ejemplo">
          <div>
            <div class="ko" lang="ko">${esc(e.ko)}</div>
            <div class="rom">${esc(e.rom)}</div>
            <div class="es">${esc(e.es)}</div>
          </div>
          ${botonAudio(e.ko)}
        </li>`
      )
      .join("");

    return `
      <article class="leccion envoltura">
        <header class="encabezado-pagina">
          <span class="etiqueta">Lección ${dosDigitos(i + 1)} · ${esc(l.nivel)}</span>
          <h1>${esc(l.titulo)}</h1>
          <p class="resumen">${esc(l.resumen)}</p>
        </header>
        <div class="cuerpo">
          ${(l.parrafos || []).map((p) => `<p>${esc(p)}</p>`).join("")}
          ${ejemplos ? `<div class="subtitulo"><span class="etiqueta">Ejemplos</span></div><ul class="ejemplos">${ejemplos}</ul>` : ""}
          ${l.tip ? `<aside class="tip"><span class="etiqueta">Consejo</span><p>${esc(l.tip)}</p></aside>` : ""}
          <div class="centro">
            <button class="boton ${hecha ? "" : "contorno"}" data-completar="${esc(l.id)}" ${hecha ? "disabled" : ""}>
              ${hecha ? "✦ Lección completada" : "Marcar como completada"}
            </button>
          </div>
        </div>
        <nav class="navegacion-leccion" aria-label="Otras lecciones">
          ${anterior
            ? `<a href="#/leccion/${encodeURIComponent(anterior.id)}"><span class="etiqueta">← Anterior</span><span class="titulo">${esc(anterior.titulo)}</span></a>`
            : "<span></span>"}
          ${siguiente
            ? `<a href="#/leccion/${encodeURIComponent(siguiente.id)}"><span class="etiqueta">Siguiente →</span><span class="titulo">${esc(siguiente.titulo)}</span></a>`
            : `<a href="#/practica"><span class="etiqueta">Siguiente →</span><span class="titulo">Ir a practicar</span></a>`}
        </nav>
      </article>
      <div style="height:clamp(3rem,6vw,5rem)"></div>`;
  }

  function paginaVocabulario(categoriaId) {
    const cats = datos.vocabulario.categorias;
    const cat = cats.find((c) => c.id === categoriaId) || cats[0];
    if (!cat) return `<p class="vacio">Pronto habrá vocabulario aquí.</p>`;

    const pestanas = cats
      .map((c) => `<button class="pestana ${c.id === cat.id ? "activa" : ""}" data-vocab="${esc(c.id)}">${esc(c.nombre)}</button>`)
      .join("");

    const tarjetas = cat.palabras
      .map(
        (p) => `
        <div class="vocab-item">
          <button class="flash" aria-label="${esc(p.ko)}: toca para ver el significado">
            <div class="flash-interior">
              <div class="flash-cara flash-frente">
                <span class="ko" lang="ko">${esc(p.ko)}</span>
                <span class="pista">Voltear</span>
              </div>
              <div class="flash-cara flash-atras" style="background:${tono(cat.color)};border-color:${tono(cat.color)}">
                <span class="es">${esc(p.es)}</span>
                <span class="rom">${esc(p.rom)}</span>
              </div>
            </div>
          </button>
          ${botonAudio(p.ko)}
        </div>`
      )
      .join("");

    return `
      ${encabezado("Capítulo III", "Vocabulario", "Toca una tarjeta para darle la vuelta y descubrir su significado.", "단어")}
      <section class="envoltura" style="padding-bottom:clamp(4rem,8vw,6rem)">
        <div class="pestanas">${pestanas}</div>
        <div class="rejilla-vocab">${tarjetas}</div>
      </section>`;
  }

  // ---------- Práctica (quiz) ----------
  let quiz = null;

  function paginaPractica() {
    const opciones = datos.vocabulario.categorias
      .map((c) => `<option value="${esc(c.id)}">${esc(c.nombre)}</option>`)
      .join("");
    return `
      ${encabezado("Capítulo IV", "Práctica", "Diez preguntas para descubrir cuánto recuerdas.", "연습")}
      <section class="envoltura quiz" style="padding-bottom:clamp(4rem,8vw,6rem)">
        <div class="panel">
          <div class="campos">
            <div>
              <label for="quiz-cat" class="etiqueta">Tema</label>
              <select id="quiz-cat">
                <option value="todas">Todos los temas</option>
                ${opciones}
              </select>
            </div>
            <div>
              <label for="quiz-modo" class="etiqueta">Modo</label>
              <select id="quiz-modo">
                <option value="ko-es">Coreano → Español</option>
                <option value="es-ko">Español → Coreano</option>
              </select>
            </div>
          </div>
          <button class="boton" data-iniciar-quiz>Comenzar <span class="flecha">→</span></button>
        </div>
      </section>`;
  }

  function iniciarQuiz(categoria, modo) {
    const todas = todasLasPalabras();
    const base = categoria === "todas" ? todas : todas.filter((p) => p.categoria === categoria);
    if (base.length < 4) {
      alert("Este tema necesita al menos 4 palabras para practicar.");
      return;
    }
    quiz = { preguntas: barajar(base).slice(0, 10), base, todas, modo, actual: 0, puntos: 0 };
    mostrarPregunta();
  }

  function mostrarPregunta() {
    const { preguntas, actual, modo, base, todas } = quiz;
    if (actual >= preguntas.length) return mostrarResultado();
    const p = preguntas[actual];
    // Opciones incorrectas: primero del mismo tema, luego de cualquiera
    const pool = barajar(base.filter((x) => x.es !== p.es && x.ko !== p.ko));
    const extra = barajar(todas.filter((x) => x.es !== p.es && x.ko !== p.ko && !pool.includes(x)));
    const opciones = barajar([p, ...[...pool, ...extra].slice(0, 3)]);
    const coreano = modo === "ko-es";

    app.innerHTML = `
      <section class="envoltura quiz" style="padding:clamp(3rem,7vw,5rem) clamp(1rem,4vw,3rem)">
        <div class="panel">
          <div class="marcador">
            <span class="etiqueta">Pregunta ${dosDigitos(actual + 1)} / ${dosDigitos(preguntas.length)}</span>
            <span class="etiqueta">Aciertos ${quiz.puntos}</span>
          </div>
          <div class="barra"><span style="width:${(actual / preguntas.length) * 100}%"></span></div>
          <p class="instruccion">${coreano ? "¿Qué significa…?" : "¿Cómo se dice en coreano…?"}</p>
          ${coreano
            ? `<div class="pregunta-ko" lang="ko">${esc(p.ko)}</div>${botonAudio(p.ko)}`
            : `<div class="pregunta-es">${esc(p.es)}</div>`}
          <div class="opciones">
            ${opciones
              .map(
                (o) =>
                  `<button class="opcion" data-respuesta="${o === p ? "1" : "0"}" ${coreano ? "" : 'lang="ko"'}>${esc(coreano ? o.es : o.ko)}</button>`
              )
              .join("")}
          </div>
          <div class="mensaje" aria-live="polite"></div>
        </div>
      </section>`;
  }

  function responder(boton) {
    const correcta = boton.dataset.respuesta === "1";
    const p = quiz.preguntas[quiz.actual];
    app.querySelectorAll(".opcion").forEach((b) => {
      b.disabled = true;
      if (b.dataset.respuesta === "1") b.classList.add("correcta");
    });
    const mensaje = app.querySelector(".mensaje");
    if (correcta) {
      quiz.puntos++;
      mensaje.textContent = barajar(["Muy bien · 잘했어요", "Perfecto · 최고", "Correcto · 맞아요"])[0];
    } else {
      boton.classList.add("incorrecta");
      mensaje.textContent = `Era «${p.ko}» (${p.rom}): ${p.es}`;
    }
    hablar(p.ko);
    quiz.actual++;
    setTimeout(mostrarPregunta, correcta ? 1100 : 2300);
  }

  function mostrarResultado() {
    const { puntos, preguntas } = quiz;
    const progreso = leerProgreso();
    const nuevoRecord = puntos > progreso.mejorQuiz;
    if (nuevoRecord) {
      progreso.mejorQuiz = puntos;
      guardarProgreso(progreso);
    }
    const ratio = puntos / preguntas.length;
    const frase =
      ratio >= 0.9 ? "Increíble. Eres una estrella · 대박" : ratio >= 0.6 ? "Muy bien. Sigue así · 화이팅" : "Cada intento cuenta. Repasa y vuelve a intentarlo.";
    if (ratio >= 0.6) celebrar();
    quiz = null;

    app.innerHTML = `
      <section class="envoltura quiz resultado" style="padding:clamp(3rem,7vw,5rem) clamp(1rem,4vw,3rem)">
        <div class="panel">
          <span class="etiqueta">Resultado</span>
          <div class="cifra">${puntos}<small> / ${preguntas.length}</small></div>
          <p class="cita" style="margin-bottom:1rem">${frase}</p>
          ${nuevoRecord ? '<p class="etiqueta">✦ Nuevo récord ✦</p>' : ""}
          <div class="acciones" style="justify-content:center;margin-top:1.5rem">
            <a class="boton" href="#/practica" data-reiniciar>Intentar de nuevo</a>
            <a class="boton contorno" href="#/vocabulario">Repasar vocabulario</a>
          </div>
        </div>
      </section>`;
  }

  function paginaNoEncontrada() {
    return `
      <div class="vacio envoltura">
        <span class="etiqueta">Error 404</span>
        <h1>Esta página <em>no existe</em></h1>
        <a class="boton contorno" href="#/">Volver al inicio</a>
      </div>`;
  }

  // ---------- Rutas ----------
  function navegar() {
    const partes = (location.hash.replace(/^#\/?/, "") || "").split("/").map(decodeURIComponent);
    const [ruta, param] = partes;
    quiz = null;
    let html;
    switch (ruta) {
      case "": html = paginaInicio(); break;
      case "hangul": html = paginaHangul(param); break;
      case "lecciones": html = paginaLecciones(); break;
      case "leccion": html = paginaLeccion(param); break;
      case "vocabulario": html = paginaVocabulario(param); break;
      case "practica": html = paginaPractica(); break;
      default: html = paginaNoEncontrada();
    }
    app.innerHTML = html;

    const activa = ruta === "leccion" ? "lecciones" : ruta || "inicio";
    document.querySelectorAll(".menu a").forEach((a) => a.classList.toggle("activo", a.dataset.ruta === activa));
    cerrarMenu();
    window.scrollTo(0, 0);
  }

  // ---------- Eventos ----------
  const menuBoton = document.querySelector(".menu-boton");
  const menu = document.getElementById("menu");
  function cerrarMenu() {
    menu.classList.remove("abierto");
    menuBoton.setAttribute("aria-expanded", "false");
  }
  menuBoton.addEventListener("click", () => {
    const abierto = menu.classList.toggle("abierto");
    menuBoton.setAttribute("aria-expanded", String(abierto));
  });

  app.addEventListener("click", (e) => {
    const t = e.target;
    const audio = t.closest("[data-hablar]");
    if (audio) hablar(audio.dataset.hablar);

    const flash = t.closest(".flash");
    if (flash) flash.classList.toggle("girada");

    const hangul = t.closest("[data-hangul]");
    if (hangul) location.hash = "#/hangul/" + hangul.dataset.hangul;

    const vocab = t.closest("[data-vocab]");
    if (vocab) location.hash = "#/vocabulario/" + encodeURIComponent(vocab.dataset.vocab);

    const completar = t.closest("[data-completar]");
    if (completar) {
      const progreso = leerProgreso();
      if (!progreso.lecciones.includes(completar.dataset.completar)) progreso.lecciones.push(completar.dataset.completar);
      guardarProgreso(progreso);
      completar.disabled = true;
      completar.classList.remove("contorno");
      completar.textContent = "✦ Lección completada";
      celebrar();
    }

    if (t.closest("[data-iniciar-quiz]")) {
      iniciarQuiz(document.getElementById("quiz-cat").value, document.getElementById("quiz-modo").value);
    }

    const opcion = t.closest(".opcion");
    if (opcion && !opcion.disabled && quiz) responder(opcion);

    if (t.closest("[data-reiniciar]") && location.hash === "#/practica") navegar();
  });

  // ---------- Arranque ----------
  async function cargar(nombre) {
    const r = await fetch(`contenido/${nombre}.json`, { cache: "no-cache" });
    if (!r.ok) throw new Error(`No se pudo cargar ${nombre}.json`);
    try {
      return await r.json();
    } catch {
      throw new Error(`El archivo contenido/${nombre}.json tiene un error de formato`);
    }
  }

  Promise.all(["config", "hangul", "vocabulario", "lecciones"].map(cargar))
    .then(([config, hangul, vocabulario, lecciones]) => {
      Object.assign(datos, { config, hangul, vocabulario, lecciones });
      document.getElementById("nombre-sitio").textContent = config.nombreSitio;
      document.getElementById("autora").textContent = config.autora;
      document.querySelector(".pie-marca").textContent = config.nombreSitio;
      document.title = `${config.nombreSitio} · Aprende coreano`;
      window.addEventListener("hashchange", navegar);
      navegar();
    })
    .catch((err) => {
      app.innerHTML = `
        <div class="vacio envoltura">
          <span class="etiqueta">Algo salió mal</span>
          <h2>No se pudo cargar el contenido</h2>
          <p>${esc(err.message)}</p>
        </div>`;
      console.error(err);
    });

  // Algunas voces se cargan tarde
  if ("speechSynthesis" in window) window.speechSynthesis.getVoices();
})();
