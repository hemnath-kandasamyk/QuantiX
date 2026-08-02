require('dotenv').config();
const path = require('path');

// Used by both sequelize-cli (migrations/seeders) and src/config/database.js
// (the app's runtime connection), so schema and app always agree.
//
// - development / test: local SQLite file, zero setup required.
// - production: Postgres via a single DATABASE_URL (this is what Render,
//   Railway, Heroku, Supabase, etc. all give you when you provision a
//   Postgres database — just paste it into your platform's env vars).
module.exports = {
  development: {
    dialect: 'sqlite',
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
