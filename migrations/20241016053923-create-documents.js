'use strict';


module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('Documents', {
            id: {
                allowNull: false,
                primaryKey: true,
                type: Sequelize.INTEGER,
                autoIncrement: true,
            },
            user_id: {
              type: Sequelize.INTEGER,
              allowNull: true,
            },
            document_name: {
              type: Sequelize.STRING,
              allowNull: true,
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
        await queryInterface.dropTable('Documents');
    },
};
