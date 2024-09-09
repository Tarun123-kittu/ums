const { sequelize } = require('../models');

exports.mark_attendance = async (req, res) => {
    const { date, employee_id, in_time, login_device, login_mobile } = req.body;
    try {
        const mark_attendance_query = `INSERT INTO attendances (date, employee_id, in_time, login_device, login_mobile,created_by,createdAt,updatedAt) VALUES (NOW(), ?, NOW(), ?, ?,${employee_id},NOW(),NOW())`;

        // Use the correct option name 'replacements'
        const [is_attendance_marked] = await sequelize.query(mark_attendance_query, {
            replacements: [employee_id, login_device, login_mobile],
            type: sequelize.QueryTypes.INSERT
        });

        // Check if the insertion was successful by verifying the result
        if (!is_attendance_marked) {
            return res.status(400).json({ type: "error", message: "Attendance marking failed" });
        }

        res.status(200).json({
            type: "success",
            message: "Attendance marked successfully"
        });
    } catch (error) {
        res.status(400).json({
            type: "error",
            message: error.message
        });
    }
};

exports.unmark_attendance = async (req, res) => {
    const { date, employee_id, out_time, report, logout_device, logout_mobile } = req.body;
    console.log(date);
    try {
        // Use CURDATE() to match only the date part
        const is_user_mark_attendance_today_query = `SELECT date FROM attendances WHERE date = CURDATE() AND employee_id = ?`;
        const is_user_mark_attendance_today = await sequelize.query(is_user_mark_attendance_today_query, {
            replacements: [employee_id],
            type: sequelize.QueryTypes.SELECT
        });

        // Check if any record exists
        if (is_user_mark_attendance_today.length === 0) {
            return res.status(400).json({ type: "error", message: "You have not marked your attendance today!!" });
        }

        const unmark_attendance_query = `UPDATE attendances
        SET 
            out_time = NOW(), 
            report = ?, 
            logout_device = ?, 
            logout_mobile = ?
        WHERE 
           date = CURDATE() AND 
           employee_id = ?`;

        const result = await sequelize.query(unmark_attendance_query, {
            replacements: [report, logout_device, logout_mobile, employee_id],
            type: sequelize.QueryTypes.UPDATE
        });

        console.log(result)

        if (!result) return res.status(400).json({ type: "error", message: "Error while unmarking attendance!!" });

        res.status(200).json({ type: "success", message: "Attendance unmarked successfully" });

    } catch (error) {
        res.status(400).json({
            type: "error",
            message: error.message
        });
    }
};


