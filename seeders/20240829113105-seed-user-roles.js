'use strict';

const { UserRoles, User, Role } = require('../models');

module.exports = {
  up: async (queryInterface, Sequelize) => {

    const userRolesMappings = [
      { userId: '1c260ab2-df12-4890-b55f-20f277b00a1c', roleId: 'dc077294-0f06-4839-bd7d-e2843431996f' },  // ------here id shoud be admin user and the admin role it is static

    ];

    for (const mapping of userRolesMappings) {
      const { userId, roleId } = mapping;


      const userExists = await User.findByPk(userId);
      const roleExists = await Role.findByPk(roleId);

      if (!userExists) {
        console.log(`User with ID ${userId} does not exist.`);
        continue;
      }

      if (!roleExists) {
        console.log(`Role with ID ${roleId} does not exist.`);
        continue;
      }

      const [userRole, created] = await UserRoles.findOrCreate({
        where: {
          user_id: userId,
          role_id: roleId,
        },
        defaults: {

        },
      });

      if (created) {
        console.log(`Role ${roleId} assigned to user ${userId}.`);
      } else {
        console.log(`User ${userId} already assigned to role ${roleId}.`);
      }
    }
  },

  down: async (queryInterface, Sequelize) => {

    await queryInterface.bulkDelete('user_roles', null, {});
  }
};
