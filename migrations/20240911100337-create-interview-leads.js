'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('Interview_Leads', {
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
            phone_number: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true, 
            },
            email: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true, 
            },
            gender: {
                type: Sequelize.ENUM('Male', 'Female', 'Other'),
                allowNull: false,
            },
           dob: {
              type: Sequelize.DATEONLY,
              allowNull: false,
              },
            experience: {
                type: Sequelize.INTEGER,
                allowNull: true, 
                defaultValue: null,
            },
            current_salary: {
                type: Sequelize.FLOAT,
                allowNull: true, 
                defaultValue: null,
            },
            expected_salary: {
                type: Sequelize.FLOAT,
                allowNull: true, 
                defaultValue: null,
            },
            profile: {
                type: Sequelize.STRING,
                allowNull: true,
                defaultValue: null,
            },
            last_company: {
                type: Sequelize.STRING,
                allowNull: true, 
                defaultValue: null,
            },
            state: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            house_address: {
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
        await queryInterface.dropTable('Interview_Leads');
    },
};