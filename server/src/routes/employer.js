const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const Employer = require('../models/Employer');
const Job = require('../models/Job');
const { protectEmployer } = require('../middleware/auth');
const { sendEmail } = require('../services/emailService');

// Helper: generate OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const generateEmployerToken = (id) => {
    return jwt.sign({ id, type: 'employer' }, process.env.JWT_SECRET, {
        expiresIn: '7d',
    });
};

// ─── REGISTER ───────────────────────────────────────────
router.post('/register', async (req, res) => {
    try {
        const { contactName, companyName, email, password, companyWebsite, industry, companySize } = req.body;

        if (!contactName || !companyName || !email || !password) {
            return res.status(400).json({ success: false, message: 'Please provide all required fields.' });
        }

        const exists = await Employer.findOne({ email });
        if (exists) {
            return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
        }

        const otp = generateOTP();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        const employer = await Employer.create({
            contactName, companyName, email, password,
            companyWebsite, industry, companySize,
            otp, otpExpires,
        });

        // Respond immediately — don't block on email
        res.status(201).json({
            success: true,
            message: 'Account created! Please check your email for the verification code.',
            employerId: employer._id,
        });

        // Fire-and-forget OTP email (don't await)
        sendEmail({
            to: email,
            subject: 'Verify your JobVault Employer Account',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #4f46e5;">Welcome to JobVault for Employers! 🚀</h2>
                    <p>Hi <strong>${contactName}</strong>,</p>
                    <p>Thanks for registering <strong>${companyName}</strong> on JobVault. Please verify your email to continue.</p>
                    <div style="background: #f3f4f6; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0;">
                        <p style="margin: 0 0 8px; color: #6b7280;">Your verification code</p>
                        <h1 style="font-size: 40px; font-weight: bold; color: #4f46e5; letter-spacing: 8px; margin: 0;">${otp}</h1>
                        <p style="margin: 8px 0 0; color: #6b7280; font-size: 14px;">Valid for 10 minutes</p>
                    </div>
                    <p style="color: #6b7280;">If you did not create this account, please ignore this email.</p>
                </div>`,
        }).catch(err => console.error('OTP email failed (non-blocking):', err.message));
    } catch (err) {
        console.error('Employer register error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// ─── VERIFY OTP ──────────────────────────────────────────
router.post('/verify-otp', async (req, res) => {
    try {
        const { employerId, otp } = req.body;
        const employer = await Employer.findById(employerId).select('+otp +otpExpires');

        if (!employer) return res.status(404).json({ success: false, message: 'Account not found.' });
        if (employer.isEmailVerified) return res.status(400).json({ success: false, message: 'Email already verified.' });
        if (employer.otp !== otp) return res.status(400).json({ success: false, message: 'Invalid verification code.' });
        if (new Date() > employer.otpExpires) return res.status(400).json({ success: false, message: 'Code expired. Please request a new one.' });

        employer.isEmailVerified = true;
        employer.otp = undefined;
        employer.otpExpires = undefined;
        await employer.save();

        const token = generateEmployerToken(employer._id);

        res.json({
            success: true,
            message: 'Email verified! Your account is pending admin approval.',
            token,
            employer: {
                _id: employer._id,
                contactName: employer.contactName,
                companyName: employer.companyName,
                email: employer.email,
                verificationStatus: employer.verificationStatus,
                companyLogo: employer.companyLogo,
            },
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ─── RESEND OTP ───────────────────────────────────────────
router.post('/resend-otp', async (req, res) => {
    try {
        const { employerId } = req.body;
        const employer = await Employer.findById(employerId).select('+otp +otpExpires');

        if (!employer) return res.status(404).json({ success: false, message: 'Account not found.' });
        if (employer.isEmailVerified) return res.status(400).json({ success: false, message: 'Email already verified.' });

        const otp = generateOTP();
        employer.otp = otp;
        employer.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
        await employer.save();

        await sendEmail({
            to: employer.email,
            subject: 'JobVault — New Verification Code',
            html: `<p>Your new OTP is: <strong style="font-size:24px; letter-spacing:4px">${otp}</strong>. Valid for 10 minutes.</p>`,
        });

        res.json({ success: true, message: 'New verification code sent.' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ─── LOGIN ────────────────────────────────────────────────
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ success: false, message: 'Please provide email and password.' });

        const employer = await Employer.findOne({ email }).select('+password');
        if (!employer) return res.status(401).json({ success: false, message: 'Invalid email or password.' });

        const isMatch = await employer.comparePassword(password);
        if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid email or password.' });

        if (!employer.isEmailVerified) {
            return res.status(403).json({ success: false, message: 'Please verify your email first.', needsVerification: true, employerId: employer._id });
        }

        const token = generateEmployerToken(employer._id);

        res.json({
            success: true,
            token,
            employer: {
                _id: employer._id,
                contactName: employer.contactName,
                companyName: employer.companyName,
                email: employer.email,
                verificationStatus: employer.verificationStatus,
                companyLogo: employer.companyLogo,
                industry: employer.industry,
            },
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ─── GET PROFILE ──────────────────────────────────────────
router.get('/me', protectEmployer, async (req, res) => {
    const employer = await Employer.findById(req.employer._id);
    res.json({ success: true, data: employer });
});

// ─── UPDATE PROFILE ───────────────────────────────────────
router.put('/profile', protectEmployer, async (req, res) => {
    try {
        const { companyName, companyWebsite, companyDescription, industry, companySize, headquartersLocation, contactName, companyLogo } = req.body;

        const employer = await Employer.findByIdAndUpdate(
            req.employer._id,
            { companyName, companyWebsite, companyDescription, industry, companySize, headquartersLocation, contactName, companyLogo },
            { new: true, runValidators: true }
        );

        res.json({ success: true, data: employer });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ─── DASHBOARD STATS ──────────────────────────────────────
router.get('/dashboard', protectEmployer, async (req, res) => {
    try {
        const jobs = await Job.find({ postedByEmployer: req.employer._id });
        const stats = {
            totalJobs: jobs.length,
            activeJobs: jobs.filter(j => j.status === 'approved').length,
            pendingJobs: jobs.filter(j => j.status === 'pending').length,
            rejectedJobs: jobs.filter(j => j.status === 'rejected').length,
            totalViews: jobs.reduce((a, j) => a + (j.viewCount || 0), 0),
            totalApplications: jobs.reduce((a, j) => a + (j.applyCount || 0), 0),
        };
        const recentJobs = jobs.sort((a, b) => b.createdAt - a.createdAt).slice(0, 5);
        res.json({ success: true, data: { stats, recentJobs } });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ─── LIST OWN JOBS ────────────────────────────────────────
router.get('/jobs', protectEmployer, async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        const filter = { postedByEmployer: req.employer._id };
        if (status) filter.status = status;

        const jobs = await Job.find(filter)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit));
        const total = await Job.countDocuments(filter);

        res.json({ success: true, data: { jobs, total, pages: Math.ceil(total / limit) } });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ─── POST NEW JOB ─────────────────────────────────────────
router.post('/jobs', protectEmployer, async (req, res) => {
    try {
        if (req.employer.verificationStatus !== 'verified') {
            return res.status(403).json({
                success: false,
                message: 'Your company account must be verified by an admin before you can post jobs.',
            });
        }

        const {
            title, category, location, remote, jobType, description,
            requirements, responsibilities, skills, experienceLevel, experienceYears,
            salary, applyLink, applyEmail, deadline, sector, country
        } = req.body;

        const job = await Job.create({
            title, category, location, remote, jobType, description,
            requirements, responsibilities, skills, experienceLevel, experienceYears,
            salary, applyLink, applyEmail, deadline, sector, country,
            company: req.employer.companyName,
            companyLogo: req.employer.companyLogo,
            source: 'employer',
            postedByEmployer: req.employer._id,
            status: 'pending', // Always needs admin approval
        });

        res.status(201).json({ success: true, message: 'Job submitted for admin review!', data: job });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ─── EDIT JOB ─────────────────────────────────────────────
router.put('/jobs/:id', protectEmployer, async (req, res) => {
    try {
        const job = await Job.findOne({ _id: req.params.id, postedByEmployer: req.employer._id });
        if (!job) return res.status(404).json({ success: false, message: 'Job not found.' });

        // Re-submit for review after editing
        const updates = { ...req.body, status: 'pending' };
        const updatedJob = await Job.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });

        res.json({ success: true, message: 'Job updated and re-submitted for review.', data: updatedJob });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ─── DELETE JOB ───────────────────────────────────────────
router.delete('/jobs/:id', protectEmployer, async (req, res) => {
    try {
        const job = await Job.findOneAndDelete({ _id: req.params.id, postedByEmployer: req.employer._id });
        if (!job) return res.status(404).json({ success: false, message: 'Job not found.' });

        res.json({ success: true, message: 'Job deleted.' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
