import { useEffect, useRef, useState } from 'react';
import ForceGraph3D, { type ForceGraph3DInstance } from '3d-force-graph';
import './App.css';

interface ArtNode {
  id: string;
  name: string;
  category: 'artist' | 'gallery' | 'institution' | 'curator' | 'collector';
  role: string;
  val: number;
  color: string;
}

interface ArtLink {
  source: string;
  target: string;
  relation: string;
}

interface GraphData {
  nodes: ArtNode[];
  links: ArtLink[];
}

const CATEGORY_COLORS: Record<ArtNode['category'], string> = {
  artist: '#ec4899',       // Pink
  gallery: '#38bdf8',      // Sky blue
  institution: '#f59e0b',  // Amber
  curator: '#a855f7',      // Purple
  collector: '#10b981',    // Emerald
};

const INITIAL_DATA: GraphData = {
  nodes: [
    // Artistas
    { id: 'art-1', name: 'Ana Mendieta', category: 'artist', role: 'Artista Conceptual / Performance', val: 14, color: CATEGORY_COLORS.artist },
    { id: 'art-2', name: 'León Ferrari', category: 'artist', role: 'Artista Visual / Crítica Institucional', val: 16, color: CATEGORY_COLORS.artist },
    { id: 'art-3', name: 'Marta Minujín', category: 'artist', role: 'Artista Pop / Happenings', val: 18, color: CATEGORY_COLORS.artist },
    { id: 'art-4', name: 'Gabriel Orozco', category: 'artist', role: 'Escultura / Fotografía Contemporánea', val: 15, color: CATEGORY_COLORS.artist },
    
    // Galerías
    { id: 'gal-1', name: 'Galería Sur Global', category: 'gallery', role: 'Galería Comercial Principal', val: 16, color: CATEGORY_COLORS.gallery },
    { id: 'gal-2', name: 'White Cube Studio', category: 'gallery', role: 'Galería Internacional', val: 18, color: CATEGORY_COLORS.gallery },

    // Instituciones & Museos
    { id: 'inst-1', name: 'Museo de Arte Moderno (MAM)', category: 'institution', role: 'Institución Pública de Consagración', val: 24, color: CATEGORY_COLORS.institution },
    { id: 'inst-2', name: 'Bienal Internacional', category: 'institution', role: 'Circuito Global de Legitimación', val: 26, color: CATEGORY_COLORS.institution },
    { id: 'inst-3', name: 'Centro Cultural de Arte Experimental', category: 'institution', role: 'Espacio de Emergencia y Residencia', val: 14, color: CATEGORY_COLORS.institution },

    // Curadores / Críticos
    { id: 'cur-1', name: 'Gerardo Mosquera', category: 'curator', role: 'Curador Independiente / Teórico', val: 12, color: CATEGORY_COLORS.curator },
    { id: 'cur-2', name: 'Mari Carmen Ramírez', category: 'curator', role: 'Curadora en Jefe de Museo', val: 14, color: CATEGORY_COLORS.curator },

    // Coleccionistas / Mecenas
    { id: 'col-1', name: 'Colección Patricia Phelps', category: 'collector', role: 'Colección Privada / Mecenazgo', val: 18, color: CATEGORY_COLORS.collector },
    { id: 'col-2', name: 'Fondo de Adquisición Bemberg', category: 'collector', role: 'Fideicomiso de Arte', val: 15, color: CATEGORY_COLORS.collector },
  ],
  links: [
    // Relaciones de representación e intercambio
    { source: 'art-1', target: 'gal-1', relation: 'Representación comercial' },
    { source: 'art-2', target: 'gal-1', relation: 'Representación comercial' },
    { source: 'art-3', target: 'gal-2', relation: 'Representación en ferias internacionales' },
    { source: 'art-4', target: 'gal-2', relation: 'Exhibición individual' },

    // Consagración y legitimación institucional
    { source: 'art-1', target: 'inst-1', relation: 'Adquisición de obra para colección permanente' },
    { source: 'art-2', target: 'inst-2', relation: 'Gran Premio de Bienal' },
    { source: 'art-3', target: 'inst-3', relation: 'Instalación sitio específico' },
    { source: 'art-4', target: 'inst-1', relation: 'Retrospectiva institucional' },

    // Mediación curatorial
    { source: 'cur-1', target: 'inst-2', relation: 'Curaduría principal' },
    { source: 'cur-1', target: 'art-2', relation: 'Ensayo crítico y selección' },
    { source: 'cur-2', target: 'inst-1', relation: 'Curaduría de acervo' },
    { source: 'cur-2', target: 'art-1', relation: 'Investigación monográfica' },

    // Flujo de capital económico y patrocinio
    { source: 'col-1', target: 'gal-1', relation: 'Adquisición en mercado primario' },
    { source: 'col-1', target: 'inst-1', relation: 'Donación de lote y mecenazgo' },
    { source: 'col-2', target: 'art-4', relation: 'Comisión de obra nueva' },
  ],
};

