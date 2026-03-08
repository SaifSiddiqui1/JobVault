import { useState, useCallback, useRef } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Save, Sparkles, Plus, Trash2, ChevronDown, ChevronUp, Upload, FileText, ArrowLeft, Layout, Check } from 'lucide-react'
import { resumeAPI, aiAPI } from '../../services/api'
import toast from 'react-hot-toast'
import { TEMPLATES, generateTemplateHTML, TEMPLATE_PREVIEWS } from '../../utils/resumeTemplates'

// ─── Template Thumbnail (real scaled iframe preview) ───────────────────────────────────
const THUMB_W = 110  // card thumbnail display width in px
const THUMB_H = 90   // card thumbnail display height in px
const IFRAME_W = 794 // full A4 width
const SCALE = THUMB_W / IFRAME_W

function TemplateThumbnail({ tmpl }) {
    return (
        <div style={{ width: THUMB_W, height: THUMB_H, overflow: 'hidden', position: 'relative', borderRadius: 4, background: '#f8fafc' }}>
            <iframe
                srcDoc={TEMPLATE_PREVIEWS[tmpl.id] || ''}
                title={tmpl.name}
                scrolling="no"
                style={{
                    width: IFRAME_W,
                    height: Math.round(THUMB_H / SCALE),
                    border: 'none',
                    transform: `scale(${SCALE})`,
                    transformOrigin: 'top left',
                    pointerEvents: 'none',
                    display: 'block',
                }}
            />
        </div>
    )
}



