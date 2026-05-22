import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Stethoscope, Building2, Eye, EyeOff } from 'lucide-react'

export default function Register() {
  const [role, setRole] = useState<'PROVIDER' | 'EMPLOYER'>('PROVIDER')
  const [formData, setFormData] = useState({
    email: '', password: '', confirmPassword: '',
    firstName: '', lastName: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setLoading(true)
    try {
      await register({
        ...formData,
        role
      })
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="card max-w-lg w-full p-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Create Your Account</h2>
          <p className="text-gray-600 mt-1">Join the nation's leading medical staffing platform</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6 text-sm">
            {error}
          </div>
        )}

        {/* Role Selection */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <button
            type="button"
            onClick={() => setRole('PROVIDER')}
            className={`p-4 border-2 rounded-lg text-center transition-colors ${
              role === 'PROVIDER'
                ? 'border-medical-600 bg-medical-50 text-medical-700'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <Stethoscope className="h-8 w-8 mx-auto mb-2" />
            <div className="font-semibold">Healthcare Provider</div>
            <div className="text-xs text-gray-500 mt-1">Physicians, NPs, PAs, Techs</div>
          </button>
          <button
            type="button"
            onClick={() => setRole('EMPLOYER')}
            className={`p-4 border-2 rounded-lg text-center transition-colors ${
              role === 'EMPLOYER'
                ? 'border-primary-600 bg-primary-50 text-primary-700'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <Building2 className="h-8 w-8 mx-auto mb-2" />
            <div className="font-semibold">Healthcare Employer</div>
            <div className="text-xs text-gray-500 mt-1">Hospitals, Clinics, Groups</div>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="input"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="input"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="input"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="input pr-10"
                placeholder="Min 8 chars, uppercase, number, symbol"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              className="input"
              required
            />
          </div>

          <div className="flex items-start gap-2">
            <input type="checkbox" required className="mt-1" />
            <label className="text-sm text-gray-600">
              I agree to the{' '}
              <Link to="/terms" className="text-primary-600 hover:underline">Terms of Service</Link>
              {' '}and{' '}
              <Link to="/privacy" className="text-primary-600 hover:underline">Privacy Policy</Link>
              {' '}(HIPAA Compliant)
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-3 text-base disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-600 hover:text-primary-500 font-medium">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  )
}
