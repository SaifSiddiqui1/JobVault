import { useState, useCallback, useRef } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Save, Sparkles, Plus, Trash2, ChevronDown, ChevronUp, Upload, FileText, ArrowLeft, Layout, Check, AlignLeft, Briefcase, GraduationCap, Award } from 'lucide-react'
import { resumeAPI, aiAPI } from '../../services/api'
import toast from 'react-hot-toast'
import { TEMPLATES, generateTemplateHTML, TEMPLATE_PREVIEWS } from '../../utils/resumeTemplates'

const THUMB_W = 100
const THUMB_H = 80
const IFRAME_W = 794
const SCALE = THUMB_W / IFRAME_W

function TemplateThumbnail({ tmpl }) {
    return (
        <div style={{ width: THUMB_W, height: THUMB_H, overflow: 'hidden', position: 'relative', borderRadius: 6, background: '#f8fafc' }}>
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

const SECTION = ({ title, icon: Icon, open, toggle, children }) => (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/80 dark:border-gray-800 overflow-hidden text-sm">
        <button onClick={toggle} className="w-full flex items-center justify-between p-4 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
            <div className="flex items-center gap-2.5">
                <div className={`p-1.5 rounded-lg ${open ? 'bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'}`}>
                    <Icon size={16} />
                </div>
                <h3 className="font-heading font-bold text-gray-900 dark:text-white">{title}</h3>
            </div>
            {open ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
        </button>
        <div className={`transition-all duration-300 overflow-hidden ${open ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="p-4 pt-0 space-y-4">
                {children}
            </div>
        </div>
    </div>
)

export default function ResumeBuilderPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const isUploadMode = searchParams.get('mode') === 'upload'
    const qc = useQueryClient()
    const [open, setOpen] = useState({ personal: true, experience: false, education: false, skills: false })
    const toggle = (key) => setOpen(p => ({ ...p, [key]: !p[key] }))

    const [resume, setResume] = useState({
        title: 'Untitled Resume', templateId: 'modern',
        personalInfo: { fullName: '', email: '', phone: '', location: '', linkedin: '', github: '', portfolio: '', summary: '' },
        experience: [], education: [], skills: [{ category: 'Key Skills', items: [], level: 'intermediate' }],
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
            toast.success('Resume saved successfully')
            if (!id) navigate(`/dashboard/resume/builder/${res.data.resume._id}`)
        },
        onError: () => toast.error('Failed to save resume'),
    })

    const aiSummaryMutation = useMutation({
        mutationFn: () => aiAPI.generateSummary({ resumeData: resume }),
        onSuccess: (res) => {
            setResume(p => ({ ...p, personalInfo: { ...p.personalInfo, summary: res.data.summary } }))
            toast.success('AI optimized summary generated!')
        },
    })

    const updatePersonal = (field, val) => setResume(p => ({ ...p, personalInfo: { ...p.personalInfo, [field]: val } }))
    const addExp = () => setResume(p => ({ ...p, experience: [...p.experience, { company: '', position: '', location: '', startDate: '', endDate: '', current: false, description: '' }] }))
    const upExp = (i, field, val) => setResume(p => { const e = [...p.experience]; e[i] = { ...e[i], [field]: val }; return { ...p, experience: e } })
    const removeExp = (i) => setResume(p => ({ ...p, experience: p.experience.filter((_, idx) => idx !== i) }))

    const addEdu = () => setResume(p => ({ ...p, education: [...p.education, { institution: '', degree: '', field: '', startDate: '', endDate: '', grade: '' }] }))
    const upEdu = (i, field, val) => setResume(p => { const e = [...p.education]; e[i] = { ...e[i], [field]: val }; return { ...p, education: e } })

    if (isUploadMode) return <UploadResumeMode navigate={navigate} qc={qc} />

    const previewHTML = generateTemplateHTML(resume, resume.templateId || 'modern')

    return (
        <div className="flex h-[calc(100vh-64px)] gap-0 -m-4 md:-m-6 animate-fade-in overflow-hidden bg-[#fafafa] dark:bg-[#0a0a0a]">

            {/* ── LEFT: Studio Panel ── */}
            <div className="w-full lg:w-[45%] xl:w-[40%] flex flex-col border-r border-gray-200 dark:border-gray-800/60 overflow-hidden shadow-2xl shadow-indigo-900/5 z-10">

                {/* Studio Header */}
                <div className="relative bg-gradient-to-r from-gray-900 via-indigo-950 to-gray-900 p-5 flex items-center justify-between flex-shrink-0">
                    <div className="absolute inset-0 mesh-bg opacity-30" />
                    <div className="absolute -left-10 top-0 w-32 h-32 bg-violet-500/20 blur-[40px] pointer-events-none" />

                    <div className="relative z-10 flex-1 mr-4">
                        <div className="flex items-center gap-2 mb-1.5 opacity-90">
                            <Sparkles size={13} className="text-violet-400" />
                            <span className="text-[10px] font-bold uppercase tracking-wider text-violet-300">JobVault AI Builder Pro</span>
                        </div>
                        <input value={resume.title} onChange={e => setResume(p => ({ ...p, title: e.target.value }))}
                            className="font-heading font-extrabold text-xl text-white bg-transparent border-none focus:outline-none focus:ring-0 p-0 w-full placeholder:text-gray-500"
                            placeholder="e.g. Senior Software Engineer" />
                    </div>

                    <div className="relative z-10 flex gap-2">
                        <button onClick={() => navigate(-1)} className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-all">
                            <ArrowLeft size={16} />
                        </button>
                        <button onClick={() => saveMutation.mutate(resume)} disabled={saveMutation.isPending}
                            className="px-4 py-2.5 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-violet-600 to-indigo-500 hover:from-violet-500 hover:to-indigo-400 shadow-lg shadow-violet-500/25 flex items-center gap-2 transition-all">
                            <Save size={15} /> {saveMutation.isPending ? '...' : 'Save'}
                        </button>
                    </div>
                </div>

                {/* Form Sections */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-gray-50/50 dark:bg-[#0a0a0a]">

                    {/* Template Gallery */}
                    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/80 dark:border-gray-800 p-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-heading font-bold text-gray-900 dark:text-white flex items-center gap-2 text-sm">
                                <Layout size={16} className="text-indigo-500" /> AI Templates
                            </h3>
                        </div>
                        <div className="flex overflow-x-auto gap-3 pb-2 scrollbar-none snap-x">
                            {TEMPLATES.map(t => {
                                const selected = resume.templateId === t.id
                                return (
                                    <button key={t.id} onClick={() => setResume(p => ({ ...p, templateId: t.id }))}
                                        className={`snap-center shrink-0 relative rounded-xl border-2 transition-all text-left group
                                            ${selected ? 'border-violet-500 ring-4 ring-violet-500/10' : 'border-gray-200 dark:border-gray-800 hover:border-violet-300'}`}>
                                        <TemplateThumbnail tmpl={t} />
                                        {selected && (
                                            <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-violet-500 flex items-center justify-center shadow-md">
                                                <Check size={12} className="text-white" />
                                            </div>
                                        )}
                                        <div className="mt-1 pb-1 px-1">
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md
                                                ${selected ? 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300' : 'text-gray-500 bg-gray-100 dark:bg-gray-800'}`}>
                                                {t.name}
                                            </span>
                                        </div>
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    {/* Core Information */}
                    <SECTION title="Core Information" icon={AlignLeft} open={open.personal} toggle={() => toggle('personal')}>
                        <div className="grid grid-cols-2 gap-3">
                            <input value={resume.personalInfo.fullName} onChange={e => updatePersonal('fullName', e.target.value)} className="input bg-gray-50 dark:bg-gray-800/50 border-gray-200 col-span-2" placeholder="Full Name" />
                            <input value={resume.personalInfo.email} onChange={e => updatePersonal('email', e.target.value)} className="input bg-gray-50 dark:bg-gray-800/50 border-gray-200" placeholder="Email" type="email" />
                            <input value={resume.personalInfo.phone} onChange={e => updatePersonal('phone', e.target.value)} className="input bg-gray-50 dark:bg-gray-800/50 border-gray-200" placeholder="Phone" />
                            <input value={resume.personalInfo.location} onChange={e => updatePersonal('location', e.target.value)} className="input bg-gray-50 dark:bg-gray-800/50 border-gray-200 col-span-2" placeholder="City, Country" />
                        </div>
                        <div className="relative mt-4">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Professional Summary</label>
                            <textarea value={resume.personalInfo.summary} onChange={e => updatePersonal('summary', e.target.value)}
                                className="input bg-gray-50 dark:bg-gray-800/50 border-gray-200 w-full h-28 resize-none pr-10" placeholder="Explain your unique value..." />
                            <button onClick={() => { if (!resume.personalInfo.fullName) { toast.error('Add your name first'); return; } aiSummaryMutation.mutate() }} disabled={aiSummaryMutation.isPending}
                                className="absolute bottom-3 right-3 p-2 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-lg shadow-lg hover:shadow-xl transition-all"
                                title="Optimize with AI">
                                <Sparkles size={14} className={aiSummaryMutation.isPending ? 'animate-pulse' : ''} />
                            </button>
                        </div>
                    </SECTION>

                    {/* Professional Experience */}
                    <SECTION title="Professional Experience" icon={Briefcase} open={open.experience} toggle={() => toggle('experience')}>
                        {resume.experience.map((exp, i) => (
                            <div key={i} className="group relative border border-gray-200 dark:border-gray-700/60 rounded-xl p-4 bg-gray-50/50 dark:bg-gray-800/30">
                                <button onClick={() => removeExp(i)} className="absolute top-3 right-3 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md opacity-0 group-hover:opacity-100 transition-all">
                                    <Trash2 size={13} />
                                </button>
                                <div className="grid grid-cols-2 gap-3 pr-6">
                                    <input value={exp.position} onChange={e => upExp(i, 'position', e.target.value)} className="input bg-white dark:bg-gray-900 border-gray-200" placeholder="Job Title" />
                                    <input value={exp.company} onChange={e => upExp(i, 'company', e.target.value)} className="input bg-white dark:bg-gray-900 border-gray-200" placeholder="Company Name" />
                                    <div className="col-span-2 flex items-center gap-3">
                                        <input type="month" value={exp.startDate} onChange={e => upExp(i, 'startDate', e.target.value)} className="input bg-white dark:bg-gray-900 border-gray-200 text-xs w-full px-2" />
                                        <span className="text-gray-400 text-xs">to</span>
                                        {exp.current ? (
                                            <div className="input bg-violet-50 text-violet-700 dark:bg-violet-900/20 dark:text-violet-300 border-violet-200 flex items-center justify-center text-xs font-semibold w-full">Present</div>
                                        ) : (
                                            <input type="month" value={exp.endDate} onChange={e => upExp(i, 'endDate', e.target.value)} className="input bg-white dark:bg-gray-900 border-gray-200 text-xs w-full px-2" />
                                        )}
                                        <label className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap cursor-pointer px-2">
                                            <input type="checkbox" checked={exp.current} onChange={e => upExp(i, 'current', e.target.checked)} className="rounded text-violet-600 focus:ring-violet-500" /> Current
                                        </label>
                                    </div>
                                </div>
                                <div className="mt-3">
                                    <textarea value={exp.description} onChange={e => upExp(i, 'description', e.target.value)}
                                        className="input bg-white dark:bg-gray-900 border-gray-200 w-full h-20 resize-none text-xs leading-relaxed"
                                        placeholder="• Led development of...&#10;• Increased revenue by..." />
                                </div>
                            </div>
                        ))}
                        <button onClick={addExp} className="w-full py-3 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:text-violet-600 hover:border-violet-300 hover:bg-violet-50 dark:hover:bg-violet-900/10 font-medium text-xs flex items-center justify-center gap-2 transition-all">
                            <Plus size={14} /> Add Role
                        </button>
                    </SECTION>

                    {/* Education */}
                    <SECTION title="Education History" icon={GraduationCap} open={open.education} toggle={() => toggle('education')}>
                        {resume.education.map((edu, i) => (
                            <div key={i} className="group relative border border-gray-200 dark:border-gray-700/60 rounded-xl p-4 bg-gray-50/50 dark:bg-gray-800/30">
                                <div className="grid grid-cols-2 gap-3">
                                    <input value={edu.institution} onChange={e => upEdu(i, 'institution', e.target.value)} className="input bg-white dark:bg-gray-900 border-gray-200 col-span-2" placeholder="University / School Name" />
                                    <input value={edu.degree} onChange={e => upEdu(i, 'degree', e.target.value)} className="input bg-white dark:bg-gray-900 border-gray-200" placeholder="Degree (e.g. BS, MS)" />
                                    <input value={edu.field} onChange={e => upEdu(i, 'field', e.target.value)} className="input bg-white dark:bg-gray-900 border-gray-200" placeholder="Major / Field" />
                                    <div className="col-span-2 flex items-center justify-between gap-3 text-xs">
                                        <input type="month" value={edu.startDate} onChange={e => upEdu(i, 'startDate', e.target.value)} className="input bg-white dark:bg-gray-900 border-gray-200 w-full px-2" />
                                        <span className="text-gray-400">to</span>
                                        <input type="month" value={edu.endDate} onChange={e => upEdu(i, 'endDate', e.target.value)} className="input bg-white dark:bg-gray-900 border-gray-200 w-full px-2" />
                                    </div>
                                </div>
                            </div>
                        ))}
                        <button onClick={addEdu} className="w-full py-3 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:text-violet-600 hover:border-violet-300 hover:bg-violet-50 dark:hover:bg-violet-900/10 font-medium text-xs flex items-center justify-center gap-2 transition-all">
                            <Plus size={14} /> Add Education
                        </button>
                    </SECTION>
                </div>
            </div>

            {/* ── RIGHT: Realtime Print UI ── */}
            <div className="hidden lg:flex flex-col flex-1 bg-gray-200 block-print overflow-hidden relative">
                {/* Print Control Bar */}
                <div className="absolute top-4 inset-x-0 mx-auto w-max z-20 flex justify-center">
                    <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-gray-200/50 dark:border-gray-800 shadow-xl px-5 py-2.5 rounded-full flex items-center gap-4 text-sm font-medium text-gray-600 dark:text-gray-300">
                        <div className="flex items-center gap-2">
                            <div className="relative flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                            </div>
                            Sync Active
                        </div>
                        <div className="w-px h-4 bg-gray-300 dark:bg-gray-700" />
                        <span>A4 Format</span>
                    </div>
                </div>

                <div className="flex-1 overflow-auto flex justify-center items-start pt-20 pb-20 px-8 custom-scrollbar">
                    {/* Shadow DOM Container for identical print fidelity */}
                    <div className="bg-white shadow-2xl transition-all duration-500" style={{ width: 794, minHeight: 1123 }}>
                        <iframe
                            srcDoc={previewHTML}
                            style={{ width: 794, height: 1123, border: 'none', display: 'block', background: 'white' }}
                            scrolling="no"
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}

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
            toast.success('Resume imported successfully!')
            qc.invalidateQueries(['resumes'])
            navigate(`/dashboard/resume/builder/${res.data.resume._id}`)
        },
        onError: (err) => toast.error(err.response?.data?.message || 'Upload failed'),
    })

    return (
        <div className="max-w-xl mx-auto space-y-6 animate-fade-in mt-10">
            <button onClick={() => navigate('/dashboard/resume')} className="btn-secondary text-sm flex items-center gap-2 w-max">
                <ArrowLeft size={16} /> Back to Resumes
            </button>

            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/80 dark:border-gray-800 p-8 shadow-xl shadow-gray-200/20 dark:shadow-none relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[80px] pointer-events-none" />

                <div className="text-center mb-8 relative z-10">
                    <div className="w-16 h-16 bg-violet-100 dark:bg-violet-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-violet-200 dark:border-violet-800">
                        <FileText size={28} className="text-violet-600 dark:text-violet-400" />
                    </div>
                    <h1 className="font-heading text-2xl font-bold font-gray-900 dark:text-white">Import Existing Resume</h1>
                    <p className="text-gray-500 text-sm mt-2">Upload your PDF or Word document to let our AI automatically extract and format your professional history.</p>
                </div>

                <div className="space-y-6 relative z-10">
                    <div
                        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={(e) => { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files[0]) setFile(e.dataTransfer.files[0]) }}
                        className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer bg-gray-50/50 dark:bg-gray-800/20
                            ${dragOver ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/20' : file ? 'border-green-400 bg-green-50 dark:bg-green-900/10' : 'border-gray-300 dark:border-gray-700 hover:border-violet-300'}`}
                        onClick={() => document.getElementById('resume-upload').click()}
                    >
                        {file ? (
                            <>
                                <Check size={40} className="mx-auto mb-3 text-green-500" />
                                <p className="font-semibold text-green-700 dark:text-green-400">{file.name}</p>
                                <p className="text-xs text-green-600/70 mt-1">Ready for AI extraction</p>
                            </>
                        ) : (
                            <>
                                <Upload size={36} className="mx-auto mb-4 text-gray-400" />
                                <p className="font-semibold text-gray-700 dark:text-gray-300 text-sm">Drag and drop file here</p>
                                <p className="text-xs text-gray-500 mt-2">Supports PDF, DOC, DOCX up to 5MB</p>
                            </>
                        )}
                        <input id="resume-upload" type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={e => setFile(e.target.files[0])} />
                    </div>

                    <button
                        onClick={() => uploadMutation.mutate()}
                        disabled={!file || uploadMutation.isPending}
                        className="w-full btn-primary py-3.5 text-base flex justify-center gap-2">
                        {uploadMutation.isPending ? <span className="animate-spin">⏳</span> : <Sparkles size={18} />}
                        {uploadMutation.isPending ? 'Extracting via AI...' : 'Generate Smart Resume'}
                    </button>
                </div>
            </div>
        </div>
    )
}
