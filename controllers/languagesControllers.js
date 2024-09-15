let { sequelize } = require('../models')
let { errorResponse, successResponse } = require("../utils/responseHandler")



exports.create_language = async (req, res) => {
    try {

        const language = req.body.language;

        const createLanguageQuery = `INSERT INTO Languages ( language,  createdAt,  updatedAt ) VALUES ( ?,  NOW(),   NOW() ) `;

        const values = [language];

        const t = await sequelize.transaction();

        const [result] = await sequelize.query(createLanguageQuery, {
            replacements: values,
            transaction: t
        });

        await t.commit();

        res.status(200).json(successResponse(language + ' added successfully.', result))

    } catch (error) {
        console.log("ERROR::", error)
        return res.status(500).json(errorResponse(error.message))
    }
}



exports.get_all_languages = async (req, res) => {
    try {
        let getAllLanguagesQuery = ` SELECT * FROM Languages ORDER BY createdAt DESC`

        let [result] = await sequelize.query(getAllLanguagesQuery)

        if (result.length < 1) { return res.status(400).json(errorResponse("No languages created yet!")) }

        return res.status(200).json(successResponse("languages fetched successfully.", result))

    } catch (error) {
        console.log("ERROR::", error)
        return res.status(500).json(errorResponse(error.message))
    }
}



exports.get_language = async (req, res) => {
    try {
        let id = req.query.languageId

        let findLanguageQuery = `SELECT id,language FROM Languages WHERE id = ?`

        let [result] = await sequelize.query(findLanguageQuery, {
            replacements: [id]
        })

        if (result.length < 1) { return res.status(400).json(errorResponse("No language found with this Id")) }

        return res.status(200).json(successResponse("language fetched successfully.", result[0]))

    } catch (error) {
        console.log('ERROR::', error)
        return res.status(500).json(errorResponse(error.message))
    }
}



exports.update_language = async (req, res) => {
    try {
        const id = req.body.languageId;
        const language = req.body.language;

        const currentLanguageQuery = `
            SELECT language FROM Languages 
            WHERE id = ? 
        `;
        const [currentLanguage] = await sequelize.query(currentLanguageQuery, {
            replacements: [id],
        });

        if (!currentLanguage) {
            return res.status(404).json(errorResponse("Language not found or already disabled."));
        }


        const updatedLanguage = language || currentLanguage[0].language;

        const updateLanguageQuery = `
            UPDATE Languages 
            SET language = ?, updatedAt = NOW() 
            WHERE id = ? 
        `;

        const values = [updatedLanguage, id];

        const t = await sequelize.transaction();

        const [result] = await sequelize.query(updateLanguageQuery, {
            replacements: values,
            transaction: t
        });

        await t.commit();

        if (result.affectedRows === 0) {
            return res.status(404).json(errorResponse("Language not found or already disabled."));
        }

        res.status(200).json(successResponse("Language updated successfully."));

    } catch (error) {
        console.log("ERROR::", error)
        return res.status(500).json(errorResponse(error.message))
    }
}



exports.delete_language = async (req, res) => {
    try {
        const t = await sequelize.transaction();

        const id = req.query.languageId;

        const deleteLanguageQuery = `
                DELETE FROM Languages 
                WHERE id = ?
            `;

        const values = [id];

        const [result] = await sequelize.query(deleteLanguageQuery, {
            replacements: values,
            transaction: t
        });

        await t.commit();

        if (result.affectedRows === 0) {
            return res.status(404).json(errorResponse("Language not found."));
        }

        res.status(200).json(successResponse("language deleted successfully."));
    } catch (error) {
        console.log("ERROR::", error)
        return res.status(500).json(errorResponse(error.message))
    }
}
