import { useQuery } from 'react-query'
import { Link } from 'react-router-dom'
import { employersAPI, jobsAPI, applicationsAPI } from '../services/api'
import { Briefcase, Users, MessageSquare, TrendingUp, Eye, Plus } from 'lucide-react'

export default function EmployerDashboard() {
  const { data: applicationsData } = useQuery('employerApplications', () =>
    applicationsAPI.getMyApplications().then(r => r.data)
  )

  const jobs = applicationsData?.employerProfile?.jobs || []
  const allApplications = jobs.flatMap((j: any) => j.applications || [])

  const stats = [
    { label: 'Active Jobs', value: jobs.length, icon: Briefcase },
    { label: 'Total Applications', value: allApplications.length, icon: Users },
    { label: 'New This Week', value: allApplications.filter((a: any) => {
      const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7)
      return new Date(a.createdAt) > weekAgo
    }).length, icon: TrendingUp },
    { label: 'Messages', value: 0, icon: MessageSquare }
  ]

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Employer Dashboard</h1>
        <Link to="/post-job" className="btn-primary flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Post New Job
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="card p-4">
            <stat.icon className="h-6 w-6 text-primary-600 mb-2" />
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            <div className="text-sm text-gray-500">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Active Jobs */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Active Job Postings</h2>
        <div className="space-y-3">
          {jobs.map((job: any) => (
            <div key={job.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <div className="font-medium text-gray-900">{job.title}</div>
                <div className="text-sm text-gray-500">{job.specialty} • {job.city}, {job.state}</div>
                <div className="text-sm text-gray-500 mt-1">
                  {job.applications?.length || 0} applications • Posted {new Date(job.createdAt).toLocaleDateString()}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link to={`/jobs/${job.id}`} className="btn-secondary text-sm py-1 px-3 flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  View
                </Link>
              </div>
            </div>
          )) || (
            <div className="text-center text-gray-500 py-8">
              No active jobs. <Link to="/post-job" className="text-primary-600">Post your first job</Link>
            </div>
          )}
        </div>
      </div>

      {/* Recent Applications */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Applications</h2>
        <div className="space-y-3">
          {allApplications.slice(0, 10).map((app: any) => (
            <div key={app.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold">
                  {app.provider.firstName[0]}{app.provider.lastName[0]}
                </div>
                <div>
                  <div className="font-medium text-gray-900">{app.provider.firstName} {app.provider.lastName}</div>
                  <div className="text-sm text-gray-500">{app.provider.specialty} • Applied to {app.job.title}</div>
                </div>
              </div>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                app.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                app.status === 'REVIEWING' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {app.status.replace(/_/g, ' ')}
              </span>
            </div>
          )) || (
            <div className="text-center text-gray-500 py-8">No applications yet</div>
          )}
        </div>
      </div>
    </div>
  )
}
