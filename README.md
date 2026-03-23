# W Bar de tapas y vinos

Sitio web del restaurante W Bar, ubicado en San Isidro, Buenos Aires.

## Stack

- Next.js 15 (App Router)
- React 18
- Tailwind CSS
- TypeScript

## Estructura del proyecto

```
src/
├── app/                    # Páginas y layout
│   ├── page.tsx             # Home
│   ├── layout.tsx           # Layout raíz con fonts y SEO
│   ├── globals.css          # Estilos globales y variables CSS
│   ├── privacidad/          # Política de privacidad
│   ├── terms/               # Términos y condiciones
│   ├── cookies/             # Política de cookies
│   └── sitemap.ts           # Sitemap dinámico
├── components/             # Componentes React
│   ├── navbar.tsx           # Navegación con menú móvil
│   ├── hero.tsx             # Video hero
│   ├── restaurant-section/  # Historia del restaurante
│   ├── menu-section.tsx     # Carta y vinoteca
│   ├── footer.tsx           # Footer con contacto
│   └── ui/                  # Componentes base (shadcn/ui)
├── data/                    # Datos del menú y carta de vinos
├── config/                  # Configuración centralizada
├── types/                   # Tipos TypeScript
└── lib/                     # Utilidades
```

## Datos centralizados

- `src/data/menu.ts` — Carta de comidas (categorías y productos)
- `src/data/wines.ts` — Carta de vinos
- `src/config/restaurant.ts` — Info del restaurante, horarios, navegación

Para actualizar precios o platos, editá los archivos en `src/data/`.

## Scripts

```bash
npm install
npm run dev      # Desarrollo
npm run build    # Build de producción
npm run lint     # Linting
```

## Deployment

Vercel (u otro host Node): configurar variables de entorno y `npm run build`.

