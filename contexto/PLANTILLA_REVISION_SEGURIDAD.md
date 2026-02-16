# PLANTILLA — Revisión de Seguridad

> **Proyecto:** FormularioPaginas  
> **Fecha de revisión:** `YYYY-MM-DD`  
> **Revisor:** _________________  
> **Commit revisado:** _________________  

---

## Instrucciones

Revisar cada checkpoint. Marcar con:
- ✅ **Cumple** — implementado correctamente
- ⚠️ **Parcial** — implementado pero con observaciones
- ❌ **No cumple** — falta implementar o tiene vulnerabilidad
- ⏭️ **N/A** — no aplica en este contexto

---

## 1. Secretos y Variables de Entorno

| # | Checkpoint | Estado | Evidencia / Notas |
|---|-----------|--------|-------------------|
| 1.1 | Ningún secreto hardcodeado en código fuente | ☐ | Buscar: `grep -r "password\|secret\|key\|token" src/ --include="*.ts" --include="*.tsx"` |
| 1.2 | `.env` está en `.gitignore` | ☐ | Verificar: `cat .gitignore \| grep .env` |
| 1.3 | `.env.example` NO contiene valores reales (solo placeholders) | ☐ | |
| 1.4 | Variables sensibles en Vercel configuradas como "Sensitive" | ☐ | Verificar en Vercel Dashboard → Settings → Environment Variables |
| 1.5 | `DATABASE_AUTH_TOKEN` presente en Vercel (para Turso) | ☐ | |
| 1.6 | `ADMIN_PASSWORD` NO es valor por defecto / trivial | ☐ | |
| 1.7 | Credenciales de email (OAuth tokens, SendGrid key) en ENV, no en código | ☐ | Revisar `emailService.ts` |

---

## 2. Validación de Input

| # | Checkpoint | Estado | Evidencia / Notas |
|---|-----------|--------|-------------------|
| 2.1 | `clientName` sanitizado (trim, límite de longitud) | ☐ | Revisar `submit/route.ts` stage "sanitize" |
| 2.2 | `clientEmail` validado con regex de email | ☐ | |
| 2.3 | `type` validado contra lista blanca de tipos permitidos | ☐ | |
| 2.4 | Campos JSON (`contactData`, `contentData`, etc.) validados como JSON válido | ☐ | |
| 2.5 | Payload size limitado (Next.js body parser o validación manual) | ☐ | |
| 2.6 | Campos de texto no permiten scripts (`<script>`, `javascript:`, etc.) | ☐ | |
| 2.7 | URLs de input validadas (formato correcto, sin `javascript:`) | ☐ | |

---

## 3. Rate Limiting y Abuso

| # | Checkpoint | Estado | Evidencia / Notas |
|---|-----------|--------|-------------------|
| 3.1 | Rate limit implementado en `/api/briefings/submit` | ☐ | Revisar stage "rate-limit" |
| 3.2 | Rate limit por IP (no solo global) | ☐ | |
| 3.3 | Rate limit en envío de email (evitar spam relay) | ☐ | Revisar `emailService.ts` |
| 3.4 | Protección contra enumeration en `/api/auth` | ☐ | |
| 3.5 | Timeout en operaciones de DB (evitar hanging requests) | ☐ | |

---

## 4. No Exponer Stack / Información Sensible

| # | Checkpoint | Estado | Evidencia / Notas |
|---|-----------|--------|-------------------|
| 4.1 | Errores de API NO devuelven stack traces al cliente | ☐ | Verificar todas las respuestas de error en `submit/route.ts` |
| 4.2 | Errores de API NO devuelven detalles de Prisma (code, meta, clientVersion) | ☐ | Estos se loguean server-side, no se envían |
| 4.3 | Errores del email NO exponen credenciales SMTP | ☐ | |
| 4.4 | Headers HTTP no exponen info del servidor (`X-Powered-By` removido) | ☐ | Next.js lo remueve por defecto |
| 4.5 | Console.error en producción solo loguea lo necesario | ☐ | |
| 4.6 | Mensajes de error al usuario son genéricos, no técnicos | ☐ | Verificar `message` en respuestas JSON |

---

## 5. Inyección HTML / XSS

