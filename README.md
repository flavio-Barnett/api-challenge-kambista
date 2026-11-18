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

Los valores de `.env.example` sirven para desarrollo local. En cualquier otro entorno usa un secreto propio para `JWT_ACCESS_SECRET` (mínimo 32 caracteres). Puedes generarlo con:

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

| Variable                            | Obligatoria | Valor por defecto                              | Descripción                                                               |
| ----------------------------------- | ----------- | ---------------------------------------------- | ------------------------------------------------------------------------- |
| `NODE_ENV`                          | No          | `development`                                  | `development`, `production` o `test`                                      |
| `PORT`                              | No          | `3000`                                         | Puerto HTTP                                                               |
| `MONGODB_URI`                       | Sí          | —                                              | Cadena de conexión a MongoDB                                              |
| `JWT_ACCESS_SECRET`                 | Sí          | —                                              | Secreto del access token (mínimo 32 caracteres)                           |
| `JWT_ACCESS_EXPIRES_IN`             | No          | `15m`                                          | Duración del access token (`30s`, `15m`, `12h`, `7d`)                     |
| `REFRESH_TOKEN_EXPIRES_IN`          | No          | `7d`                                           | Duración del refresh token                                                |
| `CORS_ORIGINS`                      | No          | vacío                                          | Orígenes permitidos, separados por comas                                  |
| `TRUST_PROXY_HOPS`                  | No          | `0`                                            | Proxies delante de la API; define de dónde se toma la IP real del cliente |
| `EXCHANGE_RATE_PROVIDER_URL`        | No          | `https://api.apis.net.pe/v1/tipo-cambio-sunat` | Proveedor externo del tipo de cambio                                      |
| `EXCHANGE_RATE_REFRESH_INTERVAL_MS` | No          | `30000`                                        | Cada cuántos milisegundos se actualiza el tipo de cambio                  |

## Pruebas

```bash
npm test            # pruebas unitarias
npm run test:cov    # pruebas unitarias con reporte de cobertura
```

## Autenticación

| Método | Ruta                | Acceso  | Descripción                                                 |
| ------ | ------------------- | ------- | ----------------------------------------------------------- |
| POST   | `/v1/auth/register` | Público | Registra un usuario con rol `user` e inicia su sesión       |
| POST   | `/v1/auth/login`    | Público | Devuelve `access_token`, `refresh_token` y `usuario`        |
| POST   | `/v1/auth/refresh`  | Público | Entrega un nuevo par de tokens a cambio del `refresh_token` |
| POST   | `/v1/auth/logout`   | Público | Revoca el `refresh_token`                                   |
| GET    | `/v1/auth/me`       | Token   | Devuelve el usuario autenticado                             |

Las rutas protegidas esperan el header `Authorization: Bearer <access_token>`.

### Crear un administrador

Todos los registros obtienen el rol `user`. Para dar el rol `admin` a un usuario existente:

```bash
npm run build
npm run user:promote -- ana@kambista.com
```

Con Docker: `docker compose exec api npm run user:promote -- ana@kambista.com`.

## Tipo de cambio

La API consulta el tipo de cambio oficial de SUNAT al arrancar y luego cada `EXCHANGE_RATE_REFRESH_INTERVAL_MS` (30 segundos por defecto). Solo guarda una nueva versión cuando cambia la compra o la venta; si no cambió, actualiza la fecha de la última verificación de la tasa vigente.

| Método | Ruta                         | Acceso | Descripción                                                        |
| ------ | ---------------------------- | ------ | ------------------------------------------------------------------ |
| GET    | `/v1/exchange-rates/current` | Token  | Devuelve `compra`, `venta`, `fecha`, `validFrom` y `lastCheckedAt` |

Si todavía no se obtuvo ninguna tasa, responde 503 `EXCHANGE_RATE_NOT_AVAILABLE`.

## Transacciones

| Método | Ruta                       | Acceso | Descripción                                                      |
| ------ | -------------------------- | ------ | ---------------------------------------------------------------- |
| POST   | `/v1/transactions`         | Token  | Registra un cambio entre USD y PEN con el tipo de cambio vigente |
| GET    | `/v1/transactions/history` | Token  | Historial en un rango de fechas, del más reciente al más antiguo |

