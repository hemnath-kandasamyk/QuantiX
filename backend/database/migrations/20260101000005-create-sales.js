'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('sales', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      retailerId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'retailers', key: 'id' },
        onDelete: 'CASCADE',
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' },
      },
      totalAmount: { type: Sequelize.FLOAT, allowNull: false, defaultValue: 0 },
      paymentMode: { type: Sequelize.STRING, defaultValue: 'cash' },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.createTable('sale_items', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      saleId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'sales', key: 'id' },
        onDelete: 'CASCADE',
      },
      productId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'products', key: 'id' },
      },
      quantitySold: { type: Sequelize.INTEGER, allowNull: false },
      priceAtSale: { type: Sequelize.FLOAT, allowNull: false },
      costAtSale: { type: Sequelize.FLOAT, allowNull: false, defaultValue: 0 },
      createdAt: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.addIndex('sales', ['retailerId', 'createdAt']);
    await queryInterface.addIndex('sale_items', ['saleId']);
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('sale_items');
    await queryInterface.dropTable('sales');
  },
};
