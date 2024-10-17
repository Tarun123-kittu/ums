let { sequelize } = require('../models')
let { errorResponse, successResponse } = require("../utils/responseHandler")





exports.create_series = async (req, res) => {
    try {
        let userId = req.result.user_id
        const { language_id, series_name, time_taken, description, experience_level } = req.body;
       
        let checkLanguageExistQuery = `SELECT id FROM Languages where id = ?`

        let [language] = await sequelize.query(checkLanguageExistQuery, {
            replacements: [language_id]
        })


        if (language.length < 1) {
            return res.status(400).json(errorResponse("Incorrect language Id please check again."))
        }

        if (!experience_level) { return res.status(400).json(errorResponse("Please add experience")) }

        let [isUserExist] = await sequelize.query(`SELECT * FROM users WHERE id=${userId}`)
        if (!isUserExist) { return res.status(400).json(errorResponse("logged in user not found")) }


        const createTestSeriesQuery = `
            INSERT INTO test_series (language_id, series_name,time_taken,description,experience_level,createdBy, createdAt, updatedAt)
            VALUES (?, ?,?,?,?,?, NOW(), NOW())
        `;

        const values = [language_id, series_name, time_taken, description, experience_level, isUserExist[0].id];

        const t = await sequelize.transaction();

        const [result] = await sequelize.query(createTestSeriesQuery, {
            replacements: values,
            transaction: t
        });

        await t.commit();

        res.status(200).json(successResponse("Test series created successfully."));

    } catch (error) {
        console.log("ERROR::", error)
        return res.status(500).json(errorResponse(error.message))
    }
}






exports.get_all_series = async (req, res) => {
    try {
        let id = req.query.languageId;

        
        const MIN_OBJECTIVE = 3;
        const MIN_SUBJECTIVE = 3;
        const MIN_LOGICAL = 1;

        
        if (id) {
            let checkLanguageExistQuery = `SELECT id FROM Languages WHERE id = ?`;

            let [language] = await sequelize.query(checkLanguageExistQuery, {
                replacements: [id]
            });

            if (language.length < 1) {
                return res.status(400).json(errorResponse("Incorrect language Id, please check again."));
            }

            let getAllSeriesQuery = `
                SELECT 
                    ts.id,
                    ts.language_id,
                    ts.series_name,
                    ts.status,
                    ts.time_taken,
                    ts.experience_level,
                    ts.description,
                    ts.createdBy,
                    u.name,
                    l.language,
                    COALESCE(SUM(CASE WHEN trq.question_type = 'objective' THEN 1 ELSE 0 END), 0) AS objective_count,
                    COALESCE(SUM(CASE WHEN trq.question_type = 'subjective' THEN 1 ELSE 0 END), 0) AS subjective_count,
                    COALESCE(SUM(CASE WHEN trq.question_type = 'logical' THEN 1 ELSE 0 END), 0) AS logical_count
                FROM 
                    test_series ts
                    JOIN users u ON ts.createdBy = u.id
                    JOIN languages l ON l.id = ts.language_id
                    LEFT JOIN technical_round_questions trq ON ts.id = trq.test_series_id
                WHERE 
                    ts.language_id = ?
                GROUP BY 
                    ts.id
            `;

           
            let [result] = await sequelize.query(getAllSeriesQuery, {
                replacements: [id]
            });

            if (result.length < 1) {
                return res.status(400).json(errorResponse("No test series created for this language."));
            }

          
            result = result.map(series => {
                series.isCompleted = (
                    series.objective_count >= MIN_OBJECTIVE &&
                    series.subjective_count >= MIN_SUBJECTIVE &&
                    series.logical_count >= MIN_LOGICAL
                ) ? 'completed' : 'incomplete';

                return series;
            });

            return res.status(200).json(successResponse("Test series fetched successfully.", result));

        } else {
         
            let getAllSeriesQuery = `
                SELECT 
                    ts.id,
                    ts.language_id,
                    ts.series_name,
                    ts.status,
                    ts.time_taken,
                    ts.description,
                    ts.experience_level,
                    ts.createdBy,
                    u.name,
                    l.language,
                    COALESCE(SUM(CASE WHEN trq.question_type = 'objective' THEN 1 ELSE 0 END), 0) AS objective_count,
                    COALESCE(SUM(CASE WHEN trq.question_type = 'subjective' THEN 1 ELSE 0 END), 0) AS subjective_count,
                    COALESCE(SUM(CASE WHEN trq.question_type = 'logical' THEN 1 ELSE 0 END), 0) AS logical_count
                FROM 
                    test_series ts
                    JOIN users u ON ts.createdBy = u.id
                    JOIN languages l ON l.id = ts.language_id
                    LEFT JOIN technical_round_questions trq ON ts.id = trq.test_series_id
                GROUP BY 
                    ts.id
            `;

            let [result] = await sequelize.query(getAllSeriesQuery);

            if (result.length < 1) {
                return res.status(200).json(successResponse("No test series available."));
            }

           
            result = result.map(series => {
                series.isCompleted = (
                    series.objective_count >= MIN_OBJECTIVE &&
                    series.subjective_count >= MIN_SUBJECTIVE &&
                    series.logical_count >= MIN_LOGICAL
                ) ? 'completed' : 'incomplete';

                return series;
            });

            return res.status(200).json(successResponse("All test series fetched successfully.", result));
        }

    } catch (error) {
        console.log("ERROR:: ", error);
        return res.status(500).json(errorResponse(error.message));
    }
};




