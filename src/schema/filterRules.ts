import type { ActorSemantic, ActorTipo, FilterState, RelacionSemantic, RelacionTipo } from './types';
import { READING_CATEGORIES } from './categories';

/**
 * Crea el estado inicial de filtros.
 */
export function createDefaultFilterState(): FilterState {
  const allActorTypes: ActorTipo[] = ['artista', 'galeria', 'institucion', 'curador', 'coleccionista', 'criterio'];
  const allLinkTypes: RelacionTipo[] = [
    'representacion_comercial',
    'adquisicion_patrimonial',
    'consagracion_bienal',
    'retrospectiva_individual',
    'curaduria_general',
    'critica_y_teoria',
    'direccion_curatorial',
    'recuperacion_archivistica',
    'adquisicion_mercado',
    'donacion_mecenazgo',
    'beca_patrocinio',
    'residencia_taller',
    'prestamo_institucional',
    'criterio_vinculo',
  ];

  return {
    activeActorTypes: new Set<ActorTipo>(allActorTypes),
    activeLinkTypes: new Set<RelacionTipo>(allLinkTypes),
    minAnio: undefined,
    searchQuery: '',
    categoryFilters: {},
  };
}

/**
 * Evalúa si un artista coincide con la búsqueda de texto libre.
 */
function isArtistMatchingSearch(actor: ActorSemantic, query?: string): boolean {
  if (!query || query.trim().length === 0) {
    return true;
  }

  const q = query.toLowerCase().trim();
  const matchName = actor.nombre.toLowerCase().includes(q);
  const matchDisciplina = actor.disciplina?.toLowerCase().includes(q) ?? false;
  const matchPais = actor.pais?.toLowerCase().includes(q) ?? false;
  const matchCiudad = actor.ciudad?.toLowerCase().includes(q) ?? false;

  const categoryArrays: string[][] = [
    actor.personas || [],
    actor.practicas || [],
    actor.materiales || [],
    actor.conceptos || [],
    actor.instituciones || [],
    actor.galerias || [],
    actor.curadores || [],
    actor.coleccionistas || [],
    actor.residencias || [],
    actor.exhibiciones || [],
    actor.geografias || [],
    actor.formacion || [],
    actor.circulacion || [],
  ];
  const matchCategories = categoryArrays.some((arr) =>
    arr.some((item) => typeof item === 'string' && item.toLowerCase().includes(q))
  );

  return matchName || matchDisciplina || matchPais || matchCiudad || matchCategories;
}

/**
 * Determina si un actor individual debe ser visible (mantiene compatibilidad con API previa).
 */
export function isActorVisible(actor: ActorSemantic, filters: FilterState): boolean {
  if (actor.tipo !== 'artista') {
    return false;
  }
  return isArtistMatchingSearch(actor, filters.searchQuery);
}

/**
 * Transforma los datos sociológicos de entrada y el estado activo de filtros
 * en la topología visual del grafo:
 * - Al inicio solo se muestran los artistas como nodos individuales sin conexiones.
 * - Al activar un criterio (ej. Trabaja con: "papel"), se genera un nodo verde "Papel"
 *   y se conectan todos los artistas que trabajan con dicho material.
 * - Múltiples criterios seleccionados generan múltiples nodos verdes con sus respectivos enlaces.
 */
export function buildGraphData(
  rawActors: ActorSemantic[],
  filters: FilterState
): { nodes: ActorSemantic[]; links: RelacionSemantic[] } {
  // 1. Filtrar los artistas base respetando la búsqueda de texto
  const visibleArtists = rawActors.filter((actor) => {
    if (actor.tipo !== 'artista') return false;
    return isArtistMatchingSearch(actor, filters.searchQuery);
  });

  const nodes: ActorSemantic[] = [...visibleArtists];
  const links: RelacionSemantic[] = [];

  // Si no hay criterios de categoría activos, devolvemos únicamente los nodos artistas sin conexiones
  if (!filters.categoryFilters || Object.keys(filters.categoryFilters).length === 0) {
    return { nodes, links };
  }

  // 2. Por cada criterio seleccionado, generar el nodo conector (verde) y sus vínculos
  for (const [categoryId, selectedValues] of Object.entries(filters.categoryFilters)) {
    if (!selectedValues || selectedValues.size === 0) continue;

    const categoryMeta = READING_CATEGORIES.find((c) => c.id === categoryId);
    const categoryName = categoryMeta ? categoryMeta.name : categoryId;

    for (const rawVal of selectedValues) {
      const normVal = rawVal.toLowerCase().trim();
      if (!normVal) continue;

      const criterionNodeId = `criterio_${categoryId}_${normVal}`;

      // Encontrar todos los artistas visibles que posean este criterio
      const connectedArtistIds: string[] = [];

      for (const artist of visibleArtists) {
        const fieldValues = (artist as Record<string, unknown>)[categoryId];
        if (Array.isArray(fieldValues)) {
          const hasMatch = fieldValues.some(
            (v) => typeof v === 'string' && v.toLowerCase().trim() === normVal
          );
          if (hasMatch) {
            connectedArtistIds.push(artist.id);
          }
        }
      }

      // Nombre capitalizado para el nodo (ej. "Papel", "Cuerpo")
      const displayName = rawVal.charAt(0).toUpperCase() + rawVal.slice(1);

      const criterionNode: ActorSemantic = {
        id: criterionNodeId,
        nombre: displayName,
        tipo: 'criterio',
        categoriaId: categoryId,
        categoriaNombre: categoryName,
        criterioValor: rawVal,
        conectadosCount: connectedArtistIds.length,
      };

      nodes.push(criterionNode);

      // Crear enlaces entre los artistas y el nodo de criterio
      for (const artistId of connectedArtistIds) {
        links.push({
          source: artistId,
          target: criterionNodeId,
          tipo: 'criterio_vinculo',
          categoriaId: categoryId,
          criterioValor: displayName,
          criterioLabel: categoryName,
        });
      }
    }
  }

  return { nodes, links };
}

/**
 * Determina si un vínculo genérico debe ser visible (mantiene compatibilidad con API previa).
 */
export function isLinkVisible(
  relacion: RelacionSemantic,
  filters: FilterState,
  visibleNodeIds: Set<string>
): boolean {
  if (!filters.activeLinkTypes.has(relacion.tipo)) {
    return false;
  }

  const sourceId = typeof relacion.source === 'object' && relacion.source !== null
    ? (relacion.source as { id: string }).id
    : String(relacion.source);

  const targetId = typeof relacion.target === 'object' && relacion.target !== null
    ? (relacion.target as { id: string }).id
    : String(relacion.target);

  return visibleNodeIds.has(sourceId) && visibleNodeIds.has(targetId);
}
