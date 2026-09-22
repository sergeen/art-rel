export type ActorTipo = 'artista' | 'galeria' | 'institucion' | 'curador' | 'coleccionista' | 'criterio';

export interface ActorSemantic {
  id: string;
  nombre: string;
  tipo: ActorTipo;
  pais?: string;
  disciplina?: string;
  trayectoria?: 'emergente' | 'intermedia' | 'consagrada' | 'historica';
  capital_simbolico?: 'bajo' | 'medio' | 'alto';
  circuito_principal?: string;
  modelo?: string;
  alcance?: string;
  ciudad?: string;
  antiguedad_anios?: number;
  subtipo?: string;
  rol_campo?: string;
  perfil?: string;
  campo_especialidad?: string;
  reconocimiento?: string;
  tipo_fondo?: string;
  foco_adquisicion?: string;
  capacidad_inversion?: string;

  biografia?: string;
  anio_nacimiento?: number;

  // Propiedades para nodos dinámicos de criterio
  categoriaId?: string;
  categoriaNombre?: string;
  criterioValor?: string;
  conectadosCount?: number;

  // Coordenadas espaciales de la simulación 3D
  x?: number;
  y?: number;
  z?: number;
  vx?: number;
  vy?: number;
  vz?: number;

  // Categorías sociológicas de criterios de lectura
  personas?: string[];
  practicas?: string[];
  materiales?: string[];
  conceptos?: string[];
  instituciones?: string[];
  residencias?: string[];
  exhibiciones?: string[];
  geografias?: string[];
  formacion?: string[];
  circulacion?: string[];
  galerias?: string[];
  curadores?: string[];
  coleccionistas?: string[];

  [key: string]: unknown;
}

export type RelacionTipo =
  | 'representacion_comercial'
  | 'adquisicion_patrimonial'
  | 'consagracion_bienal'
  | 'retrospectiva_individual'
  | 'curaduria_general'
  | 'critica_y_teoria'
  | 'direccion_curatorial'
  | 'recuperacion_archivistica'
  | 'adquisicion_mercado'
  | 'donacion_mecenazgo'
  | 'beca_patrocinio'
  | 'residencia_taller'
  | 'prestamo_institucional'
  | 'criterio_vinculo';

export interface RelacionSemantic {
  source: string;
  target: string;
  tipo: RelacionTipo;
  formalidad?: string;
  anio_inicio?: number;
  descripcion?: string;
  categoriaId?: string;
  criterioValor?: string;
  criterioLabel?: string;
  [key: string]: unknown;
}

export interface ActorVisualProperties {
  color: string;
  val: number;
  labelHtml: string;
}

export interface LinkVisualProperties {
  color: string;
  width: number;
  particles: number;
  particleSpeed: number;
  labelHtml: string;
}

export interface FilterState {
  activeActorTypes?: Set<ActorTipo>;
  activeLinkTypes: Set<RelacionTipo>;
  minAnio?: number;
  searchQuery?: string;
  // Filtros sociológicos por categoría
  categoryFilters?: {
    [categoryId: string]: Set<string>;
  };
  activeCategoriesOnly?: Set<string>;
}

export interface PhysicsConfig {
  minDistance: number;   // Distancia mínima anticolisión entre nodos (px)
  repulsion: number;     // Fuerza de repulsión electrostática (ManyBody)
  gravity: number;       // Cohesión central / gravedad radial (evita dispersión infinita)
  linkDistance: number;  // Distancia ideal de los enlaces hacia nodos de criterio
}

export const DEFAULT_PHYSICS_CONFIG: PhysicsConfig = {
  minDistance: 20,
  repulsion: 90,
  gravity: 0.035,
  linkDistance: 45,
};

export interface VisualConfig {
  showArtistNames: boolean; // Mostrar nombres de artistas en vez de círculos rojos
  artistFontSize: number;   // Tamaño del texto del artista (px)
  dimmedOpacity: number;    // Nivel de opacidad para nodos y enlaces no seleccionados (0 a 1)
}

export const DEFAULT_VISUAL_CONFIG: VisualConfig = {
  showArtistNames: false,
  artistFontSize: 13,
  dimmedOpacity: 0.15,
};



