import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { providersAPI } from '../services/api'
import { Award, Plus, Calendar, AlertTriangle, CheckCircle } from 'lucide-react'

const CREDENTIAL_TYPES = [
  'MEDICAL_LICENSE', 'BOARD_CERTIFICATION', 'DEA_REGISTRATION', 'ACLS', 'BLS',
  'PALS', 'NURSING_LICENSE', 'NP_LICENSE', 'PA_LICENSE', 'CPR', 'SPECIALTY_CERTIFICATION', 'OTHER'
]

export default function Credentials() {
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ type: 'MEDICAL_LICENSE', title: '', issuingBody: '', licenseNumber: '', issueDate: '', expiryDate: '' })
  const queryClient = useQueryClient()

  const { data: profile } = useQuery('myCredentials', () =>
    providersAPI.search({}).then(r => r.data.providers?.[0])
  )

  const addMutation = useMutation(
    () => providersAPI.addCredential(form),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('myCredentials')
        setShowAdd(false)
        setForm({ type: 'MEDICAL_LICENSE', title: '', issuingBody: '', licenseNumber: '', issueDate: '', expiryDate: '' })
      }
    }
  )

  const credentials = profile?.credentials || []

  const isExpiringSoon = (date: string) => {
    if (!date) return false
    const d = new Date(date)
    const thirtyDays = new Date()
    thirtyDays.setDate(thirtyDays.getDate() + 30)
    return d <= thirtyDays && d > new Date()
  }

  const isExpired = (date: string) => {
    if (!date) return false
    return new Date(date) < new Date()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Award className="h-6 w-6" /> My Credentials
        </h1>
        <button onClick={() => setShowAdd(!showAdd)} className="btn-primary flex items-center gap-2">
          <Plus className="h-4 w-4" /> Add Credential
        </button>
      </div>

      {showAdd && (
        <div className="card p-6 border-2 border-primary-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Credential</h3>
          <form onSubmit={(e) => { e.preventDefault(); addMutation.mutate() }} className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="input">
                {CREDENTIAL_TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Issuing Body</label>
              <input type="text" value={form.issuingBody} onChange={(e) => setForm({ ...form, issuingBody: e.target.value })} className="input" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">License Number</label>
              <input type="text" value={form.licenseNumber} onChange={(e) => setForm({ ...form, licenseNumber: e.target.value })} className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Issue Date</label>
              <input type="date" value={form.issueDate} onChange={(e) => setForm({ ...form, issueDate: e.target.value })} className="input" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
              <input type="date" value={form.expiryDate} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} className="input" />
            </div>
            <div className="md:col-span-2 flex gap-3">
              <button type="submit" disabled={addMutation.isLoading} className="btn-primary disabled:opacity-50">
                {addMutation.isLoading ? 'Adding...' : 'Add Credential'}
              </button>
              <button type="button" onClick={() => setShowAdd(false)} className="btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-3">
        {credentials.map((cred: any) => (
          <div key={cred.id} className={`card p-4 border-l-4 ${
            isExpired(cred.expiryDate) ? 'border-red-500' :
            isExpiringSoon(cred.expiryDate) ? 'border-yellow-500' :
            cred.verificationStatus === 'VERIFIED' ? 'border-green-500' : 'border-gray-300'
          }`}>
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900">{cred.title}</h3>
                  {cred.verificationStatus === 'VERIFIED' && <CheckCircle className="h-4 w-4 text-green-600" />}
                  {isExpired(cred.expiryDate) && <AlertTriangle className="h-4 w-4 text-red-600" />}
                  {isExpiringSoon(cred.expiryDate) && <AlertTriangle className="h-4 w-4 text-yellow-600" />}
                </div>
                <div className="text-sm text-gray-600">{cred.issuingBody}</div>
                <div className="text-sm text-gray-500 mt-1 flex items-center gap-3">
                  <span>{cred.type.replace(/_/g, ' ')}</span>
                  {cred.licenseNumber && <span>#{cred.licenseNumber}</span>}
                  <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />
                    {new Date(cred.issueDate).toLocaleDateString()} -
                    {cred.expiryDate ? new Date(cred.expiryDate).toLocaleDateString() : 'No expiry'}
                  </span>
                </div>
              </div>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                cred.verificationStatus === 'VERIFIED' ? 'bg-green-100 text-green-800' :
                cred.verificationStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {cred.verificationStatus}
              </span>
            </div>
            {isExpiringSoon(cred.expiryDate) && (
              <div className="mt-2 text-sm text-yellow-700 bg-yellow-50 p-2 rounded">
                This credential expires soon. Please renew to maintain active status.
              </div>
            )}
          </div>
        )) || <div className="text-center text-gray-500 py-8">No credentials added yet</div>}
      </div>
    </div>
  )
}
