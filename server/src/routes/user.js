const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { uploadImage, uploadResume } = require('../middleware/upload');
const User = require('../models/User');
const Resume = require('../models/Resume');
const { uploadBuffer } = require('../config/cloudinary');

// Get profile
router.get('/profile', protect, async (req, res, next) => {
    try {
        res.json({ success: true, data: { user: req.user } });
    } catch (err) { next(err); }
});

// Update profile
router.put('/profile', protect, async (req, res, next) => {
    try {
        const allowedFields = [
            'fullName', 'gender', 'location', 'currentStatus', 'dateOfBirth', 'darkMode',
            'preferredLanguage', 'locationBasedJobs', 'jobAlerts',
            // Naukri-style advanced fields
            'profileSummary', 'careerPreferences', 'education', 'keySkills',
            'languages', 'internships', 'employment', 'projects',
            'accomplishments', 'academicAchievements'
        ];

        const updates = {};
        allowedFields.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

        // Contact number changes need admin approval (per PDF)
        if (req.body.contactNumber && req.body.contactNumber !== req.user.contactNumber) {
            updates.pendingContactChange = req.body.contactNumber;
        }

        let user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });

        // Recalculate and save completion score based on new fields
        user.profileCompleteness = user.calcProfileCompleteness();
        await user.save({ validateBeforeSave: false });

        res.json({ success: true, data: { user } });
    } catch (err) { next(err); }
});

// Upload profile photo
router.post('/photo', protect, uploadImage.single('photo'), async (req, res, next) => {
    try {
        if (!req.file) return res.status(400).json({ success: false, message: 'No image provided.' });
        const result = await uploadBuffer(req.file.buffer, {
            folder: `jobvault/photos/${req.user._id}`,
            transformation: [{ width: 400, height: 400, crop: 'fill', gravity: 'face' }],
        });
        const user = await User.findByIdAndUpdate(req.user._id, { photo: result.secure_url }, { new: true });
        res.json({ success: true, message: 'Photo updated!', data: { photo: result.secure_url, user } });
    } catch (err) { next(err); }
});

// Upload profile resume
router.post('/resume', protect, uploadResume.single('resume'), async (req, res, next) => {
    try {
        if (!req.file) return res.status(400).json({ success: false, message: 'No file provided.' });
        const safeFileName = req.file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
        const result = await uploadBuffer(req.file.buffer, {
            folder: `jobvault/resumes_profile/${req.user._id}`,
            public_id: safeFileName,
            resource_type: 'raw',
        });
        const resumeData = { url: result.secure_url, originalName: safeFileName, uploadedAt: new Date() };
        const user = await User.findByIdAndUpdate(req.user._id, { profileResume: resumeData }, { new: true });

        // Sync with Resume collection
        await Resume.create({
            user: req.user._id,
            title: req.file.originalname,
            uploadedFileUrl: result.secure_url,
            isUploaded: true,
            personalInfo: { fullName: req.user.fullName, email: req.user.email },
        });

        res.json({ success: true, message: 'Resume uploaded successfully!', data: { profileResume: resumeData, user } });
    } catch (err) { next(err); }
});

// Delete profile resume
router.delete('/resume', protect, async (req, res, next) => {
    try {
        const user = await User.findByIdAndUpdate(req.user._id, { $set: { profileResume: null } }, { new: true });
        res.json({ success: true, message: 'Resume deleted successfully!', data: { user } });
    } catch (err) { next(err); }
});

// Saved jobs
router.get('/saved-jobs', protect, async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id).populate('savedJobs');
        res.json({ success: true, data: { jobs: user.savedJobs } });
    } catch (err) { next(err); }
});

router.post('/saved-jobs/:jobId', protect, async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);
        const jobId = req.params.jobId;
        const idx = user.savedJobs.indexOf(jobId);
        if (idx === -1) {
            user.savedJobs.push(jobId);
        } else {
            user.savedJobs.splice(idx, 1);
        }
        await user.save({ validateBeforeSave: false });
        res.json({ success: true, saved: idx === -1, message: idx === -1 ? 'Job saved.' : 'Job unsaved.' });
    } catch (err) { next(err); }
});

// Delete account
router.delete('/account', protect, async (req, res, next) => {
    try {
        await User.findByIdAndUpdate(req.user._id, { isActive: false });
        res.json({ success: true, message: 'Account deactivated successfully.' });
    } catch (err) { next(err); }
});

module.exports = router;
