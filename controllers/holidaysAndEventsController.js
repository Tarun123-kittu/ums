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
            return res.status(400).json(errorResponse("Holiday/Event not found."));
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

        if (isNaN(year) || year <= 0) { return res.status(400).json(errorResponse("Invalid year provided.")); }

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

        if (!id || isNaN(id)) { return res.status(400).json(errorResponse("Invalid or missing ID parameter.")) }

        const result = await sequelize.query(`DELETE FROM holidays_and_events WHERE id = ${id}`);

        const affectedRows = result.affectedRows || result[0]?.affectedRows || 0;

        if (affectedRows === 0) { return res.status(404).json(errorResponse("Holiday or Event not found.")) }

        return res.status(200).json(successResponse("Holiday event deleted successfully."));

    } catch (error) {
        console.error("ERROR::", error)
        return res.status(500).json(errorResponse(error.message))
    }
};

exports.get_holidayOrEvent = async (req, res) => {
    const eventId = req.query.id;
    if (!eventId) return res.status(400).json({ type: "error", message: "EventId is required to perform this action" });
    try {
        const event_fetch_query = `SELECT * FROM holidays_and_events WHERE id = ?`;
        const [is_event_exist] = await sequelize.query(event_fetch_query, {
            replacements: [eventId],
            type: sequelize.QueryTypes.SELECT,
        });
        console.log(is_event_exist, "is_event_exist")
        if (!is_event_exist) return res.status(404).json({ type: "error", message: "Not Found" })
        return res.status(200).json({ type: "success", data: is_event_exist })
    } catch (error) {
        return res.status(400).json({ type: "error", message: error?.message })
    }
}








exports.get_events_and_birthdays = async (req, res) => {
    try {
        const { month, year } = req.query;
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth() + 1;


        const selectedMonth = month ? parseInt(month) : currentMonth;
        const selectedYear = year ? parseInt(year) : currentYear;


        const getHolidaysAndEventsQuery = `
            SELECT 
                occasion_name, 
                occasion_type, 
                occasion_description, 
                DATE_FORMAT(date, '%Y-%m-%d') as date 
            FROM 
                holidays_and_events 
            WHERE 
                MONTH(date) = :selectedMonth AND YEAR(date) = :selectedYear
            ORDER BY date ASC
        `;


        const getBirthdaysQuery = `
            SELECT 
                name, 
                DATE_FORMAT(dob, '%Y-%m-%d') as dob 
            FROM 
                users 
            WHERE 
                MONTH(dob) = :selectedMonth AND YEAR(dob) = :selectedYear
            ORDER BY dob ASC
        `;

        const t = await sequelize.transaction();


        const [holidaysAndEvents] = await sequelize.query(getHolidaysAndEventsQuery, {
            replacements: { selectedMonth, selectedYear },
            transaction: t,
        });

        const [birthdays] = await sequelize.query(getBirthdaysQuery, {
            replacements: { selectedMonth, selectedYear },
            transaction: t,
        });

        await t.commit();


        const combinedResults = [];


        holidaysAndEvents.forEach(event => {
            combinedResults.push({
                name: event.occasion_name,
                description: event.occasion_description || '',
                date: event.date,
                type: event.occasion_type,
                color: event.occasion_type === 'holiday' ? 'green' : 'red'
            });
        });


        birthdays.forEach(birthday => {
            combinedResults.push({
                name: birthday.name,
                description: 'Birthday',
                date: birthday.dob,
                type: 'birthday',
                color: 'blue'
            });
        });


        if (combinedResults.length<1){return res.status(400).json(errorResponse(`No data retreived for the month- ${month} and year-${year}`))}
        combinedResults.sort((a, b) => new Date(a.date) - new Date(b.date));

        
            return res.status(200).json({
                type: 'success',
                data: combinedResults,
                message: `Data for month ${selectedMonth} and year ${selectedYear} retrieved successfully.`
            });

    } catch (error) {
        console.log("ERROR::", error);
        return res.status(500).json(errorResponse(error.message));
    }
};



