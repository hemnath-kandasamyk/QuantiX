const { Sequelize } = require('sequelize');
const path = require('path');

// Uses SQLite for zero-config local/demo use.
// To move to PostgreSQL/MySQL in production, swap the dialect + connection
// string below (Sequelize supports both with no model changes needed).
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '..', '..', 'data', 'retail.sqlite'),
  logging: false,
});

module.exports = sequelize;
