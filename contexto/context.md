# FormularioPaginas — Contexto Completo del Proyecto

Este documento contiene **TODO** el historial, contexto, decisiones técnicas y cambios realizados en el proyecto "FormularioPaginas" hasta la fecha.

## 1. Objetivo Original y Visión
El objetivo principal fue crear un sistema de "Briefing Profesional" para una agencia de diseño web. El cliente necesitaba un formulario interactivo, moderno y dinámico para capturar información de sus clientes (Landing Page, Web Comercial, Ecommerce), reemplazando métodos antiguos (Google Forms, PDFs).

**Requerimientos Clave:**
- Diseño "Premium" y "Aesthetic" (Dark mode, gradientes, glassmorphism).
- Vista previa en tiempo real ("Live Preview") del sitio web que el cliente está configurando.
- Sistema paso a paso (Wizard) para no abrumar al usuario.
- Panel de administración para ver, gestionar y exportar los briefings (CSV/DOCX).

## 2. Stack Tecnológico
Para cumplir con los requerimientos de rendimiento, SEO y estética, seleccionamos:
- **Framework**: Next.js 14 (App Router)
- **Lenguaje**: TypeScript
- **Estilos**: TailwindCSS (con utilidades personalizadas para efectos premium)
- **Base de Datos**: Prisma ORM con SQLite (fácil migración a PostgreSQL)
- **Validación**: Zod + React Hook Form
- **Iconos**: Lucide React
- **Seguridad**: Bcryptjs (auth admin), Sanitización profunda (anti-XSS/SQLi)

## 3. Arquitectura del Sistema

### 3.1. Briefing Engine (El Corazón)
En lugar de crear formularios estáticos ("hardcoded"), construimos un "Briefing Engine" dinámico en `src/modules/briefingEngine`.
- **Configuración**: Cada tipo de briefing (ej: Landing Page) es un archivo de configuración (`configs/landing.ts`) que define los pasos, campos y validaciones.
- **Renderizado Dinámico**: `FieldRenderer.tsx` toma la configuración y "dibuja" los inputs correspondientes. Esto permite agregar nuevos tipos de servicios sin tocar el código base del formulario.
- **Estado Global**: Un `FormContext` maneja las respuestas y la navegación entre pasos.

### 3.2. Base de Datos Híbrida
Diseñamos el modelo `Briefing` en Prisma (`schema.prisma`) para ser flexible:
- **Campos Estructurados**: `id`, `status`, `clientName`, `clientEmail` (para búsquedas rápidas).
- **Campos JSON**: `contactData`, `contentData`, `designData` (para almacenar la estructura variable del formulario sin migraciones constantes).

### 3.3. Panel de Administración
Ubicado en `/admin`, permite al equipo:
- Login seguro (contraseña hasheada).
- Ver lista de briefings con filtros (Estado, Tipo).
- Entrar al detalle de cada proyecto para ver las respuestas.
- Cambiar estados (Pendiente -> En progreso -> Completado).
- **Exportación**: Generación de documentos Word (.docx) profesionales y hojas de cálculo (.csv).

---

## 4. Historial Detallado de Cambios (Changelog)

### Fase 1: Fundación y Estructura
- Se inicializó el proyecto con Next.js 14.
- Se configuró Docker (`Dockerfile`, `docker-compose.yml`) para despliegue contenerizado.
- Se implementó la autenticación simple para el admin.
- Se crearon las páginas base: Home, Formulario Dinámico, Success Page, Admin Dashboard.

### Fase 2: El "Live Preview"
- **Desafío**: El usuario quería que el cliente viera cómo quedaría su web mientras llenaba el formulario.
- **Solución**: Creamos `LiveLandingPreview.tsx`.
    - Escucha los cambios del formulario en tiempo real.
    - Actualiza colores, textos (H1, CTA) y estructura según lo que el usuario escribe.
    - **Mejora v2**: Se añadieron imágenes dinámicas (usando Picsum) para simular fotos reales en las secciones de Servicios, Galería y Equipo. Se soportan 14 tipos de secciones diferentes.

### Fase 3: Seguridad y Robustez (Critico)
- Se detectaron vulnerabilidades potenciales en la inyección de datos.
- **Acción**: Implementamos `sanitizeData` en el backend (`api/briefings/route.ts`).
    - Limpieza recursiva de objetos JSON.
    - Eliminación de patrones SQL Injection (`DROP`, `SELECT`, `--`).
    - Eliminación de scripts XSS (`<script>`, `javascript:`).
- **Validación**: Se reforzó Zod para validar emails y teléfonos estrictamente.

### Fase 4: Refinamiento de UX (La Saga del Input)
Esta fue la fase de pulido final basada en feedback intensivo ("pixel perfect").

1.  **Bug de Autofill**: Los navegadores (Chrome) ponían fondo blanco a los inputs al autocompletar, rompiendo el modo oscuro.
    - *Solución*: Se forzó el estilo `WebkitBoxShadow` a `#0f172a` (slate-900) mediante estilos en línea en `FieldRenderer.tsx`.

2.  **Bug de Espacios**: Los usuarios no podían escribir espacios en los nombres.
    - *Causa*: La sanitización en tiempo real usaba `.trim()`.
    - *Solución*: Se eliminó `.trim()` de la sanitización activa, permitiendo escritura natural.

3.  **Teléfono Chileno (+56)**:
    - *Iteración 1*: Formateo automático (+56 9 XXXX XXXX).
    - *Iteración 2*: El usuario reportó confusión con el prefijo.
    - *Iteración 3*: Se separó visualmente el `+56` en un bloque fijo a la izquierda usando `Flexbox`.
    - *Iteración Final*: Se eliminó el placeholder (`9 1234 5678`) y se dejó el campo limpio con el prefijo en gris (`text-white/50`) para máxima claridad y alineación perfecta.

4.  **Estilizado Global**:
    - Se cambiaron todos los placeholders (textos de sugerencia) de `white/30` a `gray-500` para reducir el deslumbramiento y mejorar la legibilidad del formulario.

## 5. Estado Actual del Proyecto
El sistema está **completamente funcional y pulido**.
- ✅ Formulario de Landing Page con 6 pasos optimizados.
- ✅ Vista previa en vivo con anímaición y placeholders visuales.
- ✅ Panel de administración seguro y completo.
- ✅ Exportación de datos funcionando.
- ✅ Seguridad reforzada contra ataques comunes.
- ✅ UX de inputs (teléfono, textos) perfeccionada al detalle.

---
*Generado automáticamente por Antigravity el 15 de Febrero de 2026, documentando todo el ciclo de vida del desarrollo.*
