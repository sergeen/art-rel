import { useEffect, useMemo, useRef, useState } from 'react';
import rawActores from './data/actores.json';
import {
  type ActorSemantic,
  type FilterState,
  type PhysicsConfig,
  ACTOR_TYPE_META,
  DEFAULT_PHYSICS_CONFIG,
  createDefaultFilterState,
} from './schema';
import { GraphEngine } from './renderer';
import {
  DockBar,
  CategoryItem,
  Tabs,
  READING_CATEGORIES,
} from './components';
import './App.css';

const ACTORES = rawActores as unknown as ActorSemantic[];
const ARTISTAS = ACTORES.filter((a) => a.tipo === 'artista');

export default function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<GraphEngine | null>(null);

  const [filters, setFilters] = useState<FilterState>(() => createDefaultFilterState());
  const [selectedActor, setSelectedActor] = useState<ActorSemantic | null>(null);

  // Calibración de fuerzas físicas del grafo
  const [physics, setPhysics] = useState<PhysicsConfig>(DEFAULT_PHYSICS_CONFIG);

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
      physics,
      callbacks: {
        onNodeClick: (actor) => setSelectedActor(actor),
        onBackgroundClick: () => setSelectedActor(null),
      },
    });

    engine.setData(ACTORES);
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

  const handlePhysicsChange = <K extends keyof PhysicsConfig>(key: K, value: number) => {
    setPhysics((prev) => {
      const next = { ...prev, [key]: value };
      engineRef.current?.setPhysics({ [key]: value });
      return next;
    });
  };

  const handleResetPhysics = () => {
    setPhysics(DEFAULT_PHYSICS_CONFIG);
    engineRef.current?.setPhysics(DEFAULT_PHYSICS_CONFIG);
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

      {/* Panel Superior Desplegable: Barra de Herramientas y Configuración con Tabs */}
      <DockBar
        position="top"
        defaultCollapsed={true}
        ariaLabel="Panel de herramientas y configuración"
        className="physics-top-dock"
      >
        <Tabs
          tabs={[
            {
              id: 'fisica',
              label: 'Física de la red',
              icon: (
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="3" />
                  <ellipse cx="12" cy="12" rx="9" ry="4" transform="rotate(30 12 12)" />
                  <ellipse cx="12" cy="12" rx="9" ry="4" transform="rotate(-30 12 12)" />
                </svg>
              ),
              description: 'Calibración de distancias mínimas, dispersión y gravedad central',
              actions: (
                <button
                  type="button"
                  className="tab-action-btn"
                  onClick={handleResetPhysics}
                  title="Restablecer valores predeterminados"
                >
                  Restablecer
                </button>
              ),
              children: (
                <div className="physics-controls-grid">
                  {/* Slider 1: Distancia Mínima Anticolisión */}
                  <div className="physics-control-item">
                    <div className="physics-control-header">
                      <span className="physics-control-label">Distancia mínima (Colisión)</span>
                      <span className="physics-control-value">{physics.minDistance} px</span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="60"
                      step="1"
                      value={physics.minDistance}
                      onChange={(e) => handlePhysicsChange('minDistance', Number(e.target.value))}
                      className="physics-slider"
                    />
                    <span className="physics-control-hint">
                      Espacio libre garantizado entre nodos para evitar solapamientos.
                    </span>
                  </div>

                  {/* Slider 2: Cohesión Central (Gravedad) */}
                  <div className="physics-control-item">
                    <div className="physics-control-header">
                      <span className="physics-control-label">Cohesión central (Gravedad)</span>
                      <span className="physics-control-value">{physics.gravity.toFixed(3)}</span>
                    </div>
                    <input
                      type="range"
                      min="0.005"
                      max="0.100"
                      step="0.005"
                      value={physics.gravity}
                      onChange={(e) => handlePhysicsChange('gravity', Number(e.target.value))}
                      className="physics-slider"
                    />
                    <span className="physics-control-hint">
                      Mantiene a los nodos agrupados sin alejarse indefinidamente.
                    </span>
                  </div>

                  {/* Slider 3: Repulsión (Dispersión) */}
                  <div className="physics-control-item">
                    <div className="physics-control-header">
                      <span className="physics-control-label">Repulsión mutua</span>
                      <span className="physics-control-value">{physics.repulsion}</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="250"
                      step="5"
                      value={physics.repulsion}
                      onChange={(e) => handlePhysicsChange('repulsion', Number(e.target.value))}
                      className="physics-slider"
                    />
                    <span className="physics-control-hint">
                      Fuerza de separación entre nodos para abrir la constelación.
                    </span>
                  </div>

                  {/* Slider 4: Distancia de Vínculos con Criterios */}
                  <div className="physics-control-item">
                    <div className="physics-control-header">
                      <span className="physics-control-label">Distancia de criterios</span>
                      <span className="physics-control-value">{physics.linkDistance} px</span>
                    </div>
                    <input
                      type="range"
                      min="20"
                      max="140"
                      step="5"
                      value={physics.linkDistance}
                      onChange={(e) => handlePhysicsChange('linkDistance', Number(e.target.value))}
                      className="physics-slider"
                    />
                    <span className="physics-control-hint">
                      Distancia de atracción hacia los nodos de criterio verdes.
                    </span>
                  </div>
                </div>
              ),
            },
          ]}
        />
      </DockBar>

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

      {/* Tarjeta de Información de Actor o Criterio Seleccionado (Flotante) */}
      {selectedActor && (
        <div className="info-card-floating">
          <div className="info-card-header-bar">
            <span
              className="info-card-badge"
              style={
                selectedActor.tipo === 'criterio'
                  ? {
                      background: 'rgba(34, 197, 94, 0.15)',
                      color: '#4ade80',
                      borderColor: 'rgba(34, 197, 94, 0.3)',
                    }
                  : undefined
              }
            >
              {selectedActor.tipo === 'criterio'
                ? 'Criterio de Lectura'
                : 'Artista Seleccionado'}
            </span>
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
            style={{
              color:
                selectedActor.tipo === 'criterio'
                  ? '#4ade80'
                  : ACTOR_TYPE_META[selectedActor.tipo]?.color || '#f8fafc',
            }}
          >
            {selectedActor.nombre}
          </div>
          <div className="info-card-body">
            {selectedActor.tipo === 'criterio' ? (
              <>
                <div>
                  <strong>Criterio:</strong> {selectedActor.categoriaNombre || selectedActor.categoriaId}
                </div>
                {selectedActor.conectadosCount !== undefined && (
                  <div style={{ marginTop: '4px' }}>
                    <strong>Artistas vinculados:</strong> {selectedActor.conectadosCount}
                  </div>
                )}
              </>
            ) : (
              <>
                {selectedActor.biografia && (
                  <div className="info-card-bio">
                    {selectedActor.biografia}
                  </div>
                )}
                {selectedActor.anio_nacimiento && (
                  <div>
                    <strong>Nacimiento:</strong> {selectedActor.anio_nacimiento}
                  </div>
                )}
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
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
