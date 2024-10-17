const { successResponse, errorResponse } = require("../utils/responseHandler")
const { sequelize } = require("../models");






exports.get_dashboard_leaves = async (req, res) => {
    try {
        const { month } = req.query;
        const currentDate = new Date();
        const queryMonth = month || (currentDate.getMonth() + 1);

        const leavesQuery = `
            SELECT 
                u.name, 
                u.position, 
                l.createdAt AS date_of_application,
                l.type,
                CONCAT(DATE_FORMAT(l.from_date, '%Y-%m-%d'), ' - ', DATE_FORMAT(l.to_date, '%Y-%m-%d')) AS duration, 
                l.status
            FROM 
                leaves l
            JOIN 
                users u ON u.id = l.user_id
            WHERE 
                MONTH(l.createdAt) = :queryMonth
            ORDER BY 
                l.createdAt DESC;
        `;


        const leaves = await sequelize.query(leavesQuery, {
            replacements: { queryMonth },
            type: sequelize.QueryTypes.SELECT,
        });

        if (leaves.length === 0) {
            return res.status(200).json(successResponse("No leaves found for the given month."));
        }


        return res.status(200).json(successResponse("Data retrieved successfully", leaves));

    } catch (error) {
        console.log("ERROR::", error)
        return res.status(500).json(errorResponse(error.message))
    }
}







exports.get_dashboard_interview_leads_overview = async (req, res) => {
    try {
        const { timePeriod = 'today' } = req.query;
        let dateCondition;

        const currentDate = new Date();
        const startOfDay = new Date(currentDate.setHours(0, 0, 0, 0));
        const endOfDay = new Date(currentDate.setHours(23, 59, 59, 999));

        switch (timePeriod) {
            case 'week':
                const startOfWeek = new Date(currentDate.setDate(currentDate.getDate() - currentDate.getDay()));
                const endOfWeek = new Date(currentDate.setDate(startOfWeek.getDate() + 6));
                dateCondition = `createdAt BETWEEN '${startOfWeek.toISOString()}' AND '${endOfWeek.toISOString()}'`;
                break;
            case 'month':
                const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
                const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
                dateCondition = `createdAt BETWEEN '${startOfMonth.toISOString()}' AND '${endOfMonth.toISOString()}'`;
                break;
            default:
                dateCondition = `createdAt BETWEEN '${startOfDay.toISOString()}' AND '${endOfDay.toISOString()}'`;
                break;
        }


        const leadsOverviewQuery = `
            SELECT 
                COUNT(id) AS totalLeads,
                SUM(CASE WHEN in_round = 1 THEN 1 ELSE 0 END) AS hrRound,
                SUM(CASE WHEN in_round = 2 THEN 1 ELSE 0 END) AS technicalRound,
                SUM(CASE WHEN in_round = 3 THEN 1 ELSE 0 END) AS faceToFaceRound,
                SUM(CASE WHEN in_round = 4 THEN 1 ELSE 0 END) AS finalRound
            FROM interview_leads
            WHERE ${dateCondition};
        `;

        const leadsOverview = await sequelize.query(leadsOverviewQuery, {
            type: sequelize.QueryTypes.SELECT,
        });


        const finalRoundStatusQuery = `
            SELECT 
                SUM(CASE WHEN final_result = 'SELECTED' THEN 1 ELSE 0 END) AS selected,
                SUM(CASE WHEN final_result = 'REJECTED' THEN 1 ELSE 0 END) AS rejected,
                SUM(CASE WHEN final_result = 'ON HOLD' THEN 1 ELSE 0 END) AS onHold,
                SUM(CASE WHEN final_result = 'PENDING' THEN 1 ELSE 0 END) AS pending
            FROM interviews
            WHERE lead_id IN (SELECT id FROM interview_leads WHERE in_round = 4)
            AND ${dateCondition};
        `;

        const finalRoundStatus = await sequelize.query(finalRoundStatusQuery, {
            type: sequelize.QueryTypes.SELECT,
        });



        const result = {
            totalLeads: leadsOverview[0].totalLeads,
            hrRound: leadsOverview[0].hrRound,
            technicalRound: leadsOverview[0].technicalRound,
            faceToFaceRound: leadsOverview[0].faceToFaceRound,
            finalRound: leadsOverview[0].finalRound,
            selected: finalRoundStatus[0].selected,
            rejected: finalRoundStatus[0].rejected,
            onHold: finalRoundStatus[0].onHold,
            pending: finalRoundStatus[0].pending,
        };

        return res.status(200).json(successResponse("Data retrieved successfully", result))

    } catch (error) {
        console.error("Error", error);
        return res.status(500).json(errorResponse(error.message));
    }
};






