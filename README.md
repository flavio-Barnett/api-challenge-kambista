# Kambista Exchange API

API REST para operaciones de cambio de divisas entre PEN y USD, construida con NestJS, MongoDB y TypeScript.

## Requisitos

- Node.js 24 (versión fijada en `.nvmrc`)
- npm
- Docker y Docker Compose (incluye MongoDB 7). Si prefieres un MongoDB propio, apunta `MONGODB_URI` a esa instancia.

## Cómo levantarlo

Primero crea el archivo de entorno:

```bash
cp .env.example .env
```

Los valores de `.env.example` sirven para desarrollo local. En cualquier otro entorno usa secretos propios para `JWT_ACCESS_SECRET` y `JWT_REFRESH_SECRET`: mínimo 32 caracteres y distintos entre sí. Puedes generarlos con:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64'))"
```

En Windows CMD, copia el archivo con `copy .env.example .env`; en PowerShell o Git Bash los comandos son los mismos.

### Con Docker (API + MongoDB)

```bash
docker compose up --build
```

### En local

```bash
docker compose up -d mongo
npm ci
npm run start:dev
```

Con la API en marcha:

- Documentación interactiva (Swagger): http://localhost:3000/docs
- Health check: http://localhost:3000/health

## Variables de entorno

Se validan con Zod al iniciar: si falta alguna obligatoria o tiene un formato inválido, la aplicación no arranca e indica cuál es el problema. Los valores de ejemplo están en `.env.example`.

| Variable                            | Obligatoria | Valor por defecto                              | Descripción                                              |
| ----------------------------------- | ----------- | ---------------------------------------------- | -------------------------------------------------------- |
| `NODE_ENV`                          | No          | `development`                                  | `development`, `production` o `test`                     |
| `PORT`                              | No          | `3000`                                         | Puerto HTTP                                              |
| `MONGODB_URI`                       | Sí          | —                                              | Cadena de conexión a MongoDB                             |
| `JWT_ACCESS_SECRET`                 | Sí          | —                                              | Secreto del access token (mínimo 32 caracteres)          |
| `JWT_ACCESS_EXPIRES_IN`             | No          | `15m`                                          | Duración del access token (`30s`, `15m`, `12h`, `7d`)    |
| `JWT_REFRESH_SECRET`                | Sí          | —                                              | Secreto del refresh token, distinto al del access        |
| `JWT_REFRESH_EXPIRES_IN`            | No          | `7d`                                           | Duración del refresh token                               |
| `CORS_ORIGINS`                      | No          | vacío                                          | Orígenes permitidos, separados por comas                 |
| `EXCHANGE_RATE_PROVIDER_URL`        | No          | `https://api.apis.net.pe/v1/tipo-cambio-sunat` | Proveedor externo del tipo de cambio                     |
| `EXCHANGE_RATE_REFRESH_INTERVAL_MS` | No          | `30000`                                        | Cada cuántos milisegundos se actualiza el tipo de cambio |

## Pruebas

```bash
npm test            # pruebas unitarias
npm run test:cov    # pruebas unitarias con reporte de cobertura
```

## Arquitectura

Clean Architecture implementada con puertos y adaptadores (hexagonal), organizada por módulos de dominio (DDD). Las capas `domain` y `application` son TypeScript puro: definen puertos que la capa `infrastructure` implementa y nunca importan NestJS, Mongoose ni otras librerías de infraestructura.

```
src/
├── main.ts
├── app.module.ts
├── shared/
│   ├── domain/            # Piezas comunes del dominio (DomainError)
│   └── infrastructure/    # Configuración, base de datos, logs, HTTP y health check
└── modules/
    └── <contexto>/
        ├── domain/        # Entidades, value objects, errores y puertos
        ├── application/   # Casos de uso
        └── infrastructure/# Adaptadores: controladores, persistencia, APIs externas
```

## Decisiones técnicas

- **Límites de arquitectura verificados por ESLint:** `domain` y `application` no pueden importar frameworks ni infraestructura; si alguien rompe la regla, el lint y la CI fallan.
- **Errores de dominio independientes de HTTP:** el dominio lanza errores con un `code` y un `kind`; un filtro global los traduce a un único formato de respuesta, `{ "success": false, "error": { "code", "message" } }`, sin exponer detalles internos.
- **Configuración validada al arrancar:** un esquema Zod valida el entorno y la aplicación no inicia si algo falta o es inválido.
