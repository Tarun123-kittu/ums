let { sequelize } = require("../models")
let { errorResponse, successResponse } = require("../utils/responseHandler")


exports.create_lead = async (req, res) => {
    try {
        const {
            name,
            phone_number,
            email,
            gender,
            dob,
            experience,
            current_salary,
            expected_salary,
            profile,
            last_company,
            state,
            house_address
        } = req.body;

        const t = await sequelize.transaction();


        const checkEmailQuery = ` SELECT id FROM Interview_Leads WHERE email = ? `;
        const [existingLead] = await sequelize.query(checkEmailQuery, {
            replacements: [email],
            transaction: t,
        });


        if (existingLead.length > 0) {
            await t.rollback();
            return res.status(400).json(errorResponse("A lead with this email already exists."));
        }

        const checkNumberQuery = `SELECT id FROM Interview_Leads WHERE phone_number = ?`
        const [existingNumber] = await sequelize.query(checkNumberQuery, {
            replacements: [phone_number],
            transaction: t,
        });

        if (existingNumber.length > 0) {
            await t.rollback();
            return res.status(400).json(errorResponse("A lead with this number already exists."));
        }

        const createLeadQuery = `
            INSERT INTO Interview_Leads (
              name, phone_number, email, gender, dob, experience, 
              current_salary, expected_salary, profile, last_company, 
              state, house_address, createdAt, updatedAt
            ) VALUES (
              ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW()
            )
          `;
        const values = [
            name,
            phone_number,
            email,
            gender,
            dob,
            experience || null,
            current_salary || null,
            expected_salary || null,
            profile || null,
            last_company || null,
            state,
            house_address
        ];

        const [result] = await sequelize.query(createLeadQuery, {
            replacements: values,
            transaction: t,
        });

        await t.commit();

        res.status(200).json(successResponse(`${name} added successfully.`));
    } catch (error) {
        console.log("ERROR:: ", error)
        return res.status(500).json(errorResponse(error.message))
    }
}

exports.get_lead = async (req, res) => {
    try {
        const id = req.query.leadId;

        const getLeadQuery = `SELECT * FROM Interview_Leads WHERE id = ?`;
        const [lead] = await sequelize.query(getLeadQuery, {
            replacements: [id],
        });

        if (lead.length === 0) {
            return res.status(404).json(errorResponse("Lead not found."));
        }

        res.status(200).json({
            type: "success",
            message: "Lead details retrieved successfully.",
            data: lead[0],
        });
    } catch (error) {
        console.log("ERROR::", error);
        return res.status(500).json(errorResponse(error.message));
    }
};

exports.update_lead = async (req, res) => {
    try {
        const id = req.query.leadId

        const {
            name,
            phone_number,
            email,
            gender,
            dob,
            experience,
            current_salary,
            expected_salary,
            profile,
            last_company,
            state,
            house_address,
        } = req.body;

        const t = await sequelize.transaction();


        const getLeadQuery = `SELECT * FROM Interview_Leads WHERE id = ?`;
        const [existingLead] = await sequelize.query(getLeadQuery, {
            replacements: [id],
            transaction: t,
        });

        if (existingLead.length === 0) {
            await t.rollback();
            return res.status(404).json(errorResponse("Lead not found."));
        }

        const lead = existingLead[0];

        if (email && email !== lead.email) {
            const checkEmailQuery = `SELECT id FROM Interview_Leads WHERE email = ? AND id != ?`;
            const [existingEmail] = await sequelize.query(checkEmailQuery, {
                replacements: [email, id],
                transaction: t,
            });

            if (existingEmail.length > 0) {
                await t.rollback();
                return res.status(400).json(errorResponse("A lead with this email already exists."));
            }
        }


        if (phone_number && phone_number !== lead.phone_number) {
            const checkNumberQuery = `SELECT id FROM Interview_Leads WHERE phone_number = ? AND id != ?`;
            const [existingNumber] = await sequelize.query(checkNumberQuery, {
                replacements: [phone_number, id],
                transaction: t,
            });

            if (existingNumber.length > 0) {
                await t.rollback();
                return res.status(400).json(errorResponse("A lead with this number already exists."));
            }
        }


        const updateLeadQuery = `
        UPDATE Interview_Leads SET
          name = ?,
          phone_number = ?,
          email = ?,
          gender = ?,
          dob = ?,
          experience = ?,
          current_salary = ?,
          expected_salary = ?,
          profile = ?,
          last_company = ?,
          state = ?,
          house_address = ?,
          updatedAt = NOW()
        WHERE id = ?
      `;

        const values = [
            name || lead.name,
            phone_number || lead.phone_number,
            email || lead.email,
            gender || lead.gender,
            dob || lead.dob,
            experience !== undefined ? experience : lead.experience,
            current_salary !== undefined ? current_salary : lead.current_salary,
            expected_salary !== undefined ? expected_salary : lead.expected_salary,
            profile || lead.profile,
            last_company || lead.last_company,
            state || lead.state,
            house_address || lead.house_address,
            id
        ];

        await sequelize.query(updateLeadQuery, {
            replacements: values,
            transaction: t,
        });

        await t.commit();

        res.status(200).json(successResponse(`Lead with ID ${id} updated successfully.`));
    } catch (error) {
        console.log("ERROR::", error);
        return res.status(500).json(errorResponse(error.message));
    }
};

