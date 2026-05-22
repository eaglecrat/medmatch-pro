import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from 'react-query'
import { useAuth } from '../context/AuthContext'
import { jobsAPI, applicationsAPI } from '../services/api'
import { MapPin, DollarSign, Briefcase, Calendar, Building2, CheckCircle, Send } from 'lucide-react'

export default function JobDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [coverLetter, setCoverLetter] = useState('')
  const [showApply, setShowApply] = useState(false)

  const { data: job, isLoading } = useQuery(['job', id], () =>
    jobsAPI.getById(id!).then(r => r.data)
  )

  const applyMutation = useMutation(
    () => applicationsAPI.create({ jobId: id, coverLetter }),
    {
      onSuccess: () => {
        alert('Application submitted successfully!')
        setShowApply(false)
        navigate('/applications')
      }
    }
  )

  if (isLoading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div></div>
  if (!job) return <div className="text-center py-12 text-gray-500">Job not found</div>

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link to="/jobs" className="text-sm text-gray-500 hover:text-gray-700">← Back to Jobs</Link>

      <div className="card p-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
            <div className="flex items-center gap-2 text-gray-600 mt-1">
              <Building2 className="h-4 w-4" />
              {job.employer.companyName}
              {job.employer.isVerified && <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full">Verified</span>}
            </div>
          </div>
          {user?.role === 'PROVIDER' && (
            <button
              onClick={() => setShowApply(!showApply)}
              className="btn-primary flex items-center gap-2"
            >
              <Send className="h-4 w-4" />
              Apply Now
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-4 text-sm mb-6">
          <span className="flex items-center gap-1 text-gray-600"><MapPin className="h-4 w-4" />{job.location}</span>
          <span className="flex items-center gap-1 text-gray-600"><Briefcase className="h-4 w-4" />{job.type.replace(/_/g, ' ')}</span>
          <span className="flex items-center gap-1 text-gray-600"><Calendar className="h-4 w-4" />{job.setting.replace(/_/g, ' ')}</span>
          {job.hourlyRate && <span className="flex items-center gap-1 text-gray-600"><DollarSign className="h-4 w-4" />${job.hourlyRate}/hr</span>}
          {job.isRemote && <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-xs font-medium">Remote Available</span>}
        </div>

        <div className="prose max-w-none">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
          <p className="text-gray-600 whitespace-pre-wrap">{job.description}</p>

          {job.requirements?.length > 0 && (
            <>
              <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-2">Requirements</h3>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                {job.requirements.map((req: string, i: number) => (
                  <li key={i}>{req}</li>
                ))}
              </ul>
            </>
          )}

          {job.responsibilities?.length > 0 && (
            <>
              <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-2">Responsibilities</h3>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                {job.responsibilities.map((resp: string, i: number) => (
                  <li key={i}>{resp}</li>
                ))}
              </ul>
            </>
          )}

          {job.benefits?.length > 0 && (
            <>
              <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-2">Benefits</h3>
              <div className="flex flex-wrap gap-2">
                {job.benefits.map((benefit: string, i: number) => (
                  <span key={i} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">{benefit}</span>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Apply Modal */}
      {showApply && (
        <div className="card p-6 border-2 border-primary-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Submit Application</h3>
          <textarea
            value={coverLetter}
            onChange={(e) => setCoverLetter(e.target.value)}
            placeholder="Optional cover letter or message to the employer..."
            rows={4}
            className="input mb-4"
          />
          <div className="flex gap-3">
            <button
              onClick={() => applyMutation.mutate()}
              disabled={applyMutation.isLoading}
              className="btn-primary disabled:opacity-50"
            >
              {applyMutation.isLoading ? 'Submitting...' : 'Submit Application'}
            </button>
            <button onClick={() => setShowApply(false)} className="btn-secondary">Cancel</button>
          </div>
        </div>
      )}
    </div>
  )
}
