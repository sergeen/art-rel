import * as THREE from 'three';
import ForceGraph3D, { type ForceGraph3DInstance } from '3d-force-graph';
import { forceCollide, forceRadial } from 'd3-force-3d';
import {
  type ActorSemantic,
  type FilterState,
  type PhysicsConfig,
  type RelacionSemantic,
  type VisualConfig,
  DEFAULT_PHYSICS_CONFIG,
  DEFAULT_VISUAL_CONFIG,
  buildGraphData,
  createDefaultFilterState,
  getActorColor,
  getActorHoverColor,
  getActorLabel,
  getActorVal,
  getLinkColor,
  getLinkColorWithOpacity,
  getLinkLabel,
  getLinkParticleSpeed,
  getLinkParticles,
  getLinkWidth,
  hexToRgba,
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
  visual?: Partial<VisualConfig>;
}

interface SpriteCacheEntry {
  sprite: THREE.Sprite;
  canvas: HTMLCanvasElement;
  texture: THREE.CanvasTexture;
  actor: ActorSemantic;
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
  private visualConfig: VisualConfig;
  private callbacks: GraphEngineCallbacks;

  // Estado de selección y hover para atenuación / resaltado
  private selectedActor: ActorSemantic | null = null;
  private hoveredActor: ActorSemantic | null = null;
  private highlightedNodeIds = new Set<string>();
  private highlightedLinkKeys = new Set<string>();

  // Caché de sprites Three.js para nombres de artistas y criterios
  private textSprites = new Map<string, SpriteCacheEntry>();

  constructor(container: HTMLElement, options: GraphEngineOptions = {}) {
    this.container = container;
    this.callbacks = options.callbacks || {};
    this.currentPhysics = {
      ...DEFAULT_PHYSICS_CONFIG,
      ...options.physics,
    };
    this.visualConfig = {
      ...DEFAULT_VISUAL_CONFIG,
      ...options.visual,
    };

    // Inicializar instancia de 3d-force-graph
    this.graph = new ForceGraph3D(this.container)
      .backgroundColor(options.backgroundColor || '#040508')
      .nodeId('id')
      // Custom 3D object: Renderizado de texto para artistas y criterios
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .nodeThreeObject(this.createNodeThreeObjectAccessor() as any)
      // Regla de color y opacidad por selección
      .nodeColor((node: object) => this.getNodeRenderColor(node as ActorSemantic))
      .nodeVal((node: object) => getActorVal(node as ActorSemantic))
      .nodeLabel((node: object) => {
        const actor = node as ActorSemantic;
        // Cuando el modo texto está activo para artistas y criterios, se oculta el popup informativo
        if (
          this.visualConfig.showArtistNames &&
          (actor.tipo === 'artista' || actor.tipo === 'criterio')
        ) {
          return '';
        }
        return getActorLabel(actor);
      })
      .nodeResolution(24)
      // Vínculos con soporte de atenuación según selección
      .linkColor((link: object) => this.getLinkRenderColor(link as RelacionSemantic))
      .linkWidth((link: object) => this.getLinkRenderWidth(link as RelacionSemantic))
      .linkLabel((link: object) => getLinkLabel(link as RelacionSemantic))
      .linkDirectionalParticles((link: object) => this.getLinkRenderParticles(link as RelacionSemantic))
      .linkDirectionalParticleSpeed((link: object) => getLinkParticleSpeed(link as RelacionSemantic))
      .linkDirectionalParticleWidth(1.6)
      // Eventos de interacción
      .onNodeClick((node: object) => {
        const actor = node as ActorSemantic;
        this.setSelectedActor(actor);
        if (this.callbacks.onNodeClick) {
          this.callbacks.onNodeClick(actor);
        }
      })
      .onNodeHover((node: object | null) => {
        const actor = node ? (node as ActorSemantic) : null;
        this.hoveredActor = actor;
        this.updateHoverStates();
        if (this.callbacks.onNodeHover) {
          this.callbacks.onNodeHover(actor);
        }
      })
      .onLinkClick((link: object) => {
        if (this.callbacks.onLinkClick) {
          this.callbacks.onLinkClick(link as RelacionSemantic);
        }
      })
      .onBackgroundClick(() => {
        this.setSelectedActor(null);
        if (this.callbacks.onBackgroundClick) {
          this.callbacks.onBackgroundClick();
        }
      });

    // Configurar fuerzas físicas iniciales
    this.applyPhysicsForces();
  }