exports.get_employees_working_time = async (req, res) => {
    try {
        const query = `
            SELECT 
                u.id AS user_id,
                u.name AS employee_name,
                a.in_time,
                a.out_time,
                -- Calculate working hours, using current time if out_time is null
                IFNULL(
                    TIMEDIFF(a.out_time, a.in_time), 
                    TIMEDIFF(NOW(), a.in_time)
                ) AS working_hours 
            FROM 
                attendances a
            JOIN 
                users u ON u.id = a.user_id
            WHERE 
                a.status = 'PRESENT'
            AND 
                a.date = CURDATE();  -- Get records only for today
        `;

        const result = await sequelize.query(query, {
            type: sequelize.QueryTypes.SELECT
        });

        console.log("Query Result:", result);

        return res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error("ERROR::", error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};






exports.get_user_today_attendance = async (req, res) => {
    try {
        const user_id = req.result.user_id;
        const get_attendance_query = `
         SELECT in_time,out_time
            FROM attendances 
            WHERE DATE(createdAt) = CURDATE() AND user_id = ?
        `;
        const attendance = await sequelize.query(get_attendance_query, {
            replacements: [user_id],
            type: sequelize.QueryTypes.SELECT
        });

        if (!attendance || attendance.length === 0) {
            return res.status(400).json({ type: "error", message: "No attendance found for today" });
        }

        res.status(200).json({
            type: "success",
            data: attendance
        });
    } catch (error) {
        return res.status(500).json(errorResponse(error.message));
    }
}





exports.get_all_present_employee = async (req, res) => {
    try {
        const all_present_employees_query = `SELECT COUNT(*) AS presentEmployees
                                            FROM attendances 
                                            WHERE in_time IS NOT NULL 
                                            AND DATE(createdAt) = CURDATE()`;
        const [total_present_employees] = await sequelize.query(all_present_employees_query, {
            type: sequelize.QueryTypes.SELECT
        })

        return res.status(200).json({ type: "success", total_present_employees })
    } catch (error) {
        return res.status(400).json({ type: "error", message: error.message })
    }
}






exports.get_all_on_leave_employees = async (req, res) => {
    try {
        const currentDate = new Date();
        const today = currentDate.toISOString().split('T')[0];


        const leavesCount = await sequelize.query(`
            SELECT COUNT(*) AS onLeaveCount
            FROM leaves
            WHERE status = 'ACCEPTED'
            AND from_date <= '${today}'
            AND to_date >= '${today}'
        `, {
            type: sequelize.QueryTypes.SELECT,
        });


        const attendanceCount = await sequelize.query(`
            SELECT COUNT(*) AS presentCount
            FROM attendances
            WHERE date = '${today}'
            AND status = 'PRESENT'
        `, {
            type: sequelize.QueryTypes.SELECT,
        });


        const onLeaveCount = leavesCount[0].onLeaveCount;
        const presentCount = attendanceCount[0].presentCount;

        const effectiveOnLeaveCount = onLeaveCount - presentCount;

        return res.status(200).json({
            success: true,
            data: {
                onLeaveCount: effectiveOnLeaveCount < 0 ? 0 : effectiveOnLeaveCount,
                totalAcceptedLeaves: onLeaveCount,
                presentCount: presentCount,
            },
        });
    } catch (error) {
        console.log("ERROR::", error);
        return res.status(500).json({ success: false, message: "An error occurred while processing the request." });
    }
};



exports.get_all_interviews = async (req, res) => {
    try {
        const today = new Date().toISOString().slice(0, 10);


        const query = `
                SELECT 
                    COUNT(*) as interviewCount
                FROM 
                    interviews
                WHERE 
                    (DATE(createdAt) = :today OR DATE(updatedAt) = :today);
            `;


        const result = await sequelize.query(query, {
            replacements: { today },
            type: sequelize.QueryTypes.SELECT
        });


        return res.status(200).json({
            success: true,
            data: {
                interviewCount: result[0].interviewCount
            }
        });
    } catch (error) {
        console.log("ERROR::", error)
        return res.status(500).json(errorResponse(error.message))
    }
}







