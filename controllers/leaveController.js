let { sequelize } = require('../models');
let moment = require('moment');
let { send_email } = require("../utils/commonFuntions")
const { CronJob } = require('cron');
const { errorResponse, successResponse } = require('../utils/responseHandler');



exports.apply_leave = async (req, res) => {
    let user_id = req?.result?.user_id;
    let username = req?.result?.username;
    let current_time = moment().tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss');
    let { type, from_date, to_date, description } = req.body;

    let t = await sequelize.transaction();

    try {
        let parsedFromDate = moment(from_date);
        let parsedToDate = moment(to_date);

        let leaveDays = parsedToDate.diff(parsedFromDate, 'days') + 1;

        if (type === "HALF DAY" && leaveDays !== 1) {
            throw new Error("Half Day can't be on more than one day");
        }
        if (type === "SHORT DAY" && leaveDays !== 1) {
            throw new Error("Short Day can't be on more than one day");
        }

        let conflictingLeaveQuery = `
            SELECT COUNT(*) as conflict_count
            FROM leaves
            WHERE user_id = ?
            AND (
                (from_date BETWEEN ? AND ?) OR 
                (to_date BETWEEN ? AND ?)
            )
        `;

        let [conflictResult] = await sequelize.query(conflictingLeaveQuery, {
            replacements: [user_id, from_date, to_date, from_date, to_date],
            type: sequelize.QueryTypes.SELECT,
            transaction: t
        });

        if (conflictResult.conflict_count > 0) {
            throw new Error("A Leave Request for the same date is already in the list");
        }

        let sandwich = 0;

        if (parsedFromDate.isoWeekday() === 1) {
            let testTo = parsedFromDate.clone().subtract(3, 'days').format('YYYY-MM-DD');

            let sandwichBeforeQuery = `
                SELECT COUNT(*) as sandwich_before_count
                FROM leaves
                WHERE user_id = ?
                AND to_date = ?
                AND sandwich = 0
            `;

            let [sandwichBeforeResult] = await sequelize.query(sandwichBeforeQuery, {
                replacements: [user_id, testTo],
                type: sequelize.QueryTypes.SELECT,
                transaction: t
            });

            if (sandwichBeforeResult.sandwich_before_count > 0) {
                sandwich = 2;
            }
        }

        if (parsedToDate.isoWeekday() === 5) {
            let testFrom = parsedToDate.clone().add(3, 'days').format('YYYY-MM-DD');

            let sandwichAfterQuery = `
                SELECT COUNT(*) as sandwich_after_count
                FROM leaves
                WHERE user_id = ?
                AND from_date = ?
                AND sandwich = 0
            `;

            let [sandwichAfterResult] = await sequelize.query(sandwichAfterQuery, {
                replacements: [user_id, testFrom],
                type: sequelize.QueryTypes.SELECT,
                transaction: t
            });

            if (sandwichAfterResult.sandwich_after_count > 0) {
                sandwich = 2;
            }
        }

        leaveDays = leaveDays + sandwich;

        if (type === 'HALF DAY') {
            leaveDays /= 2;
        }
        if (type === 'SHORT DAY') {
            leaveDays /= 4;
        }

        let insertLeaveQuery = `
            INSERT INTO leaves (user_id, from_date, to_date, count, description, type, sandwich,createdAt)
            VALUES (?, ?, ?, ?, ?, ?, ?,?)
        `;

        await sequelize.query(insertLeaveQuery, {
            replacements: [user_id, from_date, to_date, leaveDays, description, type, sandwich, current_time],
            type: sequelize.QueryTypes.INSERT,
            transaction: t
        });

        await send_email({
            email: 'hr@ultivic.com',
            subject: `Leave Application`,
            message: `Hey ${username} applied for ${leaveDays} days for ${description}`
        });

        await t.commit();

        return res.status(200).json({
            type: "success",
            message: "Leave applied successfully"
        });

    } catch (error) {
        await t.rollback();
        return res.status(400).json({
            type: "error",
            message: error.message
        });
    }
};





