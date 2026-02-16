# Guía de Deploy — Vercel + Turso (libSQL)

> **Contexto:** La app usa SQLite localmente (`file:./dev.db`). En Vercel, el filesystem es **efímero y read-only**, por lo que necesitas una base de datos SQLite remota. Turso (libSQL) es la opción recomendada.

---

## 1. Crear la base de datos en Turso

```bash
# Instalar Turso CLI
curl -sSfL https://get.tur.so/install.sh | bash

# Login
turso auth login

# Crear base de datos
turso db create formulario-paginas

# Obtener URL de la DB
turso db show formulario-paginas --url
# → libsql://formulario-paginas-<tu-usuario>.turso.io

# Crear token de autenticación
turso db tokens create formulario-paginas
# → eyJhbGci...  (guardar este token)
```

---

## 2. Configurar variables de entorno en Vercel

En **Vercel Dashboard → Settings → Environment Variables**, agregar:

| Variable | Valor | Entornos |
|----------|-------|----------|
| `DATABASE_URL` | `libsql://formulario-paginas-<tu-usuario>.turso.io` | Production, Preview |
| `DATABASE_AUTH_TOKEN` | `eyJhbGci...` (el token de Turso) | Production, Preview |
| `EMAIL_ENABLED` | `true` | Production |
| `EMAIL_FROM` | `paginasmendezrisopatron@gmail.com` | Production |
| `ADMIN_PASSWORD` | (contraseña segura, NO la de dev) | Production |
| `EMAIL_USER` | (tu email) | Production |
| `EMAIL_PASS` | (App Password de Gmail) | Production |

> ⚠️ Marcar `DATABASE_AUTH_TOKEN`, `ADMIN_PASSWORD` y `EMAIL_PASS` como **Sensitive**.

---

## 3. Aplicar schema de Prisma a Turso

Desde tu máquina local, temporalmente apunta a la DB remota:

```bash
# En terminal (no guardar en .env del repo)
export DATABASE_URL="libsql://formulario-paginas-<tu-usuario>.turso.io"
export DATABASE_AUTH_TOKEN="eyJhbGci..."

# Push del schema
npx prisma db push
```

Esto crea la tabla `Briefing` en Turso.

---

## 4. Verificar que funciona

```bash
# Verificar conexión
npx prisma studio
```

O hacer un deploy preview y probar el submit del formulario.

---

## 5. Desarrollo local

Para desarrollo local, sigue usando `file:./dev.db`:

```env
# .env (local)
DATABASE_URL="file:./dev.db"
# DATABASE_AUTH_TOKEN no necesario para file:
```

El código en `prisma.ts` detecta automáticamente:
- URL con `libsql://` o `https://` → usa `@prisma/adapter-libsql` (Turso)
- URL con `file:` → usa PrismaClient estándar (SQLite local)

---

## 6. Troubleshooting

### Error: "Unable to connect to database"
- Verificar que `DATABASE_URL` empiece con `libsql://`
- Verificar que `DATABASE_AUTH_TOKEN` esté configurado
- Verificar que el token no haya expirado: `turso db tokens create formulario-paginas`

### Error: "Table does not exist"
- Ejecutar `npx prisma db push` apuntando a la URL de Turso (paso 3)

### Error: "SQLITE_BUSY" o timeouts
- Turso tier gratuito tiene límites de concurrencia
- Para producción real, considera el plan Pro de Turso

### Prisma migrations vs db push
- Para este proyecto, `prisma db push` es suficiente (schema simple)
- Si necesitas migraciones formales: `npx prisma migrate dev` → `npx prisma migrate deploy`

---

## Resumen de arquitectura

```
Local:
  Next.js → PrismaClient → file:./dev.db (SQLite local)

Vercel:
  Next.js → PrismaClient + libsql adapter → Turso (libSQL remoto)
  
  prisma.ts detecta automáticamente cuál usar según DATABASE_URL
```

---

_Última actualización: Junio 2025_
