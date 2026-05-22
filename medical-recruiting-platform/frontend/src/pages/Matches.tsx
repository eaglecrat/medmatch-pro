import { useQuery } from 'react-query'
import { Link } from 'react-router-dom'
import { matchingAPI } from '../services/api'
import { Zap, MapPin, DollarSign, Percent, Briefcase } from 'lucide-react'

export default function Matches() {
  const { data, isLoading } = useQuery('matches', () => matchingAPI.getMyMatches().then(r => r.data))

  const matches = data?.matches || []

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
        <Zap className="h-6 w-6 text-yellow-500" /> Smart Matches
      </h1>
      <p className="text-gray-600">AI-powered matches based on your specialty, location, credentials, and preferences</p>

      {isLoading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div></div>
      ) : (
        <div className="space-y-4">
          {matches.map((match: any) => (
            <div key={match.job?.id || match.provider?.id} className="card p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {match.job ? (
                    <>
                      <h3 className="text-lg font-semibold text-gray-900">{match.job.title}</h3>
                      <div className="text-sm text-gray-600 mb-2">{match.job.employer?.companyName}</div>
                      <div className="flex flex-wrap gap-3 text-sm text-gray-500 mb-3">
                        <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{match.job.city}, {match.job.state}</span>
                        <span className="flex items-center gap-1"><Briefcase className="h-4 w-4" />{match.job.type?.replace(/_/g, ' ')}</span>
                        {match.job.hourlyRate && <span className="flex items-center gap-1"><DollarSign className="h-4 w-4" />${match.job.hourlyRate}/hr</span>}
                      </div>
                    </>
                  ) : (
                    <>
                      <h3 className="text-lg font-semibold text-gray-900">{match.provider.firstName} {match.provider.lastName}</h3>
                      <div className="text-sm text-gray-600 mb-2">{match.provider.specialty}</div>
                    </>
                  )}

                  {/* Match Score Breakdown */}
                  <div className="bg-gray-50 rounded-lg p-3 mt-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Percent className="h-4 w-4 text-primary-600" />
                      <span className="font-medium text-gray-900">{match.matchPercentage}% Match</span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                      {Object.entries(match.factors || {}).map(([key, val]: [string, any]) => (
                        <div key={key} className="flex items-center gap-1">
                          <div className={`h-2 w-2 rounded-full ${val > 0 ? 'bg-green-400' : 'bg-gray-300'}`} />
                          <span className="capitalize text-gray-600">{key.replace(/_/g, ' ')}: {val}pts</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <Link
                  to={match.job ? `/jobs/${match.job.id}` : `/providers/${match.provider.id}`}
                  className="btn-primary ml-4 whitespace-nowrap"
                >
                  View Details
                </Link>
              </div>
            </div>
          )) || (
            <div className="text-center text-gray-500 py-12">
              <Zap className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Complete your profile to see matches</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
