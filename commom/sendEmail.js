const nodemailer = require('nodemailer');
require('dotenv').config();

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

        // Define mail options
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

module.exports = send_email;
