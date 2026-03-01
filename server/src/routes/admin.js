const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const { uploadFile } = require('../middleware/upload');
const { uploadBuffer } = require('../config/cloudinary');
const Job = require('../models/Job');
const User = require('../models/User');
const StudyMaterial = require('../models/StudyMaterial');
const Resume = require('../models/Resume');
const { aggregateJobs } = require('../services/jobAggregator');

// ─── N8N / External Webhook ─────────────────────────────────────────────────────
// Must be placed BEFORE protect/adminOnly middleware so it can use token auth
router.post('/webhook/n8n', async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const secret = process.env.N8N_WEBHOOK_SECRET || 'jobvault_n8n_secret_123';
        if (!authHeader || authHeader !== `Bearer ${secret}`) {
            return res.status(401).json({ success: false, message: 'Unauthorized webhook request' });
        }

        const jobsData = Array.isArray(req.body) ? req.body : [req.body];
        let saved = 0;
        console.log('N8N Webhook Received:', JSON.stringify(req.body, null, 2));

        const mapCategory = (cat = '', title = '') => {
            const str = (cat + ' ' + title).toLowerCase();
            if (str.includes('software') || str.includes('devops') || str.includes('engineer') || str.includes('developer')) return 'sde';
            if (str.includes('market') || str.includes('pr') || str.includes('social media')) return 'marketing';
            if (str.includes('sales') || str.includes('account manager') || str.includes('business dev')) return 'sales';
            if (str.includes('support') || str.includes('customer')) return 'customer_support';
            if (str.includes('finance') || str.includes('accountant') || str.includes('tax')) return 'finance';
            if (str.includes('health') || str.includes('medic') || str.includes('nurse')) return 'healthcare';
            if (str.includes('law') || str.includes('legal') || str.includes('attorney')) return 'law';
            if (str.includes('gov') || str.includes('public')) return 'government';
            return 'it';
        };

        for (const rawJob of jobsData) {
            // Support both mapped names and raw Remotive API names
            const title = rawJob.title || rawJob.position;
            const company = rawJob.company || rawJob.company_name;
            const location = rawJob.location || rawJob.candidate_required_location || 'Remote';
            const url = rawJob.applyLink || rawJob.url;

            if (!title || !company) {
                console.log('Skipping job due to missing title or company:', { title, company });
                continue;
            }

            const mappedJob = {
                title: title,
                company: company,
                location: location,
                remote: rawJob.remote || 'remote',
                description: rawJob.description || title,
                applyLink: url,
                sourceJobId: rawJob.sourceJobId || `n8n-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                source: rawJob.source || 'n8n',
                sourceUrl: url,
                category: mapCategory(rawJob.category, title),
                jobType: rawJob.jobType || rawJob.job_type || 'full-time',
                postedDate: rawJob.postedDate || rawJob.publication_date ? new Date(rawJob.postedDate || rawJob.publication_date) : new Date(),
                skills: rawJob.skills || rawJob.tags || [],
                status: 'pending', // Admins must still approve them
            };

            const exists = await Job.findOne({ sourceJobId: mappedJob.sourceJobId, source: mappedJob.source });
            if (!exists) {
                await Job.create(mappedJob);
                saved++;
            }
        }
        res.json({ success: true, message: `Webhook processed. Saved ${saved} new jobs.` });
    } catch (err) { next(err); }
});

// All following admin routes require auth + admin role
router.use(protect, adminOnly);

// ─── Dashboard Stats ──────────────────────────────────────────────────────────
router.get('/stats', async (req, res, next) => {
    try {
        const [totalUsers, totalJobs, pendingJobs, approvedJobs, totalResumes] = await Promise.all([
            User.countDocuments({ isActive: true }),
            Job.countDocuments(),
            Job.countDocuments({ status: 'pending' }),
            Job.countDocuments({ status: 'approved' }),
            Resume.countDocuments(),
        ]);
        res.json({ success: true, data: { totalUsers, totalJobs, pendingJobs, approvedJobs, totalResumes } });
    } catch (err) { next(err); }
});

// ─── User Management ──────────────────────────────────────────────────────────
router.get('/users', async (req, res, next) => {
    try {
        const { page = 1, limit = 20, search, role } = req.query;
        const query = {};
        if (search) query.$or = [{ fullName: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }];
        if (role) query.role = role;

        const total = await User.countDocuments(query);
        const users = await User.find(query).sort('-createdAt').skip((page - 1) * limit).limit(Number(limit));
        res.json({ success: true, data: { users, pagination: { total, page: Number(page), pages: Math.ceil(total / limit) } } });
    } catch (err) { next(err); }
});

router.get('/users/:id', async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
        res.json({ success: true, data: { user } });
    } catch (err) { next(err); }
});

router.put('/users/:id', async (req, res, next) => {
    try {
        const allowed = ['role', 'isActive', 'isPremium', 'premiumExpiresAt', 'contactNumber'];
        const updates = {};
        allowed.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

        const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true });
        res.json({ success: true, data: { user } });
    } catch (err) { next(err); }
});

// ─── Job Management (Admin Approval Workflow from PDF) ────────────────────────
router.get('/jobs', async (req, res, next) => {
    try {
        const { status = 'pending', page = 1, limit = 20, source, category } = req.query;
        const query = {};
        if (status !== 'all') query.status = status;
        if (source) query.source = source;
        if (category) query.category = category;

        const total = await Job.countDocuments(query);
        const jobs = await Job.find(query).sort('-createdAt').skip((page - 1) * limit).limit(Number(limit));
        res.json({ success: true, data: { jobs, pagination: { total, page: Number(page), pages: Math.ceil(total / limit) } } });
    } catch (err) { next(err); }
});

// Get a single job (any status)
router.get('/jobs/:id', async (req, res, next) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) return res.status(404).json({ success: false, message: 'Job not found.' });
        res.json({ success: true, data: { job } });
    } catch (err) { next(err); }
});

// Approve a job
router.put('/jobs/:id/approve', async (req, res, next) => {
    try {
        const job = await Job.findByIdAndUpdate(req.params.id, {
            status: 'approved',
            approvedBy: req.user._id,
            approvedAt: new Date(),
        }, { new: true });
        if (!job) return res.status(404).json({ success: false, message: 'Job not found.' });
        res.json({ success: true, message: 'Job approved and is now live.', data: { job } });
    } catch (err) { next(err); }
});

// Reject a job
router.put('/jobs/:id/reject', async (req, res, next) => {
    try {
        const job = await Job.findByIdAndUpdate(req.params.id, {
            status: 'rejected',
            rejectionReason: req.body.reason || 'Does not meet quality standards.',
        }, { new: true });
        res.json({ success: true, message: 'Job rejected.', data: { job } });
    } catch (err) { next(err); }
});

// Manual job creation by admin
router.post('/jobs', async (req, res, next) => {
    try {
        const job = await Job.create({ ...req.body, source: 'manual', addedBy: req.user._id, status: 'approved', approvedAt: new Date() });
        res.status(201).json({ success: true, data: { job } });
    } catch (err) { next(err); }
});

// Delete a job
router.delete('/jobs/:id', async (req, res, next) => {
    try {
        await Job.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Job deleted.' });
    } catch (err) { next(err); }
});

// Manually trigger job aggregation
router.post('/jobs/fetch', async (req, res, next) => {
    try {
        const result = await aggregateJobs();
        res.json({ success: true, message: 'Job fetching complete.', data: result });
    } catch (err) { next(err); }
});

// ─── Study Materials ──────────────────────────────────────────────────────────
router.post('/study', uploadFile.single('file'), async (req, res, next) => {
    try {
        let fileUrl;
        if (req.file) {
            const result = await uploadBuffer(req.file.buffer, {
                folder: 'jobvault/study',
                resource_type: 'raw',
            });
            fileUrl = result.secure_url;
        }
        const material = await StudyMaterial.create({ ...req.body, fileUrl, uploadedBy: req.user._id });
        res.status(201).json({ success: true, data: { material } });
    } catch (err) { next(err); }
});

router.delete('/study/:id', async (req, res, next) => {
    try {
        await StudyMaterial.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Material deleted.' });
    } catch (err) { next(err); }
});

// ─── Employer Management ─────────────────────────────────────────────────────
const Employer = require('../models/Employer');
const { sendEmail } = require('../services/emailService');

router.get('/employers', protect, adminOnly, async (req, res, next) => {
    try {
        const { status, search } = req.query;
        const filter = {};
        if (status) filter.verificationStatus = status;
        if (search) filter.companyName = { $regex: search, $options: 'i' };
        const employers = await Employer.find(filter).sort({ createdAt: -1 });
        res.json({ success: true, data: employers });
    } catch (err) { next(err); }
});

router.put('/employers/:id/verify', protect, adminOnly, async (req, res, next) => {
    try {
        const employer = await Employer.findByIdAndUpdate(req.params.id,
            { verificationStatus: 'verified', verifiedAt: new Date(), verifiedBy: req.user._id },
            { new: true }
        );
        if (!employer) return res.status(404).json({ success: false, message: 'Employer not found.' });

        // Notify employer
        await sendEmail({
            to: employer.email,
            subject: '🎉 Your JobVault Employer Account is Verified!',
            html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
                <h2 style="color:#4f46e5">You're verified! 🚀</h2>
                <p>Congratulations <strong>${employer.contactName}</strong>! Your company <strong>${employer.companyName}</strong> has been verified on JobVault.</p>
                <p>You can now <a href="${process.env.CLIENT_URL}/employer/post-job" style="color:#4f46e5;font-weight:bold">post jobs</a> and reach thousands of talented candidates.</p>
                <p>Happy hiring! 🎯</p></div>`,
        });

        res.json({ success: true, message: 'Employer verified.', data: employer });
    } catch (err) { next(err); }
});

router.put('/employers/:id/reject', protect, adminOnly, async (req, res, next) => {
    try {
        const { reason } = req.body;
        const employer = await Employer.findByIdAndUpdate(req.params.id,
            { verificationStatus: 'rejected', rejectionReason: reason },
            { new: true }
        );
        if (!employer) return res.status(404).json({ success: false, message: 'Employer not found.' });

        await sendEmail({
            to: employer.email,
            subject: 'JobVault Employer Account — Verification Update',
            html: `<p>Hi ${employer.contactName}, unfortunately your employer account for <strong>${employer.companyName}</strong> was not verified at this time.</p>
                   <p><strong>Reason:</strong> ${reason || 'Not specified'}</p>
                   <p>Please update your company profile and contact us if you have any questions.</p>`,
        });

        res.json({ success: true, message: 'Employer rejected.' });
    } catch (err) { next(err); }
});

module.exports = router;

