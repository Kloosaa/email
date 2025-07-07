const nodemailer = require('nodemailer');

// Create a transporter using SMTP
const transporter = nodemailer.createTransport({
    host: 'smtp.alv.autoliv.int',
    port: 587,
    secure: false,
    auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
    },
    tls: {
        rejectUnauthorized: false
    },
    logger: true,
    debug: true
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
        from: { name: 'Jakub Klosowski', address: 'jakub.klosowski@autoliv.com' },
        to,
        subject,
        text
    });
};

module.exports = {
    sendEmail
};
