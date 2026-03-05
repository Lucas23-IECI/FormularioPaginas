# Contexto Final — Briefing Landing Page

> **Documento definitivo** que consolida TODO lo implementado para el briefing de tipo **Landing Page**.  
> Fecha de cierre: Junio 2025.  
> Deployment: `https://formulario-paginas.vercel.app`

---

## 1. Stack Tecnológico

| Capa | Tecnología | Versión |
|------|-----------|---------|
| Framework | Next.js (App Router) | 14.x |
| Lenguaje | TypeScript | 5.x (strict) |
| Estilos | Tailwind CSS | 3.4.1 |
| ORM | Prisma | 7.4.0 |
| Base de datos | Turso (libSQL) en prod, SQLite file en dev | — |
| Iconos | Lucide React | 0.564.0 |
| Email | Nodemailer + Resend | Fallback chain |
| Hosting | Vercel | — |
| DB Hosting | Turso (AWS US East 1) | — |

---

## 2. Arquitectura del Motor de Briefings

### 2.1 Filosofía: Config-driven

Cada tipo de briefing (Landing, Web Comercial, E-commerce) se define como un **archivo de configuración** TypeScript puro. El motor renderiza dinámicamente pasos y campos sin necesidad de componentes específicos por tipo.

### 2.2 Archivos clave del engine

```
src/modules/briefingEngine/
├── index.ts          — Registry: getBriefingConfig(type), getAllConfigs(), getEnabledConfigs()
├── context.tsx       — BriefingFormProvider + useBriefingForm() hook (197 líneas)
├── StepRenderer.tsx  — Renderiza un step con sus fields (28 líneas)
├── FieldRenderer.tsx — Renderiza cada campo individual (391 líneas)
└── configs/
    └── landing.ts    — Configuración Landing Page (371 líneas)
```

### 2.3 Tipos base (`src/types/briefing.ts`)

```typescript
type FieldType = "text" | "email" | "tel" | "url" | "textarea" | "select" | "multiselect" | "checkbox" | "color" | "radio" | "file";

interface FieldConfig {
    id: string;
    label: string;
    type: FieldType;
    placeholder?: string;
    required?: boolean;
    options?: FieldOption[];
    helperText?: string;
    validation?: { min?: number; max?: number; pattern?: string; message?: string };
    dataGroup: "contact" | "content" | "design" | "extra";
}

interface StepConfig {
    id: string; title: string; description: string; icon: string;
    fields: FieldConfig[];
}

interface BriefingTypeConfig {
    id: string; type: BriefingType; label: string; description: string;
    icon: string; steps: StepConfig[]; enabled: boolean;
}

type BriefingType = "LANDING" | "WEB_COMERCIAL" | "ECOMMERCE";
type BriefingStatus = "nuevo" | "revisado" | "en_progreso" | "completado";
type FormData = Record<string, string | string[] | boolean | undefined>;
```

### 2.4 Context (source of truth)

**`context.tsx`** expone:
- `BriefingFormProvider` — Wraps toda la página del formulario
- `useBriefingForm()` — Hook que retorna:
  - `formData` — Estado actual (flat Record)
  - `currentStep`, `setStep`, `nextStep`, `prevStep`
  - `updateField(fieldId, value)`, `updateFields(partial)`
  - `submitForm()` — POST a `/api/briefings/submit`
  - `isStepValid(stepIndex)` — Valida campos required
  - `totalSteps`, `isSubmitting`, `isSubmitted`, `config`

### 2.5 Registry (`index.ts`)

```typescript
const configs: Record<string, BriefingTypeConfig> = {
    LANDING: landingConfig,
    // Aquí se agregarán WEB_COMERCIAL, ECOMMERCE
};
```

Funciones: `getBriefingConfig("LANDING")`, `getAllConfigs()`, `getEnabledConfigs()`

---

## 3. Configuración Landing Page (`configs/landing.ts`)

### 3.1 Metadata

