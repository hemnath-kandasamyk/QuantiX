<div align="center">

# QuantiX

### Shop Management & POS Billing System

Real-time inventory tracking, point-of-sale billing, and stock alerts for small and mid-sized retail shops.

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](../LICENSE)

</div>

---

## Overview

QuantiX is a full-featured shop management dashboard built for retail owners who need inventory, billing, and staff operations in one place. It combines a point-of-sale billing flow with real-time low-stock alerting, sales analytics, staff/role management, and an AI assistant that can answer questions about the store's current inventory and sales data.

## Features

- **📊 Dashboard** — revenue, transaction count, and low-stock overview with a trend chart, plus a top-products breakdown.
- **🧾 Billing (POS)** — build a sale line-item by line-item, apply discounts, auto-calculate tax, and generate a printable receipt on checkout.
- **📦 Inventory (Products)** — add/edit/delete products, track stock against a configurable reorder point, bulk stock/price adjustments, and search/filter.
- **📈 Sales History** — a searchable, filterable log of past transactions with receipt detail view.
- **🔔 Alerts** — automatic low-stock alerts generated whenever a product's stock drops to or below its reorder point, with severity levels and read/dismiss actions.
- **👥 Staff Management** — add staff members, assign `admin`/`staff` roles, and gate admin-only pages (like Staff itself) behind role checks.
- **🤖 AI Assistant** — a chat interface backed by Google's Gemini API, given live context about current inventory and sales so it can answer store-specific questions.
- **🔐 Authentication** — email/password login and registration, plus "Continue with Google" via Firebase Auth, both issuing the same session token so the rest of the app doesn't need to know which method was used.
- **🌗 Light/Dark theme** — a toggleable "ledger" aesthetic (warm paper tones in light mode) with the preference persisted locally.
- **✨ Polished UX** — skeleton loaders, empty states, toast notifications, and client-side form validation throughout.

## Tech Stack

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
| Auth | Firebase Authentication (Google provider) + JWT |
| AI | Google Gemini API (`@google/genai`) |
| Server | Express (dev/prod server with Vite middleware in dev) |

## Project Structure

```
frontend/
├── src/
│   ├── api/
│   │   └── client.ts          # Axios instance: JWT bearer header, 401 handling
│   ├── components/
│   │   ├── Layout.tsx         # Sidebar nav, theme toggle, alerts popover
│   │   ├── ProtectedRoute.tsx # Route guard (auth + role-based access)
│   │   ├── StatCard.tsx       # Dashboard stat tiles
│   │   ├── StatusStamp.tsx    # Status/severity badges
│   │   ├── Skeleton.tsx       # Loading placeholders
│   │   ├── EmptyState.tsx     # "No data yet" states
│   │   └── Toast.tsx          # Toast notification system
│   ├── context/
│   │   └── AuthContext.tsx    # Auth state, login/register/logout, session verification
│   ├── lib/
│   │   └── firebase.ts        # Firebase client config + Google sign-in
│   ├── pages/
│   │   ├── Login.tsx / Register.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Products.tsx
│   │   ├── Billing.tsx
│   │   ├── SalesHistory.tsx
│   │   ├── Alerts.tsx
│   │   ├── Staff.tsx
│   │   └── AIAssistant.tsx
│   ├── App.tsx                 # Route definitions
│   ├── main.tsx                # App entry point
│   └── index.css               # Design tokens, theme variables
├── index.html
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## Getting Started

### Prerequisites
- Node.js 18+
- A Gemini API key (for the AI Assistant) — get one from [Google AI Studio](https://aistudio.google.com/apikey)
- A Firebase project with Google sign-in enabled (for Google authentication) — optional, the app runs without it

### Installation

```bash
git clone https://github.com/hemnath-kandasamyk/QuantiX.git
cd QuantiX/frontend
npm install
```

### Environment Variables

Copy `.env.example` to `.env.local` and fill in the values:

```env
GEMINI_API_KEY=your_gemini_api_key
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
```

| Variable | Required | Purpose |
|---|---|---|
| `GEMINI_API_KEY` | For AI Assistant | Powers the Gemini-based chat assistant |
| `VITE_FIREBASE_API_KEY` | For Google sign-in | Firebase client config |
| `VITE_FIREBASE_AUTH_DOMAIN` | For Google sign-in | Firebase client config |
| `VITE_FIREBASE_PROJECT_ID` | For Google sign-in | Firebase client config |
| `VITE_FIREBASE_APP_ID` | For Google sign-in | Firebase client config |

### Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for production

```bash
npm run build
npm start
```

## Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Starts the Express + Vite dev server on port 3000 |
| `npm run build` | Builds the frontend and bundles the server for production |
| `npm start` | Runs the production build |
| `npm run lint` | Type-checks the project with `tsc --noEmit` |
| `npm run clean` | Removes build artifacts |

## Roadmap / Known Limitations

This project is under active development as part of an academic portfolio build. Currently:
- The backend (`server.ts`) is an in-memory data store intended for local development and demos — data resets on server restart. A persistent database-backed API is planned (see the `backend/` and `database/` folders at the repo root).
- Google sign-in tokens are not yet verified server-side; this is a known item on the security hardening list.

## License

Distributed under the MIT License. See [`LICENSE`](../LICENSE) for details.

## Author

**Hemnath KK** — [GitHub](https://github.com/hemnath-kandasamyk)