exports.all_applied_leaves = async (req, res) => {
    try {
        let select_all_applied_leaves_query = `
            SELECT 
            l.id ,
                l.from_date AS date_from,
                l.to_date AS to_date,
                l.count AS count,
                l.type AS type,
                l.description,
                l.status,
                l.remark,
                l.createdAt AS applied_on,
                u.name,
                u.username,
                u.email,
                u.id AS user_id
            FROM leaves l 
            JOIN users u ON l.user_id = u.id 
            WHERE u.is_disabled = false
            AND l.status = "PENDING"`;

        let get_all_applied_leaves = await sequelize.query(select_all_applied_leaves_query, {
            type: sequelize.QueryTypes.SELECT
        });

        if (get_all_applied_leaves?.length === 0) {
            return res.status(200).json({
                type: "Success",
                message: "No pending leaves found"
            });
        }

        return res.status(200).json({
            type: "success",
            data: get_all_applied_leaves
        });
    } catch (error) {
        return res.status(500).json({
            type: "error",
            message: error.message
        });
    }
};




exports.calculate_pending_leaves_for_selected_user = async (req, res) => {
    try {

        const userId = req.result?.user_id;

        if (!userId) {
            return res.status(400).json({
                type: "error",
                message: "User ID is required"
            });
        }


        const select_user_query = `
            SELECT 
                u.id AS userId,
                u.name AS name,
                u.username AS username,
                u.doj AS doj
            FROM users u
            WHERE u.id = :userId AND u.is_disabled = false
        `;

        const [user] = await sequelize.query(select_user_query, {
            type: sequelize.QueryTypes.SELECT,
            replacements: { userId }
        });

        if (!user) {
            return res.status(404).json({
                type: "error",
                message: "User not found or is disabled"
            });
        }

        const { name, username, doj } = user;
        const dojDate = new Date(doj);
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth() + 1;

        const monthsWorked = (currentYear - dojDate.getFullYear()) * 12 + (currentMonth - (dojDate.getMonth() + 1));
        const totalAllowedLeaves = Math.max(monthsWorked, 1);

        const select_accepted_leaves_query = `
            SELECT 
                COALESCE(SUM(l.count), 0) AS total_accepted_leaves,
                SUM(CASE WHEN MONTH(l.createdAt) = :currentMonth AND YEAR(l.createdAt) = :currentYear THEN l.count ELSE 0 END) AS current_month_accepted_leaves
            FROM leaves l
            WHERE l.user_id = :userId 
            AND l.status = 'ACCEPTED'
        `;

        const [leaveData] = await sequelize.query(select_accepted_leaves_query, {
            type: sequelize.QueryTypes.SELECT,
            replacements: { userId, currentMonth, currentYear }
        });

        const totalAcceptedLeaves = leaveData.total_accepted_leaves || 0;
        const currentMonthAcceptedLeaves = leaveData.current_month_accepted_leaves || 0;

        const remainingLeaves = totalAllowedLeaves - totalAcceptedLeaves;

        const userLeaveData = {
            userId,
            name,
            username,
            doj,
            total_allowed_leaves: totalAllowedLeaves,
            total_accepted_leaves: totalAcceptedLeaves,
            current_month_accepted_leaves: currentMonthAcceptedLeaves,
            remaining_leaves: remainingLeaves > 0 ? remainingLeaves : 0
        };

        return res.status(200).json({
            type: "success",
            data: userLeaveData
        });

    } catch (error) {
        return res.status(500).json({
            type: "error",
            message: error.message
        });
    }
};





exports.update_pending_leave = async (req, res) => {
    const { leave_id, status, remark, user_id, leave_count, email, name, from_date, to_date } = req.body;
    const transaction = await sequelize.transaction();

    try {
        const update_leave_query = `UPDATE leaves SET status = ?, remark = ? WHERE id = ?`;
        const is_leave_updated = await sequelize.query(update_leave_query, {
            replacements: [status, remark, leave_id],
            type: sequelize.QueryTypes.UPDATE,
            transaction
        });

        if (!is_leave_updated) {
            await transaction.rollback();
            return res.status(400).json({ type: "error", message: "Error while updating the leave. Please try again later." });
        }

        if (status === "ACCEPTED") {
            const select_current_month_leaves = `
                SELECT * FROM bank_leaves 
                WHERE user_id = ? 
                AND MONTH(created_at) = MONTH(NOW()) 
                AND YEAR(created_at) = YEAR(NOW())`;

            const [selected_leave_details] = await sequelize.query(select_current_month_leaves, {
                replacements: [user_id],
                type: sequelize.QueryTypes.SELECT,
                transaction
            });

            if (selected_leave_details) {
                const bank_leave_id = selected_leave_details.id;
                const bank_pending_leaves = Number(selected_leave_details.paid_leave);
                const bank_taken_leaves = Number(selected_leave_details.taken_leave);
                const total_pending_leaves = bank_pending_leaves - leave_count;
                const total_taken_leaves = bank_taken_leaves + leave_count;

                const update_bank_leaves_query = `
                    UPDATE bank_leaves 
                    SET taken_leave = ?, paid_leave = ?, updated_at = CURDATE() 
                    WHERE id = ?`;

                const is_bank_leave_updated = await sequelize.query(update_bank_leaves_query, {
                    replacements: [total_taken_leaves, total_pending_leaves, bank_leave_id],
                    type: sequelize.QueryTypes.UPDATE,
                    transaction
                });

                if (!is_bank_leave_updated) {
                    await transaction.rollback();
                    return res.status(400).json({ type: "error", message: "Error while updating bank leaves. Please try again later." });
                }
            } else {
                await transaction.rollback();
                return res.status(404).json({ type: "error", message: "No leave details found for the current month." });
            }
        }
        await send_email({
            email: email,
            subject: `Leave Status`,
            message: `Hey ${name}, your leave application from ${from_date} to ${to_date} has been ${status}`
        });

        await transaction.commit();

        return res.status(200).json({
            type: "success",
            message: "Leave updated successfully"
        });
    } catch (error) {
        await transaction.rollback();
        return res.status(500).json({
            type: "error",
            message: error.message
        });
    }
};





