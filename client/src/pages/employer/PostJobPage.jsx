import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { employerAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { Sparkles, MapPin, Briefcase, DollarSign, Globe, ChevronRight, Plus, X, FileText, Upload, Loader2 } from 'lucide-react';

const CATEGORIES = ['Software / IT', 'Marketing', 'Design', 'Sales', 'Finance', 'HR / Recruitment', 'Operations', 'Customer Support', 'Data / AI', 'Product Management', 'Other'];
const JOB_TYPES = ['full-time', 'part-time', 'contract', 'internship', 'freelance'];
const REMOTE_TYPES = ['on-site', 'remote', 'hybrid', 'flexible'];
const EXP_LEVELS = ['fresher', 'junior', 'mid', 'senior', 'lead', 'executive'];

function TagInput({ label, value, onChange, placeholder }) {
    const [input, setInput] = useState('');
    const add = () => {
        if (input.trim() && !value.includes(input.trim())) {
            onChange([...value, input.trim()]);
            setInput('');
        }
    };
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{label}</label>
            <div className="flex flex-wrap gap-2 p-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 min-h-[44px]">
                {value.map(tag => (
                    <span key={tag} className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 rounded-full text-sm font-medium">
                        {tag}
                        <button type="button" onClick={() => onChange(value.filter(t => t !== tag))}><X size={12} /></button>
                    </span>
                ))}
                <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), add())}
                    placeholder={placeholder} className="flex-1 min-w-[120px] bg-transparent text-sm outline-none text-gray-900 dark:text-white placeholder-gray-400" />
                <button type="button" onClick={add} className="text-indigo-500 hover:text-indigo-700"><Plus size={16} /></button>
            </div>
        </div>
    );
}

