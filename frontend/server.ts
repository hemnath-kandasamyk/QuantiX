/**
 * Frontend host server.
 *
 * This file used to also contain a full in-memory MOCK backend (fake auth,
 * in-memory products/sales/staff arrays, a duplicate /api/ai/chat route).
 * That mock has been removed: the app now talks to the real backend in
 * ../backend (Express + Sequelize + SQLite + JWT auth) via the Vite dev
 * proxy configured in vite.config.ts (see the `server.proxy['/api']` block).
 *
 * This file's only remaining job is to host the SPA:
 *  - in development: run Vite in middleware mode for HMR
 *  - in production: serve the built `dist/` folder and fall back to
 *    index.html for client-side routing
 *
 * Run the real API separately:
 *   cd backend && npm install && npm run seed && npm run dev
 */
import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = Number(process.env.PORT) || 3000;

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`QuantiX frontend running on http://localhost:${PORT}`);
    console.log(`Make sure the backend is running separately on port 4000.`);
  });
}

startServer();
