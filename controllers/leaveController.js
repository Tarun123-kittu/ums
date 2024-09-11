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
                u.username 
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
