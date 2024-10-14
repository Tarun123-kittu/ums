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
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const offset = (page - 1) * limit;

        if (isNaN(year) || year <= 0) {
            return res.status(400).json({ type: "error", message: "Invalid year provided." });
        }

        // Modified query to include pagination and total count
        const query = `
        SELECT *, COUNT(*) OVER() AS total_count
        FROM holidays_and_events
        WHERE YEAR(date) = :year
        LIMIT :limit OFFSET :offset
        `;

        const results = await sequelize.query(query, {
            replacements: { year, limit, offset },
            type: sequelize.QueryTypes.SELECT,
        });

        const totalCount = results.length > 0 ? results[0].total_count : 0;
        const totalPages = Math.ceil(totalCount / limit);

        return res.status(200).json({
            type: "success",
            eventsOrHolidays: results,
            currentPage: page,
            totalPages: totalPages,
            totalCount: totalCount,
        });
    } catch (error) {
        console.error("ERROR::", error);
        return res.status(500).json({ type: "error", message: error.message });
    }
};


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
        const currentYear = new Date().getFullYear(); // Get the current year

        // Query to fetch holidays and events for the current year
        const getHolidaysAndEventsQuery = `
            SELECT 
                occasion_name, 
                occasion_type, 
                occasion_description, 
                DATE_FORMAT(date, '%Y-%m-%d') as date 
            FROM 
                holidays_and_events 
            WHERE 
                YEAR(date) = :currentYear
            ORDER BY date ASC
        `;

        // Query to fetch all birthdays and joining dates
        const getAllBirthdaysAndJoiningQuery = `
                SELECT 
            name, 
            DATE_FORMAT(dob, '%Y-%m-%d') as dob, 
            DATE_FORMAT(doj, '%Y-%m-%d') as doj
        FROM 
            users
        WHERE 
            is_disabled = 0
        ORDER BY 
            dob ASC, doj ASC;

        `;

        const t = await sequelize.transaction();

        // Fetch holidays and events for the current year
        const [holidaysAndEvents] = await sequelize.query(getHolidaysAndEventsQuery, {
            replacements: { currentYear },
            transaction: t,
        });

        // Fetch all birthdays and joining dates
        const [allBirthdaysAndJoining] = await sequelize.query(getAllBirthdaysAndJoiningQuery, {
            transaction: t,
        });

        await t.commit();

        const combinedResults = [];
        let idCounter = 1; // Initialize id counter

        // Combine holidays and events
        holidaysAndEvents.forEach(event => {
            combinedResults.push({
                id: idCounter++,
                title: event.occasion_name,
                start: new Date(currentYear, new Date(event.date).getMonth(), new Date(event.date).getDate()),
                end: new Date(currentYear, new Date(event.date).getMonth(), new Date(event.date).getDate(), 23, 59), // Default to end of the day
                color: event.occasion_type === 'holiday' ? '#28B463' : '#E74C3C', // Green for holidays, red for events
            });
        });

        // Combine all birthdays and joining anniversaries
        allBirthdaysAndJoining.forEach(entry => {
            const birthdayDate = new Date(entry.dob);
            const joiningDate = new Date(entry.doj);

            // Replace the year with the current year for birthdays
            if (entry.dob) {
                birthdayDate.setFullYear(currentYear);
                combinedResults.push({
                    id: idCounter++,
                    title: `${entry.name}'s Birthday`,
                    start: new Date(currentYear, birthdayDate.getMonth(), birthdayDate.getDate()),
                    end: new Date(currentYear, birthdayDate.getMonth(), birthdayDate.getDate(), 23, 59), // Default to end of the day
                    color: '#3498DB', // Blue for birthdays
                });
            }

            // Replace the year with the current year for joining anniversaries
            if (entry.doj) {
                joiningDate.setFullYear(currentYear);
                combinedResults.push({
                    id: idCounter++,
                    title: `${entry.name}'s Joining Anniversary`,
                    start: new Date(currentYear, joiningDate.getMonth(), joiningDate.getDate()),
                    end: new Date(currentYear, joiningDate.getMonth(), joiningDate.getDate(), 23, 59), // Default to end of the day
                    color: '#F39C12', // Orange for joining anniversaries
                });
            }
        });

        // Function to add all Saturdays and Sundays as weekend holidays
        const addWeekendHolidays = (year) => {
            let date = new Date(year, 0, 1); // Start from January 1st

            while (date.getFullYear() === year) {
                const day = date.getDay();

                if (day === 0 || day === 6) { // 0 is Sunday, 6 is Saturday
                    combinedResults.push({
                        id: idCounter++,
                        title: 'Weekend', // Unified title for both Saturday and Sunday
                        start: new Date(date),
                        end: new Date(date),
                        color: '#28B463', // Green for weekend holidays
                    });
                }

                date.setDate(date.getDate() + 1); // Move to the next day
            }
        };

        // Add all weekends (Saturdays and Sundays) to the combined results
        addWeekendHolidays(currentYear);

        if (combinedResults.length < 1) {
            return res.status(400).json(errorResponse(`No data retrieved.`));
        }

        // Sort the combined results by date
        combinedResults.sort((a, b) => new Date(a.start) - new Date(b.start));

        return res.status(200).json({
            type: 'success',
            data: combinedResults,
            message: `Data retrieved successfully.`
        });

    } catch (error) {
        console.log("ERROR::", error);
        return res.status(500).json(errorResponse(error.message));
    }
};

