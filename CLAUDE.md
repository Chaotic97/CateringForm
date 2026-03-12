# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development (run both in separate terminals)
npm run dev            # Vite dev server (frontend, port 5173)
npm run dev:server     # Express API server via tsx watch (port 3001)

# Build & production
npm run build          # tsc + vite build (outputs to dist/)
npm start              # NODE_ENV=production Express serves API + both SPAs

# DigitalOcean server — pull latest, rebuild, and restart
cd ~/CateringForm && git pull && npm install && npm run build && export $(cat .env) && npm start

# Database
npm run seed           # Seed menu items, pricing tiers, default admin (safe to re-run)

# Lint
npm run lint           # ESLint
```

## Architecture

**Two SPAs served from one Vite build:**
- Customer form at `/` — multi-step catering inquiry wizard
- Admin panel at `/admin/` — employee dashboard for managing inquiries, menu, and pricing

**Customer form** is a guided wizard with two paths:
- **Restaurant Buyout**: Welcome → Event Details → Menu Style → Contact → Estimate Preview → Confirmation
- **To-Go Catering**: Welcome → Dish Selection → Contact → Price Summary → Confirmation

Step navigation is managed entirely by Zustand (`useFormStore`) — no React Router. The store persists to sessionStorage.

**Admin panel** uses hash-based routing (e.g., `/admin/#/inquiries/123`) — also no React Router. Auth is checked via `useAuth` hook which calls `GET /api/auth/me`.

**Backend** is Express 5 + SQLite (better-sqlite3). API routes under `/api/`. Session auth with bcrypt passwords. Vite proxies `/api` to `:3001` in dev.

## Key Conventions

- **Express 5**: Uses `path-to-regexp` v7 — wildcard routes must use `{*rest}` syntax, not `*`
- **Tailwind CSS v4**: Uses `@theme` directive for CSS custom properties, not `tailwind.config.js`
- **Zod v4**: Use `message` not `required_error` for enum error messages
- **Framer Motion**: Ease values must be typed `Easing` arrays, not strings
- **Menu/pricing data**: Hooks (`useMenuItems`, `usePricingTiers`) fetch from API with fallback to hardcoded config in `src/config/`
- **Vite multi-page build**: Admin entry is `src/admin/admin.html`, outputs to `dist/src/admin/`
- **No component library**: Custom UI primitives in `src/components/ui/` styled with Tailwind
- **WSL2 environment**: Always use nvm Node (`source ~/.nvm/nvm.sh`) — Windows npm causes path issues

## Database

SQLite at `data/catering.db` (gitignored). Tables: `menu_items`, `inquiries`, `pricing_tiers`, `employees`. Schema defined in `server/db.ts`. Default admin credentials: `admin` / `sumbar2024`.
