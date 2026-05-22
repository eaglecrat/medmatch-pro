import { Routes, Route } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import ProviderDashboard from './pages/ProviderDashboard'
import EmployerDashboard from './pages/EmployerDashboard'
import JobSearch from './pages/JobSearch'
import JobDetail from './pages/JobDetail'
import ProviderSearch from './pages/ProviderSearch'
import ProviderProfile from './pages/ProviderProfile'
import Messages from './pages/Messages'
import Credentials from './pages/Credentials'
import Applications from './pages/Applications'
import PostJob from './pages/PostJob'
import Matches from './pages/Matches'
import Settings from './pages/Settings'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  const { user } = useAuth()

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="jobs" element={<JobSearch />} />
        <Route path="jobs/:id" element={<JobDetail />} />
        <Route path="providers" element={<ProviderSearch />} />
        <Route path="providers/:id" element={<ProviderProfile />} />

        <Route element={<ProtectedRoute />}>
          <Route path="dashboard" element={
            user?.role === 'PROVIDER' ? <ProviderDashboard /> : <EmployerDashboard />
          } />
          <Route path="messages" element={<Messages />} />
          <Route path="credentials" element={<Credentials />} />
          <Route path="applications" element={<Applications />} />
          <Route path="post-job" element={<PostJob />} />
          <Route path="matches" element={<Matches />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Route>
    </Routes>
  )
}

export default App
