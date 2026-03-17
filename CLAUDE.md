# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Dragan Apostolski's photography portfolio — a Nuxt 3 site with Tailwind CSS v4, deployed on Vercel. Content is markdown-driven via Nuxt Content. Photos are hosted on Cloudflare R2 CDN (not in the repo).

## Commands

```bash
npm run dev              # Start dev server (localhost:3000)
npm run build            # Production build (Vercel/Nitro preset)
npm run generate         # Static site generation
npm run preview          # Preview production build locally
npm run lint             # ESLint checkå
npm run lint:fix         # ESLint auto-fix
npm run format           # Prettier check
npm run format:fix       # Prettier auto-fix
```

### Photo Pipeline

```bash
npm run analyze-photos                          # Check which photos need processing
npm run upload-photos                           # Upload to Cloudflare R2
npm run upload-photos -- --folder="Project Name" # Upload specific project
npm run upload-photos -- --dry-run              # Preview without uploading
npm run update-markdown                         # Generate/update project markdown from manifests
```

## Architecture

### Content System
- **Gallery photos** defined in `content/gallery.md` and `content/galleryPreview.md`
- **Projects** as individual markdown files in `content/projects/*.md` with frontmatter (title, description, location, date, tags, photos with aspect ratios)
- **Carousel config** in `content/carousel.md` (switches between gallery photos and recent projects)
- Photos referenced by path relative to CDN base URL (`NUXT_PUBLIC_CDN_BASE_URL` env var)

### Key Composables
- `useProjects` — project data fetching and caching
- `useCarousel` — hero carousel configuration and data
- `useHorizontalScroll` — desktop horizontal scroll behavior for project galleries
- `useProjectLoader` — progressive image loading for project pages
- `useProjectDate` — date formatting (single date or date ranges)

### Component Patterns
- Reusable UI primitives in `components/ui/` (PhotoPreview, PhotoDetail, Tag, Button, ScrollIncentive, CarouselNavButton, ProjectLoader)
- Page-level components in `components/` (HeroSection, PhotoCarousel, GalleryPreview, SiteNavbar, SiteFooter, etc.)
- Always import and use `components/ui/` building blocks when constructing new UI

### Server API
- `server/api/contact.post.ts` — contact form handler
- `server/api/tunnel.post.ts` — Sentry tunnel endpoint

### Photo Processing Scripts
Scripts in `scripts/` handle the full pipeline: analyze → upload to R2 → generate markdown. Manifests are written to `scripts/manifests/` (gitignored). Original photos live in `original-photos/` (also gitignored).

## Code Style

- Two-space indentation, no semicolons
- Composition API with `<script setup>` exclusively
- TypeScript interfaces over types; avoid enums (use maps)
- Functional/declarative patterns; no classes
- Tailwind CSS classes only — no custom CSS classes. Design tokens are in `assets/css/main.css` under `@theme`
- Tailwind v4 shorthand: use `text-primary`, `bg-accent`, etc. directly (not `text-[--color-primary]`)
- Dark mode via `@nuxtjs/color-mode` with `useColorMode()`. Body color/background already set via `@layer base`
- Images: use `<NuxtImg>` or `<NuxtPicture>` with sizes syntax like `sizes="100vw sm:50vw md:400px"`
- Icons: use Nuxt Icon module (Heroicons, Material Symbols, MDI, Phosphor)
- SEO: `useHead` and `useSeoMeta`
- Nuxt 3 auto-imports `ref`, `useState`, `useRouter`, etc. — don't manually import these
- Always set `hover:cursor-pointer` on buttons and links

## Important Rules

- **Never commit or push without asking first.** Always ask for permission before git operations.
- **Test after UI changes** by running `npm run dev` and verifying in the browser.
- Photos are served from Cloudflare R2 CDN — no images in `public/`.
- `original-photos/` and `scripts/manifests/` are gitignored and should never be committed.
