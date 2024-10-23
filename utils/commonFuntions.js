const jwt = require('jsonwebtoken');
const crypto = require('crypto')
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
require('dotenv').config();
const saltRounds = 10;
const config = require("../config/config")
const moment = require('moment-timezone');





const createToken = async (roles, user_id, username, email) => {
    return new Promise((resolve, reject) => {
        jwt.sign({ roles, user_id, username, email }, process.env.JWT_SECRET, (err, token) => {
            if (err) {
                reject(err);
            } else {
                resolve(token);
            }
        });
    });
};





const passwordResetToken = async () => {
    const resetToken = await crypto.randomBytes(32).toString('hex')

    this.passwordResetToken = await crypto.createHash('sha256').update(resetToken).digest('hex')
    this.passwordResetExpiresIn = Date.now() + 10 * 60 * 1000
    return resetToken
}





const encrypt_password = async (password) => {
    const passwordValidationRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]).+$/;
    if (!passwordValidationRegex.test(password)) {
        throw new Error("Password must contain at least one uppercase letter and one special character.");
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword
}





const password_compare = async (user_password, password) => {
    try {
        const match = await bcrypt.compare(password, user_password);
        return match;
    } catch (error) {
        console.error('Error comparing passwords:', error);
        throw error;
    }
}





const send_email = async (options) => {
    try {
        const transporter = nodemailer.createTransport({
            host: config.development.email_host,
            secure: config.development.email_port === '465',
            auth: {
                user: config.development.email_username,
                pass: config.development.email_password,
            }
        });


        const mailOptions = {
            from: 'Ultivic Technologies',
            to: options.email,
            subject: options.subject,
            text: options.text,
            html: options.html
        };

        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error('Error sending email:', error);
    }
};






function find_the_total_time(mark_time) {
    let current_time = moment().tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss');
    let current_date = current_time.split(' ')[0];

    let mark_time_full = `${current_date} ${mark_time}`;

    let current_moment = moment(current_time, 'YYYY-MM-DD HH:mm:ss');
    let mark_moment = moment(mark_time_full, 'YYYY-MM-DD HH:mm:ss');

    let duration = moment.duration(current_moment.diff(mark_moment));

    let hours = Math.floor(duration.asHours());
    let minutes = duration.minutes();
    let seconds = duration.seconds();

    let time_difference = `${hours}:${minutes}:${seconds}`

    return time_difference;
}






module.exports = { createToken, passwordResetToken, encrypt_password, password_compare, send_email, find_the_total_time }


