const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.startsWith('Bearer ')
            ? req.headers.authorization.split(' ')[1]
            : null;

        if (!token) {
            return res.status(401).json({ success: false, message: 'Not authorized. No token.' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
        const user = await User.findById(decoded.id).select('-password');

        if (!user || !user.isActive) {
            return res.status(401).json({ success: false, message: 'User not found or deactivated.' });
        }

        req.user = user;
        next();
    } catch (err) {
        if (err.name === 'JsonWebTokenError') {
            return res.status(401).json({ success: false, message: 'Invalid token.' });
        }
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ success: false, message: 'Token expired. Please log in again.' });
        }
        next(err);
    }
};

const adminOnly = (req, res, next) => {
    if (req.user?.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Access denied. Admins only.' });
    }
    next();
};

const premiumOrAdmin = (req, res, next) => {
    if (req.user?.role === 'admin' || req.user?.isPremiumActive()) {
        return next();
    }
    return res.status(403).json({
        success: false,
        message: 'This feature requires a Premium subscription.',
        upgradeRequired: true,
    });
};

const generateToken = (id, type = 'user') => {
    return jwt.sign({ id, type }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });
};

const Employer = require('../models/Employer');

const protectEmployer = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.startsWith('Bearer ')
            ? req.headers.authorization.split(' ')[1]
            : null;

        if (!token) return res.status(401).json({ success: false, message: 'Not authorized. No token.' });

        const decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
        if (decoded.type !== 'employer') {
            return res.status(401).json({ success: false, message: 'Invalid token type.' });
        }

        const employer = await Employer.findById(decoded.id);
        if (!employer) return res.status(401).json({ success: false, message: 'Employer not found.' });

        req.employer = employer;
        next();
    } catch (err) {
        return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
    }
};

module.exports = { protect, adminOnly, premiumOrAdmin, generateToken, protectEmployer };

