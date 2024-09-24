let { sequelize } = require('../models');
let moment = require('moment'); // Assuming you are using Sequelize
let { send_email } = require("../utils/commonFuntions")

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

exports.calculate_pending_leaves = async (req, res) => {
    const userId = req.result.user_id; // Assuming the userId is passed in the request params

    try {
        const select_user_query = `
            SELECT 
                u.doj AS doj
            FROM users u
            WHERE u.id = :userId
        `;

        const [user] = await sequelize.query(select_user_query, {
            type: sequelize.QueryTypes.SELECT,
            replacements: { userId }
        });

        if (!user) {
            return res.status(404).json({
                type: "error",
                message: "User not found"
            });
        }

        const { doj } = user;
        const dojDate = new Date(doj);
        const currentDate = new Date();

        // Calculate months worked
        let monthsWorked = (currentDate.getFullYear() - dojDate.getFullYear()) * 12 + (currentDate.getMonth() - dojDate.getMonth());

        if (monthsWorked < 1) {
            monthsWorked = 1;
        }
        const totalAllowedLeaves = monthsWorked;

        const select_used_leaves_query = `
            SELECT 
                COALESCE(SUM(l.count), 0) AS total_used_leaves
            FROM leaves l
            WHERE l.user_id = :userId 
            AND l.status NOT IN ('PENDING', 'REJECTED')
        `;

        const [leaveData] = await sequelize.query(select_used_leaves_query, {
            type: sequelize.QueryTypes.SELECT,
            replacements: { userId }
        });

        const usedLeaves = leaveData.total_used_leaves;

        const remainingLeaves = totalAllowedLeaves - usedLeaves;

        return res.status(200).json({
            type: "success",
            data: {
                userId,
                doj,
                total_allowed_leaves: totalAllowedLeaves,
                used_leaves: usedLeaves,
                remaining_leaves: remainingLeaves // Allow negative values
            }
        });

    } catch (error) {
        return res.status(500).json({
            type: "error",
            message: error.message
        });
    }
};


exports.update_pending_leave = async (req, res) => {
    let { leave_id, status, remark } = req.body;
    try {
        let update_leave_query = `UPDATE leaves SET status = ?, remark = ? WHERE id = ?`
        let is_leave_updated = await sequelize.query(update_leave_query, {
            replacements: [status, remark, leave_id],
            type: sequelize.QueryTypes.UPDATE,
        });

        if (!is_leave_updated) return res.status(400).json({ type: "error", message: "Error while updating the leave please try again later" })

        return res.status(200).json({
            type: "success",
            message: "Leave Updated successfully"
        })
    } catch (error) {
        return res.status(200).json({
            type: "error",
            message: error.message
        })
    }
}

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

        for (const user of users) {
            const { userId, name, username, doj } = user;
            const dojDate = new Date(doj);
            const currentDate = new Date();

            let monthsWorked = (currentDate.getFullYear() - dojDate.getFullYear()) * 12 + (currentDate.getMonth() - dojDate.getMonth());

            if (monthsWorked < 1) {
                monthsWorked = 1;
            }

            const totalAllowedLeaves = monthsWorked;

            const select_used_leaves_query = `
                SELECT 
                    COALESCE(SUM(l.count), 0) AS total_used_leaves
                FROM leaves l
                WHERE l.user_id = :userId 
                AND l.status NOT IN ('PENDING', 'REJECTED')
            `;

            const [leaveData] = await sequelize.query(select_used_leaves_query, {
                type: sequelize.QueryTypes.SELECT,
                replacements: { userId }
            });

            const usedLeaves = leaveData.total_used_leaves;
            const remainingLeaves = totalAllowedLeaves - usedLeaves;

            // Push each user's leave data to the array, including name and username
            usersLeaveData.push({
                userId,
                name,
                username,
                doj,
                total_allowed_leaves: totalAllowedLeaves,
                used_leaves: usedLeaves,
                remaining_leaves: remainingLeaves
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