exports.get_current_and_next_month_events = async (req, res) => {
    try {
        const currentYear = new Date().getFullYear(); // Get the current year
        const currentMonth = new Date().getMonth(); // Get the current month (0-based index)
        const nextMonth = (currentMonth + 1) % 12; // Calculate next month (handling December wrap-around)

        // Query to fetch holidays and events for the current year
        const getHolidaysAndEventsQuery = `
            SELECT 
                occasion_name, 
                occasion_type, 
                occasion_description, 
                DATE_FORMAT(date, '%Y-%m-%d') as date 
            FROM 
                holidays_and_events 
            WHERE 
                YEAR(date) = :currentYear
            ORDER BY date ASC
        `;

        // Query to fetch all birthdays and joining dates
        const getAllBirthdaysAndJoiningQuery = `
            SELECT 
                name, 
                DATE_FORMAT(dob, '%Y-%m-%d') as dob, 
                DATE_FORMAT(doj, '%Y-%m-%d') as doj
            FROM 
                users
            WHERE 
                is_disabled = 0
            ORDER BY 
                dob ASC, doj ASC;
        `;

        const t = await sequelize.transaction();

        // Fetch holidays and events for the current year
        const [holidaysAndEvents] = await sequelize.query(getHolidaysAndEventsQuery, {
            replacements: { currentYear },
            transaction: t,
        });

        // Fetch all birthdays and joining dates
        const [allBirthdaysAndJoining] = await sequelize.query(getAllBirthdaysAndJoiningQuery, {
            transaction: t,
        });

        await t.commit();

        const currentMonthResults = [];
        const nextMonthResults = [];
        let idCounter = 1; // Initialize id counter

        // Combine holidays and events
        holidaysAndEvents.forEach(event => {
            const eventDate = new Date(event.date);
            const month = eventDate.getMonth();

            if (month === currentMonth || month === nextMonth) {
                currentMonthResults.push({
                    id: idCounter++,
                    title: event.occasion_name,
                    start: new Date(currentYear, eventDate.getMonth(), eventDate.getDate()),
                    end: new Date(currentYear, eventDate.getMonth(), eventDate.getDate(), 23, 59), // Default to end of the day
                    color: event.occasion_type === 'holiday' ? '#28B463' : '#E74C3C', // Green for holidays, red for events
                });
            }
        });

        // Combine all birthdays and joining anniversaries
        allBirthdaysAndJoining.forEach(entry => {
            const birthdayDate = new Date(entry.dob);
            const joiningDate = new Date(entry.doj);

            // Replace the year with the current year for birthdays
            if (entry.dob) {
                birthdayDate.setFullYear(currentYear);
                const birthdayEvent = {
                    id: idCounter++,
                    title: `${entry.name}'s Birthday`,
                    start: new Date(currentYear, birthdayDate.getMonth(), birthdayDate.getDate()),
                    end: new Date(currentYear, birthdayDate.getMonth(), birthdayDate.getDate(), 23, 59), // Default to end of the day
                    color: '#3498DB', // Blue for birthdays
                };

                if (birthdayDate.getMonth() === currentMonth) {
                    currentMonthResults.push(birthdayEvent);
                } else if (birthdayDate.getMonth() === nextMonth) {
                    nextMonthResults.push(birthdayEvent);
                }
            }

            // Replace the year with the current year for joining anniversaries
            if (entry.doj) {
                joiningDate.setFullYear(currentYear);
                const joiningEvent = {
                    id: idCounter++,
                    title: `${entry.name}'s Anniversary`,
                    start: new Date(currentYear, joiningDate.getMonth(), joiningDate.getDate()),
                    end: new Date(currentYear, joiningDate.getMonth(), joiningDate.getDate(), 23, 59), // Default to end of the day
                    color: '#F39C12', // Orange for joining anniversaries
                };

                if (joiningDate.getMonth() === currentMonth) {
                    currentMonthResults.push(joiningEvent);
                } else if (joiningDate.getMonth() === nextMonth) {
                    nextMonthResults.push(joiningEvent);
                }
            }
        });

        // Return the results for the current and next month
        return res.status(200).json({
            type: 'success',
            data: {
                currentMonth: currentMonthResults,
                nextMonth: nextMonthResults,
            },
            message: `Data retrieved successfully.`
        });

    } catch (error) {
        console.log("ERROR::", error);
        return res.status(500).json(errorResponse(error.message));
    }
};

