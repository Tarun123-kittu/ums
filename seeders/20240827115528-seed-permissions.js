'use strict';

const { Permission } = require('../models'); 

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const permissions = [
      { permission: 'Salary create', createdAt: new Date(), updatedAt: new Date() },
      { permission: 'Salary update', createdAt: new Date(), updatedAt: new Date() },
      { permission: 'Salary read', createdAt: new Date(), updatedAt: new Date() },
      { permission: 'Attendance read', createdAt: new Date(), updatedAt: new Date() },
      { permission: 'Attendance update', createdAt: new Date(), updatedAt: new Date() },
      { permission: 'Candidate create', createdAt: new Date(), updatedAt: new Date() },
      { permission: 'Candidate read', createdAt: new Date(), updatedAt: new Date() },
      { permission: 'Candidate update', createdAt: new Date(), updatedAt: new Date() },
      { permission: 'Candidate delete', createdAt: new Date(), updatedAt: new Date() },
      { permission: 'HR create', createdAt: new Date(), updatedAt: new Date() },
      { permission: 'HR delete', createdAt: new Date(), updatedAt: new Date() },
      { permission: 'Test create', createdAt: new Date(), updatedAt: new Date() },
      { permission: 'Test read', createdAt: new Date(), updatedAt: new Date() },
      { permission: 'Test update', createdAt: new Date(), updatedAt: new Date() },
      { permission: 'Test delete', createdAt: new Date(), updatedAt: new Date() },
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