```typescript
{
    id: "landing-page",
    type: "LANDING",
    label: "Landing Page",
    description: "Página de aterrizaje optimizada para conversión",
    icon: "Rocket",
    enabled: true,
}
```

### 3.2 Los 6 Steps

#### Step 1: `identity` — "Tu Negocio" (8 campos)
| Campo | Tipo | Required | dataGroup | Notas |
|-------|------|----------|-----------|-------|
| `businessName` | text | ✅ | contact | Nombre del negocio |
| `industry` | select | ✅ | contact | 13 opciones de rubro |
| `phone` | tel | ✅ | contact | Formato chileno (+56 9 XXXX XXXX) |
| `email` | email | ✅ | contact | Email de contacto |
| `clientName` | text | ✅ | contact | Nombre del responsable |
| `instagramUrl` | url | ❌ | contact | URL o @usuario Instagram |
| `facebookUrl` | url | ❌ | contact | URL o nombre Facebook |
| `twitterUrl` | url | ❌ | contact | URL o @usuario X/Twitter |

**Opciones de `industry`** (13):
gastronomia, salud, belleza, educacion, tecnologia, inmobiliaria, legal, fitness, construccion, consultoria, marketing, automotriz, agricultura

#### Step 2: `objective` — "Objetivo" (4 campos)
| Campo | Tipo | Required | dataGroup |
|-------|------|----------|-----------|
| `mainCTA` | radio | ✅ | content |
| `targetAudience` | textarea | ✅ | content |
| `uniqueValue` | textarea | ❌ | content |
| `competitors` | textarea | ❌ | content |

**Opciones de `mainCTA`** (6):
whatsapp, formulario, llamar, agendar, comprar, descargar

#### Step 3: `sections` — "Secciones" (2 campos)
| Campo | Tipo | Required | dataGroup |
|-------|------|----------|-----------|
| `sections` | multiselect | ✅ | content |
| `sectionPriority` | textarea | ❌ | content |

**Opciones de `sections`** (14):
hero, servicios, sobre_mi, portafolio, testimonios, precios, contacto, faq, blog, equipo, estadisticas, clientes, proceso, ubicacion

#### Step 4: `design` — "Diseño" (4 campos)
| Campo | Tipo | Required | dataGroup |
|-------|------|----------|-----------|
| `designStyle` | radio | ✅ | design |
| `primaryColor` | color | ✅ | design |
| `secondaryColor` | color | ❌ | design |
| `hasLogo` | checkbox | ❌ | design |

**Opciones de `designStyle`** (8):
moderno, minimalista, corporativo, creativo, elegante, juvenil, natural, tecnologico

#### Step 5: `content` — "Contenido" (4 campos)
| Campo | Tipo | Required | dataGroup |
|-------|------|----------|-----------|
| `hasContent` | radio | ✅ | content |
| `contentLanguage` | select | ❌ | content |
| `additionalContent` | textarea | ❌ | content |
| `referenceUrls` | textarea | ❌ | content |

**Opciones de `hasContent`**: si / no / parcial
**Opciones de `contentLanguage`**: español, inglés, ambos

#### Step 6: `extras` — "Extras" (5 campos)
| Campo | Tipo | Required | dataGroup |
|-------|------|----------|-----------|
| `features` | multiselect | ❌ | extra |
| `deadline` | radio | ❌ | extra |
| `socialMedia` | textarea | ❌ | extra |
| `additionalNotes` | textarea | ❌ | extra |
| `termsAccepted` | checkbox | ✅ | extra |

**Opciones de `features`** (10):
whatsapp_button ("Redes sociales y WhatsApp flotante"), google_maps, formulario_contacto, formulario_avanzado, animaciones, multiidioma ("Multi-idioma"), agenda ("Calendario / Agenda"), descargables ("Sección de Descargables"), analytics ("Google Analytics"), seo ("Optimización SEO")

**Opciones de `deadline`** (4):
1_semana, 2_semanas, 1_mes, flexible

---

## 4. LiveLandingPreview (`src/components/briefing/LiveLandingPreview.tsx`)

