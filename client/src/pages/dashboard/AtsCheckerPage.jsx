import { useState, useRef, useEffect } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useLocation } from 'react-router-dom'
import {
    Target, Upload, FileText, Sparkles, Lock,
    AlertTriangle, CheckCircle, X, ChevronDown, ChevronUp
} from 'lucide-react'
import { aiAPI } from '../../services/api'
import useAuthStore from '../../store/authStore'
import toast from 'react-hot-toast'

// ─── Dual-mode input panel: Upload File OR Paste Text ────────────────────────
function InputPanel({ label, icon: Icon, text, onTextChange, placeholder, accept }) {
    const [mode, setMode] = useState('paste')   // 'paste' | 'upload'
    const [dragOver, setDragOver] = useState(false)
    const [fileName, setFileName] = useState('')
    const fileRef = useRef(null)

    const extractText = (file) => {
        if (!file) return
        const allowed = ['text/plain', 'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
        if (!allowed.some(t => file.type === t) && !file.name.match(/\.(txt|pdf|doc|docx)$/i)) {
            toast.error('Unsupported file type. Use PDF, DOC, DOCX or TXT.')
            return
        }
        if (file.size > 5 * 1024 * 1024) { toast.error('File must be under 5 MB.'); return }
        setFileName(file.name)

        if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
            const reader = new FileReader()
            reader.onload = e => onTextChange(e.target.result)
            reader.readAsText(file)
        } else {
            // For PDF/DOC — read as ArrayBuffer and extract text via FileReader + atob trick
            // Best effort plain-text extraction from binary (words/sentences often readable)
            const reader = new FileReader()
            reader.onload = e => {
                const raw = new Uint8Array(e.target.result)
                // Extract printable ASCII strings of length ≥ 4
                let text = ''
                let run = ''
                for (let i = 0; i < raw.length; i++) {
                    const c = raw[i]
                    if (c >= 32 && c < 127) { run += String.fromCharCode(c) }
                    else {
                        if (run.length >= 4) text += run + ' '
                        run = ''
                    }
                }
                if (run.length >= 4) text += run
                text = text.replace(/\s+/g, ' ').trim()
                if (text.length < 100) {
                    toast('File parsed with limited text. For best results, paste text manually.', { icon: '⚠️' })
                }
                onTextChange(text)
            }
            reader.readAsArrayBuffer(file)
        }
    }

    const handleDrop = (e) => {
        e.preventDefault(); setDragOver(false)
        extractText(e.dataTransfer.files[0])
    }

    const handleFile = (e) => extractText(e.target.files[0])

    return (
        <div className="card space-y-3">
            {/* Header + mode toggle */}
            <div className="flex items-center justify-between">
                <label className="font-semibold text-gray-900 dark:text-white text-sm flex items-center gap-2">
                    <Icon size={15} className="text-primary-500" /> {label}
                </label>
                <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5 text-xs">
                    <button
                        onClick={() => setMode('paste')}
                        className={`px-3 py-1.5 rounded-md font-medium transition-all ${mode === 'paste' ? 'bg-white dark:bg-gray-700 shadow text-gray-900 dark:text-white' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        ✏️ Paste Text
                    </button>
                    <button
                        onClick={() => setMode('upload')}
                        className={`px-3 py-1.5 rounded-md font-medium transition-all ${mode === 'upload' ? 'bg-white dark:bg-gray-700 shadow text-gray-900 dark:text-white' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        📁 Upload File
                    </button>
                </div>
            </div>

            {/* Paste mode */}
            {mode === 'paste' && (
                <textarea
                    value={text}
                    onChange={e => onTextChange(e.target.value)}
                    rows={11}
                    className="input resize-none text-sm"
                    placeholder={placeholder}
                />
            )}

            {/* Upload mode */}
            {mode === 'upload' && (
                <div
                    onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    onClick={() => fileRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all min-h-[200px] flex flex-col items-center justify-center gap-3
                        ${dragOver ? 'border-primary-400 bg-primary-50 dark:bg-primary-900/20'
                            : text ? 'border-green-400 bg-green-50 dark:bg-green-900/10'
                                : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 bg-gray-50 dark:bg-gray-800/50'}`}
                >
                    {text ? (
                        <>
                            <CheckCircle size={36} className="text-green-500" />
                            <p className="font-semibold text-green-700 dark:text-green-400 text-sm">{fileName || 'File loaded'}</p>
                            <p className="text-xs text-gray-500">{text.length.toLocaleString()} characters extracted</p>
                            <button
                                type="button"
                                onClick={e => { e.stopPropagation(); onTextChange(''); setFileName('') }}
                                className="mt-1 flex items-center gap-1 text-xs text-red-400 hover:text-red-600"
                            >
                                <X size={12} /> Remove
                            </button>
                        </>
                    ) : (
                        <>
                            <Upload size={36} className="text-gray-300" />
                            <div>
                                <p className="font-semibold text-gray-600 dark:text-gray-400 text-sm">Drop file here or click to browse</p>
                                <p className="text-xs text-gray-400 mt-1">Supports PDF, DOC, DOCX, TXT · Max 5 MB</p>
                            </div>
                        </>
                    )}
                    <input
                        ref={fileRef}
                        type="file"
                        accept={accept || '.pdf,.doc,.docx,.txt'}
                        className="hidden"
                        onChange={handleFile}
                    />
                </div>
            )}

            {/* Character count */}
            {text && (
                <p className="text-xs text-gray-400 text-right">{text.length.toLocaleString()} chars</p>
            )}
        </div>
    )
}

// ─── Score ring ───────────────────────────────────────────────────────────────
function ScoreRing({ score }) {
    const circumference = 2 * Math.PI * 54
    const color = score >= 70 ? '#22c55e' : score >= 50 ? '#f59e0b' : '#ef4444'
    const label = score >= 70 ? 'Strong Match' : score >= 50 ? 'Moderate Match' : 'Weak Match'
    return (
        <div className="flex flex-col items-center gap-2">
            <div className="relative w-36 h-36">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="54" fill="none" stroke="#e5e7eb" strokeWidth="12" />
                    <circle cx="60" cy="60" r="54" fill="none" stroke={color} strokeWidth="12"
                        strokeDasharray={circumference}
                        strokeDashoffset={circumference * (1 - score / 100)}
                        strokeLinecap="round"
                        style={{ transition: 'stroke-dashoffset 1s ease' }} />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="font-heading font-bold text-3xl text-gray-900 dark:text-white">{score}</span>
                    <span className="text-xs text-gray-500">/ 100</span>
                </div>
            </div>
            <span className="text-sm font-semibold" style={{ color }}>{label}</span>
        </div>
    )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function AtsCheckerPage() {
    const { user } = useAuthStore()
    const location = useLocation()
    const isPremium = user?.isPremium

    const [resumeText, setResumeText] = useState('')
    const [jobDescription, setJobDescription] = useState('')
    const [result, setResult] = useState(null)

    // Pre-fill JD when navigated from JobDetailPage
    useEffect(() => {
        if (location.state?.jobDescription) {
            setJobDescription(location.state.jobDescription)
        }
        if (location.state?.jobTitle) {
            // helpful context
        }
    }, [location.state])

    const checkMutation = useMutation({
        mutationFn: () => aiAPI.checkAts({ resumeText, jobDescription }),
        onSuccess: (res) => { setResult(res.data); toast.success('ATS check complete!') },
        onError: (err) => toast.error(err.response?.data?.message || 'ATS check failed'),
    })

    const canCheck = resumeText.trim().length > 50 && jobDescription.trim().length > 50

    return (
        <div className="space-y-6 animate-fade-in page-enter">
            {/* Premium Hero */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-900 via-violet-900 to-primary-900 p-8 text-center sm:text-left">
                <div className="absolute inset-0 mesh-bg opacity-30" />
                <div className="absolute -left-16 -top-16 w-64 h-64 rounded-full bg-indigo-500/20 blur-[80px]" />
                <div className="absolute right-0 bottom-0 w-96 h-96 rounded-full bg-violet-600/10 blur-[100px]" />
                <div className="relative flex flex-col md:flex-row items-center gap-6">
                    <div className="w-16 h-16 shrink-0 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md flex items-center justify-center shadow-2xl">
                        <Target size={32} className="text-violet-300" />
                    </div>
                    <div>
                        <h1 className="font-heading text-3xl font-extrabold text-white tracking-tight">
                            ATS Score Checker <span className="ml-2 text-[11px] font-bold bg-violet-500/30 text-violet-200 px-2 py-0.5 rounded-full border border-violet-500/50 align-middle">PRO</span>
                        </h1>
                        <p className="text-violet-200/80 mt-2 max-w-2xl text-sm leading-relaxed">
                            Optimize your resume against specific job requirements to beat Applicant Tracking Systems. Paste your resume and job description to get instant, actionable feedback.
                        </p>
                    </div>
                </div>
            </div>

            {/* Pre-fill notice from job detail */}
            {location.state?.jobTitle && (
                <div className="flex items-center gap-2 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-xl px-4 py-2.5 text-sm text-primary-700 dark:text-primary-300">
                    <CheckCircle size={15} />
                    Job description pre-filled from: <strong>{location.state.jobTitle}</strong> at <strong>{location.state.company}</strong>
                </div>
            )}

            {/* Dual input panels */}
            <div className="grid md:grid-cols-2 gap-4">
                <InputPanel
                    label="Your Resume"
                    icon={FileText}
                    text={resumeText}
                    onTextChange={setResumeText}
                    placeholder="Paste your resume content here (plain text works best for accurate ATS results)..."
                    accept=".pdf,.doc,.docx,.txt"
                />
                <InputPanel
                    label="Job Description"
                    icon={Target}
                    text={jobDescription}
                    onTextChange={setJobDescription}
                    placeholder="Paste the full job description here..."
                    accept=".pdf,.doc,.docx,.txt"
                />
            </div>

            {/* Analyze button */}
            <button
                onClick={() => checkMutation.mutate()}
                disabled={checkMutation.isPending || !canCheck}
                className="btn-primary w-full flex items-center justify-center gap-2 py-3.5 text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <Target size={18} />
                {checkMutation.isPending ? 'Analyzing with AI...' : 'Check ATS Score'}
            </button>
            {!canCheck && (resumeText || jobDescription) && (
                <p className="text-center text-xs text-gray-400 -mt-3">Both resume and job description must have at least 50 characters</p>
            )}

            {/* Results */}
            {result && (
                <div className="space-y-4 animate-fade-in">
                    {/* Score hero card */}
                    <div className="card flex flex-col md:flex-row items-center gap-6">
                        <ScoreRing score={result.score} />
                        <div className="flex-1 text-center md:text-left space-y-2">
                            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-bold
                                ${result.score >= 70 ? 'text-green-700 bg-green-100 dark:bg-green-900/30'
                                    : result.score >= 50 ? 'text-amber-700 bg-amber-100 dark:bg-amber-900/30'
                                        : 'text-red-700 bg-red-100 dark:bg-red-900/30'}`}>
                                Grade: {result.grade}
                            </div>
                            <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">{result.summary}</p>
                        </div>
                    </div>

                    {/* Improvements */}
                    <div className="card">
                        <h3 className="font-heading font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                            <AlertTriangle size={16} className="text-amber-500" />
                            Key Improvements
                            {!isPremium && <span className="badge badge-warning ml-2 text-[10px]">Free Preview</span>}
                        </h3>
                        <ul className="space-y-2">
                            {result.improvements?.map((imp, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                                    <AlertTriangle size={14} className="text-amber-500 flex-shrink-0 mt-0.5" />
                                    {imp}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Keyword cards — premium */}
                    {isPremium ? (
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="card">
                                <h3 className="font-heading font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                    <CheckCircle size={15} className="text-green-500" /> Keyword Matches
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {result.keywordMatches?.map(k => (
                                        <span key={k} className="badge badge-success">{k}</span>
                                    ))}
                                </div>
                            </div>
                            <div className="card">
                                <h3 className="font-heading font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                    <X size={15} className="text-red-500" /> Missing Keywords
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {result.missingKeywords?.map(k => (
                                        <span key={k} className="badge badge-danger">{k}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="card border-2 border-dashed border-amber-300 dark:border-amber-700 text-center py-8">
                            <Lock size={24} className="mx-auto mb-2 text-amber-500" />
                            <p className="font-semibold text-gray-900 dark:text-white">Unlock Full ATS Analysis</p>
                            <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
                                Get keyword matches, missing keywords, section-by-section scores & AI fix suggestions
                            </p>
                            <button className="btn-primary mt-4 inline-flex items-center gap-2">
                                <Sparkles size={14} /> Upgrade to Premium — ₹99/mo
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
