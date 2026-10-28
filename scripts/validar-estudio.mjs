// Revisa que el contenido de /estudio esté bien escrito.
// Uso: node scripts/validar-estudio.mjs
import { readFileSync } from "node:fs";

const BASE = "estudio/contenido/";
const errores = [];
const leer = (nombre) => {
  try {
    return JSON.parse(readFileSync(BASE + nombre + ".json", "utf8"));
  } catch (e) {
    errores.push(`${nombre}.json: formato JSON inválido → ${e.message}`);
    return null;
  }
};
const falta = (obj, campos, donde) =>
  campos.forEach((c) => (obj?.[c] === undefined || obj[c] === "") && errores.push(`${donde}: falta "${c}"`));

function revisarLeccion(l, donde) {
  falta(l, ["id", "titulo", "resumen"], donde);
  if (l.id && !/^[a-z0-9-]+$/.test(l.id)) errores.push(`${donde}: el id "${l.id}" solo puede tener minúsculas, números y guiones`);
  (l.secciones || []).forEach((s, i) => falta(s, ["titulo"], `${donde} sección ${i + 1}`));
  (l.conceptos || []).forEach((c, i) => falta(c, ["termino", "definicion"], `${donde} concepto ${i + 1}`));
  (l.preguntas || []).forEach((q, i) => {
    const d = `${donde} pregunta ${i + 1}`;
    falta(q, ["enunciado", "alternativas", "correcta", "explicacion"], d);
    const n = q.alternativas?.length || 0;
    if (n < 3 || n > 5) errores.push(`${d}: debe tener entre 3 y 5 alternativas`);
    if (!Number.isInteger(q.correcta) || q.correcta < 0 || q.correcta >= n) errores.push(`${d}: "correcta" debe ser un índice entre 0 y ${n - 1}`);
    if (!Array.isArray(q.descartes) || q.descartes.length !== n) errores.push(`${d}: "descartes" debe tener ${n} elementos (null en la correcta)`);
    else q.descartes.forEach((x, k) => {
      if (k === q.correcta && x !== null) errores.push(`${d}: el descarte de la alternativa correcta debe ser null`);
      if (k !== q.correcta && !x) errores.push(`${d}: falta explicar por qué la alternativa ${k + 1} es incorrecta`);
    });
    if (!Array.isArray(q.metodos) || q.metodos.length < 2) errores.push(`${d}: debe incluir 2 métodos de resolución`);
    (q.metodos || []).forEach((m, k) => falta(m, ["nombre", "pasos"], `${d} método ${k + 1}`));
  });
}

const indice = leer("materias");
const colecciones = [...(indice?.materias || []).map((m) => m.id), "aprender", "pdf"];
for (const id of colecciones) {
  const c = leer(id);
  if (!c) continue;
  const ids = new Set();
  (c.lecciones || []).forEach((l, i) => {
    revisarLeccion(l, `${id}.json lección ${i + 1} (${l.id || "sin id"})`);
    if (ids.has(l.id)) errores.push(`${id}.json: id repetido "${l.id}"`);
    ids.add(l.id);
  });
  const m = indice?.materias.find((x) => x.id === id);
  m?.capitulos.forEach((cap) => cap.lecciones.forEach((lid) => !ids.has(lid) && errores.push(`materias.json: "${id}" lista la lección "${lid}", que no existe en ${id}.json`)));
}

if (errores.length) {
  console.error("❌ Problemas en el contenido de estudio:\n");
  errores.forEach((e) => console.error(" • " + e));
  process.exit(1);
}
console.log("✅ Contenido de estudio correcto.");
