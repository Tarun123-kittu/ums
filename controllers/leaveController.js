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
                l.from_date AS date_from,
                l.to_date AS to_date,
                l.count AS count,
                l.type AS type,
                l.description,
                l.status,
                u.name,
                u.username,
                u.id AS user_id
            FROM leaves l 
            JOIN users u ON l.user_id = u.id 
            WHERE l.status = "PENDING"`;

        let get_all_applied_leaves = await sequelize.query(select_all_applied_leaves_query, {
            type: sequelize.QueryTypes.SELECT
        });

        if (get_all_applied_leaves?.length === 0) {
            return res.status(404).json({
                type: "error",
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

        // Calculate remaining leaves
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
    let { leave_id, status } = req.body;
    try {
        let update_leave_query = `UPDATE leaves SET status = ? WHERE id = ?`
        let is_leave_updated = await sequelize.query(update_leave_query, {
            replacements: [status, leave_id],
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
    let { status } = req.params
    if (!status) return res.status(400).json({ type: "error", message: "Please provide leave status in params" })
    try {
        let get_all_user_applied_leaves = `SELECT l.from_date,l.to_date,l.count,l.description,l.createdAt,u.username FROM leaves l JOIN users u ON u.id = l.user_id WHERE l.status = ?;`;
        let [is_leaves_exist] = await sequelize.query(get_all_user_applied_leaves, {
            replacements: [status],
            type: sequelize.QueryTypes.SELECt,
        });

        if (is_leaves_exist?.length === 0) return res.status(400).json({ type: "error", message: "No leaves found" })
        return res.status(200).json({ type: "error", data: is_leaves_exist })
    } catch (error) {
        return res.status(400).json({ type: "error", message: error.message })
    }
}

