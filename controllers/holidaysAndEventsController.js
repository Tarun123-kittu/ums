let { sequelize } = require('../models')
let { errorResponse, successResponse } = require("../utils/responseHandler")





exports.add_holidayOrEvent = async (req, res) => {
    try {
        let { occasion_name, occasion_type, date, occasion_description } = req.body

        const createHolidayOrEventQuery = `
              INSERT INTO holidays_and_events (
                occasion_name, 
                occasion_type, 
                occasion_description, 
                date, 
                createdAt, 
                updatedAt
              ) VALUES (
                ?, 
                ?, 
                ?, 
                ?, 
                NOW(), 
                NOW()
              )
            `;


        const values = [
            occasion_name,
            occasion_type,
            occasion_description || null,
            date
        ];

        const t = await sequelize.transaction();

        const [result] = await sequelize.query(createHolidayOrEventQuery, {
            replacements: values,
            transaction: t
        });

        await t.commit();

        res.status(200).json({
            type: "success",
            message: occasion_name + ' added successfully.',
            holidayEventId: result.insertId,
        });
    } catch (error) {
        console.log("ERROR::", error)
        return res.status(500).json(errorResponse(error.message))
    }
}





exports.update_holidayOrEvent = async (req, res) => {
    const id = req.query.holidayOrEventId;

    const { occasion_name, occasion_type, date, occasion_description } = req.body;

    const t = await sequelize.transaction();

    try {

        const [existingRecord] = await sequelize.query(
            `SELECT * FROM holidays_and_events WHERE id = ?`,
            {
                replacements: [id],
                type: sequelize.QueryTypes.SELECT,
                transaction: t
            }
        );

        if (!existingRecord) {
            await t.rollback();
            return res.status(404).json({
                message: 'Holiday/Event not found.',
                type: 'error'
            });
        }


        const updateFields = [];
        const values = [];


        const addField = (fieldName, newValue, oldValue) => {
            if (newValue !== undefined) {
                updateFields.push(`${fieldName} = ?`);
                values.push(newValue);
            }
        };

        addField('occasion_name', occasion_name, existingRecord.occasion_name);
        addField('occasion_type', occasion_type, existingRecord.occasion_type);
        addField('occasion_description', occasion_description, existingRecord.occasion_description);
        addField('date', date, existingRecord.date);


        updateFields.push('updatedAt = NOW()');


        const updateQuery = `
            UPDATE holidays_and_events
            SET ${updateFields.join(', ')}
            WHERE id = ?
        `;
        values.push(id);

        const [result] = await sequelize.query(updateQuery, {
            replacements: values,
            transaction: t
        });

        await t.commit();
        res.status(200).json(successResponse("Holiday/event added successfully."));

    } catch (error) {
        await t.rollback();
        console.error("ERROR::", error);
        res.status(500).json(errorResponse(error.message))
    }
};





exports.get_all_holidaysOrEvents = async (req, res) => {
    try {
        const year = parseInt(req.query.year, 10) || new Date().getFullYear();

        if (isNaN(year) || year <= 0) { return res.status(400).json({ error: "Invalid year provided." }); }

        const query = `
       SELECT *, COUNT(*) OVER() AS total_count
       FROM holidays_and_events
       WHERE YEAR(date) = :year
   `;

        const results = await sequelize.query(query, {
            replacements: { year },
            type: sequelize.QueryTypes.SELECT,
        });

        const totalCount = results.length > 0 ? results[0].total_count : 0;

        return res.status(200).json({ type: "success", eventsOrHolidays: results, totalCount });
    } catch (error) {
        console.error("ERROR::", error);
        return res.status(500).json(errorResponse(error.message))
    }
}





exports.delete_holidayOrEvent = async (req, res) => {
    try {
        const id = req.query.holidayEventId;

        if (!id || isNaN(id)) { return res.status(400).json({ message: 'Invalid or missing ID parameter.' }) }

        const result = await sequelize.query(`DELETE FROM holidays_and_events WHERE id = ${id}`);

        const affectedRows = result.affectedRows || result[0]?.affectedRows || 0;

        if (affectedRows === 0) { return res.status(404).json({ message: 'Holiday or Event not found.' }); }

        return res.status(200).json(successResponse("Holiday event deleted successfully."));

    } catch (error) {
        console.error("ERROR::", error);
        return res.status(500).json(errorResponse(error.message))
    }
};









