'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('test_series', {
            id: {
                allowNull: false,
                primaryKey: true,
                type: Sequelize.INTEGER,
                autoIncrement: true,
            },
            language_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'Languages',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
            },
            series_name: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            status: {
                type: Sequelize.ENUM('pending', 'completed'),
                allowNull: false,
                defaultValue: 'pending',
            },
            time_taken: {
                type: Sequelize.TIME,
                allowNull: false,
            },
            description: {
                type: Sequelize.STRING(500),
                allowNull: false,
            },
            createdBy: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            experience_level:{
                type: Sequelize.ENUM('fresher', 'intermediate','professional'),
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
        await queryInterface.dropTable('test_series');
    },
};
