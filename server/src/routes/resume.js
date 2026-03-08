const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { uploadResume } = require('../middleware/upload');
const Resume = require('../models/Resume');
const User = require('../models/User');
const { uploadBuffer } = require('../config/cloudinary');
const { generateTemplateHTML } = require('../services/resumeTemplates');

// Get all resumes for user
router.get('/', protect, async (req, res, next) => {
    try {
        const resumes = await Resume.find({ user: req.user._id }).sort('-updatedAt');
        res.json({ success: true, data: { resumes } });
    } catch (err) { next(err); }
});

// Get single resume
router.get('/:id', protect, async (req, res, next) => {
    try {
        const resume = await Resume.findOne({ _id: req.params.id, user: req.user._id });
        if (!resume) return res.status(404).json({ success: false, message: 'Resume not found.' });
        res.json({ success: true, data: { resume } });
    } catch (err) { next(err); }
});

// Create new resume
router.post('/', protect, async (req, res, next) => {
    try {
        const allowedFields = ['title', 'template', 'themeColor', 'fontStyle', 'personalInfo', 'summary', 'experience', 'education', 'skills', 'projects', 'certifications', 'customSections'];
        const resumeData = {};
        allowedFields.forEach(f => { if (req.body[f] !== undefined) resumeData[f] = req.body[f]; });
        
        const resume = await Resume.create({ user: req.user._id, ...resumeData });
        res.status(201).json({ success: true, data: { resume } });
    } catch (err) { next(err); }
});

// Update resume
router.put('/:id', protect, async (req, res, next) => {
    try {
        const allowedFields = ['title', 'template', 'themeColor', 'fontStyle', 'personalInfo', 'summary', 'experience', 'education', 'skills', 'projects', 'certifications', 'customSections'];
        const updates = {};
        allowedFields.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });
        
        const resume = await Resume.findOneAndUpdate(
            { _id: req.params.id, user: req.user._id },
            { ...updates, $inc: { version: 0 } },
            { new: true, runValidators: true }
        );
        if (!resume) return res.status(404).json({ success: false, message: 'Resume not found.' });
        res.json({ success: true, data: { resume } });
    } catch (err) { next(err); }
});

// Delete resume
router.delete('/:id', protect, async (req, res, next) => {
    try {
        await Resume.findOneAndDelete({ _id: req.params.id, user: req.user._id });
        res.json({ success: true, message: 'Resume deleted.' });
    } catch (err) { next(err); }
});

// Upload an existing resume file — saves to DB and returns a real resume document
router.post('/upload', protect, uploadResume.single('resume'), async (req, res, next) => {
    try {
        if (!req.file) return res.status(400).json({ success: false, message: 'No file provided.' });

        // Upload to Cloudinary for storage
        let fileUrl = null;
        try {
            const result = await uploadBuffer(req.file.buffer, {
                folder: `jobvault/resumes/${req.user._id}`,
                public_id: req.file.originalname,
                resource_type: 'raw',
            });
            fileUrl = result.secure_url;
        } catch (e) {
            console.warn('Cloudinary upload failed (continuing without cloud URL):', e.message);
        }

        // Create a resume record in DB so user can work with it
        const title = req.body.title || req.file.originalname?.replace(/\.[^.]+$/, '') || 'Uploaded Resume';
        const resume = await Resume.create({
            user: req.user._id,
            title,
            uploadedFileUrl: fileUrl,
            isUploaded: true,
            personalInfo: { fullName: req.user.fullName, email: req.user.email },
        });

        // Sync it to the user's profile as their default resume
        const resumeData = { url: fileUrl, originalName: req.file.originalname, uploadedAt: new Date() };
        await User.findByIdAndUpdate(req.user._id, { profileResume: resumeData });

        res.json({ success: true, data: { resume, fileUrl } });
    } catch (err) { next(err); }
});

// Download resume — generates a PDF via Puppeteer and sends it as an attachment
router.get('/:id/download', protect, async (req, res, next) => {
    try {
        const { user } = req;
        const FREE_LIMIT = 20;

        if (!user.isPremiumActive() && user.resumeDownloadsUsed >= FREE_LIMIT) {
            return res.status(403).json({
                success: false,
                message: `Free users can download up to ${FREE_LIMIT} resumes. Upgrade to Premium for unlimited downloads.`,
                upgradeRequired: true,
            });
        }

        const resume = await Resume.findOneAndUpdate(
            { _id: req.params.id, user: req.user._id },
            { $inc: { downloadCount: 1 } },
            { new: true }
        );
        if (!resume) return res.status(404).json({ success: false, message: 'Resume not found.' });

        if (!user.isPremiumActive()) {
            await user.constructor.findByIdAndUpdate(user._id, { $inc: { resumeDownloadsUsed: 1 } });
        }

        const fileName = `${resume.personalInfo?.fullName?.replace(/\s+/g, '_') || 'Resume'}.pdf`;

        // If resume is an uploaded file, return the URL
        if (resume.uploadedFileUrl) {
            return res.json({ success: true, isUrl: true, url: resume.uploadedFileUrl, fileName });
        }

        // Generate print-ready HTML page using the chosen template
        const html = generateTemplateHTML(resume, resume.templateId || 'classic');
        return res.json({ success: true, isUrl: false, html, fileName });

    } catch (err) { next(err); }
});


