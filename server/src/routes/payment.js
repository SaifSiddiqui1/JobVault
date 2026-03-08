const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { protect } = require('../middleware/auth');
const User = require('../models/User');

// Enforce secrets at runtime initialization
if (process.env.NODE_ENV === 'production' && (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET)) {
    console.warn('WARNING: Razorpay credentials are missing in production!');
}

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'rzp_secret_placeholder',
});

// Get Razorpay Key for Frontend
router.get('/key', (req, res) => {
    res.json({ keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder' });
});

// Create an order
router.post('/create-order', protect, async (req, res, next) => {
    try {
        const amount = 1 * 100; // ₹1 in paise

        const options = {
            amount: amount,
            currency: 'INR',
            receipt: `rcpt_${Date.now()}`
        };

        const order = await razorpay.orders.create(options);

        res.json({
            success: true,
            orderId: order.id,
            amount: options.amount,
            currency: options.currency
        });
    } catch (err) {
        console.error('Razorpay Order Error:', err);
        const errorMsg = err.error?.description || err.message || 'Failed to create payment order.';
        res.status(500).json({ success: false, message: errorMsg });
    }
});

// Verify payment signature
router.post('/verify', protect, async (req, res, next) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({ success: false, message: 'Invalid payment payload.' });
        }

        const secret = process.env.RAZORPAY_KEY_SECRET;
        if (!secret) {
            return res.status(500).json({ success: false, message: 'Payment configuration error' });
        }
        
        // Explicitly cast to strings to prevent NoSQL/Object injection crashes
        const orderIdStr = String(razorpay_order_id);
        const paymentIdStr = String(razorpay_payment_id);
        const signatureStr = String(razorpay_signature);

        const expectedSignature = crypto.createHmac('sha256', secret)
            .update(orderIdStr + '|' + paymentIdStr)
            .digest('hex');

        if (crypto.timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(signatureStr))) {
            // Payment verified, upgrade user
            const premiumExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

            const updatedUser = await User.findByIdAndUpdate(
                req.user._id,
                { isPremium: true, premiumExpiresAt },
                { new: true }
            );

            return res.json({ success: true, message: 'Payment verified successfully! Welcome to Premium.', user: updatedUser });
        } else {
            return res.status(400).json({ success: false, message: 'Invalid payment signature.' });
        }
    } catch (err) {
        console.error('Razorpay Verify Error:', err);
        res.status(500).json({ success: false, message: 'Payment verification failed.' });
    }
});

module.exports = router;
