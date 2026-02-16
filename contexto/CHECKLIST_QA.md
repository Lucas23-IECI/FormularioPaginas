# CHECKLIST QA — Formulario Landing Page Briefing

> **Versión:** 1.0  
> **Fecha de creación:** Junio 2025  
> **Proyecto:** FormularioPaginas  

---

## Instrucciones

Marcar cada item con ✅ (pasa), ❌ (falla) o ⏭️ (no aplica).  
Rellenar la columna "Notas" solo cuando haya observaciones.

---

## 1. Submit — Funcionamiento Core

| #  | Caso de prueba | Local | Vercel | Notas |
|----|---------------|-------|--------|-------|
| 1.1 | Submit completo OK → DB guarda briefing | ☐ | ☐ | |
| 1.2 | Submit completo OK → Email admin recibido | ☐ | ☐ | |
| 1.3 | Submit completo OK → Email cliente recibido | ☐ | ☐ | |
| 1.4 | Submit con DB caída → respuesta 500 con `code: "DB_WRITE_ERROR"` | ☐ | ☐ | |
| 1.5 | Submit con email deshabilitado (`EMAIL_ENABLED=false`) → DB guarda, no envía email, no error | ☐ | ☐ | |
| 1.6 | Submit con servicio email caído → DB guarda, docs se generan, respuesta OK con warnings | ☐ | ☐ | |
| 1.7 | Submit con fallo en generación docs → DB guarda, email sin attachments, respuesta OK con warnings | ☐ | ☐ | |
| 1.8 | Submit con campos vacíos obligatorios → error 400 con `code: "VALIDATION_ERROR"` | ☐ | ☐ | |
| 1.9 | Submit con payload >10MB → error apropiado, sin crash | ☐ | ☐ | |
| 1.10 | Submit doble-click rápido → solo 1 briefing guardado (rate limit) | ☐ | ☐ | |

---

## 2. Admin Dashboard

| #  | Caso de prueba | Local | Vercel | Notas |
|----|---------------|-------|--------|-------|
| 2.1 | `/admin` → login funciona con contraseña correcta | ☐ | ☐ | |
| 2.2 | `/admin` → login rechaza contraseña incorrecta | ☐ | ☐ | |
| 2.3 | `/admin/dashboard` → lista briefings existentes | ☐ | ☐ | |
| 2.4 | `/admin/dashboard/[id]` → muestra detalle completo | ☐ | ☐ | |
| 2.5 | Exportar CSV → archivo válido con datos correctos | ☐ | ☐ | |
| 2.6 | Exportar DOCX → descarga correcta | ☐ | ☐ | |

---

## 3. Preview Reactivo

| #  | Caso de prueba | Resultado | Notas |
|----|---------------|-----------|-------|
| 3.1 | Cambiar nombre empresa → preview actualiza en tiempo real | ☐ | |
| 3.2 | Cambiar colores (primario/secundario) → preview refleja nuevos colores | ☐ | |
| 3.3 | Subir logo → preview muestra logo | ☐ | |
| 3.4 | Cambiar teléfono → WhatsApp button actualiza | ☐ | |
| 3.5 | Activar/desactivar features → secciones aparecen/desaparecen | ☐ | |
| 3.6 | Activar `galeria_fotos` → bloque galería visible en preview | ☐ | |
| 3.7 | Activar `testimonios` → bloque testimonios visible en preview | ☐ | |
| 3.8 | Activar `blog_noticias` → bloque blog visible en preview | ☐ | |
| 3.9 | Activar `mapa_ubicacion` → mapa visible en preview | ☐ | |
| 3.10 | Activar `formulario_avanzado` → formulario multi-campo visible | ☐ | |
| 3.11 | Activar `agenda` → bloque agenda con botón "Reservar" visible | ☐ | |
| 3.12 | Activar `descargables` → bloque descarga PDF visible | ☐ | |

---

## 4. Multi-idioma Preview

| #  | Caso de prueba | Resultado | Notas |
|----|---------------|-----------|-------|
| 4.1 | Activar `multi_idioma` → toggle ES/EN aparece en chrome del preview | ☐ | |
| 4.2 | Click EN → títulos de secciones cambian a inglés | ☐ | |
| 4.3 | Click ES → títulos vuelven a español | ☐ | |
| 4.4 | Sin `multi_idioma` → no aparece toggle, todo en español | ☐ | |
| 4.5 | CTA button → texto cambia según idioma seleccionado | ☐ | |

---

## 5. Navegación y UX

| #  | Caso de prueba | Resultado | Notas |
|----|---------------|-----------|-------|
| 5.1 | Navegar entre pasos → datos se mantienen | ☐ | |
| 5.2 | Botón "Atrás" del navegador → vuelve al paso anterior sin perder datos | ☐ | |
| 5.3 | Botón "Atrás" en paso 1 → vuelve a `/` (selección de tipo) | ☐ | |
| 5.4 | Error de submit → banner rojo aparece y desaparece en ~3s | ☐ | |
| 5.5 | Error de submit → click X cierra banner inmediatamente | ☐ | |
| 5.6 | Hero en preview → tiene spacing inferior correcto (no pegado) | ☐ | |
| 5.7 | Submit exitoso → redirige a `/briefing/success` | ☐ | |
| 5.8 | Responsive: móvil → preview oculto, solo formulario | ☐ | |
| 5.9 | Responsive: desktop → split formulario + preview | ☐ | |

---

## 6. Social & Contacto

| #  | Caso de prueba | Resultado | Notas |
|----|---------------|-----------|-------|
| 6.1 | WhatsApp activado + número presente → botón flotante visible en preview | ☐ | |
| 6.2 | URLs de redes (Instagram, Facebook, Twitter) → iconos en footer del preview | ☐ | |
| 6.3 | Sin redes sociales → footer sin iconos de social | ☐ | |
| 6.4 | Email en datos de contacto → enlace mailto en preview | ☐ | |

---

## 7. Extras Cleanup

| #  | Caso de prueba | Resultado | Notas |
|----|---------------|-----------|-------|
| 7.1 | `chat_live` NO aparece en opciones de features | ☐ | |
| 7.2 | `pixel_facebook` NO aparece en opciones de features | ☐ | |
| 7.3 | Antiguo campo `redes_sociales` (textarea) NO aparece en Extras | ☐ | |
| 7.4 | `formulario_avanzado` SÍ aparece como opción de feature | ☐ | |
| 7.5 | `agenda` SÍ aparece como opción de feature | ☐ | |
| 7.6 | `descargables` SÍ aparece como opción de feature | ☐ | |

---

## Resumen

| Sección | Total | ✅ Pasa | ❌ Falla | ⏭️ N/A |
|---------|-------|---------|---------|---------|
| 1. Submit | 10 | | | |
| 2. Admin | 6 | | | |
| 3. Preview Reactivo | 12 | | | |
| 4. Multi-idioma | 5 | | | |
| 5. Navegación/UX | 9 | | | |
| 6. Social/Contacto | 4 | | | |
| 7. Extras Cleanup | 6 | | | |
| **TOTAL** | **52** | | | |

---

**Tester:** _________________  
**Fecha de ejecución:** _________________  
**Entorno:** ☐ Local  ☐ Vercel Preview  ☐ Vercel Production  
**Build/Commit:** _________________  
