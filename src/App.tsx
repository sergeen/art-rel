import { useEffect, useMemo, useRef, useState } from 'react';
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
import {
  DockBar,
  CategoryItem,
  READING_CATEGORIES,
  type CategoryValueCount,
  type CategoryArtistRow,
} from './components';
import './App.css';

const ACTORES = rawActores as unknown as ActorSemantic[];
const RELACIONES = rawRelaciones as unknown as RelacionSemantic[];

export default function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<GraphEngine | null>(null);

  const [filters, setFilters] = useState<FilterState>(() => createDefaultFilterState());
  const [selectedActor, setSelectedActor] = useState<ActorSemantic | null>(null);

  // Filtros sociológicos: valores seleccionados por categoría
  const [categoryValueFilters, setCategoryValueFilters] = useState<Record<string, Set<string>>>({});
  // Filtros de categoría obligatoria (debe tener datos en esa categoría)
  const [activeCategoriesOnly, setActiveCategoriesOnly] = useState<Set<string>>(new Set());
  // Categorías expandidas en el acordeón
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['practicas']));

  // Precomputar datos y frecuencias de cada una de las 10 categorías a partir de ACTORES
  const categoryDataMap = useMemo(() => {
    const map = new Map<
      string,
      { valuesWithCount: CategoryValueCount[]; artistRows: CategoryArtistRow[] }
    >();

    for (const cat of READING_CATEGORIES) {
      const frequency = new Map<string, number>();
      const artistRows: CategoryArtistRow[] = [];

      for (const actor of ACTORES) {
        const rawVals = (actor as Record<string, unknown>)[cat.id];
        if (Array.isArray(rawVals) && rawVals.length > 0) {
          const cleanVals: string[] = [];
          for (const v of rawVals) {
            if (typeof v === 'string' && v.trim().length > 0) {
              const trimmed = v.trim();
              cleanVals.push(trimmed);
              frequency.set(trimmed, (frequency.get(trimmed) || 0) + 1);
            }
          }
          if (cleanVals.length > 0) {
            artistRows.push({
              artistName: actor.nombre,
              values: cleanVals,
            });
          }
        }
      }

      const valuesWithCount: CategoryValueCount[] = Array.from(frequency.entries())
        .map(([value, count]) => ({ value, count }))
        .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value));

      map.set(cat.id, { valuesWithCount, artistRows });
    }

    return map;
  }, []);

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

  // Sincronizar filtros sociológicos con el estado de filtros del schema
  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      categoryFilters: categoryValueFilters,
      activeCategoriesOnly: activeCategoriesOnly,
    }));
  }, [categoryValueFilters, activeCategoriesOnly]);

  // Actualizar motor cuando cambie el estado de filtros
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

  // Alternar filtro global de categoría requerida
  const toggleCategoryOnly = (categoryId: string) => {
    setActiveCategoriesOnly((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  };

  // Alternar selección de un término específico dentro de una categoría
  const toggleCategoryValue = (categoryId: string, value: string) => {
    const norm = value.toLowerCase().trim();
    setCategoryValueFilters((prev) => {
      const currentSet = prev[categoryId] ? new Set(prev[categoryId]) : new Set<string>();
      if (currentSet.has(norm)) {
        currentSet.delete(norm);
      } else {
        currentSet.add(norm);
      }

      const next = { ...prev };
      if (currentSet.size === 0) {
        delete next[categoryId];
      } else {
        next[categoryId] = currentSet;
      }
      return next;
    });
  };

  // Limpiar selección de términos para una categoría
  const clearCategoryValues = (categoryId: string) => {
    setCategoryValueFilters((prev) => {
      const next = { ...prev };
      delete next[categoryId];
      return next;
    });
  };

  // Alternar expansión del acordeón de una categoría
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

  // Cantidad total de filtros activos de categorías y valores
  const totalActiveCategoryFilters =
    activeCategoriesOnly.size +
    Object.values(categoryValueFilters).reduce((acc, s) => acc + s.size, 0);

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
          totalActiveCategoryFilters > 0 && (
            <span className="active-filter-badge" title="Filtros activos aplicados">
              {totalActiveCategoryFilters} filtro{totalActiveCategoryFilters > 1 ? 's' : ''}
            </span>
          )
        }
      >
        {/* Caja de Búsqueda */}
        <div className="search-box">
          <input
            type="text"
            className="search-input"
            placeholder="Buscar por artista, práctica, concepto o ciudad..."
            value={filters.searchQuery || ''}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>

        {/* Sección de Categorías de Lectura con datos tabulares */}
        <div className="sidebar-section">
          <div className="section-header">
            <span className="section-title">Criterios de Lectura</span>
            <span className="section-count">{READING_CATEGORIES.length}</span>
          </div>

          <div className="categories-list">
            {READING_CATEGORIES.map((cat) => {
              const data = categoryDataMap.get(cat.id);
              const selectedVals = categoryValueFilters[cat.id] || new Set();

              return (
                <CategoryItem
                  key={cat.id}
                  id={cat.id}
                  name={cat.name}
                  description={cat.description}
                  isFilterActive={activeCategoriesOnly.has(cat.id)}
                  isExpanded={expandedCategories.has(cat.id)}
                  valuesWithCount={data?.valuesWithCount}
                  artistRows={data?.artistRows}
                  selectedValues={selectedVals}
                  onToggleFilter={() => toggleCategoryOnly(cat.id)}
                  onToggleExpand={() => toggleCategoryExpand(cat.id)}
                  onToggleValue={(val) => toggleCategoryValue(cat.id, val)}
                  onClearValues={() => clearCategoryValues(cat.id)}
                />
              );
            })}
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
            <div>
              <strong>Tipo:</strong> {ACTOR_TYPE_META[selectedActor.tipo]?.label || selectedActor.tipo}
            </div>
            {selectedActor.personas && selectedActor.personas.length > 0 && (
              <div>
                <strong>Roles / Perfil:</strong> {selectedActor.personas.join(', ')}
              </div>
            )}
            {selectedActor.practicas && selectedActor.practicas.length > 0 && (
              <div>
                <strong>Prácticas:</strong> {selectedActor.practicas.join(', ')}
              </div>
            )}
            {selectedActor.materiales && selectedActor.materiales.length > 0 && (
              <div>
                <strong>Materiales / Medios:</strong> {selectedActor.materiales.join(', ')}
              </div>
            )}
            {selectedActor.conceptos && selectedActor.conceptos.length > 0 && (
              <div>
                <strong>Conceptos:</strong> {selectedActor.conceptos.join(', ')}
              </div>
            )}
            {selectedActor.instituciones && selectedActor.instituciones.length > 0 && (
              <div>
                <strong>Instituciones:</strong> {selectedActor.instituciones.join(', ')}
              </div>
            )}
            {selectedActor.residencias && selectedActor.residencias.length > 0 && (
              <div>
                <strong>Residencias / Becas:</strong> {selectedActor.residencias.join(', ')}
              </div>
            )}
            {selectedActor.exhibiciones && selectedActor.exhibiciones.length > 0 && (
              <div>
                <strong>Exhibiciones / Proyectos:</strong> {selectedActor.exhibiciones.join(', ')}
              </div>
            )}
            {selectedActor.geografias && selectedActor.geografias.length > 0 && (
              <div>
                <strong>Geografías:</strong> {selectedActor.geografias.join(', ')}
              </div>
            )}
            {selectedActor.formacion && selectedActor.formacion.length > 0 && (
              <div>
                <strong>Formación:</strong> {selectedActor.formacion.join(', ')}
              </div>
            )}
            {selectedActor.circulacion && selectedActor.circulacion.length > 0 && (
              <div>
                <strong>Circulación:</strong> {selectedActor.circulacion.join(', ')}
              </div>
            )}
            {(selectedActor.ciudad || selectedActor.pais) && (
              <div style={{ marginTop: '4px', color: '#94a3b8', fontSize: '11px' }}>
                📍 {[selectedActor.ciudad, selectedActor.pais].filter(Boolean).join(', ')}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
