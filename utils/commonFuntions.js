const jwt = require('jsonwebtoken');
const crypto = require('crypto')
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
require('dotenv').config();
const saltRounds = 10;



const createToken = async (roles, userId, username, email) => {
    return new Promise((resolve, reject) => {
        jwt.sign({ roles, userId, username, email }, process.env.JWT_SECRET, (err, token) => {
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
            host: process.env.EMAIL_HOST,
            secure: process.env.EMAIL_PORT === '465',
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD,
            }
        });

 
        const mailOptions = {
            from: 'Ultivic Technologies <hankish@gmail.com>',
            to: options.email,
            subject: options.subject,
            text: options.message
        };

        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error('Error sending email:', error);
    }
};


module.exports = {createToken,passwordResetToken,encrypt_password,password_compare,send_email}


