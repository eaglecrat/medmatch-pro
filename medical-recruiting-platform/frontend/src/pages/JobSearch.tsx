import { useState } from 'react'
import { useQuery } from 'react-query'
import { Link } from 'react-router-dom'
import { jobsAPI } from '../services/api'
import { Search, MapPin, DollarSign, Filter, X, Briefcase } from 'lucide-react'

const JOB_TYPES = ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'TRAVEL', 'PER_DIEM', 'LOCUM_TENENS']
const SETTINGS = ['HOSPITAL', 'CLINIC', 'PRIVATE_PRACTICE', 'NURSING_HOME', 'URGENT_CARE', 'TELEMEDICINE']

export default function JobSearch() {
  const [filters, setFilters] = useState({
    specialty: '', state: '', city: '', type: '', setting: '', minRate: '',
    isRemote: false, page: 1, limit: 20
  })
  const [showFilters, setShowFilters] = useState(false)

  const { data, isLoading } = useQuery(
    ['jobs', filters],
    () => jobsAPI.search(filters).then(r => r.data),
    { keepPreviousData: true }
  )

  const jobs = data?.jobs || []
  const pagination = data?.pagination

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Find Medical Positions</h1>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="btn-secondary flex items-center gap-2"
        >
          <Filter className="h-4 w-4" />
          Filters
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by specialty..."
            value={filters.specialty}
            onChange={(e) => setFilters({ ...filters, specialty: e.target.value, page: 1 })}
            className="input pl-10"
          />
        </div>
        <div className="relative w-48">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="State"
            value={filters.state}
            onChange={(e) => setFilters({ ...filters, state: e.target.value, page: 1 })}
            className="input pl-10"
          />
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="card p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-gray-900">Advanced Filters</h3>
            <button onClick={() => setShowFilters(false)}><X className="h-5 w-5 text-gray-400" /></button>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Job Type</label>
              <select
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value, page: 1 })}
                className="input"
              >
                <option value="">All Types</option>
                {JOB_TYPES.map(t => (
                  <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Setting</label>
              <select
                value={filters.setting}
                onChange={(e) => setFilters({ ...filters, setting: e.target.value, page: 1 })}
                className="input"
              >
                <option value="">All Settings</option>
                {SETTINGS.map(s => (
                  <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Hourly Rate</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="number"
                  placeholder="0"
                  value={filters.minRate}
                  onChange={(e) => setFilters({ ...filters, minRate: e.target.value, page: 1 })}
                  className="input pl-10"
                />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="remote"
              checked={filters.isRemote}
              onChange={(e) => setFilters({ ...filters, isRemote: e.target.checked, page: 1 })}
            />
            <label htmlFor="remote" className="text-sm text-gray-700">Remote/Telemedicine only</label>
          </div>
        </div>
      )}

      {/* Results */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <>
          <div className="text-sm text-gray-500">
            {pagination?.total || 0} positions found
          </div>
          <div className="space-y-4">
            {jobs.map((job: any) => (
              <div key={job.id} className="card p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                      {job.employer.isVerified && (
                        <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full">Verified</span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 mb-2">{job.employer.companyName}</div>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-3">
                      <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{job.city}, {job.state}</span>
                      <span className="flex items-center gap-1"><Briefcase className="h-4 w-4" />{job.type.replace(/_/g, ' ')}</span>
                      {job.hourlyRate && <span className="flex items-center gap-1"><DollarSign className="h-4 w-4" />${job.hourlyRate}/hr</span>}
                      {job.isRemote && <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-xs">Remote</span>}
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">{job.description}</p>
                  </div>
                  <Link to={`/jobs/${job.id}`} className="btn-primary ml-4 whitespace-nowrap">
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <button
                disabled={pagination.page <= 1}
                onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                className="px-3 py-1 border rounded-md disabled:opacity-50"
              >
                Previous
              </button>
              <span className="px-3 py-1 text-sm text-gray-600">
                Page {pagination.page} of {pagination.pages}
              </span>
              <button
                disabled={pagination.page >= pagination.pages}
                onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                className="px-3 py-1 border rounded-md disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
