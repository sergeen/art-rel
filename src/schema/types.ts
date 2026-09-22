export type ActorTipo = 'artista' | 'galeria' | 'institucion' | 'curador' | 'coleccionista';

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
  | 'prestamo_institucional';

export interface RelacionSemantic {
  source: string;
  target: string;
  tipo: RelacionTipo;
  formalidad?: string;
  anio_inicio?: number;
  descripcion?: string;
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

