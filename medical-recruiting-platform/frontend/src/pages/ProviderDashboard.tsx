import { useQuery } from 'react-query'
import { Link } from 'react-router-dom'
import { providersAPI, applicationsAPI, matchingAPI } from '../services/api'
import { Briefcase, MessageSquare, Award, TrendingUp, Calendar, MapPin, DollarSign } from 'lucide-react'

export default function ProviderDashboard() {
  const { data: profile } = useQuery('providerProfile', () =>
    providersAPI.search({}).then(r => r.data.providers?.[0])
  )
  const { data: matches } = useQuery('providerMatches', () =>
    matchingAPI.getMyMatches().then(r => r.data.matches)
  )
  const { data: applications } = useQuery('myApplications', () =>
    applicationsAPI.getMyApplications().then(r => r.data.providerProfile?.applications)
  )

  const stats = [
    { label: 'Profile Completion', value: `${profile?.profileComplete || 0}%`, icon: TrendingUp },
    { label: 'Active Applications', value: applications?.length || 0, icon: Briefcase },
    { label: 'Job Matches', value: matches?.length || 0, icon: Award },
    { label: 'Messages', value: 0, icon: MessageSquare }
  ]

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Provider Dashboard</h1>
        <Link to="/settings" className="btn-secondary">Edit Profile</Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="card p-4">
            <stat.icon className="h-6 w-6 text-medical-600 mb-2" />
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            <div className="text-sm text-gray-500">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Profile Summary */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile Overview</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <div className="text-sm text-gray-500">Specialty</div>
            <div className="font-medium text-gray-900">{profile?.specialty || 'Not set'}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Location</div>
            <div className="font-medium text-gray-900 flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {profile?.city || 'Not set'}, {profile?.state || ''}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Rate Range</div>
            <div className="font-medium text-gray-900 flex items-center gap-1">
              <DollarSign className="h-4 w-4" />
              {profile?.hourlyRateMin || 0} - {profile?.hourlyRateMax || 0}/hr
            </div>
          </div>
        </div>
      </div>

      {/* Job Matches */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Top Job Matches</h2>
          <Link to="/matches" className="text-sm text-primary-600 hover:underline">View All</Link>
        </div>
        <div className="space-y-3">
          {matches?.slice(0, 5).map((match: any) => (
            <div key={match.job.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <div className="font-medium text-gray-900">{match.job.title}</div>
                <div className="text-sm text-gray-500">{match.job.employer.companyName} • {match.job.city}, {match.job.state}</div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-sm font-medium text-medical-600">{match.matchPercentage}% Match</div>
                <Link to={`/jobs/${match.job.id}`} className="btn-primary text-sm py-1 px-3">View</Link>
              </div>
            </div>
          )) || (
            <div className="text-center text-gray-500 py-8">
              Complete your profile to see job matches
            </div>
          )}
        </div>
      </div>

      {/* Applications */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Applications</h2>
          <Link to="/applications" className="text-sm text-primary-600 hover:underline">View All</Link>
        </div>
        <div className="space-y-3">
          {applications?.slice(0, 5).map((app: any) => (
            <div key={app.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <div className="font-medium text-gray-900">{app.job.title}</div>
                <div className="text-sm text-gray-500 flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Applied {new Date(app.createdAt).toLocaleDateString()}
                </div>
              </div>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                app.status === 'ACCEPTED' ? 'bg-green-100 text-green-800' :
                app.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                app.status === 'INTERVIEW_SCHEDULED' ? 'bg-blue-100 text-blue-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {app.status.replace(/_/g, ' ')}
              </span>
            </div>
          )) || (
            <div className="text-center text-gray-500 py-8">
              No applications yet. <Link to="/jobs" className="text-primary-600">Browse jobs</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
