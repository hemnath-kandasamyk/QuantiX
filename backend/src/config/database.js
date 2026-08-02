const { Sequelize } = require('sequelize');
const config = require('../../database/config/config.js')[process.env.NODE_ENV || 'development'];

// Single source of truth: this file and sequelize-cli both read
// database/config/config.js, so the schema you migrate and the schema
// your app connects to can never drift apart.
//
//  - development/test -> local SQLite file (or in-memory for test), zero setup.
//  - production        -> Postgres via DATABASE_URL (see database/config/config.js).
const sequelize = config.use_env_variable
  ? new Sequelize(process.env[config.use_env_variable], config)
  : new Sequelize(config);

module.exports = sequelize;
