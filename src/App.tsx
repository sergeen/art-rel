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
import { DockBar, CategoryItem, READING_CATEGORIES } from './components';
import './App.css';

const ACTORES = rawActores as unknown as ActorSemantic[];
const RELACIONES = rawRelaciones as unknown as RelacionSemantic[];

export default function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<GraphEngine | null>(null);

  const [filters, setFilters] = useState<FilterState>(() => createDefaultFilterState());
  const [selectedActor, setSelectedActor] = useState<ActorSemantic | null>(null);

  // Estados para las 10 categorías de criterios de lectura
  const [activeCategoryFilters, setActiveCategoryFilters] = useState<Set<string>>(new Set());
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // Alternar activación de filtro de criterio de categoría
  const toggleCategoryFilter = (categoryId: string) => {
    setActiveCategoryFilters((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  };

  // Alternar expansión de descripción de categoría
  const toggleCategoryExpand = (categoryId: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
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
      {/* Capa 3: Lienzo del Grafo 3D */}
      <div ref={containerRef} className="graph-canvas" />

      {/* Barra Lateral Reutilizable (en posición izquierda) */}
      <DockBar
        position="left"
        title="Art Rel"
        subtitle="Criterios de lectura de la red"
        ariaLabel="Criterios de lectura de la red"
        headerActions={
          activeCategoryFilters.size > 0 && (
            <span className="active-filter-badge" title="Criterios activos">
              {activeCategoryFilters.size} activos
            </span>
          )
        }
      >
        {/* Caja de Búsqueda */}
        <div className="search-box">
          <input
            type="text"
            className="search-input"
            placeholder="Buscar por nombre, disciplina o ciudad..."
            value={filters.searchQuery || ''}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>

        {/* Sección de Categorías de Lectura */}
        <div className="sidebar-section">
          <div className="section-header">
            <span className="section-title">Criterios de Lectura</span>
            <span className="section-count">{READING_CATEGORIES.length}</span>
          </div>

          <div className="categories-list">
            {READING_CATEGORIES.map((cat) => (
              <CategoryItem
                key={cat.id}
                id={cat.id}
                name={cat.name}
                description={cat.description}
                isFilterActive={activeCategoryFilters.has(cat.id)}
                isExpanded={expandedCategories.has(cat.id)}
                onToggleFilter={() => toggleCategoryFilter(cat.id)}
                onToggleExpand={() => toggleCategoryExpand(cat.id)}
              />
            ))}
          </div>
        </div>

        {/* Filtro Ontológico de Tipos de Actores */}
        <div className="sidebar-section">
          <div className="section-header">
            <span className="section-title">Tipos de Actor</span>
          </div>
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

        {/* Acciones y Controles de Navegación */}
        <div className="sidebar-footer">
          <p className="controls-hint">
            Girar: Arrastrar | Zoom: Scroll
          </p>
          <button type="button" className="btn-secondary" onClick={resetCamera}>
            Centrar Vista
          </button>
        </div>
      </DockBar>

      {/* Tarjeta de Información de Actor Seleccionado (Flotante) */}
      {selectedActor && (
        <div className="info-card-floating">
          <div className="info-card-header-bar">
            <span className="info-card-badge">Actor Seleccionado</span>
            <button
              type="button"
              className="info-card-close"
              onClick={() => setSelectedActor(null)}
              aria-label="Cerrar ficha"
            >
              ✕
            </button>
          </div>
          <div
            className="info-card-title"
            style={{ color: ACTOR_TYPE_META[selectedActor.tipo]?.color || '#f8fafc' }}
          >
            {selectedActor.nombre}
          </div>
          <div className="info-card-body">
            <div><strong>Tipo:</strong> {ACTOR_TYPE_META[selectedActor.tipo]?.label}</div>
            {selectedActor.disciplina && <div><strong>Disciplina:</strong> {selectedActor.disciplina}</div>}
            {selectedActor.rol_campo && <div><strong>Rol:</strong> {selectedActor.rol_campo}</div>}
            {selectedActor.campo_especialidad && <div><strong>Especialidad:</strong> {selectedActor.campo_especialidad}</div>}
            {selectedActor.foco_adquisicion && <div><strong>Foco:</strong> {selectedActor.foco_adquisicion}</div>}
            {(selectedActor.ciudad || selectedActor.pais) && (
              <div>
                <strong>Ubicación:</strong> {[selectedActor.ciudad, selectedActor.pais].filter(Boolean).join(', ')}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