const SECTION = ({ title, open, toggle, children }) => (
    <div className="card">
        <button onClick={toggle} className="flex items-center justify-between w-full">
            <h3 className="font-heading font-semibold text-gray-900 dark:text-white">{title}</h3>
            {open ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
        </button>
        {open && <div className="mt-4 space-y-3">{children}</div>}
    </div>
)

export default function ResumeBuilderPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const isUploadMode = searchParams.get('mode') === 'upload'
    const qc = useQueryClient()
    const [open, setOpen] = useState({ personal: true, experience: false, education: false, skills: false, projects: false })
    const toggle = (key) => setOpen(p => ({ ...p, [key]: !p[key] }))

    const [resume, setResume] = useState({
        title: 'My Resume', templateId: 'modern',
        personalInfo: { fullName: '', email: '', phone: '', location: '', linkedin: '', github: '', portfolio: '', summary: '' },
        experience: [], education: [], skills: [{ category: 'Technical Skills', items: [], level: 'intermediate' }],
        projects: [], certifications: [], languages: [],
    })

    useQuery({
        queryKey: ['resume', id],
        queryFn: () => resumeAPI.getOne(id),
        enabled: !!id,
        onSuccess: (res) => setResume(res.data.resume),
    })

    const saveMutation = useMutation({
        mutationFn: (data) => id ? resumeAPI.update(id, data) : resumeAPI.create(data),
        onSuccess: (res) => {
            qc.invalidateQueries(['resumes'])
            toast.success('Resume saved!')
            if (!id) navigate(`/dashboard/resume/builder/${res.data.resume._id}`)
        },
        onError: () => toast.error('Save failed'),
    })

    const aiSummaryMutation = useMutation({
        mutationFn: () => aiAPI.generateSummary({ resumeData: resume }),
        onSuccess: (res) => {
            setResume(p => ({ ...p, personalInfo: { ...p.personalInfo, summary: res.data.summary } }))
            toast.success('AI summary generated!')
        },
    })

    const updatePersonal = (field, val) => setResume(p => ({ ...p, personalInfo: { ...p.personalInfo, [field]: val } }))

    const addExp = () => setResume(p => ({ ...p, experience: [...p.experience, { company: '', position: '', location: '', startDate: '', endDate: '', current: false, description: '' }] }))
    const upExp = (i, field, val) => setResume(p => { const e = [...p.experience]; e[i] = { ...e[i], [field]: val }; return { ...p, experience: e } })
    const removeExp = (i) => setResume(p => ({ ...p, experience: p.experience.filter((_, idx) => idx !== i) }))

    const addEdu = () => setResume(p => ({ ...p, education: [...p.education, { institution: '', degree: '', field: '', startDate: '', endDate: '', grade: '' }] }))
    const upEdu = (i, field, val) => setResume(p => { const e = [...p.education]; e[i] = { ...e[i], [field]: val }; return { ...p, education: e } })

    // ─── Upload mode ──────────────────────────────────────────────────────────
    if (isUploadMode) return <UploadResumeMode navigate={navigate} qc={qc} />

    // Generate live preview HTML
    const previewHTML = generateTemplateHTML(resume, resume.templateId || 'classic')

    return (
        <div className="flex h-[calc(100vh-64px)] gap-0 -m-4 md:-m-6 animate-fade-in overflow-hidden">

            {/* ── LEFT: Form Panel ── */}
            <div className="w-full lg:w-[44%] xl:w-[42%] flex flex-col border-r border-gray-200 dark:border-gray-800 overflow-hidden">
                {/* Premium Title bar */}
                <div className="relative flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 flex-shrink-0 overflow-hidden">
                    <div className="absolute inset-0 mesh-bg opacity-30 pointer-events-none" />
                    <div className="absolute -left-10 top-0 w-32 h-32 rounded-full bg-violet-500/10 blur-[40px] pointer-events-none" />

                    <div className="min-w-0 flex-1 mr-3 relative z-10">
                        <div className="flex items-center gap-2 mb-1">
                            <Sparkles size={14} className="text-violet-500" />
                            <span className="text-[11px] font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400">JobVault AI Builder</span>
                        </div>
                        <input value={resume.title} onChange={e => setResume(p => ({ ...p, title: e.target.value }))}
                            className="font-heading font-bold text-xl text-gray-900 dark:text-white bg-transparent border-none focus:outline-none focus:ring-0 p-0 w-full"
                            placeholder="Resume title..." />
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                        <button onClick={() => navigate(-1)} className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1">
                            <ArrowLeft size={13} /> Back
                        </button>
                        <button onClick={() => saveMutation.mutate(resume)} disabled={saveMutation.isPending}
                            className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1.5">
                            <Save size={13} /> {saveMutation.isPending ? 'Saving…' : 'Save'}
                        </button>
                    </div>
                </div>

                {/* Scrollable form body */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-950">

                    {/* ── Template Picker ── */}
                    <div className="card">
                        <div className="flex items-center gap-2 mb-3">
                            <Layout size={16} className="text-primary-600" />
                            <h3 className="font-heading font-semibold text-sm text-gray-900 dark:text-white">Template</h3>
                            <span className="ml-auto text-xs text-gray-400">{TEMPLATES.length} layouts</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            {TEMPLATES.map(t => {
                                const selected = resume.templateId === t.id
                                return (
                                    <button key={t.id} onClick={() => setResume(p => ({ ...p, templateId: t.id }))}
                                        title={t.desc}
                                        className={`relative rounded-lg border-2 text-left transition-all overflow-hidden ${selected ? 'border-primary-500 shadow-sm' : 'border-gray-200 dark:border-gray-700 hover:border-primary-300'}`}>
                                        {/* Real template preview thumbnail */}
                                        <div style={{ height: THUMB_H, width: THUMB_W, overflow: 'hidden', position: 'relative' }}>
                                            <TemplateThumbnail tmpl={t} />
                                            {selected && (
                                                <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-primary-500 flex items-center justify-center">
                                                    <Check size={9} className="text-white" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="px-1.5 py-1 border-t border-gray-100 dark:border-gray-700">
                                            <p className={`font-semibold text-[10px] leading-tight ${selected ? 'text-primary-600' : 'text-gray-700 dark:text-gray-300'}`}>{t.name}</p>
                                        </div>
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    {/* ── Personal Info ── */}
                    <SECTION title="Personal Information" open={open.personal} toggle={() => toggle('personal')}>
                        <div className="grid grid-cols-2 gap-3">
                            <input value={resume.personalInfo.fullName} onChange={e => updatePersonal('fullName', e.target.value)} className="input col-span-2" placeholder="Full Name" />
                            <input value={resume.personalInfo.email} onChange={e => updatePersonal('email', e.target.value)} className="input" placeholder="Email" type="email" />
                            <input value={resume.personalInfo.phone} onChange={e => updatePersonal('phone', e.target.value)} className="input" placeholder="Phone" />
                            <input value={resume.personalInfo.location} onChange={e => updatePersonal('location', e.target.value)} className="input col-span-2" placeholder="Location" />
                            <input value={resume.personalInfo.linkedin} onChange={e => updatePersonal('linkedin', e.target.value)} className="input" placeholder="LinkedIn URL" />
                            <input value={resume.personalInfo.github} onChange={e => updatePersonal('github', e.target.value)} className="input" placeholder="GitHub URL" />
                        </div>
                        <div className="relative">
                            <textarea value={resume.personalInfo.summary} onChange={e => updatePersonal('summary', e.target.value)} className="input w-full h-24 resize-none" placeholder="Professional Summary…" />
                            <button onClick={() => { if (!resume.personalInfo.fullName) { toast.error('Add your name first'); return; } aiSummaryMutation.mutate() }} disabled={aiSummaryMutation.isPending}
                                className="absolute bottom-2 right-2 text-xs bg-primary-600 text-white px-2 py-1 rounded-lg hover:bg-primary-700 flex items-center gap-1">
                                <Sparkles size={11} /> {aiSummaryMutation.isPending ? '…' : 'AI'}
                            </button>
                        </div>
                    </SECTION>

                    {/* ── Experience ── */}
                    <SECTION title="Experience" open={open.experience} toggle={() => toggle('experience')}>
                        {resume.experience.map((exp, i) => (
                            <div key={i} className="border border-gray-200 dark:border-gray-700 rounded-xl p-3 space-y-2 bg-white dark:bg-gray-900">
                                <div className="flex items-center justify-between">
                                    <p className="font-medium text-sm text-gray-700 dark:text-gray-300">{exp.position || `Job #${i + 1}`}</p>
                                    <button onClick={() => removeExp(i)} className="text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <input value={exp.position} onChange={e => upExp(i, 'position', e.target.value)} className="input text-sm" placeholder="Job Title" />
                                    <input value={exp.company} onChange={e => upExp(i, 'company', e.target.value)} className="input text-sm" placeholder="Company" />
                                    <input value={exp.location} onChange={e => upExp(i, 'location', e.target.value)} className="input text-sm" placeholder="Location" />
                                    <div className="flex items-center gap-2">
                                        <input type="checkbox" checked={exp.current} onChange={e => upExp(i, 'current', e.target.checked)} className="rounded" id={`cur-${i}`} />
                                        <label htmlFor={`cur-${i}`} className="text-xs text-gray-500">Current</label>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-400 mb-1 block">Start (MM/YYYY)</label>
                                        <input type="month" value={exp.startDate} onChange={e => upExp(i, 'startDate', e.target.value)} className="input text-sm w-full" />
                                    </div>
                                    {!exp.current && (
                                        <div>
                                            <label className="text-xs text-gray-400 mb-1 block">End (MM/YYYY)</label>
                                            <input type="month" value={exp.endDate} onChange={e => upExp(i, 'endDate', e.target.value)} className="input text-sm w-full" />
                                        </div>
                                    )}
                                </div>
                                <textarea value={exp.description} onChange={e => upExp(i, 'description', e.target.value)} className="input text-sm w-full h-16 resize-none" placeholder="Describe your responsibilities and achievements…" />
                            </div>
                        ))}
                        <button onClick={addExp} className="btn-secondary w-full text-sm flex items-center justify-center gap-2"><Plus size={14} /> Add Experience</button>
                    </SECTION>

                    {/* ── Education ── */}
                    <SECTION title="Education" open={open.education} toggle={() => toggle('education')}>
                        {resume.education.map((edu, i) => (
                            <div key={i} className="border border-gray-200 dark:border-gray-700 rounded-xl p-3 space-y-2 bg-white dark:bg-gray-900">
                                <div className="grid grid-cols-2 gap-2">
                                    <input value={edu.institution} onChange={e => upEdu(i, 'institution', e.target.value)} className="input text-sm col-span-2" placeholder="Institution" />
                                    <input value={edu.degree} onChange={e => upEdu(i, 'degree', e.target.value)} className="input text-sm" placeholder="Degree" />
                                    <input value={edu.field} onChange={e => upEdu(i, 'field', e.target.value)} className="input text-sm" placeholder="Field of Study" />
                                    <div>
                                        <label className="text-xs text-gray-400 mb-1 block">Start</label>
                                        <input type="month" value={edu.startDate} onChange={e => upEdu(i, 'startDate', e.target.value)} className="input text-sm w-full" />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-400 mb-1 block">End</label>
                                        <input type="month" value={edu.endDate} onChange={e => upEdu(i, 'endDate', e.target.value)} className="input text-sm w-full" />
                                    </div>
                                    <input value={edu.grade} onChange={e => upEdu(i, 'grade', e.target.value)} className="input text-sm col-span-2" placeholder="Grade / GPA (optional)" />
                                </div>
                            </div>
                        ))}
                        <button onClick={addEdu} className="btn-secondary w-full text-sm flex items-center justify-center gap-2"><Plus size={14} /> Add Education</button>
                    </SECTION>

                    {/* ── Skills ── */}
                    <SECTION title="Skills" open={open.skills} toggle={() => toggle('skills')}>
                        {resume.skills.map((sg, i) => (
                            <div key={i} className="border border-gray-200 dark:border-gray-700 rounded-xl p-3 space-y-2 bg-white dark:bg-gray-900">
                                <input value={sg.category} onChange={e => setResume(p => { const s = [...p.skills]; s[i] = { ...s[i], category: e.target.value }; return { ...p, skills: s } })}
                                    className="input text-sm font-medium" placeholder="Category (e.g. Technical Skills)" />
                                <SkillTagInput value={sg.items || []} onChange={tags => setResume(p => { const s = [...p.skills]; s[i] = { ...s[i], items: tags }; return { ...p, skills: s } })} />
                            </div>
                        ))}
                        <button onClick={() => setResume(p => ({ ...p, skills: [...p.skills, { category: 'New Skill Group', items: [] }] }))}
                            className="btn-secondary w-full text-sm flex items-center justify-center gap-2"><Plus size={14} /> Add Skill Group</button>
                    </SECTION>
                </div>
            </div>

            {/* ── RIGHT: Live Preview Pane ── */}
            <div className="hidden lg:flex flex-col flex-1 bg-gray-100 dark:bg-gray-900 overflow-hidden">
                {/* Preview header bar */}
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex-shrink-0">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                        <span>Live Preview — <strong className="text-gray-700 dark:text-gray-300">{TEMPLATES.find(t => t.id === resume.templateId)?.name || 'Classic'}</strong></span>
                    </div>
                    <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">A4 format</span>
                </div>

                {/* Scaled iframe preview */}
                <div className="flex-1 overflow-auto p-6 flex justify-center items-start">
                    <div className="relative" style={{ width: 794, flexShrink: 0 }}>
                        {/* Shadow container */}
                        <div className="shadow-2xl rounded-sm overflow-hidden" style={{ width: 794 }}>
                            <iframe
                                srcDoc={previewHTML}
                                title="Resume Preview"
                                style={{ width: 794, height: 1123, border: 'none', display: 'block' }}
                                scrolling="no"
                            />
                        </div>
                        <p className="text-center text-xs text-gray-400 mt-3">Preview (A4) — Save and click Download PDF to get your resume</p>
                    </div>
                </div>
            </div>

        </div>
    )


}

// ─── Skill Tag Input ──────────────────────────────────────────────────────────
function SkillTagInput({ value, onChange }) {
    const inputRef = useRef(null)
    const [input, setInput] = useState('')
    const addSkill = (raw) => {
        const skill = raw.trim()
        if (skill && !value.includes(skill)) onChange([...value, skill])
        setInput('')
    }
    const handleKey = (e) => {
        if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addSkill(input) }
        if (e.key === 'Backspace' && !input && value.length) onChange(value.slice(0, -1))
    }
    return (
        <div className="flex flex-wrap gap-2 p-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 min-h-[44px] cursor-text"
            onClick={() => inputRef.current?.focus()}>
            {value.map(skill => (
                <span key={skill} className="flex items-center gap-1 px-2 py-0.5 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-xs font-medium rounded-lg">
                    {skill}
                    <button type="button" onClick={() => onChange(value.filter(s => s !== skill))} className="hover:text-red-500 ml-0.5">×</button>
                </span>
            ))}
            <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKey} onBlur={() => input && addSkill(input)}
                placeholder={value.length === 0 ? 'Type a skill, press Enter or comma...' : ''}
                className="flex-1 min-w-[120px] border-none outline-none bg-transparent text-sm text-gray-700 dark:text-gray-300 p-0" />
        </div>
    )
}

// ─── Upload Mode ───────────────────────────────────────────────────────────────
function UploadResumeMode({ navigate, qc }) {
    const [file, setFile] = useState(null)
    const [dragOver, setDragOver] = useState(false)
    const [title, setTitle] = useState('')

    const uploadMutation = useMutation({
        mutationFn: () => {
            const fd = new FormData()
            fd.append('resume', file)
            fd.append('title', title || file.name.replace(/\.[^.]+$/, ''))
            return resumeAPI.upload(fd)
        },
        onSuccess: (res) => {
            toast.success('Resume uploaded! You can now enhance it with AI.')
            qc.invalidateQueries(['resumes'])
            navigate(`/dashboard/resume/ats-check?resumeId=${res.data.resume._id}`)
        },
        onError: (err) => toast.error(err.response?.data?.message || 'Upload failed'),
    })

    const handleDrop = (e) => {
        e.preventDefault()
        setDragOver(false)
        const dropped = e.dataTransfer.files[0]
        if (dropped) setFile(dropped)
    }

    const ACCEPTED = '.pdf,.doc,.docx'

    return (
        <div className="max-w-xl mx-auto space-y-5 animate-fade-in">
            <div className="flex items-center gap-3">
                <button onClick={() => navigate('/dashboard/resume')} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl">
                    <ArrowLeft size={18} className="text-gray-500" />
                </button>
                <div>
                    <h1 className="font-heading text-2xl font-bold text-gray-900 dark:text-white">Upload Existing Resume</h1>
                    <p className="text-gray-500 text-sm">Upload your current resume to enhance it with AI or check ATS score</p>
                </div>
            </div>

            <div className="card space-y-5">
                {/* Drop zone */}
                <div
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer ${dragOver ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' :
                        file ? 'border-green-400 bg-green-50 dark:bg-green-900/10' :
                            'border-gray-200 dark:border-gray-700 hover:border-primary-300'
                        }`}
                    onClick={() => document.getElementById('resume-file-input').click()}
                >
                    {file ? (
                        <>
                            <FileText size={40} className="mx-auto mb-3 text-green-500" />
                            <p className="font-semibold text-green-700 dark:text-green-400">{file.name}</p>
                            <p className="text-sm text-gray-400 mt-1">{(file.size / 1024).toFixed(0)} KB · Click to change</p>
                        </>
                    ) : (
                        <>
                            <Upload size={40} className="mx-auto mb-3 text-gray-300" />
                            <p className="font-semibold text-gray-600 dark:text-gray-400">Drag & drop your resume here</p>
                            <p className="text-sm text-gray-400 mt-1">or click to browse</p>
                            <p className="text-xs text-gray-300 mt-3">Supports PDF, DOC, DOCX · Max 5MB</p>
                        </>
                    )}
                    <input id="resume-file-input" type="file" accept={ACCEPTED} className="hidden"
                        onChange={(e) => setFile(e.target.files[0])} />
                </div>

                {/* Title */}
                <div>
                    <label className="label">Resume Title (optional)</label>
                    <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Software Engineer Resume 2025" className="input" />
                </div>

                {/* What happens next */}
                <div className="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-xl text-sm text-primary-700 dark:text-primary-300">
                    <p className="font-semibold mb-1">After upload, you can:</p>
                    <ul className="space-y-0.5 text-xs text-primary-600 dark:text-primary-400">
                        <li>🎯 Check your ATS score against job descriptions</li>
                        <li>✨ Let AI enhance your resume content</li>
                        <li>📄 Download as a polished PDF</li>
                    </ul>
                </div>

                <div className="flex gap-3">
                    <button onClick={() => navigate('/dashboard/resume')} className="btn-secondary flex-1">Cancel</button>
                    <button
                        onClick={() => uploadMutation.mutate()}
                        disabled={!file || uploadMutation.isPending}
                        className="btn-primary flex-1 flex items-center justify-center gap-2"
                    >
                        <Upload size={15} />
                        {uploadMutation.isPending ? 'Uploading...' : 'Upload & Continue'}
                    </button>
                </div>
            </div>
        </div>
    )
}

