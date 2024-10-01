let { sequelize } = require('../models')
let { errorResponse, successResponse } = require("../utils/responseHandler")



exports.add_objective = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { test_series_id, language_id, question, options, correct_option_number } = req.body;

        console.log(test_series_id, language_id, question, options, correct_option_number)


        if (!test_series_id || !language_id || !question || !options || options.length !== 4 || !correct_option_number) {
            await t.rollback();
            return res.status(400).json({ success: false, message: 'Test series ID, language ID, question, options (exactly 4), and correct option number are required.' });
        }

        if (isNaN(parseInt(test_series_id)) || isNaN(parseInt(language_id)) || isNaN(parseInt(correct_option_number))) {
            await t.rollback();
            return res.status(400).json({ success: false, message: 'Invalid Test Series ID, Language ID, or Correct Option Number.' });
        }

        if (correct_option_number < 1 || correct_option_number > options.length) {
            await t.rollback();
            return res.status(400).json({ success: false, message: 'Correct option number is out of range.' });
        }


        const [seriesExists] = await sequelize.query('SELECT 1 FROM test_series WHERE id = :test_series_id', {
            replacements: { test_series_id },
            transaction: t
        });


        if (seriesExists.length === 0) {
            await t.rollback();
            return res.status(404).json({ success: false, message: 'Test series not found.' });
        }


        const [languageExists] = await sequelize.query('SELECT 1 FROM languages WHERE id = :language_id', {
            replacements: { language_id },
            transaction: t
        });

        if (languageExists.length === 0) {
            await t.rollback();
            return res.status(404).json({ success: false, message: 'Language not found.' });
        }


        const createQuestionQuery = `
            INSERT INTO technical_round_questions (test_series_id, language_id, question_type, question, createdAt, updatedAt)
            VALUES (?, ?, 'objective', ?, NOW(), NOW());
        `;
        const [result] = await sequelize.query(createQuestionQuery, {
            replacements: [test_series_id, language_id, question],
            transaction: t
        });

        const createOptionQuery = `
            INSERT INTO options (question_id, option, createdAt, updatedAt)
            VALUES (?, ?, NOW(), NOW());
        `;

        const optionPromises = options.map((option) => {
            return sequelize.query(createOptionQuery, {
                replacements: [result, option],
                transaction: t
            });
        });

        const optionResults = await Promise.all(optionPromises);

        const correctOptionId = optionResults[correct_option_number - 1][0];

        await sequelize.query(`
            INSERT INTO answers (language_id, series_id, question_id, correct_option, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, NOW(), NOW());
`, {
            replacements: [language_id, test_series_id, result, correctOptionId],
            transaction: t
        });

        await t.commit();
        res.status(201).json({ success: true, message: 'Objective question and related data created successfully' });

    } catch (error) {
        await t.rollback();
        console.error("ERROR::", error);
        res.status(500).json({ success: false, message: error?.message });
    }
};

exports.add_subjective = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { test_series_id, language_id, question, answer } = req.body;


        if (!test_series_id || !language_id || !question || answer === undefined) {
            await t.rollback();
            return res.status(400).json({ success: false, message: 'Test series ID, language ID, question, and answer are required.' });
        }


        if (isNaN(parseInt(test_series_id)) || isNaN(parseInt(language_id))) {
            await t.rollback();
            return res.status(400).json({ success: false, message: 'Invalid Test Series ID or Language ID.' });
        }


        const [seriesExists] = await sequelize.query('SELECT 1 FROM test_series WHERE id = :test_series_id', {
            replacements: { test_series_id },
            transaction: t
        });

        if (seriesExists.length === 0) {
            await t.rollback();
            return res.status(404).json({ success: false, message: 'Test series not found.' });
        }


        const [languageExists] = await sequelize.query('SELECT 1 FROM languages WHERE id = :language_id', {
            replacements: { language_id },
            transaction: t
        });

        if (languageExists.length === 0) {
            await t.rollback();
            return res.status(404).json({ success: false, message: 'Language not found.' });
        }


        const createQuestionQuery = `
            INSERT INTO technical_round_questions (test_series_id, language_id, question_type, question, createdAt, updatedAt)
            VALUES (?, ?, 'subjective', ?, NOW(), NOW());
        `;
        const [result] = await sequelize.query(createQuestionQuery, {
            replacements: [test_series_id, language_id, question],
            transaction: t
        });


        if (result && result) {
            const newQuestionId = result;

            await sequelize.query(`
                INSERT INTO answers (language_id, series_id, answer, question_id, correct_option, createdAt, updatedAt)
                VALUES (?, ?, ?, ?, NULL, NOW(), NOW());
            `, {
                replacements: [language_id, test_series_id, answer, newQuestionId],
                transaction: t
            });

            await t.commit();
            res.status(200).json(successResponse("Subjective question and related data created successfully"));
        } else {
            await t.rollback();
            res.status(500).json({ success: false, message: 'Failed to insert new question.' });
        }

    } catch (error) {
        await t.rollback();
        console.error("ERROR::", error);
        res.status(500).json({ success: false, message: error?.message });
    }
};

