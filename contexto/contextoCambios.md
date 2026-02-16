# contextoCambios.md — Registro Completo de Cambios del Proyecto

> **Proyecto**: FormularioPaginas  
> **Repositorio**: Lucas23-IECI/FormularioPaginas  
> **Rama actual**: master | **Rama base**: main  
> **Última actualización**: 16 de Febrero de 2026  
> **Stack**: Next.js 14 (App Router) · TypeScript · Tailwind CSS · Prisma/SQLite · Lucide React

---

## Índice

1. [Visión General del Proyecto](#1-visión-general-del-proyecto)
2. [Arquitectura Técnica](#2-arquitectura-técnica)
3. [Sesión 1 — Fixes de Estado y Sincronización](#3-sesión-1--fixes-de-estado-y-sincronización)
4. [Sesión 2 — Mejoras de UX, Contenido e Interactividad](#4-sesión-2--mejoras-de-ux-contenido-e-interactividad)
5. [Detalle Archivo por Archivo](#5-detalle-archivo-por-archivo)
6. [Estilos de Diseño (Style Presets)](#6-estilos-de-diseño-style-presets)
7. [Sistema de Copy Genérico](#7-sistema-de-copy-genérico)
8. [Estado Actual Completo](#8-estado-actual-completo)
9. [Estructura de Archivos](#9-estructura-de-archivos)
10. [Restricciones Técnicas](#10-restricciones-técnicas)

---

## 1. Visión General del Proyecto

Sistema de **Briefing Profesional** para una agencia de diseño web. Formulario interactivo, multi-paso, con vista previa en tiempo real (Live Preview) del sitio web que el cliente está configurando.

### Funcionalidades Core
- **Formulario Wizard** de 6 pasos (Negocio → Objetivo → Secciones → Diseño → Contenido → Extras)
- **Live Preview** miniatura tipo "browser mockup" que refleja cada cambio al instante
- **Modal Fullscreen** para expandir la preview con ESC/click-overlay para cerrar
- **Panel Admin** (`/admin`) con login, lista, filtros, detalle, estados y exportación (CSV/DOCX)
- **Seguridad** profunda: sanitización anti-XSS/SQLi en frontend + backend

---

## 2. Arquitectura Técnica

### Briefing Engine (`src/modules/briefingEngine/`)
Motor config-driven: cada tipo de briefing (ej. Landing Page) es un archivo de configuración que define pasos y campos. `FieldRenderer.tsx` renderiza todo dinámicamente.

```
configs/landing.ts   → Define los 6 steps + fields + options
context.tsx          → BriefingFormProvider (React Context, useState)
FieldRenderer.tsx    → Renderiza inputs según config (text, select, radio, multiselect, color, textarea, tel, email)
StepRenderer.tsx     → Wrapper que itera fields del step actual
index.ts             → Registro de configs
```

### Estado (Single Source of Truth)
```typescript
// context.tsx
interface BriefingFormState {
  formData: FormData;           // Record<string, string | string[] | boolean | undefined>
  currentStep: number;
  config: BriefingTypeConfig | null;
  isSubmitting: boolean;
  isSubmitted: boolean;
}
```
- `updateField(fieldId, value)` y `updateFields(data)` actualizan el estado
- `LiveLandingPreview` consume `useBriefingForm()` directamente (sin props)

### Base de Datos
- Prisma ORM + SQLite
- Modelo `Briefing` con campos estructurados (id, status, clientName, clientEmail) + campos JSON (contactData, contentData, designData)

---

## 3. Sesión 1 — Fixes de Estado y Sincronización

**Problema raíz diagnosticado**: `LiveLandingPreview` recibía `formData` por props en lugar de leer del context directamente. Esto causaba desincronización.

### Cambios realizados:

#### 3.1. LiveLandingPreview.tsx — Lectura directa del context
- **Antes**: Recibía `formData` como prop desde `page.tsx`
- **Después**: Usa `useBriefingForm()` directamente — cero props
- Se eliminó toda la interface de props

#### 3.2. LiveLandingPreview.tsx — Sistema de StylePreset
- Creada interface `StylePreset` con: isDark, bg, text, subtext, card, divider, heroOverlay, fontClass, borderRadius
- Función `getStylePreset(designStyle, primaryColor)` retorna preset por estilo
- 7 estilos: oscuro, elegante, minimalista, corporativo, creativo, cálido, moderno
- `no_se` mapea a moderno (default)

#### 3.3. LiveLandingPreview.tsx — Orden de secciones
- Constante `SECTION_ORDER` controla el orden canónico de renderizado:
  ```
  hero → servicios → proceso → sobre_mi → portafolio → testimonios →
  equipo → precios → faq → blog → estadísticas → clientes → contacto → ubicación
  ```

#### 3.4. LiveLandingPreview.tsx — Secondary color
- `accentColor = secondaryColor || primaryColor` usado en todos los títulos y acentos
- `secondaryColor` se lee del context (`formData.secondaryColor`)

#### 3.5. LiveLandingPreview.tsx — WhatsApp position fix
- Container del botón flotante ahora tiene `position: relative` en el wrapper

#### 3.6. page.tsx — Modal Fullscreen
- Componente `FullscreenPreviewModal` con:
  - Cierre con tecla `Escape`
  - Bloqueo de scroll del body mientras está abierto
  - Botón X en esquina superior derecha
- Botón "Expandir" con ícono `Maximize2` junto al título "Vista previa en tiempo real"
- Toggle `fullscreenPreview` state

#### 3.7. landing.ts — Reorden de opciones de secciones
- Las opciones de multiselect `sections` se reordenaron para coincidir con `SECTION_ORDER`

---

## 4. Sesión 2 — Mejoras de UX, Contenido e Interactividad

8 problemas identificados y resueltos:

### 4.1. ✅ Texto genérico en preview (reemplazar barras de esqueleto)

**Problema**: La preview mostraba solo `div`s grises (skeleton bars) donde debería haber texto simulado.

**Solución**: 
- Creado `src/lib/genericCopy.ts` — generador de copy genérico en español
- Interface `SectionCopy` con: tagline, services[], aboutText, processSteps[], testimonial{text, author}, faqQuestions[], teamNames[], blogTitles[], contactText, pricingDesc[]
- 13 industrias con copy personalizado: gastronomía, salud, belleza, educación, tecnología, inmobiliaria, legal, fitness, construcción, consultoría, marketing, automotriz, agricultura
- Copy por defecto como fallback
- `getGenericCopy({ businessName, industry })` retorna `SectionCopy`
- Integrado en `LiveLandingPreview.tsx` — TODAS las skeleton bars reemplazadas por texto real

**Ejemplo** (Gastronomía):
```
tagline: "Sabores que enamoran"
services: ["Menú del día", "Catering", "Eventos"]
aboutText: "Más de 10 años creando experiencias gastronómicas únicas para ti."
testimonial: "La mejor comida de la ciudad, siempre volvemos." — Camila R.
faqQuestions: ["¿Tienen opciones vegetarianas?", "¿Hacen delivery?", ...]
```

### 4.2. ✅ Modal fullscreen — cierre con click en overlay

**Problema**: El modal solo se cerraba con ESC o botón X. Click fuera no hacía nada.

**Solución** en `page.tsx`:
```tsx
// Overlay — click para cerrar
<div ... onClick={onClose}>
  {/* Inner container — click NO cierra */}
  <div ... onClick={(e) => e.stopPropagation()}>
    <LiveLandingPreview />
  </div>
</div>
```

### 4.3. ✅ Preview interactiva (botones con links reales)

**Problema**: Todos los CTAs eran `<button>` decorativos sin funcionalidad.

**Solución**:
- Funciones helper: `phoneDigits()`, `buildWhatsAppUrl()`, `buildCtaHref()`
- Hero CTA → `<a href={ctaHref} target="_blank">`
- WhatsApp flotante → `<a href="wa.me/{phone}" target="_blank">`
- Contacto email → `<a href="mailto:{email}" target="_blank">`
- Contacto teléfono → `<a href="tel:+{digits}" target="_blank">`
- Botón "Enviar" en contacto → `<a href={ctaHref} target="_blank">`

**Mapeo de CTA a URL**:
| CTA Value | URL Generada |
|-----------|-------------|
| whatsapp  | wa.me/{phone_digits} |
| llamar    | tel:+{phone_digits}  |
| formulario| mailto:{email}       |
| agendar   | mailto:{email}       |
| otros     | # (fallback)         |

### 4.4. ✅ Campos de redes sociales (Instagram, Facebook, Twitter/X)

**Problema**: No había campos para ingresar URLs de redes sociales.

**Solución** en `landing.ts` — 3 campos nuevos en el step "Tu Negocio" (identity), después del teléfono:
```typescript
{ id: "instagramUrl", label: "Instagram (opcional)", type: "text", placeholder: "@minegocio o instagram.com/minegocio" }
{ id: "facebookUrl",  label: "Facebook (opcional)",  type: "text", placeholder: "facebook.com/minegocio" }
{ id: "twitterUrl",   label: "Twitter / X (opcional)", type: "text", placeholder: "@minegocio o x.com/minegocio" }
```
- Todos opcionales, con `helperText` descriptivo
- Se leen en el preview como `formData.instagramUrl`, etc.

### 4.5. ✅ Estilos de diseño drásticamente diferentes

**Problema**: Los 7 estilos eran demasiado parecidos visualmente — solo cambiaba un poco el fondo.

**Solución**: Expandida interface `StylePreset` con 3 propiedades nuevas:
```typescript
shadow: string;        // shadow-none | shadow-sm | shadow-md | shadow-lg
headingClass: string;  // Tratamiento de headings (case, tracking, weight, size)
sectionPy: string;     // Padding de sección (spacing entre secciones)
```

**Diferenciación dramática por estilo** (ver sección 6 para detalle completo):
| Estilo | borderRadius | shadow | headingClass | Cards |
|--------|-------------|--------|-------------|-------|
| Oscuro | rounded-lg | none | UPPERCASE tracking-wider 9px | bg-white/5 + border |
| Elegante | rounded-sm | none | UPPERCASE tracking-[0.2em] font-light | white + border stone |
| Minimalista | rounded-xl | none | lowercase tracking-tight font-light | gray-50 + border |
| Corporativo | rounded | shadow-md | UPPERCASE tracking-wide font-bold | white + border slate |
| Creativo | rounded-2xl | shadow-lg purple | font-extrabold 11px | gradient + border purple |
| Cálido | rounded-2xl | shadow-sm amber | font-medium 10px | white + border amber |
| Moderno | rounded-lg | shadow-sm | font-semibold 10px | gray-50 (sin border) |

### 4.6. ✅ Radio circles — estado visual lleno

**Problema**: Los radio buttons seleccionados mostraban un borde indigo con punto indigo adentro — prácticamente invisible.

**Solución** en `FieldRenderer.tsx`:
```tsx
// ANTES — Invisible
selected: "border-indigo-500" + dot "bg-indigo-500"

// DESPUÉS — Claro y visible
selected: "bg-indigo-500 border-indigo-500" + dot "bg-white"
```
- Círculo exterior se llena completamente de indigo
- Punto interior blanco (w-2 h-2) — patrón clásico de radio UI
- Contraste alto = selección obvia

### 4.7. ✅ Mejor copy en campos "Algo más"

**Problema**: Los campos `additionalContent` y `additionalNotes` tenían labels vagos y placeholders poco útiles.

**Solución** en `landing.ts`:
```
ANTES additionalContent:
  label: "¿Algo más que quieras incluir?"
  placeholder: "Videos, catálogos, descargables, etc..."

DESPUÉS additionalContent:
  label: "¿Necesitas algo extra en tu landing?"
  placeholder: "Ej: Catálogo PDF descargable, sección de video, integración con agenda..."
  helperText: "Describe cualquier funcionalidad o contenido especial..."

ANTES additionalNotes:
  label: "¿Algo más que quieras contarnos?"
  placeholder: "Cualquier detalle adicional..."

DESPUÉS additionalNotes:
  label: "¿Algo más que debamos saber sobre tu proyecto?"
  placeholder: "Ej: Tengo un catálogo que quiero subir, necesito que se vea igual a otra web..."
  helperText: "Cualquier detalle extra que nos ayude a entregar exactamente lo que necesitas"
```

### 4.8. ✅ SectionTitle con headingClass per-style

Cada sección en el preview ahora usa `style.headingClass` en su título, haciendo que el cambio de estilo de diseño sea inmediatamente visible en CADA título de sección, no solo en el fondo.

---

## 5. Detalle Archivo por Archivo

### `src/lib/genericCopy.ts` (NUEVO — Sesión 2)
- **Propósito**: Generador de copy genérico en español por industria
- **Exporta**: `getGenericCopy(input: CopyInput): SectionCopy`
- **Dependencias**: Ninguna (puro TypeScript)
- **Líneas**: ~165

### `src/components/briefing/LiveLandingPreview.tsx` (EDITADO — Sesiones 1 y 2)
- **Propósito**: Preview miniatura tipo browser mockup
- **Consume**: `useBriefingForm()` directamente (single source of truth)
- **Importa**: `getGenericCopy` de `@/lib/genericCopy`
- **Variables del context leídas**:
  - `primaryColor`, `secondaryColor` → colors
  - `businessName`, `industry` → copy generation
  - `designStyle` → style preset selection
  - `sections` → which sections to render
  - `mainCTA` → hero button label + link type
  - `features` → extras (whatsapp_button, google_maps, etc.)
  - `phone`, `email` → interactive links
  - `instagramUrl`, `facebookUrl`, `twitterUrl`, `socialMedia` → social indicators
  - `additionalContent` → extra content block
- **Funciones helper**:
  - `phoneDigits(phone)` → extrae solo dígitos
  - `buildWhatsAppUrl(phone)` → `wa.me/{digits}`
  - `buildCtaHref(cta, phone, email)` → URL apropiada según tipo de CTA
  - `getStylePreset(designStyle, primaryColor)` → `StylePreset` completo
  - `SectionTitle` — componente auxiliar con `headingClass` per-style
- **Secciones soportadas** (14): hero, servicios, proceso, sobre_mi, portafolio, testimonios, equipo, precios, faq, blog, estadísticas, clientes, contacto, ubicación

### `src/app/briefing/[type]/page.tsx` (EDITADO — Sesiones 1 y 2)
- **Propósito**: Página principal del briefing con form + preview
- **Componentes**: `BriefingFormContent` (layout), `FullscreenPreviewModal` (overlay)
- **Estados**: `showPreview`, `fullscreenPreview`, `error`
- **Modal**: ESC close + overlay click close + X button + stopPropagation en container
- **Preview**: Se renderiza sin props — lee del context

### `src/modules/briefingEngine/FieldRenderer.tsx` (EDITADO — Sesión 2)
- **Propósito**: Renderiza todos los tipos de campo dinámicamente
- **Fix aplicado**: Radio buttons con círculo lleno indigo + punto blanco
- **Helpers de sanitización**: `sanitizeText()`, `formatChileanPhone()`
- **Validadores**: `isValidEmail()`, `isValidPhone()`, `isValidUrl()`, `isValidColor()`

### `src/modules/briefingEngine/configs/landing.ts` (EDITADO — Sesiones 1 y 2)
- **Propósito**: Configuración completa del briefing tipo Landing Page
- **6 steps**: identity (8 fields), objective (4), sections (2), design (4), content (4), extras (7)
- **Campos nuevos (Sesión 2)**: `instagramUrl`, `facebookUrl`, `twitterUrl`
- **Campos mejorados (Sesión 2)**: `additionalContent`, `additionalNotes`
- **Opciones de sección**: Reordenadas para coincidir con SECTION_ORDER (Sesión 1)

### `src/modules/briefingEngine/context.tsx` (SIN CAMBIOS)
- Provider + hook para estado global del formulario

### `src/modules/briefingEngine/StepRenderer.tsx` (SIN CAMBIOS)
- Wrapper que renderiza fields del step actual

### `src/types/briefing.ts` (SIN CAMBIOS)
- Tipos: FieldType, FieldConfig, StepConfig, BriefingTypeConfig, FormData, BriefingRecord

---

## 6. Estilos de Diseño (Style Presets)

Cada estilo tiene una personalidad visual completamente diferente:

### 🌙 Oscuro
- Fondo: `bg-gray-950` | Texto: `text-white`
- Cards: `bg-white/5` con `border border-white/10` — sin sombra
- Headings: **MAYÚSCULAS**, tracking-wider, 9px
- Border radius: `rounded-lg` | Padding: `py-4 px-5`
- Overlay hero: gradiente con primaryColor al 30%

### ✨ Elegante
- Fondo: `bg-stone-50` | Texto: `text-stone-900`
- Cards: `bg-white` con `border border-stone-200` — sin sombra
- Headings: **MAYÚSCULAS**, tracking-[0.2em], **font-light**, 9px — estilo luxury
- Border radius: `rounded-sm` (bordes casi rectos) | Padding: `py-6 px-6`
- Font: `font-serif`

### ⬜ Minimalista
- Fondo: `bg-white` | Texto: `text-gray-800`
- Cards: `bg-gray-50/50` con `border border-gray-100` — sin sombra
- Headings: **minúsculas**, tracking-tight, **font-light**, 10px
- Border radius: `rounded-xl` (muy redondeado) | Padding: `py-6 px-8` (mucho aire)

### 🏢 Corporativo
- Fondo: `bg-slate-50` | Texto: `text-slate-900`
- Cards: `bg-white` con `border border-slate-200` + **shadow-md**
- Headings: **MAYÚSCULAS**, tracking-wide, **font-bold**, 9px — estilo enterprise
- Border radius: `rounded` (compacto) | Padding: `py-3 px-4` (denso)
- Overlay hero: gradiente slate oscuro fijo

### 🎨 Creativo
- Fondo: `bg-white` | Texto: `text-gray-900`
- Cards: `bg-gradient-to-br from-gray-50 to-white` con `border border-purple-100` + **shadow-lg shadow-purple-100/50**
- Headings: **font-extrabold**, 11px — máximo impacto
- Border radius: `rounded-2xl` (super redondeado) | Padding: `py-5 px-5`
- Overlay hero: gradiente primaryColor + purple

### ☀️ Cálido
- Fondo: `bg-amber-50/30` | Texto: `text-amber-950`
- Cards: `bg-white` con `border border-amber-100` + **shadow-sm shadow-amber-100**
- Headings: **font-medium**, 10px — suave y acogedor
- Border radius: `rounded-2xl` | Padding: `py-5 px-6`
- Overlay hero: gradiente primaryColor + amber

### 🔷 Moderno (Default)
- Fondo: `bg-white` | Texto: `text-gray-900`
- Cards: `bg-gray-50` sin border visible + **shadow-sm**
- Headings: **font-semibold**, 10px — equilibrado
- Border radius: `rounded-lg` | Padding: `py-4 px-5`
- Overlay hero: gradiente primaryColor suave

---

## 7. Sistema de Copy Genérico

### Flujo
```
Usuario selecciona industria "gastronomía"
                    ↓
getGenericCopy({ businessName: "Don Juan", industry: "gastronomia" })
                    ↓
Retorna SectionCopy con textos específicos de gastronomía
                    ↓
LiveLandingPreview usa copy.services, copy.aboutText, etc. en cada sección
```

### Industrias soportadas (13 + default)
| ID | Industria |
|----|-----------|
| gastronomia | Gastronomía / Restaurante |
| salud | Salud / Medicina |
| belleza | Belleza / Estética |
| educacion | Educación / Cursos |
| tecnologia | Tecnología / Software |
| inmobiliaria | Inmobiliaria / Bienes raíces |
| legal | Legal / Abogados |
| fitness | Fitness / Deporte |
| construccion | Construcción / Remodelación |
| consultoria | Consultoría / Asesoría |
| marketing | Marketing / Publicidad |
| automotriz | Automotriz |
| agricultura | Agricultura / Agro |
| _(default)_ | Fallback genérico profesional |

---

## 8. Estado Actual Completo

### ✅ Funcionalidades Implementadas
- [x] Formulario Landing Page de 6 pasos optimizados
- [x] Vista previa en vivo con texto genérico contextual (no skeleton bars)
- [x] Preview interactiva: CTAs, links de WhatsApp, email, teléfono funcionan
- [x] Modal fullscreen con 3 formas de cerrar (ESC, overlay click, botón X)
- [x] 7 estilos de diseño drásticamente diferentes
- [x] Color primario + secundario reactivos en tiempo real
- [x] 14 tipos de secciones soportadas con orden canónico
- [x] Campos de redes sociales (Instagram, Facebook, Twitter/X)
- [x] Copy específico por industria (13 industrias)
- [x] Radio buttons con estado visual claro (indigo lleno + punto blanco)
- [x] Panel admin seguro con filtros, estados y exportación (CSV/DOCX)
- [x] Seguridad reforzada (sanitización anti-XSS/SQLi)
- [x] UX de inputs perfeccionada (teléfono chileno, autofill dark mode)
- [x] 0 errores TypeScript

### ⚠️ Pendientes / Ideas Futuras
- [ ] Indicadores visuales de redes sociales en el footer del preview (badges IG/FB/X)
- [ ] Sección "Contenido Adicional" visible en preview cuando se escribe en `additionalContent`
- [ ] Blocks visuales en preview para extras (google_maps, formulario_contacto cuando no hay esa sección seleccionada)
- [ ] Drag & drop para reordenar secciones
- [ ] Previsualización móvil vs desktop
- [ ] Animaciones de entrada (scroll-triggered) en preview

---

## 9. Estructura de Archivos

```
FormularioPaginas/
├── contexto/
│   ├── context.md              ← Contexto histórico original del proyecto
│   └── README.md               ← README del repositorio
├── contextoCambios.md           ← ESTE ARCHIVO — registro completo de cambios
├── docker-compose.yml
├── Dockerfile
├── next.config.mjs
├── package.json
├── tailwind.config.ts
├── tsconfig.json
├── prisma/
│   └── schema.prisma
└── src/
    ├── app/
    │   ├── globals.css
    │   ├── layout.tsx
    │   ├── page.tsx                    ← Home page
    │   ├── admin/
    │   │   ├── page.tsx                ← Admin login
    │   │   └── dashboard/
    │   │       ├── page.tsx            ← Briefing list
    │   │       └── [id]/page.tsx       ← Briefing detail
    │   ├── api/
    │   │   ├── auth/route.ts
    │   │   └── briefings/
    │   │       ├── route.ts            ← CRUD briefings
    │   │       ├── [id]/route.ts       ← Single briefing
    │   │       └── export/
    │   │           ├── csv/route.ts
    │   │           └── docx/route.ts
    │   └── briefing/
    │       ├── [type]/page.tsx         ← ★ PÁGINA PRINCIPAL DEL FORMULARIO
    │       └── success/page.tsx
    ├── components/
    │   └── briefing/
    │       ├── LiveLandingPreview.tsx   ← ★ PREVIEW EN TIEMPO REAL
    │       └── StepIndicator.tsx
    ├── lib/
    │   ├── prisma.ts
    │   └── genericCopy.ts              ← ★ GENERADOR DE COPY (NUEVO)
    ├── modules/
    │   └── briefingEngine/
    │       ├── context.tsx              ← ★ ESTADO GLOBAL (React Context)
    │       ├── FieldRenderer.tsx        ← ★ RENDERIZADOR DE CAMPOS
    │       ├── StepRenderer.tsx
    │       ├── index.ts
    │       └── configs/
    │           └── landing.ts           ← ★ CONFIG DEL BRIEFING LANDING
    └── types/
        └── briefing.ts
```

---

## 10. Restricciones Técnicas

Reglas estrictas seguidas en todo el desarrollo:

1. **NO reescribir todo el proyecto** — solo correcciones quirúrgicas
2. **NO cambiar la arquitectura base** — mantener React Context + config-driven engine
3. **NO añadir librerías nuevas** — solo Lucide + lo existente
4. **Mantener TypeScript estricto** — 0 errores en compilación
5. **Single source of truth** — `LiveLandingPreview` SIEMPRE lee de `useBriefingForm()`, nunca de props
6. **Reactividad** — cualquier cambio en el formulario se refleja en la preview al instante

---

*Documento generado el 16 de Febrero de 2026. Cubre todas las sesiones de desarrollo y mejoras del proyecto FormularioPaginas.*
