const express = require('express');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const { db } = require('../database/db');
const { sendServerRequestEmail, sendServerReadyEmail } = require('../utils/email');
const rateLimit = require('express-rate-limit');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'fatty-hosting-secret-key-change-in-production';

// Rate limiting for server requests
const requestLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // limit each IP to 3 server requests per hour
    message: 'Too many server requests, please try again later'
});

// Middleware to verify JWT token
function authenticateToken(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Access denied. No token provided.'
        });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({
            success: false,
            message: 'Invalid token'
        });
    }
}

// Submit server request
router.post('/request',
    authenticateToken,
    requestLimiter,
    [
        body('serverName').trim().notEmpty().isLength({ min: 3, max: 50 }),
        body('serverType').isIn(['java', 'bedrock']),
        body('playerCount').isInt({ min: 1, max: 100 }),
        body('ampUsername').trim().notEmpty().isLength({ min: 3, max: 30 }),
        body('ampPassword').isLength({ min: 6 })
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    errors: errors.array()
                });
            }

            const { serverName, serverType, playerCount, ampUsername, ampPassword } = req.body;
            const userId = req.user.userId;

            // Get user details
            const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);

            // Insert server request
            const result = db.prepare(`
                INSERT INTO server_requests
                (user_id, server_name, server_type, player_count, amp_username, amp_password, status)
                VALUES (?, ?, ?, ?, ?, ?, 'pending')
            `).run(userId, serverName, serverType, playerCount, ampUsername, ampPassword);

            // Send email to admin
            await sendServerRequestEmail({
                requestId: result.lastInsertRowid,
                userName: user.name,
                userEmail: user.email,
                serverName,
                serverType,
                playerCount,
                ampUsername,
                ampPassword
            });

            res.status(201).json({
                success: true,
                message: 'Server request submitted successfully! You will receive an email once your server is ready.',
                requestId: result.lastInsertRowid
            });
        } catch (error) {
            console.error('Server request error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to submit server request'
            });
        }
    }
);

// Get user's server requests
router.get('/my-requests', authenticateToken, (req, res) => {
    try {
        const userId = req.user.userId;

        const requests = db.prepare(`
            SELECT id, server_name, server_type, player_count, amp_username, status, created_at
            FROM server_requests
            WHERE user_id = ?
            ORDER BY created_at DESC
        `).all(userId);

        res.json({
            success: true,
            requests
        });
    } catch (error) {
        console.error('Get requests error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch requests'
        });
    }
});

// Approve server request and notify user (Admin only)
router.post('/approve/:requestId', async (req, res) => {
    try {
        const { requestId } = req.params;
        const adminKey = req.headers['x-admin-key'];

        // Simple admin authentication
        if (adminKey !== process.env.ADMIN_KEY) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized'
            });
        }

        // Get the server request
        const request = db.prepare(`
            SELECT sr.*, u.email as user_email, u.name as user_name
            FROM server_requests sr
            JOIN users u ON sr.user_id = u.id
            WHERE sr.id = ?
        `).get(requestId);

        if (!request) {
            return res.status(404).json({
                success: false,
                message: 'Request not found'
            });
        }

        // Update status to approved
        db.prepare(`
            UPDATE server_requests
            SET status = 'approved', updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `).run(requestId);

        // Send email to user
        await sendServerReadyEmail({
            userEmail: request.user_email,
            userName: request.user_name,
            serverName: request.server_name,
            ampUsername: request.amp_username
        });

        res.json({
            success: true,
            message: 'Server approved and user notified'
        });
    } catch (error) {
        console.error('Approve server error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to approve server'
        });
    }
});

module.exports = router;
