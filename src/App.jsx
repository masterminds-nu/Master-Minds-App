import { useState, useEffect } from 'react'
import { AuthProvider, useAuth } from './lib/AuthContext'
import { supabase } from './lib/supabase'
import './styles/app.css'

import AuthScreen      from './screens/AuthScreen'
import OnboardingScreen from './screens/OnboardingScreen'
import HomeScreen      from './screens/HomeScreen'
import EventsScreen    from './screens/EventsScreen'
import UppdragScreen   from './screens/UppdragScreen'
import MembersScreen   from './screens/MembersScreen'
import ProfilScreen    from './screens/ProfilScreen'
import MessagesScreen  from './screens/MessagesScreen'
import CRMScreen       from './screens/CRMScreen'
import VisitkortsScreen from './screens/VisitkortsScreen'
import ImpactScreen    from './screens/ImpactScreen'
import AssistantScreen from './screens/AssistantScreen'
import InvestorScreen  from './screens/InvestorScreen'

const NAV = [
  { id: 'home',     icon: '⌂', label: 'Hem' },
  { id: 'uppdrag',  icon: '◈', label: 'Uppdrag' },
  { id: 'assistant',icon: '✦', label: 'Rådgivare' },
  { id: 'members',  icon: '◎', label: 'Nätverk' },
  { id: 'profil',   icon: '◉', label: 'Profil' },
]

const SCREENS = {
  home:      HomeScreen,
  events:    EventsScreen,
  uppdrag:   UppdragScreen,
  members:   MembersScreen,
  profil:    ProfilScreen,
  messages:  MessagesScreen,
  crm:       CRMScreen,
  visitkort: VisitkortsScreen,
  impact:    ImpactScreen,
  assistant: AssistantScreen,
  investerare: InvestorScreen,
}

function AppInner() {
  const { user, profile, loading } = useAuth()
  const [active, setActive] = useState('home')
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [checkedOnboarding, setCheckedOnboarding] = useState(false)

  useEffect(() => {
    if (!loading && profile && !checkedOnboarding) {
      setShowOnboarding(!profile.onboarding_completed)
      setCheckedOnboarding(true)
    }
    if (!loading && user && !profile && !checkedOnboarding) {
      // No profile row yet — still show onboarding once
      setShowOnboarding(true)
      setCheckedOnboarding(true)
    }
  }, [loading, profile, user, checkedOnboarding])

  if (loading) {
    return (
      <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--ink)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: 'var(--gold)', fontSize: 32, marginBottom: 16 }}>◆</div>
          <div style={{ color: 'var(--text-tertiary)', fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase' }}>Masterminds</div>
        </div>
      </div>
    )
  }

  if (!user) return <AuthScreen />

  if (showOnboarding) {
    return <OnboardingScreen onComplete={() => setShowOnboarding(false)} />
  }

  const Screen = SCREENS[active] || HomeScreen

  return (
    <div className="app-shell">
      <div className="status-bar">
        <span style={{ fontWeight: 500 }}>9:41</span>
        <span>●●● 🔋</span>
      </div>

      <div className="screen" key={active}>
        <Screen navigate={setActive} />
      </div>

      <nav className="bottom-nav">
        {NAV.map((item) => (
          <button
            key={item.id}
            className={`nav-btn${active === item.id ? ' active' : ''}`}
            onClick={() => setActive(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  )
}
