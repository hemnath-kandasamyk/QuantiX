'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('users', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      retailerId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'retailers', key: 'id' },
        onDelete: 'CASCADE',
      },
      name: { type: Sequelize.STRING, allowNull: false },
      email: { type: Sequelize.STRING, allowNull: false, unique: true },
      passwordHash: { type: Sequelize.STRING, allowNull: false },
      role: { type: Sequelize.ENUM('admin', 'staff'), allowNull: false, defaultValue: 'staff' },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('users');
    // Postgres leaves the ENUM type behind after dropping the table.
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_users_role";').catch(() => {});
  },
};
