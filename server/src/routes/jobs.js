const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Job = require('../models/Job');

// Get all approved jobs (public-ish, needs login)
router.get('/', protect, async (req, res, next) => {
    try {
        const {
            category, remote, jobType, sector,
            search, experienceLevel, country, minSalary, sort,
        } = req.query;
        let page = Math.max(1, parseInt(req.query.page) || 1);
        let limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));

        const sortQuery = sort || '-approvedAt';
        const query = { status: 'approved', isActive: true };

        if (category === 'recommended') {
            // Apply profile-based recommendation logic
            const { currentStatus } = req.user;
            if (currentStatus === 'student') {
                query.$or = [{ jobType: 'internship' }, { experienceLevel: 'fresher' }];
            } else if (currentStatus === 'graduate' || currentStatus === 'fresher') {
                query.experienceLevel = { $in: ['fresher', 'junior'] };
            }
        } else if (category) {
            // Case-insensitive match, and map underscores to spaces
            const safeCat = category.replace('_', ' ').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const safeCategoryStr = category.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            query.$or = [
                { category: { $regex: safeCategoryStr, $options: 'i' } },
                { title: { $regex: safeCat, $options: 'i' } }
            ];
        }

        if (remote) query.remote = remote;
        if (jobType) query.jobType = jobType;
        if (sector) query.sector = sector;
        if (experienceLevel) query.experienceLevel = experienceLevel;
        if (country) query.country = country;
        if (minSalary) query['salary.min'] = { $gte: Number(minSalary) };
        if (search) query.$text = { $search: search };

        // All users see all jobs globally as requested

        const total = await Job.countDocuments(query);
        const jobs = await Job.find(query)
            .sort(sortQuery)
            .skip((page - 1) * limit)
            .limit(Number(limit))
            .lean();

        res.json({
            success: true,
            data: { jobs, pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) } },
        });
    } catch (err) { next(err); }
});

// Get single job
router.get('/:id', protect, async (req, res, next) => {
    try {
        const job = await Job.findOne({ _id: req.params.id, status: 'approved', isActive: true });
        if (!job) return res.status(404).json({ success: false, message: 'Job not found.' });
        await Job.findByIdAndUpdate(job._id, { $inc: { viewCount: 1 } });
        res.json({ success: true, data: { job } });
    } catch (err) { next(err); }
});

// Get AI-recommended jobs for user (based on profile)
router.get('/recommended/for-me', protect, async (req, res, next) => {
    try {
        const { currentStatus, location } = req.user;
        const query = { status: 'approved', isActive: true };

        // Simple recommendations based on user status
        if (currentStatus === 'student') {
            query.$or = [{ jobType: 'internship' }, { experienceLevel: 'fresher' }];
        } else if (currentStatus === 'graduate') {
            query.experienceLevel = { $in: ['fresher', 'junior'] };
        }

        const jobs = await Job.find(query).sort('-approvedAt').limit(20).lean();
        res.json({ success: true, data: { jobs } });
    } catch (err) { next(err); }
});

module.exports = router;