**892 líneas** — Componente central de previsualización en tiempo real.

### 4.1 Arquitectura

- **Lee directamente del context** (`useBriefingForm().formData`) — NO recibe props
- Renderiza un **mockup de navegador** con chrome (semáforo rojo/amarillo/verde + URL bar)
- Interior scrollable (`maxHeight: 500px`)
- Reacciona instantáneamente a cambios en el formulario

### 4.2 Datos que consume del context

```typescript
const primaryColor = formData.primaryColor || "#6366f1";
const secondaryColor = formData.secondaryColor || "";
const accentColor = secondaryColor || primaryColor;
const businessName = formData.businessName || "Tu Negocio";
const industry = formData.industry || "";
const designStyle = formData.designStyle || "moderno";
const sections = formData.sections || [];
const mainCTA = formData.mainCTA || "whatsapp";
const features = formData.features || [];
const phone = formData.phone || "";
const email = formData.email || "";
const instagramUrl = formData.instagramUrl || "";
const facebookUrl = formData.facebookUrl || "";
const twitterUrl = formData.twitterUrl || "";
const socialMedia = formData.socialMedia || "";
const additionalContent = formData.additionalContent || "";
```

### 4.3 Sistema de Style Presets

Interfaz `StylePreset`:
```typescript
interface StylePreset {
    isDark: boolean;
    bg: string;        // Tailwind bg class
    text: string;      // Tailwind text class
    subtext: string;   // Tailwind subtext class
    card: string;      // Tailwind card bg class
    divider: string;   // Tailwind border color class
    heroOverlay: string; // CSS gradient string
    fontClass: string;  // Tailwind font class (font-sans, font-serif, font-mono)
    borderRadius: string; // Tailwind rounded class
    shadow: string;     // Tailwind shadow class
    headingClass: string; // Tailwind heading override
    sectionPy: string;   // Tailwind padding-y for sections
}
```

**7 presets completamente diferenciados:**

| Preset | isDark | Font | Border Radius | Shadow | HeadingClass | SectionPy |
|--------|--------|------|---------------|--------|-------------|-----------|
| **moderno** | ✅ | sans | rounded-xl | shadow-lg shadow-black/20 | text-[11px] font-bold tracking-wide uppercase | px-6 py-5 |
| **minimalista** | ❌ | sans | rounded-none | shadow-none | text-[10px] font-light tracking-[0.2em] uppercase | px-8 py-6 |
| **corporativo** | ❌ | serif | rounded-md | shadow-md | text-[11px] font-bold | px-6 py-4 |
| **creativo** | ✅ | sans | rounded-2xl | shadow-xl shadow-purple-500/10 | text-[12px] font-black italic | px-5 py-5 |
| **elegante** | ✅ | serif | rounded-lg | shadow-lg shadow-amber-900/10 | text-[10px] font-medium tracking-[0.15em] uppercase | px-7 py-6 |
| **juvenil** | ❌ | sans | rounded-3xl | shadow-lg shadow-pink-500/10 | text-[11px] font-extrabold | px-5 py-4 |
| **natural** | ❌ | serif | rounded-xl | shadow-md shadow-green-900/5 | text-[11px] font-semibold | px-6 py-5 |
| **tecnologico** | ✅ (default) | mono | rounded-lg | shadow-lg shadow-cyan-500/10 | text-[10px] font-mono font-bold tracking-wider uppercase | px-6 py-5 |

### 4.4 Orden de Secciones (constante SECTION_ORDER)

```typescript
const SECTION_ORDER = [
    "hero", "servicios", "proceso", "sobre_mi", "portafolio",
    "testimonios", "equipo", "precios", "faq", "blog",
    "estadisticas", "clientes", "contacto", "ubicacion"
];
```

Las secciones se muestran en este orden fijo independiente del orden de selección del usuario.

### 4.5 Secciones renderizadas (14 + extras)

