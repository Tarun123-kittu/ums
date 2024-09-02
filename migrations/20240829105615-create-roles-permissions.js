'use strict';
// @type {import('sequelize-cli').Migration} /

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Roles_Permissions', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.INTEGER, // Change to INTEGER for auto-incrementing
        autoIncrement: true, // Add this line for auto-incrementing
      },
      role_id: {
        type: Sequelize.INTEGER, // Change to INTEGER to match Roles table
        references: {
          model: 'Roles', // Table name in plural or singular depending on your convention
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      permission_id: {
        type: Sequelize.INTEGER, // Change to INTEGER to match Permissions table
        references: {
          model: 'Permissions', // Table name in plural or singular depending on your convention
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      can_view: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      can_create: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      can_update: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      can_delete: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Roles_Permissions');
  },
};