exports.get_all_leads = async (req, res) => {
    try {
        const { profile, experience, page = 1, limit = 10 } = req.query;

        const pageNumber = parseInt(page, 10) || 1;
        const pageSize = parseInt(limit, 10) || 10;

        let baseQuery = `
            SELECT 
                i.id, i.name, i.phone_number, i.email, i.gender, i.dob, 
                i.experience, i.current_salary, i.expected_salary, 
                i.profile, i.last_company, i.state, i.house_address, i.in_round
            FROM 
                Interview_Leads i
            WHERE 
                1 = 1
        `;

        // Append filters to the query if provided
        if (profile) {
            baseQuery += ` AND i.profile = :profile`;
        }
        if (experience) {
            baseQuery += ` AND i.experience >= :experience`;
        }

        // Add ORDER BY clause after the filters
        baseQuery += ` ORDER BY i.createdAt DESC`;

        // Create count query for total number of leads (without ORDER BY)
        let countQuery = baseQuery.replace(
            `SELECT i.id, i.name, i.phone_number, i.email, i.gender, i.dob, i.experience, i.current_salary, i.expected_salary, i.profile, i.last_company, i.state, i.house_address, i.in_round`,
            'SELECT COUNT(*) AS total'
        ).replace(` ORDER BY i.createdAt DESC`, ''); // Remove ORDER BY for the count query

        // Execute the count query to get the total number of results
        const [countResult] = await sequelize.query(countQuery, {
            replacements: { profile, experience },
        });

        // Check if countResult contains the total count, handle empty result
        const totalItems = countResult.length > 0 ? countResult[0].total : 0;

        // Calculate total pages
        const totalPages = totalItems > 0 ? Math.ceil(totalItems / pageSize) : 1; // Avoid null, default to 1 if no items

        // Pagination logic
        const offset = (pageNumber - 1) * pageSize;

        // Append LIMIT and OFFSET for pagination in the main query
        const getAllLeadsQuery = `${baseQuery} LIMIT :limit OFFSET :offset`;

        // Execute the main query to get the leads
        const [allLeads] = await sequelize.query(getAllLeadsQuery, {
            replacements: {
                profile,
                experience,
                limit: pageSize,
                offset
            },
        });

        // Handle case when no leads are found
        if (allLeads.length < 1) {
            return res.status(200).json({
                type: "success",
                message: "No leads found with the specified filters."
            });
        }

        // Return success response with pagination info
        return res.status(200).json({
            type: "success",
            message: "Data retrieved successfully.",
            data: allLeads,
            pagination: {
                currentPage: pageNumber,
                totalPages,
                totalItems,
                pageSize: pageSize,
            },
        });
    } catch (error) {
        console.log("ERROR::", error);
        return res.status(500).json({
            type: "error",
            message: error.message,
        });
    }
};

exports.delete_lead = async (req, res) => {
    try {
        let id = req.query.leadId;

        let isLeadExistQuery = `SELECT id, name FROM Interview_Leads WHERE id = ?`;

        let [isLeadExist] = await sequelize.query(isLeadExistQuery, {
            replacements: [id]
        });

        if (isLeadExist.length === 0) {
            return res.status(404).json({ success: false, message: "No record found." });
        }

        let deleteLeadQuery = `DELETE FROM Interview_Leads WHERE id = ?`;

        await sequelize.query(deleteLeadQuery, {
            replacements: [id]
        });

        return res.status(200).json({ success: true, message: `${isLeadExist[0].name} deleted successfully.` });
    } catch (error) {
        console.log("ERROR:: ", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.get_face_to_face_round_leads = async (req, res) => {
    const t = await sequelize.transaction(); // Ensure you start a transaction
    try {
        const all_technical_round_leads = `
            SELECT il.id, il.name, il.experience, il.profile,il.assigned_test_series,il.expected_salary, i.face_to_face_result, i.id AS interview_id,l.id AS language_id
            FROM interview_leads il
            JOIN interviews i ON i.lead_id = il.id
            JOIN languages l ON l.language = il.profile
            WHERE in_round = 3
        `;

        const results = await sequelize.query(all_technical_round_leads, {
            type: sequelize.QueryTypes.SELECT,
            transaction: t
        });

        if (results.length === 0) {
            await t.rollback();
            return res.status(200).json({ type: "success", message: "No Lead Found" });
        }

        await t.commit();

        return res.status(200).json({ type: "success", data: results });
    } catch (error) {
        await t.rollback();
        return res.status(400).json({ type: "error", message: error.message });
    }
};

exports.get_final_round_leads = async (req, res) => {
    const t = await sequelize.transaction(); // Ensure you start a transaction
    try {
        const all_technical_round_leads = `
            SELECT il.id, il.name, il.experience, il.profile,il.assigned_test_series,il.expected_salary, i.final_result, i.id AS interview_id,l.id AS language_id
            FROM interview_leads il
            JOIN interviews i ON i.lead_id = il.id
            JOIN languages l ON l.language = il.profile
            WHERE in_round = 4
        `;

        const results = await sequelize.query(all_technical_round_leads, {
            type: sequelize.QueryTypes.SELECT,
            transaction: t
        });

        if (results.length === 0) {
            await t.rollback();
            return res.status(200).json({ type: "success", message: "No Lead Found" });
        }

        await t.commit();

        return res.status(200).json({ type: "success", data: results });
    } catch (error) {
        await t.rollback();
        return res.status(400).json({ type: "error", message: error.message });
    }
};