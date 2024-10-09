'use strict';


module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('Interviews', {
            id: {
                allowNull: false,
                primaryKey: true,
                type: Sequelize.INTEGER,
                autoIncrement: true,    
            },
            lead_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            interview_link_click_count: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },
            hr_round_result: {
                type: Sequelize.ENUM('selected', 'rejected', 'pending', 'on hold'),
                allowNull: true,
                defaultValue: 'pending',
            },
            technical_round_result: {
                type: Sequelize.ENUM('selected', 'rejected', 'pending', 'on hold','opened'),
                allowNull: true,
                defaultValue: 'pending',
            },
            technical_round_checked_by:{
                type: Sequelize.TEXT,
                allowNull: false,
            },
            face_to_face_result:{
                type: Sequelize.ENUM('selected', 'rejected', 'pending', 'on hold'),
                allowNull: true,
                defaultValue: 'pending',
            },
            final_result:{
                type: Sequelize.ENUM('selected', 'rejected', 'pending', 'on hold'),
                allowNull: true,
                defaultValue: 'pending',
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
        await queryInterface.dropTable('Interviews');
    },
};
