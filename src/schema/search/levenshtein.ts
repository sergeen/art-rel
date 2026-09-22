/**
 * Normaliza una cadena de texto para comparaciones de búsqueda:
 * - Convierte a minúsculas.
 * - Elimina espacios en blanco al inicio y final.
 * - Descompone y elimina acentos y marcas diacríticas (ej. "óleo" -> "oleo").
 */
export function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/**
 * Calcula la distancia de edición de Levenshtein entre dos cadenas normalizadas.
 * Espacio de memoria optimizado O(min(m, n)).
 */
export function calculateLevenshteinDistance(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  // Optimizar tamaño del vector usando la cadena más corta como columnas
  let s1 = a;
  let s2 = b;
  if (s1.length < s2.length) {
    s1 = b;
    s2 = a;
  }

  const s1Len = s1.length;
  const s2Len = s2.length;

  let prevRow = new Array<number>(s2Len + 1);
  let currRow = new Array<number>(s2Len + 1);

  for (let j = 0; j <= s2Len; j++) {
    prevRow[j] = j;
  }

  for (let i = 1; i <= s1Len; i++) {
    currRow[0] = i;
    const char1 = s1.charAt(i - 1);

    for (let j = 1; j <= s2Len; j++) {
      const char2 = s2.charAt(j - 1);
      const cost = char1 === char2 ? 0 : 1;

      currRow[j] = Math.min(
        currRow[j - 1] + 1,      // Inserción
        prevRow[j] + 1,          // Eliminación
        prevRow[j - 1] + cost    // Sustitución
      );
    }

    // Intercambiar filas
    const temp = prevRow;
    prevRow = currRow;
    currRow = temp;
  }

  return prevRow[s2Len];
}

/**
 * Comprueba si un término objetivo coincide con una consulta bajo distancia Levenshtein.
 * Comprueba tanto la cadena completa como tokens individuales para soportar frases compuestas.
 * Ejemplo: query "pepel" con maxDistance=1 coincidirá con "obra sobre papel" y "papel".
 */
export function isLevenshteinMatch(
  target: string,
  query: string,
  maxDistance: number = 2
): boolean {
  const normTarget = normalizeString(target);
  const normQuery = normalizeString(query);

  if (!normQuery) return true;
  if (!normTarget) return false;

  // 1. Coincidencia directa o si ya contiene el término exactamente
  if (normTarget.includes(normQuery)) {
    return true;
  }

  // 2. Distancia en la cadena completa
  if (Math.abs(normTarget.length - normQuery.length) <= maxDistance) {
    const fullDist = calculateLevenshteinDistance(normTarget, normQuery);
    if (fullDist <= maxDistance) {
      return true;
    }
  }

  // 3. Distancia sobre palabras/tokens del target
  const tokens = normTarget.split(/[\s,./\-_+()]+/);
  for (const token of tokens) {
    if (token.length > 0 && Math.abs(token.length - normQuery.length) <= maxDistance) {
      const dist = calculateLevenshteinDistance(token, normQuery);
      if (dist <= maxDistance) {
        return true;
      }
    }
  }

  return false;
}
