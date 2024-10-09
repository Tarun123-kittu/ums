'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {

        await queryInterface.renameColumn('user_roles', 'created_at', 'createdAt');


        await queryInterface.renameColumn('user_roles', 'updated_at', 'updatedAt');
    },

    down: async (queryInterface, Sequelize) => {

        await queryInterface.renameColumn('user_roles', 'createdAt', 'created_at');


        await queryInterface.renameColumn('user_roles', 'updatedAt', 'updated_at');
    }
};
