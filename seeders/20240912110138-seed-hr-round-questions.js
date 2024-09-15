'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
   
    await queryInterface.bulkInsert('HR_Round_Questions', [
      {
        question: 'What motivates you in the workplace?',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        question: 'Can you describe a time when you handled a difficult situation?',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        question: 'How do you prioritize your tasks when there are competing deadlines?',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        question: 'Tell us about a time you disagreed with a coworker. How did you handle it?',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        question: 'Why do you think you are a good fit for this position?',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
  
    await queryInterface.bulkDelete('HR_Round_Questions', null, {});
  }
};
