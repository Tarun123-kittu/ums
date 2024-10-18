'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('technical_round', {
            id: {
                allowNull: false,
                primaryKey: true,
                type: Sequelize.INTEGER,
                autoIncrement: true,
            },
            interview_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            lead_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            question_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            answer: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            answer_status: {
                type: Sequelize.ENUM('correct', 'incorrect', 'not_attempted'),
                allowNull: true,
            },
            key_point: {
                type: Sequelize.STRING(1000),
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
        await queryInterface.dropTable('technical_round');
    },
};
