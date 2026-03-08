import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Plus, FileText, Trash2, Edit, Download, Target, Upload, Info } from 'lucide-react'
import { resumeAPI } from '../../services/api'
import useAuthStore from '../../store/authStore'
import toast from 'react-hot-toast'
import html2pdf from 'html2pdf.js'
import DOMPurify from 'dompurify'

export default function ResumePage() {
    const { user } = useAuthStore()
    const qc = useQueryClient()
    const { data, isLoading } = useQuery({ queryKey: ['resumes'], queryFn: () => resumeAPI.getAll() })
    const resumes = data?.data?.resumes || []
    const freeDownloadsLeft = Math.max(0, 20 - (user?.resumeDownloadsUsed || 0))

    const deleteMutation = useMutation({
        mutationFn: (id) => resumeAPI.delete(id),
        onSuccess: () => { qc.invalidateQueries(['resumes']); toast.success('Resume deleted') },
        onError: () => toast.error('Delete failed'),
    })

    const handleDownload = async (resume) => {
        try {
            const toastId = toast.loading('Generating PDF...', { id: 'pdf-toast' })

            // Track the download server-side API logic
            await resumeAPI.trackDownload(resume._id)

            // Fetch the PDF blob
            const token = useAuthStore.getState().token
            const baseURL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api'
            const response = await fetch(`${baseURL}/resume/${resume._id}/download`, {
                headers: { Authorization: `Bearer ${token}` }
            })

            const data = await response.json()
            if (!response.ok || !data.success) {
                toast.error(data.message || 'Download limit reached', { id: toastId })
                return
            }

            if (data.isUrl) {
                // Cloudinary uploaded file - it's already a PDF
                // Force a direct download by hitting the Cloudinary URL and converting to blob
                // Add fl_attachment to Cloudinary URL to force DL
                const downloadUrl = data.url.includes('upload/') ? data.url.replace('upload/', 'upload/fl_attachment/') : data.url;
                const pdfRes = await fetch(downloadUrl)
                const blob = await pdfRes.blob()
                const objectUrl = window.URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = objectUrl
                a.download = data.fileName
                document.body.appendChild(a)
                a.click()
                a.remove()
                window.URL.revokeObjectURL(objectUrl)
                toast.success('Resume downloaded!', { id: toastId })
            } else {
                // We have raw HTML, generate it via html2pdf natively on the client
                const opt = {
                    margin: 0,
                    filename: data.fileName,
                    image: { type: 'jpeg', quality: 0.98 },
                    html2canvas: { scale: 2, useCORS: true },
                    jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
                };

                // Create a temporary element to hold the HTML
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = DOMPurify.sanitize(data.html, { USE_PROFILES: { html: true } });
                tempDiv.style.width = '800px';
                // Hide print bar
                const printBar = tempDiv.querySelector('.print-bar');
                if (printBar) printBar.style.display = 'none';

                await html2pdf().set(opt).from(tempDiv).save();
                toast.success('Resume downloaded!', { id: toastId })
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Download failed', { id: 'pdf-toast' })
        }
    }


    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-heading text-2xl font-bold text-gray-900 dark:text-white">My Resumes</h1>
                    <p className="text-gray-500 text-sm mt-1">
                        {user?.isPremium ? 'Premium — Unlimited downloads' : `Free downloads remaining: ${freeDownloadsLeft}/2`}
                    </p>
                </div>
                <Link to="/dashboard/resume/builder" className="btn-primary flex items-center gap-2">
                    <Plus size={16} /> New Resume
                </Link>
            </div>

            {/* Quick action cards (from PDF page 7) */}
            <div className="grid sm:grid-cols-3 gap-4">
                {[
                    { to: '/dashboard/resume/builder', icon: Plus, label: 'Create from Scratch', desc: 'Use AI-powered builder with professional templates', color: 'border-primary-200 bg-primary-50 dark:bg-primary-900/20 dark:border-primary-800' },
                    { to: '/dashboard/resume/builder?mode=upload', icon: Upload, label: 'Enhance Existing Resume', desc: 'Upload your resume and let AI make it ATS-friendly', color: 'border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800' },
                    { to: '/dashboard/resume/ats-check', icon: Target, label: 'ATS Score Check', desc: 'Check how well your resume matches a job description', color: 'border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800' },
                ].map(({ to, icon: Icon, label, desc, color }) => (
                    <Link key={to} to={to} className={`rounded-xl border-2 ${color} p-4 hover:shadow-md transition-all group`}>
                        <Icon size={22} className="text-gray-600 dark:text-gray-300 mb-2 group-hover:scale-110 transition-transform" />
                        <p className="font-semibold text-gray-900 dark:text-white text-sm">{label}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{desc}</p>
                    </Link>
                ))}
            </div>

            {/* Resume importance callout (from PDF page 7) */}
            <div className="card border-l-4 border-primary-500 bg-primary-50 dark:bg-primary-900/20">
                <div className="flex gap-3">
                    <Info size={18} className="text-primary-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="font-semibold text-primary-900 dark:text-primary-300 text-sm">Why a Good Resume Matters</p>
                        <p className="text-xs text-primary-700 dark:text-primary-400 mt-1">
                            75% of resumes are rejected by ATS before a human sees them. An optimized resume with the right keywords can triple your interview chances. Our AI ensures your resume passes every ATS system.
                        </p>
                    </div>
                </div>
            </div>

            {/* Resume list */}
            {isLoading ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3].map(i => <div key={i} className="card h-40 animate-pulse bg-gray-100 dark:bg-gray-800" />)}
                </div>
            ) : resumes.length === 0 ? (
                <div className="card text-center py-12">
                    <FileText size={40} className="mx-auto mb-3 text-gray-300" />
                    <p className="text-gray-500 font-medium">No resumes yet</p>
                    <p className="text-gray-400 text-sm mb-4">Create your first ATS-friendly resume</p>
                    <Link to="/dashboard/resume/builder" className="btn-primary inline-flex items-center gap-2">
                        <Plus size={16} /> Create Resume
                    </Link>
                </div>
            ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {resumes.map(r => (
                        <div key={r._id} className="card group">
                            <div className="flex items-start justify-between mb-3">
                                <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                                    <FileText size={18} className="text-primary-600" />
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Link to={`/dashboard/resume/builder/${r._id}`} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg" title="Edit">
                                        <Edit size={14} className="text-gray-500" />
                                    </Link>
                                    <button onClick={() => deleteMutation.mutate(r._id)} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg" title="Delete">
                                        <Trash2 size={14} className="text-red-500" />
                                    </button>
                                </div>
                            </div>
                            <p className="font-semibold text-gray-900 dark:text-white text-sm mb-1">{r.title}</p>
                            <p className="text-xs text-gray-400 mb-3">v{r.version} · {new Date(r.updatedAt).toLocaleDateString()}</p>
                            {r.lastAtsScore && (
                                <div className="mb-3">
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="text-gray-500">ATS Score</span>
                                        <span className="font-bold text-primary-600">{r.lastAtsScore}/100</span>
                                    </div>
                                    <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full">
                                        <div className="h-full rounded-full" style={{ width: `${r.lastAtsScore}%`, background: r.lastAtsScore >= 70 ? '#22c55e' : r.lastAtsScore >= 50 ? '#f59e0b' : '#ef4444' }} />
                                    </div>
                                </div>
                            )}
                            <button onClick={() => handleDownload(r)}
                                className="w-full flex items-center justify-center gap-2 text-xs btn-secondary py-2">
                                <Download size={13} /> Download PDF
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