**Secciones principales** (activadas por `formData.sections`):
1. **hero** — Banner con imagen, nombre de negocio, industria, CTA interactivo, redes sociales en header
2. **servicios** — Grid 3 columnas con imágenes + copy genérico por industria
3. **proceso** — Steps circulares numerados con línea conectora
4. **sobre_mi** — Foto circular + texto de about
5. **portafolio** — Grid 4 columnas de fotos
6. **testimonios** — Card con estrellas + cita + autor
7. **equipo** — Fotos circulares con nombres
8. **precios** — 3 planes (Básico/Pro/Premium) con highlight en Pro
9. **faq** — Cards colapsables con ícono +
10. **blog** — Grid 2 columnas con imágenes + títulos
11. **estadisticas** — 3 métricas (150+ Proyectos, 98% Satisfacción, 5★ Rating)
12. **clientes** — Logos en fila (grayscale/invertidos)
13. **contacto** — Email/teléfono interactivos + formulario mockup
14. **ubicacion** — Placeholder de Google Maps con ícono

**Secciones extras** (activadas por `formData.features`):
- `google_maps` — Mapa si no se seleccionó "ubicacion" como sección
- `formulario_contacto` — Formulario simple si no hay sección "contacto"
- `formulario_avanzado` — Formulario con campos adicionales (grid 2 cols, textarea)
- `agenda` — Card con calendario + botón de agendar
- `descargables` — Card con ícono de descarga + nombre de archivo + tamaño
- `additionalContent` — Muestra el texto del usuario si existe

### 4.6 Funcionalidades interactivas

- **Links CTA interactivos**: El botón principal genera URLs reales
  - WhatsApp → `wa.me/{digits}`
  - Llamar → `tel:+{digits}`
  - Formulario/Agendar → `mailto:{email}`
  - Comprar/Descargar → `#`

- **Redes sociales interactivas**: Links reales a Instagram, Facebook, X/Twitter
  - Normalización automática: `@usuario` → URL completa
  - Presentes en: hero header, footer, botones flotantes
  - Las redes se muestran en 3 ubicaciones:
    1. Hero header (iconos pequeños arriba del título)
    2. Footer (iconos medianos)
    3. Botón flotante stack (bottom-right, más grandes)

