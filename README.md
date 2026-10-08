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
