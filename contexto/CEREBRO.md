# 🧠 CEREBRO — FormularioPaginas

> Referencia compacta del proyecto. Última actualización: 19 Feb 2026 (commit `7874cdc`)

---

## 1. ¿Qué es?

Sistema de **Briefing Profesional** para agencia web. Formulario multi-paso con preview en vivo → guarda en DB → notifica por email → panel admin para gestión.

**URL**: `https://formulario-paginas.vercel.app`

---

## 2. Stack

| Tecnología | Versión | Uso |
|---|---|---|
| Next.js | 14.2.35 | App Router, SSR, API Routes |
| TypeScript | 5.x | Todo el proyecto |
| TailwindCSS | 3.4.1 | Estilos (dark mode, glassmorphism) |
| Prisma | 7.4.0 | ORM |
| SQLite / Turso | libSQL | DB local (file:) / producción (libsql://) |
| nodemailer + Resend | 8.0.1 / 6.9.2 | Emails con fallback chain |
| Lucide React | 0.564.0 | Iconos |

---

## 3. Mapa de Archivos

### Configuración raíz
| Archivo | Qué hace |
|---|---|
| `package.json` | Deps, scripts (`postinstall: prisma generate`, `build: prisma generate && next build`) |
| `prisma/schema.prisma` | Modelo Briefing (SQLite, SIN url — Prisma 7 usa prisma.config.ts) |
| `prisma.config.ts` | `datasource.url = process.env["DATABASE_URL"]` |
| `next.config.mjs` | Config Next.js |
| `tailwind.config.ts` | Tailwind config |
| `Dockerfile` / `docker-compose.yml` | Deploy Docker (no usado en Vercel) |

### `src/types/`
| Archivo | Exports clave |
|---|---|
| `briefing.ts` | `FieldType`, `FieldConfig`, `StepConfig`, `BriefingTypeConfig`, `FormData`, `BriefingRecord` |

### `src/modules/briefingEngine/` — Motor del formulario
| Archivo | Qué hace |
|---|---|
| `index.ts` | `getBriefingConfig(type)`, `getAllConfigs()`, `getEnabledConfigs()` — Registry de configs |
| `context.tsx` | `BriefingFormProvider` + `useBriefingForm()` — Estado global: formData, currentStep, submitForm |
| `FieldRenderer.tsx` | Renderiza inputs según `FieldConfig.type` (text, email, tel, select, multiselect, radio, color, checkbox, textarea). Sanitización client-side. Formateo teléfono chileno (+56) |
| `StepRenderer.tsx` | Renderiza un paso completo (título + descripción + fields) |
| `configs/landing.ts` | Config del formulario Landing Page (6 pasos, ver sección 5) |

### `src/components/briefing/`
| Archivo | Qué hace |
|---|---|
| `LiveLandingPreview.tsx` | Preview en vivo de la landing (892 líneas). Estilos dinámicos por `designStyle`. Soporta 14 secciones, social buttons, WhatsApp flotante, multi-idioma, descargables, agenda |
| `StepIndicator.tsx` | Barra de progreso visual (desktop: círculos + líneas, mobile: barra) |

### `src/app/` — Páginas
| Archivo | Ruta | Qué hace |
|---|---|---|
| `page.tsx` | `/` | Home — selección de tipo de briefing (Landing activo, Web Comercial y Ecommerce "Próximamente") |
| `layout.tsx` | `*` | Layout global (Inter font, metadata) |
| `briefing/[type]/page.tsx` | `/briefing/landing` | Formulario principal. History API sync, unsaved changes warning, preview toggle, fullscreen modal |
| `briefing/success/page.tsx` | `/briefing/success` | Página de éxito post-envío |
| `admin/page.tsx` | `/admin` | Login admin (contraseña simple) |
| `admin/dashboard/page.tsx` | `/admin/dashboard` | Lista de briefings con filtros y export |
| `admin/dashboard/[id]/page.tsx` | `/admin/dashboard/:id` | Detalle de briefing individual |

### `src/app/api/` — API Routes
| Archivo | Método | Qué hace |
|---|---|---|
| `auth/route.ts` | POST | Login admin (compara con `ADMIN_PASSWORD` env var) |
| `briefings/route.ts` | GET | Lista briefings (con auth token) |
| `briefings/[id]/route.ts` | GET, PATCH | Detalle/actualizar briefing |
| `briefings/submit/route.ts` | POST | **Principal**: rate-limit → parse → validate → sanitize → DB save → docs gen (degraded) → email admin → email client |
| `briefings/export/csv/route.ts` | GET | Export CSV |
| `briefings/export/docx/route.ts` | GET | Export DOCX individual |

### `src/lib/` — Utilidades
| Archivo | Qué hace |
|---|---|
| `prisma.ts` | Singleton PrismaClient. **Condicional**: usa `@prisma/adapter-libsql` solo si URL empieza con `libsql://` o `https://` |
| `emailService.ts` | `sendEmail()` con fallback chain: Resend → Gmail App Password → Gmail OAuth2 → SendGrid. También: `checkRateLimit()`, `isValidEmail()`, `sanitizeSubject()` |
| `generateDocx.ts` | Genera buffer DOCX con datos del briefing |
| `generateXlsx.ts` | Genera buffer XLSX con datos del briefing |
| `generateEmailHtml.ts` | HTML del email para admin |
| `generateClientEmailHtml.ts` | HTML del email de confirmación para cliente (muestra solo primer nombre) |
| `genericCopy.ts` | Textos placeholder para el preview según industria |
| `valueLabels.ts` | Labels legibles para valores del formulario (usado en emails/exports) |

---

## 4. Modelo de Datos (Prisma)

```prisma
model Briefing {
  id          String   @id @default(uuid())
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  status      String   @default("nuevo")     // "nuevo" | "revisado" | "en_progreso" | "completado"
  type        String                          // "LANDING" | "WEB_COMERCIAL" | "ECOMMERCE"
  clientName  String
  clientEmail String   @default("")
  summary     String?
  contactData String   // JSON stringified
  contentData String   // JSON stringified
  designData  String   // JSON stringified
  extraData   String   // JSON stringified
}
```

---

## 5. Landing Config — 6 Pasos

### Paso 1: "Tu Negocio" (identity) — dataGroup: contact
- `clientName` (text, required) — Nombre y apellido
- `businessName` (text, required) — Nombre del negocio
- `industry` (select, required) — 14 opciones (gastronomia, salud, belleza, etc.)
- `email` (email, required) — Correo de contacto
- `phone` (tel, optional) — WhatsApp
- `instagramUrl`, `facebookUrl`, `twitterUrl` (text, optional) — Redes sociales

### Paso 2: "Objetivo" (objective) — dataGroup: content
- `mainGoal` (select, required) — 7 opciones (captar_leads, vender_servicio, etc.)
- `targetAudience` (textarea, required) — Público objetivo
- `mainCTA` (select, required) — 7 opciones (whatsapp, formulario, llamar, etc.)
- `uniqueValue` (textarea, optional) — Diferenciador

### Paso 3: "Secciones" (sections) — dataGroup: content
- `sections` (multiselect, required) — 14 opciones (hero, servicios, proceso, sobre_mi, portafolio, testimonios, equipo, precios, faq, blog, contacto, ubicacion, estadisticas, clientes)
- `sectionNotes` (textarea, optional)

### Paso 4: "Diseño" (design) — dataGroup: design
- `designStyle` (select, required) — 8 opciones (moderno, elegante, minimalista, corporativo, creativo, oscuro, calido, no_se)
- `primaryColor` (color, optional)
- `secondaryColor` (color, optional)
- `referenceUrls` (textarea, optional)

### Paso 5: "Contenido" (content) — dataGroup: content
- `hasLogo` (radio, required) — si / no_necesito / no_no_necesito
- `hasPhotos` (radio, required) — si / algunas / no
- `hasTexts` (radio, required) — si / borrador / no
- `additionalContent` (textarea, optional)

### Paso 6: "Extras y Entrega" (extras) — dataGroup: extra
- `features` (multiselect, optional) — 10 opciones (whatsapp_button, google_maps, formulario_contacto, formulario_avanzado, animaciones, multiidioma, agenda, descargables, analytics, seo)
- `hasDomain` (radio, required) — si / necesito / no_se
- `domainName` (text, optional)
- `deadline` (select, required) — urgente / pronto / normal / sin_prisa
- `budget` (select, optional) — basico / medio / premium / no_se
- `additionalNotes` (textarea, optional)

---

## 6. Flujo de Submit

```
Cliente llena formulario → POST /api/briefings/submit
  1. Rate limit (5/min por IP)
  2. Parse JSON body
  3. Validate (type, clientName required; email format)
  4. Sanitize deep (anti-XSS, anti-SQLi)
  5. DB: prisma.briefing.create() → briefingId
  --- Desde aquí nunca retorna 500 ---
  6. Docs: generateDocx + generateXlsx (degraded — si falla, continúa)
  7. Email admin: sendEmail con attachments (si docs ok)
  8. Email client: sendEmail sin attachments (confirmación)
  → Response 201: { ok, id, status, docsGenerated, emailSent, clientEmailSent }
```

---

## 7. Email Fallback Chain

```
1. Resend (RESEND_API_KEY) — mejor para Vercel
2. Gmail App Password (EMAIL_USER + EMAIL_PASS)
3. Gmail OAuth2 (GMAIL_CLIENT_ID + SECRET + REFRESH_TOKEN)
4. SendGrid (SENDGRID_API_KEY)
```

---

## 8. Variables de Entorno (Vercel)

| Variable | Estado | Uso |
|---|---|---|
| `DATABASE_URL` | ✅ | `libsql://formulario-paginas-lucas23-ieci.aws-us-east-1.turso.io` |
| `DATABASE_AUTH_TOKEN` | ✅ | Token JWT Turso |
| `ADMIN_PASSWORD` | ✅ | Contraseña panel admin |
| `EMAIL_FROM` | ✅ | Email remitente |
| `EMAIL_USER` | ✅ | Gmail user para App Password |
| `EMAIL_PASS` | ✅ | Gmail App Password |
| `RESEND_API_KEY` | ❌ | No configurado (recomendado) |
| `RESEND_FROM` | ❌ | Default: `onboarding@resend.dev` |

---

## 9. Decisiones Técnicas Importantes

1. **Prisma 7 NO soporta `url` en schema.prisma** → URL va en `prisma.config.ts`
2. **Prisma CLI no entiende `libsql://`** → No se puede usar `prisma db push`. Tabla creada con `@libsql/client` directamente
3. **Adapter condicional** en `prisma.ts` → `PrismaLibSql` solo para URLs remotas, PrismaClient estándar para `file:` local
4. **Email desacoplado de docs** → Emails se envían aunque falle la generación de DOCX/XLSX
5. **Sanitización doble**: client-side (FieldRenderer) + server-side (submit route)
6. **Preview dinámico**: Los estilos en LiveLandingPreview cambian según `designStyle` (8 presets)

---

## 10. Git Log Reciente

```
7874cdc fix: mostrar solo primer nombre en correo del cliente
dde8f44 feat: etiquetas legibles en Word/Excel/Email + cambio Nombre y Apellido
5e664ae feat: add Resend as primary email provider, reorder fallback chain
7c0c655 fix: strip spaces from Gmail App Password
9725ffd fix: email system overhaul - client thank-you email, robust SMTP, mobile preview
20c56d1 fix: send emails even if docs generation fails, add logging
d765d64 fix: remove url from schema.prisma (Prisma 7 uses prisma.config.ts)
1e37486 fix: conditional libsql adapter - fix 500 on Vercel
```

---

## 11. Pendientes / Mejoras

- [ ] Configurar Resend (mejor email provider para Vercel)
- [ ] Verificar entregas de email en producción
- [ ] Configs para WEB_COMERCIAL y ECOMMERCE (actualmente solo LANDING)
- [ ] **Pricing en extras** — El paso 6 tiene `budget` como select (basico/medio/premium/no_se) pero sin precios reales
