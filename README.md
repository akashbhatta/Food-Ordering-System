# 🍔 FeastHub — Modern Multi-Tenant Food Ordering Platform

FeastHub is a production-grade, multi-tenant food discovery, ordering, and restaurant management web application built with **Next.js (App Router)**, **TypeScript**, **PostgreSQL**, **Prisma ORM**, **Tailwind CSS**, and **NextAuth v5**.

---

## 🚀 Key Features

- **Customer Discovery & Ordering**:
  - Full-text multi-criteria search (name, cuisine, price, rating, open status).
  - Customizable menu items with dynamic option pricing.
  - Multi-tenant cart validation with automatic conflict resolution.
  - Delivery address book management and atomic checkout transactions.
  - Real-time order timeline tracking (`PENDING → CONFIRMED → PREPARING → READY → OUT_FOR_DELIVERY → DELIVERED`).
  - Verified meal reviews with 1–5 star ratings and owner replies.
- **Restaurant Partner Portal (`/dashboard`)**:
  - Live kitchen order management queue with valid status progression buttons.
  - Complete Menu Catalog CRUD with customization options and price controls.
  - Operating hours manager for 7-day opening/closing schedules.
  - Daily revenue, pending orders, and popular dish analytics.
- **Administrator Moderation Portal (`/admin`)**:
  - System KPIs: Gross revenue, active stores, order count, and registrations.
  - User moderation: Banning/unbanning accounts and role management (`CUSTOMER`, `OWNER`, `ADMIN`).
  - Restaurant review & approval pipeline (`PENDING`, `APPROVED`, `SUSPENDED`).
  - Global menu catalog inspection, category taxonomy manager, and review moderation.
- **Enterprise Security & Reliability**:
  - Server-authoritative price calculation (immunity to client price tampering).
  - Strict foreign-key IDOR protection on all mutations.
  - Historical order price preservation snapshots inside `OrderItem`.
  - Comprehensive error boundaries and loading skeletons across all 24 routes.

---

## 🛠️ Technology Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router, Turbopack, Server Actions)
- **Language**: [TypeScript](https://www.typescriptlang.org/) (Strict Mode)
- **Database & ORM**: [PostgreSQL](https://www.postgresql.org/) & [Prisma ORM](https://www.prisma.io/)
- **Authentication**: [NextAuth v5 (Auth.js)](https://authjs.dev/) with bcrypt password hashing
- **Styling & UI**: [Tailwind CSS](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/), [Lucide React](https://lucide.dev/)
- **Validation**: [Zod](https://zod.dev/)
- **State & Notifications**: React Context Provider, [Sonner](https://sonner.emilkowal.ski/)

---

## 📋 Prerequisites

- **Node.js**: `v20.x` or higher
- **Package Manager**: `npm` (v10+)
- **Database**: PostgreSQL database instance (local, Docker, Supabase, Neon, or AWS RDS)

---

## ⚙️ Environment Configuration

1. Duplicate `.env.example` into `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
2. Configure your database and auth secrets in `.env.local`:
   ```env
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/food_delivery_db?schema=public"
   NEXTAUTH_SECRET="generate-a-32-char-random-key"
   NEXTAUTH_URL="http://localhost:3000"
   NODE_ENV="development"
   ```

To generate a secure `NEXTAUTH_SECRET`:
```bash
openssl rand -base64 32
```

---

## 🗄️ Database Setup & Migration

1. **Install dependencies**:
   ```bash
   npm install
   ```
2. **Generate Prisma Client**:
   ```bash
   npx prisma generate
   ```
3. **Run Migrations**:
   ```bash
   npx prisma migrate dev --name init
   ```
4. **Seed Development Data**:
   ```bash
   npx prisma db seed
   ```

---

## 🔑 Pre-Configured Test Accounts

All seeded test accounts share the password: **`password123`**

| Role | Email | Affiliation / Purpose |
| :--- | :--- | :--- |
| **ADMIN** | `admin@feasthub.com` | Root system administrator |
| **OWNER** | `mario@luigispizza.com` | Luigi's Authentic Pizzeria |
| **OWNER** | `kenji@tokyoramen.com` | Tokyo Ramen Bar |
| **OWNER** | `carlos@tacofiesta.com` | Taqueria La Fiesta |
| **OWNER** | `chen@goldendragon.com` | The Golden Dragon Wok (Pending Approval) |
| **CUSTOMER** | `alice@example.com` | Regular customer (with order history) |
| **CUSTOMER** | `bob@example.com` | Regular customer |

---

## 💻 Local Development

Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🏗️ Production Build & Verification

To verify that the entire codebase compiles cleanly:

```bash
npm run build
```

To run the compiled production bundle locally:
```bash
npm run start
```

---

## 🚢 Production Deployment Instructions

### Option 1: Vercel Deployment (Recommended)
1. Push your repository to GitHub / GitLab.
2. Import the repository in [Vercel](https://vercel.com).
3. Under **Project Settings → Environment Variables**, add:
   - `DATABASE_URL` (Direct connection URL from Neon, Supabase, or AWS RDS)
   - `NEXTAUTH_SECRET` (Generated secret)
   - `NEXTAUTH_URL` (`https://your-production-domain.com`)
4. Set the build command to: `npm run build`
5. Run Prisma migrations during deployment by adding to your build script or running `npx prisma migrate deploy`.

### Option 2: Docker / VPS / Node.js Server
1. Provision a Linux server (Ubuntu 22.04 LTS / Debian).
2. Install Node.js `v20+` and PostgreSQL.
3. Clone repository and run:
   ```bash
   npm ci
   npx prisma generate
   npx prisma migrate deploy
   npm run build
   ```
4. Manage the background Node process with PM2:
   ```bash
   npm install -g pm2
   pm2 start npm --name "feasthub" -- start
   ```
5. Configure Nginx as a reverse proxy with SSL (Let's Encrypt / Certbot).

---

## 🔒 Security Architecture Highlights

1. **Price Manipulation Immunity**: Item prices are authoritatively validated against the database inside `db.$transaction()` during checkout.
2. **Strict Foreign-Key Ownership**: Kitchen dashboard mutations check `where: { ownerId: user.id }` to prevent cross-restaurant IDOR vulnerabilities.
3. **Finite State Transitions**: Status transitions follow a strict one-way state machine (`CONFIRMED → PREPARING → READY → DELIVERED`).
4. **Duplicate Review Prevention**: Schema-level `@unique` index on `orderId` ensures each completed purchase can only be reviewed once.
5. **Sanitized Error Isolation**: Application error boundaries isolate failures and prevent stack trace or SQL leakage.

---

## 📄 License
MIT License. Built for high performance and modern food delivery operations.
