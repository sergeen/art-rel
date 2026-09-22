import { useEffect, useMemo, useRef, useState } from 'react';
import rawActores from './data/actores.json';
import rawRelaciones from './data/relaciones.json';
import {
  type ActorSemantic,
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
} from './components';
import './App.css';

const ACTORES = rawActores as unknown as ActorSemantic[];
const RELACIONES = rawRelaciones as unknown as RelacionSemantic[];
const ARTISTAS = ACTORES.filter((a) => a.tipo === 'artista');

export default function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<GraphEngine | null>(null);

  const [filters, setFilters] = useState<FilterState>(() => createDefaultFilterState());
  const [selectedActor, setSelectedActor] = useState<ActorSemantic | null>(null);

  // Filtros sociológicos: valores seleccionados por categoría (pills activas)
  // Por defecto todo está deseleccionado
  const [categoryValueFilters, setCategoryValueFilters] = useState<Record<string, Set<string>>>({});

  // Categorías expandidas en el acordeón (por defecto todas colapsadas)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  // Precomputar elementos únicos de cada categoría a partir de ARTISTAS
  const categoryDataMap = useMemo(() => {
    const map = new Map<string, string[]>();

    for (const cat of READING_CATEGORIES) {
      const frequency = new Map<string, number>();

      for (const actor of ARTISTAS) {
        const rawVals = (actor as Record<string, unknown>)[cat.id];
        if (Array.isArray(rawVals) && rawVals.length > 0) {
          for (const v of rawVals) {
            if (typeof v === 'string' && v.trim().length > 0) {
              const trimmed = v.trim();
              frequency.set(trimmed, (frequency.get(trimmed) || 0) + 1);
            }
          }
        }
      }

      // Ordenar términos por frecuencia (mayor uso primero) y luego alfabéticamente
      const sortedValues = Array.from(frequency.entries())
        .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
        .map(([value]) => value);

      map.set(cat.id, sortedValues);
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
    }));
  }, [categoryValueFilters]);

  // Actualizar motor cuando cambie el estado de filtros
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.setFilter(filters);
    }
  }, [filters]);

  // Alternar selección de una pill específica dentro de una categoría
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

        {/* Sección de Categorías de Lectura con Pills */}
        <div className="sidebar-section">
          <div className="section-header">
            <span className="section-title">Criterios de Lectura</span>
          </div>

          <div className="categories-list">
            {READING_CATEGORIES.map((cat) => {
              const values = categoryDataMap.get(cat.id) || [];
              const selectedVals = categoryValueFilters[cat.id] || new Set();

              return (
                <CategoryItem
                  key={cat.id}
                  id={cat.id}
                  name={cat.name}
                  isExpanded={expandedCategories.has(cat.id)}
                  values={values}
                  selectedValues={selectedVals}
                  onToggleExpand={() => toggleCategoryExpand(cat.id)}
                  onToggleValue={(val) => toggleCategoryValue(cat.id, val)}
                />
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
            <span className="info-card-badge">Artista Seleccionado</span>
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
            {selectedActor.disciplina && (
              <div>
                <strong>Disciplina:</strong> {selectedActor.disciplina}
              </div>
            )}
            {selectedActor.materiales && selectedActor.materiales.length > 0 && (
              <div>
                <strong>Trabaja con:</strong> {selectedActor.materiales.join(', ')}
              </div>
            )}
            {selectedActor.practicas && selectedActor.practicas.length > 0 && (
              <div>
                <strong>Produce:</strong> {selectedActor.practicas.join(', ')}
              </div>
            )}
            {selectedActor.conceptos && selectedActor.conceptos.length > 0 && (
              <div>
                <strong>Indaga en:</strong> {selectedActor.conceptos.join(', ')}
              </div>
            )}
            {selectedActor.galerias && selectedActor.galerias.length > 0 && (
              <div>
                <strong>Expone en galerías:</strong> {selectedActor.galerias.join(', ')}
              </div>
            )}
            {selectedActor.instituciones && selectedActor.instituciones.length > 0 && (
              <div>
                <strong>Vinculado a instituciones:</strong> {selectedActor.instituciones.join(', ')}
              </div>
            )}
            {selectedActor.curadores && selectedActor.curadores.length > 0 && (
              <div>
                <strong>Articulado con curadores y críticos:</strong> {selectedActor.curadores.join(', ')}
              </div>
            )}
            {selectedActor.coleccionistas && selectedActor.coleccionistas.length > 0 && (
              <div>
                <strong>Apoyado por fondos y colecciones:</strong> {selectedActor.coleccionistas.join(', ')}
              </div>
            )}
            {selectedActor.residencias && selectedActor.residencias.length > 0 && (
              <div>
                <strong>Participó en residencias:</strong> {selectedActor.residencias.join(', ')}
              </div>
            )}
            {selectedActor.exhibiciones && selectedActor.exhibiciones.length > 0 && (
              <div>
                <strong>Exhibió en:</strong> {selectedActor.exhibiciones.join(', ')}
              </div>
            )}
            {selectedActor.geografias && selectedActor.geografias.length > 0 && (
              <div>
                <strong>Radicado en:</strong> {selectedActor.geografias.join(', ')}
              </div>
            )}
            {selectedActor.formacion && selectedActor.formacion.length > 0 && (
              <div>
                <strong>Se formó en:</strong> {selectedActor.formacion.join(', ')}
              </div>
            )}
            {selectedActor.circulacion && selectedActor.circulacion.length > 0 && (
              <div>
                <strong>Circula en:</strong> {selectedActor.circulacion.join(', ')}
              </div>
            )}
            {selectedActor.personas && selectedActor.personas.length > 0 && (
              <div>
                <strong>Se desempeña como:</strong> {selectedActor.personas.join(', ')}
              </div>
            )}
            {(selectedActor.ciudad || selectedActor.pais) && (
              <div style={{ marginTop: '6px', color: '#94a3b8', fontSize: '11px' }}>
                📍 {[selectedActor.ciudad, selectedActor.pais].filter(Boolean).join(', ')}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
