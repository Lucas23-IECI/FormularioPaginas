# contextoCambios2.md — Sesión 3: Preview Avanzado, Email, Word y Excel

> **Proyecto**: FormularioPaginas  
> **Repositorio**: Lucas23-IECI/FormularioPaginas  
> **Rama actual**: master | **Rama base**: main  
> **Fecha de sesión**: 16 de Febrero de 2026  
> **Stack**: Next.js 14 (App Router) · TypeScript · Tailwind CSS · Prisma/SQLite · Lucide React · Nodemailer · ExcelJS · docx

---

## Índice

1. [Resumen de la Sesión](#1-resumen-de-la-sesión)
2. [Diagnóstico Previo](#2-diagnóstico-previo)
3. [Cambio 1: WhatsApp en Preview (Header + Footer)](#3-cambio-1-whatsapp-en-preview)
4. [Cambio 2: Extras se Reflejan Instantáneamente en Preview](#4-cambio-2-extras-sync-instantáneo)
5. [Cambio 3: Scroll Inteligente en Preview](#5-cambio-3-scroll-inteligente)
6. [Cambio 4: Flotantes de Redes Sociales Completos](#6-cambio-4-flotantes-de-redes-sociales)
7. [Cambio 5: API de Submit con Email + Documentos](#7-cambio-5-api-de-submit)
8. [Cambio 6: Generación de Word (.docx)](#8-cambio-6-generación-de-word)
9. [Cambio 7: Generación de Excel (.xlsx)](#9-cambio-7-generación-de-excel)
10. [Cambio 8: Email HTML Profesional](#10-cambio-8-email-html-profesional)
11. [Cambio 9: Configuración de Correo (.env)](#11-cambio-9-configuración-env)
12. [Cambio 10: Wiring del Submit en Context](#12-cambio-10-wiring-del-submit)
13. [Dependencias Nuevas Instaladas](#13-dependencias-nuevas)
14. [Archivos Modificados — Lista Completa](#14-archivos-modificados)
15. [Archivos Creados — Lista Completa](#15-archivos-creados)
16. [Código Completo de Cada Archivo Nuevo](#16-código-completo-archivos-nuevos)
17. [Cambios Exactos en Archivos Existentes](#17-cambios-exactos-archivos-existentes)
18. [Estructura de Archivos Final](#18-estructura-de-archivos-final)
19. [Flujo Completo del Sistema Tras Cambios](#19-flujo-completo)
20. [Nota Importante sobre Gmail](#20-nota-gmail)

---

## 1. Resumen de la Sesión

Se implementaron **10 mejoras críticas** sobre el sistema de briefing:

| # | Mejora | Estado |
|---|--------|--------|
| 1 | WhatsApp visible en preview (header + footer) | ✅ Implementado |
| 2 | Extras se reflejan instantáneamente en preview | ✅ Verificado y mejorado |
| 3 | Scroll inteligente al activar secciones/extras | ✅ Implementado |
| 4 | Flotantes multi-red con ocultamiento antes del footer | ✅ Implementado |
| 5 | API `/api/briefings/submit` completa | ✅ Creado |
| 6 | Generación profesional de Word (.docx) | ✅ Creado |
| 7 | Generación profesional de Excel (.xlsx) | ✅ Creado |
| 8 | Email HTML profesional con resumen detallado | ✅ Creado |
| 9 | Configuración de correo vía .env | ✅ Configurado |
| 10 | Submit redirigido a nuevo endpoint | ✅ Wired |

---

## 2. Diagnóstico Previo

### Estado antes de los cambios:

**Preview (`LiveLandingPreview.tsx`)**:
- IG y FB aparecían en el footer del preview, pero **WhatsApp NO** tenía icono visual
- Los extras (`features` multiselect) se leían del estado correctamente, pero el **botón flotante solo mostraba WhatsApp** (sin otras redes)
- **No existía scroll automático** al activar/desactivar secciones
- El floating button **no se ocultaba** al acercarse al footer

**Submit (`context.tsx`)**:
- `submitForm()` hacía `POST /api/briefings` que **solo guardaba en la base de datos**
- **No generaba documentos** (Word/Excel)
- **No enviaba correos** a nadie
- No existía nodemailer ni exceljs en las dependencias

**Archivos de exportación existentes**:
- `src/app/api/briefings/export/docx/route.ts` — exportación admin-only (GET con auth header)
- `src/app/api/briefings/export/csv/route.ts` — exportación CSV admin-only
- Estos NO se activaban al enviar el formulario

---

## 3. Cambio 1: WhatsApp en Preview

### Archivo: `src/components/briefing/LiveLandingPreview.tsx`

### Qué se hizo:
1. Se agregaron imports de `Instagram`, `Facebook`, `Twitter` de lucide-react
2. Se agregó función `normalizePhone()` que limpia el número (quita espacios, +, -, paréntesis)
3. Se agregó barra de iconos sociales en el **Hero header** del preview
4. Se agregó WhatsApp al **footer** del preview junto a las demás redes

### Imports añadidos:
```typescript
// ANTES
import React from "react";
// ...sin Instagram, Facebook, Twitter

// DESPUÉS
import React, { useRef, useEffect, useState, useCallback } from "react";
// ...
import {
    // ... existentes ...
    Instagram,
    Facebook,
    Twitter,
} from "lucide-react";
```

### Función nueva:
```typescript
function normalizePhone(phone: string): string {
    return phone.replace(/[\s+\-()]/g, "");
}
```

### En el Hero del preview (nuevo bloque antes del `<h3>` del business name):
```tsx
{/* Social icons bar in hero header */}
{(hasSocial || features.includes("redes_sociales")) && (
    <div className="flex items-center gap-1.5 mb-2">
        {normalizedPhone && (
            <a href={`https://wa.me/${normalizedPhone}`} target="_blank" rel="noopener noreferrer"
               className="w-5 h-5 rounded-full flex items-center justify-center hover:scale-110 transition-transform no-underline"
               style={{ backgroundColor: "#25D366" }} title="WhatsApp">
                <MessageCircle size={10} className="text-white" />
            </a>
        )}
        {instagramUrl && (
            <a href={...} className="w-5 h-5 rounded-full bg-pink-500 ..." title="Instagram">
                <Instagram size={10} className="text-white" />
            </a>
        )}
        {facebookUrl && (
            <a href={...} className="w-5 h-5 rounded-full bg-blue-600 ..." title="Facebook">
                <Facebook size={10} className="text-white" />
            </a>
        )}
        {twitterUrl && (
            <a href={...} className="w-5 h-5 rounded-full bg-gray-800 ..." title="X / Twitter">
                <Twitter size={10} className="text-white" />
            </a>
        )}
    </div>
)}
```

### En el Footer (reemplazó texto "IG", "FB", "X" por iconos SVG):
```tsx
{normalizedPhone && (
    <a href={`https://wa.me/${normalizedPhone}`} ...>
        <MessageCircle size={8} className="text-white" />
    </a>
)}
{(instagramUrl || features.includes("redes_sociales")) && (
    <a href={...}><Instagram size={8} /></a>
)}
{(facebookUrl || features.includes("redes_sociales")) && (
    <a href={...}><Facebook size={8} /></a>
)}
{(twitterUrl || features.includes("redes_sociales")) && (
    <a href={...}><Twitter size={8} /></a>
)}
```

### Lógica de links:
- WhatsApp: `https://wa.me/{normalizedPhone}` — solo si existe teléfono
- Instagram: si empieza con `http` → usa directo, si no → `https://instagram.com/{handle sin @}`
- Facebook: si empieza con `http` → usa directo, si no → `https://facebook.com/{handle}`
- Twitter: si empieza con `http` → usa directo, si no → `https://x.com/{handle sin @}`
- `target="_blank"` + `rel="noopener noreferrer"` en todos

---

## 4. Cambio 2: Extras Sync Instantáneo

### Diagnóstico:
El estado ya era correcto (Single Source of Truth via React Context useState). Los extras (`features`) **sí** se leían del context en `LiveLandingPreview`. El problema no era de estado doble.

### Mejoras realizadas:
1. Se agregaron **refs** (`sectionRefs`) a cada sección extra para scroll targeting
2. Se verificó que `whatsapp_button`, `google_maps`, y `formulario_contacto` se renderizaban condicionalmente basándose en `features.includes("...")` — ya funcionaba

### Refs añadidos a secciones de extras:
```tsx
{features.includes("google_maps") && !activeSections.includes("ubicacion") && (
    <div ref={(el) => { sectionRefs.current["google_maps"] = el; }} className={...}>
        {/* ... mapa ... */}
    </div>
)}
{features.includes("formulario_contacto") && !activeSections.includes("contacto") && (
    <div ref={(el) => { sectionRefs.current["formulario_contacto"] = el; }} className={...}>
        {/* ... formulario ... */}
    </div>
)}
```

---

## 5. Cambio 3: Scroll Inteligente

### Archivo: `src/components/briefing/LiveLandingPreview.tsx`

### Implementación:
Se usan refs por sección + detección de secciones nuevas vs anteriores para hacer `scrollIntoView` automáticamente.

```typescript
// Refs para scroll
const scrollContainerRef = useRef<HTMLDivElement>(null);
const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
const prevSectionsRef = useRef<string[]>([]);
const prevFeaturesRef = useRef<string[]>([]);

// useEffect que detecta secciones/extras nuevos
useEffect(() => {
    const prevSections = prevSectionsRef.current;
    const prevFeatures = prevFeaturesRef.current;

    // Busca la primera sección nueva que no estaba antes
    const newSection = sections.find(s => !prevSections.includes(s));
    const newFeature = features.find(f => !prevFeatures.includes(f));

    const scrollTarget = newSection || newFeature;
    if (scrollTarget && sectionRefs.current[scrollTarget]) {
        setTimeout(() => {
            sectionRefs.current[scrollTarget]?.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });
        }, 100);
    }

    prevSectionsRef.current = [...sections];
    prevFeaturesRef.current = [...features];
}, [sections, features]);
```

### Refs asignados a secciones dinámicas:
```tsx
{activeSections.filter(s => s !== "hero").map((section) => (
    <div
        key={section}
        ref={(el) => { sectionRefs.current[section] = el; }}
        className={...}
    >
```

### Ref del hero:
```tsx
<div
    ref={(el) => { sectionRefs.current["hero"] = el; }}
    className="relative overflow-hidden transition-all duration-300"
>
```

### Ref del contenedor scrollable:
```tsx
<div ref={scrollContainerRef} className={`${bgClass} overflow-y-auto ...`} style={{ maxHeight: "500px" }}>
```

### Comportamiento:
- Activas "Mapa" → preview baja automáticamente hasta el mapa
- Activas "FAQ" → preview baja hasta FAQ
- Desactivas → scroll no cambia (se queda donde estaba)
- Solo afecta el contenedor del preview, **NO** la página principal
- `behavior: "smooth"` para animación suave
- `block: "center"` para centrar la sección en el viewport del preview

---

## 6. Cambio 4: Flotantes de Redes Sociales

### Archivo: `src/components/briefing/LiveLandingPreview.tsx`

### ANTES:
Solo existía un botón flotante de WhatsApp:
```tsx
{features.includes("whatsapp_button") && (
    <a href={buildWhatsAppUrl(phone)} className="absolute bottom-4 right-4 w-10 h-10 rounded-full ..."
       style={{ backgroundColor: "#25D366" }}>
        <MessageCircle size={18} className="text-white" />
    </a>
)}
```

### DESPUÉS:
Stack vertical completo de todas las redes que tengan datos + ocultamiento antes del footer:

```tsx
{/* Floating social buttons stack — hides near footer */}
{features.includes("whatsapp_button") && showFloating && (
    <div className="absolute bottom-4 right-4 flex flex-col-reverse items-center gap-2 transition-opacity duration-300"
         style={{ opacity: showFloating ? 1 : 0 }}>
        {/* WhatsApp — principal, más grande */}
        {normalizedPhone ? (
            <a href={`https://wa.me/${normalizedPhone}`} target="_blank"
               className="w-10 h-10 rounded-full ..." style={{ backgroundColor: "#25D366" }}>
                <MessageCircle size={18} className="text-white" />
            </a>
        ) : (
            <div className="w-10 h-10 rounded-full ..." style={{ backgroundColor: "#25D366" }}>
                <MessageCircle size={18} className="text-white" />
            </div>
        )}
        {/* Instagram — si existe URL */}
        {instagramUrl && (
            <a href={...} className="w-8 h-8 rounded-full bg-pink-500 ...">
                <Instagram size={14} className="text-white" />
            </a>
        )}
        {/* Facebook — si existe URL */}
        {facebookUrl && (
            <a href={...} className="w-8 h-8 rounded-full bg-blue-600 ...">
                <Facebook size={14} className="text-white" />
            </a>
        )}
        {/* Twitter/X — si existe URL */}
        {twitterUrl && (
            <a href={...} className="w-8 h-8 rounded-full bg-gray-800 ...">
                <Twitter size={14} className="text-white" />
            </a>
        )}
    </div>
)}
```

### Ocultamiento antes del footer (detección por scroll):
```typescript
const footerRef = useRef<HTMLDivElement>(null);
const [showFloating, setShowFloating] = useState(true);

const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    const footer = footerRef.current;
    if (!container || !footer) { setShowFloating(true); return; }
    const containerRect = container.getBoundingClientRect();
    const footerRect = footer.getBoundingClientRect();
    // Oculta cuando el footer está a menos de 60px del borde inferior del contenedor
    const threshold = 60;
    setShowFloating(footerRect.top - containerRect.bottom > -threshold);
}, []);

useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
}, [handleScroll]);
```

### Ref del footer:
```tsx
<div ref={footerRef} className="px-6 py-3 text-center ..." style={{ backgroundColor: `${accentColor}10` }}>
```

### Diseño:
- WhatsApp: 40x40px, color #25D366 (verde WhatsApp oficial)
- Otras redes: 32x32px (más pequeñas que WA)
- `flex-col-reverse` para que WhatsApp quede abajo (más accesible)
- `hover:scale-110 transition-transform` en todas
- `target="_blank"` en todas

---

## 7. Cambio 5: API de Submit

### Archivo nuevo: `src/app/api/briefings/submit/route.ts`

### Flujo completo:
```
POST /api/briefings/submit
    ├── Validar inputs (type, clientName, email format)
    ├── Sanitizar datos (anti-XSS, anti-SQLi)
    ├── Guardar en DB (Prisma)
    ├── Generar Word (.docx) en memoria
    ├── Generar Excel (.xlsx) en memoria
    ├── Generar HTML del email
    ├── Enviar email al admin (paginasmendezrisopatron@gmail.com)
    │   └── Con adjuntos: briefing.docx + briefing.xlsx
    ├── Enviar email al cliente (email ingresado)
    │   └── Con adjuntos: briefing.docx + briefing.xlsx
    └── Retornar { id, status: "created", emailSent: boolean }
```

### Dependencias usadas:
- `nodemailer` — envío de correo Gmail
- `docx` (Packer) — generación Word
- `exceljs` — generación Excel
- `prisma` — guardado en DB

### Sanitización:
Misma lógica de seguridad que `POST /api/briefings`:
- Strip HTML tags
- Remove `javascript:` URIs
- Remove `onEvent=` handlers
- Remove SQL keywords (SELECT, INSERT, DROP, etc.)
- Remove SQL comment patterns
- Remove null bytes
- Trim + max length

### Email config:
```typescript
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});
```

### Adjuntos:
```typescript
const attachments = [
    {
        filename: `briefing-${businessName.toLowerCase().replace(/\s+/g, "-")}.docx`,
        content: docxBuffer,
        contentType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    },
    {
        filename: `briefing-${businessName.toLowerCase().replace(/\s+/g, "-")}.xlsx`,
        content: xlsxBuffer,
        contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    },
];
```

### Envíos:
1. **Al admin**: `to: emailUser` (paginasmendezrisopatron@gmail.com)
2. **Al cliente**: `to: clientEmail` (solo si proporcionó email)

### Fallback:
Si `EMAIL_USER` o `EMAIL_PASS` no están configurados, solo guarda en DB y logea warning.

---

## 8. Cambio 6: Generación de Word (.docx)

### Archivo nuevo: `src/lib/generateDocx.ts`

### Estructura del documento generado:

```
┌─────────────────────────────────────────┐
│     BRIEFING LANDING PAGE               │  ← Título centrado, 48pt, bold
│         Landing Page                    │  ← Subtítulo, 28pt, itálica, azul
│─────────────────────────────────────────│
│  DATOS DEL CLIENTE                      │  ← Heading 1, azul
│  Nombre: Juan Pérez                     │
│  Negocio: Panadería Don Juan            │
│  Email: juan@mail.com                   │
│  WhatsApp: +56 9 1234 5678             │
│─────────────────────────────────────────│
│  1. IDENTIDAD Y CONTACTO               │  ← Heading 2, azul
│  Nombre completo: Juan Pérez            │
│  Nombre del negocio: Panadería Don Juan │
│  Rubro / Industria: gastronomia         │
│  ...todos los campos con su valor...    │
│─────────────────────────────────────────│
│  2. OBJETIVO Y ESTRATEGIA              │
│  Objetivo principal: captar_leads       │
│  Público objetivo: Mujeres 25-45...    │
│  ...                                    │
│─────────────────────────────────────────│
│  3. DISEÑO VISUAL                       │
│  Estilo de diseño: moderno              │
│  Color principal: #6366f1               │
│  ...                                    │
│─────────────────────────────────────────│
│  4. EXTRAS Y ENTREGA                    │
│  Funcionalidades extras: whatsapp_button│
│  Plazo de entrega: normal               │
│  ...                                    │
│─────────────────────────────────────────│
│  Generado automáticamente — 16 feb 2026 │  ← Footer, itálica, gris
└─────────────────────────────────────────┘
```

### Características:
- Font: Calibri
- Colores: #1a1a2e (título), #4361EE (headings), #999999 (footer)
- Separadores con BorderStyle.SINGLE
- Cada campo renderizado literalmente (NO resumido)
- Si un campo no tiene datos: "Sin datos ingresados" en itálica gris
- `FIELD_LABELS` mapea IDs técnicos a nombres legibles en español

### Función exportada:
```typescript
export async function generateDocxBuffer(data: BriefingData): Promise<Buffer>
```

---

## 9. Cambio 7: Generación de Excel (.xlsx)

### Archivo nuevo: `src/lib/generateXlsx.ts`

### Hoja 1: "Briefing Detallado"
```
┌────────────────────────────────────────────────────────┐
│              BRIEFING — Landing Page                    │  ← Merged, 16pt
├──────────────┬─────────────────────┬───────────────────┤
│   Sección    │      Campo          │      Valor        │  ← Header azul
├──────────────┼─────────────────────┼───────────────────┤
│ Datos del    │ Nombre completo     │ Juan Pérez        │
│ Cliente      │ Correo electrónico  │ juan@mail.com     │
│              │ Nombre del negocio  │ Panadería Don Juan│
│              │ Teléfono / WhatsApp │ +56 9 1234 5678   │
├──────────────┼─────────────────────┼───────────────────┤
│ Objetivo y   │ Objetivo principal  │ captar_leads      │
│ Estrategia   │ Público objetivo    │ Mujeres 25-45...  │
│              │ ...                 │ ...               │
├──────────────┼─────────────────────┼───────────────────┤
│ Diseño Visual│ Estilo de diseño    │ moderno           │
│              │ Color principal     │ #6366f1           │
├──────────────┼─────────────────────┼───────────────────┤
│ Extras y     │ Funcionalidades     │ whatsapp_button   │
│ Entrega      │ Plazo de entrega    │ normal            │
└──────────────┴─────────────────────┴───────────────────┘
```

### Hoja 2: "Resumen Plano"
```
┌─────────────────────┬───────────────────────────┐
│       Campo         │          Valor            │  ← Flat, import-ready
├─────────────────────┼───────────────────────────┤
│ tipo                │ Landing Page              │
│ Nombre completo     │ Juan Pérez                │
│ Correo electrónico  │ juan@mail.com             │
│ ...todos los campos │ ...todos los valores      │
└─────────────────────┴───────────────────────────┘
```

### Estilos:
- Header: fondo #4361EE, texto blanco, bold, 12pt
- Sección: texto azul, bold, 11pt
- Campo: bold, 10pt
- Valor: wrapText true
- Anchos: Sección 25, Campo 35, Valor 60

### Función exportada:
```typescript
export async function generateXlsxBuffer(data: BriefingData): Promise<Buffer>
```

---

## 10. Cambio 8: Email HTML Profesional

### Archivo nuevo: `src/lib/generateEmailHtml.ts`

### Estructura del email:
```
┌──────────────────────────────────────────────┐
│  ╔══════════════════════════════════════════╗ │
│  ║  📋 Briefing Recibido                   ║ │ ← Gradient header (#4361EE → #7C3AED)
│  ║      Landing Page                       ║ │
│  ╚══════════════════════════════════════════╝ │
│                                              │
│  ┌──────────────────────────────────────────┐ │
│  │ Juan Pérez                    (grande)   │ │ ← Client highlight box
│  │ Panadería Don Juan            (azul)     │ │    Background: #f0f4ff
│  │ juan@mail.com                 (gris)     │ │    Border-left: #4361EE
│  └──────────────────────────────────────────┘ │
│                                              │
│  🎨 moderno   ⏰ normal   🎨 #6366f1       │ ← Quick summary pills
│                                              │
│  📑 Secciones seleccionadas:                │
│  [hero] [servicios] [testimonios] [contacto] │ ← Badge chips
│                                              │
│  ⚡ Extras solicitados:                      │
│  [whatsapp_button] [google_maps]             │ ← Pink badge chips
│                                              │
│  ══ 1. Identidad y Contacto ════════════════ │ ← Tablas de datos
│  │ Nombre completo  │ Juan Pérez            │ │
│  │ Nombre negocio   │ Panadería Don Juan    │ │
│  │ ...              │ ...                   │ │
│                                              │
│  ══ 2. Objetivo y Estrategia ═══════════════ │
│  │ ...              │ ...                   │ │
│                                              │
│  ══ 3. Diseño Visual ═══════════════════════ │
│  │ ...              │ ...                   │ │
│                                              │
│  ══ 4. Extras y Entrega ════════════════════ │
│  │ ...              │ ...                   │ │
│                                              │
│  ──────────────────────────────────────────── │
│  📎 Se adjuntan Word y Excel                 │ ← Footer note
│  Generado automáticamente — 16 feb 2026      │
└──────────────────────────────────────────────┘
```

### Características:
- Gradient header con colores #4361EE → #7C3AED
- Client highlight box con border-left azul
- Quick summary con pills/badges de colores
- Secciones seleccionadas como chips azules
- Extras como chips rosas
- Tablas con headers azules y separadores
- Nota de adjuntos
- Fecha de generación
- Responsive (max-width 640px)
- Inline CSS (compatibilidad email clients)

### Función exportada:
```typescript
export function generateEmailHtml(data: BriefingData): string
```

---

## 11. Cambio 9: Configuración de Correo (.env)

### Archivo: `.env`

**ANTES:**
```dotenv
DATABASE_URL="file:./dev.db"
ADMIN_PASSWORD=admin123
NEXT_PUBLIC_APP_NAME="Briefing Profesional"
```

**DESPUÉS:**
```dotenv
DATABASE_URL="file:./dev.db"
ADMIN_PASSWORD=admin123
NEXT_PUBLIC_APP_NAME="Briefing Profesional"
EMAIL_USER=paginasmendezrisopatron@gmail.com
EMAIL_PASS=lyzz xjek khxr ypiz
```

### Archivo: `.env.example`

**ANTES:**
```dotenv
# Environment Variables
DATABASE_URL="file:./dev.db"
ADMIN_PASSWORD=your_secure_password_here
NEXT_PUBLIC_APP_NAME="Briefing Profesional"
```

**DESPUÉS:**
```dotenv
# Environment Variables
DATABASE_URL="file:./dev.db"
ADMIN_PASSWORD=your_secure_password_here
NEXT_PUBLIC_APP_NAME="Briefing Profesional"

# Email configuration (Gmail)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password_here
```

---

## 12. Cambio 10: Wiring del Submit

### Archivo: `src/modules/briefingEngine/context.tsx`

### Cambio exacto (línea ~150):

**ANTES:**
```typescript
const response = await fetch("/api/briefings", {
    method: "POST",
```

**DESPUÉS:**
```typescript
const response = await fetch("/api/briefings/submit", {
    method: "POST",
```

### Impacto:
- Ahora al hacer click en "Enviar Briefing" en el último paso, se llama al nuevo endpoint
- El nuevo endpoint guarda en DB + genera DOCX + genera XLSX + envía emails
- El viejo endpoint `POST /api/briefings` sigue existiendo (no se tocó) pero ya no se usa desde el formulario

---

## 13. Dependencias Nuevas

### `npm install nodemailer exceljs @types/nodemailer`

| Paquete | Versión | Uso |
|---------|---------|-----|
| `nodemailer` | latest | Envío de correos Gmail (SMTP) |
| `exceljs` | latest | Generación de archivos .xlsx con hojas, estilos, celdas mergeadas |
| `@types/nodemailer` | latest | Tipos TypeScript para nodemailer |

### Dependencias que ya existían y se aprovecharon:
| Paquete | Uso |
|---------|-----|
| `docx` (v9.5.3) | Generación de archivos .docx (ya estaba instalado) |
| `@prisma/client` | Base de datos SQLite |

---

## 14. Archivos Modificados

| Archivo | Tipo de cambio |
|---------|----------------|
| `src/components/briefing/LiveLandingPreview.tsx` | Imports, refs, scroll, flotantes, WhatsApp header/footer, iconos SVG |
| `src/modules/briefingEngine/context.tsx` | URL del fetch cambiada a `/api/briefings/submit` |
| `.env` | Agregados `EMAIL_USER` y `EMAIL_PASS` |
| `.env.example` | Agregados placeholders para email |
| `package.json` | Nuevas dependencias (automático por npm install) |
| `package-lock.json` | Actualizado (automático por npm install) |

---

## 15. Archivos Creados

| Archivo | Propósito | Líneas |
|---------|-----------|--------|
| `src/lib/generateDocx.ts` | Genera Buffer de Word (.docx) profesional | ~222 |
| `src/lib/generateXlsx.ts` | Genera Buffer de Excel (.xlsx) con 2 hojas | ~175 |
| `src/lib/generateEmailHtml.ts` | Genera HTML del email con resumen detallado | ~177 |
| `src/app/api/briefings/submit/route.ts` | Endpoint completo: DB + docs + email | ~153 |

---

## 16. Código Completo de Cada Archivo Nuevo

### 16.1. `src/lib/generateDocx.ts`

```typescript
import {
    Document, Packer, Paragraph, TextRun,
    HeadingLevel, AlignmentType, BorderStyle,
} from "docx";

interface BriefingData {
    type: string;
    clientName: string;
    clientEmail: string;
    contactData: Record<string, unknown>;
    contentData: Record<string, unknown>;
    designData: Record<string, unknown>;
    extraData: Record<string, unknown>;
}

const FIELD_LABELS: Record<string, string> = {
    clientName: "Nombre completo",
    businessName: "Nombre del negocio",
    industry: "Rubro / Industria",
    email: "Correo electrónico",
    phone: "Teléfono / WhatsApp",
    instagramUrl: "Instagram",
    facebookUrl: "Facebook",
    twitterUrl: "Twitter / X",
    mainGoal: "Objetivo principal",
    targetAudience: "Público objetivo",
    mainCTA: "Llamada a la acción principal",
    uniqueValue: "Propuesta de valor única",
    sections: "Secciones seleccionadas",
    sectionNotes: "Notas sobre secciones",
    designStyle: "Estilo de diseño",
    primaryColor: "Color principal",
    secondaryColor: "Color secundario",
    referenceUrls: "URLs de referencia",
    hasLogo: "¿Tiene logo?",
    hasPhotos: "¿Tiene fotos propias?",
    hasTexts: "¿Tiene textos listos?",
    additionalContent: "Contenido adicional",
    features: "Funcionalidades extras",
    hasDomain: "¿Tiene dominio?",
    domainName: "Nombre de dominio",
    socialMedia: "Redes sociales",
    deadline: "Plazo de entrega",
    budget: "Presupuesto",
    additionalNotes: "Notas adicionales",
};

const TYPE_LABELS: Record<string, string> = {
    LANDING: "Landing Page",
    WEB_COMERCIAL: "Web Comercial",
    ECOMMERCE: "E-commerce",
};

function formatValue(value: unknown): string {
    if (value === undefined || value === null || value === "") return "No especificado";
    if (Array.isArray(value)) return value.join(", ");
    if (typeof value === "boolean") return value ? "Sí" : "No";
    return String(value);
}

function getLabel(key: string): string {
    return FIELD_LABELS[key] || key.replace(/([A-Z])/g, " $1").replace(/_/g, " ").trim();
}

export async function generateDocxBuffer(data: BriefingData): Promise<Buffer> {
    // Título, subtítulo, separador, datos del cliente, 4 secciones numeradas, footer
    // (ver contenido completo en el archivo)
}
```

> **Nota**: El archivo completo tiene ~222 líneas. Se puede consultar directamente en `src/lib/generateDocx.ts`.

### 16.2. `src/lib/generateXlsx.ts`

```typescript
import ExcelJS from "exceljs";

// Interface BriefingData + FIELD_LABELS + TYPE_LABELS (iguales)

export async function generateXlsxBuffer(data: BriefingData): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();

    // Sheet 1: "Briefing Detallado" — Sección | Campo | Valor
    // Sheet 2: "Resumen Plano" — Campo | Valor (flat)

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
}
```

> **Nota**: El archivo completo tiene ~175 líneas. Se puede consultar directamente en `src/lib/generateXlsx.ts`.

### 16.3. `src/lib/generateEmailHtml.ts`

```typescript
// Interface BriefingData + FIELD_LABELS + TYPE_LABELS (iguales)

function renderSection(title: string, data: Record<string, unknown>): string {
    // Genera tabla HTML con campos y valores
}

export function generateEmailHtml(data: BriefingData): string {
    // Retorna HTML completo del email con:
    // - Header gradient
    // - Client highlight box
    // - Quick summary pills
    // - Secciones como chips
    // - Extras como chips
    // - 4 tablas detalladas
    // - Footer con nota de adjuntos
}
```

> **Nota**: El archivo completo tiene ~177 líneas. Se puede consultar directamente en `src/lib/generateEmailHtml.ts`.

### 16.4. `src/app/api/briefings/submit/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import nodemailer from "nodemailer";
import { generateDocxBuffer } from "@/lib/generateDocx";
import { generateXlsxBuffer } from "@/lib/generateXlsx";
import { generateEmailHtml } from "@/lib/generateEmailHtml";

export async function POST(request: NextRequest) {
    // 1. Validar inputs
    // 2. Sanitizar (anti-XSS, anti-SQLi)
    // 3. Guardar en Prisma DB
    // 4. Generar DOCX + XLSX en paralelo
    // 5. Generar HTML email
    // 6. Enviar email al admin
    // 7. Enviar email al cliente
    // 8. Retornar { id, status, emailSent }
}
```

> **Nota**: El archivo completo tiene ~153 líneas. Se puede consultar directamente en `src/app/api/briefings/submit/route.ts`.

---

## 17. Cambios Exactos en Archivos Existentes

### 17.1. `LiveLandingPreview.tsx` — Diff resumido

```diff
- import React from "react";
+ import React, { useRef, useEffect, useState, useCallback } from "react";

  import {
      // ...existentes...
+     Instagram,
+     Facebook,
+     Twitter,
  } from "lucide-react";

+ // ── Normalize phone for WhatsApp link ──
+ function normalizePhone(phone: string): string {
+     return phone.replace(/[\s+\-()]/g, "");
+ }

  export function LiveLandingPreview() {
      const { formData } = useBriefingForm();
      // ...existentes...
-     const hasSocial = instagramUrl || facebookUrl || twitterUrl || socialMedia;
+     const hasSocial = instagramUrl || facebookUrl || twitterUrl || socialMedia || phone;
+     const normalizedPhone = normalizePhone(phone);

+     // ── Refs for smart scroll ──
+     const scrollContainerRef = useRef<HTMLDivElement>(null);
+     const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
+     const footerRef = useRef<HTMLDivElement>(null);

+     // ── Floating social visibility (hide near footer) ──
+     const [showFloating, setShowFloating] = useState(true);
+     const handleScroll = useCallback(() => { ... }, []);
+     useEffect(() => { /* scroll listener */ }, [handleScroll]);

+     // ── Smart scroll: detect new sections/features ──
+     const prevSectionsRef = useRef<string[]>([]);
+     const prevFeaturesRef = useRef<string[]>([]);
+     useEffect(() => { /* scrollIntoView on new section */ }, [sections, features]);

      // En el JSX:
-     <div className={`${bgClass} overflow-y-auto ...`}>
+     <div ref={scrollContainerRef} className={`${bgClass} overflow-y-auto ...`}>

      // Hero section:
+     ref={(el) => { sectionRefs.current["hero"] = el; }}
+     {/* Social icons bar — WhatsApp, IG, FB, Twitter */}

      // Dynamic sections:
+     ref={(el) => { sectionRefs.current[section] = el; }}

      // Extras sections:
+     ref={(el) => { sectionRefs.current["google_maps"] = el; }}
+     ref={(el) => { sectionRefs.current["formulario_contacto"] = el; }}

      // Footer:
-     <div className="px-6 py-3 ...">
+     <div ref={footerRef} className="px-6 py-3 ...">
+     {/* WhatsApp icon added to footer socials */}
-     IG, FB, X (text)
+     <Instagram/>, <Facebook/>, <Twitter/>, <MessageCircle/> (SVG icons)

      // Floating buttons:
-     {/* Solo WhatsApp button */}
+     {/* Stack: WhatsApp + Instagram + Facebook + Twitter */}
+     {/* Con showFloating para ocultar antes del footer */}
```

### 17.2. `context.tsx` — Diff exacto

```diff
-             const response = await fetch("/api/briefings", {
+             const response = await fetch("/api/briefings/submit", {
                  method: "POST",
```

---

## 18. Estructura de Archivos Final

```
src/
├── app/
│   ├── api/
│   │   ├── auth/route.ts
│   │   └── briefings/
│   │       ├── route.ts              ← GET (admin list) + POST (legacy, ya no usado por form)
│   │       ├── [id]/route.ts
│   │       ├── submit/
│   │       │   └── route.ts          ← ★ NUEVO: POST completo (DB + docs + email)
│   │       └── export/
│   │           ├── csv/route.ts
│   │           └── docx/route.ts
│   ├── briefing/
│   │   ├── [type]/page.tsx
│   │   └── success/page.tsx
│   └── admin/...
├── components/
│   └── briefing/
│       ├── LiveLandingPreview.tsx     ← ★ MODIFICADO: WhatsApp, scroll, flotantes
│       └── StepIndicator.tsx
├── lib/
│   ├── prisma.ts
│   ├── genericCopy.ts
│   ├── generateDocx.ts              ← ★ NUEVO
│   ├── generateXlsx.ts              ← ★ NUEVO
│   └── generateEmailHtml.ts         ← ★ NUEVO
├── modules/
│   └── briefingEngine/
│       ├── context.tsx               ← ★ MODIFICADO: fetch URL
│       ├── FieldRenderer.tsx
│       ├── StepRenderer.tsx
│       ├── index.ts
│       └── configs/landing.ts
└── types/
    └── briefing.ts
```

---

## 19. Flujo Completo del Sistema Tras Cambios

```
USUARIO llena formulario multi-step
    │
    ├── Paso 1: Negocio (nombre, email, phone, IG, FB, Twitter)
    │   └── Preview muestra: nombre + iconos sociales en header (incluye WhatsApp)
    │
    ├── Paso 2: Objetivo (goal, audience, CTA)
    │   └── Preview actualiza CTA button
    │
    ├── Paso 3: Secciones (multiselect)
    │   └── Preview agrega/quita secciones + SCROLL automático a nueva sección
    │
    ├── Paso 4: Diseño (estilo, colores)
    │   └── Preview cambia estilos instantáneamente
    │
    ├── Paso 5: Contenido (logo, fotos, textos)
    │   └── Preview muestra contenido adicional
    │
    └── Paso 6: Extras (features multiselect + deadline + budget)
        │
        ├── Activa "WhatsApp flotante" → Aparece stack flotante con todas las redes
        ├── Activa "Google Maps" → Aparece sección mapa + SCROLL automático
        ├── Activa "Formulario contacto" → Aparece sección formulario + SCROLL
        ├── Desactiva → Desaparece instantáneamente
        └── Scroll del preview cerca del footer → Flotantes se ocultan
            │
            └── Click "Enviar Briefing"
                │
                ├── POST /api/briefings/submit
                │   ├── Valida + Sanitiza
                │   ├── Guarda en SQLite (Prisma)
                │   ├── Genera briefing.docx (profesional, con secciones)
                │   ├── Genera briefing.xlsx (2 hojas: detallado + plano)
                │   ├── Genera HTML email (gradient, pills, tablas)
                │   ├── Envía email → paginasmendezrisopatron@gmail.com (admin)
                │   │   └── Adjuntos: .docx + .xlsx
                │   ├── Envía email → email del cliente
                │   │   └── Adjuntos: .docx + .xlsx
                │   └── Retorna { id, status: "created", emailSent: true }
                │
                └── Redirect → /briefing/success
```

---

## 20. Nota Importante sobre Gmail

Para que el envío de correos funcione con Gmail, se necesita una **App Password** (contraseña de aplicación), NO la contraseña normal de la cuenta.

### Cómo obtenerla:
1. Ir a https://myaccount.google.com/apppasswords
2. Iniciar sesión con paginasmendezrisopatron@gmail.com
3. Seleccionar "Correo" y "Otro (nombre personalizado)" → "Briefing System"
4. Google genera una contraseña de 16 caracteres (formato: xxxx xxxx xxxx xxxx)
5. Pegar en `.env` como `EMAIL_PASS`

### Requisitos:
- La cuenta debe tener **verificación en 2 pasos** activada
- Si no tiene 2FA, activarla primero en https://myaccount.google.com/security

### Variables de entorno:
```dotenv
EMAIL_USER=paginasmendezrisopatron@gmail.com
EMAIL_PASS=xxxx xxxx xxxx xxxx   # App Password de 16 chars
```

---

> **FIN DEL REGISTRO DE CAMBIOS — Sesión 3**
> 
> Todos los archivos nuevos y modificados están documentados arriba con su código, estructura y lógica.
> Compilación verificada: `npx tsc --noEmit` → 0 errores.
