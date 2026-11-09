# Cine-Hub 🎬
Movie Catalog & Community (CS319 Fullstack Project)

A fullstack movie catalog application built with **React**, **TanStack Query**, **Express**, **Prisma 7**, and **PostgreSQL (Supabase)**.

## Project Structure
- `cinehub-server/`: Express + Prisma 7 backend API with Zod validation and PostgreSQL (Supabase) integration.
- `cinehub-client/`: React (Vite) frontend with Tailwind CSS, Zustand, and TanStack Query.

## Quick Start

### 1. Backend (`cinehub-server`)
```bash
cd cinehub-fullstack/cinehub-server
npm install

# Setup environment variables
cp .env.example .env
# Fill in your DATABASE_URL

# Prisma Migrate & Seed
npx prisma migrate dev
npx prisma db seed

# Run server (Port 3000)
npm run dev
```

### 2. Frontend (`cinehub-client`)
```bash
cd cinehub-fullstack/cinehub-client
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.
