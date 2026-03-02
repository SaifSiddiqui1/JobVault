const nodemailer = require('nodemailer');

// ─── Titan Email SMTP Transport ───────────────────────────────────────────────
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.titan.email',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false, // true for port 465, false for 587
    auth: {
        user: process.env.SMTP_USER || 'jobvault@jobvault.live',
        pass: process.env.SMTP_PASS,
    },
    tls: {
        rejectUnauthorized: false,
    },
    connectionTimeout: 5000, // 5s — fail fast if SMTP not reachable
    greetingTimeout: 5000,
    socketTimeout: 10000,
});

const FROM_NAME = 'JobVault';
const FROM_EMAIL = process.env.SMTP_USER || 'jobvault@jobvault.live';

const sendEmail = async ({ to, subject, html, text }) => {
    try {
        const info = await transporter.sendMail({
            from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
            to,
            subject,
            html,
            text,
        });
        console.log('Email sent:', info.messageId);
        return info;
    } catch (err) {
        console.error('Email send error:', err.message);
        // Don't throw — email failure shouldn't crash the request
        return null;
    }
};

module.exports = { sendEmail };
