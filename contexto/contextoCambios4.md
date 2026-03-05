# contextoCambios4.md — Sesión 4: Ecommerce, Contraste y Modelo de Precios

> **Proyecto**: FormularioPaginas  
> **Repositorio**: Lucas23-IECI/FormularioPaginas  
> **Rama**: main  
> **Fecha de sesión**: 5 de Marzo de 2026  
> **Stack**: Next.js 14 (App Router) · TypeScript · Tailwind CSS · Prisma 7 / Turso · Lucide React

---

## Índice

1. [Resumen de la Sesión](#1-resumen-de-la-sesión)
2. [Cambio 1: Briefing ECOMMERCE Completo (11 pasos)](#2-cambio-1-briefing-ecommerce-completo)
3. [Cambio 2: Preview Triple para Ecommerce](#3-cambio-2-preview-triple-para-ecommerce)
4. [Cambio 3: Motor de Precios Ecommerce](#4-cambio-3-motor-de-precios-ecommerce)
5. [Cambio 4: Contraste y Colores Hex en StylePresets](#5-cambio-4-contraste-y-colores-hex)
6. [Cambio 5: Navegación 3 Modos en Web Corporativa](#6-cambio-5-navegación-3-modos-web-corporativa)
7. [Cambio 6: Fix Contraste Navbar](#7-cambio-6-fix-contraste-navbar)
8. [Cambio 7: Modelo de Precios "Inicio + 5 Gratis"](#8-cambio-7-modelo-de-precios-inicio--5-gratis)
9. [Cambio 8: Badges de Extras Pagados (Ecommerce)](#9-cambio-8-badges-de-extras-pagados)
10. [Tipos Actualizados (briefing.ts)](#10-tipos-actualizados)
11. [Archivos Modificados — Lista Completa](#11-archivos-modificados)
12. [Estructura de Archivos Final](#12-estructura-de-archivos-final)
13. [Commits Realizados](#13-commits-realizados)
14. [Estado Actual del Proyecto](#14-estado-actual-del-proyecto)

---

## 1. Resumen de la Sesión

Se realizaron **3 grandes bloques de trabajo** en esta sesión:

| # | Bloque | Commits | Archivos | Líneas |
|---|--------|---------|----------|--------|
| 1 | **Briefing ECOMMERCE completo** | `500aeba` | 10 archivos | +2300 líneas |
| 2 | **Contraste de previews + Navegación 3 modos** | `963579c` | 4 archivos | +173 líneas |
| 3 | **Modelo de precios + badges pagados + fix navbar** | `4645f7f` | 6 archivos | +43 líneas |

**Total**: 3 commits, ~2500 líneas nuevas/modificadas en 14 archivos.

---

## 2. Cambio 1: Briefing ECOMMERCE Completo

### Archivo creado: `src/modules/briefingEngine/configs/ecommerce.ts` (800 líneas)

Se implementó un briefing completo para tiendas online con **11 pasos y ~55 campos**:

| Paso | ID | Campos | Descripción |
|------|----|--------|-------------|
| 1 | `identity` | businessName, businessType, description, logo | Identidad del negocio |
| 2 | `objective` | targetAudience, competitors, ecommerceType, toneOfVoice | Objetivo y mercado |
| 3 | `catalog` | productCount, productTypes, hasVariants, categories | Catálogo de productos |
| 4 | `pages` | pages (multiselect 12 opts), pagesDescription | Páginas del sitio |
| 5 | `payments` | paymentMethods, currency, pricing layout | Métodos de pago |
| 6 | `shipping` | shippingMethods, zones, trackingIntegration | Envíos y logística |
| 7 | `customers` | customerFeatures, accountType, inventoryLevel | Funciones de cliente |
| 8 | `design` | designStyle, primaryColor, hasDarkMode, layoutPreference | Estilo visual |
| 9 | `content` | hasPhotos, needsCopywriting, contentNotes | Contenido |
| 10 | `marketing` | marketingFeatures, socialPlatforms, seoLevel | Marketing y SEO |
| 11 | `extras` | ecommerceFeatures, hasDomain, deadline, notes | Extras y entrega |

### Páginas disponibles (12)
`inicio`, `catalogo`, `producto_detalle`, `carrito`, `checkout`, `cuenta_usuario`, `nosotros`, `contacto`, `blog`, `faq`, `politicas`, `tracking_pedidos`

### Funcionalidades por campo multiselect

**`customerFeatures`** (5 opciones — GRATIS):
- Historial de compras, múltiples direcciones, wishlist, puntos/fidelización, referidos

**`marketingFeatures`** (8 opciones — 💰 PAGADO):
- Newsletter, banners, analytics, SEO schema, redes sociales shop, carritos abandonados, cupones, referidos

**`ecommerceFeatures`** (11 opciones — 💰 PAGADO):
- Reseñas, comparador, zoom, productos relacionados, filtros avanzados, búsqueda inteligente, notificaciones stock, chat en vivo, multi-idioma, dark mode, PWA

---

## 3. Cambio 2: Preview Triple para Ecommerce

### Archivo creado: `src/components/briefing/LiveEcommercePreview.tsx` (917 líneas)

Preview en tiempo real con **3 modos de visualización**:

| Modo | Descripción | Qué muestra |
|------|-------------|-------------|
| 🏪 Tienda | Vista del storefront | Navbar, hero, grid de productos, footer |
| 🛒 Compra | Flujo de compra | Detalle de producto → Carrito → Checkout |
| 🗺️ Sitemap | Mapa del sitio | Diagrama visual de todas las páginas |

### Características del preview
- Adapta colores al `designStyle` seleccionado (7 presets)
- Muestra productos ficticios con precios, badges de descuento
- Refleja métodos de pago, envío y features seleccionados
- Modo dark toggle funcional
- Compatible con modal fullscreen

### Funciones de rendering por página
Cada página tiene su propia función de renderizado:
- `renderInicio()` — Hero + grid de productos destacados
- `renderCatalogo()` — Grid de productos con filtros laterales
- `renderProductoDetalle()` — Imagen + info + botón comprar
- `renderCarrito()` — Lista de items + resumen
- `renderCheckout()` — Formulario de pago con métodos
- `renderCuentaUsuario()` — Panel con pedidos, direcciones, wishlist
- `renderNosotros()` — Historia, misión, equipo
- `renderContacto()` — Formulario + datos de contacto
- `renderBlog()` — Grid de artículos
- `renderFAQ()` — Acordeón de preguntas
- `renderPoliticas()` — Tabs (privacidad, devoluciones, envíos)
- `renderTracking()` — Buscador de pedido + timeline

---

## 4. Cambio 3: Motor de Precios Ecommerce

### Archivo modificado: `src/lib/pricingEngine.ts` (433 líneas, +332 líneas)

Se expandió el motor de precios para soportar ECOMMERCE con un **precio base de 400,000 CLP**.

### Tablas de precios Ecommerce

| Categoría | Ejemplo | Precio |
|-----------|---------|--------|
| **Páginas base** | inicio, catálogo, producto, carrito, checkout | Incluidas |
| **Páginas extra** | blog, FAQ, políticas, tracking | $15,000 - $25,000 c/u |
| **Métodos de pago** | MercadoPago, WebPay, PayPal | $20,000 - $40,000 c/u |
| **Envíos** | Retiro, delivery local, Starken/Chilexpress | $15,000 - $30,000 c/u |
| **Features cliente** | Wishlist, puntos, referidos | $20,000 - $35,000 c/u |
| **Marketing** | Newsletter, analytics, SEO, carritos abandonados | $15,000 - $40,000 c/u |
| **Features extra** | Chat, multi-idioma, dark mode, PWA | $20,000 - $60,000 c/u |

### Archivos de soporte actualizados

- **`src/lib/valueLabels.ts`** (+178 líneas): Labels legibles para ~80 valores de ecommerce
- **`src/lib/generateClientEmailHtml.ts`** (+92 líneas): Sección "Tu Tienda Online" en el email del cliente
- **`src/app/admin/dashboard/[id]/page.tsx`** (+38 líneas): Labels de campos ecommerce en admin
- **`src/app/page.tsx`**: Se removió ECOMMERCE de `comingSoon`, ahora habilitado
- **`src/app/briefing/[type]/page.tsx`**: Se agregó import de `LiveEcommercePreview`

---

## 5. Cambio 4: Contraste y Colores Hex en StylePresets

### Archivo modificado: `src/lib/stylePresets.ts` (184 líneas, +55 líneas)

#### Problema detectado
El preview de Ecommerce usaba strings de clases Tailwind (ej: `"text-gray-900"`) directamente en atributos `style={{ color }}` de React — lo cual es **CSS inválido** porque `style.color` espera un valor hex/rgb, no una clase Tailwind.

#### Solución implementada

**1. Propiedades hex añadidas a `StylePreset`:**
```typescript
export interface StylePreset {
    // ... propiedades existentes (bg, text, subtext, etc.)
    // Nuevas — hex para usar en inline styles
    bgHex: string;      // ej: "#ffffff"
    textHex: string;    // ej: "#111827"
    subtextHex: string; // ej: "#6b7280"
    cardHex: string;    // ej: "#f9fafb"
    dividerHex: string; // ej: "#e5e7eb"
}
```

**2. Utilidad `contrastColor()` añadida:**
```typescript
export function contrastColor(hex: string): string {
    // Calcula luminancia WCAG y retorna negro o blanco
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    return luminance > 0.5 ? "#111827" : "#ffffff";
}
```

**3. Constante `readableTextShadow` añadida:**
```typescript
export const readableTextShadow = "0 1px 4px rgba(0,0,0,0.6)";
```

**4. Valores hex por cada preset:**

| Preset | bgHex | textHex | subtextHex | cardHex | dividerHex |
|--------|-------|---------|------------|---------|------------|
| moderno (default) | #ffffff | #111827 | #6b7280 | #f9fafb | #e5e7eb |
| oscuro | #030712 | #ffffff | #9ca3af | #111827 | #1f2937 |
| elegante | #fafaf9 | #292524 | #78716c | #f5f5f4 | #e7e5e4 |
| minimalista | #ffffff | #18181b | #71717a | #fafafa | #e4e4e7 |
| corporativo | #f8fafc | #0f172a | #64748b | #f1f5f9 | #e2e8f0 |
| creativo | #fdf4ff | #581c87 | #a855f7 | #faf5ff | #e9d5ff |
| calido | #fffbeb | #78350f | #d97706 | #fef3c7 | #fde68a |

---

## 6. Cambio 5: Navegación 3 Modos en Web Corporativa

### Archivo modificado: `src/components/briefing/LiveWebCorporativaPreview.tsx` (886 líneas, +126 líneas)

#### Antes
La preview de Web Corporativa tenía solo 2 modos:
- **Toggle simple**: Páginas ↔ Mapa del Sitio

#### Después
Se agregó un **3er modo "Navegación simulada"** con barra de 3 tabs:

| Modo | Icono | Descripción |
|------|-------|-------------|
| Páginas | `LayoutGrid` | Vista por tabs, igual que antes |
| Navegación | `Navigation` | Navegación secuencial con breadcrumb |
| Mapa del Sitio | `Map` | Diagrama visual del sitemap |

#### Código de la barra de tabs
```tsx
<div className="flex gap-1 p-1 bg-white/5 rounded-lg">
    {[
        { id: "tabs", icon: LayoutGrid, label: "Páginas" },
        { id: "navigation", icon: Navigation, label: "Navegación" },
        { id: "sitemap", icon: Map, label: "Mapa del Sitio" },
    ].map(mode => (
        <button key={mode.id} onClick={() => setViewMode(mode.id)} ...>
            <mode.icon size={10} />
            <span>{mode.label}</span>
        </button>
    ))}
</div>
```

#### Modo Navegación (`renderNavigationView`)
- **Breadcrumb trail** sticky en la parte superior
- Navegación con botones "Anterior" / "Siguiente"
- Indicador de posición: `"2 / 5"`
- Cada página se renderiza individualmente (reutiliza `PAGE_RENDERERS`)

#### Fix de contraste en hero
- Texto del hero ahora es **siempre blanco** con `textShadow: readableTextShadow`
- Aplica tanto en Web Corporativa como en Landing preview

---

## 7. Cambio 6: Fix Contraste Navbar

### Archivo modificado: `src/components/briefing/LiveWebCorporativaPreview.tsx`

#### Problema
Los tabs inactivos del navbar usaban `${textClass}` (clase Tailwind como `text-gray-900`) que a tamaño `text-[8px]` eran invisibles sobre fondo blanco. El breadcrumb de navegación tenía el mismo problema con `${subtextClass}`.

#### Antes (roto)
```tsx
// Navbar tabs inactivos
className={`... ${textClass} hover:bg-black/5 ...`}
style={activePage === page ? { backgroundColor: accentColor } : {}}

// Breadcrumb items visitados
className={`... ${subtextClass} hover:underline`}
style={i === navPageIndex ? { color: accentColor } : {}}
```

#### Después (arreglado)
```tsx
// Navbar tabs inactivos — usa style.textHex directamente
className={`... hover:bg-black/5 ...`}
style={activePage === page ? { backgroundColor: accentColor } : { color: style.textHex }}

// Breadcrumb items visitados — usa style.subtextHex directamente
className={`... hover:underline`}
style={i === navPageIndex ? { color: accentColor } : { color: style.subtextHex }}

// ChevronRight del breadcrumb
<ChevronRight size={8} className="flex-shrink-0" style={{ color: style.subtextHex }} />
```

**La clave**: se removió la clase Tailwind de color del `className` y se movió a `style={{ color: style.textHex }}` que usa un valor hex real. Esto garantiza contraste visible sin importar el preset de diseño.

---

## 8. Cambio 7: Modelo de Precios "Inicio + 5 Gratis"

### Regla de negocio
**Todos los tipos de briefing** incluyen 6 páginas/secciones gratis (Inicio + 5 a elección). Cada página o sección adicional tiene costo extra.

### Implementación

#### 1. Nueva propiedad `maxFree` en `FieldConfig` (`src/types/briefing.ts`)
```typescript
export interface FieldConfig {
    // ... propiedades existentes
    maxFree?: number;    // Cantidad incluida sin costo
    paidBadge?: string;  // Texto del badge de "pagado"
}
```

#### 2. Se configuró `maxFree: 6` en los 3 configs

**Web Corporativa** (`configs/webCorporativa.ts`):
```typescript
{
    id: "pages",
    type: "multiselect",
    maxFree: 6,
    helperText: "Inicio + 5 páginas incluidas. Cada página adicional tiene costo extra",
    options: [/* 10 opciones */],
}
```

**Ecommerce** (`configs/ecommerce.ts`):
```typescript
{
    id: "pages",
    type: "multiselect",
    maxFree: 6,
    helperText: "Inicio + 5 páginas incluidas. Cada página adicional tiene costo extra",
    options: [/* 12 opciones */],
}
```

**Landing** (`configs/landing.ts`):
```typescript
{
    id: "sections",
    type: "multiselect",
    maxFree: 6,
    helperText: "Inicio + 5 secciones incluidas. Cada sección adicional tiene costo extra",
    options: [/* 14 opciones */],
}
```

#### 3. Nota visual dinámica en FieldRenderer (`src/modules/briefingEngine/FieldRenderer.tsx`)

Debajo del grid de opciones multiselect, se muestra una nota que cambia según la selección:

**Dentro del límite (verde):**
```
✅ Has seleccionado 4 de 6 incluidas.
```

**Excede el límite (ámbar):**
```
⚠️ Has seleccionado 8. Las primeras 6 están incluidas, cada adicional tiene costo extra.
```

Código implementado:
```tsx
{field.maxFree && (() => {
    const count = Array.isArray(value) ? value.length : 0;
    const over = count > field.maxFree!;
    return (
        <div className={`flex items-start gap-2 px-3 py-2 rounded-lg text-sm ${
            over
                ? "bg-amber-500/10 border border-amber-500/30 text-amber-300"
                : "bg-emerald-500/10 border border-emerald-500/30 text-emerald-300"
        }`}>
            <span>{over ? "⚠️" : "✅"}</span>
            <span>
                {over
                    ? `Has seleccionado ${count}. Las primeras ${field.maxFree} están incluidas, cada adicional tiene costo extra.`
                    : `Has seleccionado ${count} de ${field.maxFree} incluidas.`
                }
            </span>
        </div>
    );
})()}
```

---

## 9. Cambio 8: Badges de Extras Pagados (Ecommerce)

### Campos marcados como pagados

Solo **2 de los 3** multiselects de features del ecommerce tienen costo adicional:

| Campo | `paidBadge` | Estado |
|-------|-------------|--------|
| `ecommerceFeatures` | "💰 Cada funcionalidad extra tiene costo adicional" | ✅ Pagado |
| `marketingFeatures` | "💰 Cada herramienta de marketing tiene costo adicional" | ✅ Pagado |
| `customerFeatures` | — (sin badge) | 🆓 Incluido |

### Renderizado del badge
Se muestra un banner ámbar fijo debajo de las opciones:
```tsx
{field.paidBadge && (
    <div className="flex items-start gap-2 px-3 py-2 rounded-lg text-sm 
         bg-amber-500/10 border border-amber-500/30 text-amber-300">
        <span>{field.paidBadge}</span>
    </div>
)}
```

---

## 10. Tipos Actualizados

### `src/types/briefing.ts` (78 líneas) — Estado actual completo

```typescript
export type FieldType =
    | "text" | "email" | "tel" | "url" | "textarea"
    | "select" | "multiselect" | "checkbox" | "color" | "file" | "radio";

export interface FieldOption {
    value: string;
    label: string;
}

export interface FieldConfig {
    id: string;
    label: string;
    type: FieldType;
    placeholder?: string;
    required?: boolean;
    options?: FieldOption[];
    helperText?: string;
    maxFree?: number;      // ← NUEVO: cantidad incluida sin costo
    paidBadge?: string;    // ← NUEVO: texto del badge de "pagado"
    validation?: { min?: number; max?: number; pattern?: string; message?: string; };
    dataGroup: "contact" | "content" | "design" | "extra";
}

export interface StepConfig {
    id: string;
    title: string;
    description: string;
    icon: string;
    fields: FieldConfig[];
}

export interface BriefingTypeConfig {
    id: string;
    type: BriefingType;
    label: string;
    description: string;
    icon: string;
    steps: StepConfig[];
    enabled: boolean;
}

export type BriefingType = "LANDING" | "WEB_CORPORATIVA" | "ECOMMERCE";
```

---

## 11. Archivos Modificados — Lista Completa

### Archivos CREADOS en esta sesión (2)
| Archivo | Líneas | Descripción |
|---------|--------|-------------|
| `src/components/briefing/LiveEcommercePreview.tsx` | 917 | Preview triple de ecommerce |
| `src/modules/briefingEngine/configs/ecommerce.ts` | 800 | Config de 11 pasos ecommerce |

### Archivos MODIFICADOS en esta sesión (12)
| Archivo | Líneas | Cambios |
|---------|--------|---------|
| `src/lib/pricingEngine.ts` | 433 | +332: tablas de precios ecommerce |
| `src/lib/valueLabels.ts` | 321 | +178: labels para valores ecommerce |
| `src/lib/generateClientEmailHtml.ts` | 317 | +92: sección ecommerce en email |
| `src/lib/stylePresets.ts` | 184 | +55: hex colors, contrastColor(), readableTextShadow |
| `src/components/briefing/LiveWebCorporativaPreview.tsx` | 886 | +126: modo navegación + contrast fixes |
| `src/components/briefing/LiveLandingPreview.tsx` | — | fix hero text contrast |
| `src/components/briefing/LiveEcommercePreview.tsx` | 917 | fix palette helpers (hex vs Tailwind) |
| `src/modules/briefingEngine/FieldRenderer.tsx` | 419 | +28: pricing notes en multiselect |
| `src/modules/briefingEngine/index.ts` | — | import ecommerce config |
| `src/app/admin/dashboard/[id]/page.tsx` | — | +38: labels ecommerce en admin |
| `src/app/briefing/[type]/page.tsx` | — | import LiveEcommercePreview |
| `src/app/page.tsx` | — | habilitar ECOMMERCE, remover comingSoon |
| `src/types/briefing.ts` | 78 | +2: maxFree, paidBadge |
| `src/modules/briefingEngine/configs/webCorporativa.ts` | 370 | maxFree: 6, helperText actualizado |
| `src/modules/briefingEngine/configs/ecommerce.ts` | 800 | maxFree: 6, paidBadge en 2 campos |
| `src/modules/briefingEngine/configs/landing.ts` | 372 | maxFree: 6, helperText actualizado |

---

## 12. Estructura de Archivos Final

```
src/
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   ├── page.tsx                              ← Homepage (3 tipos habilitados)
│   ├── admin/
│   │   ├── page.tsx                          ← Login admin
│   │   └── dashboard/
│   │       ├── page.tsx                      ← Lista de briefings
│   │       └── [id]/page.tsx                 ← Detalle de briefing
│   ├── api/
│   │   ├── auth/route.ts                     ← Auth admin
│   │   ├── briefings/
│   │   │   ├── route.ts                      ← GET/POST briefings
│   │   │   ├── [id]/route.ts                 ← GET/PATCH/DELETE individual
│   │   │   ├── submit/route.ts               ← Submit público (crea + email)
│   │   │   └── export/
│   │   │       ├── csv/route.ts              ← Exportar CSV
│   │   │       └── docx/route.ts             ← Exportar Word
│   └── briefing/
│       ├── [type]/page.tsx                   ← Formulario dinámico
│       └── success/page.tsx                  ← Página de éxito
├── components/briefing/
│   ├── LiveLandingPreview.tsx                ← Preview landing (1 modo)
│   ├── LiveWebCorporativaPreview.tsx         ← Preview corp (3 modos)
│   ├── LiveEcommercePreview.tsx              ← Preview ecommerce (3 modos)
│   ├── PriceSummary.tsx                      ← Resumen de precios
│   └── StepIndicator.tsx                     ← Barra de progreso
├── lib/
│   ├── prisma.ts                             ← Cliente Prisma (Turso / SQLite)
│   ├── stylePresets.ts                       ← 7 presets de diseño + hex + contrast
│   ├── pricingEngine.ts                      ← Motor de precios (3 tipos)
│   ├── valueLabels.ts                        ← Labels legibles para exports
│   ├── genericCopy.ts                        ← Copy genérico para previews
│   ├── emailService.ts                       ← Servicio de email (Resend + Nodemailer)
│   ├── generateEmailHtml.ts                  ← Email HTML admin
│   ├── generateClientEmailHtml.ts            ← Email HTML cliente
│   ├── generateDocx.ts                       ← Generador Word
│   └── generateXlsx.ts                       ← Generador Excel
├── modules/briefingEngine/
│   ├── index.ts                              ← Registry (3 configs)
│   ├── context.tsx                           ← Provider + hook
│   ├── StepRenderer.tsx                      ← Renderizador de pasos
│   ├── FieldRenderer.tsx                     ← Renderizador de campos + pricing
│   └── configs/
│       ├── landing.ts                        ← 7 pasos, 14 secciones, maxFree: 6
│       ├── webCorporativa.ts                 ← 6 pasos, 10 páginas, maxFree: 6
│       └── ecommerce.ts                      ← 11 pasos, 12 páginas, maxFree: 6
└── types/
    └── briefing.ts                           ← Tipos core + maxFree + paidBadge
```

---

## 13. Commits Realizados

| # | Hash | Mensaje | Fecha |
|---|------|---------|-------|
| 1 | `500aeba` | `feat: add ECOMMERCE briefing type (11 steps, triple preview, pricing)` | 5 Mar 2026 16:01 |
| 2 | `963579c` | `fix: preview contrast & 3-mode navigation for Web Corporativa` | 5 Mar 2026 16:38 |
| 3 | `4645f7f` | `fix: navbar contrast + pricing model (6 free pages/sections) + paid badges` | 5 Mar 2026 17:17 |

---

## 14. Estado Actual del Proyecto

### Tipos de briefing habilitados

| Tipo | Config | Preview | Pricing | Admin | Email | Estado |
|------|--------|---------|---------|-------|-------|--------|
| Landing Page | ✅ 7 pasos | ✅ 1 modo | ✅ Base 100k | ✅ | ✅ | **Producción** |
| Web Corporativa | ✅ 6 pasos | ✅ 3 modos | ✅ Base 150k | ✅ | ✅ | **Producción** |
| Ecommerce | ✅ 11 pasos | ✅ 3 modos | ✅ Base 400k | ✅ | ✅ | **Producción** |

### Modelo de precios

- **Landing**: Inicio + 5 secciones gratis (14 disponibles), adicionales se cobran
- **Web Corporativa**: Inicio + 5 páginas gratis (10 disponibles), adicionales se cobran
- **Ecommerce**: Inicio + 5 páginas gratis (12 disponibles), adicionales se cobran
- **Ecommerce extras pagados**: `ecommerceFeatures` y `marketingFeatures` marcados con badge 💰
- **Ecommerce included**: `customerFeatures` no tiene costo adicional

### Presets de diseño (compartidos por los 3 tipos)
`moderno` (default), `oscuro`, `elegante`, `minimalista`, `corporativo`, `creativo`, `calido`

### Deploy
- **URL**: `https://formulario-paginas.vercel.app`
- **DB**: Turso (libSQL, AWS US East 1)
- **Email**: Resend (fallback Nodemailer/Gmail)

### Próximos pasos posibles
- Integración con motor de precios para que `maxFree` se refleje en `pricingEngine.ts`
- Modo de preview para Landing con múltiples vistas (actualmente solo 1)
- Tests automatizados
- Validaciones de campos condicionales (mostrar/ocultar según respuestas)
