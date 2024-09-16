  
'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('Languages', {
            id: {
                allowNull: false,
                primaryKey: true,
                type: Sequelize.INTEGER,
                autoIncrement: true,
            },
            language: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.NOW,
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.NOW,
            },
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('Languages');
    },
};
