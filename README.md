# Gabri × Tati

Mini aplicación web **mobile-first** para una cita entre dos personas.  
Experiencia privada, client-side, pensada para iPhone / Safari.

> Identidad pública: **Gabri × Tati** — una aventura para dos.  
> Sin cuentas, sin backend, sin subida de fotos a servidores.

## Qué incluye

- Pantalla inicial misteriosa
- Configuración de nombres (Gabri & Tati por defecto)
- Ruleta para decidir dónde comer (Las Arenas)
- Asignación de colores con contraste garantizado
- **Exactamente 10 pruebas** por partida
- Eventos y giros sorpresa (incluido posible cambio de color)
- Fotos locales (cámara / galería)
- **Dos collages independientes** (uno por persona) con Canvas API
- Persistencia: `localStorage` + IndexedDB

## Cómo ejecutar en local

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en el móvil (misma red) o en el simulador.

Scripts útiles:

```bash
npm run build    # producción
npm start        # servir build
npm run verify   # comprueba mazo de 10 pruebas, contraste, etc.
npm run lint
```

## Deploy en Vercel

1. Sube este repositorio a GitHub (`gabri-tati-date`).
2. En [vercel.com](https://vercel.com) → **Add New Project** → importa el repo.
3. Framework: **Next.js** (autodetectado).
4. Build: `npm run build` · Output: `.next`
5. Dominio sugerido: `gabri-tati.vercel.app` (o similar, sin revelar la mecánica del juego).

No hace falta configurar variables de entorno.

## Arquitectura

```
src/
  app/                 # Next.js App Router (layout + página)
  components/
    screens/           # Pantallas del flujo
    game/              # Ruleta, captura de fotos
    ui/                # Shell, botones, progreso
  data/                # Contenido editable
    colors.ts
    missions.ts
    specialChallenges.ts
    restaurants.ts
    events.ts
    collageTemplates.ts
    config.ts
  lib/
    game/              # Selección de misiones, contraste, motor
    storage/           # localStorage + IndexedDB
    collage/           # Generación Canvas
    utils/
  hooks/useGame.ts     # Estado de partida
  types/
```

Todo el juego es **client-side**. Las fotos nunca salen del dispositivo.

## Cómo se garantizan exactamente 10 pruebas

1. `selectNineRandomMissions()` elige **9** misiones del banco (sin duplicados, con variedad).
2. `buildMissionDeck()` añade siempre al final la misión fija `final-joint-photo`.
3. El estado guarda `missionIds` con longitud 10.
4. La UI muestra “Prueba X de 10” y no revela las futuras.

Al iniciar una nueva aventura se regenera el mazo completo.

## Cambio de color

- Configurable en `src/data/config.ts` (`colorSwapEnabled`, `colorSwapProbability`).
- Si se activa, ocurre **una sola vez** entre las pruebas 4 y 7.
- Reasigna colores con contraste, conserva progreso/fotos y **no** añade pruebas.

## Fotos y collages

- Metadatos en `localStorage` (quién hizo la foto, si es conjunta, selección para cada álbum).
- Blobs en **IndexedDB** (`gabri-tati-photos`).
- Collage de Gabri: fotos de Gabri + foto conjunta.
- Collage de Tati: fotos de Tati + foto conjunta.
- Plantillas distintas por persona; generación local con Canvas; compartir vía Web Share API o descarga.

## Cómo ampliar contenido

### Misiones

Edita `src/data/missions.ts` y añade objetos al array `MISSIONS`.  
No hace falta tocar la UI: el selector aleatorio las incluirá.

### Restaurantes

Edita `src/data/restaurants.ts`.

### Colores

Edita `src/data/colors.ts` (incluye `hue` para el contraste).

### Nombres por defecto

`src/data/config.ts` → `DEFAULT_PLAYER_NAMES`.

### Eventos / retos especiales

`src/data/events.ts` y `src/data/specialChallenges.ts`.

## Continuar / nueva partida

- Si hay partida guardada, la pantalla inicial muestra **Continuar** y **Nueva aventura**.
- Nueva aventura borra progreso, fotos IndexedDB y regenera misiones/colores.

## Privacidad

- Sin autenticación
- Sin APIs externas de almacenamiento
- Sin geolocalización obligatoria
- Sin bloqueo por hora ni contraseña
- Metadatos públicos: título `Gabri × Tati`, descripción `Una aventura para dos.`

## Licencia

Uso privado para Gabri & Tati.
