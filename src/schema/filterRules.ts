import type { ActorSemantic, ActorTipo, FilterState, RelacionSemantic, RelacionTipo } from './types';

/**
 * Crea el estado inicial de filtros con todas las entidades activas por defecto.
 */
export function createDefaultFilterState(): FilterState {
  const allActorTypes: ActorTipo[] = ['artista', 'galeria', 'institucion', 'curador', 'coleccionista'];
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
  ];

  return {
    activeActorTypes: new Set<ActorTipo>(allActorTypes),
    activeLinkTypes: new Set<RelacionTipo>(allLinkTypes),
    minAnio: undefined,
    searchQuery: '',
  };
}

/**
 * Determina si un actor debe ser visible según las reglas del filtro activo.
 */
export function isActorVisible(actor: ActorSemantic, filters: FilterState): boolean {
  if (!filters.activeActorTypes.has(actor.tipo)) {
    return false;
  }

  // Filtrado de categorías requeridas (debe tener al menos un valor en esa categoría)
  if (filters.activeCategoriesOnly && filters.activeCategoriesOnly.size > 0) {
    for (const catId of filters.activeCategoriesOnly) {
      const fieldValues = (actor as Record<string, unknown>)[catId];
      if (!Array.isArray(fieldValues) || fieldValues.length === 0) {
        return false;
      }
    }
  }

  // Filtrado por valores específicos seleccionados dentro de cada categoría
  if (filters.categoryFilters) {
    for (const [catId, selectedValues] of Object.entries(filters.categoryFilters)) {
      if (selectedValues && selectedValues.size > 0) {
        const fieldValues = (actor as Record<string, unknown>)[catId];
        if (!Array.isArray(fieldValues) || fieldValues.length === 0) {
          return false;
        }
        const hasMatch = fieldValues.some((val) =>
          typeof val === 'string' && selectedValues.has(val.toLowerCase().trim())
        );
        if (!hasMatch) {
          return false;
        }
      }
    }
  }

  // Búsqueda de texto libre
  if (filters.searchQuery && filters.searchQuery.trim().length > 0) {
    const query = filters.searchQuery.toLowerCase().trim();
    const matchName = actor.nombre.toLowerCase().includes(query);
    const matchDisciplina = actor.disciplina?.toLowerCase().includes(query) ?? false;
    const matchPais = actor.pais?.toLowerCase().includes(query) ?? false;
    const matchCiudad = actor.ciudad?.toLowerCase().includes(query) ?? false;

    // Buscar también en los términos de las categorías
    const categoryArrays: string[][] = [
      actor.personas || [],
      actor.practicas || [],
      actor.materiales || [],
      actor.conceptos || [],
      actor.instituciones || [],
      actor.residencias || [],
      actor.exhibiciones || [],
      actor.geografias || [],
      actor.formacion || [],
      actor.circulacion || [],
    ];
    const matchCategories = categoryArrays.some((arr) =>
      arr.some((item) => item.toLowerCase().includes(query))
    );

    if (!matchName && !matchDisciplina && !matchPais && !matchCiudad && !matchCategories) {
      return false;
    }
  }

  return true;
}

/**
 * Determina si un vínculo debe ser visible:
 * 1. Su tipo de relación debe estar activo en el filtro.
 * 2. Ambos extremos (source y target) deben existir y ser visibles.
 * 3. Si hay filtro de año mínimo, debe cumplirse.
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

  if (!visibleNodeIds.has(sourceId) || !visibleNodeIds.has(targetId)) {
    return false;
  }

  if (filters.minAnio && relacion.anio_inicio && relacion.anio_inicio < filters.minAnio) {
    return false;
  }

  return true;
}
