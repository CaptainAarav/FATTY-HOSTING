const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

// Send server request notification to admin
async function sendServerRequestEmail(requestData) {
    const { requestId, userName, userEmail, serverName, playerCount, ampUsername } = requestData;

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: 'aaravsahni1037@gmail.com',
        subject: `New FATTY HOSTING Server Request #${requestId}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #ff9500;">New Server Hosting Request</h2>
                <p>A new server hosting request has been submitted:</p>

                <div style="background-color: #f5f5f5; padding: 20px; border-radius: 10px; margin: 20px 0;">
                    <h3 style="margin-top: 0;">Request Details</h3>
                    <p><strong>Request ID:</strong> #${requestId}</p>
                    <p><strong>User Name:</strong> ${userName}</p>
                    <p><strong>User Email:</strong> ${userEmail}</p>
                    <p><strong>Server Name:</strong> ${serverName}</p>
                    <p><strong>Expected Players:</strong> ${playerCount}</p>
                    <p><strong>AMP Username:</strong> ${ampUsername}</p>
                </div>

                <p style="color: #666;">Please create the AMP account and notify the user when ready.</p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Server request email sent for request #${requestId}`);
    } catch (error) {
        console.error('Error sending server request email:', error);
        throw error;
    }
}

// Send server ready notification to user
async function sendServerReadyEmail(userData) {
    const { userEmail, userName, serverName, ampUsername } = userData;

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: userEmail,
        subject: 'Your FATTY HOSTING Server is Ready!',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #ff9500 0%, #ffd000 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                    <h1 style="color: #0f0f0f; margin: 0;">FATTY HOSTING</h1>
                </div>

                <div style="padding: 30px; background-color: #f9f9f9;">
                    <h2 style="color: #ff9500;">Your Server is Ready!</h2>
                    <p>Hi ${userName},</p>
                    <p>Great news! Your server <strong>${serverName}</strong> has been set up and is ready to use.</p>

                    <div style="background-color: white; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #ff9500;">
                        <h3 style="margin-top: 0;">Access Your Server</h3>
                        <p><strong>URL:</strong> <a href="https://amp.fattysmp.com" style="color: #ff9500;">amp.fattysmp.com</a></p>
                        <p><strong>Username:</strong> ${ampUsername}</p>
                        <p><strong>Password:</strong> The password you set during registration</p>
                    </div>

                    <p>Simply visit the URL above and log in with your credentials to start managing your server!</p>

                    <p style="color: #666; font-size: 14px; margin-top: 30px;">
                        If you have any questions or issues, feel free to contact us at aaravsahni1037@gmail.com
                    </p>
                </div>

                <div style="background-color: #1a1a1a; padding: 20px; text-align: center; border-radius: 0 0 10px 10px;">
                    <p style="color: #b0b0b0; margin: 0;">FATTY HOSTING - Free Server Hosting For Everyone</p>
                </div>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Server ready email sent to ${userEmail}`);
    } catch (error) {
        console.error('Error sending server ready email:', error);
        throw error;
    }
}

module.exports = {
    sendServerRequestEmail,
    sendServerReadyEmail
};
