require('dotenv').config();
const path = require('path');

// Used by both sequelize-cli (migrations/seeders) and src/config/database.js
// (the app's runtime connection), so schema and app always agree.
//
// Folder structure assumed:
//   backend/
//     data/                     <- SQLite file lives here (dev/test)
//     database/
//       config/
//         config.js              <- this file
//
// - development / test: local SQLite file, zero setup required.
// - production: Postgres via a single DATABASE_URL (this is what Render,
//   Railway, Heroku, Supabase, etc. all give you when you provision a
//   Postgres database — just paste it into your platform's env vars).

if (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL) {
  console.error(
    'FATAL: DATABASE_URL is not set. In production this must be your ' +
    "Postgres connection string, set as an environment variable on the " +
    "backend service itself (not just visible on the database resource's page)."
  );
  process.exit(1);
}

module.exports = {
  development: {
    dialect: 'sqlite',
    // __dirname = backend/database/config
    // '..'      -> backend/database
    // '..'      -> backend
    // then      -> backend/data/retail.sqlite
    storage: path.resolve(__dirname, '..', '..', 'data', 'retail.sqlite'),
    logging: false,
  },
  test: {
    dialect: 'sqlite',
    storage: ':memory:',
    logging: false,
  },
  production: {
    use_env_variable: 'DATABASE_URL',
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      // Most hosted Postgres providers (Render, Railway, Supabase, RDS)
      // require SSL but use a self-signed/managed cert chain, so we
      // disable strict verification rather than needing to vendor a CA cert.
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  },
};
