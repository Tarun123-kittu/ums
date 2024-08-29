'use strict';

const { Roles, Permissions, RolesPermissions } = require('../models');

module.exports = {
  up: async (queryInterface, Sequelize) => {
  
    const roles = await Roles.findAll({ attributes: ['id'] });
    const permissions = await Permissions.findAll({ attributes: ['id'] });

    
    for (const role of roles) {
      for (const permission of permissions) {
        await RolesPermissions.findOrCreate({
          where: {
            role_id: role.id,
            permission_id: permission.id,
          },
          defaults: {
            status: true, 
          },
        });
      }
    }
  },

  down: async (queryInterface, Sequelize) => {
    
    await queryInterface.bulkDelete('RolesPermissions', null, {});
  }
};