exports.get_series = async (req, res) => {
    try {
        let id = req.query.seriesId

        let getSeriesQuery = `SELECT * FROM test_series WHERE id = ?`

        let [result] = await sequelize.query(getSeriesQuery, {
            replacements: [id]
        })

        if (result.length < 1) {
            return res.status(400).json(errorResponse("No series found with this series Id."))
        }

        return res.status(200).json(successResponse("Series fetched successfully.", result[0]))

    } catch (error) {
        console.log("ERROR:: ", error)
        return res.status(500).json(errorResponse(error.message))
    }
}

exports.update_series = async (req, res) => {
    try {
        const id = req.body.seriesId;
        const { series_name, language_id, time_taken, description } = req.body;

        const currentTestSeriesQuery = `SELECT * FROM test_series  WHERE id = ? `;

        let [currentTestSeries] = await sequelize.query(currentTestSeriesQuery, {
            replacements: [id],
        });

        if (currentTestSeries.length < 1) {
            return res.status(404).json(errorResponse("Test series not found."));
        }

        const updatedSeriesName = (series_name === undefined || series_name === null || series_name.trim() === "")
            ? currentTestSeries[0].series_name
            : series_name;


        const updateTestSeriesQuery = `
            UPDATE test_series 
            SET  series_name = ?,language_id=?,time_taken=?,description=?, updatedAt = NOW() 
            WHERE id = ?
        `;

        const values = [updatedSeriesName, language_id, time_taken, description, id];

        const t = await sequelize.transaction();

        const [result] = await sequelize.query(updateTestSeriesQuery, {
            replacements: values,
            transaction: t
        });

        if (result.affectedRows === 0) {
            await t.rollback();
            return res.status(404).json(errorResponse("Test series not found."));
        }

        await t.commit();

        res.status(200).json(successResponse("Test series updated successfully."));
    } catch (error) {
        console.log("ERROR:: ", error)
        return res.status(500).json(errorResponse(error.message))
    }
}

exports.delete_series = async (req, res) => {
    try {
        const id = req.query.seriesId;

        const deleteTestSeriesQuery = `DELETE FROM test_series  WHERE id = ? `;

        const values = [id];

        const t = await sequelize.transaction();

        const [result] = await sequelize.query(deleteTestSeriesQuery, {
            replacements: values,
            transaction: t
        });

        await t.commit();

        if (result.affectedRows === 0) {
            return res.status(404).json("Test series not found.");
        }

        res.status(200).json(successResponse("Test series deleted successfully."));

    } catch (error) {
        console.log("ERROR::", error)
        return res.status(500).json(errorResponse(error.message))
    }
}

exports.get_specific_language_series = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { language } = req.query;
        if (!language) {
            await transaction.rollback();
            return res.status(400).json({
                type: "error",
                message: "Language is required"
            });
        }

        const get_language_id = `SELECT id FROM languages WHERE language = ?`;
        const language_id_result = await sequelize.query(get_language_id, {
            replacements: [language],
            type: sequelize.QueryTypes.SELECT,
            transaction
        });

        if (language_id_result.length === 0) {
            await transaction.rollback();
            return res.status(404).json({
                type: "error",
                message: "Language not found"
            });
        }

        const language_id = language_id_result[0].id;
        console.log(language_id, "this is the language_id");

        const get_series = `SELECT id, language_id, series_name FROM test_series WHERE language_id = ?`;
        const all_selected_series = await sequelize.query(get_series, {
            replacements: [language_id],
            type: sequelize.QueryTypes.SELECT,
            transaction
        });

        if (all_selected_series.length === 0) {
            await transaction.rollback();
            return res.status(404).json({
                type: "error",
                message: "No series found for the given language"
            });
        }
        await transaction.commit();

        return res.status(200).json({
            type: "success",
            data: all_selected_series
        });
    } catch (error) {
        if (transaction) await transaction.rollback();
        console.error(error);
        return res.status(500).json({
            type: "error",
            message: "An error occurred: " + error.message
        });
    }
};

