const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
    title: { type: String, required: true, index: true },
    company: { type: String, required: true },
    companyLogo: { type: String },
    location: { type: String, index: true },
    remote: { type: String, enum: ['remote', 'hybrid', 'on-site', 'flexible'], default: 'on-site' },
    jobType: { type: String, default: 'full-time' },

    // Categories from PDF (now open string to support infinite API categories)
    category: {
        type: String,
        index: true,
        default: 'other'
    },
    sector: { type: String, enum: ['private', 'government', 'ngo', 'startup'], default: 'private' },

    description: { type: String, required: true },
    requirements: [String],
    responsibilities: [String],
    skills: [String],
    experienceLevel: { type: String, enum: ['fresher', 'junior', 'mid', 'senior', 'lead', 'executive'] },
    experienceYears: { type: String },

    salary: {
        min: Number,
        max: Number,
        currency: { type: String, default: 'INR' },
        period: { type: String, enum: ['monthly', 'yearly', 'hourly'], default: 'monthly' },
        isDisclosed: { type: Boolean, default: true },
    },

    applyLink: { type: String },
    applyEmail: { type: String },

    // Source tracking (which API/platform this came from)
    source: { type: String, enum: ['adzuna', 'remotive', 'remoteok', 'arbeitnow', 'manual', 'other', 'n8n', 'telegram', 'employer'], default: 'manual' },
    sourceJobId: { type: String }, // original ID from source API
    sourceUrl: { type: String },

    // Employer Portal
    postedByEmployer: { type: mongoose.Schema.Types.ObjectId, ref: 'Employer' },
    applicationMethod: { type: String, enum: ['link', 'email', 'internal'], default: 'link' },

    postedDate: { type: Date, default: Date.now },
    deadline: { type: Date },

    // Admin workflow (from PDF: jobs → admin approval → visible to user)
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending', index: true },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    approvedAt: { type: Date },
    rejectionReason: { type: String },

    // Admin adds manual jobs
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    // Metrics
    viewCount: { type: Number, default: 0 },
    applyCount: { type: Number, default: 0 },
    saveCount: { type: Number, default: 0 },

    // Languages the job requires
    languages: [String],
    country: { type: String, default: 'India' },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });

// Text search index
jobSchema.index({ title: 'text', company: 'text', description: 'text', skills: 'text' });

module.exports = mongoose.model('Job', jobSchema);
