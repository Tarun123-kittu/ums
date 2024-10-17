'use strict';

const { Language } = require('../models');

module.exports = {
    up: async (queryInterface, Sequelize) => {
        const languages = [
           
            { language: 'JavaScript', createdAt: new Date(), updatedAt: new Date() },
            { language: 'Python', createdAt: new Date(), updatedAt: new Date() },
            { language: 'Java', createdAt: new Date(), updatedAt: new Date() },
            { language: 'C++', createdAt: new Date(), updatedAt: new Date() },
            { language: 'C#', createdAt: new Date(), updatedAt: new Date() },
            { language: 'PHP', createdAt: new Date(), updatedAt: new Date() },
            { language: 'Ruby', createdAt: new Date(), updatedAt: new Date() },
            { language: 'TypeScript', createdAt: new Date(), updatedAt: new Date() },
            { language: 'Go', createdAt: new Date(), updatedAt: new Date() },
            { language: 'Swift', createdAt: new Date(), updatedAt: new Date() },
            { language: 'Kotlin', createdAt: new Date(), updatedAt: new Date() },
            { language: 'SQL', createdAt: new Date(), updatedAt: new Date() },
            { language: 'React', createdAt: new Date(), updatedAt: new Date() },
            { language: 'Angular', createdAt: new Date(), updatedAt: new Date() },
            { language: 'Vue.js', createdAt: new Date(), updatedAt: new Date() },
            { language: 'Node.js', createdAt: new Date(), updatedAt: new Date() },
            { language: 'Django', createdAt: new Date(), updatedAt: new Date() },
            { language: 'Flask', createdAt: new Date(), updatedAt: new Date() },
            { language: 'Spring Boot', createdAt: new Date(), updatedAt: new Date() },
            { language: 'Laravel', createdAt: new Date(), updatedAt: new Date() },
            { language: 'Ruby on Rails', createdAt: new Date(), updatedAt: new Date() },
            { language: 'ASP.NET', createdAt: new Date(), updatedAt: new Date() },
            { language: 'Bubble', createdAt: new Date(), updatedAt: new Date() },
            { language: 'Wordpress', createdAt: new Date(), updatedAt: new Date() },
          
            { language: 'Designing', createdAt: new Date(), updatedAt: new Date() },
            { language: 'Frontend', createdAt: new Date(), updatedAt: new Date() },
            { language: 'Backend', createdAt: new Date(), updatedAt: new Date() },
            { language: 'Full Stack', createdAt: new Date(), updatedAt: new Date() },
            { language: 'DevOps', createdAt: new Date(), updatedAt: new Date() },
            { language: 'QA', createdAt: new Date(), updatedAt: new Date() },
            { language: 'Business Analyst', createdAt: new Date(), updatedAt: new Date() },
            { language: 'Product Manager', createdAt: new Date(), updatedAt: new Date() },
            { language: 'Project Manager', createdAt: new Date(), updatedAt: new Date() },
            { language: 'UI/UX Designer', createdAt: new Date(), updatedAt: new Date() },
            { language: 'HR', createdAt: new Date(), updatedAt: new Date() },
            { language: 'Business Development', createdAt: new Date(), updatedAt: new Date() },
            { language: 'Data Scientist', createdAt: new Date(), updatedAt: new Date() },
            { language: 'Machine Learning', createdAt: new Date(), updatedAt: new Date() },
            { language: 'Data Analyst', createdAt: new Date(), updatedAt: new Date() },
            { language: 'Security Analyst', createdAt: new Date(), updatedAt: new Date() },
            { language: 'Cloud', createdAt: new Date(), updatedAt: new Date() },
            { language: 'Android', createdAt: new Date(), updatedAt: new Date() },
            { language: 'iOS', createdAt: new Date(), updatedAt: new Date() },

        ];

        for (const language of languages) {
            const [existingLanguage, created] = await Language.findOrCreate({
                where: { language: language.language },
                defaults: {
                    language: language.language,
                    createdAt: new Date(),
                    updatedAt: new Date()
                }
            });

            if (!created) {
                console.log(`Language '${language.language}' already exists.`);
            }
        }
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.bulkDelete('Languages', null, {});
    }
};
