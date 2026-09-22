import ForceGraph3D, { type ForceGraph3DInstance } from '3d-force-graph';
import { forceCollide, forceRadial } from 'd3-force-3d';
import {
  type ActorSemantic,
  type FilterState,
  type PhysicsConfig,
  type RelacionSemantic,
  DEFAULT_PHYSICS_CONFIG,
  buildGraphData,
  createDefaultFilterState,
  getActorColor,
  getActorLabel,
  getActorVal,
  getLinkColor,
  getLinkLabel,
  getLinkParticleSpeed,
  getLinkParticles,
  getLinkWidth,
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
  physics?: Partial<PhysicsConfig>;
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
  private activeNodesMap = new Map<string, ActorSemantic>();
  private activeLinksMap = new Map<string, RelacionSemantic>();
  private currentFilters: FilterState | null = null;
  private currentPhysics: PhysicsConfig;
  private callbacks: GraphEngineCallbacks;

  constructor(container: HTMLElement, options: GraphEngineOptions = {}) {
    this.container = container;
    this.callbacks = options.callbacks || {};
    this.currentPhysics = {
      ...DEFAULT_PHYSICS_CONFIG,
      ...options.physics,
    };

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

    // Configurar fuerzas físicas iniciales
    this.applyPhysicsForces();
  }

  /**
   * Configura las fuerzas físicas en el motor d3-force-3d y recalienta la simulación.
   */
  public setPhysics(config: Partial<PhysicsConfig>): void {
    this.currentPhysics = {
      ...this.currentPhysics,
      ...config,
    };
    this.applyPhysicsForces();
    this.graph.d3ReheatSimulation();
  }

  /**
   * Obtiene la configuración física actual.
   */
  public getPhysics(): PhysicsConfig {
    return { ...this.currentPhysics };
  }

  /**
   * Aplica las fuerzas físicas al layout de d3:
   * 1. forceCollide: distancia mínima de exclusión (evita que los nodos se toquen)
   * 2. forceRadial: gravedad central (evita que se dispersen al infinito)
   * 3. charge: repulsión mutua (proporciona espacio y volumen a la constelación)
   * 4. link: distancia de reposo de los vínculos
   */
  private applyPhysicsForces(): void {
    const config = this.currentPhysics;

    // 1. Anticolisión 3D
    this.graph.d3Force(
      'collide',
      forceCollide((node: object) => {
        const actor = node as ActorSemantic;
        const val = getActorVal(actor);
        const radius = Math.cbrt(val) * 4;
        return radius + config.minDistance / 2;
      })
    );

    // 2. Gravedad central hacia (0,0,0)
    this.graph.d3Force(
      'radial',
      forceRadial(0, 0, 0, 0).strength(config.gravity)
    );

    // 3. Repulsión electrostática (ManyBody)
    const chargeForce = this.graph.d3Force('charge') as { strength?: (s: number) => void } | undefined;
    if (chargeForce && typeof chargeForce.strength === 'function') {
      chargeForce.strength(-config.repulsion);
    }

    // 4. Distancia de vínculos (cuando se activan criterios)
    const linkForce = this.graph.d3Force('link') as { distance?: (d: number) => void } | undefined;
    if (linkForce && typeof linkForce.distance === 'function') {
      linkForce.distance(config.linkDistance);
    }
  }

  /**
   * Carga o actualiza los datos del modelo (Capa 1: Data)
   */
  public setData(actores: ActorSemantic[], _relaciones?: RelacionSemantic[]): void {
    // Clonación superficial para evitar mutaciones directas de los JSONs originales
    this.rawActors = [...actores];
    this.activeNodesMap.clear();
    this.activeLinksMap.clear();
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
   * utilizando actualización diferencial para preservar la identidad de los nodos
   * existentes en memoria y en la GPU.
   */
  public render(): void {
    const filters = this.currentFilters || createDefaultFilterState();
    const { nodes, links } = buildGraphData(this.rawActors, filters);

    // 1. Reconciliación diferencial de nodos:
    // Preserva la identidad de los objetos existentes para no destruir sus mallas Three.js
    // ni reiniciar sus coordenadas (x, y, z) en la simulación física.
    const reconciledNodes: ActorSemantic[] = nodes.map((node) => {
      const existing = this.activeNodesMap.get(node.id);
      if (existing) {
        Object.assign(existing, node);
        return existing;
      }

      // Si es un nuevo nodo de criterio, posicionarlo cerca del centroide de los artistas vinculados
      if (node.tipo === 'criterio') {
        let sumX = 0;
        let sumY = 0;
        let sumZ = 0;
        let count = 0;

        for (const link of links) {
          const srcId = typeof link.source === 'object' && link.source !== null
            ? (link.source as { id: string }).id
            : String(link.source);
          const tgtId = typeof link.target === 'object' && link.target !== null
            ? (link.target as { id: string }).id
            : String(link.target);

          if (tgtId === node.id) {
            const artistNode = this.activeNodesMap.get(srcId);
            if (
              artistNode &&
              typeof artistNode.x === 'number' &&
              typeof artistNode.y === 'number' &&
              typeof artistNode.z === 'number'
            ) {
              sumX += artistNode.x;
              sumY += artistNode.y;
              sumZ += artistNode.z;
              count++;
            }
          }
        }

        if (count > 0) {
          node.x = sumX / count;
          node.y = sumY / count;
          node.z = sumZ / count;
        }
      }

      this.activeNodesMap.set(node.id, node);
      return node;
    });

    // Limpiar nodos deseleccionados de la memoria activa
    const activeNodeIds = new Set(reconciledNodes.map((n) => n.id));
    for (const id of this.activeNodesMap.keys()) {
      if (!activeNodeIds.has(id)) {
        this.activeNodesMap.delete(id);
      }
    }

    // 2. Reconciliación diferencial de enlaces:
    const reconciledLinks: RelacionSemantic[] = links.map((link) => {
      const sourceId = typeof link.source === 'object' && link.source !== null
        ? (link.source as { id: string }).id
        : String(link.source);
      const targetId = typeof link.target === 'object' && link.target !== null
        ? (link.target as { id: string }).id
        : String(link.target);
      const linkKey = `${sourceId}__${targetId}__${link.tipo}`;

      const existing = this.activeLinksMap.get(linkKey);
      if (existing) {
        Object.assign(existing, link);
        return existing;
      }

      this.activeLinksMap.set(linkKey, link);
      return link;
    });

    // Limpiar enlaces retirados
    const activeLinkKeys = new Set(
      reconciledLinks.map((l) => {
        const s = typeof l.source === 'object' && l.source !== null
          ? (l.source as { id: string }).id
          : String(l.source);
        const t = typeof l.target === 'object' && l.target !== null
          ? (l.target as { id: string }).id
          : String(l.target);
        return `${s}__${t}__${l.tipo}`;
      })
    );
    for (const key of this.activeLinksMap.keys()) {
      if (!activeLinkKeys.has(key)) {
        this.activeLinksMap.delete(key);
      }
    }

    // Pasar datos reconciliados al motor WebGL
    this.graph.graphData({
      nodes: reconciledNodes,
      links: reconciledLinks,
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
