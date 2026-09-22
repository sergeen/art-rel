import { useEffect, useRef, useState } from 'react';
import rawActores from './data/actores.json';
import rawRelaciones from './data/relaciones.json';
import {
  type ActorSemantic,
  type ActorTipo,
  type FilterState,
  type RelacionSemantic,
  ACTOR_TYPE_META,
  createDefaultFilterState,
} from './schema';
import { GraphEngine } from './renderer';
import './App.css';

const ACTORES = rawActores as unknown as ActorSemantic[];
const RELACIONES = rawRelaciones as unknown as RelacionSemantic[];

export default function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<GraphEngine | null>(null);

  const [filters, setFilters] = useState<FilterState>(() => createDefaultFilterState());
  const [selectedActor, setSelectedActor] = useState<ActorSemantic | null>(null);

  // Inicializar motor en la Capa 3 montando datos de Capa 1 y reglas de Capa 2
  useEffect(() => {
    if (!containerRef.current) return;

    const engine = new GraphEngine(containerRef.current, {
      backgroundColor: '#040508',
      callbacks: {
        onNodeClick: (actor) => setSelectedActor(actor),
        onBackgroundClick: () => setSelectedActor(null),
      },
    });

    engine.setData(ACTORES, RELACIONES);
    engine.setFilter(filters);
    engineRef.current = engine;

    const handleResize = () => engine.resize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      engine.destroy();
      engineRef.current = null;
    };
  }, []);

  // Actualizar filtros en el motor cuando cambie el estado de filtros
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.setFilter(filters);
    }
  }, [filters]);

  // Alternar filtro de tipo de actor
  const toggleActorType = (tipo: ActorTipo) => {
    setFilters((prev) => {
      const nextTypes = new Set(prev.activeActorTypes);
      if (nextTypes.has(tipo)) {
        if (nextTypes.size > 1) {
          nextTypes.delete(tipo);
        }
      } else {
        nextTypes.add(tipo);
      }
      return { ...prev, activeActorTypes: nextTypes };
    });
  };

  const handleSearchChange = (query: string) => {
    setFilters((prev) => ({ ...prev, searchQuery: query }));
  };

  const resetCamera = () => {
    if (engineRef.current) {
      engineRef.current.zoomToFit();
    }
  };

  return (
    <div className="app-container">
      <div className="ui-overlay">
        <span className="badge">Data-Transform-Visual</span>
        <h1 className="title">Art Rel</h1>
        <p className="subtitle">
          Estudio sociológico de las relaciones en el mundo del arte.
          Arquitectura desacoplada en 3 capas (Heer & Agrawala).
        </p>

        <div className="search-box">
          <input
            type="text"
            className="search-input"
            placeholder="Buscar por nombre, disciplina o ciudad..."
            value={filters.searchQuery || ''}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>

        <div className="filter-section">
          <div className="filter-title">Actores (Capa 2: Schema)</div>
          <div className="filter-tags">
            {(Object.keys(ACTOR_TYPE_META) as ActorTipo[]).map((tipo) => {
              const meta = ACTOR_TYPE_META[tipo];
              const isActive = filters.activeActorTypes.has(tipo);
              return (
                <button
                  key={tipo}
                  type="button"
                  className={`filter-tag ${isActive ? 'active' : 'inactive'}`}
                  onClick={() => toggleActorType(tipo)}
                  title={meta.description}
                >
                  <span className="filter-dot" style={{ backgroundColor: meta.color }} />
                  <span>{meta.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {selectedActor && (
          <div className="info-card">
            <div className="info-card-header">Actor Seleccionado</div>
            <div className="info-card-title" style={{ color: ACTOR_TYPE_META[selectedActor.tipo]?.color }}>
              {selectedActor.nombre}
            </div>
            <div className="info-card-body">
              <div><strong>Tipo:</strong> {ACTOR_TYPE_META[selectedActor.tipo]?.label}</div>
              {selectedActor.disciplina && <div><strong>Disciplina:</strong> {selectedActor.disciplina}</div>}
              {selectedActor.rol_campo && <div><strong>Rol:</strong> {selectedActor.rol_campo}</div>}
              {selectedActor.campo_especialidad && <div><strong>Especialidad:</strong> {selectedActor.campo_especialidad}</div>}
              {selectedActor.foco_adquisicion && <div><strong>Foco:</strong> {selectedActor.foco_adquisicion}</div>}
              {(selectedActor.ciudad || selectedActor.pais) && (
                <div><strong>Ubicación:</strong> {[selectedActor.ciudad, selectedActor.pais].filter(Boolean).join(', ')}</div>
              )}
            </div>
          </div>
        )}

        <div className="actions-bar">
          <p className="controls-hint">
            Girar: Clic + arrastrar | Zoom: Scroll
          </p>
          <button type="button" className="btn-secondary" onClick={resetCamera}>
            Centrar Vista
          </button>
        </div>
      </div>

      <div ref={containerRef} className="graph-canvas" />
    </div>
  );
}