| # | Checkpoint | Estado | Evidencia / Notas |
|---|-----------|--------|-------------------|
| 5.1 | Datos de usuario en email HTML están escapados | ☐ | Revisar `generateEmailHtml.ts` |
| 5.2 | Datos de usuario en DOCX están sanitizados | ☐ | Revisar `generateDocx.ts` |
| 5.3 | Datos de usuario en XLSX están sanitizados | ☐ | Revisar `generateXlsx.ts` |
| 5.4 | Preview component usa JSX (auto-escape) no `dangerouslySetInnerHTML` | ☐ | Revisar `LiveLandingPreview.tsx` |
| 5.5 | Campos de URL no se renderizan sin validación | ☐ | |

---

## 6. Email — Subject y HTML Sanitization

| # | Checkpoint | Estado | Evidencia / Notas |
|---|-----------|--------|-------------------|
| 6.1 | Subject del email NO incluye input de usuario sin sanitizar | ☐ | Revisar construcción del subject en `submit/route.ts` y `emailService.ts` |
| 6.2 | Subject tiene longitud máxima (prevenir header injection) | ☐ | |
| 6.3 | Subject no contiene `\r\n` (prevenir CRLF injection) | ☐ | |
| 6.4 | HTML del email escapa caracteres especiales (`<`, `>`, `&`, `"`) | ☐ | |
| 6.5 | Dirección "Reply-To" validada como email real | ☐ | |
| 6.6 | Attachments limitados en tamaño y tipo | ☐ | Solo DOCX y XLSX generados internamente |

---

## 7. Base de Datos

| # | Checkpoint | Estado | Evidencia / Notas |
|---|-----------|--------|-------------------|
| 7.1 | Prisma ORM usado (previene SQL injection por diseño) | ☐ | |
| 7.2 | No hay raw queries con concatenación de strings | ☐ | Buscar: `$queryRaw`, `$executeRaw` |
| 7.3 | `DATABASE_URL` usa libSQL remoto en producción (no `file:`) | ☐ | |
| 7.4 | `DATABASE_AUTH_TOKEN` configurado para Turso auth | ☐ | |
| 7.5 | Datos sensibles del briefing no se loguean en plaintext | ☐ | |

---

## 8. Autenticación Admin

| # | Checkpoint | Estado | Evidencia / Notas |
|---|-----------|--------|-------------------|
| 8.1 | Password comparation es constant-time (evitar timing attacks) | ☐ | |
| 8.2 | Session/cookie tiene HttpOnly + Secure flags | ☐ | |
| 8.3 | Session expira después de período razonable | ☐ | |
| 8.4 | Brute-force protection en login (lockout o delay) | ☐ | |
| 8.5 | `/admin/dashboard` requiere autenticación válida | ☐ | |

---

## Resumen de Revisión

| Sección | Total | ✅ | ⚠️ | ❌ | ⏭️ |
|---------|-------|---|---|---|---|
| 1. Secretos | 7 | | | | |
| 2. Input Validation | 7 | | | | |
| 3. Rate Limiting | 5 | | | | |
| 4. Stack Exposure | 6 | | | | |
| 5. HTML/XSS | 5 | | | | |
| 6. Email Sanitization | 6 | | | | |
| 7. Base de Datos | 5 | | | | |
| 8. Auth Admin | 5 | | | | |
| **TOTAL** | **46** | | | | |

---

## Riesgo General

| Nivel | Descripción |
|-------|------------|
| 🟢 Bajo | Todos los checkpoints críticos cumplen, observaciones menores |
| 🟡 Medio | Algunos checkpoints parciales, sin vulnerabilidades críticas |
| 🟠 Alto | Checkpoints críticos no cumplen, requiere fixes antes de deploy |
| 🔴 Crítico | Vulnerabilidades explotables encontradas, bloquear deploy |

**Nivel de riesgo actual:** ☐ 🟢 ☐ 🟡 ☐ 🟠 ☐ 🔴

---

## Acciones Requeridas

| Prioridad | Hallazgo | Acción | Responsable | Deadline |
|-----------|----------|--------|-------------|----------|
| | | | | |
| | | | | |

---

## Notas Adicionales

<!-- Observaciones generales, recomendaciones, contexto -->


---

_Fin de la revisión de seguridad_
