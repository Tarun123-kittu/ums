'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('user_roles', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.INTEGER, // Change to INTEGER for auto-incrementing
        autoIncrement: true, // Add this line for auto-incrementing
      },
      user_id: {
        type: Sequelize.INTEGER, // Change to INTEGER to match the Users table
        references: {
          model: 'Users', // Ensure this matches the name of the Users table
          key: 'id',
        },
        onUpdate: 'CASCADE', // Optional: Define behavior on update
        onDelete: 'CASCADE', // Optional: Define behavior on delete
      },
      role_id: {
        type: Sequelize.INTEGER, // Change to INTEGER to match the Roles table
        references: {
          model: 'Roles', // Ensure this matches the name of the Roles table
          key: 'id',
        },
        onUpdate: 'CASCADE', // Optional: Define behavior on update
        onDelete: 'CASCADE', // Optional: Define behavior on delete
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('user_roles');
  }
};
