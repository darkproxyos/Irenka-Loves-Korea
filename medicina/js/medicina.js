/* ============================================
   Camino a Medicina SNU — mapa de contenidos
   El avance se guarda en este navegador.
   ============================================ */
(function () {
  "use strict";

  const CLAVE = "medicina-snu-mapa";

  // [tema, término en coreano, detalle]
  const MAPA = [
    {
      id: "mat", nombre: "Matemáticas", ko: "수학",
      temas: [
        ["Polinomios, ecuaciones e inecuaciones", "다항식 · 방정식과 부등식", "Factorización, ecuaciones cuadráticas, números complejos, inecuaciones."],
        ["Combinatoria y matrices", "경우의 수 · 행렬", "Principios de conteo, permutaciones, combinaciones y operaciones con matrices."],
        ["Funciones y sus gráficos", "함수와 그래프", "Composición, función inversa, funciones racionales e irracionales."],
        ["Exponenciales y logaritmos", "지수함수와 로그함수", "Propiedades, gráficos, ecuaciones e inecuaciones."],
        ["Trigonometría", "삼각함수", "Radianes, gráficos, identidades, teoremas del seno y del coseno."],
        ["Sucesiones y sumatorias", "수열", "Progresiones aritméticas y geométricas, sumatorias, inducción matemática."],
        ["Límites y continuidad", "함수의 극한과 연속", "Cálculo de límites y propiedades de las funciones continuas."],
        ["Derivadas y sus aplicaciones", "미분", "Derivada de polinomios, rectas tangentes, máximos, mínimos y gráficos."],
        ["Integrales y áreas", "적분", "Integral indefinida y definida, áreas, velocidad y distancia."],
        ["Probabilidad", "확률", "Probabilidad condicional, independencia, teorema de Bayes."],
        ["Estadística", "통계", "Variables aleatorias, distribuciones binomial y normal, estimación."],
        ["Cálculo avanzado", "미적분Ⅱ", "Límites de sucesiones, series; derivadas e integrales de funciones exponenciales, logarítmicas y trigonométricas; técnicas de integración."],
        ["Geometría: cónicas y vectores", "기하 · 이차곡선 · 벡터", "Parábola, elipse, hipérbola; vectores en el plano y en el espacio."],
        ["Resolución de problemas tipo Suneung", "수능 킬러 문항", "Problemas que combinan varios temas, resueltos con tiempo."],
      ],
    },
    {
      id: "qui", nombre: "Química", ko: "화학",
      temas: [
        ["Estructura atómica y tabla periódica", "원자 구조 · 주기율", "Configuración electrónica, propiedades periódicas."],
        ["Enlace químico y estructura molecular", "화학 결합 · 분자 구조", "Enlaces, estructuras de Lewis, geometría y polaridad molecular."],
        ["El mol y la estequiometría", "몰 · 화학 반응식", "Cálculos con masa, moles, volúmenes y reactivo limitante."],
        ["Estados de la materia y disoluciones", "물질의 상태 · 용액", "Gases, fuerzas intermoleculares, concentraciones."],
        ["Termoquímica", "반응열", "Entalpía, ley de Hess, energía de enlace."],
        ["Cinética química", "반응 속도", "Velocidad de reacción, factores, catalizadores."],
        ["Equilibrio químico", "화학 평형", "Constante de equilibrio, principio de Le Châtelier."],
        ["Ácidos y bases", "산과 염기", "pH, neutralización, ácidos y bases fuertes y débiles."],
        ["Oxidación-reducción y electroquímica", "산화 환원 · 전기 화학", "Números de oxidación, balance redox, pilas y electrólisis."],
        ["Química orgánica básica", "탄소 화합물", "Grupos funcionales e isomería."],
      ],
    },
    {
      id: "bio", nombre: "Biología", ko: "생명과학",
      temas: [
        ["Célula y biomoléculas", "세포 · 생체 분자", "Estructura celular, membranas, proteínas, enzimas."],
        ["Metabolismo energético", "물질대사", "Respiración celular y fotosíntesis."],
        ["Sistema nervioso", "신경계", "Potencial de acción, sinapsis, sistema nervioso central y periférico."],
        ["Sistema endocrino y homeostasis", "항상성 · 호르몬", "Regulación de glucosa, temperatura, agua y sales."],
        ["Sistema inmune", "면역", "Inmunidad innata y adaptativa, vacunas, grupos sanguíneos."],
        ["Circulación, respiración y excreción", "순환 · 호흡 · 배설", "Funcionamiento coordinado de los sistemas del cuerpo."],
        ["División celular", "세포 분열", "Ciclo celular, mitosis y meiosis."],
        ["Genética mendeliana y humana", "유전", "Leyes de Mendel, herencia ligada al sexo, análisis de pedigríes (muy frecuente en el Suneung)."],
        ["ADN y expresión génica", "유전자 발현", "Replicación, transcripción, traducción, regulación génica, mutaciones."],
        ["Biotecnología", "생명 공학", "ADN recombinante, PCR, CRISPR y sus aplicaciones médicas."],
        ["Evolución y ecología", "진화 · 생태계", "Selección natural, genética de poblaciones, ecosistemas."],
      ],
    },
    {
      id: "fis", nombre: "Física", ko: "물리학",
      temas: [
        ["Cinemática", "운동", "Movimiento rectilíneo y en dos dimensiones, gráficos."],
        ["Leyes de Newton", "뉴턴 운동 법칙", "Diagramas de cuerpo libre, fuerzas, roce."],
        ["Trabajo, energía y momento", "에너지 · 운동량", "Conservación de la energía y del momento, choques."],
        ["Movimiento circular y gravitación", "원운동 · 중력", "Fuerza centrípeta, órbitas."],
        ["Termodinámica", "열역학", "Calor, trabajo, leyes de la termodinámica."],
        ["Electricidad", "전기", "Carga, campo eléctrico, circuitos, ley de Ohm."],
        ["Magnetismo e inducción", "자기 · 전자기 유도", "Campos magnéticos, inducción electromagnética."],
        ["Ondas, sonido y óptica", "파동 · 빛", "Interferencia, refracción, lentes."],
        ["Física moderna", "현대 물리", "Relatividad especial, efecto fotoeléctrico, semiconductores."],
      ],
    },
    {
      id: "cor", nombre: "Coreano", ko: "한국어",
      temas: [
        ["Hangul y pronunciación", "한글", "Leer y escribir con fluidez."],
        ["TOPIK 1–2", "토픽 I", "Vida cotidiana."],
        ["TOPIK 3–4", "토픽 II 3–4급", "Temas sociales, textos de opinión."],
        ["TOPIK 5", "토픽 II 5급", "Textos académicos y profesionales."],
        ["TOPIK 6", "토픽 II 6급", "Dominio avanzado, cercano a nativo en lo académico."],
        ["Vocabulario científico en coreano", "과학 용어", "Términos de matemáticas, química, biología y física."],
        ["Estudiar ciencias en coreano (EBS)", "EBS 강의", "Seguir una clase completa de ciencias en coreano."],
        ["Lectura de textos tipo Suneung (국어)", "수능 국어 독서", "Textos científicos, filosóficos y económicos complejos."],
        ["Entrevista en coreano", "면접", "Explicar tus motivaciones y responder dilemas éticos en coreano."],
      ],
    },
    {
      id: "ing", nombre: "Inglés", ko: "영어",
      temas: [
        ["Nivel B2", "", "Comprender clases y textos generales."],
        ["Leer ciencias en inglés", "", "Estudiar con OpenStax o Khan Academy sin traducir."],
        ["Nivel C1", "", "Lectura académica avanzada (TOEFL iBT 100+ o IELTS 7+)."],
        ["Lectura tipo Suneung (영어)", "수능 영어", "Inferencia, orden de párrafos y vocabulario avanzado."],
        ["Leer artículos científicos", "", "Resúmenes y artículos de revistas de medicina y biología."],
      ],
    },
  ];

  const esc = (t) => String(t).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  let marcados = {};
  try { marcados = JSON.parse(localStorage.getItem(CLAVE)) || {}; } catch { marcados = {}; }
  const guardar = () => { try { localStorage.setItem(CLAVE, JSON.stringify(marcados)); } catch { /* sin almacenamiento */ } };
  const abiertos = new Set();

  function pintar() {
    let totalGlobal = 0;
    let hechosGlobal = 0;
    document.getElementById("mapa-contenidos").innerHTML = MAPA.map((m) => {
      const hechos = m.temas.filter((_, i) => marcados[`${m.id}-${i}`]).length;
      totalGlobal += m.temas.length;
      hechosGlobal += hechos;
      const pct = Math.round((hechos / m.temas.length) * 100);
      return `
        <details class="materia" data-id="${m.id}" ${abiertos.has(m.id) ? "open" : ""}>
          <summary>
            <h3>${esc(m.nombre)}<span lang="ko">${esc(m.ko)}</span></h3>
            <span class="avance">${hechos} / ${m.temas.length} · ${pct} %</span>
            <div class="barra"><span style="width:${pct}%"></span></div>
          </summary>
          <div class="materia-cuerpo">
            ${m.temas
              .map(([t, ko, d], i) => {
                const id = `${m.id}-${i}`;
                return `<label class="tema ${marcados[id] ? "hecho" : ""}">
                  <input type="checkbox" data-id="${id}" ${marcados[id] ? "checked" : ""} />
                  <span><span class="nombre">${esc(t)}${ko ? ` · <span class="ko-t" lang="ko">${esc(ko)}</span>` : ""}</span><span class="detalle">${esc(d)}</span></span>
                </label>`;
              })
              .join("")}
          </div>
        </details>`;
    }).join("");
    document.getElementById("avance-total").textContent = `${Math.round((hechosGlobal / totalGlobal) * 100)} %`;
  }

  const mapa = document.getElementById("mapa-contenidos");
  mapa.addEventListener("toggle", (ev) => {
    const d = ev.target.closest(".materia");
    if (!d) return;
    if (d.open) abiertos.add(d.dataset.id);
    else abiertos.delete(d.dataset.id);
  }, true);
  mapa.addEventListener("change", (ev) => {
    const id = ev.target.dataset.id;
    if (!id) return;
    if (ev.target.checked) marcados[id] = true;
    else delete marcados[id];
    guardar();
    pintar();
  });
  document.getElementById("reiniciar-mapa").addEventListener("click", () => {
    if (!confirm("¿Borrar todo tu avance del mapa de contenidos?")) return;
    marcados = {};
    guardar();
    pintar();
  });
  pintar();

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
})();
