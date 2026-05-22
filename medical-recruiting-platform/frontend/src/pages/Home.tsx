import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Stethoscope, Building2, Shield, Zap, Search, MessageSquare, CreditCard, Award } from 'lucide-react'

export default function Home() {
  const { user } = useAuth()

  return (
    <div className="space-y-16">
      {/* Hero */}
      <section className="text-center py-16 lg:py-24">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight">
          Connect Healthcare Talent
          <span className="block text-medical-600">Across the Nation</span>
        </h1>
        <p className="mt-6 text-lg text-gray-600 max-w-2xl mx-auto">
          HIPAA-compliant medical staffing platform connecting qualified providers with healthcare employers. 
          Intelligent matching, credential vaulting, and integrated payments.
        </p>
        <div className="mt-10 flex justify-center gap-4">
          {!user && (
            <>
              <Link to="/register" className="btn-primary text-lg px-8 py-3">
                Get Started
              </Link>
              <Link to="/jobs" className="btn-secondary text-lg px-8 py-3">
                Browse Jobs
              </Link>
            </>
          )}
          {user?.role === 'PROVIDER' && (
            <Link to="/jobs" className="btn-primary text-lg px-8 py-3">
              Find Your Next Position
            </Link>
          )}
          {user?.role === 'EMPLOYER' && (
            <Link to="/post-job" className="btn-primary text-lg px-8 py-3">
              Post a Job
            </Link>
          )}
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-8">
        {[
          { icon: Stethoscope, label: 'Active Providers', value: '12,000+' },
          { icon: Building2, label: 'Healthcare Employers', value: '3,500+' },
          { icon: Shield, label: 'HIPAA Compliant', value: '100%' },
          { icon: Zap, label: 'Avg Match Time', value: '< 48hrs' }
        ].map((stat) => (
          <div key={stat.label} className="card p-6 text-center">
            <stat.icon className="h-8 w-8 text-medical-600 mx-auto mb-3" />
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
          </div>
        ))}
      </section>

      {/* Features */}
      <section>
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Platform Features</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            { icon: Search, title: 'Smart Matching', desc: 'AI-powered matching based on specialty, location, credentials, and availability' },
            { icon: Award, title: 'Credential Vault', desc: 'Secure storage and verification of licenses, certifications, and board credentials' },
            { icon: MessageSquare, title: 'Real-time Messaging', desc: 'HIPAA-compliant communication between providers and employers' },
            { icon: CreditCard, title: 'Integrated Payments', desc: 'Streamlined placement fees, shift payments, and subscription billing' },
            { icon: Shield, title: 'Compliance First', desc: 'Full HIPAA audit trails, BAA management, and data encryption' },
            { icon: Building2, title: 'Multi-State Licensing', desc: 'Compact license tracking and state-specific requirement management' }
          ].map((feature) => (
            <div key={feature.title} className="card p-6 hover:shadow-md transition-shadow">
              <feature.icon className="h-10 w-10 text-primary-600 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="card bg-medical-600 text-white p-12 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Medical Staffing?</h2>
        <p className="text-medical-100 mb-8 max-w-xl mx-auto">
          Join thousands of healthcare providers and employers who trust MedMatch Pro for their staffing needs.
        </p>
        <div className="flex justify-center gap-4">
          <Link to="/register" className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-medical-700 bg-white hover:bg-medical-50">
            Create Account
          </Link>
          <Link to="/providers" className="inline-flex items-center px-6 py-3 border border-white text-base font-medium rounded-md text-white hover:bg-medical-700">
            Browse Providers
          </Link>
        </div>
      </section>
    </div>
  )
}
