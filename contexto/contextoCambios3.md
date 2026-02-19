# contextoCambios3.md — Registro completo de cambios (Sesión Feb 2026)

> **Fecha:** 16 de febrero de 2026  
> **Objetivo principal:** Resolver el error 500 en `POST /api/briefings/submit` en Vercel y hacer funcionar toda la cadena: DB → documentos → emails.

---

## Índice

1. [Diagnóstico del error 500](#1-diagnóstico-del-error-500)
2. [Fix: Prisma + Turso (Base de datos)](#2-fix-prisma--turso-base-de-datos)
3. [Fix: Schema Prisma 7 compatibility](#3-fix-schema-prisma-7-compatibility)
4. [Creación de la tabla en Turso](#4-creación-de-la-tabla-en-turso)
5. [Variables de entorno en Vercel](#5-variables-de-entorno-en-vercel)
6. [Fix: Emails no se enviaban](#6-fix-emails-no-se-enviaban)
7. [Estado final de archivos modificados](#7-estado-final-de-archivos-modificados)
8. [Commits realizados](#8-commits-realizados)
9. [Arquitectura actual](#9-arquitectura-actual)
10. [Problemas conocidos y próximos pasos](#10-problemas-conocidos-y-próximos-pasos)

---

## 1. Diagnóstico del error 500

### Síntoma
Al hacer submit del formulario en `https://formulario-paginas.vercel.app`, se obtenía:
```
POST /api/briefings/submit 500 (Internal Server Error)
Submit error: Error: Error al enviar el formulario
```

### Causas raíz identificadas (4)

| # | Causa | Detalle |
|---|-------|---------|
| 1 | **SQLite `file:./dev.db` en Vercel** | Vercel tiene filesystem **efímero y read-only**. No se puede escribir un archivo `.db` local. |
| 2 | **`PrismaLibSql` adapter usado con URL `file:`** | `prisma.ts` importaba `PrismaLibSql` incondicionalmente y lo usaba incluso con URLs locales `file:./dev.db`, lo que causaba crash. |
| 3 | **Prisma 7: `url` en schema.prisma deprecado** | Prisma 7.x ya no soporta `url = env("DATABASE_URL")` en `schema.prisma`. Se debe usar `prisma.config.ts`. |
| 4 | **Sin variables de entorno en Vercel** | El dashboard de Vercel no tenía ninguna variable de entorno configurada — ni DB, ni email, ni admin password. |

---

## 2. Fix: Prisma + Turso (Base de datos)

### Archivo: `src/lib/prisma.ts`

**Antes (roto):**
```typescript
import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

function createPrismaClient(): PrismaClient {
    const url = process.env.DATABASE_URL || "file:./prisma/dev.db";
    const authToken = process.env.DATABASE_AUTH_TOKEN || undefined;
    const adapter = new PrismaLibSql({ url, authToken });  // ← SIEMPRE usaba adapter
    return new PrismaClient({ adapter });
}
```

**Después (corregido):**
```typescript
import { PrismaClient } from "@prisma/client";

function createPrismaClient(): PrismaClient {
    const url = process.env.DATABASE_URL;

    // Remote libSQL/Turso → usa adapter
    if (url && (url.startsWith("libsql://") || url.startsWith("https://"))) {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { PrismaLibSql } = require("@prisma/adapter-libsql");
        const authToken = process.env.DATABASE_AUTH_TOKEN || undefined;
        const adapter = new PrismaLibSql({ url, authToken });
        return new PrismaClient({ adapter });
    }

    // Local file-based SQLite → standard client (sin adapter)
    return new PrismaClient();
}
```

**Clave del fix:**
- Detección automática por prefijo de URL: `libsql://` o `https://` → Turso adapter; `file:` → PrismaClient estándar
- `require()` dinámico para evitar problemas de bundling cuando no se necesita el adapter
- Soporte para `DATABASE_AUTH_TOKEN` (autenticación Turso)

---

## 3. Fix: Schema Prisma 7 compatibility

### Archivo: `prisma/schema.prisma`

Se intentó agregar `url = env("DATABASE_URL")` al bloque `datasource`, pero **Prisma 7 lo rechaza** con error P1012. La URL de conexión se maneja en `prisma.config.ts`.

**Estado final (sin url):**
```prisma
datasource db {
  provider = "sqlite"
}
```

**La URL se configura en `prisma.config.ts`:**
```typescript
export default defineConfig({
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});
```

---

## 4. Creación de la tabla en Turso

Como `prisma db push` no entiende URLs `libsql://` nativamente (el motor SQLite de Prisma CLI no soporta ese protocolo), se creó la tabla directamente usando el cliente `@libsql/client`:

```javascript
const { createClient } = require('@libsql/client');
const client = createClient({
  url: 'libsql://formulario-paginas-lucas23-ieci.aws-us-east-1.turso.io',
  authToken: '...'
});

await client.execute(`
  CREATE TABLE IF NOT EXISTS Briefing (
    id TEXT PRIMARY KEY NOT NULL,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL,
    status TEXT NOT NULL DEFAULT 'nuevo',
    type TEXT NOT NULL,
    clientName TEXT NOT NULL,
    clientEmail TEXT NOT NULL DEFAULT '',
    summary TEXT,
    contactData TEXT NOT NULL,
    contentData TEXT NOT NULL,
    designData TEXT NOT NULL,
    extraData TEXT NOT NULL
  )
`);
```

**Resultado:** `Tables: [ { name: 'Briefing' } ]` ✅

### Datos de la DB remota
- **Proveedor:** Turso (libSQL)
- **URL:** `libsql://formulario-paginas-lucas23-ieci.aws-us-east-1.turso.io`
- **Región:** AWS US East 1
- **Cuenta:** Lucas23-IECI

---

## 5. Variables de entorno en Vercel

Se configuraron en **Vercel Dashboard → Settings → Environment Variables** (All Environments):

| Variable | Valor | Propósito |
|----------|-------|-----------|
| `DATABASE_URL` | `libsql://formulario-paginas-lucas23-ieci.aws-us-east-1.turso.io` | Conexión a Turso |
| `DATABASE_AUTH_TOKEN` | `eyJhbGci...` (JWT) | Autenticación Turso |
| `ADMIN_PASSWORD` | (configurado) | Login del panel admin |
| `EMAIL_FROM` | `paginasmendezrisopatron@gmail.com` | Dirección de envío |
| `EMAIL_USER` | `paginasmendezrisopatron@gmail.com` | Usuario SMTP Gmail |
| `EMAIL_PASS` | (app password) | Contraseña de aplicación Gmail |

**No configurados (opcionales):**
- `EMAIL_ENABLED` → default `true`
- `GMAIL_CLIENT_ID`, `GMAIL_CLIENT_SECRET`, `GMAIL_REFRESH_TOKEN` → OAuth2 (no configurado, usa App Password como fallback)
- `SENDGRID_API_KEY` → no configurado

---

## 6. Fix: Emails no se enviaban

### Problema
Después de resolver el 500, el submit funcionaba (DB guardaba), pero no llegaban emails.

### Causa
En `submit/route.ts`, el bloque de envío de email tenía esta condición:
```typescript
if (emailFrom && emailEnabled && result.docsGenerated) {
//                                ^^^^^^^^^^^^^^^^^^^^
// Si la generación DOCX/XLSX fallaba, se saltaba TODO el email
```

### Solución
1. **Removida la dependencia de `docsGenerated`** — ahora los emails se envían siempre que `emailFrom` y `emailEnabled` estén activos
2. **Attachments condicionales** — si los docs se generaron, se adjuntan; si no, el email va sin attachments
3. **HTML fallback** — si `generateEmailHtml()` falla, el admin recibe un JSON con los datos y el cliente recibe un mensaje de agradecimiento
4. **Logging detallado** — cada paso del email ahora logea a la consola de Vercel:

```
[Submit] Email config: from=SET, enabled=true, docsGenerated=true, USER=SET, PASS=SET
[Submit] Admin email result: success=true, provider=gmail-apppass, error=none
[Submit] Client email result: success=true, provider=gmail-apppass, error=none
```

### Cadena de envío de email (3 intentos)

```
1. Gmail OAuth2   → GMAIL_CLIENT_ID + GMAIL_CLIENT_SECRET + GMAIL_REFRESH_TOKEN
   ↓ (falla o no configurado)
2. SendGrid SMTP  → SENDGRID_API_KEY
   ↓ (falla o no configurado)
3. Gmail App Pass → EMAIL_USER + EMAIL_PASS ← ESTE ES EL QUE SE USA ACTUALMENTE
```

---

## 7. Estado final de archivos modificados

### Archivos cambiados (3)

| Archivo | Cambio |
|---------|--------|
| `src/lib/prisma.ts` | Reescrito: detección automática libsql/file, `require()` dinámico |
| `prisma/schema.prisma` | Quitado `url = env(...)` (Prisma 7 lo maneja en config.ts) |
| `src/app/api/briefings/submit/route.ts` | Email desacoplado de docs, logging, HTML fallback |

### Archivos NO modificados (ya estaban bien)

| Archivo | Estado |
|---------|--------|
| `prisma.config.ts` | Ya tenía `datasource.url: process.env["DATABASE_URL"]` |
| `src/lib/emailService.ts` | 3-tier fallback funciona correctamente |
| `src/lib/generateDocx.ts` | Generación DOCX intacta |
| `src/lib/generateXlsx.ts` | Generación XLSX intacta |
| `src/lib/generateEmailHtml.ts` | Generación HTML email intacta |
| `.env.example` | Ya tenía guía de Turso/libSQL |

---

## 8. Commits realizados

```
20c56d1 fix: send emails even if docs generation fails, add logging
d765d64 fix: remove url from schema.prisma (Prisma 7 uses prisma.config.ts)
1e37486 fix: conditional libsql adapter - fix 500 on Vercel
```

Todos en branch `main`, pusheados a `github.com/Lucas23-IECI/FormularioPaginas`, auto-deployed por Vercel.

---

## 9. Arquitectura actual

### Flujo completo del submit

```
Usuario completa formulario
  ↓
POST /api/briefings/submit
  ↓
[rate-limit] → IP check (5 req/min)
  ↓
[parse] → request.json()
  ↓
[validate] → type ∈ {LANDING, WEB_COMERCIAL, ECOMMERCE}, clientName required
  ↓
[sanitize] → HTML strip, JS injection, SQL patterns, null bytes
  ↓
[db] → prisma.briefing.create() → Turso (libSQL remoto)
  ↓ (si falla → 500 con code: "DB_ERROR")
  ↓ (si OK → nunca más retorna 500)
  ↓
[docs] → generateDocxBuffer() + generateXlsxBuffer() + generateEmailHtml()
  ↓ (si falla → continúa sin docs)
  ↓
[email-admin] → sendEmail(to: EMAIL_FROM, attachments)
  ↓
[email-client] → sendEmail(to: clientEmail, attachments)
  ↓
201 { ok: true, id, docsGenerated, emailSent, clientEmailSent }
```

### Stack de producción (Vercel)

```
┌──────────────────────────────────────────┐
│              Vercel (Serverless)          │
│                                          │
│  Next.js 14 (App Router)                 │
│    ├─ /api/briefings/submit (POST)       │
│    ├─ /api/briefings (GET)               │
│    ├─ /api/auth (POST)                   │
│    └─ /briefing/[type] (formulario)      │
│                                          │
│  prisma.ts → detecta URL                 │
│    ├─ libsql:// → PrismaLibSql (Turso)   │
│    └─ file:    → PrismaClient (SQLite)   │
└──────────────┬───────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────┐
│         Turso (libSQL remoto)            │
│  Region: AWS US East 1                   │
│  DB: formulario-paginas                  │
│  Table: Briefing (13 columnas)           │
└──────────────────────────────────────────┘

Email: Gmail App Password (nodemailer)
  → paginasmendezrisopatron@gmail.com
```

### Stack local (desarrollo)

```
Next.js dev → PrismaClient → file:./dev.db (SQLite local)
Email: mismo Gmail App Password (o deshabilitado)
```

---

## 10. Problemas conocidos y próximos pasos

### ⚠️ Pendiente de verificación
- **Emails:** Se desplegó el fix, falta confirmar que Gmail App Password funciona desde los servidores de Vercel. Revisar en **Vercel → Logs** los mensajes `[Submit]`.
- **Si Gmail bloquea los emails:** Google a veces bloquea App Passwords desde IPs desconocidas. Alternativas:
  - Configurar OAuth2 (más seguro, más setup)
  - Usar Resend.com (gratis 100/día, 2 min de setup)
  - Usar SendGrid (gratis 100/día)

### ✅ Verificado funcionando
- Submit guarda en DB (Turso) ✅
- Página de éxito se muestra ✅
- Admin dashboard lee briefings de Turso ✅
- Preview reactivo ✅
- Navegación con historial ✅

### 📋 Mejoras futuras (de sesiones anteriores, pendientes)
- Multi-idioma en preview (ES/EN toggle)
- Nuevos extras reactivos (formulario_avanzado, agenda, descargables)
- Hero spacing en preview
- Auto-dismiss de errors (3s)
- Cleanup de features obsoletos (chat_live, pixel_facebook, redes_sociales)
- Checklists QA / Plantillas de seguridad

Estas mejoras están implementadas en los archivos del contexto anterior (`contextoCambios2.md`) pero pueden necesitar re-deploy si el repo fue clonado desde otro origen.

---

_Fin de contextoCambios3.md_
