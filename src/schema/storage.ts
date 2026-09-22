import {
  type PhysicsConfig,
  type VisualConfig,
  type SavedCriteriaPreset,
  DEFAULT_PHYSICS_CONFIG,
  DEFAULT_VISUAL_CONFIG,
} from './types';
import { type SearchConfig, DEFAULT_SEARCH_CONFIG } from './search';

export const STORAGE_KEY_PHYSICS = 'art_rel_physics_config';
export const STORAGE_KEY_VISUAL = 'art_rel_visual_config';
export const STORAGE_KEY_PRESETS = 'art_rel_saved_criteria_presets';
export const STORAGE_KEY_SEARCH = 'art_rel_search_config';

/**
 * Carga la configuración física desde localStorage con validación y fallback a defaults.
 */
export function loadStoredPhysicsConfig(): PhysicsConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PHYSICS);
    if (!raw) return DEFAULT_PHYSICS_CONFIG;
    const parsed = JSON.parse(raw);
    return {
      minDistance: typeof parsed.minDistance === 'number' ? parsed.minDistance : DEFAULT_PHYSICS_CONFIG.minDistance,
      repulsion: typeof parsed.repulsion === 'number' ? parsed.repulsion : DEFAULT_PHYSICS_CONFIG.repulsion,
      gravity: typeof parsed.gravity === 'number' ? parsed.gravity : DEFAULT_PHYSICS_CONFIG.gravity,
      linkDistance: typeof parsed.linkDistance === 'number' ? parsed.linkDistance : DEFAULT_PHYSICS_CONFIG.linkDistance,
    };
  } catch (e) {
    console.warn('Error al cargar configuración física desde localStorage:', e);
    return DEFAULT_PHYSICS_CONFIG;
  }
}

/**
 * Guarda la configuración física en localStorage.
 */
export function saveStoredPhysicsConfig(config: PhysicsConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY_PHYSICS, JSON.stringify(config));
  } catch (e) {
    console.warn('Error al guardar configuración física en localStorage:', e);
  }
}

/**
 * Carga la configuración visual desde localStorage con validación y fallback a defaults.
 */
export function loadStoredVisualConfig(): VisualConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_VISUAL);
    if (!raw) return DEFAULT_VISUAL_CONFIG;
    const parsed = JSON.parse(raw);
    return {
      showArtistNames: typeof parsed.showArtistNames === 'boolean' ? parsed.showArtistNames : DEFAULT_VISUAL_CONFIG.showArtistNames,
      artistFontSize: typeof parsed.artistFontSize === 'number' ? parsed.artistFontSize : DEFAULT_VISUAL_CONFIG.artistFontSize,
      dimmedOpacity: typeof parsed.dimmedOpacity === 'number' ? parsed.dimmedOpacity : DEFAULT_VISUAL_CONFIG.dimmedOpacity,
    };
  } catch (e) {
    console.warn('Error al cargar configuración visual desde localStorage:', e);
    return DEFAULT_VISUAL_CONFIG;
  }
}

/**
 * Guarda la configuración visual en localStorage.
 */
export function saveStoredVisualConfig(config: VisualConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY_VISUAL, JSON.stringify(config));
  } catch (e) {
    console.warn('Error al guardar configuración visual en localStorage:', e);
  }
}

/**
 * Carga la lista de presets de criterios guardados desde localStorage.
 */
export function loadStoredPresets(): SavedCriteriaPreset[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PRESETS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (p): p is SavedCriteriaPreset =>
        Boolean(p && typeof p === 'object' && typeof p.id === 'string' && typeof p.name === 'string' && p.criteria)
    );
  } catch (e) {
    console.warn('Error al cargar presets guardados desde localStorage:', e);
    return [];
  }
}

/**
 * Guarda la lista de presets de criterios en localStorage.
 */
export function saveStoredPresets(presets: SavedCriteriaPreset[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_PRESETS, JSON.stringify(presets));
  } catch (e) {
    console.warn('Error al guardar presets en localStorage:', e);
  }
}

/**
 * Carga la configuración del mecanismo de búsqueda desde localStorage.
 */
export function loadStoredSearchConfig(): SearchConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SEARCH);
    if (!raw) return DEFAULT_SEARCH_CONFIG;
    const parsed = JSON.parse(raw);
    return {
      mechanismId: typeof parsed.mechanismId === 'string' ? parsed.mechanismId : DEFAULT_SEARCH_CONFIG.mechanismId,
      levenshtein: {
        maxDistance:
          typeof parsed.levenshtein?.maxDistance === 'number'
            ? Math.max(1, Math.min(4, parsed.levenshtein.maxDistance))
            : DEFAULT_SEARCH_CONFIG.levenshtein.maxDistance,
      },
    };
  } catch (e) {
    console.warn('Error al cargar configuración de búsqueda desde localStorage:', e);
    return DEFAULT_SEARCH_CONFIG;
  }
}

/**
 * Guarda la configuración del mecanismo de búsqueda en localStorage.
 */
export function saveStoredSearchConfig(config: SearchConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY_SEARCH, JSON.stringify(config));
  } catch (e) {
    console.warn('Error al guardar configuración de búsqueda en localStorage:', e);
  }
}
