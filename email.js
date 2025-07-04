const nodemailer = require('nodemailer');
require('dotenv').config();

// Create a transporter using SMTP
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS
    }
});

/**
 * Sends an email using the configured transporter
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} text - Email body text
 * @returns {Promise} - Resolves when email is sent
 */
const sendEmail = async ({ to, subject, text }) => {
    if (!to || !subject || !text) {
        throw new Error('Missing required fields: to, subject, and text are required');
    }

    return await transporter.sendMail({
        from: { name: 'Jakub Klosowski', address: process.env.GMAIL_USER },
        to,
        subject,
        text
    });
};

module.exports = {
    sendEmail
};
