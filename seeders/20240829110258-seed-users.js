'use strict';

const bcrypt = require('bcrypt');
const { User } = require('../models');

module.exports = {
    up: async (queryInterface, Sequelize) => {
        try {
            // Check if the user with the given email already exists
            const existingUser = await User.findOne({ where: { email: 'admin@gmail.com' } });

            if (existingUser) {
                console.log('This email is already used.');
                return;
            }

            // Hash the password
            const hashedPassword = await bcrypt.hash('admin1234', 10);

            // Create the new user
            await User.create({
                username: 'admin',
                name: 'Admin User',
                email: 'admin@gmail.com',
                mobile: '1234567890',
                emergency_contact_name: 'admin_contact',
                emergency_contact_relationship: 'Friend',
                emergency_contact: '0987654321',
                bank_name: 'Bank Name',
                account_number: '1234567890123456',
                ifsc: 'IFSC0001234',
                increment_date: new Date(),
                gender: 'Female',
                dob: new Date('2000-01-01'),
                doj: new Date('2023-09-01'),
                skype_email: 'admin.skype@example.com',
                ultivic_email: 'admin.ultivic@ultivic.com',
                salary: 50000,
                security: 10000,
                total_security: 50000,
                installments: 5,
                position: 'Manager',
                department: 'HR',
                status: 'Active',
                password: hashedPassword,
                address: '123 Admin Street, Admin City, Admin State, 123456',
                role: 'Admin',
                is_disabled: false,
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
