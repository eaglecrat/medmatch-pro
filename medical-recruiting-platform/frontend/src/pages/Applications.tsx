import { useQuery } from 'react-query'
import { Link } from 'react-router-dom'
import { applicationsAPI } from '../services/api'
import { Briefcase, Calendar, Clock, MessageSquare } from 'lucide-react'

const STATUS_COLORS: any = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  REVIEWING: 'bg-blue-100 text-blue-800',
  INTERVIEW_SCHEDULED: 'bg-purple-100 text-purple-800',
  OFFER_EXTENDED: 'bg-green-100 text-green-800',
  ACCEPTED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
  HIRED: 'bg-green-100 text-green-800'
}

export default function Applications() {
  const { data } = useQuery('myApplications', () => applicationsAPI.getMyApplications().then(r => r.data))

  const providerApps = data?.providerProfile?.applications || []
  const employerJobs = data?.employerProfile?.jobs || []

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
        <Briefcase className="h-6 w-6" /> My Applications
      </h1>

      {providerApps.length > 0 && (
        <div className="space-y-3">
          {providerApps.map((app: any) => (
            <div key={app.id} className="card p-4">
              <div className="flex items-start justify-between">
                <div>
                  <Link to={`/jobs/${app.job.id}`} className="font-semibold text-gray-900 hover:text-primary-600">
                    {app.job.title}
                  </Link>
                  <div className="text-sm text-gray-500 mt-1 flex items-center gap-3">
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />
                      Applied {new Date(app.createdAt).toLocaleDateString()}
                    </span>
                    {app.proposedRate && <span className="flex items-center gap-1"><Clock className="h-3 w-3" />${app.proposedRate}/hr proposed</span>}
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${STATUS_COLORS[app.status] || 'bg-gray-100 text-gray-800'}`}>
                  {app.status.replace(/_/g, ' ')}
                </span>
              </div>
              {app.interviews?.length > 0 && (
                <div className="mt-3 pt-3 border-t">
                  <div className="text-sm font-medium text-gray-700 mb-2">Scheduled Interviews</div>
                  {app.interviews.map((interview: any) => (
                    <div key={interview.id} className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="h-4 w-4" />
                      {new Date(interview.scheduledAt).toLocaleString()} ({interview.duration} min, {interview.type})
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {employerJobs.length > 0 && (
        <div className="space-y-6">
          {employerJobs.map((job: any) => (
            <div key={job.id} className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">{job.title}</h3>
                <span className="text-sm text-gray-500">{job.applications?.length || 0} applications</span>
              </div>
              <div className="space-y-3">
                {job.applications?.map((app: any) => (
                  <div key={app.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold text-sm">
                        {app.provider.firstName[0]}{app.provider.lastName[0]}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{app.provider.firstName} {app.provider.lastName}</div>
                        <div className="text-sm text-gray-500">{app.provider.specialty}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${STATUS_COLORS[app.status] || 'bg-gray-100 text-gray-800'}`}>
                        {app.status.replace(/_/g, ' ')}
                      </span>
                      <Link to={`/messages`} className="text-primary-600 hover:text-primary-700">
                        <MessageSquare className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                )) || <div className="text-sm text-gray-500 text-center py-4">No applications yet</div>}
              </div>
            </div>
          ))}
        </div>
      )}

      {providerApps.length === 0 && employerJobs.length === 0 && (
        <div className="text-center text-gray-500 py-12">
          <Briefcase className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>No applications found</p>
          <Link to="/jobs" className="text-primary-600 hover:underline mt-2 inline-block">Browse Jobs</Link>
        </div>
      )}
    </div>
  )
}
