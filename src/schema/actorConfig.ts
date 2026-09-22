import type { ActorSemantic, ActorTipo } from './types';

/**
 * Reglas visuales por categoría de actor sociológico.
 * Modifica estos valores para explorar diferentes teorías o agrupamientos visuales.
 */
export const ACTOR_TYPE_META: Record<
  ActorTipo,
  { label: string; color: string; baseVal: number; description: string }
> = {
  artista: {
    label: 'Artistas',
    color: '#f43f5e', // Rosa / Coral intenso
    baseVal: 12,
    description: 'Creadores y productores de capital simbólico',
  },
  galeria: {
    label: 'Galerías',
    color: '#0ea5e9', // Azul cian / cielo
    baseVal: 16,
    description: 'Espacios de mercado y representación comercial',
  },
  institucion: {
    label: 'Instituciones & Bienales',
    color: '#f59e0b', // Ámbar / Dorado
    baseVal: 22,
    description: 'Consagración histórica, legitimación y patrimonio público',
  },
  curador: {
    label: 'Curadores & Críticos',
    color: '#a855f7', // Violeta
    baseVal: 10,
    description: 'Mediadores teóricos, gatekeepers y articuladores discursivos',
  },
  coleccionista: {
    label: 'Coleccionistas & Fondos',
    color: '#10b981', // Verde esmeralda
    baseVal: 15,
    description: 'Inversionistas, fondos patrimoniales y mecenas',
  },
};

/**
 * Regla de color para un actor: basada en su tipo sociológico.
 */
export function getActorColor(actor: ActorSemantic): string {
  const meta = ACTOR_TYPE_META[actor.tipo];
  return meta ? meta.color : '#94a3b8';
}

/**
 * Regla de tamaño/peso en la simulación:
 * Modulado según la trayectoria y tipo de institución.
 */
export function getActorVal(actor: ActorSemantic): number {
  const meta = ACTOR_TYPE_META[actor.tipo];
  let val = meta ? meta.baseVal : 10;

  // Modulaciones sociológicas específicas
  if (actor.trayectoria === 'historica') val += 8;
  else if (actor.trayectoria === 'consagrada') val += 5;
  else if (actor.trayectoria === 'emergente') val -= 2;

  if (actor.subtipo === 'bienal' || actor.subtipo === 'museo_publico') val += 6;
  if (actor.capacidad_inversion === 'muy_alta') val += 5;

  return Math.max(val, 6);
}

/**
 * Regla de generación de tooltip/etiqueta HTML para el actor.
 */
export function getActorLabel(actor: ActorSemantic): string {
  const color = getActorColor(actor);
  const typeMeta = ACTOR_TYPE_META[actor.tipo];
  const typeLabel = typeMeta ? typeMeta.label : actor.tipo;

  const detailLines: string[] = [];
  if (actor.disciplina) detailLines.push(`<div><em>${actor.disciplina}</em></div>`);
  if (actor.practicas && actor.practicas.length > 0) detailLines.push(`<div><strong style="color:#a5b4fc">Prácticas:</strong> ${actor.practicas.join(', ')}</div>`);
  if (actor.conceptos && actor.conceptos.length > 0) detailLines.push(`<div><strong style="color:#cbd5e1">Conceptos:</strong> ${actor.conceptos.join(', ')}</div>`);
  if (actor.instituciones && actor.instituciones.length > 0) detailLines.push(`<div><strong style="color:#fcd34d">Instituciones:</strong> ${actor.instituciones.join(', ')}</div>`);
  if (actor.rol_campo) detailLines.push(`<div>Rol: ${actor.rol_campo}</div>`);
  if (actor.campo_especialidad) detailLines.push(`<div>Área: ${actor.campo_especialidad}</div>`);
  if (actor.foco_adquisicion) detailLines.push(`<div>Foco: ${actor.foco_adquisicion}</div>`);
  if (actor.ciudad || actor.pais) detailLines.push(`<div style="color:#64748b;font-size:11px;margin-top:2px;">${[actor.ciudad, actor.pais].filter(Boolean).join(' · ')}</div>`);

  return `
    <div style="background: rgba(15, 23, 42, 0.95); padding: 10px 14px; border-radius: 8px; font-family: system-ui, sans-serif; font-size: 12px; border: 1px solid rgba(255,255,255,0.15); box-shadow: 0 8px 24px rgba(0,0,0,0.6); max-width: 260px;">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
        <span style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em; color: ${color}; font-weight: 700;">${typeLabel}</span>
      </div>
      <strong style="color: #f8fafc; font-size: 14px; display: block; margin-bottom: 4px;">${actor.nombre}</strong>
      <div style="color: #cbd5e1; line-height: 1.4;">
        ${detailLines.join('')}
      </div>
    </div>
  `;
}