  /**
   * Helper para obtener el ID de un extremo de enlace de forma homogénea.
   */
  private getLinkId(nodeOrId: unknown): string {
    if (!nodeOrId) return '';
    if (typeof nodeOrId === 'object' && 'id' in (nodeOrId as Record<string, unknown>)) {
      return String((nodeOrId as { id: unknown }).id);
    }
    return String(nodeOrId);
  }

  /**
   * Recalcula los conjuntos de nodos y enlaces conectados al elemento seleccionado.
   */
  private recomputeHighlightedSets(): void {
    this.highlightedNodeIds.clear();
    this.highlightedLinkKeys.clear();

    const selectedId = this.selectedActor?.id || null;
    if (!selectedId) return;

    this.highlightedNodeIds.add(selectedId);
    const links = (this.graph.graphData().links || []) as Array<{
      source: unknown;
      target: unknown;
      tipo: string;
    }>;

    for (const link of links) {
      const sId = this.getLinkId(link.source);
      const tId = this.getLinkId(link.target);
      const key = `${sId}__${tId}__${link.tipo}`;

      if (sId === selectedId) {
        this.highlightedNodeIds.add(tId);
        this.highlightedLinkKeys.add(key);
      } else if (tId === selectedId) {
        this.highlightedNodeIds.add(sId);
        this.highlightedLinkKeys.add(key);
      }
    }
  }

  /**
   * Crea un accessor nuevo para nodeThreeObject para forzar refresco en ThreeForceGraph.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private createNodeThreeObjectAccessor(): (nodeObj: object) => any {
    return (nodeObj: object) => {
      const node = nodeObj as ActorSemantic;
      if (
        this.visualConfig.showArtistNames &&
        (node.tipo === 'artista' || node.tipo === 'criterio')
      ) {
        return this.getOrCreateTextSprite(node);
      }
      return undefined;
    };
  }

  /**
   * Obtiene o crea un sprite 3D optimizado con el nombre del nodo.
   */
  private getOrCreateTextSprite(node: ActorSemantic): THREE.Sprite {
    let entry = this.textSprites.get(node.id);
    if (!entry) {
      entry = this.createTextSprite(node);
      this.textSprites.set(node.id, entry);
    } else {
      entry.actor = node;
    }
    this.syncSingleSpriteVisuals(node.id, entry);
    return entry.sprite;
  }

