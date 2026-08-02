'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('products', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      retailerId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'retailers', key: 'id' },
        onDelete: 'CASCADE',
      },
      name: { type: Sequelize.STRING, allowNull: false },
      category: { type: Sequelize.STRING },
      rackLocation: { type: Sequelize.STRING },
      costPrice: { type: Sequelize.FLOAT, allowNull: false, defaultValue: 0 },
      sellingPrice: { type: Sequelize.FLOAT, allowNull: false, defaultValue: 0 },
      expiryDate: { type: Sequelize.DATEONLY, allowNull: true },
      lowStockThreshold: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 5 },
      isActive: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex('products', ['retailerId']);
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('products');
  },
};
