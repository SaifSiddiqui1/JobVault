const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const employerSchema = new mongoose.Schema({
    // Company Info
    companyName: { type: String, required: true, trim: true },
    companyWebsite: { type: String, trim: true },
    companySize: {
        type: String,
        enum: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'],
        default: '1-10'
    },
    industry: { type: String, trim: true },
    companyLogo: { type: String }, // Cloudinary URL
    companyDescription: { type: String, maxLength: 2000 },
    headquartersLocation: { type: String },

    // Contact / Auth
    contactName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },

    // Email Verification
    isEmailVerified: { type: Boolean, default: false },
    otp: { type: String, select: false },
    otpExpires: { type: Date, select: false },

    // Admin verification
    verificationStatus: {
        type: String,
        enum: ['pending', 'verified', 'rejected'],
        default: 'pending',
        index: true
    },
    rejectionReason: { type: String },
    verifiedAt: { type: Date },
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // admin user

    // Stats (denormalized for fast reads)
    totalJobsPosted: { type: Number, default: 0 },
    activeJobsCount: { type: Number, default: 0 },
}, { timestamps: true });

// Hash password before saving
employerSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

// Compare password
employerSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('Employer', employerSchema);
