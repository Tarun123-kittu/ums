'use strict';

const bcrypt = require('bcrypt');
const { User } = require('../models'); 

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {

      const existingUser = await User.findOne({ where: { email: 'admin@gmail.com' } });

      if (existingUser) {
        console.log('This email is already used.');
        return;
      }

    
      const hashedPassword = await bcrypt.hash('admin1234', 10);


      await User.create({
        username: 'admin',
        email: 'admin@gmail.com',
        password: hashedPassword,
      });

      console.log('User created successfully.');
    } catch (error) {
      console.error('Error in seeding:', error);
    }
  },

  down: async (queryInterface, Sequelize) => {
    await User.destroy({ where: { email: 'admin@gmail.com' } });
  },
};
