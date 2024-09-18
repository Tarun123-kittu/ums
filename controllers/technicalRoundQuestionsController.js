let { sequelize } = require('../models')
let { errorResponse, successResponse } = require("../utils/responseHandler")



exports.add_objective = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { test_series_id, language_id, question, options, correct_option_number } = req.body;

     
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

        
        const [seriesLanguageExists] = await sequelize.query(`
            SELECT 1 
            FROM test_series 
            WHERE id = :test_series_id 
            AND language_id = :language_id
        `, {
            replacements: { test_series_id, language_id },
            transaction: t
        });

        if (seriesLanguageExists.length === 0) {
            await t.rollback();
            return res.status(404).json({ success: false, message: 'Test series not found for the given language.' });
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

        const newQuestionId = result; 

       
        const createOptionQuery = `
            INSERT INTO options (question_id, option, createdAt, updatedAt)
            VALUES (?, ?, NOW(), NOW());
        `;
        const optionPromises = options.map((option) => {
            return sequelize.query(createOptionQuery, {
                replacements: [newQuestionId, option],
                transaction: t
            });
        });

        const optionResults = await Promise.all(optionPromises);

        
        const correctOptionId = optionResults[correct_option_number - 1][0];

       
        await sequelize.query(`
            INSERT INTO answers (language_id, series_id, answer, question_id, correct_option_id, createdAt, updatedAt)
            VALUES (?, ?, NULL, ?, ?, NOW(), NOW());
        `, {
            replacements: [language_id, test_series_id, newQuestionId, correctOptionId],
            transaction: t
        });

        await t.commit();
        res.status(201).json({ success: true, message: 'Objective question and related data created successfully' });

    } catch (error) {
        await t.rollback(); 
        console.error("ERROR::", error);
        res.status(500).json({ success: false, message: 'An error occurred while creating the objective question.' });
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

      
        const [seriesExists] = await sequelize.query('SELECT 1 FROM test_series WHERE id = :test_series_id  AND language_id = :language_id', {
            replacements: { test_series_id,language_id },
            transaction: t
        });

        if (seriesExists.length === 0) {
            await t.rollback();
            return res.status(404).json({ success: false, message: 'Test series not found for the given language.' });
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
                INSERT INTO answers (language_id, series_id, answer, question_id, correct_option_id, createdAt, updatedAt)
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
        res.status(500).json({ success: false, message: 'An error occurred while creating the subjective question.' });
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

        
        const [seriesExists] = await sequelize.query('SELECT 1 FROM test_series WHERE id = :test_series_id AND language_id = :language_id', {
            replacements: { test_series_id,language_id },
            transaction: t
        });

        if (seriesExists.length === 0) {
            await t.rollback();
            return res.status(404).json({ success: false, message: 'Test series not found for the given language.' });
        }

        const [languageExists] = await sequelize.query('SELECT 1 FROM languages WHERE id = :language_id', {
            replacements: { language_id, },
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
            INSERT INTO Answers (language_id, series_id, answer, question_id, correct_option_id, createdAt, updatedAt)
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
        SELECT 
            trq.id AS question_id,
            trq.question,
            trq.question_type,
            opt.id AS option_id,
            opt.option,
            ans.correct_option_id AS correct_option_id,
            CASE 
                WHEN opt.id = ans.correct_option_id THEN opt.option 
                ELSE NULL 
            END AS correct_answer,
            ans.answer
        FROM technical_round_questions trq
        LEFT JOIN options opt ON trq.id = opt.question_id
        LEFT JOIN answers ans ON trq.id = ans.question_id
        WHERE trq.language_id = :language_id 
        AND trq.test_series_id = :series_id;
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
                    correct_answer: row.correct_answer || null
                };
            }

            if (row.question_type === 'objective' && row.option_id) {
                questionsMap[questionId].options.push({
                    option_id: row.option_id,
                    option: row.option,
                });

                if (row.correct_option_id && row.correct_answer) {
                    questionsMap[questionId].correct_answer = row.correct_answer;
                }
            }
        });

        const questionsArray = Object.values(questionsMap);
        res.send({ success: true, data: questionsArray });

    } catch (error) {
        console.log("ERROR::", error);
        return res.status(500).json({ success: false, message: 'An error occurred while fetching data.' });
    }
};



