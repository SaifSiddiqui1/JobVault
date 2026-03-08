const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const StudyMaterial = require('../models/StudyMaterial');

router.get('/', protect, async (req, res, next) => {
    try {
        const { category, type, level } = req.query;
        let page = Math.max(1, parseInt(req.query.page) || 1);
        let limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));

        const query = { isPublic: true };
        if (category) query.category = category;
        if (type) query.type = type;
        if (level) query.level = level;

        const total = await StudyMaterial.countDocuments(query);
        const materials = await StudyMaterial.find(query).sort('-createdAt').skip((page - 1) * limit).limit(Number(limit));
        res.json({ success: true, data: { materials, pagination: { total, pages: Math.ceil(total / limit) } } });
    } catch (err) { next(err); }
});

router.get('/:id', protect, async (req, res, next) => {
    try {
        const material = await StudyMaterial.findOneAndUpdate(
            { _id: req.params.id, isPublic: true },
            { $inc: { viewCount: 1 } },
            { new: true }
        );
        if (!material) return res.status(404).json({ success: false, message: 'Material not found or private.' });
        res.json({ success: true, data: { material } });
    } catch (err) { next(err); }
});

module.exports = router;