exports.add_logical = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { test_series_id, language_id, question, answer } = req.body;


        if (!test_series_id || !language_id || !question || !answer) {
            await t.rollback();
            return res.status(400).json({ success: false, message: 'Test series ID, language ID, question, and answer are required.' });
        }


        if (isNaN(parseInt(test_series_id)) || isNaN(parseInt(language_id))) {
            await t.rollback();
            return res.status(400).json({ success: false, message: 'Invalid Test Series ID or Language ID.' });
        }


        const [seriesExists] = await sequelize.query('SELECT 1 FROM test_series WHERE id = :test_series_id', {
            replacements: { test_series_id },
            transaction: t
        });

        if (seriesExists.length === 0) {
            await t.rollback();
            return res.status(404).json({ success: false, message: 'Test series not found.' });
        }

        const [languageExists] = await sequelize.query('SELECT 1 FROM languages WHERE id = :language_id', {
            replacements: { language_id },
            transaction: t
        });

        if (languageExists.length === 0) {
            await t.rollback();
            return res.status(404).json({ success: false, message: 'Language not found.' });
        }


        const createQuestionQuery = `
            INSERT INTO technical_round_questions (test_series_id, language_id, question_type, question, createdAt, updatedAt)
            VALUES (?, ?, 'logical', ?, NOW(), NOW());
        `;
        const [result] = await sequelize.query(createQuestionQuery, {
            replacements: [test_series_id, language_id, question],
            transaction: t
        });

        const newQuestionId = result;


        await sequelize.query(`
            INSERT INTO Answers (language_id, series_id, answer, question_id, correct_option, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, NULL, NOW(), NOW());
        `, {
            replacements: [language_id, test_series_id, answer, newQuestionId],
            transaction: t
        });

        await t.commit();
        res.status(200).json(successResponse("Logical question and related data created successfully"));

    } catch (error) {
        await t.rollback();
        console.log("ERROR::", error);
        return res.status(500).json({ success: false, message: 'An error occurred while creating the logical question.' });
    }
};

exports.get_questions_answers = async (req, res) => {
    try {
        const { language_id, series_id } = req.query;

        if (!language_id || !series_id) {
            return res.status(400).json({ success: false, message: 'Language ID and Series ID are required.' });
        }

        if (isNaN(parseInt(language_id)) || isNaN(parseInt(series_id))) {
            return res.status(400).json({ success: false, message: 'Invalid Language ID or Series ID.' });
        }

        const [languageExists] = await sequelize.query('SELECT 1 FROM languages WHERE id = :language_id', {
            replacements: { language_id },
        });

        if (languageExists.length === 0) {
            return res.status(404).json({ success: false, message: 'Language not found.' });
        }

        const [seriesExists] = await sequelize.query('SELECT 1 FROM test_series WHERE id = :series_id', {
            replacements: { series_id },
        });

        if (seriesExists.length === 0) {
            return res.status(404).json({ success: false, message: 'Test series not found.' });
        }

        const query = `
                    SELECT q.id AS question_id, q.question, q.question_type, 
                o.id AS option_id, o.option, a.correct_option, a.answer 
            FROM technical_round_questions q 
            LEFT JOIN answers a ON q.id = a.question_id 
            LEFT JOIN options o ON q.id = o.question_id AND q.question_type = 'objective' -- Join only for objective questions
            WHERE q.test_series_id = :series_id 
            AND q.language_id = :language_id
            ORDER BY q.id; -- Optionally, order by question ID to keep the data structured

        `;

        const [results] = await sequelize.query(query, {
            replacements: { language_id, series_id },
        });

        const questionsMap = {};

        results.forEach(row => {
            const questionId = row.question_id;

            if (!questionsMap[questionId]) {
                questionsMap[questionId] = {
                    question_id: questionId,
                    question: row.question,
                    question_type: row.question_type,
                    options: [],
                    answer: row.answer,
                    correct_answer: row.correct_option || null
                };
            }

            if (row.question_type === 'objective' && row.option_id) {
                questionsMap[questionId].options.push({
                    option_id: row.option_id,
                    option: row.option,
                });

                if (row.correct_option && row.answer) {
                    questionsMap[questionId].correct_answer = row.answer;
                }
            }
        });

        const questionsArray = Object.values(questionsMap);
        res.send({ success: true, data: questionsArray });

    } catch (error) {
        console.error("ERROR::", error.message, error.stack);
        return res.status(500).json({ success: false, message: 'An error occurred while fetching data.' });
    }
};