// Track download (legacy — keep for backward compat)
router.post('/:id/download', protect, async (req, res, next) => {
    try {
        const resume = await Resume.findOne({ _id: req.params.id, user: req.user._id });
        if (!resume) return res.status(404).json({ success: false, message: 'Resume not found.' });
        res.json({ success: true, downloadUrl: `/api/resume/${req.params.id}/download` });
    } catch (err) { next(err); }
});

// ─── Print-Ready HTML Generator ──────────────────────────────────────────────
function generatePrintHTML(resume) {
    const p = resume.personalInfo || {};
    const expHtml = (resume.experience || []).map(e => `
        <div class="section-item">
            <div class="flex-row"><strong>${e.position || ''}</strong><span class="date">${e.startDate || ''} – ${e.current ? 'Present' : (e.endDate || '')}</span></div>
            <div class="company">${e.company || ''}${e.location ? ' · ' + e.location : ''}</div>
            <p>${e.description || ''}</p>
        </div>`).join('');
    const eduHtml = (resume.education || []).map(e => `
        <div class="section-item">
            <div class="flex-row"><strong>${e.degree || ''}${e.field ? ' in ' + e.field : ''}</strong><span class="date">${e.startDate || ''} – ${e.endDate || ''}</span></div>
            <div class="company">${e.institution || ''}${e.grade ? ' · ' + e.grade : ''}</div>
        </div>`).join('');
    const skillsHtml = (resume.skills || []).map(s => `
        <div><strong>${s.category}:</strong> ${(s.items || []).join(', ')}</div>`).join('');

    return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8">
    <title>${p.fullName || 'Resume'} — Resume</title>
    <style>
        * { box-sizing: border-box; }
        body { font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 32px 40px; color: #1a1a1a; font-size: 13px; line-height: 1.55; }
        h1 { font-size: 24px; margin: 0 0 3px; color: #111; font-weight: 700; }
        .contact { color: #444; font-size: 11.5px; margin-bottom: 18px; display: flex; flex-wrap: wrap; gap: 12px; }
        h2 { font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; border-bottom: 2px solid #2563eb; color: #2563eb; margin: 18px 0 8px; padding-bottom: 3px; font-weight: 700; }
        .section-item { margin-bottom: 11px; }
        .flex-row { display: flex; justify-content: space-between; align-items: baseline; }
        .flex-row strong { font-size: 13px; }
        .company { color: #555; font-size: 12px; margin: 2px 0 4px; }
        .date { color: #888; font-size: 11px; white-space: nowrap; }
        p { margin: 3px 0; color: #333; }
        .print-bar { position: fixed; top: 0; left: 0; right: 0; background: #2563eb; color: white; padding: 10px 20px; display: flex; align-items: center; justify-content: space-between; font-family: sans-serif; font-size: 13px; z-index: 999; }
        .print-bar button { padding: 6px 16px; border-radius: 6px; border: none; cursor: pointer; font-weight: 600; font-size: 13px; }
        .print-bar .print-btn { background: white; color: #2563eb; }
        .print-bar .close-btn { background: rgba(255,255,255,0.2); color: white; }
        @media print {
            .print-bar { display: none !important; }
            body { padding: 0; margin: 0; }
        }
    </style></head>
    <body>
    <div class="print-bar">
        <span>📄 ${p.fullName || 'Resume'} — Click <strong>Save as PDF</strong> to download</span>
        <div style="display:flex;gap:8px">
            <button class="print-btn" onclick="window.print()">🖨️ Save as PDF</button>
            <button class="close-btn" onclick="window.close()">✕ Close</button>
        </div>
    </div>
    <div style="margin-top:52px;">
    <h1>${p.fullName || 'Resume'}</h1>
    <div class="contact">
        ${p.email ? `<span>✉ ${p.email}</span>` : ''}
        ${p.phone ? `<span>☎ ${p.phone}</span>` : ''}
        ${p.location ? `<span>📍 ${p.location}</span>` : ''}
        ${p.linkedin ? `<span>🔗 ${p.linkedin}</span>` : ''}
        ${p.github ? `<span>⌥ ${p.github}</span>` : ''}
    </div>
    ${p.summary ? `<h2>Summary</h2><p>${p.summary}</p>` : ''}
    ${resume.experience?.length ? `<h2>Experience</h2>${expHtml}` : ''}
    ${resume.education?.length ? `<h2>Education</h2>${eduHtml}` : ''}
    ${resume.skills?.length ? `<h2>Skills</h2>${skillsHtml}` : ''}
    </div>
    </body></html>`;
}

module.exports = router;

