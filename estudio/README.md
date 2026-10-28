# Estudio — plataforma personal de aprendizaje

Proyecto independiente del sitio de coreano, publicado en el mismo servidor bajo **`/estudio/`**
(por ejemplo `https://irenka-loves-korea.vercel.app/estudio/`).

## Qué incluye

- **Asignaturas:** Matemáticas, Biología, Química, Física y Comprensión lectora, organizadas en
  capítulos y lecciones desde lo más básico. Los capítulos marcados «Próximamente» son el plan de
  contenidos para siguientes versiones.
- **Flashcards automáticas:** se generan solas a partir de cada lección (conceptos en ambos
  sentidos, ideas clave para completar y preguntas). Usan repaso espaciado (sistema Leitner:
  1, 3, 7, 16 y 35 días).
- **Tests tipo PAES:** alternativas que cambian de orden en cada intento. Al corregir se muestra
  por qué la correcta es correcta, por qué cada una de las otras no lo es y dos métodos de resolución.
- **Ensayos mixtos** por asignatura (preguntas intercaladas de todas las lecciones).
- **Banco de errores:** las preguntas falladas u omitidas se guardan solas (también se pueden
  guardar a mano). Una pregunta queda «dominada» al acertarla dos veces.
- **Lecciones desde PDF:** sección para lecciones creadas a partir de tus documentos.
- **Aprender a aprender:** neurociencia y psicología del aprendizaje con referencias (DOI).
- **Fuentes:** todas las referencias del sitio en una página.

El progreso se guarda en el navegador (localStorage). Desde el inicio se puede descargar y
restaurar una copia.

## Crear lecciones desde un PDF

Adjunta el PDF a Claude y pide, por ejemplo:

> Crea una lección para la sección de PDF del sitio de estudio con este documento.

Claude agrega la lección a `estudio/contenido/pdf.json` con el mismo formato que las demás
(explicaciones, conceptos, ideas clave y preguntas con descartes y dos métodos), revisa que el
contenido sea válido y lo sube. No hay límite de lecciones.

## Estructura

```
estudio/
  index.html
  css/estudio.css          Diseño (colores al inicio del archivo)
  js/estudio.js            Lógica: rutas, flashcards, tests, banco de errores, progreso
  contenido/
    materias.json          Asignaturas → capítulos → ids de lecciones
    matematicas.json …     Lecciones de cada asignatura
    aprender.json          Neurociencia y psicología del aprendizaje
    pdf.json               Lecciones creadas desde PDF
```

## Formato de una lección

```json
{
  "id": "nombre-en-minusculas",
  "titulo": "Título",
  "resumen": "Una oración.",
  "objetivos": ["…"],
  "secciones": [
    {
      "titulo": "…",
      "texto": ["Párrafo con **negrita** y `fórmulas`."],
      "lista": ["…"],
      "recuadro": "Nota destacada",
      "ejemplo": { "enunciado": "…", "pasos": ["…"] }
    }
  ],
  "conceptos": [{ "termino": "…", "definicion": "…" }],
  "ideasClave": ["Frase con la palabra **clave** en negrita (se convierte en tarjeta para completar)."],
  "preguntas": [
    {
      "texto": "Opcional: texto base para preguntas de lectura",
      "enunciado": "…",
      "alternativas": ["A", "B", "C", "D"],
      "correcta": 1,
      "explicacion": "Por qué la correcta es correcta.",
      "descartes": ["Por qué A no", null, "Por qué C no", "Por qué D no"],
      "metodos": [
        { "nombre": "Método 1", "pasos": ["…"] },
        { "nombre": "Método 2", "pasos": ["…"] }
      ]
    }
  ],
  "fuentes": [{ "titulo": "…", "url": "https://…" }],
  "referencias": [{ "cita": "Autor (año). Título. _Revista_.", "url": "https://doi.org/…" }]
}
```

Las lecciones de la sección PDF pueden incluir además `"documento": "Nombre del PDF"`.

## Revisar el contenido

```bash
node scripts/validar-estudio.mjs
```

GitHub lo ejecuta automáticamente en cada cambio.
