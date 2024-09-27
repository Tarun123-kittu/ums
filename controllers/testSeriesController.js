let { sequelize } = require('../models')
let { errorResponse, successResponse } = require("../utils/responseHandler")


exports.create_series = async (req, res) => {
    try {
        const { language_id, series_name, time_taken, description } = req.body;

        let checkLanguageExistQuery = `SELECT id FROM Languages where id = ?`

        let [language] = await sequelize.query(checkLanguageExistQuery, {
            replacements: [language_id]
        })


        if (language.length < 1) {
            return res.status(400).json(errorResponse("Incorrect language Id please check again."))
        }

        const createTestSeriesQuery = `
            INSERT INTO test_series (language_id, series_name,time_taken,description, createdAt, updatedAt)
            VALUES (?, ?,?,?, NOW(), NOW())
        `;

        const values = [language_id, series_name, time_taken, description,];

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

        if (id) {
            let checkLanguageExistQuery = `SELECT id FROM Languages WHERE id = ?`;

            let [language] = await sequelize.query(checkLanguageExistQuery, {
                replacements: [id]
            });

            if (language.length < 1) {
                return res.status(400).json(errorResponse("Incorrect language Id, please check again."));
            }

            let getAllSeriesQuery = `SELECT * FROM test_series WHERE language_id = ?`;

            let [result] = await sequelize.query(getAllSeriesQuery, {
                replacements: [id]
            });

            if (result.length < 1) {
                return res.status(400).json(errorResponse("No test series created for this language."));
            }

            return res.status(200).json(successResponse("Test series fetched successfully.", result));

        } else {
            let getAllSeriesQuery = `SELECT 
    ts.id,
    ts.language_id,
    ts.series_name,
    ts.status,
    ts.time_taken,
    ts.description,
    ts.createdBy,
  u.name,
    l.language
FROM 
    test_series ts
     JOIN users u ON ts.createdBy = u.id
 JOIN languages l ON l.id = ts.language_id;`;

            let [result] = await sequelize.query(getAllSeriesQuery);

            if (result.length < 1) {
                return res.status(200).json(successResponse("No test series available."));
            }

            return res.status(200).json(successResponse("All test series fetched successfully.", result));
        }

    } catch (error) {
        console.log("ERROR:: ", error);
        return res.status(500).json(errorResponse(error.message));
    }
}





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
