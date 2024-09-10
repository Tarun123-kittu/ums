const { sequelize } = require('../models');
const { find_the_total_time } = require("../utils/commonFuntions")
const moment = require('moment-timezone');

exports.mark_attendance = async (req, res) => {
    const { date, employee_id, in_time, login_device, login_mobile } = req.body;
    let current_time = moment().tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss');

    try {
        const mark_attendance_query = `INSERT INTO attendances (date, employee_id, in_time, login_device, login_mobile, created_by, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

        const [is_attendance_marked] = await sequelize.query(mark_attendance_query, {
            replacements: [current_time, employee_id, current_time, login_device, login_mobile, employee_id, current_time, current_time],
            type: sequelize.QueryTypes.INSERT
        });

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
    let current_time = moment().tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss');
    try {
        const is_user_mark_attendance_today_query = `SELECT date,in_time FROM attendances WHERE date = CURDATE() AND employee_id = ?`;
        const is_user_mark_attendance_today = await sequelize.query(is_user_mark_attendance_today_query, {
            replacements: [employee_id],
            type: sequelize.QueryTypes.SELECT
        });

        if (is_user_mark_attendance_today.length === 0) {
            return res.status(400).json({ type: "error", message: "You have not marked your attendance today!!" });
        }

        let total_time = find_the_total_time(is_user_mark_attendance_today[0]?.in_time)
        console.log(total_time)
        const unmark_attendance_query = `UPDATE attendances
        SET 
            out_time = ?, 
            report = ?, 
            total_time = ? ,
            logout_device = ?, 
            logout_mobile = ?
        WHERE 
           date = CURDATE() AND 
           employee_id = ?`;

        const result = await sequelize.query(unmark_attendance_query, {
            replacements: [current_time, report, total_time, logout_device, logout_mobile, employee_id],
            type: sequelize.QueryTypes.UPDATE
        });



        if (!result) return res.status(400).json({ type: "error", message: "Error while unmarking attendance!!" });

        res.status(200).json({ type: "success", message: "Attendance unmarked successfully" });

    } catch (error) {
        res.status(400).json({
            type: "error",
            message: error.message
        });
    }
};


