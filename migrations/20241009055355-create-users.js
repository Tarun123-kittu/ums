'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('Users', {
            id: {
                allowNull: false,
                primaryKey: true,
                type: Sequelize.INTEGER,
                autoIncrement: true,
            },
            name: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            username: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            email: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true,
            },
            mobile: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            emergency_contact_relationship: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            emergency_contact_name: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            emergency_contact: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            bank_name: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            account_number: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            ifsc: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            increment_date: {
                type: Sequelize.DATE,
                allowNull: true,
            },
            pending_leave: {
                type: Sequelize.INTEGER(11),
                allowNull: true,
            },
            gender: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            dob: {
                type: Sequelize.DATE,
                allowNull: false,
            },
            doj: {
                type: Sequelize.DATE,
                allowNull: false,
            },
            skype_email: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            ultivic_email: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            salary: {
                type: Sequelize.FLOAT,  
                allowNull: true,
            },
            security: {
                type: Sequelize.FLOAT,
                allowNull: true,
            },
            total_security: {
                type: Sequelize.FLOAT,
                allowNull: true,
            },
            installments: {
                type: Sequelize.INTEGER,
                allowNull: true,
            },
            position: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            department: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            status: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            password: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            address: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            role: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            password_reset_token: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            is_disabled: {
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
        await queryInterface.dropTable('Users');
    },
};
