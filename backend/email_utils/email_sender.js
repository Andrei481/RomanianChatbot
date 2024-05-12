const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    host: "smtp-mail.outlook.com", // hostname
    secureConnection: false, // TLS requires secureConnection to be false
    port: 587, // port for secure SMTP
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD
    },
    tls: {
        ciphers:'SSLv3',
        rejectUnauthorized: false
    }
});

const sendEmail = async (email, subject, text) => {
    try {
        await transporter.sendMail({
            from: process.env.EMAIL,
            to: email,
            subject: subject,
            text: text
        });
        console.log('Email sent successfully');
    } catch (error) {
        console.error('Error sending email:', error);
    }
};

module.exports = sendEmail;