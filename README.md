# 🐰 Irenka Loves Korea · 한국어 배우기

Plataforma de aprendizaje de coreano en español, con estilo editorial y paleta rosa empolvado.

## ¿Qué tiene?

- **한 Hangul** — vocales y consonantes con su sonido (toca la letra para escucharla).
- **📚 Lecciones** — explicaciones cortas con ejemplos, audio y tips. Se pueden marcar como terminadas.
- **🍡 Vocabulario** — tarjetas que giran, organizadas por temas.
- **✏️ Práctica** — mini examen de 10 preguntas (coreano → español o al revés).
- **✨ Palabra del día** y barra de progreso en el inicio (el progreso se guarda en el navegador).

## ¿Cómo agrego o cambio contenido?

Todo el contenido está en la carpeta [`contenido/`](contenido). No hace falta saber programar.
Lee la guía 👉 **[GUIA-ADMIN.md](GUIA-ADMIN.md)**.

## Estructura

```
index.html                 Página principal
css/estilos.css            Colores y diseño (los colores están arriba del archivo)
js/app.js                  Lógica del sitio
contenido/                 ✏️ Lo que se edita
  config.json              Nombre del sitio, textos de bienvenida
  hangul.json              Letras del alfabeto
  vocabulario.json         Temas y palabras
  lecciones.json           Lecciones
scripts/validar-contenido.mjs   Revisa que el contenido no tenga errores
```

## Ver el sitio en tu computadora

Es un sitio estático (sin instalación). Desde la carpeta del proyecto:

```bash
npx serve .
# o
python3 -m http.server 8000
```

y abre http://localhost:8000 (abrir `index.html` con doble clic no funciona porque el navegador bloquea la lectura de los JSON).

## Revisar el contenido

```bash
node scripts/validar-contenido.mjs
```

GitHub también lo revisa automáticamente en cada cambio (pestaña **Actions**).

## Publicación

Pensado para publicarse en [Vercel](https://vercel.com) como sitio estático: no necesita comando de build.

## Otro proyecto en este repositorio: Estudio

En la carpeta [`estudio/`](estudio) hay una plataforma de estudio independiente (ciencias,
matemáticas y comprensión lectora, con flashcards, tests tipo PAES y banco de errores).
Se publica en `/estudio/`. Más detalles en [estudio/README.md](estudio/README.md).

## Otro proyecto: Viaje a Corea

En la carpeta [`viaje/`](viaje) hay una guía para preparar un viaje a Corea desde Chile
(documentos, vuelos, dinero, transporte, alojamiento, comida, ciudades, itinerarios,
cultura, seguridad, frases y checklist), con una calculadora de presupuesto.
Se publica en `/viaje/`.

Los precios aproximados y los tipos de cambio están en [`viaje/datos.json`](viaje/datos.json):
al cambiar `krwPorUsd` o `clpPorUsd`, todas las conversiones de la página se actualizan solas.

## Otro proyecto: Oportunidades en Corea

En la carpeta [`oportunidades/`](oportunidades) hay una guía de oportunidades de estudio y
trabajo en Corea para personas de Chile (becas GKS, Becas Chile, intercambios, idioma,
Working Holiday y visas de trabajo), con un buscador según edad, nivel de estudios y
presupuesto. Se publica en `/oportunidades/`. Las oportunidades del buscador están en
[`oportunidades/opciones.json`](oportunidades/opciones.json).
