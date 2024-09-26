let { sequelize } = require('../models')
let { errorResponse, successResponse } = require("../utils/responseHandler")



exports.get_hr_round_questions = async (req, res) => {
    try {
        const getSeriesQuery = `SELECT id,question FROM HR_Round_Questions `;

        const [questions] = await sequelize.query(getSeriesQuery);

        if (questions.length < 1) { return res.status(400).json(errorResponse("No question created yet!")) }

        res.status(200).json(successResponse('HR Round Questions fetched successfully.', questions));
    } catch (error) {
        console.log("ERROR::", error)
        return res.status(500).json(errorResponse(error.message))
    }
}




exports.hr_round = async (req, res) => {
    try {
        const { lead_id, responses } = req.body; 

        if (!lead_id || !Array.isArray(responses)) {
            return res.status(400).json({ error: 'Invalid input data' });
        }
        
        const transaction = await sequelize.transaction();
    
            if (!lead_id || !Array.isArray(responses)) {
                await transaction.rollback();
                return res.status(400).json({ error: 'Invalid input data' });
            }

        
            const [leads] = await sequelize.query(
                'SELECT * FROM interview_leads WHERE id = ?',
                {
                    replacements: [lead_id],
                    type: sequelize.QueryTypes.SELECT,
                    transaction,
                }
            );
            if (!leads) {
                await transaction.rollback();
                return res.status(404).json({ error: 'lead not found' });
            }
    
           
            const [interviewResult] = await sequelize.query(
                'INSERT INTO Interviews (lead_id, interview_link_click_count, hr_round_result, technical_round_result,createdAt, updatedAt) VALUES (?, ?, ?, ?, NOW(), NOW())',
                {
                    replacements: [lead_id,0, 'Pending', 'Pending'],
                    type: sequelize.QueryTypes.INSERT,
                    transaction,
                }
            );
          
            const interview_id = interviewResult
    
           
            for (const response of responses) {

                const { questionid, answer } = response;
              

                const [question] = await sequelize.query(
                    'SELECT * FROM HR_Round_Questions WHERE id = ?',
                    {
                        replacements: [questionid],
                        type: sequelize.QueryTypes.SELECT,
                        transaction,
                    }
                );
                
                if (!question) {
                    await transaction.rollback();
                    return res.status(404).json({ error: `Question with ID ${questionid} not found` });
                }
              
                await sequelize.query(
                    'INSERT INTO HR_Rounds (interview_id, lead_id, questionid, answer) VALUES (?, ?, ?, ?)',
                    {
                        replacements: [interview_id, lead_id, questionid, answer],
                        type: sequelize.QueryTypes.INSERT,
                        transaction,
                    }
                );
            }
    
           
            await transaction.commit();
    
            return res.status(200).json({ message: 'HR round completed successfully', interview_id });

    } catch (error) {
        console.log("ERROR::", error)
        return res.status(500).json(errorResponse(error.message))
    }
}







exports.hr_round_result = async (req, res) => {
    const { interview_id, hr_round_result } = req.body;

    const transaction = await sequelize.transaction();

    try {
     
        if (!interview_id || !['selected', 'rejected', 'pending', 'on hold'].includes(hr_round_result)) {
            await transaction.rollback(); 
            return res.status(400).json({ error: 'Invalid input data' });
        }

       
        const [affectedRows] = await sequelize.query(
            'UPDATE Interviews SET hr_round_result = ? WHERE id = ?',
            {
                replacements: [hr_round_result, interview_id],
                type: sequelize.QueryTypes.UPDATE,
                transaction, 
            }
        );

        
        if (affectedRows === 0) {
            await transaction.rollback(); 
            return res.status(404).json({ error: 'Interview not found' });
        }

        
        await transaction.commit();
        return res.status(200).json({ message: 'HR round result updated successfully' });
    } catch (error) {
        await transaction.rollback();
        console.log("ERROR::", error);
        return res.status(500).json({ error: 'An error occurred while processing the request' });
    }
};




exports.update_lead_response = async(req,res)=>{
    try{
        const { id, answer } = req.body;

       
        if (!id || typeof answer !== 'string') {
            return res.status(400).json({ error: 'Invalid input data' });
        }
    
        const transaction = await sequelize.transaction();  
        
            const [affectedRows] = await sequelize.query(
                'UPDATE HR_Rounds SET answer = :answer WHERE id = :id',
                {
                    replacements: { answer, id },
                    type: sequelize.QueryTypes.UPDATE,
                    transaction,
                }
            );
    
            if (affectedRows === 0) {
              
                await transaction.rollback();
                return res.status(404).json({ error: 'HR round record not found for the given ID' });
            }
    
            
            await transaction.commit();
            return res.status(200).json({ message: 'HR round answer updated successfully' });
    }catch (error) {
        await transaction.rollback();
        console.log("ERROR::", error);
        return res.status(500).json({ error: 'An error occurred while processing the request' });
    }
}