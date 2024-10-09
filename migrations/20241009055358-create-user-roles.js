'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('user_roles', {
            id: {
                allowNull: false,
                primaryKey: true,
                type: Sequelize.INTEGER,
                autoIncrement: true,
            },
            user_id: {
                type: Sequelize.INTEGER, 
                references: {
                    model: 'Users', 
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE', 
            },
            role_id: {
                type: Sequelize.INTEGER, 
                references: {
                    model: 'Roles',
                    key: 'id',
                },
                onUpdate: 'CASCADE', 
                onDelete: 'CASCADE', 
            },
            is_disabled: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false,
              },
            createdAt: {
                type: Sequelize.DATE,
                defaultValue: Sequelize.NOW,
            },
            updatedAt: {
                type: Sequelize.DATE,
                defaultValue: Sequelize.NOW,
            },
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('user_roles');
    }
};