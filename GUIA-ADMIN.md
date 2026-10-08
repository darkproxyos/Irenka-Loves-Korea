# 🌸 Guía para administrar Irenka Loves Korea

¡Hola Irenka! Esta guía explica cómo cambiar el sitio sin programar. 💗

Todo lo que se ve en el sitio está en la carpeta **`contenido/`**. Cada vez que guardes un cambio
en GitHub, el sitio se actualiza solito (cuando Vercel esté conectado).

## ✏️ Cómo editar un archivo desde GitHub

1. Entra al repositorio en GitHub y abre la carpeta `contenido`.
2. Haz clic en el archivo que quieras cambiar (por ejemplo `vocabulario.json`).
3. Haz clic en el lápiz ✏️ (arriba a la derecha) para editar.
4. Haz tus cambios.
5. Haz clic en **Commit changes…**, escribe qué cambiaste (ej. "Agregué palabras de ropa") y confirma.

> 💡 Si GitHub muestra una ❌ roja junto a tu cambio (pestaña **Actions**), es que hay un error
> en el formato. Haz clic en ella para ver qué archivo y qué línea revisar.

## ⚠️ Reglas de oro del formato JSON

- Los textos van **entre comillas dobles**: `"hola"` ✅ — `'hola'` ❌
- Entre un elemento y otro va **una coma**, pero **el último no lleva coma**.
- No borres las llaves `{ }` ni los corchetes `[ ]`.
- Si quieres usar comillas dentro de un texto, escribe `\"` (ej. `"Se dice \"hola\""`).
- Truco: copia un elemento que ya existe, pégalo debajo y cambia solo los textos.

---

## 🍡 Agregar una palabra

En `contenido/vocabulario.json`, busca el tema y agrega una línea dentro de `"palabras"`:

```json
{ "ko": "고양이", "rom": "goyangi", "es": "gato" }
```

| Campo   | Qué es                                   |
|---------|------------------------------------------|
| `ko`    | La palabra en coreano                    |
| `rom`   | Cómo se lee (romanización)               |
| `es`    | Significado en español                   |

## 🎨 Agregar un tema nuevo de vocabulario

Agrega un bloque nuevo dentro de `"categorias"`:

```json
{
  "id": "ropa",
  "nombre": "Ropa",
  "color": "rosa",
  "palabras": [
    { "ko": "옷", "rom": "ot", "es": "ropa", },
    { "ko": "치마", "rom": "chima", "es": "falda", },
    { "ko": "모자", "rom": "moja", "es": "gorra", },
    { "ko": "신발", "rom": "sinbal", "es": "zapatos", }
  ]
}
```

- `id`: una palabra corta, en minúsculas y sin espacios ni acentos (no se puede repetir).
- `color`: el tono de fondo de la tarjeta. Opciones: `rosa`, `lavanda`, `menta`, `durazno`, `cielo`, `limon` (todos son tonos suaves de la paleta rosa/beige).
- Para que el tema aparezca en **Práctica** necesita al menos **4 palabras**.

## 📚 Agregar una lección

En `contenido/lecciones.json` agrega un bloque dentro de `"lecciones"`. Aparecen en el orden en que están escritas.

```json
{
  "id": "comida-coreana",
  "titulo": "Pidiendo comida",
  "nivel": "Principiante",
  "color": "durazno",
  "resumen": "Frases para pedir en un restaurante coreano.",
  "parrafos": [
    "Primer párrafo de la explicación.",
    "Segundo párrafo."
  ],
  "ejemplos": [
    { "ko": "이거 주세요", "rom": "igeo juseyo", "es": "Deme esto, por favor" }
  ],
  "tip": "Un consejo cortito (opcional)."
}
```

- `id`: minúsculas, números y guiones, sin repetir (se usa en la dirección de la página).
- `ejemplos` y `tip` son opcionales.
- ⚠️ Si cambias el `id` de una lección ya existente, se pierde la marca de "terminada" de quien ya la hizo.

## 🏠 Cambiar los textos del inicio

En `contenido/config.json`:

| Campo              | Dónde aparece                                      |
|--------------------|----------------------------------------------------|
| `nombreSitio`      | Arriba a la izquierda y en el pie de página        |
| `autora`           | "Hecho con amor por …"                             |
| `saludo`           | Texto pequeño en mayúsculas sobre el título        |
| `titulo`           | Título grande del inicio                           |
| `tituloDestacado`  | Segunda parte del título, en cursiva rosa          |
| `descripcion`      | Párrafo bajo el título                             |
| `frase`            | Frase en coreano junto al arco                     |
| `cita`             | Frase entre comillas sobre el progreso             |

## 🎀 Cambiar colores

Los colores están al inicio de `css/estilos.css`, en la sección `:root`. La paleta principal es:

```css
--malva: #B18B87;
--marfil: #F8F5F2;
--rosa-polvo: #E0C3C0;
```

`--tinta` es el color del texto (café oscuro). Puedes elegir colores en https://coolors.co.

## 🔊 Sobre el audio

El audio usa la voz coreana del navegador o del teléfono. Si no suena, puede que el dispositivo
no tenga voz coreana instalada (en el celular suele venir; en Windows se puede agregar en
*Configuración → Hora e idioma → Voz*).

화이팅! 💪🐰
