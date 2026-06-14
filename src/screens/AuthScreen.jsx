import { useState } from 'react'
import { useAuth } from '../lib/AuthContext'

export default function AuthScreen() {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await signIn(email, password)
    if (error) setError('Fel e-post eller lösenord')
    setLoading(false)
  }

  return (
    <div className="auth-screen">

      {/* Logo */}
      <div className="fade-up" style={{ textAlign: 'center', marginBottom: 48 }}>
        <div style={{
          width: 64, height: 64,
          borderRadius: '50%',
          border: '1px solid var(--border-gold)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px',
        }}>
          <span style={{ color: 'var(--gold)', fontSize: 24 }}>◆</span>
        </div>
        <div className="display" style={{ fontSize: 24, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--white)' }}>
          Masterminds
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 6, letterSpacing: '0.1em' }}>
          Ditt exklusiva affärsnätverk
        </div>
      </div>

      {/* Form */}
      <div className="fade-up-1" style={{ width: '100%', maxWidth: 340 }}>
        <form onSubmit={handleLogin}>
          <input
            className="auth-input"
            type="email"
            placeholder="E-postadress"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <input
            className="auth-input"
            type="password"
            placeholder="Lösenord"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />

          {error && (
            <div style={{ color: '#ff6b6b', fontSize: 12, textAlign: 'center', marginBottom: 12, fontWeight: 300 }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn-gold"
            style={{ marginTop: 8 }}
            disabled={loading}
          >
            {loading ? 'Loggar in…' : 'Logga in'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <a
            href="https://masterminds.nu/membership"
            style={{ color: 'var(--text-tertiary)', fontSize: 12, fontWeight: 300, textDecoration: 'none' }}
          >
            Inte medlem? Gå med på masterminds.nu →
          </a>
        </div>
      </div>

    </div>
  )
}
