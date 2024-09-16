let { sequelize } = require('../models')
let { errorResponse, successResponse } = require("../utils/responseHandler")



exports.add_objective = async (req, res) => {
    try {
        const t = await sequelize.transaction();

        const { test_series_id, language_id, question, options, correct_option_number } = req.body;

        if (correct_option_number < 1 || correct_option_number > options.length) {
            throw new Error('Correct option number is out of range');
        }

        if (options.length !== 4) {
            throw new Error('Exactly four options are needed for objective questions');
        }


        const createQuestionQuery = `
            INSERT INTO technical_round_questions (test_series_id, language_id, question_type, question, createdAt, updatedAt)
            VALUES (?, ?, 'objective', ?, NOW(), NOW());
          `;
        const [results] = await sequelize.query(createQuestionQuery, {
            replacements: [test_series_id, language_id, question],
            transaction: t
        });

        const newQuestionId = results;


        const createOptionQuery = `
  INSERT INTO Options (question_id, option,createdAt, updatedAt)
  VALUES (?, ?,NOW(), NOW());
`;

        const optionIds = await Promise.all(options.map(async (option, index) => {
            const [result, metadata] = await sequelize.query(createOptionQuery, {
                replacements: [newQuestionId, option],
                transaction: t
            });


            const optionId = result

            return {
                id: optionId,
                index: index + 1
            };
        }));



        const correctOptionId = optionIds.find(option => option.index === correct_option_number).id;


        await sequelize.query(`
            INSERT INTO Answers (language_id, series_id, answer, question_id, correct_answer, correct_option, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW());
          `, {
            replacements: [
                language_id,
                test_series_id,
                null,
                newQuestionId,
                correctOptionId,
                correctOptionId
            ],
            transaction: t
        });

        await t.commit();
        res.status(201).json({ message: 'Objective question and related data created successfully' });
    } catch (error) {
        console.log("ERROR::", error)
        return res.status(500).json(errorResponse(error.message))
    }
}




exports.add_subjective = async (req, res) => {
    try {

        const t = await sequelize.transaction();

        const { test_series_id, language_id, question, answer } = req.body;

        const createQuestionQuery = `
          INSERT INTO technical_round_questions (test_series_id, language_id, question_type, question, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, NOW(), NOW());
        `;
        console.log("test ----", test_series_id, language_id, question)
        const [results] = await sequelize.query(createQuestionQuery, {
            replacements: [test_series_id, language_id, "subjective", question],
            transaction: t
        });

        const newQuestionId = results;

        console.log(language_id,
            test_series_id,
            answer,
            newQuestionId,
            answer)

        await sequelize.query(`
          INSERT INTO Answers (language_id, series_id, answer, question_id, correct_answer, correct_option, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, NULL, NOW(), NOW());
        `, {
            replacements: [
                language_id,
                test_series_id,
                answer,
                newQuestionId,
                answer
            ],
            transaction: t
        });

        await t.commit();
        res.status(201).json({ message: 'Subjective question and related data created successfully' });
    } catch (error) {
        console.log("ERROR::", error)
        return res.status(500).json(errorResponse(error.message))
    }
}




exports.add_logical = async (req, res) => {
    try {
        const { test_series_id, language_id, question, answer } = req.body;

        const createQuestionQuery = `
          INSERT INTO technical_round_questions (test_series_id, language_id, question_type, question, createdAt, updatedAt)
          VALUES (?, ?, 'logical', ?, NOW(), NOW());
        `;
        const [results] = await sequelize.query(createQuestionQuery, {
          replacements: [test_series_id, language_id, question],
          transaction: t
        });
    
        const newQuestionId = results.insertId;
        
        await sequelize.query(`
          INSERT INTO Answers (language_id, series_id, answer, question_id, correct_answer, correct_option, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, NULL, NOW(), NOW());
        `, {
          replacements: [
            language_id,
            test_series_id,
            answer,
            newQuestionId,
            answer
          ],
          transaction: t
        });
    
        await t.commit();
        res.status(201).json({ message: 'Logical question and related data created successfully' });
    } catch (error) {
        console.log("ERROR::", error)
        return res.status(500).json(errorResponse(error.message))
    }
}



