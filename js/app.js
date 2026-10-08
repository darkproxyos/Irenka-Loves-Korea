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

  const botonAudio = (texto) =>
    `<button class="audio" data-hablar="${esc(texto)}" aria-label="Escuchar ${esc(texto)}" title="Escuchar">🔊</button>`;

  function celebrar(cantidad = 14) {
    const iconos = ["💗", "🌸", "✨", "💜", "🐰", "⭐"];
    for (let i = 0; i < cantidad; i++) {
      const c = document.createElement("span");
      c.className = "corazon";
      c.textContent = iconos[i % iconos.length];
      c.style.left = Math.random() * 100 + "vw";
      c.style.animationDelay = Math.random() * 0.6 + "s";
      document.body.appendChild(c);
      setTimeout(() => c.remove(), 3200);
    }
  }

  const todasLasPalabras = () =>
    datos.vocabulario.categorias.flatMap((cat) => cat.palabras.map((p) => ({ ...p, categoria: cat.id })));

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

    return `
      <section class="hero">
        <div>
          <p><strong>${esc(c.saludo)}</strong></p>
          <h1>${esc(c.titulo)}</h1>
          <p>${esc(c.descripcion)}</p>
          <div class="hero-acciones">
            <a class="boton" href="#/lecciones">📚 Empezar a aprender</a>
            <a class="boton secundario" href="#/hangul">한 Ver el Hangul</a>
          </div>
        </div>
        <div class="hero-mascota">
          <span class="burbuja" lang="ko">${esc(c.mensajeMascota)}</span><br />
          <span class="flota" aria-hidden="true">${esc(c.mascota)}</span>
        </div>
      </section>

      <section class="tarjeta color-limon">
        <h2>✨ Palabra del día</h2>
        <div class="palabra-dia">
          <span class="emoji-grande" aria-hidden="true">${esc(palabra.emoji)}</span>
          <div>
            <div class="coreano" lang="ko">${esc(palabra.ko)}</div>
            <div><em>${esc(palabra.rom)}</em> · ${esc(palabra.es)}</div>
          </div>
          ${botonAudio(palabra.ko)}
        </div>
      </section>

      <section class="tarjeta progreso">
        <h2>🌱 Tu progreso</h2>
        <p>Lecciones terminadas: <strong>${hechas} de ${total}</strong> · Mejor puntaje en práctica: <strong>${progreso.mejorQuiz}/10</strong></p>
        <div class="barra" role="progressbar" aria-valuenow="${porcentaje}" aria-valuemin="0" aria-valuemax="100"><span style="width:${porcentaje}%"></span></div>
      </section>

      <section class="rejilla atajos">
        <a class="tarjeta atajo color-rosa" href="#/hangul"><div class="icono">한</div><h3>Hangul</h3><p>Las 24 letras básicas con su sonido.</p></a>
        <a class="tarjeta atajo color-lavanda" href="#/lecciones"><div class="icono">📚</div><h3>Lecciones</h3><p>Explicaciones cortitas con ejemplos.</p></a>
        <a class="tarjeta atajo color-menta" href="#/vocabulario"><div class="icono">🍡</div><h3>Vocabulario</h3><p>Tarjetas que giran para memorizar.</p></a>
        <a class="tarjeta atajo color-durazno" href="#/practica"><div class="icono">✏️</div><h3>Práctica</h3><p>Un mini examen para ponerte a prueba.</p></a>
      </section>`;
  }

  function paginaHangul(tipo = "vocales") {
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
      <div class="titulo-seccion">
        <h1>한글 · El alfabeto Hangul</h1>
        <p>Toca cada letra para escuchar cómo suena. 🔊</p>
      </div>
      <div class="pestanas" role="tablist">
        <button class="pestana ${tipo === "vocales" ? "activa" : ""}" data-hangul="vocales" role="tab" aria-selected="${tipo === "vocales"}">Vocales (모음)</button>
        <button class="pestana ${tipo === "consonantes" ? "activa" : ""}" data-hangul="consonantes" role="tab" aria-selected="${tipo === "consonantes"}">Consonantes (자음)</button>
      </div>
      <div class="letras">${tarjetas}</div>
      <div class="tarjeta nota" style="margin-top:2rem">
        <h3>💡 ¿Sabías que…?</h3>
        <p>Las vocales se basan en tres símbolos: el cielo (·), la tierra (ㅡ) y la persona (ㅣ). Las consonantes imitan la forma de la boca al pronunciarlas. ¡Por eso Hangul es tan fácil de aprender!</p>
      </div>`;
  }

  function paginaLecciones() {
    const progreso = leerProgreso();
    const tarjetas = datos.lecciones.lecciones
      .map(
        (l, i) => `
        <a class="tarjeta leccion-tarjeta color-${esc(l.color || "rosa")}" href="#/leccion/${encodeURIComponent(l.id)}">
          ${progreso.lecciones.includes(l.id) ? '<span class="hecha" title="Terminada">✅</span>' : ""}
          <span class="icono" aria-hidden="true">${esc(l.emoji)}</span>
          <span class="etiqueta">Lección ${i + 1} · ${esc(l.nivel)}</span>
          <h3>${esc(l.titulo)}</h3>
          <p>${esc(l.resumen)}</p>
        </a>`
      )
      .join("");

    return `
      <div class="titulo-seccion">
        <h1>📚 Lecciones</h1>
        <p>Ve una por una, a tu ritmo. Al terminar cada lección márcala como completada. 💮</p>
      </div>
      <div class="rejilla">${tarjetas || '<p class="vacio">Pronto habrá lecciones aquí 🌸</p>'}</div>`;
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
          ${botonAudio(e.ko)}
          <div>
            <div class="ko" lang="ko">${esc(e.ko)}</div>
            <div><span class="rom">${esc(e.rom)}</span> — ${esc(e.es)}</div>
          </div>
        </li>`
      )
      .join("");

    return `
      <article class="leccion">
        <div class="encabezado">
          <div class="icono" aria-hidden="true">${esc(l.emoji)}</div>
          <span class="etiqueta color-${esc(l.color || "rosa")}">Lección ${i + 1} · ${esc(l.nivel)}</span>
          <h1>${esc(l.titulo)}</h1>
        </div>
        <div class="tarjeta cuerpo">
          ${(l.parrafos || []).map((p) => `<p>${esc(p)}</p>`).join("")}
          ${ejemplos ? `<h3>🗣️ Ejemplos</h3><ul class="ejemplos">${ejemplos}</ul>` : ""}
          ${l.tip ? `<div class="tip"><strong>🍯 Tip:</strong> ${esc(l.tip)}</div>` : ""}
          <div style="text-align:center">
            <button class="boton menta" data-completar="${esc(l.id)}" ${hecha ? "disabled" : ""}>
              ${hecha ? "✅ ¡Lección terminada!" : "💮 Marcar como terminada"}
            </button>
          </div>
        </div>
        <nav class="navegacion-leccion">
          ${anterior ? `<a class="boton suave" href="#/leccion/${encodeURIComponent(anterior.id)}">← ${esc(anterior.titulo)}</a>` : "<span></span>"}
          ${siguiente ? `<a class="boton" href="#/leccion/${encodeURIComponent(siguiente.id)}">${esc(siguiente.titulo)} →</a>` : `<a class="boton secundario" href="#/practica">✏️ Ir a practicar</a>`}
        </nav>
      </article>`;
  }

  function paginaVocabulario(categoriaId) {
    const cats = datos.vocabulario.categorias;
    const cat = cats.find((c) => c.id === categoriaId) || cats[0];
    if (!cat) return `<p class="vacio">Pronto habrá vocabulario aquí 🌸</p>`;

    const pestanas = cats
      .map((c) => `<button class="pestana ${c.id === cat.id ? "activa" : ""}" data-vocab="${esc(c.id)}">${esc(c.emoji)} ${esc(c.nombre)}</button>`)
      .join("");

    const tarjetas = cat.palabras
      .map(
        (p) => `
        <div>
          <button class="flash" aria-label="${esc(p.ko)}: toca para ver el significado">
            <div class="flash-interior">
              <div class="flash-cara flash-frente">
                <span class="emoji" aria-hidden="true">${esc(p.emoji)}</span>
                <span class="ko" lang="ko">${esc(p.ko)}</span>
              </div>
              <div class="flash-cara flash-atras">
                <span class="es">${esc(p.es)}</span>
                <span class="rom">${esc(p.rom)}</span>
              </div>
            </div>
          </button>
          <div style="text-align:center;margin-top:.6rem">${botonAudio(p.ko)}</div>
        </div>`
      )
      .join("");

    return `
      <div class="titulo-seccion">
        <h1>🍡 Vocabulario</h1>
        <p>Toca una tarjeta para darle la vuelta y ver qué significa.</p>
      </div>
      <div class="pestanas">${pestanas}</div>
      <div class="rejilla">${tarjetas}</div>`;
  }

  // ---------- Práctica (quiz) ----------
  let quiz = null;

  function paginaPractica() {
    const opciones = datos.vocabulario.categorias
      .map((c) => `<option value="${esc(c.id)}">${esc(c.emoji)} ${esc(c.nombre)}</option>`)
      .join("");
    return `
      <div class="quiz">
        <div class="titulo-seccion">
          <h1>✏️ Práctica</h1>
          <p>10 preguntas para ver cuánto recuerdas. ¡Tú puedes! 화이팅!</p>
        </div>
        <div class="tarjeta">
          <div class="opciones-quiz">
            <div>
              <label for="quiz-cat">Tema</label>
              <select id="quiz-cat">
                <option value="todas">🌈 Todos los temas</option>
                ${opciones}
              </select>
            </div>
            <div>
              <label for="quiz-modo">Modo</label>
              <select id="quiz-modo">
                <option value="ko-es">Coreano → Español</option>
                <option value="es-ko">Español → Coreano</option>
              </select>
            </div>
          </div>
          <button class="boton" data-iniciar-quiz>🎀 ¡Empezar!</button>
        </div>
      </div>`;
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
      <div class="quiz">
        <div class="tarjeta">
          <div class="marcador"><span>Pregunta ${actual + 1} / ${preguntas.length}</span><span>⭐ ${quiz.puntos}</span></div>
          <div class="barra" style="margin:.75rem 0"><span style="width:${(actual / preguntas.length) * 100}%"></span></div>
          <p>${coreano ? "¿Qué significa…?" : "¿Cómo se dice en coreano…?"}</p>
          ${coreano
            ? `<div class="pregunta-ko" lang="ko">${esc(p.ko)}</div>${botonAudio(p.ko)}`
            : `<div class="pregunta-es">${esc(p.emoji)} ${esc(p.es)}</div>`}
          <div class="opciones">
            ${opciones
              .map(
                (o) =>
                  `<button class="opcion ${coreano ? "" : "ko-texto"}" data-respuesta="${o === p ? "1" : "0"}" ${coreano ? "" : 'lang="ko"'}>${esc(coreano ? o.es : o.ko)}</button>`
              )
              .join("")}
          </div>
          <div class="mensaje" aria-live="polite"></div>
        </div>
      </div>`;
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
      mensaje.textContent = barajar(["¡Muy bien! 잘했어요! 💗", "¡Perfecto! 최고! ✨", "¡Correcto! 🌸"])[0];
    } else {
      boton.classList.add("incorrecta");
      mensaje.textContent = `Casi… era «${p.ko}» (${p.rom}) = ${p.es} 💜`;
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
    const estrellas = ratio >= 0.9 ? "⭐⭐⭐" : ratio >= 0.6 ? "⭐⭐" : ratio > 0 ? "⭐" : "🌱";
    const frase =
      ratio >= 0.9 ? "¡Increíble! Eres una estrella. 대박!" : ratio >= 0.6 ? "¡Muy bien! Sigue así. 💪" : "¡Cada intento cuenta! Repasa y vuelve a intentarlo. 🌸";
    if (ratio >= 0.6) celebrar();
    quiz = null;

    app.innerHTML = `
      <div class="quiz resultado">
        <div class="tarjeta color-rosa">
          <div class="estrellas">${estrellas}</div>
          <h2>${puntos} de ${preguntas.length}</h2>
          <p>${frase}</p>
          ${nuevoRecord ? "<p><strong>🏆 ¡Nuevo récord!</strong></p>" : ""}
          <div class="hero-acciones" style="justify-content:center">
            <a class="boton" href="#/practica" data-reiniciar>🔁 Otra vez</a>
            <a class="boton secundario" href="#/vocabulario">🍡 Repasar vocabulario</a>
          </div>
        </div>
      </div>`;
  }

  function paginaNoEncontrada() {
    return `
      <div class="vacio">
        <div class="rebote" style="font-size:4rem">🐰</div>
        <h2>Ups… esta página no existe</h2>
        <a class="boton" href="#/">Volver al inicio</a>
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
      completar.textContent = "✅ ¡Lección terminada!";
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
      document.title = `${config.nombreSitio} · Aprende coreano`;
      window.addEventListener("hashchange", navegar);
      navegar();
    })
    .catch((err) => {
      app.innerHTML = `
        <div class="vacio">
          <div style="font-size:4rem">🥺</div>
          <h2>Algo salió mal al cargar el contenido</h2>
          <p>${esc(err.message)}</p>
        </div>`;
      console.error(err);
    });

  // Algunas voces se cargan tarde
  if ("speechSynthesis" in window) window.speechSynthesis.getVoices();
})();