exports.submit_technical_round = async(req,res)=>{
    try{
        const { lead_id, responses } = req.body;

        const leadCheckQuery = `
            SELECT * FROM interview_leads WHERE id = :lead_id LIMIT 1;
        `;
        const [lead] = await sequelize.query(leadCheckQuery, {
            replacements: { lead_id },
            type: sequelize.QueryTypes.SELECT
        });

        if (!lead) {
            return res.status(404).json({ message: 'Lead not found' });
        }

        const lastInterviewQuery = `
            SELECT * FROM interviews
            WHERE lead_id = :lead_id
            ORDER BY createdAt DESC
            LIMIT 1;
        `;
        const [lastInterview] = await sequelize.query(lastInterviewQuery, {
            replacements: { lead_id },
            type: sequelize.QueryTypes.SELECT
        });

        if (!lastInterview) {
            return res.status(404).json({ message: 'No interview found for this lead' });
        }

        const interview_id = lastInterview.id;

      
        const questionIds = responses.map(response => response.questionid);
        const validQuestionsQuery = `
            SELECT id FROM technical_round_questions
            WHERE id IN (:question_ids);
        `;
        const validQuestions = await sequelize.query(validQuestionsQuery, {
            replacements: { question_ids: questionIds },
            type: sequelize.QueryTypes.SELECT
        });

        const validQuestionIds = validQuestions.map(question => question.id);
        const invalidQuestions = questionIds.filter(id => !validQuestionIds.includes(id));

        if (invalidQuestions.length > 0) {
            return res.status(400).json({
                message: 'Invalid question IDs',
                invalidQuestions
            });
        }

    
        const insertTechnicalRoundQuery = `
            INSERT INTO technical_round (lead_id, interview_id, question_id, answer,createdAt, updatedAt)
            VALUES (:lead_id, :interview_id, :question_id, :answer,NOW(),NOW());
        `;

        await sequelize.transaction(async (t) => {
            for (const response of responses) {
                await sequelize.query(insertTechnicalRoundQuery, {
                    replacements: {
                        lead_id,
                        interview_id,
                        question_id: response.questionid,
                        answer: response.answer
                    },
                    transaction: t
                });
            }
        });

        return res.status(200).json({ message: 'Responses saved successfully' });
    }catch(error){
        console.log("ERROR::",error)
        return res.status(500).json(errorResponse.error)
    }
} 




exports.get_lead_technical_response = async(req,res)=>{
    try{
        const  lead_id  = req.query.leadId; 

        if(!lead_id){return res.status(400).json(errorResponse("Please provide lead id"))}

        const responsesQuery = `
            SELECT question_id, answer
            FROM technical_round
            WHERE lead_id = :lead_id;
        `;
        const responses = await sequelize.query(responsesQuery, {
            replacements: { lead_id },
            type: sequelize.QueryTypes.SELECT
        });

        if (responses.length === 0) {
            return res.status(404).json({ message: 'No responses found for this lead' });
        }

        
        const questionIds = responses.map(response => response.question_id);

        
        const questionsQuery = `
            SELECT id, question
            FROM technical_round_questions
            WHERE id IN (:question_ids);
        `;
        const questions = await sequelize.query(questionsQuery, {
            replacements: { question_ids: questionIds },
            type: sequelize.QueryTypes.SELECT
        });

        const questionsMap = new Map(questions.map(question => [question.id, question]));

       
        const result = responses.map(response => ({
            question_id: response.question_id,
            question: questionsMap.get(response.question_id)?.question || 'Unknown question',
            answer: response.answer
        }));

        return res.status(200).json(result);
    }catch(error){
      console.log("ERROR::",error)
      return res.status(500).json(errorResponse(error.message))
    }
}







exports.technical_round_result = async(req,res)=>{
    try{
        const { interview_id, technical_round_result } = req.body;

        const transaction = await sequelize.transaction();
    
            if (!interview_id || !['selected', 'rejected', 'pending', 'on hold'].includes(technical_round_result)) {
                await transaction.rollback(); 
                return res.status(400).json({ error: 'Invalid input data' });
            }
    
            const [checkInterview] = await sequelize.query(`SELECT * FROM interviews WHERE id = ${interview_id}`); 
            if(checkInterview.length<1){return res.status(400).json(errorResponse("Interview not exist with this interview id"))}
           
            const [affectedRows] = await sequelize.query(
                'UPDATE Interviews SET technical_round_result = ? WHERE id = ?',
                {
                    replacements: [technical_round_result, interview_id],
                    type: sequelize.QueryTypes.UPDATE,
                    transaction, 
                }
            );
    
            
            if (affectedRows === 0) {
                await transaction.rollback(); 
                return res.status(404).json({ error: 'Interview not found' });
            }

            
            await transaction.commit();
            return res.status(200).json({ message: 'Technical round result updated successfully' });
    }catch(error){
      console.log("ERROR::",error)
      return res.status(500).json(errorResponse(error.message))
    }
}



exports.handle_link_click_count = async(req,res)=>{
    try{
    let {interview_id,lead_id}= req.body


    }catch(error){
        console.log("ERROR::",error)
        return res.status(500).json(errorResponse(error.message))
    }
}