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

        const { profile, date, experience, page = 1, limit = 10 } = req.query;

        const pageNumber = parseInt(page, 10) || 1;
        const pageSize = parseInt(limit, 10) || 10;

        let baseQuery = `
            SELECT 
                i.id, i.name, i.phone_number, i.email, i.gender, i.dob, 
                i.experience, i.current_salary, i.expected_salary, 
                i.profile, i.last_company, i.state, i.house_address 
            FROM 
                Interview_Leads i
            WHERE 
                1 = 1
                ORDER BY createdAt DESC
        `;


        if (profile) {
            baseQuery += ` AND i.profile = :profile`;
        }
        if (date) {
            baseQuery += ` AND DATE(i.dob) = :date`;
        }
        if (experience) {
            baseQuery += ` AND i.experience >= :experience`;
        }
     



        let countQuery = baseQuery.replace(
            'SELECT i.id, i.name, i.phone_number, i.email, i.gender, i.dob, i.experience, i.current_salary, i.expected_salary, i.profile, i.last_company, i.state, i.house_address',
            'SELECT COUNT(*) AS total'
        );


        const [countResult] = await sequelize.query(countQuery, {
            replacements: { profile, date, experience },
        });


        const total = countResult.length;


        const offset = (pageNumber - 1) * pageSize;
        const totalItems = parseInt(total, 10);
        const totalPages = Math.ceil(totalItems / pageSize);


        const getAllLeadsQuery = `${baseQuery} LIMIT :limit OFFSET :offset`;
        const [allLeads] = await sequelize.query(getAllLeadsQuery, {
            replacements: {
                profile,
                date,
                experience,
                limit: pageSize,
                offset
            },
        });

       
        if (allLeads.length < 1) {
            return res.status(400).json(errorResponse("No leads found with the specified filters."));
        }

      
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
        return res.status(500).json(errorResponse(error.message));
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