exports.get_all_users_pending_leaves = async (req, res) => {
    try {
        const { name, month, year } = req.query;

        let query = `SELECT l.id, l.from_date, l.to_date, l.count, l.description, l.createdAt, l.type, l.createdAt, l.status, l.remark, u.name 
                     FROM leaves l 
                     JOIN users u ON u.id = l.user_id 
                     WHERE u.is_disabled = false`;

        if (name) {
            query += ` AND u.id = '${name}'`;
        }
        if (month) {
            query += ` AND MONTH(l.createdAt) = ${month}`;
        }
        if (year) {
            query += ` AND YEAR(l.createdAt) = ${year}`;
        }

        query += ';';

        let is_leaves_exist = await sequelize.query(query, {
            type: sequelize.QueryTypes.SELECT,
        });

        console.log(is_leaves_exist, "is_leaves_exist")

        if (!is_leaves_exist) {
            return res.status(200).json({ type: "success", message: "No leaves found" });
        }

        return res.status(200).json({ type: "success", data: is_leaves_exist });
    } catch (error) {
        return res.status(400).json({ type: "error", message: error.message });
    }
};





exports.get_applied_leave_details = async (req, res) => {
    const leave_id = req.query.leave_id;
    if (!leave_id) return res.status(400).json({
        type: "error",
        message: "Leave is is required to perform this action"
    })
    try {
        const get_applied_leave_detail = `SELECT u.name,u.mobile,l.from_date,l.to_date,l.createdAt,l.count,l.sandwich,l.description,l.type,l.status,l.remark FROM leaves l JOIN users u ON l.user_id = u.id WHERE l.id = ?`;
        const [leave_detail] = await sequelize.query(get_applied_leave_detail, {
            replacements: [leave_id],
            type: sequelize.QueryTypes.SELECt,
        });
        return res.status(200).json({ type: "success", data: leave_detail })
    } catch (error) {
        return res.status(400).json({
            type: "error",
            message: error.message
        })
    }
}





exports.calculate_pending_leaves_for_all_users = async (req, res) => {
    try {
        const select_all_users_query = `
            SELECT 
                u.id AS userId,
                u.name AS name,
                u.username AS username,
                u.doj AS doj
            FROM users u
            WHERE u.is_disabled = false
        `;

        const users = await sequelize.query(select_all_users_query, {
            type: sequelize.QueryTypes.SELECT
        });

        if (!users.length) {
            return res.status(404).json({
                type: "error",
                message: "No active users found"
            });
        }

        const usersLeaveData = [];
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth() + 1;

        for (const user of users) {
            const { userId, name, username, doj } = user;
            const dojDate = new Date(doj);
            const monthsWorked = (currentYear - dojDate.getFullYear()) * 12 + (currentMonth - (dojDate.getMonth() + 1));


            const totalAllowedLeaves = Math.max(monthsWorked, 1);


            const select_accepted_leaves_query = `
                SELECT 
                    COALESCE(SUM(l.count), 0) AS total_accepted_leaves,
                    SUM(CASE WHEN MONTH(l.createdAt) = :currentMonth AND YEAR(l.createdAt) = :currentYear THEN l.count ELSE 0 END) AS current_month_accepted_leaves
                FROM leaves l
                WHERE l.user_id = :userId 
                AND l.status = 'ACCEPTED'
            `;

            const [leaveData] = await sequelize.query(select_accepted_leaves_query, {
                type: sequelize.QueryTypes.SELECT,
                replacements: { userId, currentMonth, currentYear }
            });

            const totalAcceptedLeaves = leaveData.total_accepted_leaves || 0;
            const currentMonthAcceptedLeaves = leaveData.current_month_accepted_leaves || 0;


            const remainingLeaves = totalAllowedLeaves - totalAcceptedLeaves;


            usersLeaveData.push({
                userId,
                name,
                username,
                doj,
                total_allowed_leaves: totalAllowedLeaves,
                total_accepted_leaves: totalAcceptedLeaves,
                current_month_accepted_leaves: currentMonthAcceptedLeaves,
                remaining_leaves: remainingLeaves > 0 ? remainingLeaves : 0
            });
        }

        return res.status(200).json({
            type: "success",
            data: usersLeaveData
        });

    } catch (error) {
        return res.status(500).json({
            type: "error",
            message: error.message
        });
    }
};