exports.get_logical_subjective_questions = async (req, res) => {
    try {
        const { question_id } = req.query
        if (!question_id) return res.status(400).json({ type: "error", message: "Question id id required to perform this action" })

        const get_questions_answers = `SELECT q.id AS question_id,q.question,a.id AS answer_id,a.answer FROM technical_round_questions q JOIN answers a ON q.id = a.question_id WHERE q.id = ?`;
        const [is_question_exist] = await sequelize.query(get_questions_answers, {
            replacements: [question_id],
            type: sequelize.QueryTypes.SELECT,
        });
        if (!is_question_exist) return res.status(400).json({ type: "error", message: "Question not found" })
        return res.status(200).json({ type: "success", data: is_question_exist })
    } catch (error) {
        return res.status(400).json({ type: error, message: error.message })
    }
}

exports.get_objective_questions = async (req, res) => {
    try {
        const { question_id } = req.query;
        if (!question_id) return res.status(400).json({ type: "error", message: "Question id is required to perform this action" });

        // SQL query to get question and options
        const get_questions_answers = `
            SELECT 
                q.question, 
                q.id AS question_id, 
                a.correct_option, 
                o.id AS option_id, 
                o.option
            FROM 
                technical_round_questions q
            JOIN 
                answers a ON a.question_id = q.id
            JOIN 
                options o ON o.question_id = q.id
            WHERE 
                q.id = ?
        `;

        // Execute the query
        const results = await sequelize.query(get_questions_answers, {
            replacements: [question_id],
            type: sequelize.QueryTypes.SELECT,
        });

        // If no results are found, return an error
        if (results.length === 0) {
            return res.status(400).json({ type: "error", message: "Question not found" });
        }

        // Extract the question details (first row)
        const questionData = {
            question: results[0].question,
            question_id: results[0].question_id,
            correct_option: results[0].correct_option,
            options: []
        };

        // Iterate over the results to format the options into an array
        results.forEach(row => {
            questionData.options.push({
                option_id: row.option_id,
                option: row.option
            });
        });

        // Return the formatted response
        return res.status(200).json({ type: "success", data: questionData });
    } catch (error) {
        return res.status(400).json({ type: "error", message: error.message });
    }
}

exports.update_subjective_and_logical_question = async (req, res) => {
    const { question_id, answer_id } = req.query;
    const { question, answer } = req.body;

    if (!question_id || !answer_id) {
        return res.status(400).json({ type: "error", message: "Please provide question_id and answer_id to perform this action" });
    }

    const transaction = await sequelize.transaction();
    try {
        const update_question_query = `
            UPDATE technical_round_questions 
            SET question = ?, updatedAt = NOW() 
            WHERE id = ?`;

        const is_question_updated = await sequelize.query(update_question_query, {
            replacements: [question, question_id],
            type: sequelize.QueryTypes.UPDATE,
            transaction
        });

        if (!is_question_updated || is_question_updated[1] === 0) {
            throw new Error("Error while updating question");
        }

        const update_answer_query = `
            UPDATE answers 
            SET answer = ?, updatedAt = NOW() 
            WHERE id = ?`;

        const is_ans_updated = await sequelize.query(update_answer_query, {
            replacements: [answer, answer_id],
            type: sequelize.QueryTypes.UPDATE,
            transaction
        });

        if (!is_ans_updated || is_ans_updated[1] === 0) {
            throw new Error("Error while updating answer");
        }

        await transaction.commit();
        return res.status(200).json({ type: "success", message: "Question and answer updated successfully" });
    } catch (error) {
        await transaction.rollback();
        return res.status(400).json({ type: "error", message: error.message });
    }
};