export default function PostJobPage() {
    const navigate = useNavigate();
    const { id: jobId } = useParams(); // if present, we're in edit mode
    const isEditMode = !!jobId;

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);
    const [form, setForm] = useState({
        title: '', category: '', location: '', country: 'India',
        remote: 'on-site', jobType: 'full-time',
        description: '', experienceLevel: 'mid', experienceYears: '',
        applyLink: '', applyEmail: '', deadline: '',
        sector: 'private',
        salary: { min: '', max: '', isDisclosed: true },
    });
    const [skills, setSkills] = useState([]);
    const [requirements, setRequirements] = useState([]);
    const [responsibilities, setResponsibilities] = useState([]);
    const [pdfFile, setPdfFile] = useState(null);
    const [existingPdf, setExistingPdf] = useState(null);

    // Load job data when editing
    useEffect(() => {
        if (!jobId) return;
        setFetching(true);
        employerAPI.getJob(jobId)
            .then(res => {
                const j = res.data;
                setForm({
                    title: j.title || '', category: j.category || '', location: j.location || '', country: j.country || 'India',
                    remote: j.remote || 'on-site', jobType: j.jobType || 'full-time',
                    description: j.description || '', experienceLevel: j.experienceLevel || 'mid', experienceYears: j.experienceYears || '',
                    applyLink: j.applyLink || '', applyEmail: j.applyEmail || '', deadline: j.deadline ? j.deadline.split('T')[0] : '',
                    sector: j.sector || 'private',
                    salary: j.salary || { min: '', max: '', isDisclosed: true },
                });
                setSkills(j.skills || []);
                setRequirements(j.requirements || []);
                setResponsibilities(j.responsibilities || []);
                if (j.jobDescriptionPdf) setExistingPdf(j.jobDescriptionPdf);
            })
            .catch(() => toast.error('Failed to load job data.'))
            .finally(() => setFetching(false));
    }, [jobId]);

    const set = (field, value) => setForm(p => ({ ...p, [field]: value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.title || !form.description || !form.category) {
            toast.error('Please fill all required fields.');
            return;
        }
        try {
            setLoading(true);

            // Use FormData if there's a PDF, otherwise send JSON
            const formData = new FormData();
            // Append all scalar fields
            Object.entries(form).forEach(([k, v]) => {
                if (k === 'salary') {
                    formData.append(k, JSON.stringify(v));
                } else {
                    formData.append(k, v);
                }
            });
            formData.append('skills', JSON.stringify(skills));
            formData.append('requirements', JSON.stringify(requirements));
            formData.append('responsibilities', JSON.stringify(responsibilities));

            if (pdfFile) {
                formData.append('pdf', pdfFile);
            }

            if (isEditMode) {
                await employerAPI.updateJob(jobId, formData);
                toast.success('Job updated and re-submitted for review!');
            } else {
                await employerAPI.postJob(formData);
                toast.success('Job submitted for admin review!');
            }
            navigate('/employer/jobs');
        } catch (err) {
            toast.error(err.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'post'} job.`);
        } finally {
            setLoading(false);
        }
    };

    const inputCls = "w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-gray-400";

    if (fetching) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin border-4 border-indigo-200 border-t-indigo-600 rounded-full w-10 h-10" />
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
            <div>
                <h1 className="font-heading text-2xl font-bold text-gray-900 dark:text-white">
                    {isEditMode ? 'Edit Job Post' : 'Post a New Job'}
                </h1>
                <p className="text-gray-500 mt-1">
                    {isEditMode
                        ? 'Update the details. Your job will be re-submitted for admin approval.'
                        : 'Fill in the details. Your job will go live after admin approval (usually within a few hours).'}
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Info */}
                <section className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 space-y-4">
                    <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2"><Briefcase size={18} className="text-indigo-500" /> Job Basics</h2>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Job Title *</label>
                        <input value={form.title} onChange={e => set('title', e.target.value)} required placeholder="e.g. Senior React Developer" className={inputCls} />
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Category *</label>
                            <select value={form.category} onChange={e => set('category', e.target.value)} required className={inputCls}>
                                <option value="">Select Category</option>
                                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Experience Level</label>
                            <select value={form.experienceLevel} onChange={e => set('experienceLevel', e.target.value)} className={inputCls}>
                                {EXP_LEVELS.map(l => <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="grid md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Job Type</label>
                            <select value={form.jobType} onChange={e => set('jobType', e.target.value)} className={inputCls}>
                                {JOB_TYPES.map(t => <option key={t}>{t}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Work Mode</label>
                            <select value={form.remote} onChange={e => set('remote', e.target.value)} className={inputCls}>
                                {REMOTE_TYPES.map(t => <option key={t}>{t}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Years of Experience</label>
                            <input value={form.experienceYears} onChange={e => set('experienceYears', e.target.value)} placeholder="e.g. 2-4 years" className={inputCls} />
                        </div>
                    </div>
                </section>

                {/* Location */}
                <section className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 space-y-4">
                    <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2"><MapPin size={18} className="text-indigo-500" /> Location</h2>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">City / Location</label>
                            <input value={form.location} onChange={e => set('location', e.target.value)} placeholder="e.g. Bangalore, India" className={inputCls} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Country</label>
                            <input value={form.country} onChange={e => set('country', e.target.value)} placeholder="India" className={inputCls} />
                        </div>
                    </div>
                </section>

                {/* Description */}
                <section className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 space-y-4">
                    <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2"><Sparkles size={18} className="text-indigo-500" /> Job Details</h2>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Job Description *</label>
                        <textarea value={form.description} onChange={e => set('description', e.target.value)} required rows={6}
                            placeholder="Describe the role, company culture, team, and what the candidate will be doing..."
                            className={`${inputCls} resize-y`} />
                    </div>
                    <TagInput label="Requirements" value={requirements} onChange={setRequirements} placeholder="Add and press Enter..." />
                    <TagInput label="Responsibilities" value={responsibilities} onChange={setResponsibilities} placeholder="Add and press Enter..." />
                    <TagInput label="Skills Required" value={skills} onChange={setSkills} placeholder="e.g. React, Node.js..." />
                </section>

                {/* PDF Upload */}
                <section className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 space-y-4">
                    <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2"><FileText size={18} className="text-indigo-500" /> Job Description PDF (Optional)</h2>
                    <p className="text-sm text-gray-500">Upload a detailed JD as a PDF file. Max 10 MB.</p>

                    {existingPdf && !pdfFile && (
                        <div className="flex items-center gap-3 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-xl px-4 py-3">
                            <FileText size={20} className="text-indigo-600 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-indigo-700 dark:text-indigo-300">Existing PDF attached</p>
                                <a href={existingPdf} target="_blank" rel="noreferrer" className="text-xs text-indigo-500 hover:underline truncate block">View PDF ↗</a>
                            </div>
                            <button type="button" onClick={() => setExistingPdf(null)} className="text-xs text-red-500 hover:text-red-700 font-medium">Remove</button>
                        </div>
                    )}

                    <label className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10 transition-colors">
                        <Upload size={28} className="text-gray-400" />
                        <div className="text-center">
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                {pdfFile ? pdfFile.name : 'Click to upload or drag and drop'}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">PDF files up to 10MB</p>
                        </div>
                        <input type="file" accept="application/pdf" className="hidden"
                            onChange={e => {
                                const file = e.target.files?.[0];
                                if (file) {
                                    if (file.size > 10 * 1024 * 1024) {
                                        toast.error('File too large! Max 10 MB.');
                                        return;
                                    }
                                    setPdfFile(file);
                                    toast.success(`PDF selected: ${file.name}`);
                                }
                            }} />
                    </label>

                    {pdfFile && (
                        <div className="flex items-center gap-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl px-4 py-3">
                            <FileText size={18} className="text-green-600 flex-shrink-0" />
                            <span className="text-sm text-green-700 dark:text-green-300 font-medium flex-1 truncate">{pdfFile.name}</span>
                            <button type="button" onClick={() => setPdfFile(null)} className="text-xs text-red-500 hover:text-red-700 font-medium">Remove</button>
                        </div>
                    )}
                </section>

                {/* Salary */}
                <section className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 space-y-4">
                    <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2"><DollarSign size={18} className="text-indigo-500" /> Salary & Compensation</h2>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={form.salary.isDisclosed} onChange={e => set('salary', { ...form.salary, isDisclosed: e.target.checked })} className="rounded" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Show salary range to candidates</span>
                    </label>
                    {form.salary.isDisclosed && (
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Min Salary (₹/month)</label>
                                <input type="number" value={form.salary.min} onChange={e => set('salary', { ...form.salary, min: e.target.value })} placeholder="30000" className={inputCls} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Max Salary (₹/month)</label>
                                <input type="number" value={form.salary.max} onChange={e => set('salary', { ...form.salary, max: e.target.value })} placeholder="60000" className={inputCls} />
                            </div>
                        </div>
                    )}
                </section>

                {/* Application */}
                <section className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 space-y-4">
                    <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2"><Globe size={18} className="text-indigo-500" /> How to Apply</h2>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Application Link (optional)</label>
                            <input value={form.applyLink} onChange={e => set('applyLink', e.target.value)} placeholder="https://careers.company.com/apply" className={inputCls} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Application Email (optional)</label>
                            <input type="email" value={form.applyEmail} onChange={e => set('applyEmail', e.target.value)} placeholder="jobs@company.com" className={inputCls} />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Application Deadline (optional)</label>
                        <input type="date" value={form.deadline} onChange={e => set('deadline', e.target.value)} className={`${inputCls} max-w-xs`} />
                    </div>
                </section>

                <button type="submit" disabled={loading}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-4 rounded-2xl transition-all shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 text-base">
                    {loading
                        ? <><Loader2 size={18} className="animate-spin" /> {isEditMode ? 'Updating...' : 'Submitting...'}</>
                        : <><ChevronRight size={18} /> {isEditMode ? 'Update & Re-submit for Review' : 'Submit for Review'}</>}
                </button>
            </form>
        </div>
    );
}
