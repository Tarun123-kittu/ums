'use strict';

const { Permission } = require('../models');

module.exports = {
    up: async (queryInterface, Sequelize) => {
        const permissions = [
            { permission: 'Salary', createdAt: new Date(), updatedAt: new Date() },
            { permission: 'Attandance', createdAt: new Date(), updatedAt: new Date() },
            { permission: 'Events', createdAt: new Date(), updatedAt: new Date() },
            { permission: 'Interviews', createdAt: new Date(), updatedAt: new Date() },
            { permission: 'Users', createdAt: new Date(), updatedAt: new Date() },
            { permission: 'Test', createdAt: new Date(), updatedAt: new Date() },
            { permission: 'Leaves', createdAt: new Date(), updatedAt: new Date() },
            { permission: 'Dashboard', createdAt: new Date(), updatedAt: new Date() },
            { permission: 'Teams', createdAt: new Date(), updatedAt: new Date() }
        ];

        for (const permission of permissions) {
            const [existingPermission, created] = await Permission.findOrCreate({
                where: { permission: permission.permission },
                defaults: {
                    permission: permission.permission,
                    is_disabled: false
                },
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