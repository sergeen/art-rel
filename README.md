# Art-Rel

Estudio sociológico de las relaciones en el mundo del arte mediante visualización tridimensional con [3d-force-graph](https://github.com/vasturiano/3d-force-graph).

## Arquitectura (Data - Transform - Visual)

- **Capa 1 (`src/data/`)**: Ontología sociológica en JSON puro (`actores.json`, `relaciones.json`). Sin propiedades visuales.
- **Capa 2 (`src/schema/`)**: Reglas declarativas que mapean atributos semánticos a visuales (`actorConfig.ts`, `linkConfig.ts`, `filterRules.ts`).
- **Capa 3 (`src/renderer/`)**: Motor agnóstico (`graphEngine.ts`) que ejecuta `3d-force-graph` siguiendo estrictamente el schema.

Para más detalle sobre las directrices y reglas estrictas de cada capa, consulta [`AGENTS.md`](./AGENTS.md).

## Puesta a punto

```bash
# Instalar dependencias
npm install

# Servidor de desarrollo local
npm run dev

# Compilar para producción
npm run build
```
