import { useParams } from 'react-router-dom'
import { useQuery } from 'react-query'
import { providersAPI } from '../services/api'
import { MapPin, Award, Calendar, Star, MessageSquare } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function ProviderProfile() {
  const { id } = useParams()
  const { data: provider, isLoading } = useQuery(['provider', id], () =>
    providersAPI.getById(id!).then(r => r.data)
  )

  if (isLoading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div></div>
  if (!provider) return <div className="text-center py-12 text-gray-500">Provider not found</div>

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="card p-8">
        <div className="flex items-start gap-6">
          <div className="h-24 w-24 rounded-full bg-medical-100 flex items-center justify-center text-medical-700 text-2xl font-bold">
            {provider.firstName?.[0]}{provider.lastName?.[0]}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">{provider.firstName} {provider.lastName}</h1>
            <p className="text-lg text-gray-600">{provider.specialty}{provider.subSpecialty ? ` - ${provider.subSpecialty}` : ''}</p>
            <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500">
              <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{provider.city}, {provider.state}</span>
              <span className="flex items-center gap-1"><Award className="h-4 w-4" />{provider.yearsExperience || 0} years experience</span>
              <span className="flex items-center gap-1"><Calendar className="h-4 w-4" />Member since {new Date(provider.user?.createdAt).toLocaleDateString()}</span>
            </div>
            {provider.bio && <p className="mt-4 text-gray-600">{provider.bio}</p>}
          </div>
          <Link to="/messages" className="btn-primary flex items-center gap-2">
            <MessageSquare className="h-4 w-4" /> Contact
          </Link>
        </div>
      </div>

      {/* Credentials */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Award className="h-5 w-5" /> Credentials & Certifications
        </h2>
        <div className="grid md:grid-cols-2 gap-3">
          {provider.credentials?.map((cred: any) => (
            <div key={cred.id} className="p-3 bg-gray-50 rounded-lg">
              <div className="font-medium text-gray-900">{cred.title}</div>
              <div className="text-sm text-gray-600">{cred.issuingBody}</div>
              <div className="text-xs text-gray-500 mt-1">
                {cred.type.replace(/_/g, ' ')} • {new Date(cred.issueDate).toLocaleDateString()}
                {cred.expiryDate && ` - Expires ${new Date(cred.expiryDate).toLocaleDateString()}`}
              </div>
              <span className={`inline-block mt-2 px-2 py-0.5 text-xs rounded-full ${
                cred.verificationStatus === 'VERIFIED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {cred.verificationStatus}
              </span>
            </div>
          )) || <div className="text-gray-500 col-span-2">No credentials listed</div>}
        </div>
      </div>

      {/* Reviews */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Star className="h-5 w-5" /> Reviews
        </h2>
        <div className="space-y-3">
          {provider.reviews?.map((review: any) => (
            <div key={review.id} className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                  ))}
                </div>
                <span className="text-sm text-gray-500">{review.employer?.companyName}</span>
              </div>
              {review.comment && <p className="text-sm text-gray-600">{review.comment}</p>}
            </div>
          )) || <div className="text-gray-500">No reviews yet</div>}
        </div>
      </div>
    </div>
  )
}
