import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Trash2, Upload, BookOpen } from 'lucide-react'
import { adminAPI, studyAPI } from '../../services/api'
import toast from 'react-hot-toast'

export default function AdminStudy() {
    const qc = useQueryClient()
    const [showForm, setShowForm] = useState(false)
    const [form, setForm] = useState({ title: '', description: '', category: 'general', type: 'pdf', level: 'beginner', isPremium: false })
    const [file, setFile] = useState(null)

    const { data, isLoading } = useQuery({ queryKey: ['study-all'], queryFn: () => studyAPI.getAll({}) })
    const materials = data?.data?.materials || []

    const uploadMutation = useMutation({
        mutationFn: () => {
            const fd = new FormData()
            Object.entries(form).forEach(([k, v]) => fd.append(k, v))
            if (file) fd.append('file', file)
            return adminAPI.uploadStudy(fd)
        },
        onSuccess: () => {
            toast.success('Material uploaded!')
            qc.invalidateQueries(['study-all'])
            setShowForm(false)
            setForm({ title: '', description: '', category: 'general', type: 'pdf', level: 'beginner', isPremium: false })
            setFile(null)
        },
        onError: () => toast.error('Upload failed'),
    })

    const deleteMutation = useMutation({
        mutationFn: (id) => adminAPI.deleteStudy(id),
        onSuccess: () => { toast.success('Deleted'); qc.invalidateQueries(['study-all']) },
    })

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-heading text-2xl font-bold text-gray-900 dark:text-white">Study Materials</h1>
                    <p className="text-gray-500 text-sm">Upload field-specific resources for users</p>
                </div>
                <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2 text-sm">
                    <Plus size={15} /> Add Material
                </button>
            </div>

            {/* Upload Form */}
            {showForm && (
                <div className="card space-y-4 border-primary-200 dark:border-primary-800 border-2">
                    <h2 className="font-heading font-semibold text-gray-900 dark:text-white">Upload New Material</h2>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="col-span-2"><label className="label">Title *</label><input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} className="input" placeholder="Material title" /></div>
                        <div><label className="label">Category</label>
                            <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} className="input">
                                {['sde', 'it', 'marketing', 'government', 'interview_prep', 'aptitude', 'resume_tips', 'general'].map(c => <option key={c} value={c}>{c.replace('_', ' ')}</option>)}
                            </select>
                        </div>
                        <div><label className="label">Level</label>
                            <select value={form.level} onChange={e => setForm(p => ({ ...p, level: e.target.value }))} className="input">
                                {['beginner', 'intermediate', 'advanced'].map(l => <option key={l} value={l}>{l}</option>)}
                            </select>
                        </div>
                    </div>
                    <div><label className="label">Description</label><textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={2} className="input resize-none" /></div>
                    <div>
                        <label className="label">File (PDF, DOC, etc.)</label>
                        <input type="file" onChange={e => setFile(e.target.files[0])} className="input py-2 text-sm" />
                    </div>
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                        <input type="checkbox" checked={form.isPremium} onChange={e => setForm(p => ({ ...p, isPremium: e.target.checked }))} />
                        <span className="text-gray-700 dark:text-gray-300">Premium only material</span>
                    </label>
                    <div className="flex gap-3">
                        <button onClick={() => uploadMutation.mutate()} disabled={uploadMutation.isPending || !form.title} className="btn-primary flex items-center gap-2">
                            <Upload size={14} /> {uploadMutation.isPending ? 'Uploading...' : 'Upload Material'}
                        </button>
                        <button onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
                    </div>
                </div>
            )}

            {/* Materials list */}
            {isLoading ? (
                <div className="grid sm:grid-cols-2 gap-4">{[1, 2, 3].map(i => <div key={i} className="card h-28 animate-pulse bg-gray-100 dark:bg-gray-800" />)}</div>
            ) : materials.length === 0 ? (
                <div className="card text-center py-12">
                    <BookOpen size={40} className="mx-auto mb-3 text-gray-300" />
                    <p className="text-gray-500">No study materials yet. Add the first one!</p>
                </div>
            ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {materials.map(m => (
                        <div key={m._id} className="card group">
                            <div className="flex items-start justify-between gap-2 mb-2">
                                <p className="font-semibold text-sm text-gray-900 dark:text-white">{m.title}</p>
                                <button onClick={() => deleteMutation.mutate(m._id)} className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                                    <Trash2 size={13} className="text-red-400" />
                                </button>
                            </div>
                            <div className="flex gap-1.5 flex-wrap">
                                <span className="badge badge-primary text-[10px]">{m.category}</span>
                                <span className="badge badge-warning text-[10px]">{m.level}</span>
                                {m.isPremium && <span className="badge badge-danger text-[10px]">Premium</span>}
                            </div>
                            <p className="text-xs text-gray-400 mt-2">{m.viewCount} views · {m.downloadCount} downloads</p>
                            {m.fileUrl && <a href={m.fileUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary-600 hover:underline mt-1 block">View file →</a>}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
