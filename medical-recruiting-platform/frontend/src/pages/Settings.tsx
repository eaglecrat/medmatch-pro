import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { useAuth } from '../context/AuthContext'
import { providersAPI, employersAPI, hipaaAPI } from '../services/api'
import { User, Building2, Shield, Bell, Save } from 'lucide-react'

export default function Settings() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState('profile')

  const { data: profile } = useQuery('settingsProfile', () =>
    user?.role === 'PROVIDER'
      ? providersAPI.search({}).then(r => r.data.providers?.[0])
      : employersAPI.search({}).then(r => r.data.employers?.[0])
  )

  const { data: consents } = useQuery('consents', () => hipaaAPI.getConsents().then(r => r.data))

  const updateMutation = useMutation(
    (data: any) => user?.role === 'PROVIDER'
      ? providersAPI.updateProfile(data)
      : employersAPI.updateProfile(data),
    { onSuccess: () => queryClient.invalidateQueries('settingsProfile') }
  )

  const [form, setForm] = useState<any>({})

  const handleSave = () => updateMutation.mutate(form)

  const tabs = [
    { id: 'profile', label: 'Profile', icon: user?.role === 'PROVIDER' ? User : Building2 },
    { id: 'privacy', label: 'Privacy & HIPAA', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell }
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Settings</h1>

      <div className="flex gap-2 border-b">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'profile' && profile && (
        <div className="card p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">{user?.role === 'PROVIDER' ? 'Provider Profile' : 'Employer Profile'}</h2>

          {user?.role === 'PROVIDER' ? (
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <input type="text" defaultValue={profile.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })} className="input" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <input type="text" defaultValue={profile.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })} className="input" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Specialty</label>
                <input type="text" defaultValue={profile.specialty}
                  onChange={(e) => setForm({ ...form, specialty: e.target.value })} className="input" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">License State</label>
                <input type="text" defaultValue={profile.licenseState}
                  onChange={(e) => setForm({ ...form, licenseState: e.target.value })} className="input" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Years Experience</label>
                <input type="number" defaultValue={profile.yearsExperience}
                  onChange={(e) => setForm({ ...form, yearsExperience: Number(e.target.value) })} className="input" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hourly Rate Min ($)</label>
                <input type="number" defaultValue={profile.hourlyRateMin}
                  onChange={(e) => setForm({ ...form, hourlyRateMin: Number(e.target.value) })} className="input" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                <textarea defaultValue={profile.bio} rows={4}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })} className="input" />
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                <input type="text" defaultValue={profile.companyName}
                  onChange={(e) => setForm({ ...form, companyName: e.target.value })} className="input" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Name</label>
                <input type="text" defaultValue={profile.contactName}
                  onChange={(e) => setForm({ ...form, contactName: e.target.value })} className="input" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input type="text" defaultValue={profile.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })} className="input" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                <input type="text" defaultValue={profile.state}
                  onChange={(e) => setForm({ ...form, state: e.target.value })} className="input" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea defaultValue={profile.description} rows={4}
                  onChange={(e) => setForm({ ...form, description: e.target.value })} className="input" />
              </div>
            </div>
          )}

          <button onClick={handleSave} disabled={updateMutation.isLoading}
            className="btn-primary flex items-center gap-2 disabled:opacity-50">
            <Save className="h-4 w-4" />
            {updateMutation.isLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      )}

      {activeTab === 'privacy' && (
        <div className="card p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Shield className="h-5 w-5" /> Privacy & HIPAA Compliance
          </h2>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              This platform is fully HIPAA compliant. All patient-related data is encrypted, access is logged,
              and Business Associate Agreements are in place with all participating employers.
            </p>
          </div>
          <div className="space-y-3">
            {consents?.map((consent: any) => (
              <div key={consent.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">{consent.consentType.replace(/_/g, ' ')}</div>
                  <div className="text-sm text-gray-500">
                    {consent.granted ? `Granted on ${new Date(consent.grantedAt).toLocaleDateString()}` : 'Not granted'}
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  consent.granted ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {consent.granted ? 'Active' : 'Inactive'}
                </span>
              </div>
            )) || <div className="text-sm text-gray-500">No consent records found</div>}
          </div>
        </div>
      )}

      {activeTab === 'notifications' && (
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Bell className="h-5 w-5" /> Notification Preferences
          </h2>
          <div className="mt-4 space-y-3">
            {['Application updates', 'New messages', 'Job matches', 'Credential expiry alerts', 'Payment notifications'].map((pref) => (
              <div key={pref} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700">{pref}</span>
                <input type="checkbox" defaultChecked className="h-4 w-4 text-primary-600" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
