'use strict';

const { Role } = require('../models'); 

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const roles = [
      { role: 'Admin', createdAt: new Date(), updatedAt: new Date() },
      { role: 'HR', createdAt: new Date(), updatedAt: new Date() },
      { role: 'Candidate', createdAt: new Date(), updatedAt: new Date() },
      { role: 'Developer', createdAt: new Date(), updatedAt: new Date() }
    ];

    for (const role of roles) {
      const [existingRole, created] = await Role.findOrCreate({
        where: { role: role.role },
        defaults: role,
      });
      if (!created) {
        console.log(`Role '${role.role}' already exists.`);
      }
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Roles', null, {});
  }
};