- **Cálculo:** USD → PEN multiplica por la venta y PEN → USD divide entre la compra. El resultado se redondea a 2 decimales hacia arriba desde el 5 (`ROUND_HALF_UP`).
- **Fechas:** `startDate` y `endDate` (`YYYY-MM-DD`) se interpretan en hora de Lima e incluyen ambos días completos.
- **Paginación:** `page` y `limit` (por defecto 20, máximo 100); el total va en el header `X-Total-Count`.
- **`userId`:** solo lo usa un `admin` para ver el historial de otro usuario (404 `USER_NOT_FOUND` si no existe). Un usuario con rol `user` siempre ve solo el suyo.

## Arquitectura

Clean Architecture implementada con puertos y adaptadores (hexagonal), organizada por módulos de dominio (DDD). Las capas `domain` y `application` son TypeScript puro: no importan NestJS, Mongoose ni otras librerías de infraestructura, y ESLint lo verifica.

```
src/
├── main.ts
├── app.module.ts
├── shared/                      # Piezas transversales sin reglas de negocio
│   ├── domain/                  # DomainError, puerto Clock y Role
│   └── infrastructure/          # Configuración, base de datos, logs, HTTP (usuario autenticado) y health check
└── modules/
    ├── auth/
    │   ├── domain/              # Reglas del negocio
    │   │   ├── entities/        # User
    │   │   ├── value-objects/   # Email
    │   │   └── repositories/    # Contrato UserRepository
    │   ├── application/         # Qué hace el sistema
    │   │   ├── use-cases/       # Un caso de uso por operación
    │   │   ├── ports/           # Contratos que implementa la infraestructura
    │   │   └── services/        # Lógica compartida entre casos de uso
    │   └── infrastructure/      # Cómo se conecta con el exterior
    │       ├── http/            # Controller, documentación, dto/ y guards/
    │       ├── persistence/     # Esquemas y adaptadores de MongoDB
    │       ├── security/        # bcrypt, JWT y refresh tokens
    │       └── cli/             # Scripts de administración
    ├── exchange-rates/          # Tipo de cambio, con la misma estructura
    └── transactions/            # Operaciones de cambio e historial
        ├── domain/              # Transaction, ExchangeAmount, CurrencyPair, DateRange y CurrencyConverter
        ├── application/         # Casos de uso y puertos hacia otros módulos (tasa vigente, usuarios)
        └── infrastructure/      # HTTP, MongoDB e integraciones con exchange-rates y auth
```

**Comunicación entre módulos:** un módulo nunca importa el dominio de otro. `transactions` define sus propios puertos (`CurrentRateReader`, `UserLookup`) y sus adaptadores de infraestructura llaman a los casos de uso que exportan `exchange-rates` (`GetCurrentExchangeRateUseCase`) y `auth` (`CheckUserExistsUseCase`).

**Convención de nombres:** el sufijo del archivo indica su rol (`user.entity.ts`, `log-in.use-case.ts`, `password-hasher.port.ts`, `bcrypt-password-hasher.adapter.ts`). Las clases técnicas llevan ese rol en su nombre (`LogInUseCase`, `BcryptPasswordHasherAdapter`); el modelo de dominio y los puertos usan nombres del negocio (`User`, `Email`, `PasswordHasher`), y los adaptadores llevan como prefijo la tecnología que usan (`mongo`, `bcrypt`, `jwt`).

## Decisiones técnicas

