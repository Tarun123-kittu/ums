const { sequelize } = require('../models');

exports.apply_leave = async (req, res) => {
    const user_id = req?.result?.user_id;
    const { from_date, to_date, count, description, type } = req.body;
    try {
        const apply_leave_query = `INSERT INTO leaves (user_id,from_date,to_date,count,description,type) VALUES(?,?,?,?,?,?)`;
        const [is_leave_applied] = await sequelize.query(apply_leave_query, {
            replacements: [user_id, from_date, to_date, count, description, type],
            type: sequelize.QueryTypes.INSERT
        });

        if (!is_leave_applied) return res.status(400).json({ type: "error", message: "Error while applying leave please try again later" })

        return res.status(200).json({
            type: "success",
            message: "leave applied successfully"
        })
    } catch (error) {
        return res.status(400).json({
            type: "success",
            message: error.message
        })
    }
}

exports.all_applied_leaves = async (req, res) => {
    try {
        const select_all_applied_leaves_query = `
            SELECT 
                l.from_date AS date_from,
                l.to_date AS to_date,
                l.count AS count,
                l.type AS type,
                l.description,
                u.name,
                u.username,
                u.id AS user_id
            FROM leaves l 
            JOIN users u ON l.user_id = u.id 
            WHERE l.status = "PENDING"`;

        const get_all_applied_leaves = await sequelize.query(select_all_applied_leaves_query, {
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

        let monthsWorked = (currentDate.getFullYear() - dojDate.getFullYear()) + (currentDate.getMonth() - dojDate.getMonth());

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
                remaining_leaves: remainingLeaves >= 0 ? remainingLeaves : 0
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
    const { leave_id, status } = req.body;
    try {
        const update_leave_query = `UPDATE leaves SET status = ? WHERE id = ?`
        const is_leave_updated = await sequelize.query(update_leave_query, {
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

