'use strict';

const { Permission } = require('../models'); 

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const permissions = [
      { permission: 'Salary', createdAt: new Date(), updatedAt: new Date() },
      { permission: 'Attandance', createdAt: new Date(), updatedAt: new Date() },
      { permission: 'Events', createdAt: new Date(), updatedAt: new Date() },
      { permission: 'Interviews', createdAt: new Date(), updatedAt: new Date() },
    ];

    for (const permission of permissions) {
      const [existingPermission, created] = await Permission.findOrCreate({
        where: { permission: permission.permission },
        defaults: permission,
      });

      if (!created) {
        console.log(`Permission '${permission.permission}' already exists.`);
      }
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Permissions', null, {});
  }
};