- **Botones flotantes**: Stack vertical en bottom-right
  - WhatsApp (10x10, verde #25D366)
  - Instagram (8x8, rosa)
  - Facebook (8x8, azul)
  - X/Twitter (8x8, gris oscuro)
  - **Scroll intelligence**: Se ocultan cuando el footer está a ≤60px del borde inferior

- **Smart scroll**: Cuando el usuario selecciona una nueva sección o feature, el preview scrollea automáticamente hasta ella

- **Multi-idioma toggle**: Si la feature `multiidioma` está activada, aparecen botones ES/EN en el browser chrome que cambian todos los textos de la preview

- **Contenido adicional**: Si el usuario escribe en `additionalContent`, se muestra como sección al final antes del footer

### 4.7 Generic Copy (`src/lib/genericCopy.ts` — 152 líneas)

Genera texto placeholder en español contextualizado por industria.

**Interface `SectionCopy`:**
```typescript
interface SectionCopy {
    tagline: string;
    services: string[];        // 3 servicios
    aboutText: string;
    processSteps: string[];    // 4 pasos
    testimonial: { text: string; author: string };
    faqQuestions: string[];    // 3 preguntas
    teamNames: string[];       // 3 nombres (solo en default)
    blogTitles: string[];      // 2 títulos (solo en default)
    contactText: string;       // (solo en default)
    pricingDesc: string[];     // 3 descripciones (solo en default)
}
```

**13 industrias con copy personalizado:**
gastronomia, salud, belleza, educacion, tecnologia, inmobiliaria, legal, fitness, construccion, consultoria, marketing, automotriz, agricultura

Cada industria define: tagline, services, aboutText, processSteps, testimonial, faqQuestions.
Los campos `teamNames`, `blogTitles`, `contactText`, `pricingDesc` vienen del default.

**Uso:** `getGenericCopy({ businessName, industry })` → Merge de industria + defaults.

### 4.8 Imágenes (`sectionImages`)

Usa imágenes de **Unsplash** vía URL directa (`images.unsplash.com`):
- `hero`: 1 imagen
- `servicios`: 3 imágenes
- `sobre_mi`: 1 imagen
- `portafolio`: 4 imágenes
- `equipo`: 3 imágenes
- `blog`: 2 imágenes
- `clientes`: 3 imágenes (logos placeholder)

---

## 5. FieldRenderer (`src/modules/briefingEngine/FieldRenderer.tsx`)

**391 líneas** — Renderizador dinámico de campos.

### 5.1 Tipos soportados

| Tipo | Renderizado |
|------|------------|
| `text` | Input con sanitización |
| `email` | Input con validación email |
| `tel` | Input con formateo chileno automático (+56 9 XXXX XXXX) |
| `url` | Input con validación URL |
| `textarea` | Textarea multilínea con sanitización |
| `select` | Dropdown con opciones |
| `multiselect` | Grid de checkboxes con animaciones |
| `checkbox` | Toggle con label |
| `color` | Input color nativo + texto hex editable |
| `radio` | Botones de radio verticales con estado visual (círculo indigo relleno + punto blanco interno) |

### 5.2 Seguridad

- `sanitizeText()` — Elimina tags HTML, `javascript:`, event handlers, keywords SQL, patrones de inyección
- `formatChileanPhone()` — Normaliza a formato +56 9 XXXX XXXX
- Validadores: `isValidPhone`, `isValidEmail`, `isValidUrl`, `isValidColor`
- Autofill styling: Fuerza fondo slate-900 con texto blanco para inputs autocompletados

### 5.3 Visual

- Radio buttons: Círculo relleno indigo-500 con punto blanco central cuando seleccionado
- Multiselect: Cards con checkbox, borde indigo cuando activo, animación fadeIn
- Color picker: Muestra swatch circular + hex value editable
- Todos los inputs: Fondo slate-800/50, borde slate-700, focus ring indigo-500

---

## 6. Página del Formulario (`src/app/briefing/[type]/page.tsx`)

**350 líneas** — Layout principal del formulario de briefing.

### 6.1 Estructura

```
BriefingFormProvider
└── BriefingPage
    ├── StepIndicator (sidebar izquierdo en desktop)
    ├── StepRenderer (centro — formulario)
    ├── LiveLandingPreview (sidebar derecho en desktop)
    ├── Navigation (botones prev/next/submit)
    └── FullscreenPreviewModal (overlay)
```

### 6.2 Layout responsivo

- **Desktop**: 3 columnas (indicador | formulario | preview)
- **Mobile**: Formulario a ancho completo, preview oculta (accesible vía botón fullscreen)

### 6.3 FullscreenPreviewModal

- Se activa con botón "Ver Preview" en mobile o "pantalla completa" en desktop
- **3 métodos de cierre**: ESC, click en overlay, botón X
- `stopPropagation` en el contenedor interior para evitar cierre accidental
- Fondo: `bg-black/80 backdrop-blur-sm`
- Preview se renderiza sin props (lee del context)

---

## 7. Flujo de Submit

### 7.1 Client → API

1. `context.tsx` → `submitForm()` agrupa datos por `dataGroup`:
   - `contactData`: businessName, industry, phone, email, clientName, redes sociales
   - `contentData`: mainCTA, targetAudience, sections, etc.
   - `designData`: designStyle, primaryColor, secondaryColor, hasLogo
   - `extraData`: features, deadline, socialMedia, additionalNotes

2. POST a `/api/briefings` con payload:
```json
{
    "type": "LANDING",
    "clientName": "...",
    "clientEmail": "...",
    "contactData": {},
    "contentData": {},
    "designData": {},
    "extraData": {}
}
```

### 7.2 API → DB

- `POST /api/briefings/route.ts` — Crea registro en Prisma
- Modelo `Briefing`:
  - `id` (UUID), `createdAt`, `updatedAt`, `status` ("nuevo"), `type`
  - `clientName`, `clientEmail`, `summary` (nullable)
  - `contactData`, `contentData`, `designData`, `extraData` — Almacenados como JSON strings

### 7.3 API → Email

Cadena de fallback (intenta cada uno hasta que funcione):
1. **Resend** (API key `RESEND_API_KEY`)
2. **Gmail App Password** (`GMAIL_USER` + `GMAIL_APP_PASSWORD`)
3. **Gmail OAuth2**
4. **SendGrid**

Email contenido: Tabla HTML con todos los campos agrupados por step.

### 7.4 Exports

- `GET /api/briefings/export/csv/route.ts` — Exporta todos los briefings como CSV
- `GET /api/briefings/export/docx/route.ts` — Exporta un briefing individual como documento Word

---

## 8. Panel Admin (`/admin`)

### 8.1 Login

- `POST /api/auth` — Valida `ADMIN_USER` + `ADMIN_PASSWORD` (env vars)
- Set cookie `admin_session` con token hasheado
- Redirige a `/admin/dashboard`

### 8.2 Dashboard

- Lista todos los briefings con filtros por status y tipo
- Columnas: ID, Fecha, Tipo, Cliente, Email, Estado
- Click → Detalle individual (`/admin/dashboard/[id]`)

### 8.3 Detalle (`/admin/dashboard/[id]`)

- Muestra todos los datos del briefing organizados por grupo
- Permite cambiar status (nuevo → revisado → en_progreso → completado)
- Botones de exportar (CSV general, DOCX individual)

---

## 9. Base de Datos

### 9.1 Prisma Schema

```prisma
generator client { provider = "prisma-client-js" }
datasource db { provider = "sqlite" }

model Briefing {
    id          String   @id @default(uuid())
    createdAt   DateTime @default(now())
    updatedAt   DateTime @updatedAt
    status      String   @default("nuevo")
    type        String
    clientName  String
    clientEmail String   @default("")
    summary     String?
    contactData String   // JSON string
    contentData String   // JSON string
    designData  String   // JSON string
    extraData   String   // JSON string
}
```

### 9.2 Prisma Config (`prisma.config.ts`)

Adaptador condicional:
- Si `DATABASE_URL` empieza con `libsql://` → usa `PrismaLibSQL` adapter (Turso remoto)
- Si `DATABASE_URL` es `file:` → usa `PrismaClient` estándar (SQLite local)

### 9.3 Turso en producción

- URL: `libsql://formulario-paginas-*.turso.io`
- Auth: `TURSO_AUTH_TOKEN`
- Tabla creada manualmente con SQL (Prisma migrate no funciona con Turso)

---

## 10. Home Page (`/`)

- Muestra cards para cada tipo de briefing
- **Landing Page** → Link activo a `/briefing/LANDING`
- **Web Comercial** → Badge "Próximamente" (disabled)
- **E-commerce** → Badge "Próximamente" (disabled)
- Efecto glassmorphism, gradientes, animaciones

---

## 11. Mapa de Archivos Completo (Landing-related)

```
src/
├── app/
│   ├── page.tsx                          — Home con cards de servicios (121 líneas)
│   ├── layout.tsx                        — Root layout con BriefingFormProvider
│   ├── globals.css                       — Estilos globales + animaciones
│   ├── briefing/
│   │   ├── [type]/page.tsx               — Formulario principal (350 líneas)
│   │   └── success/page.tsx              — Página de éxito post-submit
│   ├── api/
│   │   ├── auth/route.ts                 — Login admin
│   │   └── briefings/
│   │       ├── route.ts                  — CRUD briefings (GET/POST)
│   │       ├── [id]/route.ts             — Briefing individual (GET/PATCH/DELETE)
│   │       └── export/
│   │           ├── csv/route.ts          — Export CSV
│   │           └── docx/route.ts         — Export Word
│   └── admin/
│       ├── page.tsx                      — Login
│       └── dashboard/
│           ├── page.tsx                  — Lista de briefings
│           └── [id]/page.tsx             — Detalle briefing
├── components/
│   └── briefing/
│       ├── LiveLandingPreview.tsx         — Preview en tiempo real (892 líneas)
│       └── StepIndicator.tsx             — Indicador de pasos lateral
├── lib/
│   ├── prisma.ts                         — Prisma client singleton
│   └── genericCopy.ts                    — Copy por industria (152 líneas)
├── modules/
│   └── briefingEngine/
│       ├── index.ts                      — Registry de configs
│       ├── context.tsx                   — Provider + hook (197 líneas)
│       ├── StepRenderer.tsx              — Render de steps (28 líneas)
│       ├── FieldRenderer.tsx             — Render de fields (391 líneas)
│       └── configs/
│           └── landing.ts                — Config Landing (371 líneas)
└── types/
    └── briefing.ts                       — Tipos TypeScript
```

**Total líneas de código clave**: ~2,500+

---

## 12. Variables de Entorno (Producción)

```env
DATABASE_URL=libsql://formulario-paginas-*.turso.io
TURSO_AUTH_TOKEN=eyJ...
ADMIN_USER=admin
ADMIN_PASSWORD=***
GMAIL_USER=***@gmail.com
GMAIL_APP_PASSWORD=***
RESEND_API_KEY=re_***
NEXT_PUBLIC_BASE_URL=https://formulario-paginas.vercel.app
```

---

## 13. Decisiones de Diseño Importantes

### ¿Por qué el preview lee del context y no de props?
- Fuente de verdad única → siempre sincronizado
- No hay que pasar props manualmente al agregar campos nuevos
- El preview se monta donde sea y funciona igual

### ¿Por qué copy genérico y no skeleton bars?
- Las barras grises no comunican nada al cliente
- El copy por industria da una experiencia realista que ayuda al cliente a visualizar su landing
- 13 industrias cubren la mayoría de clientes potenciales

### ¿Por qué orden fijo de secciones?
- Evita layouts caóticos cuando el usuario selecciona/deselecciona en orden aleatorio
- El orden sigue buenas prácticas de Landing Pages (hero → servicios → social proof → contacto)

### ¿Por qué style presets tan diferenciados?
- Si todos se ven igual, el selector de estilo es inútil
- Cada preset cambia: colores, bordes, sombras, fuentes, spacing, headings
- El cliente puede ver una diferencia real al cambiar de estilo

### ¿Por qué no hay campo de presupuesto?
- Se removió por decisión de UX — el presupuesto se discute en la consulta, no en el formulario
- Reduce fricción en el formulario

---

## 14. Historial de Sesiones

| Sesión | Cambios Clave |
|--------|--------------|
| **1** | Build inicial del motor, formulario, preview, admin, API |
| **2** | Estado/sync fixes: preview lee de context directo, StylePreset system, secondaryColor, WhatsApp position, FullscreenPreviewModal |
| **3** | Preview interactivo: genericCopy, modal overlay fix, radio visual state, style presets expandidos (shadow/headingClass/sectionPy), redes sociales, links reales, copy de fields mejorado |
| **4** | Email: Nodemailer setup, fallback chain, templates HTML |
| **5** | Documentos: Export CSV y Word |
| **6** | Deploy: Vercel + Turso, Prisma 7 compatibility, tabla manual SQL |

---

## 15. Lo que queda por implementar (fuera de Landing)

- [ ] **Web Comercial** — Config + Preview para sitios multi-página
- [ ] **E-commerce** — Config + Preview para tiendas online
- [ ] Tests automatizados (actualmente solo manual via CHECKLIST_QA.md)
- [ ] Upload de archivos (campo `file` existe en types pero no se usa)
- [ ] Notificaciones al admin cuando llega un briefing nuevo

---

> **Este documento cierra el scope de Landing Page. Todo lo que venga ahora es trabajo nuevo.**