export default function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedNode, setSelectedNode] = useState<ArtNode | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const graph: ForceGraph3DInstance = new ForceGraph3D(containerRef.current)
      .graphData(INITIAL_DATA)
      .backgroundColor('#040508')
      .nodeId('id')
      .nodeLabel((node: object) => {
        const n = node as ArtNode;
        return `
          <div style="background: rgba(15,23,42,0.9); padding: 8px 12px; border-radius: 6px; font-family: sans-serif; font-size: 12px; border: 1px solid rgba(255,255,255,0.15); box-shadow: 0 4px 12px rgba(0,0,0,0.5);">
            <strong style="color: ${n.color}; display: block; font-size: 13px;">${n.name}</strong>
            <span style="color: #94a3b8;">${n.role}</span>
          </div>
        `;
      })
      .nodeVal('val')
      .nodeColor((node: object) => (node as ArtNode).color)
      .nodeResolution(20)
      .linkLabel((link: object) => {
        const l = link as ArtLink;
        return `<span style="background: rgba(0,0,0,0.8); padding: 3px 6px; border-radius: 4px; font-size: 11px;">${l.relation}</span>`;
      })
      .linkWidth(1.2)
      .linkColor(() => 'rgba(255, 255, 255, 0.25)')
      .linkDirectionalParticles(2)
      .linkDirectionalParticleWidth(1.5)
      .linkDirectionalParticleSpeed(0.006)
      .onNodeClick((node: object) => {
        const artNode = node as ArtNode;
        setSelectedNode(artNode);
      });

    // Control de redimensionamiento
    const handleResize = () => {
      if (containerRef.current) {
        graph.width(containerRef.current.clientWidth);
        graph.height(containerRef.current.clientHeight);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      graph._destructor();
    };
  }, []);

  return (
    <div className="app-container">
      <div className="ui-overlay">
        <span className="badge">Scaffolding Activo</span>
        <h1 className="title">Art Rel</h1>
        <p className="subtitle">
          Estudio sociológico de las relaciones, flujos de valor y legitimación en el mundo del arte.
        </p>

        <div className="legend">
          <div className="legend-item">
            <span className="dot" style={{ backgroundColor: CATEGORY_COLORS.artist }} />
            <span>Artistas</span>
          </div>
          <div className="legend-item">
            <span className="dot" style={{ backgroundColor: CATEGORY_COLORS.gallery }} />
            <span>Galerías</span>
          </div>
          <div className="legend-item">
            <span className="dot" style={{ backgroundColor: CATEGORY_COLORS.institution }} />
            <span>Instituciones</span>
          </div>
          <div className="legend-item">
            <span className="dot" style={{ backgroundColor: CATEGORY_COLORS.curator }} />
            <span>Curadores</span>
          </div>
          <div className="legend-item">
            <span className="dot" style={{ backgroundColor: CATEGORY_COLORS.collector }} />
            <span>Coleccionistas</span>
          </div>
        </div>

        {selectedNode && (
          <div style={{ marginTop: '12px', padding: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase' }}>Elemento Seleccionado</div>
            <div style={{ fontWeight: 600, color: selectedNode.color, fontSize: '14px', marginTop: '2px' }}>{selectedNode.name}</div>
            <div style={{ fontSize: '12px', color: '#cbd5e1', marginTop: '2px' }}>{selectedNode.role}</div>
          </div>
        )}

        <p className="controls-hint">
          Interacción: Clic izquierdo para rotar | Rueda para zoom | Clic derecho para desplazar.
        </p>
      </div>

      <div ref={containerRef} className="graph-canvas" />
    </div>
  );
}
