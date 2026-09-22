# Guía de Arquitectura para Asistentes de IA (AGENTS.md)

Este repositorio sigue rigurosamente el patrón formal **Data-Transform-Visual** (modelo de separación de *concerns* para visualización científica formulado por Heer & Agrawala, 2006).

Cualquier IA o agente que trabaje en esta base de código **DEBE** respetar estrictamente la separación de responsabilidades entre las 3 capas descritas a continuación.

---

## 🏛️ Las 3 Capas Arquitectónicas

```
┌─────────────────────────────────┐
│     Capa 1: data/ (El Mundo)    │  JSONs puros: ontología sociológica
└──────────────┬──────────────────┘
               │  consume datos semánticos
┌──────────────▼──────────────────┐
│   Capa 2: schema/ (Las Reglas)  │  Mapeo declarativo semántica → visual
└──────────────┬──────────────────┘
               │  aplica reglas y accessors
┌──────────────▼──────────────────┐
│  Capa 3: renderer/ (El Motor)   │  Motor agnóstico (3d-force-graph)
└─────────────────────────────────┘
```

---

### Capa 1 — `src/data/` (El Mundo / Ontología Sociológica)
- **Archivos:** `actores.json`, `relaciones.json`.
- **Propósito:** Definir los actores del campo artístico y sus relaciones vinculares con atributos exclusivamente conceptuales y sociológicos.
- **Reglas estrictas:**
  - ❌ **PROHIBIDO** incluir colores, tamaños de nodo, posiciones espaciales, opacidades o cualquier atributo visual en los JSONs de datos.
  - ❌ **PROHIBIDO** incluir lógica de filtrado o estados de visibilidad.
  - ✅ Solo ontología pura: `id`, `nombre`, `tipo`, `disciplina`, `trayectoria`, `capital_simbolico`, `formalidad`, `anio_inicio`, etc.

---

### Capa 2 — `src/schema/` (Las Reglas / Transform)
- **Archivos:** `actorConfig.ts`, `linkConfig.ts`, `filterRules.ts`, `types.ts`.
- **Propósito:** Contiene las reglas declarativas que traducen atributos sociológicos en representaciones visuales y definen el filtrado activo.
- **Reglas estrictas:**
  - 💡 **Es la capa que más cambia** durante el proceso exploratorio de formulación de hipótesis.
  - `actorConfig.ts`: Define funciones como `getActorColor(actor)`, `getActorVal(actor)`, `getActorLabel(actor)`.
  - `linkConfig.ts`: Define `getLinkColor(relacion)`, `getLinkWidth(relacion)`, `getLinkParticles(relacion)`, etc.
  - `filterRules.ts`: Predicados de visibilidad (`isActorVisible`, `isLinkVisible`).
  - Cambiar una teoría sociológica o una paleta estética solo debe implicar cambios en esta capa, **sin tocar nunca `data/` ni `renderer/`**.

---

### Capa 3 — `src/renderer/` (El Motor / Visual)
- **Archivos:** `graphEngine.ts`, `index.ts`.
- **Propósito:** Wrapper sobre `3d-force-graph` que toma los datos de la Capa 1 y ejecuta las reglas de la Capa 2.
- **Reglas estrictas:**
  - ❌ **EL MOTOR NO TOMA DECISIONES SEMÁNTICAS NI SOCIOLÓGICAS.**
  - ❌ **PROHIBIDO** escribir condiciones del tipo `if (node.tipo === 'galeria') color = 'blue'` dentro del motor.
  - ✅ El motor solo invoca los accessors del schema: `.nodeColor(node => getActorColor(node))`, `.nodeVal(node => getActorVal(node))`, etc.
  - Su única responsabilidad es el renderizado WebGL, la gestión de la cámara Three.js, redimensionamiento y ciclo de vida de la escena.

---

## 📋 Guía Rápida de Decisión para la IA

Cuando el usuario te pida realizar una tarea, ubica tus cambios según esta guía:

| Si la solicitud del usuario es... | La capa a modificar es: | Archivos afectados |
|---|---|---|
| Agregar nuevos actores, artistas, museos o relaciones | **Capa 1 (Data)** | `src/data/actores.json`, `src/data/relaciones.json` |
| Cambiar colores, tamaños de nodos, grosor de líneas o partículas | **Capa 2 (Schema)** | `src/schema/actorConfig.ts`, `src/schema/linkConfig.ts` |
| Crear nuevos criterios de filtrado o vistas por subconjuntos | **Capa 2 (Schema)** | `src/schema/filterRules.ts` |
| Modificar la cámara, controles 3D, fondo o eventos WebGL | **Capa 3 (Renderer)** | `src/renderer/graphEngine.ts` |
| Ajustar botones, controles de usuario o panel flotante | **UI / App** | `src/App.tsx`, `src/App.css` |

> [!IMPORTANT]
> **Nunca mezcles las capas.** Mantener la pureza de esta separación de concerns es el requisito fundamental de este proyecto para permitir la exploración sociológica sin degradar la arquitectura de software.