  /**
   * Crea el sprite Three.js con textura en Canvas de alta resolución.
   */
  private createTextSprite(actor: ActorSemantic): SpriteCacheEntry {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;

    // Factor de nitidez Retina / Hi-DPI
    const dpr = 3;
    const isCriterio = actor.tipo === 'criterio';
    const baseFontSize = Math.max(this.visualConfig.artistFontSize, 10);
    const scaledSize = isCriterio ? Math.round(baseFontSize * 1.15) : baseFontSize;
    const fontPx = scaledSize * dpr;
    const fontWeight = isCriterio ? '700' : '600';

    ctx.font = `${fontWeight} ${fontPx}px system-ui, -apple-system, sans-serif`;
    const metrics = ctx.measureText(actor.nombre);
    const textWidth = Math.ceil(metrics.width);
    const textHeight = Math.ceil(fontPx * 1.35);

    canvas.width = textWidth + 24 * dpr;
    canvas.height = textHeight + 12 * dpr;

    // Reasignar tras redimensionar el lienzo
    ctx.font = `${fontWeight} ${fontPx}px system-ui, -apple-system, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Sombra sutil para legibilidad sobre el fondo negro espacial
    ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
    ctx.shadowBlur = 5 * dpr;
    ctx.fillStyle = '#ffffff';
    ctx.fillText(actor.nombre, canvas.width / 2, canvas.height / 2);

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    texture.generateMipmaps = false;

    const material = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      opacity: 1.0,
      depthWrite: false,
    });

    // Color según tipo: artistas en rojo, criterios en verde
    material.color.setStyle(getActorColor(actor));

    const sprite = new THREE.Sprite(material);
    const aspect = canvas.width / canvas.height;
    const worldHeight = scaledSize * 0.72;
    const worldWidth = worldHeight * aspect;
    sprite.scale.set(worldWidth, worldHeight, 1);

    return { sprite, canvas, texture, actor };
  }

  /**
   * Sincroniza opacidad y color de un sprite específico.
   */
  private syncSingleSpriteVisuals(nodeId: string, entry: SpriteCacheEntry): void {
    const selectedId = this.selectedActor?.id || null;
    const isHovered = this.hoveredActor?.id === nodeId;

    // Opacidad según selección
    let opacity = 1.0;
    if (selectedId !== null) {
      const isConnected = this.highlightedNodeIds.has(nodeId);
      opacity = isConnected ? 1.0 : this.visualConfig.dimmedOpacity;
    }
    entry.sprite.material.opacity = opacity;

    // Color según tipo y estado de hover
    if (isHovered) {
      entry.sprite.material.color.setStyle(getActorHoverColor(entry.actor));
    } else {
      entry.sprite.material.color.setStyle(getActorColor(entry.actor));
    }

    entry.sprite.material.needsUpdate = true;
  }

  /**
   * Actualiza la escala geométrica de todos los sprites de texto.
   */
  private updateSpriteScales(): void {
    for (const entry of this.textSprites.values()) {
      const aspect = entry.canvas.width / entry.canvas.height;
      const isCriterio = entry.actor.tipo === 'criterio';
      const baseFontSize = Math.max(this.visualConfig.artistFontSize, 10);
      const scaledSize = isCriterio ? Math.round(baseFontSize * 1.15) : baseFontSize;
      const worldHeight = scaledSize * 0.72;
      const worldWidth = worldHeight * aspect;
      entry.sprite.scale.set(worldWidth, worldHeight, 1);
    }
  }

  /**
   * Actualización liviana y en tiempo real del estado de hover (sin recrear escena).
   */
  private updateHoverStates(): void {
    const hoveredId = this.hoveredActor?.id || null;

    // Actualizar sprites de texto
    for (const [nodeId, entry] of this.textSprites.entries()) {
      const isHovered = hoveredId === nodeId;
      if (isHovered) {
        entry.sprite.material.color.setStyle(getActorHoverColor(entry.actor));
      } else {
        entry.sprite.material.color.setStyle(getActorColor(entry.actor));
      }
      entry.sprite.material.needsUpdate = true;
    }

    // Actualizar color de nodos estándar si no están en modo texto
    if (!this.visualConfig.showArtistNames) {
      this.graph.nodeColor(this.graph.nodeColor());
    }
  }

  /**
   * Actualiza todos los estilos visuales (opacidad, colores y grosores) en la escena WebGL.
   */
  private updateVisualStyles(): void {
    // 1. Sincronizar todos los sprites existentes
    for (const [nodeId, entry] of this.textSprites.entries()) {
      this.syncSingleSpriteVisuals(nodeId, entry);
    }

    // 2. Disparar reevaluación de los accessors de 3d-force-graph
    this.graph
      .nodeColor(this.graph.nodeColor())
      .linkColor(this.graph.linkColor())
      .linkWidth(this.graph.linkWidth())
      .linkDirectionalParticles(this.graph.linkDirectionalParticles());
  }

  /**
   * Obtiene el color de renderizado para un nodo esfera según el estado de selección.
   */
  private getNodeRenderColor(actor: ActorSemantic): string {
    const selectedId = this.selectedActor?.id || null;
    const isHovered = this.hoveredActor?.id === actor.id;

    let baseColor = getActorColor(actor);
    if (isHovered) {
      baseColor = getActorHoverColor(actor);
    }

    if (selectedId === null) {
      return baseColor;
    }

    const isConnected = this.highlightedNodeIds.has(actor.id);
    if (isConnected) {
      return baseColor;
    }

    return hexToRgba(baseColor, this.visualConfig.dimmedOpacity);
  }

  /**
   * Obtiene el color de renderizado de un enlace según el estado de selección.
   */
  private getLinkRenderColor(link: RelacionSemantic): string {
    const selectedId = this.selectedActor?.id || null;
    const baseColor = getLinkColor(link);

    if (selectedId === null) {
      return baseColor;
    }

    const sId = this.getLinkId(link.source);
    const tId = this.getLinkId(link.target);
    const key = `${sId}__${tId}__${link.tipo}`;

    if (this.highlightedLinkKeys.has(key)) {
      return baseColor;
    }

    const dimmedAlpha = Math.max(this.visualConfig.dimmedOpacity * 0.35, 0.02);
    return getLinkColorWithOpacity(link, dimmedAlpha);
  }

  /**
   * Obtiene el grosor de renderizado de un enlace según el estado de selección.
   */
  private getLinkRenderWidth(link: RelacionSemantic): number {
    const selectedId = this.selectedActor?.id || null;
    const baseWidth = getLinkWidth(link);

    if (selectedId === null) {
      return baseWidth;
    }

    const sId = this.getLinkId(link.source);
    const tId = this.getLinkId(link.target);
    const key = `${sId}__${tId}__${link.tipo}`;

    if (this.highlightedLinkKeys.has(key)) {
      return Math.max(baseWidth * 1.5, 2.0);
    }

    return 0.4;
  }

  /**
   * Obtiene las partículas activas de un enlace según el estado de selección.
   */
  private getLinkRenderParticles(link: RelacionSemantic): number {
    const selectedId = this.selectedActor?.id || null;
    const baseParticles = getLinkParticles(link);

    if (selectedId === null) {
      return baseParticles;
    }

    const sId = this.getLinkId(link.source);
    const tId = this.getLinkId(link.target);
    const key = `${sId}__${tId}__${link.tipo}`;

    if (this.highlightedLinkKeys.has(key)) {
      return Math.max(baseParticles, 2);
    }

    return 0;
  }

  /**
   * Establece el actor o criterio actualmente seleccionado.
   * Si es null, todos los nodos recuperan su opacidad normal.
   */
  public setSelectedActor(actor: ActorSemantic | null): void {
    this.selectedActor = actor;
    this.recomputeHighlightedSets();
    this.updateVisualStyles();
  }

  /**
   * Obtiene el actor seleccionado actual.
   */
  public getSelectedActor(): ActorSemantic | null {
    return this.selectedActor;
  }

  /**
   * Actualiza la configuración visual (modo texto, tamaño de tipografía, atenuación).
   */
  public setVisualConfig(config: Partial<VisualConfig>): void {
    const prevShowNames = this.visualConfig.showArtistNames;
    const prevFontSize = this.visualConfig.artistFontSize;

    this.visualConfig = {
      ...this.visualConfig,
      ...config,
    };

    // Si se alternó el modo de texto, reconstruir los objetos 3D de los nodos
    if (config.showArtistNames !== undefined && config.showArtistNames !== prevShowNames) {
      this.textSprites.clear();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.graph.nodeThreeObject(this.createNodeThreeObjectAccessor() as any);
    }

    // Si cambió el tamaño tipográfico, reescalar sprites existentes
    if (config.artistFontSize !== undefined && config.artistFontSize !== prevFontSize) {
      this.updateSpriteScales();
    }

    this.updateVisualStyles();
  }

  /**
   * Obtiene la configuración visual actual.
   */
  public getVisualConfig(): VisualConfig {
    return { ...this.visualConfig };
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
    this.rawActors = [...actores];
    this.activeNodesMap.clear();
    this.activeLinksMap.clear();
    this.textSprites.clear();
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

    // Limpiar nodos deseleccionados de la memoria activa y caché de sprites
    const activeNodeIds = new Set(reconciledNodes.map((n) => n.id));
    for (const id of this.activeNodesMap.keys()) {
      if (!activeNodeIds.has(id)) {
        this.activeNodesMap.delete(id);
        this.textSprites.delete(id);
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

    // Recalcular selección si existe un actor seleccionado actualmente
    this.recomputeHighlightedSets();
    this.updateVisualStyles();
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
    this.textSprites.clear();
    this.graph._destructor();
  }
}