exports.leave_bank_report = async (req, res) => {
    try {
        const { session, month, year, page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;

      
        let bank_report_query = `
            SELECT 
                u.id, 
                u.username, 
                u.name, 
                COALESCE(bl.taken_leave, 0) AS taken_leave, 
                COALESCE(bl.paid_leave, 0) AS paid_leave
            FROM 
                users u
            LEFT JOIN 
                bank_leaves bl 
            ON 
                u.id = bl.employee_id
                AND (MONTH(bl.createdAt) = :month OR :month IS NULL)
                AND (YEAR(bl.createdAt) = :year OR :year IS NULL)
                AND (bl.session = :session OR :session IS NULL)
            WHERE 
                u.is_disabled = false
            LIMIT :limit OFFSET :offset
        `;

        const replacements = {
            month: month ? parseInt(month) : null,
            year: year ? parseInt(year) : null,
            session: session || null,
            limit: parseInt(limit),
            offset: offset,
        };

        const all_bank_records = await sequelize.query(bank_report_query, {
            type: sequelize.QueryTypes.SELECT,
            replacements,
        });

        console.log("Query Result:", all_bank_records);

       
        if (!all_bank_records || all_bank_records.length === 0) {
            const defaultUsersQuery = `
                SELECT 
                    u.id, 
                    u.username, 
                    u.name, 
                    0 AS taken_leave, 
                    0 AS paid_leave 
                FROM 
                    users u 
                WHERE 
                    u.is_disabled = false
                LIMIT :limit OFFSET :offset
            `;

            const defaultUsers = await sequelize.query(defaultUsersQuery, {
                type: sequelize.QueryTypes.SELECT,
                replacements: {
                    limit: parseInt(limit),
                    offset: offset
                }
            });

            return res.status(200).json({
                type: "success",
                data: defaultUsers
            });
        }

       
        let count_query = `
            SELECT COUNT(*) as totalCount
            FROM users u
            LEFT JOIN bank_leaves bl 
            ON u.id = bl.employee_id
                AND (MONTH(bl.createdAt) = :month OR :month IS NULL)
                AND (YEAR(bl.createdAt) = :year OR :year IS NULL)
                AND (bl.session = :session OR :session IS NULL)
            WHERE u.is_disabled = false
        `;

        const totalRecordsResult = await sequelize.query(count_query, {
            type: sequelize.QueryTypes.SELECT,
            replacements: {
                month: month ? parseInt(month) : null,
                year: year ? parseInt(year) : null,
                session: session || null,
            },
        });

        const totalCount = totalRecordsResult[0].totalCount;
        const totalPages = Math.ceil(totalCount / limit);

        return res.status(200).json({
            type: "success",
            data: all_bank_records,
            pagination: {
                currentPage: parseInt(page),
                totalPages: totalPages,
                totalRecords: totalCount,
            }
        });
    } catch (error) {
        console.error("Error fetching leave bank report:", error);
        return res.status(400).json({ type: "error", message: error.message });
    }
};





exports.get_user_applied_leaves = async (req, res) => {
    try {
        const user_id = req.result.user_id;
        const { month, year } = req.query;


        let query = `
            SELECT l.id, l.from_date, l.to_date, l.count, l.description, l.createdAt, l.type, l.status, l.remark, u.name 
            FROM leaves l 
            JOIN users u ON u.id = l.user_id 
            WHERE u.is_disabled = false
        `;


        if (user_id) {
            query += ` AND u.id = '${user_id}'`;
        }


        if (month) {
            query += ` AND MONTH(l.createdAt) = ${month}`;
        }


        if (year) {
            query += ` AND YEAR(l.createdAt) = ${year}`;
        }


        query += ` ORDER BY l.createdAt DESC;`;


        let is_leaves_exist = await sequelize.query(query, {
            type: sequelize.QueryTypes.SELECT,
        });

        console.log(is_leaves_exist, "is_leaves_exist");

        if (is_leaves_exist.length === 0) {
            return res.status(200).json({ type: "success", message: "No leaves found" });
        }

        return res.status(200).json({ type: "success", data: is_leaves_exist });
    } catch (error) {
        return res.status(400).json({ type: "error", message: error.message });
    }
};


async function process_cron_job() {
    try {
        const get_all_users_query = `SELECT id,doj FROM users WHERE is_disabled = false`;
        const [all_queries] = await sequelize.query(get_all_users_query, {
            type: sequelize.QueryTypes.SELECt,
        });

        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth() + 1;
        const session = `${currentYear}-${currentYear + 1}`

        for (const user of all_queries) {
            const { id, doj } = user
            const dojDate = new Date(doj);
            const monthsWorked = (currentYear - dojDate.getFullYear()) * 12 + (currentMonth - (dojDate.getMonth() + 1));

            const total_allowed_leaves_query = `SELECT COUNT(*) AS Taken_leaves FROM leaves WHERE user_id = ? AND status = 'ACCEPTED'`
            const [total_allowed_leaves] = await sequelize.query(total_allowed_leaves_query, {
                replacements: [id],
                type: sequelize.QueryTypes.SELECt,
            });

            const pending_leaves = monthsWorked - total_allowed_leaves[0]?.Taken_leaves

            const insert_pending_leaves_query = `INSERT INTO bank_leaves (user_id,paid_leave,taken_leave,month_year,session,created_at,updated_at) VALUES (?,?,?,CURDATE(),?,CURDATE(),CURDATE())`;
            const insert_pending_leave = await sequelize.query(insert_pending_leaves_query, {
                replacements: [id, pending_leaves, 0, session],
                type: sequelize.QueryTypes.INSERT,
            });

            console.log(insert_pending_leave, "insert_pending_leave insert_pending_leave insert_pending_leave")

        }
    } catch (error) {

    }
}

const job = new CronJob('0 0 1 * *', () => {
    console.log('This job runs at midnight on the first day of every month');
    process_cron_job()

}, null, true, 'Asia/Kolkata');


job.start();

console.log('Cron job has been scheduled.');




exports.update_user_leave_bank = async (req, res) => {
    try {
        const userId = req.query.employeeId;
        const paid_leave = parseFloat(req.query.paid_leaves);  
        const taken_leaves = parseFloat(req.query.taken_leaves); 

      
        if (!userId) {
            return res.status(400).json(errorResponse("Please provide employee Id in the query params"));
        }

        if (isNaN(paid_leave) || isNaN(taken_leaves)) {
            return res.status(400).json(errorResponse("Invalid paid or taken leaves. Must be a valid number."));
        }

       
        let getUserQuery = `SELECT id FROM users WHERE id = ${userId}`;
        let [isUserExist] = await sequelize.query(getUserQuery);

        if (isUserExist.length < 1) {
            return res.status(400).json(errorResponse("User not found with this user Id"));
        }

      
        let leavesDataQuery = `SELECT paid_leave, taken_leave FROM bank_leaves WHERE employee_id = ${userId}`;
        let [leaves] = await sequelize.query(leavesDataQuery);

        if (leaves.length >= 1) {
            let userleaves = leaves[0];  

           
            if (userleaves.paid_leave === paid_leave) {
               
                userleaves.paid_leave = userleaves.paid_leave - taken_leaves;
            } else {
              
                userleaves.paid_leave = paid_leave - taken_leaves;
            }

         
            let updateLeaveQuery = `
                UPDATE bank_leaves
                SET paid_leave = ${userleaves.paid_leave}, 
                    taken_leave = ${userleaves.taken_leave + taken_leaves}
                WHERE employee_id = ${userId};
            `;

         
            await sequelize.query(updateLeaveQuery);

            return res.status(200).json(successResponse("Leave bank updated successfully."));
        } else {
            return res.status(404).json(errorResponse("Leave bank not found for the user."));
        }

    } catch (error) {
        console.log("ERROR::", error);
        return res.status(500).json(errorResponse(error.message));
    }
};


