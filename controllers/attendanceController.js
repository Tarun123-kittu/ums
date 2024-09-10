const { sequelize } = require('../models');
const { find_the_total_time } = require("../utils/commonFuntions")
const moment = require('moment-timezone');

exports.mark_attendance = async (req, res) => {
    const { date, employee_id, in_time, login_device, login_mobile } = req.body;
    let current_time = moment().tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss');

    try {
        const is_today_attendance_marked_query = `SELECT date FROM attendances WHERE date = CURDATE() AND employee_id = ?`;
        const [is_today_attendance_marked] = await sequelize.query(is_today_attendance_marked_query, {
            replacements: [employee_id],
            type: sequelize.QueryTypes.SELECT
        });
        if (is_today_attendance_marked) return res.status(400).json({ type: "error", message: "You already marked your attendance !!" })

        const mark_attendance_query = `INSERT INTO attendances (date, employee_id, in_time, status, login_device, login_mobile, created_by, createdAt, updatedAt) VALUES (?, ?, ?, "PRESENT", ?, ?, ?, ?, ?)`;

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
        const is_user_mark_attendance_today_query = `SELECT date,in_time,out_time FROM attendances WHERE date = CURDATE() AND employee_id = ?`;
        const is_user_mark_attendance_today = await sequelize.query(is_user_mark_attendance_today_query, {
            replacements: [employee_id],
            type: sequelize.QueryTypes.SELECT
        });

        console.log(is_user_mark_attendance_today[0]?.out_time)    //null

        if (is_user_mark_attendance_today.length === 0) {
            return res.status(400).json({ type: "error", message: "You have not marked your attendance today!!" });
        }

        if (is_user_mark_attendance_today[0]?.out_time !== null) {
            return res.status(400).json({ type: "error", message: "You alreadu unmark your attendance Thanks !!" });
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

exports.get_attendances = async (req, res) => {
    try {
        // Query to get all users who are not disabled
        const get_all_users = `SELECT id, username, name FROM users WHERE is_disabled = 0`;
        const is_users_fetched = await sequelize.query(get_all_users, {
            type: sequelize.QueryTypes.SELECT
        });

        if (!is_users_fetched || is_users_fetched.length === 0) {
            return res.status(400).json({ type: "error", message: "No users found" });
        }

        // Array to store all attendance records
        let all_user_attendances = [];

        // Loop over the fetched users and get attendance records
        await Promise.all(is_users_fetched.map(async (user) => {
            const userId = user?.id;

            const get_attendance_report_query = `
                SELECT 
                    u.username,
                    u.name,
                    a.date,
                    DATE_FORMAT(a.date, '%W') AS date_in_week_day,
                    a.in_time,
                    a.out_time,
                    a.total_time,
                    a.login_mobile,
                    a.logout_mobile,
                    a.on_break
                FROM 
                    users u
                LEFT JOIN 
                    attendances a 
                ON 
                    u.id = a.employee_id AND a.date = CURDATE() -- Moved date condition here
                WHERE 
                    u.id = ?
            `;

            // Fetch attendance records for the specific user
            const attendance_records = await sequelize.query(get_attendance_report_query, {
                replacements: [userId],
                type: sequelize.QueryTypes.SELECT
            });

            // Concatenate the results into a single array
            if (attendance_records.length > 0) {
                all_user_attendances = all_user_attendances.concat(attendance_records);
            } else {
                // If no attendance records, push user details as a fallback
                all_user_attendances.push({
                    username: user.username,
                    name: user.name,
                    date: null,
                    date_in_week_day: null,
                    in_time: null,
                    out_time: null,
                    total_time: null,
                    login_mobile: null,
                    logout_mobile: null,
                    on_break: null
                });
            }
        }));

        return res.status(200).json({
            type: "success",
            data: all_user_attendances // Single array with all attendance records
        });

    } catch (error) {
        return res.status(400).json({
            type: "error",
            message: error.message
        });
    }
};



exports.get_attendance_report = async (req, res) => {
    try {
        const { name, month, year } = req.query;

        let get_all_users_query = `SELECT id FROM users WHERE is_disabled = 0`;
        let replacements = [];

        if (name) {
            get_all_users_query += ` AND name LIKE ?`;
            replacements.push(`%${name}%`);
        }

        const is_users_fetched = await sequelize.query(get_all_users_query, {
            replacements: replacements,
            type: sequelize.QueryTypes.SELECT
        });

        if (!is_users_fetched || is_users_fetched.length === 0) {
            return res.status(400).json({ type: "error", message: "No users found" });
        }

        let all_user_attendances = [];

        await Promise.all(is_users_fetched.map(async (user) => {
            const userId = user?.id;

            let get_attendance_report_query = `
                SELECT 
                    u.username,
                    u.name,
                    a.date,
                    DATE_FORMAT(a.date, '%W') AS date_in_week_day,
                    a.in_time,
                    a.out_time,
                    a.total_time,
                    a.login_mobile,
                    a.logout_mobile,
                    a.report,
                    a.remark AS review,
                    a.rating,
                    a.on_break
                FROM 
                    users u
                LEFT JOIN 
                    attendances a 
                ON 
                    u.id = a.employee_id
                WHERE 
                    u.id = ?
            `;
            let attendance_replacements = [userId];

            if (year && month) {
                get_attendance_report_query += ` AND YEAR(a.date) = ? AND MONTH(a.date) = ?`;
                attendance_replacements.push(parseInt(year), parseInt(month));
            } else if (year) {
                get_attendance_report_query += ` AND YEAR(a.date) = ?`;
                attendance_replacements.push(parseInt(year));
            } else if (month) {
                get_attendance_report_query += ` AND MONTH(a.date) = ?`;
                attendance_replacements.push(parseInt(month));
            }

            const attendance_records = await sequelize.query(get_attendance_report_query, {
                replacements: attendance_replacements,
                type: sequelize.QueryTypes.SELECT
            });

            // Concatenate the results into a single array
            if (attendance_records.length) {
                all_user_attendances = all_user_attendances.concat(attendance_records);
            }
        }));

        return res.status(200).json({
            type: "success",
            data: all_user_attendances
        });

    } catch (error) {
        return res.status(400).json({
            type: "error",
            message: error.message
        });
    }
}

exports.mark_break = async (req, res) => {
    const userId = req.result.user_id;
    try {
        const mark_break_query = `  UPDATE attendances
                SET 
                    on_break = true
                WHERE 
                    employee_id = ? AND 
                    date = CURDATE()
            `;
        const is_break_marked = await sequelize.query(mark_break_query, {
            replacements: [userId],
            type: sequelize.QueryTypes.UPDATE
        });

        console.log(is_break_marked)

        if (!is_break_marked) res.status(400).json({ type: "error", message: "Error while marking break" })

        return res.status(200).json({
            type: "success",
            message: "Break marked successfully"
        })
    } catch (error) {
        return res.status(400).json({
            type: "error",
            message: error.message
        })
    }
}

exports.unmark_break = async (req, res) => {
    const userId = req.result.user_id;
    try {
        const mark_break_query = `  UPDATE attendances
                SET 
                    on_break = false
                WHERE 
                    employee_id = ? AND 
                    date = CURDATE()
            `;
        const is_break_marked = await sequelize.query(mark_break_query, {
            replacements: [userId],
            type: sequelize.QueryTypes.UPDATE
        });

        console.log(is_break_marked)

        if (!is_break_marked) res.status(400).json({ type: "error", message: "Error while marking break" })

        return res.status(200).json({
            type: "success",
            message: "Break unmarked successfully"
        })
    } catch (error) {
        return res.status(400).json({
            type: "error",
            message: error.message
        })
    }
}

