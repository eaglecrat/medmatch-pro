import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from 'react-query'
import { jobsAPI } from '../services/api'
import { Briefcase, Plus, X } from 'lucide-react'

const JOB_TYPES = ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'TRAVEL', 'PER_DIEM', 'LOCUM_TENENS']
const SETTINGS = ['HOSPITAL', 'CLINIC', 'PRIVATE_PRACTICE', 'NURSING_HOME', 'URGENT_CARE', 'EMERGENCY_DEPARTMENT', 'SURGERY_CENTER', 'HOME_HEALTH', 'TELEMEDICINE', 'RESEARCH', 'ACADEMIC', 'OTHER']
const SHIFTS = ['DAY', 'NIGHT', 'EVENING', 'ROTATING', 'WEEKEND_ONLY', 'ON_CALL', 'FLEXIBLE']

export default function PostJob() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    title: '', specialty: '', subSpecialty: '', description: '',
    type: 'FULL_TIME', setting: 'HOSPITAL', shiftType: 'DAY',
    location: '', city: '', state: '', zipCode: '',
    isRemote: false, hourlyRate: '', salaryMin: '', salaryMax: '',
    requirements: [''], responsibilities: [''], benefits: [''],
    scheduleDetails: '', startDate: '', duration: ''
  })

  const mutation = useMutation(
    () => jobsAPI.create(form),
    { onSuccess: (res) => navigate(`/jobs/${res.data.id}`) }
  )

  const addItem = (field: string) => setForm({ ...form, [field]: [...(form as any)[field], ''] })
  const removeItem = (field: string, idx: number) => {
    const arr = (form as any)[field].filter((_: any, i: number) => i !== idx)
    setForm({ ...form, [field]: arr })
  }
  const updateItem = (field: string, idx: number, val: string) => {
    const arr = [...(form as any)[field]]
    arr[idx] = val
    setForm({ ...form, [field]: arr })
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
        <Briefcase className="h-6 w-6" /> Post New Position
      </h1>

      <form onSubmit={(e) => { e.preventDefault(); mutation.mutate() }} className="card p-6 space-y-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Job Title *</label>
            <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Specialty *</label>
            <input type="text" value={form.specialty} onChange={(e) => setForm({ ...form, specialty: e.target.value })} className="input" required />
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Job Type *</label>
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="input">
              {JOB_TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Setting *</label>
            <select value={form.setting} onChange={(e) => setForm({ ...form, setting: e.target.value })} className="input">
              {SETTINGS.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Shift Type *</label>
            <select value={form.shiftType} onChange={(e) => setForm({ ...form, shiftType: e.target.value })} className="input">
              {SHIFTS.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
            </select>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
            <input type="text" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="input" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
            <input type="text" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} className="input" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code</label>
            <input type="text" value={form.zipCode} onChange={(e) => setForm({ ...form, zipCode: e.target.value })} className="input" />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input type="checkbox" id="remote" checked={form.isRemote}
            onChange={(e) => setForm({ ...form, isRemote: e.target.checked })} />
          <label htmlFor="remote" className="text-sm text-gray-700">Remote/Telemedicine position</label>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hourly Rate ($)</label>
            <input type="number" value={form.hourlyRate} onChange={(e) => setForm({ ...form, hourlyRate: e.target.value })} className="input" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Salary Min ($)</label>
            <input type="number" value={form.salaryMin} onChange={(e) => setForm({ ...form, salaryMin: e.target.value })} className="input" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Salary Max ($)</label>
            <input type="number" value={form.salaryMax} onChange={(e) => setForm({ ...form, salaryMax: e.target.value })} className="input" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} className="input" required />
        </div>

        {/* Dynamic Lists */}
        {['requirements', 'responsibilities', 'benefits'].map((field) => (
          <div key={field}>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700 capitalize">{field}</label>
              <button type="button" onClick={() => addItem(field)} className="text-sm text-primary-600 flex items-center gap-1">
                <Plus className="h-4 w-4" /> Add
              </button>
            </div>
            <div className="space-y-2">
              {(form as any)[field].map((item: string, idx: number) => (
                <div key={idx} className="flex gap-2">
                  <input type="text" value={item}
                    onChange={(e) => updateItem(field, idx, e.target.value)}
                    className="input flex-1" placeholder={`Enter ${field.slice(0, -1)}`} />
                  <button type="button" onClick={() => removeItem(field, idx)} className="text-red-500 hover:text-red-700">
                    <X className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="flex gap-3 pt-4">
          <button type="submit" disabled={mutation.isLoading} className="btn-primary disabled:opacity-50">
            {mutation.isLoading ? 'Posting...' : 'Post Position'}
          </button>
          <button type="button" onClick={() => navigate('/dashboard')} className="btn-secondary">Cancel</button>
        </div>
      </form>
    </div>
  )
}
