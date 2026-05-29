# Creatorhub

Dashboard personal para afiliados de **TikTok Shop**: trackea vídeos subidos, gestiona productos, registra GMV/ventas y visualiza ingresos. App responsive (móvil + escritorio), datos en **Supabase** e imágenes en **Supabase Storage**.

Hermana visual de **Vault**: mismo sistema de diseño (Inter Variable, radios `2xl`, modales, bottom-nav móvil / sidebar desktop), con color de marca **violeta + cyan**.

---

## 🧱 Stack

React 18 · Vite · TypeScript · Tailwind CSS v3 (`darkMode: 'class'`) · lucide-react · Recharts · framer-motion · React Router v6 · `@supabase/supabase-js` · Inter Variable.

---

## 🚀 Setup local

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar credenciales
cp .env.example .env
#   → rellena VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY

# 3. Arrancar en desarrollo
npm run dev

# 4. Build de producción
npm run build      # genera /dist
npm run preview    # previsualiza el build
```

Sin `.env` la app arranca igualmente, pero muestra un aviso y no guarda datos.

---

## 🗄 Base de datos (Supabase)

1. Crea un proyecto en [supabase.com](https://supabase.com).
2. Abre **SQL Editor** y pega el contenido completo de [`supabase.sql`](./supabase.sql). Ejecútalo. Esto crea:
   - Las 5 tablas (`products`, `videos`, `sales`, `day_notes`, `app_settings`) con sus índices y restricciones `UNIQUE`.
   - El bucket público `product-images` con políticas de lectura pública y escritura desde `anon`.
   - **RLS** habilitada con políticas permisivas para `anon` (claramente comentadas para cambiar al añadir auth).
   - El seed de la fila singleton `app_settings (id=1, daily_video_goal=5)`.
3. En **Project Settings → API** copia la *Project URL* y la *anon public key* a tu `.env`.

### Modelo de datos (resumen)

| Tabla | Clave | Notas |
|-------|-------|-------|
| `products` | `id` uuid | estado: nuevo/testeando/activo/pausado/descartado |
| `videos` | `id` uuid · `UNIQUE(day_date, slot)` | cada fila = 1 vídeo completado; `product_id` nullable |
| `sales` | `id` uuid · `UNIQUE(day_date, product_id)` | upsert por producto/día |
| `day_notes` | `day_date` (PK) | una nota por día |
| `app_settings` | `id=1` | singleton (objetivo de vídeos, nombre) |

El nº de vídeos por producto se **deriva** de `videos` (no se almacena).

---

## ☁️ Despliegue en GitHub Pages

1. Sube el repo a GitHub.
2. En **Settings → Secrets and variables → Actions**, añade:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. En **Settings → Pages**, en *Source* elige **GitHub Actions**.
4. Cada `push` a `main` dispara [`.github/workflows/deploy.yml`](./.github/workflows/deploy.yml), que compila e implementa `/dist`.

El workflow copia `index.html` a `404.html` como fallback SPA. Además la app usa `HashRouter` y `base: './'`, así que las rutas profundas funcionan al refrescar incluso bajo un subpath de proyecto (`usuario.github.io/creatorhub/`).

---

## 🔐 Activar autenticación más adelante

El código está preparado para añadir auth con cambios mínimos:

**1. Supabase Auth.** Activa el proveedor que prefieras (email, OAuth…) en *Authentication → Providers*.

**2. Cliente.** En `src/lib/supabase.ts` cambia `persistSession: false` a `true` y añade una pantalla de login que llame a `supabase.auth.signInWithPassword` / `signInWithOAuth`. Envuelve `<DataProvider>` en un guard que espere a `supabase.auth.getSession()`.

**3. Columna `user_id`.** Añade `user_id uuid references auth.users(id)` a `products`, `videos`, `sales`, `day_notes` y `app_settings`, y rellénalo en cada `insert/upsert` con el usuario actual (`(await supabase.auth.getUser()).data.user!.id`).

**4. RLS.** En `supabase.sql`, sustituye cada política `to anon using (true)` por algo como:

```sql
create policy "owner_products" on public.products
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
```

Haz lo mismo para el resto de tablas y para las políticas de `storage.objects` (filtra por carpeta `auth.uid()` en la ruta del archivo).

**5. Storage.** Sube las imágenes a `product-images/{user_id}/{uuid}.ext` y ajusta las políticas de Storage para comprobar el primer segmento de la ruta.

Mientras tanto, la app funciona como **tabla única compartida** sin login.

---

## 🧮 Lógica de cálculo

Funciones puras y testeables en [`src/lib/calculations.ts`](./src/lib/calculations.ts): `saleCommission`, `dayColorLevel`, `dayTotals`, `productTotals`, `aggregateByPeriod`, `previousPeriod`, `pctDelta`, `rangeTotals`, `productRanking`. Las fechas se manejan en horario local con clave canónica `YYYY-MM-DD` ([`src/lib/dates.ts`](./src/lib/dates.ts)).

---

## 📁 Estructura

```
src/
├── components/  → Home, Calendar, Products, Income, ui
├── lib/         → supabase, calculations, dates, images, types, constants, format
├── hooks/       → useData (store central), useProducts/Videos/Sales/DayNotes/Settings, useTheme, useToast, useUnsavedChanges
├── pages/       → Home, Calendar, Products, ProductDetail, Income
├── App.tsx · main.tsx · index.css
supabase.sql · .github/workflows/deploy.yml · .env.example
```

---

## ✨ Detalles

Micro-celebración (confetti) al completar el objetivo de vídeos · día actual con ring violeta + glow · imágenes con lazy-load y blur-up · compresión client-side (>1MB → máx 1200px) con aviso de progreso · optimistic UI con reversión en error · skeletons y estados vacíos en todas las vistas · transición slide entre meses · `tabular-nums` en todas las cifras · líneas del gráfico animadas al cargar · tema claro/oscuro/sistema persistido y sin flash inicial.
