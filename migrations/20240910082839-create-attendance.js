'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('Attendances', {
            id: {
                allowNull: false,
                primaryKey: true,
                type: Sequelize.INTEGER,
                autoIncrement: true,
            },
            date: {
                type: Sequelize.DATEONLY,
                allowNull: true,
            },
            user_id: {
                type: Sequelize.INTEGER,
                allowNull: true
            },
            in_time: {
                type: Sequelize.TIME,
                allowNull: true,
            },
            out_time: {
                type: Sequelize.TIME,
                allowNull: true,
            },
            total_time: {
                type: Sequelize.TIME,
                allowNull: true,
            },
            on_break: {
                type: Sequelize.INTEGER,
                allowNull: true,
                defaultValue: 0,
            },
            status: {
                type: Sequelize.ENUM('PRESENT', 'ABSENT', 'LEAVE', 'SUSPENDED'),
                allowNull: true,
                defaultValue: 'ABSENT',
            },
            report: {
                type: Sequelize.STRING(2000),
                allowNull: true,
            },
            remark: {
                type: Sequelize.STRING(2000),
                allowNull: true,
            },
            rating: {
                type: Sequelize.FLOAT,
                allowNull: true,
                defaultValue: 5,
            },
            login_device: {
                type: Sequelize.STRING(100),
                allowNull: true,
            },
            login_mobile: {
                type: Sequelize.STRING(100),
                allowNull: true,
            },
            logout_device: {
                type: Sequelize.STRING(100),
                allowNull: true,
            },
            logout_mobile: {
                type: Sequelize.STRING(100),
                allowNull: true,
            },
            created_by: {
                type: Sequelize.INTEGER,
                allowNull: true,
            },
            createdAt: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.NOW,
            },
            updatedAt: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.NOW,
                onUpdate: Sequelize.NOW,
            },
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('Attendances');
    },
};
