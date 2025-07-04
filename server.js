const express = require('express');
const { main } = require('./app');
const { createAndSendVendorReports} = require('./spps');
const { createAndSendLisReports } = require('./lis'); // new import for LIS reports
const {closeConnection} = require('./snowflake');
const { sendEmail } = require('./email');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

process.on('exit', async () => {
    await closeConnection();
});

// Middleware to validate token
const validateToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    // Compare with token stored in environment variables
    if (token !== process.env.API_TOKEN) {
        return res.status(403).json({ error: 'Invalid token' });
    }

    next();
};

// Add body parser middleware
app.use(express.json());

// New endpoint to send email
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

// Endpoint to trigger email notifications
app.get('/api/send-notifications', validateToken, async (req, res) => {
    try {
        console.log(`[${new Date().toISOString()}] Received request to send notifications`);
        
        // Run the main function asynchronously
        main().catch(error => {
            console.error('Error in main execution:', error);
        });

        // Respond immediately since the email process runs in background
        res.status(202).json({ 
            message: 'Notification process started',
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Error processing request:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            message: error.message
        });
    }
});

// New endpoint to run SPPS
app.get('/api/run-spps', validateToken, async (req, res) => {
    try {
        console.log(`[${new Date().toISOString()}] Received request to run SPPS`);
        
        // Import and run the SPPS main function
        
        createAndSendVendorReports().catch(error => {
            console.error('Error in SPPS execution:', error);
        });

        // Respond immediately since the process runs in background
        res.status(202).json({ 
            message: 'SPPS process started',
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Error processing SPPS request:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            message: error.message
        });
    }
});


// New endpoint to run LIS notifications
app.post('/api/run-lis', validateToken, async (req, res) => {
    try {
        console.log(`[${new Date().toISOString()}] Received request to run LIS`);

        const { to, cc, bcc } = req.body;

        createAndSendLisReports({ to, cc, bcc }).catch(error => {
            console.error('Error in LIS execution:', error);
        });

        res.status(202).json({ 
            message: 'LIS process started',
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Error processing LIS request:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            message: error.message
        });
    }
});

app.listen(port, async () => {
    try {
        // await connectToSnowflake();
        console.log(`Server is running on port ${port}`);
    } catch (error) {
        console.error('Error connecting to Snowflake:', error);
    }
}); 