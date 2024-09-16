'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('leaves', {
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
            from_date: {
                type: Sequelize.DATEONLY,  
                allowNull: true,
            },
            to_date: {
                type: Sequelize.DATEONLY, 
                allowNull: true,
            },
            count: {
                type: Sequelize.FLOAT,
                allowNull: true,
            },
            count_from: {
                type: Sequelize.TINYINT,
                allowNull: true,
            },
            count_to: {
                type: Sequelize.TINYINT,
                allowNull: true,
            },
            sandwich: {
                type: Sequelize.TINYINT,
                allowNull: true,
                defaultValue: 0,
            },
            description: {
                type: Sequelize.STRING(500), 
                allowNull: true,
            },
            type: {
                type: Sequelize.STRING(50),  
                allowNull: true,
            },
            status: {
                type: Sequelize.ENUM('ACCEPTED', 'REJECTED', 'PENDING', 'CANCELLED'),  
                allowNull: true,
                defaultValue: 'PENDING',
            },
            status_changed_by: {
                type: Sequelize.INTEGER,
                allowNull: true,
            },
            remark: {
                type: Sequelize.STRING(200),  
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
        await queryInterface.dropTable('leaves');
    },
};