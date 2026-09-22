import ForceGraph3D, { type ForceGraph3DInstance } from '3d-force-graph';
import {
  type ActorSemantic,
  type FilterState,
  type RelacionSemantic,
  getActorColor,
  getActorLabel,
  getActorVal,
  getLinkColor,
  getLinkLabel,
  getLinkParticleSpeed,
  getLinkParticles,
  getLinkWidth,
  isActorVisible,
  isLinkVisible,
} from '../schema';

export interface GraphEngineCallbacks {
  onNodeClick?: (node: ActorSemantic) => void;
  onNodeHover?: (node: ActorSemantic | null) => void;
  onLinkClick?: (link: RelacionSemantic) => void;
  onBackgroundClick?: () => void;
}

export interface GraphEngineOptions {
  backgroundColor?: string;
  callbacks?: GraphEngineCallbacks;
}

/**
 * Capa 3: Motor agnóstico de visualización.
 * No toma decisiones semánticas ni sociológicas: ejecuta fielmente
 * las reglas provistas por la Capa 2 (Schema) sobre los datos de la Capa 1 (Data).
 */
export class GraphEngine {
  private container: HTMLElement;
  private graph: ForceGraph3DInstance;
  private rawActors: ActorSemantic[] = [];
  private rawRelaciones: RelacionSemantic[] = [];
  private currentFilters: FilterState | null = null;
  private callbacks: GraphEngineCallbacks;

  constructor(container: HTMLElement, options: GraphEngineOptions = {}) {
    this.container = container;
    this.callbacks = options.callbacks || {};

    // Inicializar instancia de 3d-force-graph
    this.graph = new ForceGraph3D(this.container)
      .backgroundColor(options.backgroundColor || '#040508')
      .nodeId('id')
      // Delegar todas las propiedades estéticas y de escala al schema
      .nodeColor((node: object) => getActorColor(node as ActorSemantic))
      .nodeVal((node: object) => getActorVal(node as ActorSemantic))
      .nodeLabel((node: object) => getActorLabel(node as ActorSemantic))
      .nodeResolution(24)
      .linkColor((link: object) => getLinkColor(link as RelacionSemantic))
      .linkWidth((link: object) => getLinkWidth(link as RelacionSemantic))
      .linkLabel((link: object) => getLinkLabel(link as RelacionSemantic))
      .linkDirectionalParticles((link: object) => getLinkParticles(link as RelacionSemantic))
      .linkDirectionalParticleSpeed((link: object) => getLinkParticleSpeed(link as RelacionSemantic))
      .linkDirectionalParticleWidth(1.6)
      // Eventos de interacción
      .onNodeClick((node: object) => {
        if (this.callbacks.onNodeClick) {
          this.callbacks.onNodeClick(node as ActorSemantic);
        }
      })
      .onNodeHover((node: object | null) => {
        if (this.callbacks.onNodeHover) {
          this.callbacks.onNodeHover(node ? (node as ActorSemantic) : null);
        }
      })
      .onLinkClick((link: object) => {
        if (this.callbacks.onLinkClick) {
          this.callbacks.onLinkClick(link as RelacionSemantic);
        }
      })
      .onBackgroundClick(() => {
        if (this.callbacks.onBackgroundClick) {
          this.callbacks.onBackgroundClick();
        }
      });
  }

  /**
   * Carga o actualiza los datos del modelo (Capa 1: Data)
   */
  public setData(actores: ActorSemantic[], relaciones: RelacionSemantic[]): void {
    // Clonación superficial para evitar mutaciones directas de los JSONs originales
    this.rawActors = [...actores];
    this.rawRelaciones = [...relaciones];
    this.render();
  }

  /**
   * Actualiza el estado de los filtros (Capa 2: Schema / FilterRules)
   */
  public setFilter(filters: FilterState): void {
    this.currentFilters = filters;
    this.render();
  }

  /**
   * Aplica las reglas del schema y regenera la topología visible
   */
  public render(): void {
    let filteredActors = this.rawActors;

    if (this.currentFilters) {
      filteredActors = this.rawActors.filter((actor) =>
        isActorVisible(actor, this.currentFilters!)
      );
    }

    const visibleNodeIds = new Set(filteredActors.map((a) => a.id));

    let filteredLinks = this.rawRelaciones;
    if (this.currentFilters) {
      filteredLinks = this.rawRelaciones.filter((link) =>
        isLinkVisible(link, this.currentFilters!, visibleNodeIds)
      );
    } else {
      // Garantizar coherencia referencial
      filteredLinks = this.rawRelaciones.filter((link) => {
        const sourceId = typeof link.source === 'object' && link.source !== null
          ? (link.source as { id: string }).id
          : String(link.source);
        const targetId = typeof link.target === 'object' && link.target !== null
          ? (link.target as { id: string }).id
          : String(link.target);
        return visibleNodeIds.has(sourceId) && visibleNodeIds.has(targetId);
      });
    }

    // Pasar datos al motor
    this.graph.graphData({
      nodes: filteredActors.map((a) => ({ ...a })),
      links: filteredLinks.map((l) => ({ ...l })),
    });
  }

  /**
   * Redimensiona el viewport del canvas
   */
  public resize(): void {
    if (this.container) {
      this.graph.width(this.container.clientWidth);
      this.graph.height(this.container.clientHeight);
    }
  }

  /**
   * Centra y enfoca la cámara sobre el grafo
   */
  public zoomToFit(durationMs = 800): void {
    this.graph.zoomToFit(durationMs, 50);
  }

  /**
   * Libera recursos WebGL y listeners de la escena
   */
  public destroy(): void {
    this.graph._destructor();
  }
}
