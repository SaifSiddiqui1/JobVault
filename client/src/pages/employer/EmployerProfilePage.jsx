import { useState, useEffect } from 'react';
import { employerAPI } from '../../services/api';
import useEmployerAuthStore from '../../store/employerAuthStore';
import toast from 'react-hot-toast';
import { Building2, Globe, Users, MapPin, Save, Loader } from 'lucide-react';

const INDUSTRIES = ['Technology', 'Finance', 'Healthcare', 'Education', 'E-Commerce', 'Manufacturing', 'Media', 'Consulting', 'Government', 'Other'];
const SIZES = ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'];

export default function EmployerProfilePage() {
    const { employer, updateEmployer } = useEmployerAuthStore();
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({
        contactName: '', companyName: '', companyWebsite: '',
        companyDescription: '', industry: '', companySize: '1-10', headquartersLocation: '',
    });

    useEffect(() => {
        setLoading(true);
        employerAPI.getMe()
            .then(res => {
                const d = res.data;
                setForm({
                    contactName: d.contactName || '',
                    companyName: d.companyName || '',
                    companyWebsite: d.companyWebsite || '',
                    companyDescription: d.companyDescription || '',
                    industry: d.industry || '',
                    companySize: d.companySize || '1-10',
                    headquartersLocation: d.headquartersLocation || '',
                });
            })
            .finally(() => setLoading(false));
    }, []);

    const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);
            const res = await employerAPI.updateProfile(form);
            updateEmployer(res.data);
            toast.success('Company profile updated!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to save changes.');
        } finally {
            setSaving(false);
        }
    };

    const inputCls = "w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-gray-400";

    if (loading) return (
        <div className="flex items-center justify-center h-64"><Loader className="animate-spin text-indigo-500" size={32} /></div>
    );

    return (
        <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
            <div>
                <h1 className="font-heading text-2xl font-bold text-gray-900 dark:text-white">Company Profile</h1>
                <p className="text-gray-500 mt-1">Keep your profile updated so candidates can learn about your company.</p>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
                {/* Company Logo */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
                    <div className="flex items-center gap-5">
                        <div className="w-20 h-20 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center border-2 border-dashed border-indigo-200 dark:border-indigo-800 flex-shrink-0">
                            {employer?.companyLogo
                                ? <img src={employer.companyLogo} alt="Logo" className="w-full h-full object-cover rounded-2xl" />
                                : <Building2 size={28} className="text-indigo-400" />
                            }
                        </div>
                        <div>
                            <p className="font-semibold text-gray-900 dark:text-white">{form.companyName || 'Your Company'}</p>
                            <p className="text-sm text-gray-500 mt-0.5">{employer?.email}</p>
                            <p className="text-xs text-gray-400 mt-2">Logo upload coming soon (use Cloudinary URL in the API for now)</p>
                        </div>
                    </div>
                </div>

                {/* Contact Info */}
                <section className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 space-y-4">
                    <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2"><Users size={18} className="text-indigo-500" /> Contact Person</h2>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Your Name</label>
                        <input name="contactName" value={form.contactName} onChange={handleChange} className={inputCls} placeholder="Rahul Sharma" />
                    </div>
                </section>

                {/* Company Info */}
                <section className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 space-y-4">
                    <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2"><Building2 size={18} className="text-indigo-500" /> Company Details</h2>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Company Name</label>
                        <input name="companyName" value={form.companyName} onChange={handleChange} className={inputCls} placeholder="Acme Technologies Pvt Ltd" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">About Your Company</label>
                        <textarea name="companyDescription" value={form.companyDescription} onChange={handleChange} rows={4}
                            className={`${inputCls} resize-y`} placeholder="Tell candidates who you are, your mission, culture, and what makes you a great place to work..." />
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Industry</label>
                            <select name="industry" value={form.industry} onChange={handleChange} className={inputCls}>
                                <option value="">Select Industry</option>
                                {INDUSTRIES.map(i => <option key={i}>{i}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Company Size</label>
                            <select name="companySize" value={form.companySize} onChange={handleChange} className={inputCls}>
                                {SIZES.map(s => <option key={s}>{s}</option>)}
                            </select>
                        </div>
                    </div>
                </section>

                {/* Location & Web */}
                <section className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 space-y-4">
                    <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2"><Globe size={18} className="text-indigo-500" /> Online Presence</h2>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Company Website</label>
                            <input name="companyWebsite" value={form.companyWebsite} onChange={handleChange} className={inputCls} placeholder="https://..." />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">HQ Location</label>
                            <input name="headquartersLocation" value={form.headquartersLocation} onChange={handleChange} className={inputCls} placeholder="Bangalore, India" />
                        </div>
                    </div>
                </section>

                <button type="submit" disabled={saving}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3.5 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20">
                    {saving ? <Loader size={18} className="animate-spin" /> : <Save size={18} />}
                    {saving ? 'Saving...' : 'Save Changes'}
                </button>
            </form>
        </div>
    );
}
