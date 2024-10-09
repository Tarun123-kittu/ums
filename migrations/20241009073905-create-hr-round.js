
'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('HR_Rounds', {
            id: {
                allowNull: false,
                primaryKey: true,
                type: Sequelize.INTEGER,
                autoIncrement: true,
            },
            interview_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'Interviews',
                    key: 'id',
                },
                onDelete: 'CASCADE',
            },
            lead_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'Interview_Leads',
                    key: 'id',
                },
                onDelete: 'CASCADE',
            },
            questionid: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'HR_Round_Questions',
                    key: 'id',
                },
                onDelete: 'CASCADE',
            },
            answer: {
                type: Sequelize.TEXT,
                allowNull: true,
            },
            key_point: {
                type: Sequelize.STRING(1000),
                allowNull: true,
            },
            auth_token: {
                type: Sequelize.STRING(500),
                allowNull: false,
            },
            is_open: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false,
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
        await queryInterface.dropTable('HR_Rounds');
    },
};
