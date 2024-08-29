'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('Users', 'createdAt', {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    });
    await queryInterface.changeColumn('Users', 'updatedAt', {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('Users', 'createdAt', {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: null
    });
    await queryInterface.changeColumn('Users', 'updatedAt', {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: null
    });
  }
};
