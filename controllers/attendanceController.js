const { sequelize } = require('../models');
const { find_the_total_time } = require("../utils/commonFuntions")
const moment = require('moment-timezone');
const { errorResponse, successResponse } = require('../utils/responseHandler');





exports.mark_attendance = async (req, res) => {
    const { date, user_id, in_time, login_device, login_mobile } = req.body;
    let current_time = moment().tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss');

    try {
        const mark_attendance_query = `INSERT INTO attendances (date, user_id, in_time, login_device, login_mobile, created_by, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

        const [is_attendance_marked] = await sequelize.query(mark_attendance_query, {
            replacements: [current_time, user_id, current_time, login_device, login_mobile, user_id, current_time, current_time],
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
    const { date, user_id, out_time, report, logout_device, logout_mobile } = req.body;
    let current_time = moment().tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss');
    try {
        const is_user_mark_attendance_today_query = `SELECT date,in_time FROM attendances WHERE date = CURDATE() AND user_id = ?`;
        const is_user_mark_attendance_today = await sequelize.query(is_user_mark_attendance_today_query, {
            replacements: [user_id],
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
           user_id = ?`;

        const result = await sequelize.query(unmark_attendance_query, {
            replacements: [current_time, report, total_time, logout_device, logout_mobile, user_id],
            type: sequelize.QueryTypes.UPDATE
        });



        if (!result) return res.status(400).json({ type: "error", message: "Error while unmarking attendance!!" });

        res.status(200).json({ type: "success", message: "Thankyou." });

    } catch (error) {
        res.status(400).json({
            type: "error",
            message: error.message
        });
    }
};




exports.get_attendance_details = async (req, res) => {
    try {
        const id = req.query.attendanceId;
      
        const [results, metadata] = await sequelize.query(`
            SELECT   u.username,u.mobile,a.date,a.total_time,a.rating,a.in_time,a.out_time,a.report,a.remark
            FROM attendances a
            JOIN users u ON a.user_id = u.id
            WHERE a.id = :id
        `, {
            replacements: { id },
            type: sequelize.QueryTypes.SELECT 
        });

        
        if (results.length === 0) {
            return res.status(404).json({ message: 'Attendance not found' });
        }

        res.json(results)

    } catch (error) {
        console.log("ERROR::", error);
        return res.status(500).json({ message: error.message });
    }
};




exports.update_attendance_details = async (req, res) => {
    try {
        const id = req.query.attendanceId;
        const { total_time, rating, in_time, out_time, report, remark } = req.body;
        
        const [results] = await sequelize.query(`
            SELECT * FROM attendances WHERE id = :id
        `, {
            replacements: { id },
            type: sequelize.QueryTypes.SELECT
        });

        if (results.length === 0) {
            return res.status(404).json({ message: 'Attendance not found' });
        }
    
        const existingAttendance = results;
   
    
        const updatedValues = {
            total_time: total_time !== undefined ? total_time : existingAttendance.total_time,
            rating: rating !== undefined ? rating : existingAttendance.rating,
            in_time: in_time !== undefined ? in_time : existingAttendance.in_time,
            out_time: out_time !== undefined ? out_time : existingAttendance.out_time,
            report: report !== undefined ? report : existingAttendance.report,
            remark: remark !== undefined ? remark : existingAttendance.remark
        };

        
        await sequelize.query(`
            UPDATE attendances
            SET total_time = :total_time,
                rating = :rating,
                in_time = :in_time,
                out_time = :out_time,
                report = :report,
                remark = :remark
            WHERE id = :id
        `, {
            replacements: {
                ...updatedValues,
                id
            },
            type: sequelize.QueryTypes.UPDATE
        });

        res.json({ message: 'Attendance updated successfully' });

    } catch (error) {
        console.log("ERROR::", error);
        return res.status(500).json({ message: error.message });
    }
};


  
