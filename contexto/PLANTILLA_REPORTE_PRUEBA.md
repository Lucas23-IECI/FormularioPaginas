# PLANTILLA — Reporte de Prueba

> Copiar esta plantilla por cada caso de prueba ejecutado.

---

## Información General

| Campo | Valor |
|-------|-------|
| **Fecha** | `YYYY-MM-DD HH:MM` |
| **Tester** | |
| **Entorno** | ☐ Local (dev) ☐ Vercel Preview ☐ Vercel Production |
| **Build / Commit** | `git rev-parse --short HEAD` → |
| **Branch** | |
| **Navegador** | Chrome / Firefox / Safari / Edge — versión: |
| **Dispositivo** | Desktop / Mobile / Tablet — resolución: |

---

## Caso de Prueba

| Campo | Detalle |
|-------|---------|
| **ID del Caso** | QA-XXX (referencia al checklist) |
| **Título** | |
| **Prioridad** | 🔴 Crítica / 🟠 Alta / 🟡 Media / 🟢 Baja |
| **Precondiciones** | (estado inicial necesario antes de ejecutar) |

---

## Pasos de Ejecución

| Paso | Acción | Dato de entrada |
|------|--------|----------------|
| 1 | | |
| 2 | | |
| 3 | | |
| 4 | | |

---

## Resultado

| Campo | Detalle |
|-------|---------|
| **Resultado Esperado** | |
| **Resultado Real** | |
| **Estado** | ✅ PASA / ❌ FALLA / ⚠️ PASA CON OBSERVACIONES |

---

## Logs y Evidencia

### Console Logs (navegador)
```
(pegar logs relevantes del DevTools → Console)
```

### Network Response (si aplica)
```json
{
  "status": ,
  "body": {}
}
```

### Server Logs (si aplica)
```
(pegar logs de Vercel Functions o terminal local)
```

### Capturas de Pantalla  
<!-- Adjuntar imágenes o enlaces a screenshots -->
- Antes: 
- Después: 
- Error visible: 

---

## Observaciones

<!-- Notas adicionales, comportamiento inesperado, sugerencias -->


---

## Clasificación del Defecto (si falla)

| Campo | Detalle |
|-------|---------|
| **Severidad** | 🔴 Blocker / 🟠 Critical / 🟡 Major / 🟢 Minor / ℹ️ Cosmético |
| **Componente** | Submit API / Preview / Admin / Navegación / Email / DB |
| **Reproducible** | Siempre / Intermitente / Solo una vez |
| **Workaround** | Sí (describir) / No |

---

## Seguimiento

| Acción | Responsable | Fecha | Estado |
|--------|-------------|-------|--------|
| | | | ☐ Pendiente |
| | | | ☐ En progreso |
| | | | ☐ Resuelto |

---

_Fin del reporte_
