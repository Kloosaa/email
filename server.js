// server.js
const express = require('express');
const { sendEmail } = require('./email');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware do autoryzacji tokenem
const validateToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token || token !== process.env.API_TOKEN) {
        return res.status(403).json({ error: 'Invalid or missing token' });
    }
    next();
};

// Middleware do parsowania JSON
app.use(express.json());

// Endpoint do wysyłki maili
app.post('/api/email', validateToken, async (req, res) => {
    try {
        const { to, subject, text } = req.body;

        await sendEmail({ to, subject, text });

        res.status(200).json({
            message: 'Email sent successfully',
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
});

// Uruchom serwer
app.listen(port, () => {
    console.log(`✅ Server is running on port ${port}`);
});
