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

  if (filters.searchQuery && filters.searchQuery.trim().length > 0) {
    const query = filters.searchQuery.toLowerCase();
    const matchName = actor.nombre.toLowerCase().includes(query);
    const matchDisciplina = actor.disciplina?.toLowerCase().includes(query) ?? false;
    const matchPais = actor.pais?.toLowerCase().includes(query) ?? false;
    const matchCiudad = actor.ciudad?.toLowerCase().includes(query) ?? false;

    if (!matchName && !matchDisciplina && !matchPais && !matchCiudad) {
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
