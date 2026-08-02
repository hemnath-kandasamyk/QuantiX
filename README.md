<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=2,5,12,18&height=200&section=header&text=QuantiX&fontSize=70&fontColor=ffffff&animation=fadeIn&fontAlignY=38&desc=Smart%20Inventory%20%26%20Billing%20Management%20for%20Retail&descAlignY=58&descSize=18" width="100%" />

<img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=22&pause=1000&color=F7941D&center=true&vCenter=true&width=680&lines=Real-time+Inventory+Tracking;Point-of-Sale+Billing+System;Low-Stock+%26+Expiry+Alerts;AI-Powered+Store+Assistant;Built+by+Hemnath+KK" alt="Typing SVG" />

<br/>

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white&style=for-the-badge)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white&style=for-the-badge)](https://www.typescriptlang.org)
[![Node.js](https://img.shields.io/badge/Node.js-20-339933?logo=node.js&logoColor=white&style=for-the-badge)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white&style=for-the-badge)](https://expressjs.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Production-4169E1?logo=postgresql&logoColor=white&style=for-the-badge)](https://www.postgresql.org)

[![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Sequelize](https://img.shields.io/badge/Sequelize-6-52B0E7?logo=sequelize&logoColor=white)](https://sequelize.org)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white)](https://www.docker.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

[![Deploy Frontend](https://github.com/hemnath-kandasamyk/QuantiX/actions/workflows/deploy-pages.yml/badge.svg)](https://github.com/hemnath-kandasamyk/QuantiX/actions/workflows/deploy-pages.yml)
![Repo size](https://img.shields.io/github/repo-size/hemnath-kandasamyk/QuantiX?color=orange)
![Last commit](https://img.shields.io/github/last-commit/hemnath-kandasamyk/QuantiX?color=blue)
![Stars](https://img.shields.io/github/stars/hemnath-kandasamyk/QuantiX?style=social)

<br/>

**[Live Demo](#-live-deployments)** · **[Report Bug](../../issues)** · **[Request Feature](../../issues)**

</div>

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [System Architecture](#-system-architecture)
- [Database Schema](#-database-schema)
- [Authentication Flow](#-authentication-flow)
- [Project Structure](#-project-structure)
- [API Reference](#-api-reference)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Deployment](#-deployment)
- [Live Deployments](#-live-deployments)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)
- [License](#-license)
- [Author](#-author)

---

## 🧾 Overview

**QuantiX** is a full-stack shop management platform built for small and mid-sized retailers who need **inventory tracking**, **point-of-sale billing**, and **staff operations** in one clean dashboard — with an AI assistant that actually understands your store's live data.

It's built as a real multi-tenant system: every retailer (shop) gets isolated data, role-based staff accounts, and a JWT-secured API — not a toy demo.

---

## ✨ Features

| | Feature | Description |
|---|---|---|
| 📊 | **Dashboard** | Revenue, transaction count, low-stock overview, 30-day trend chart, top products |
| 🧾 | **Billing (POS)** | Line-item sale builder, tax/discount calculation, instant receipt generation |
| 📦 | **Inventory Management** | Add/edit/delete products, per-product reorder thresholds, bulk stock updates |
| 📈 | **Sales History** | Searchable, filterable transaction log with full receipt detail |
| 🔔 | **Smart Alerts** | Auto-generated low-stock, out-of-stock, and expiry-window alerts |
| 👥 | **Staff Management** | Admin/staff roles, scoped access, staff performance tracking |
| 🤖 | **AI Assistant** | Chat interface with live context on inventory & sales (Grok / Gemini / local fallback) |
| 🔐 | **Authentication** | Email/password + "Continue with Google" (Firebase), both issuing the same JWT |
| 🌗 | **Light/Dark Theme** | Persisted "ledger" aesthetic across sessions |
| ✨ | **Polished UX** | Skeleton loaders, empty states, toasts, animated transitions (Motion) |

---

## 🛠 Tech Stack

<table>
<tr>
<td valign="top" width="50%">

**Frontend**
| Layer | Technology |
|---|---|
| Framework | React 19 + TypeScript |
| Build tool | Vite 6 |
| Styling | Tailwind CSS 4 |
| Routing | React Router 7 |
| Charts | Recharts |
| Icons | Lucide React |
| Animation | Motion (Framer Motion), canvas-confetti |
| HTTP client | Axios |
| Auth (client) | Firebase Authentication |

</td>
<td valign="top" width="50%">

**Backend**
| Layer | Technology |
|---|---|
| Runtime | Node.js 20 |
| Framework | Express 4 |
| ORM | Sequelize 6 |
| Database (dev) | SQLite |
| Database (prod) | PostgreSQL |
| Auth (server) | JWT (jsonwebtoken) + bcrypt |
| Security | Helmet, express-rate-limit, CORS |
| Scheduling | node-cron (alert job) |
| Containerization | Docker |

</td>
</tr>
</table>

---

## 🏗 System Architecture

```mermaid
flowchart TB
    subgraph Client["Client Layer"]
        Browser["Browser<br/>React 19 + Vite SPA"]
    end

    subgraph Hosting["Frontend Hosting (pick one)"]
        Vercel["Vercel"]
        Pages["GitHub Pages"]
    end

    subgraph API["Backend - Render (Docker)"]
        Express["Express Server<br/>src/server.js"]
        MW["Middleware<br/>Helmet - CORS - Rate Limit - JWT Auth"]
        Routes["Route Handlers<br/>auth - products - sales - alerts - dashboard - ai"]
        ORM["Sequelize ORM"]
    end

    subgraph Data["Data Layer"]
        PG[("PostgreSQL<br/>(production)")]
        SQLite[("SQLite<br/>(local dev)")]
    end

    subgraph External["External Services"]
        Firebase["Firebase Auth<br/>(Google Sign-In)"]
        AI["Grok / Gemini API<br/>(AI Assistant)"]
    end

    Browser -->|"HTTPS"| Vercel
    Browser -->|"HTTPS"| Pages
    Vercel -->|"REST API calls<br/>VITE_API_URL"| Express
    Pages -->|"REST API calls<br/>VITE_API_URL"| Express
    Browser <-.->|"Google Popup Auth"| Firebase

    Express --> MW --> Routes --> ORM
    ORM -->|"production"| PG
    ORM -->|"development"| SQLite
    Routes -.->|"/api/ai/ask"| AI

    style Client fill:#1C1917,color:#FBF9F5,stroke:#F7941D
    style Hosting fill:#0d1b2a,color:#fff,stroke:#F7941D
    style API fill:#1C1917,color:#FBF9F5,stroke:#F7941D
    style Data fill:#14213d,color:#fff,stroke:#4169E1
    style External fill:#2d1b00,color:#fff,stroke:#F7941D
```

---

## 🗂 Database Schema

```mermaid
erDiagram
    RETAILER ||--o{ USER : employs
    RETAILER ||--o{ PRODUCT : owns
    RETAILER ||--o{ SALE : records
    PRODUCT ||--|| INVENTORY : "tracked by"
    PRODUCT ||--o{ STOCK_ADJUSTMENT : "adjusted via"
    PRODUCT ||--o{ SALE_ITEM : "sold as"
    USER ||--o{ SALE : processes
    USER ||--o{ STOCK_ADJUSTMENT : performs
    SALE ||--|{ SALE_ITEM : contains

    RETAILER {
        int id PK
        string shopName
        string email UK
        string phone
        string passwordHash
    }
    USER {
        int id PK
        int retailerId FK
        string name
        string email UK
        string passwordHash
        enum role "admin | staff"
    }
    PRODUCT {
        int id PK
        int retailerId FK
        string name
        string category
        string rackLocation
        float costPrice
        float sellingPrice
        date expiryDate
        int lowStockThreshold
        bool isActive
    }
    INVENTORY {
        int id PK
        int productId FK,UK
        int currentQuantity
    }
    SALE {
        int id PK
        int retailerId FK
        int userId FK
        float totalAmount
        string paymentMode
    }
    SALE_ITEM {
        int id PK
        int saleId FK
        int productId FK
        int quantitySold
        float priceAtSale
        float costAtSale
    }
    STOCK_ADJUSTMENT {
        int id PK
        int productId FK
        int userId FK
        int quantityChange
        string reason
    }
```

---

## 🔐 Authentication Flow

```mermaid
sequenceDiagram
    actor U as User
    participant F as Frontend (React)
    participant B as Backend (Express)
    participant DB as PostgreSQL
    participant FB as Firebase

    rect rgb(30, 30, 30)
    note over U,DB: Email / Password Login
    U->>F: Enter email + password
    F->>B: POST /api/auth/login
    B->>DB: Find user + verify bcrypt hash
    DB-->>B: User record
    B-->>F: JWT token + user info
    F->>F: Store token in localStorage
    end

    rect rgb(45, 27, 0)
    note over U,FB: Google Sign-In
    U->>F: Click "Continue with Google"
    F->>FB: signInWithPopup()
    FB-->>F: idToken + profile info
    F->>B: POST /api/auth/google
    B->>DB: Find-or-create user + retailer
    DB-->>B: User record
    B-->>F: JWT token + user info
    end

    note over F,B: All subsequent requests
    F->>B: Authorization Bearer token
    B->>B: Verify JWT (middleware)
    B-->>F: Protected resource
```

---

## 📁 Project Structure

```
QuantiX/
├── .github/workflows/       # CI/CD - auto-deploy frontend to GitHub Pages
├── DEPLOYMENT.md            # Full deployment runbook (Render + Vercel + Docker)
├── docker-compose.yml       # Local full-stack orchestration (Postgres + API + SPA)
│
├── backend/
│   ├── Dockerfile
│   ├── database/
│   │   ├── config/config.js    # Sequelize CLI + runtime DB config (SQLite <-> Postgres)
│   │   └── migrations/         # Versioned schema history
│   └── src/
│       ├── server.js           # App entrypoint - security, CORS, routes
│       ├── config/database.js
│       ├── middleware/auth.js  # JWT verification + role guard
│       ├── models/             # Sequelize models (see ER diagram above)
│       ├── routes/
│       │   ├── auth.js         # Register, login, staff CRUD, Google auth, logout
│       │   ├── products.js     # Catalog CRUD + bulk stock updates
│       │   ├── sales.js        # POS checkout + sales log
│       │   ├── alerts.js       # Live low-stock / expiry computation
│       │   ├── dashboard.js    # Aggregated + granular analytics endpoints
│       │   └── ai.js           # AI assistant (Grok -> Gemini -> local fallback)
│       └── utils/
│           ├── alertJob.js     # Scheduled alert checks (node-cron)
│           └── seed.js         # Demo data seeder
│
└── frontend/
    ├── vite.config.ts          # Dev proxy to backend + GH Pages base path
    ├── vercel.json              # SPA rewrite rules for Vercel
    └── src/
        ├── api/client.ts       # Axios instance - JWT header, 401 handling
        ├── components/         # Layout, ProtectedRoute, Toast, Skeleton, etc.
        ├── context/AuthContext.tsx
        ├── lib/firebase.ts     # Firebase client config
        ├── pages/              # Dashboard, Billing, Products, SalesHistory,
        │                       # Alerts, Staff, AIAssistant, Login, Register
        └── App.tsx             # Route definitions
```

---

## 🔌 API Reference

<details>
<summary><strong>🔐 Auth Routes — <code>/api/auth</code></strong></summary>

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/register-shop` | Public | Register a new shop + owner account |
| `POST` | `/login` | Public | Email/password login |
| `POST` | `/google` | Public | Firebase Google sign-in (find-or-create) |
| `POST` | `/logout` | 🔒 | Session logout |
| `GET` | `/me` | 🔒 | Get current authenticated user |
| `POST` | `/staff` | 🔒 Admin | Create a staff account |
| `GET` | `/staff` | 🔒 Admin | List staff accounts |
| `DELETE` | `/staff/:id` | 🔒 Admin | Remove a staff account |

</details>

<details>
<summary><strong>📦 Product Routes — <code>/api/products</code></strong></summary>

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/?search=&category=` | 🔒 | Search/list active products |
| `GET` | `/:id` | 🔒 | Get single product |
| `POST` | `/` | 🔒 Admin | Create product |
| `PUT` | `/:id` | 🔒 Admin | Update product |
| `DELETE` | `/:id` | 🔒 Admin | Soft-delete product |
| `POST` | `/:id/adjust` | 🔒 Admin | Manual stock correction (logged) |
| `PATCH` | `/bulk` | 🔒 Admin | Apply stock change to multiple products |

</details>

<details>
<summary><strong>💳 Sales, 🔔 Alerts & 📊 Dashboard</strong></summary>

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/sales` | 🔒 | Record a new sale |
| `GET` | `/api/sales` | 🔒 | Sales history |
| `GET` | `/api/alerts` | 🔒 | Low-stock / expiring / out-of-stock alerts |
| `POST` | `/api/alerts/read-all` | 🔒 | Acknowledge all alerts |
| `DELETE` | `/api/alerts/:id` | 🔒 | Dismiss a single alert |
| `GET` | `/api/dashboard` | 🔒 | Combined dashboard payload |
| `GET` | `/api/dashboard/summary` | 🔒 | Today/month/year rollups |
| `GET` | `/api/dashboard/trend` | 🔒 | Daily revenue series |
| `GET` | `/api/dashboard/staff-performance` | 🔒 | Sales grouped by staff |
| `POST` | `/api/ai/ask` | 🔒 | Ask the AI assistant a question |
| `GET` | `/api/health` | Public | Service + DB health check |

</details>

---

## 🚀 Getting Started

### Prerequisites
- Node.js **20+**
- npm
- (optional) Docker, if you'd rather run everything with `docker compose`

### 1. Clone the repo

```bash
git clone https://github.com/hemnath-kandasamyk/QuantiX.git
cd QuantiX
```

### 2. Backend setup

```bash
cd backend
npm install
cp .env.example .env      # fill in JWT_SECRET at minimum
npm run db:migrate        # creates local SQLite schema
npm run seed               # optional demo data
npm run dev                 # http://localhost:4000
```

### 3. Frontend setup

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev                 # http://localhost:3000
```

The Vite dev server proxies `/api/*` straight to your local backend — no CORS setup needed locally.

### 4. Or run everything with Docker

```bash
docker compose up --build
```

---

## 🔑 Environment Variables

<table>
<tr>
<td valign="top" width="50%">

**Backend (`backend/.env`)**
| Variable | Required | Purpose |
|---|---|---|
| `NODE_ENV` | ✅ | `development` or `production` |
| `JWT_SECRET` | ✅ (prod) | Signs auth tokens |
| `DATABASE_URL` | ✅ (prod) | Postgres connection string |
| `FRONTEND_URL` | ✅ (prod) | Comma-separated CORS allow-list |
| `GEMINI_API_KEY` | Optional | Powers AI Assistant fallback |
| `XAI_API_KEY` | Optional | Grok, tried before Gemini |

</td>
<td valign="top" width="50%">

**Frontend (`frontend/.env.local`)**
| Variable | Required | Purpose |
|---|---|---|
| `VITE_API_URL` | ✅ (prod) | Deployed backend base URL |
| `VITE_API_PROXY_TARGET` | Local dev only | Where `/api` proxies to |
| `VITE_FIREBASE_API_KEY` | For Google sign-in | Firebase config |
| `VITE_FIREBASE_AUTH_DOMAIN` | For Google sign-in | Firebase config |
| `VITE_FIREBASE_PROJECT_ID` | For Google sign-in | Firebase config |
| `VITE_FIREBASE_APP_ID` | For Google sign-in | Firebase config |

</td>
</tr>
</table>

---

## 📡 Deployment

QuantiX is designed so the **backend and frontend deploy independently** — mix and match platforms freely.

```mermaid
flowchart LR
    Dev["git push"] --> GH["GitHub Repo"]
    GH -->|"backend/"| Render["Render.com<br/>Docker + Postgres"]
    GH -->|"frontend/"| Vercel["Vercel<br/>(auto-deploy)"]
    GH -->|"GitHub Actions"| Pages["GitHub Pages<br/>(auto-deploy)"]
    Render -.->|"health check"| HC["/api/health OK"]

    style Dev fill:#1C1917,color:#fff
    style GH fill:#24292e,color:#fff
    style Render fill:#046a38,color:#fff
    style Vercel fill:#000,color:#fff
    style Pages fill:#0d1b2a,color:#fff,stroke:#F7941D
```

Full step-by-step instructions (Render, Vercel, GitHub Pages, and self-hosted Docker) live in **[`DEPLOYMENT.md`](DEPLOYMENT.md)**.

**Post-deploy checklist:**
- [ ] `/api/health` returns `{"status":"healthy","database":"connected"}`
- [ ] Frontend network requests hit the deployed backend, not `localhost`
- [ ] `FRONTEND_URL` on the backend matches every deployed frontend origin (CORS)
- [ ] `JWT_SECRET` is a real random value, not a placeholder
- [ ] `.env` and `.sqlite` files are gitignored, never committed

---

## 🌍 Live Deployments

| Environment | URL | Status |
|---|---|---|
| Backend API | `https://quantix-1.onrender.com` | ![Render](https://img.shields.io/badge/Render-Live-46E3B7?logo=render&logoColor=white) |
| Frontend (Vercel) | `https://quanti-x.vercel.app` | ![Vercel](https://img.shields.io/badge/Vercel-Live-000000?logo=vercel&logoColor=white) |
| Frontend (GitHub Pages) | `https://hemnath-kandasamyk.github.io/QuantiX` | ![Pages](https://img.shields.io/badge/GitHub_Pages-Live-222?logo=github&logoColor=white) |

> ⚠️ Free-tier backend note: Render's free instance spins down after inactivity — the first request after idle time can take 30–50s to wake up.

---

## 🗺 Roadmap

- [ ] Server-side verification of Firebase ID tokens (currently trusted client-side)
- [ ] Persist alert "read/dismissed" state (currently computed live, no `AlertRead` table yet)
- [ ] Add `receiptNo`, `customerName`, `paymentMethod`, and product `unit`/`SKU` columns
- [ ] Multi-location inventory support
- [ ] Automated test coverage expansion (Jest + Supertest scaffolding already in place)
- [ ] Rate-limit and audit-log admin actions

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

```bash
1. Fork the repo
2. Create your branch:   git checkout -b feature/amazing-feature
3. Commit your changes:  git commit -m "Add amazing feature"
4. Push to the branch:   git push origin feature/amazing-feature
5. Open a Pull Request
```

---

## 📄 License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for details.

---

## 👤 Author

<div align="center">

**Hemnath KK**

Final-year B.Tech, Artificial Intelligence & Data Science
V.S.B. Engineering College, Karur, Tamil Nadu

[![GitHub](https://img.shields.io/badge/GitHub-hemnath--kandasamyk-181717?logo=github&logoColor=white&style=for-the-badge)](https://github.com/hemnath-kandasamyk)

<br/>

<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=2,5,12,18&height=100&section=footer" width="100%"/>

</div>
