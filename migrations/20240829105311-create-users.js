'use strict';
// @type {import('sequelize-cli').Migration} /

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Users', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.INTEGER, // Change to INTEGER for auto-incrementing
        autoIncrement: true, // Add this line for auto-incrementing
      },
      username: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      password_reset_token: {
        type: Sequelize.STRING, // Adjust the type as needed
        allowNull: true, // Allowing null since not all users will have a reset token
      },
      password_reset_token_expires_in: {
        type: Sequelize.DATE, // Add the new field here
        allowNull: true, // Allowing null if the token expiration date is not set
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
    await queryInterface.dropTable('Users');
  },
};
