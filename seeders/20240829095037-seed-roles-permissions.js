'use strict';

const { Role, Permission, RolesPermissions } = require('../models');



module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      const roles = await Role.findAll({ attributes: ['id'] });
      const permissions = await Permission.findAll({ attributes: ['id'] });


      for (const role of roles) {
        for (const permission of permissions) {
          await RolesPermissions.findOrCreate({
            where: {
              role_id: role.id,
              permission_id: permission.id,
            },
            defaults: {
              can_view: true,
              can_create: true,
              can_update: true,
              can_delete: true
            },
          });
        }
      }
    } catch (error) {
      console.error('Error in seeding:', error);
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('roles_permissions', null, {});
  },
};