- **Límites de arquitectura verificados por ESLint:** `domain` y `application` no pueden importar frameworks ni infraestructura; si alguien rompe la regla, el lint y la CI fallan.
- **Errores de dominio independientes de HTTP:** el dominio lanza errores con un `code` y un `kind`; un filtro global los traduce a un único formato de respuesta, `{ "success": false, "error": { "code", "message" } }`, sin exponer detalles internos.
- **Configuración validada al arrancar:** un esquema Zod valida el entorno y la aplicación no inicia si algo falta o es inválido.
- **Rutas protegidas por defecto:** un guard global exige JWT en todas las rutas; solo las marcadas como públicas (registro, login, refresh, logout y health) quedan abiertas.
- **Access token corto y refresh token rotado:** el JWT dura 15 minutos; el refresh token es un valor aleatorio que se guarda como hash SHA-256 y se reemplaza en cada uso. Reutilizar uno ya usado revoca todas las sesiones del usuario.
- **Contraseñas con bcrypt (costo 12):** el login responde el mismo 401 si el email no existe o la contraseña es incorrecta, y en ambos casos ejecuta una comparación para no revelar qué emails están registrados.
- **Límite de intentos de login en MongoDB:** cada intento se cuenta de forma atómica antes de verificar la contraseña; superados 5 intentos fallidos por email e IP en 15 minutos, la API responde 429. Se guarda en Mongo con índice TTL para que funcione con varias instancias de la API.
- **Tipo de cambio con precisión exacta:** compra y venta se manejan con `decimal.js` en el código y se guardan como `Decimal128` en MongoDB, para no perder céntimos por redondeos de punto flotante.
- **Polling resiliente:** SUNAT publica un valor por día; la consulta cada 30 segundos detecta el cambio apenas se publica. Si el proveedor falla, tarda más de 3 segundos o responde datos inválidos, se registra una advertencia y se sigue usando la última tasa guardada. Dos consultas nunca se ejecutan a la vez.
- **Versionado de tasas:** solo se inserta un registro cuando cambia la compra o la venta, con su `validFrom`; si no cambia, se actualiza `lastCheckedAt`. Así cada transacción puede asociarse a la tasa que estaba vigente.
- **Transacciones auditables:** los montos se guardan como `Decimal128` y cada transacción guarda la tasa aplicada y el id de su versión.
- **Fechas en hora de Lima:** el negocio opera en Perú (UTC-5, sin horario de verano), así que el rango se convierte a UTC antes de consultar; `fecha` se responde en UTC.
- **Caché en memoria:** la tasa vigente se lee de memoria y MongoDB es el respaldo, de modo que consultar la tasa no toca la base en cada operación.

### Riesgos conocidos

- **El logout no invalida el access token:** el JWT sigue siendo válido hasta que expira (máximo 15 minutos); por eso su duración es corta.
- **El registro revela si un email existe:** responde 409 y no tiene límite de intentos. Es un compromiso habitual para dar un mensaje claro al usuario.
- **Solo el login tiene límite de peticiones:** un límite global contra abuso corresponde al API gateway o al balanceador.
- **Swagger es público:** `/docs` queda abierto para facilitar la evaluación; en un entorno productivo se restringiría.
- **Tasa antigua:** si el proveedor deja de responder, se sigue operando con la última tasa conocida; `lastCheckedAt` permite detectarlo. Bloquear operaciones con una tasa demasiado antigua queda como mejora posible.
- **Sin clave de idempotencia:** reintentar un `POST /v1/transactions` crea una transacción duplicada; se resolvería con un header `Idempotency-Key`.
- **Varias réplicas:** cada instancia consulta al proveedor por su cuenta y, si cambia la tasa al mismo tiempo, podrían guardarse versiones duplicadas. Se resolvería con un lock distribuido o con un proceso dedicado a la actualización.

### Índices de MongoDB

Cada índice responde a una consulta concreta:

| Colección        | Índice                                  | Consulta que lo justifica                                |
| ---------------- | --------------------------------------- | -------------------------------------------------------- |
| `users`          | `{ email: 1 }` único                    | Login por email y garantía de email único                |
| `refresh_tokens` | `{ tokenHash: 1 }` único                | Refresh y logout buscan el token por su hash             |
| `refresh_tokens` | `{ userId: 1 }`                         | Revocar todas las sesiones de un usuario ante un reuso   |
| `refresh_tokens` | `{ expiresAt: 1 }` TTL                  | MongoDB elimina los tokens vencidos automáticamente      |
| `login_attempts` | `{ key: 1 }` único                      | Consultar y actualizar los fallos de un email e IP       |
| `login_attempts` | `{ expiresAt: 1 }` TTL                  | La ventana de 15 minutos se limpia sola                  |
| `exchange_rates` | `{ validFrom: -1 }`                     | Obtener la tasa vigente (la de `validFrom` más reciente) |
| `transactions`   | `{ userId: 1, createdAt: -1, _id: -1 }` | Historial por usuario, del más reciente al más antiguo   |
