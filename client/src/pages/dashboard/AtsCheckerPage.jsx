import { useState, useRef, useEffect } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useLocation } from 'react-router-dom'
import {
    Target, Upload, FileText, Sparkles, Lock,
    AlertTriangle, CheckCircle, X, ChevronDown, ChevronUp,
    Zap, BarChart3, Type, TrendingUp
} from 'lucide-react'
import { aiAPI } from '../../services/api'
import useAuthStore from '../../store/authStore'
import toast from 'react-hot-toast'

// ─── Dual-mode input panel ────────────────────────────────────────────────────
function InputPanel({ label, icon: Icon, text, onTextChange, placeholder, accept }) {
    const [mode, setMode] = useState('paste')
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
            const reader = new FileReader()
            reader.onload = e => {
                const raw = new Uint8Array(e.target.result)
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
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/80 dark:border-gray-800 p-5 space-y-3">
            {/* Header + mode toggle */}
            <div className="flex items-center justify-between">
                <label className="font-semibold text-gray-900 dark:text-white text-sm flex items-center gap-2">
                    <Icon size={15} className="text-purple-500" /> {label}
                </label>
                <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5 text-xs">
                    <button
                        onClick={() => setMode('paste')}
                        className={`px-3 py-1.5 rounded-md font-medium transition-all ${mode === 'paste' ? 'bg-white dark:bg-gray-700 shadow text-gray-900 dark:text-white' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        ✏️ Paste
                    </button>
                    <button
                        onClick={() => setMode('upload')}
                        className={`px-3 py-1.5 rounded-md font-medium transition-all ${mode === 'upload' ? 'bg-white dark:bg-gray-700 shadow text-gray-900 dark:text-white' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        📁 Upload
                    </button>
                </div>
            </div>

            {mode === 'paste' && (
                <textarea
                    value={text}
                    onChange={e => onTextChange(e.target.value)}
                    rows={10}
                    className="input resize-none text-sm"
                    placeholder={placeholder}
                />
            )}

            {mode === 'upload' && (
                <div
                    onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    onClick={() => fileRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all min-h-[200px] flex flex-col items-center justify-center gap-3
                        ${dragOver ? 'border-purple-400 bg-purple-50 dark:bg-purple-900/20'
                            : text ? 'border-green-400 bg-green-50 dark:bg-green-900/10'
                                : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 bg-gray-50 dark:bg-gray-800/50'}`}
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

            {text && (
                <p className="text-xs text-gray-400 text-right">{text.length.toLocaleString()} chars</p>
            )}
        </div>
    )
}

// ─── Score Ring ────────────────────────────────────────────────────────────────
function ScoreRing({ score }) {
    const circumference = 2 * Math.PI * 54
    const color = score >= 70 ? '#22c55e' : score >= 50 ? '#f59e0b' : '#ef4444'
    const label = score >= 70 ? 'Strong Match' : score >= 50 ? 'Moderate Match' : 'Weak Match'
    return (
        <div className="flex flex-col items-center gap-2">
            <div className="relative w-36 h-36">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="54" fill="none" stroke="currentColor" strokeWidth="12" className="text-gray-200 dark:text-gray-800" />
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

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AtsCheckerPage() {
    const { user } = useAuthStore()
    const location = useLocation()
    const isPremium = user?.isPremium

    const [resumeText, setResumeText] = useState('')
    const [jobDescription, setJobDescription] = useState('')
    const [result, setResult] = useState(null)

    useEffect(() => {
        if (location.state?.jobDescription) setJobDescription(location.state.jobDescription)
    }, [location.state])

    const checkMutation = useMutation({
        mutationFn: () => aiAPI.checkAts({ resumeText, jobDescription }),
        onSuccess: (res) => { setResult(res.data); toast.success('ATS check complete!') },
        onError: (err) => toast.error(err.response?.data?.message || 'ATS check failed'),
    })

    const canCheck = resumeText.trim().length > 50 && jobDescription.trim().length > 50

    return (
        <div className="space-y-6 page-enter">

            {/* ── Hero ── */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0f0a1a] via-[#1a1033] to-[#0d1117] p-8 md:p-10 border border-purple-900/30">
                <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(at 20% 30%, rgba(124,59,237,0.2) 0%, transparent 50%), radial-gradient(at 80% 70%, rgba(59,130,246,0.1) 0%, transparent 50%)' }} />
                <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-purple-600/15 blur-[80px]" />

                <div className="relative flex flex-col md:flex-row items-center gap-6">
                    <div className="w-16 h-16 shrink-0 rounded-2xl bg-purple-500/20 border border-purple-500/30 backdrop-blur-md flex items-center justify-center shadow-2xl shadow-purple-500/10">
                        <Target size={32} className="text-purple-300" />
                    </div>
                    <div className="text-center md:text-left">
                        <h1 className="text-3xl font-extrabold text-white tracking-tight">
                            ATS Score Checker
                        </h1>
                        <p className="text-purple-200/70 mt-2 max-w-2xl text-sm leading-relaxed">
                            Optimize your resume against specific job requirements to beat Applicant Tracking Systems. Get instant, actionable feedback.
                        </p>
                    </div>
                </div>
            </div>

            {/* Pre-fill notice */}
            {location.state?.jobTitle && (
                <div className="flex items-center gap-2 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl px-4 py-2.5 text-sm text-purple-700 dark:text-purple-300">
                    <CheckCircle size={15} />
                    Job description pre-filled from: <strong>{location.state.jobTitle}</strong> at <strong>{location.state.company}</strong>
                </div>
            )}

            {/* ── Dual Input Panels ── */}
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

            {/* ── Analyze Button ── */}
            <button
                onClick={() => checkMutation.mutate()}
                disabled={checkMutation.isPending || !canCheck}
                className="w-full py-4 rounded-xl font-semibold text-base text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-lg shadow-purple-600/25 hover:shadow-xl hover:shadow-purple-600/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2"
            >
                <Sparkles size={18} />
                {checkMutation.isPending ? 'Analyzing with AI...' : 'Check ATS Score'}
            </button>
            {!canCheck && (resumeText || jobDescription) && (
                <p className="text-center text-xs text-gray-400 -mt-3">Both resume and job description must have at least 50 characters</p>
            )}

            {/* ── Results ── */}
            {result && (
                <div className="space-y-4 page-enter">

                    {/* Score Hero */}
                    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/80 dark:border-gray-800 p-6 flex flex-col md:flex-row items-center gap-6">
                        <ScoreRing score={result.score} />
                        <div className="flex-1 text-center md:text-left space-y-3">
                            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold
                                ${result.score >= 70 ? 'text-green-700 bg-green-100 dark:bg-green-900/30 dark:text-green-300'
                                    : result.score >= 50 ? 'text-amber-700 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-300'
                                        : 'text-red-700 bg-red-100 dark:bg-red-900/30 dark:text-red-300'}`}>
                                Grade: {result.grade}
                            </div>
                            <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">{result.summary}</p>
                        </div>
                    </div>

                    {/* Quick Stats from Stitch design */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {[
                            { label: 'Keywords', value: `${result.keywordMatches?.length || 0}/${(result.keywordMatches?.length || 0) + (result.missingKeywords?.length || 0)}`, icon: BarChart3, color: 'text-purple-500' },
                            { label: 'Formatting', value: result.score >= 60 ? 'Good' : 'Needs Work', icon: Type, color: 'text-blue-500' },
                            { label: 'Readability', value: result.score >= 70 ? 'High' : 'Medium', icon: FileText, color: 'text-emerald-500' },
                            { label: 'Impact', value: result.grade || 'N/A', icon: TrendingUp, color: 'text-amber-500' },
                        ].map(s => (
                            <div key={s.label} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200/80 dark:border-gray-800 p-4 text-center">
                                <s.icon size={20} className={`mx-auto mb-2 ${s.color}`} />
                                <p className="font-bold text-gray-900 dark:text-white text-lg">{s.value}</p>
                                <p className="text-xs text-gray-500">{s.label}</p>
                            </div>
                        ))}
                    </div>

                    {/* Improvements */}
                    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/80 dark:border-gray-800 p-6">
                        <h3 className="font-heading font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <AlertTriangle size={16} className="text-amber-500" />
                            Key Improvements
                            {!isPremium && <span className="ml-2 text-[10px] font-bold bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full">Free Preview</span>}
                        </h3>
                        <ul className="space-y-3">
                            {result.improvements?.map((imp, i) => (
                                <li key={i} className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3">
                                    <AlertTriangle size={14} className="text-amber-500 flex-shrink-0 mt-0.5" />
                                    {imp}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Keywords — Premium */}
                    {isPremium ? (
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/80 dark:border-gray-800 p-6">
                                <h3 className="font-heading font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                    <CheckCircle size={15} className="text-green-500" /> Keyword Matches
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {result.keywordMatches?.map(k => (
                                        <span key={k} className="px-2.5 py-1 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 text-xs font-medium border border-green-200/50 dark:border-green-800/50">{k}</span>
                                    ))}
                                </div>
                            </div>
                            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/80 dark:border-gray-800 p-6">
                                <h3 className="font-heading font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                    <X size={15} className="text-red-500" /> Missing Keywords
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {result.missingKeywords?.map(k => (
                                        <span key={k} className="px-2.5 py-1 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-xs font-medium border border-red-200/50 dark:border-red-800/50">{k}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-gray-900 rounded-2xl border-2 border-dashed border-purple-300 dark:border-purple-700 text-center py-10 px-6">
                            <Lock size={28} className="mx-auto mb-3 text-purple-400" />
                            <p className="font-semibold text-gray-900 dark:text-white text-lg">Unlock Full ATS Analysis</p>
                            <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
                                Get keyword matches, missing keywords, section-by-section scores & AI fix suggestions
                            </p>
                            <button className="mt-5 px-6 py-2.5 rounded-xl font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 shadow-lg shadow-purple-600/20 hover:shadow-xl transition-all inline-flex items-center gap-2">
                                <Sparkles size={14} /> Upgrade to Premium — ₹99/mo
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
