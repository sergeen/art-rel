import type { RelacionSemantic, RelacionTipo } from './types';

export const LINK_TYPE_META: Record<
  RelacionTipo,
  { label: string; color: string; width: number; particles: number; speed: number }
> = {
  representacion_comercial: {
    label: 'Representación comercial',
    color: '#38bdf8', // Celeste claro
    width: 1.5,
    particles: 2,
    speed: 0.005,
  },
  adquisicion_patrimonial: {
    label: 'Adquisición patrimonial (Museo)',
    color: '#fbbf24', // Ámbar intenso
    width: 2.2,
    particles: 4,
    speed: 0.008,
  },
  consagracion_bienal: {
    label: 'Consagración en Bienal',
    color: '#f59e0b', // Ámbar dorado
    width: 2.5,
    particles: 5,
    speed: 0.01,
  },
  retrospectiva_individual: {
    label: 'Retrospectiva / Gran Exposición',
    color: '#ec4899', // Rosa
    width: 2.0,
    particles: 3,
    speed: 0.006,
  },
  curaduria_general: {
    label: 'Curaduría y selección',
    color: '#c084fc', // Violeta claro
    width: 1.2,
    particles: 2,
    speed: 0.004,
  },
  critica_y_teoria: {
    label: 'Ensayo crítico / Monografía',
    color: '#a855f7', // Violeta
    width: 1.2,
    particles: 1,
    speed: 0.003,
  },
  direccion_curatorial: {
    label: 'Dirección curatorial de acervo',
    color: '#818cf8', // Índigo
    width: 1.6,
    particles: 2,
    speed: 0.005,
  },
  recuperacion_archivistica: {
    label: 'Recuperación archivística',
    color: '#e879f9', // Fucsia pastel
    width: 1.4,
    particles: 2,
    speed: 0.004,
  },
  adquisicion_mercado: {
    label: 'Compra de coleccionista',
    color: '#34d399', // Verde esmeralda claro
    width: 1.8,
    particles: 3,
    speed: 0.007,
  },
  donacion_mecenazgo: {
    label: 'Donación y mecenazgo',
    color: '#10b981', // Verde esmeralda
    width: 2.0,
    particles: 4,
    speed: 0.008,
  },
  beca_patrocinio: {
    label: 'Beca y financiamiento',
    color: '#2dd4bf', // Turquesa
    width: 1.5,
    particles: 2,
    speed: 0.005,
  },
  residencia_taller: {
    label: 'Residencia en taller autogestionado',
    color: '#f472b6', // Rosa claro
    width: 1.2,
    particles: 1,
    speed: 0.003,
  },
  prestamo_institucional: {
    label: 'Préstamo entre galería y museo',
    color: '#94a3b8', // Pizarra
    width: 1.0,
    particles: 1,
    speed: 0.003,
  },
  criterio_vinculo: {
    label: 'Vínculo por Criterio',
    color: 'rgba(34, 197, 94, 0.45)', // Verde sutil acorde al nodo de criterio
    width: 1.2,
    particles: 0,
    speed: 0.003,
  },
};

export function getLinkColor(relacion: RelacionSemantic): string {
  if (relacion.tipo === 'criterio_vinculo') {
    return 'rgba(34, 197, 94, 0.45)';
  }
  const meta = LINK_TYPE_META[relacion.tipo];
  return meta ? meta.color : 'rgba(255, 255, 255, 0.2)';
}

export function getLinkWidth(relacion: RelacionSemantic): number {
  if (relacion.tipo === 'criterio_vinculo') {
    return 1.2;
  }
  const meta = LINK_TYPE_META[relacion.tipo];
  return meta ? meta.width : 1;
}

export function getLinkParticles(relacion: RelacionSemantic): number {
  if (relacion.tipo === 'criterio_vinculo') {
    return 0;
  }
  const meta = LINK_TYPE_META[relacion.tipo];
  return meta ? meta.particles : 1;
}

export function getLinkParticleSpeed(relacion: RelacionSemantic): number {
  const meta = LINK_TYPE_META[relacion.tipo];
  return meta ? meta.speed : 0.004;
}

export function getLinkLabel(relacion: RelacionSemantic): string {
  if (relacion.tipo === 'criterio_vinculo') {
    const label = relacion.criterioLabel || 'Criterio';
    const val = relacion.criterioValor || '';
    return `
      <div style="background: rgba(15, 23, 42, 0.9); padding: 6px 10px; border-radius: 6px; font-family: system-ui, sans-serif; font-size: 11px; border: 1px solid rgba(34, 197, 94, 0.3); color: #f1f5f9;">
        <strong style="color: #4ade80;">${label}:</strong> ${val}
      </div>
    `;
  }

  const meta = LINK_TYPE_META[relacion.tipo];
  const typeLabel = meta ? meta.label : relacion.tipo;
  const yearText = relacion.anio_inicio ? ` (${relacion.anio_inicio})` : '';

  return `
    <div style="background: rgba(15, 23, 42, 0.9); padding: 6px 10px; border-radius: 6px; font-family: system-ui, sans-serif; font-size: 11px; border: 1px solid rgba(255,255,255,0.1); color: #f1f5f9;">
      <strong>${typeLabel}</strong>${yearText}
      ${relacion.descripcion ? `<div style="color: #94a3b8; font-size: 10px; margin-top: 2px;">${relacion.descripcion}</div>` : ''}
    </div>
  `;
}
