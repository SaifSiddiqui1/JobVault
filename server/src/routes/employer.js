const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const Employer = require('../models/Employer');
const Job = require('../models/Job');
const { protectEmployer } = require('../middleware/auth');
const { sendEmail } = require('../services/emailService');
const { uploadResume } = require('../middleware/upload');
const { uploadBuffer } = require('../config/cloudinary');

// Helper: generate OTP using cryptographically secure randomInt
const generateOTP = () => crypto.randomInt(100000, 999999).toString();

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

        if (password.length < 8) {
            return res.status(400).json({ success: false, message: 'Password must be at least 8 characters long.' });
        }
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
        if (!passwordRegex.test(password)) {
            return res.status(400).json({ success: false, message: 'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character.' });
        }

        const exists = await Employer.findOne({ email });
        if (exists) {
            return res.status(400).json({ success: false, message: 'Registration failed. Please use a different email or sign in.' });
        }

        const otp = generateOTP();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        const employer = await Employer.create({
            contactName, companyName, email, password,
            companyWebsite, industry, companySize,
            otp, otpExpires,
            isEmailVerified: false,
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
        res.status(500).json({ success: false, message: 'Registration failed. Please try again.' });
    }
});

// ─── VERIFY OTP ──────────────────────────────────────────
router.post('/verify-otp', async (req, res) => {
    try {
        const { employerId, otp } = req.body;
        const employer = await Employer.findById(employerId).select('+otp +otpExpires');

        if (!employer) return res.status(404).json({ success: false, message: 'Account not found.' });
        if (employer.isEmailVerified) return res.status(400).json({ success: false, message: 'Email already verified.' });
        
        const isOtpValid = otp && employer.otp && otp.length === employer.otp.length && 
                          crypto.timingSafeEqual(Buffer.from(otp), Buffer.from(employer.otp));
        if (!isOtpValid) return res.status(400).json({ success: false, message: 'Invalid verification code.' });
        
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
        console.error('Verify OTP error:', err);
        res.status(500).json({ success: false, message: 'Verification failed. Please try again.' });
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
        console.error('Resend OTP error:', err);
        res.status(500).json({ success: false, message: 'Could not send code. Please try again.' });
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

        // Email verification removed — admin verification is the real security gate

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
        console.error('Employer login error:', err);
        res.status(500).json({ success: false, message: 'Login failed. Please try again.' });
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

        // If company identity changes, reset verification status
        const current = await Employer.findById(req.employer._id);
        const needsReverification = companyName && companyName !== current.companyName;

        const employer = await Employer.findByIdAndUpdate(
            req.employer._id,
            {
                companyName, companyWebsite, companyDescription, industry, companySize,
                headquartersLocation, contactName, companyLogo,
                ...(needsReverification && { verificationStatus: 'pending' })
            },
            { new: true, runValidators: true }
        );

        res.json({
            success: true,
            data: employer,
            message: needsReverification ? 'Profile updated. Since company name was changed, your account is pending re-verification.' : 'Profile updated.'
        });
    } catch (err) {
        console.error('Update profile error:', err);
        res.status(500).json({ success: false, message: 'Profile update failed. Please try again.' });
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
        const { status } = req.query;
        let page = Math.max(1, parseInt(req.query.page) || 1);
        let limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));

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

// ─── GET SINGLE JOB (for edit form) ───────────────────────
router.get('/jobs/:id', protectEmployer, async (req, res) => {
    try {
        const job = await Job.findOne({ _id: req.params.id, postedByEmployer: req.employer._id });
        if (!job) return res.status(404).json({ success: false, message: 'Job not found.' });
        res.json({ success: true, data: job });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ─── POST NEW JOB (with optional PDF) ─────────────────────
router.post('/jobs', protectEmployer, uploadResume.single('pdf'), async (req, res) => {
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

        // Safely parse JSON strings from FormData — invalid JSON returns null
        const safeJsonParse = (val) => { try { return typeof val === 'string' ? JSON.parse(val) : val; } catch { return null; } };
        const parsedSkills = safeJsonParse(skills);
        const parsedRequirements = safeJsonParse(requirements);
        const parsedResponsibilities = safeJsonParse(responsibilities);
        const parsedSalary = safeJsonParse(salary);

        let pdfUrl = null;
        if (req.file) {
            const result = await uploadBuffer(req.file.buffer, {
                folder: 'jobvault/job-pdfs',
                resource_type: 'raw',
                format: 'pdf',
            });
            pdfUrl = result.secure_url;
        }

        const job = await Job.create({
            title, category, location, remote, jobType, description,
            requirements: parsedRequirements, responsibilities: parsedResponsibilities,
            skills: parsedSkills, experienceLevel, experienceYears,
            salary: parsedSalary, applyLink, applyEmail, deadline, sector, country,
            company: req.employer.companyName,
            companyLogo: req.employer.companyLogo,
            source: 'employer',
            postedByEmployer: req.employer._id,
            status: 'pending',
            ...(pdfUrl && { jobDescriptionPdf: pdfUrl }),
        });

        res.status(201).json({ success: true, message: 'Job submitted for admin review!', data: job });
    } catch (err) {
        console.error('Post job error:', err);
        res.status(500).json({ success: false, message: 'Failed to create job. Please try again.' });
    }
});

// ─── EDIT JOB (with optional PDF) ─────────────────────────
router.put('/jobs/:id', protectEmployer, uploadResume.single('pdf'), async (req, res) => {
    try {
        const job = await Job.findOne({ _id: req.params.id, postedByEmployer: req.employer._id });
        if (!job) return res.status(404).json({ success: false, message: 'Job not found.' });

        const allowedFields = ['title', 'category', 'location', 'remote', 'jobType', 'description', 'requirements', 'responsibilities', 'skills', 'experienceLevel', 'experienceYears', 'salary', 'applyLink', 'applyEmail', 'deadline', 'sector', 'country'];
        const updates = { status: 'pending' };
        allowedFields.forEach(f => {
            if (req.body[f] !== undefined) updates[f] = req.body[f];
        });

        // Safely parse JSON strings from FormData — invalid JSON returns null
        const safeJsonParse = (val) => { try { return typeof val === 'string' ? JSON.parse(val) : val; } catch { return null; } };
        if (updates.skills !== undefined) updates.skills = safeJsonParse(updates.skills);
        if (updates.requirements !== undefined) updates.requirements = safeJsonParse(updates.requirements);
        if (updates.responsibilities !== undefined) updates.responsibilities = safeJsonParse(updates.responsibilities);
        if (updates.salary !== undefined) updates.salary = safeJsonParse(updates.salary);

        if (req.file) {
            const result = await uploadBuffer(req.file.buffer, {
                folder: 'jobvault/job-pdfs',
                resource_type: 'raw',
                format: 'pdf',
            });
            updates.jobDescriptionPdf = result.secure_url;
        }

        const updatedJob = await Job.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
        res.json({ success: true, message: 'Job updated and re-submitted for review.', data: updatedJob });
    } catch (err) {
        console.error('Edit job error:', err);
        res.status(500).json({ success: false, message: 'Failed to update job. Please try again.' });
    }
});

// ─── DELETE JOB ───────────────────────────────────────────
router.delete('/jobs/:id', protectEmployer, async (req, res) => {
    try {
        const job = await Job.findOneAndDelete({ _id: req.params.id, postedByEmployer: req.employer._id });
        if (!job) return res.status(404).json({ success: false, message: 'Job not found.' });

        res.json({ success: true, message: 'Job deleted.' });
    } catch (err) {
        console.error('Delete job error:', err);
        res.status(500).json({ success: false, message: 'Failed to delete job. Please try again.' });
    }
});

module.exports = router;
