const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { premiumOrAdmin } = require('../middleware/auth');
const { uploadResume } = require('../middleware/upload');
const aiService = require('../services/aiService');
const Resume = require('../models/Resume');

// ATS Score Check (free for basic score, premium for detailed)
router.post('/ats-check', protect, async (req, res, next) => {
    try {
        const { resumeText, jobDescription } = req.body;
        if (!resumeText || !jobDescription) {
            return res.status(400).json({ success: false, message: 'Resume text and job description are required.' });
        }
        if (resumeText.length > 20000 || jobDescription.length > 20000) {
            return res.status(400).json({ success: false, message: 'Input text exceeds the maximum allowed length of 20000 characters.' });
        }

        const result = await aiService.checkAtsScore(resumeText, jobDescription);

        // Free users get score + grade + summary only
        // Premium users get full breakdown
        const isPremium = req.user.isPremiumActive() || req.user.role === 'admin';
        const response = isPremium ? result : {
            score: result.score,
            grade: result.grade,
            summary: result.summary,
            improvements: result.improvements?.slice(0, 2),
            premiumRequired: true,
        };

        res.json({ success: true, data: response });
    } catch (err) { next(err); }
});

// Enhance resume with AI (premium)
router.post('/enhance-resume', protect, premiumOrAdmin, async (req, res, next) => {
    try {
        const { resumeId, targetRole } = req.body;
        const resume = await Resume.findOne({ _id: resumeId, user: req.user._id });
        if (!resume) return res.status(404).json({ success: false, message: 'Resume not found.' });

        const enhanced = await aiService.enhanceResume(resume.toObject(), targetRole);

        resume.aiEnhancedVersion = enhanced;
        await resume.save();

        res.json({ success: true, data: { enhanced, resumeId } });
    } catch (err) { next(err); }
});

// Generate professional summary
router.post('/generate-summary', protect, async (req, res, next) => {
    try {
        const { resumeData } = req.body;
        const summary = await aiService.generateSummary(resumeData);
        res.json({ success: true, data: { summary } });
    } catch (err) { next(err); }
});

// Generate cover letter (premium)
router.post('/cover-letter', protect, premiumOrAdmin, async (req, res, next) => {
    try {
        const { resumeId, jobDescription, companyName } = req.body;
        if (jobDescription && jobDescription.length > 20000) {
            return res.status(400).json({ success: false, message: 'Job description exceeds max length.' });
        }
        const resume = await Resume.findOne({ _id: resumeId, user: req.user._id });
        if (!resume) return res.status(404).json({ success: false, message: 'Resume not found.' });

        const coverLetter = await aiService.generateCoverLetter(resume.toObject(), jobDescription, companyName);
        res.json({ success: true, data: { coverLetter } });
    } catch (err) { next(err); }
});

// Skill gap analysis
router.post('/skill-gap', protect, async (req, res, next) => {
    try {
        const { resumeId, jobDescription } = req.body;
        if (jobDescription && jobDescription.length > 20000) {
            return res.status(400).json({ success: false, message: 'Job description exceeds max length.' });
        }
        const resume = await Resume.findOne({ _id: resumeId, user: req.user._id });
        if (!resume) return res.status(404).json({ success: false, message: 'Resume not found.' });

        const analysis = await aiService.analyzeSkillGap(resume.toObject(), jobDescription);
        res.json({ success: true, data: analysis });
    } catch (err) { next(err); }
});

// Generate professional bio
router.post('/generate-bio', protect, async (req, res, next) => {
    try {
        const { skills, currentStatus, location } = req.body;
        const bio = await aiService.generateBio({ fullName: req.user.fullName, currentStatus, skills, location });
        res.json({ success: true, data: { bio } });
    } catch (err) { next(err); }
});

// Generate interview questions
router.post('/interview-questions', protect, async (req, res, next) => {
    try {
        const { jobDescription, difficulty } = req.body;
        if (jobDescription && jobDescription.length > 20000) {
            return res.status(400).json({ success: false, message: 'Job description exceeds max length.' });
        }
        const questions = await aiService.generateInterviewQuestions(jobDescription, difficulty);
        res.json({ success: true, data: questions });
    } catch (err) { next(err); }
});
// LinkedIn Optimizer (Premium)
router.post('/linkedin-optimizer', protect, premiumOrAdmin, async (req, res, next) => {
    try {
        const { resumeId } = req.body;
        const resume = await Resume.findOne({ _id: resumeId, user: req.user._id });
        if (!resume) return res.status(404).json({ success: false, message: 'Resume not found.' });

        const optimization = await aiService.optimizeLinkedInProfile(resume.toObject());
        res.json({ success: true, data: optimization });
    } catch (err) { next(err); }
});

// Career Path Advisor (Premium)
router.post('/career-path', protect, premiumOrAdmin, async (req, res, next) => {
    try {
        const { resumeId } = req.body;
        const resume = await Resume.findOne({ _id: resumeId, user: req.user._id });
        if (!resume) return res.status(404).json({ success: false, message: 'Resume not found.' });

        const careerPath = await aiService.adviseCareerPath(resume.toObject());
        res.json({ success: true, data: careerPath });
    } catch (err) { next(err); }
});

// Job Description Summarizer (Premium)
router.post('/job-summarizer', protect, premiumOrAdmin, async (req, res, next) => {
    try {
        const { jobDescription } = req.body;
        if (!jobDescription) return res.status(400).json({ success: false, message: 'Job description is required.' });
        if (jobDescription.length > 20000) {
            return res.status(400).json({ success: false, message: 'Job description exceeds max length.' });
        }

        const summary = await aiService.summarizeJobDescription(jobDescription);
        res.json({ success: true, data: summary });
    } catch (err) { next(err); }
});

module.exports = router;
