import { useState } from 'react'
import { useQuery } from 'react-query'
import { Link } from 'react-router-dom'
import { providersAPI } from '../services/api'
import { Search, MapPin, Award, Filter, X, Stethoscope, Star } from 'lucide-react'

export default function ProviderSearch() {
  const [filters, setFilters] = useState({
    specialty: '', state: '', city: '', available: true, page: 1, limit: 20
  })
  const [showFilters, setShowFilters] = useState(false)

  const { data, isLoading } = useQuery(
    ['providers', filters],
    () => providersAPI.search(filters).then(r => r.data),
    { keepPreviousData: true }
  )

  const providers = data?.providers || []
  const pagination = data?.pagination

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Find Healthcare Providers</h1>
        <button onClick={() => setShowFilters(!showFilters)} className="btn-secondary flex items-center gap-2">
          <Filter className="h-4 w-4" /> Filters
        </button>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input type="text" placeholder="Search by specialty..." value={filters.specialty}
            onChange={(e) => setFilters({ ...filters, specialty: e.target.value, page: 1 })}
            className="input pl-10" />
        </div>
        <div className="relative w-48">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input type="text" placeholder="State" value={filters.state}
            onChange={(e) => setFilters({ ...filters, state: e.target.value, page: 1 })}
            className="input pl-10" />
        </div>
      </div>

      {showFilters && (
        <div className="card p-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-medium">Filters</h3>
            <button onClick={() => setShowFilters(false)}><X className="h-5 w-5 text-gray-400" /></button>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="avail" checked={filters.available}
              onChange={(e) => setFilters({ ...filters, available: e.target.checked, page: 1 })} />
            <label htmlFor="avail" className="text-sm text-gray-700">Show only available providers</label>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div></div>
      ) : (
        <>
          <div className="text-sm text-gray-500">{pagination?.total || 0} providers found</div>
          <div className="grid md:grid-cols-2 gap-4">
            {providers.map((provider: any) => (
              <div key={provider.id} className="card p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-medical-100 flex items-center justify-center text-medical-700 font-bold text-lg">
                      {provider.firstName?.[0]}{provider.lastName?.[0]}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{provider.firstName} {provider.lastName}</h3>
                      <div className="text-sm text-gray-600 flex items-center gap-1">
                        <Stethoscope className="h-3 w-3" />{provider.specialty}
                      </div>
                    </div>
                  </div>
                  {provider.isAvailable && <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-xs">Available</span>}
                </div>
                <div className="mt-4 flex flex-wrap gap-3 text-sm text-gray-500">
                  <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{provider.city}, {provider.state}</span>
                  <span className="flex items-center gap-1"><Award className="h-4 w-4" />{provider.yearsExperience || 0} yrs exp</span>
                  {provider.hourlyRateMin && <span className="flex items-center gap-1">${provider.hourlyRateMin}+/hr</span>}
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div className="text-sm text-gray-500">{provider.credentials?.length || 0} verified credentials</div>
                  <Link to={`/providers/${provider.id}`} className="btn-primary text-sm py-1 px-3">View Profile</Link>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
