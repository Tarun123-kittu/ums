'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('holidays_and_events', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.INTEGER,
        autoIncrement: true,
      },
      occasion_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      occasion_type: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      occasion_description: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      date: {
        type: Sequelize.DATE,
        allowNull: false,
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
        onUpdate: Sequelize.NOW,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('holidays_and_events');
  },
};
