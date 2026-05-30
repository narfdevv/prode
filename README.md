# FIFA 2026 Corporate Prode

## Requisitos
- Node.js 18+
- npm (o pnpm / yarn)

## Instalacion

```bash
npm install
```

## Levantar en desarrollo

```bash
npm run dev
```

Abri http://localhost:3000 en el navegador.

## Build para produccion

```bash
npm run build
npm run preview
```

## Notas
- Los datos de partidos estan hardcodeados en `src/data/matches.ts`.
- Los pronósticos se guardan en localStorage del navegador.
- Para conectar una API real, reemplaza los datos en `src/data/` por llamadas fetch/React Query.