exports.update_objective = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { question_id } = req.query;
        const { language_id, question, options, correct_option_number } = req.body;

        console.log(question_id, language_id, question, options, correct_option_number);

        if (!question_id || !question || !options || options.length !== 4 || !correct_option_number) {
            await t.rollback();
            return res.status(400).json({
                success: false,
                message: 'All fields are required, including question ID, question, options (exactly 4), and correct option number.'
            });
        }

        if (correct_option_number < 1 || correct_option_number > options.length) {
            await t.rollback();
            return res.status(400).json({ success: false, message: 'Correct option number is out of range.' });
        }

        // Update the question
        await sequelize.query(`
            UPDATE technical_round_questions
            SET question = ?, updatedAt = NOW()
            WHERE id = ?;
        `, {
            replacements: [question, question_id],
            transaction: t
        });

        const updateOptionQuery = `
            UPDATE options
            SET option = ?, updatedAt = NOW()
            WHERE question_id = ? AND id = ?;
        `;

        const optionUpdatePromises = options.map((option) => {
            const { option_id, option: optionText } = option;
            if (!option_id || !optionText) {
                throw new Error('Each option must have an option_id and option text');
            }
            return sequelize.query(updateOptionQuery, {
                replacements: [optionText, question_id, option_id],
                transaction: t
            });
        });

        await Promise.all(optionUpdatePromises);

        const get_all_answer = `SELECT id FROM options WHERE question_id = ?`;
        const is_options_exist = await sequelize.query(get_all_answer, {
            replacements: [question_id],
            type: sequelize.QueryTypes.SELECT,
            transaction: t
        });

        const correct_ans = is_options_exist[correct_option_number - 1].id;

        await sequelize.query(`
            UPDATE answers
            SET correct_option = ?, updatedAt = NOW()
            WHERE question_id = ?;
        `, {
            replacements: [correct_ans, question_id],
            transaction: t
        });

        await t.commit();
        res.status(200).json({ success: true, message: 'Objective question and related data updated successfully.' });

    } catch (error) {
        await t.rollback();
        console.error("ERROR::", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.delete_subjective = async (req, res) => {
    const { question_id } = req.query;
    if (!question_id) {
        return res.status(400).json({ type: "error", message: "Question id is required to perform this action" });
    }

    const transaction = await sequelize.transaction();

    try {
        const deleteQuestionResult = await sequelize.query(
            `DELETE FROM technical_round_questions WHERE id = ?`,
            {
                replacements: [question_id],
                type: sequelize.QueryTypes.DELETE,
                transaction
            }
        );
        const deleteAnswersResult = await sequelize.query(
            `DELETE FROM answers WHERE question_id = ?`,
            {
                replacements: [question_id],
                type: sequelize.QueryTypes.DELETE,
                transaction
            }
        );

        await transaction.commit();

        console.log({ deleteQuestionResult, deleteAnswersResult });

        if (deleteQuestionResult === 0) {
            return res.status(400).json({ type: "error", message: "Question not found or problem while deleting question" });
        }

        res.status(200).json({ type: "success", message: "Question and related answers deleted successfully" });
    } catch (error) {
        await transaction.rollback();
        return res.status(400).json({ type: "error", message: error.message });
    }
};

exports.delete_objective = async (req, res) => {
    const { question_id } = req.query;
    if (!question_id) {
        return res.status(400).json({ type: "error", message: "Question id is required to perform this action" });
    }

    const transaction = await sequelize.transaction();

    try {
        await sequelize.query(
            `DELETE FROM technical_round_questions WHERE id = ?`,
            {
                replacements: [question_id],
                type: sequelize.QueryTypes.DELETE,
                transaction
            }
        );

        const get_all_options = `SELECT id FROM options WHERE question_id = ?`;
        const all_ids = await sequelize.query(get_all_options,
            {
                replacements: [question_id],
                type: sequelize.QueryTypes.SELECT,
                transaction
            }
        );

        for (const { id } of all_ids) {
            await sequelize.query(
                `DELETE FROM options WHERE id = ?`,
                {
                    replacements: [id],
                    type: sequelize.QueryTypes.DELETE,
                    transaction
                }
            );
        }

        await sequelize.query(
            `DELETE FROM answers WHERE question_id = ?`,
            {
                replacements: [question_id],
                type: sequelize.QueryTypes.DELETE,
                transaction
            }
        );

        await transaction.commit();

        return res.status(200).json({ type: "success", message: "Question and its options were successfully deleted" });

    } catch (error) {
        // Rollback the transaction in case of an error
        await transaction.rollback();
        console.error("Error deleting question and options:", error);
        return res.status(500).json({ type: "error", message: "An error occurred while deleting the question and its options" });
    }
};