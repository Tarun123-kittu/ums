'use strict';

const { Permissions } = require('../models'); 


module.exports = {
  up: async (queryInterface, Sequelize) => {
    const permissions = [
      { permission: 'Salary create' },
      { permission: 'Salary update' },
      { permission: 'Salary read' },
      { permission: 'Attandence read'},
      { permission: 'Attandence update'},
      { permission:'Candidate create'},
      { permission:'Candidate read'},
      { permission:'Candidate update'},
      { permission:'Candidate delete'},
      { permission: 'HR create'},
      { permission: 'HR delete'},
      { permission: 'Test create'},
      { permission: 'Test read'},
      { permission: 'Test update'},
      { permission: 'Test delete'},
    ];

    for (const permission of permissions) {
      const [existingPermission, created] = await Permissions.findOrCreate({
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
