// Revisa que los archivos de /contenido estén bien escritos.
// Uso: node scripts/validar-contenido.mjs
import { readFileSync } from "node:fs";

const errores = [];
const leer = (nombre) => {
  const ruta = `contenido/${nombre}.json`;
  try {
    return JSON.parse(readFileSync(ruta, "utf8"));
  } catch (e) {
    errores.push(`${ruta}: formato JSON inválido → ${e.message}`);
    return null;
  }
};
const requiere = (obj, campos, donde) => {
  for (const c of campos) {
    if (obj?.[c] === undefined || obj[c] === "") errores.push(`${donde}: falta el campo "${c}"`);
  }
};

const config = leer("config");
if (config) requiere(config, ["nombreSitio", "autora", "titulo", "descripcion"], "config.json");

const hangul = leer("hangul");
if (hangul) {
  for (const tipo of ["vocales", "consonantes"]) {
    (hangul[tipo] || []).forEach((l, i) => requiere(l, ["letra", "rom", "sonido"], `hangul.json ${tipo}[${i + 1}]`));
  }
}

const vocab = leer("vocabulario");
if (vocab) {
  const ids = new Set();
  (vocab.categorias || []).forEach((cat, i) => {
    requiere(cat, ["id", "nombre", "palabras"], `vocabulario.json categoría ${i + 1}`);
    if (ids.has(cat.id)) errores.push(`vocabulario.json: el id "${cat.id}" está repetido`);
    ids.add(cat.id);
    (cat.palabras || []).forEach((p, j) =>
      requiere(p, ["ko", "rom", "es"], `vocabulario.json "${cat.nombre}" palabra ${j + 1}`)
    );
  });
}

const lecciones = leer("lecciones");
if (lecciones) {
  const ids = new Set();
  (lecciones.lecciones || []).forEach((l, i) => {
    const donde = `lecciones.json lección ${i + 1}`;
    requiere(l, ["id", "titulo", "resumen", "parrafos"], donde);
    if (l.id && !/^[a-z0-9-]+$/.test(l.id)) errores.push(`${donde}: el id "${l.id}" solo puede tener minúsculas, números y guiones`);
    if (ids.has(l.id)) errores.push(`lecciones.json: el id "${l.id}" está repetido`);
    ids.add(l.id);
    (l.ejemplos || []).forEach((e, j) => requiere(e, ["ko", "rom", "es"], `${donde} ejemplo ${j + 1}`));
  });
}

if (errores.length) {
  console.error("❌ Se encontraron problemas en el contenido:\n");
  errores.forEach((e) => console.error(" • " + e));
  process.exit(1);
}
console.log("✅ Todo el contenido está bien. 화이팅!");
