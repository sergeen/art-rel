import { isLevenshteinMatch, normalizeString } from './levenshtein';
import type { SearchConfig, SearchStrategy } from './types';

export const DEFAULT_SEARCH_CONFIG: SearchConfig = {
  mechanismId: 'contains',
  levenshtein: {
    maxDistance: 2,
  },
};

/**
 * Estrategia 1: Coincidencia Parcial (Contiene / Subcadena)
 */
export const containsStrategy: SearchStrategy = {
  id: 'contains',
  name: 'Coincidencia parcial (Contiene)',
  shortDescription: 'Busca coincidencias parciales dentro del criterio.',
  fullDescription:
    'El criterio se expone si incluye el texto ingresado en cualquier parte del término (ignora mayúsculas y acentos). Es ideal para explorar variantes como "papel" en "papel vegetal".',
  hasCustomConfig: false,
  matches: (target: string, query: string): boolean => {
    const normTarget = normalizeString(target);
    const normQuery = normalizeString(query);
    if (!normQuery) return true;
    return normTarget.includes(normQuery);
  },
};

/**
 * Estrategia 2: Coincidencia Exacta (Término completo)
 */
export const exactStrategy: SearchStrategy = {
  id: 'exact',
  name: 'Coincidencia exacta',
  shortDescription: 'Exige que el término sea idéntico al criterio.',
  fullDescription:
    'El criterio se expone únicamente si coincide letra por letra de manera exacta con el término buscado (ignora mayúsculas y acentos). Ideal para filtrados rigurosos.',
  hasCustomConfig: false,
  matches: (target: string, query: string): boolean => {
    const normTarget = normalizeString(target);
    const normQuery = normalizeString(query);
    if (!normQuery) return true;
    return normTarget === normQuery;
  },
};

/**
 * Estrategia 3: Distancia de Levenshtein (Búsqueda difusa)
 */
export const levenshteinStrategy: SearchStrategy = {
  id: 'levenshtein',
  name: 'Distancia Levenshtein (Búsqueda difusa)',
  shortDescription: 'Tolera errores ortográficos y variaciones de tipeo.',
  fullDescription:
    'Calcula la cantidad de operaciones de edición (inserciones, eliminaciones o sustituciones) necesarias para transformar un término en otro. Permite obtener resultados menos estrictos y tolerantes a errores tipográficos.',
  hasCustomConfig: true,
  matches: (target: string, query: string, config: SearchConfig): boolean => {
    const maxDist = config.levenshtein?.maxDistance ?? 2;
    return isLevenshteinMatch(target, query, maxDist);
  },
};

/**
 * Catálogo extensible de estrategias de búsqueda registradas.
 * Para añadir un nuevo mecanismo (ej. Embeddings semánticos o Metaphone fonético),
 * solo es necesario definir su SearchStrategy e incluirla en esta lista.
 */
export const SEARCH_STRATEGIES: SearchStrategy[] = [
  containsStrategy,
  exactStrategy,
  levenshteinStrategy,
];

export const SEARCH_STRATEGY_MAP: Record<string, SearchStrategy> = {
  contains: containsStrategy,
  exact: exactStrategy,
  levenshtein: levenshteinStrategy,
};

export function getSearchStrategy(id: string): SearchStrategy {
  return SEARCH_STRATEGY_MAP[id] || containsStrategy;
}
