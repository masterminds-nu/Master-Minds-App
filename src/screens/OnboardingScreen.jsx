import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/AuthContext'

const STEPS = [
  {
    title: 'Välkommen till',
    accent: 'Masterminds',
    body: 'Din säljkanal utan säljbudget. Ett ekonomiskt ekosystem byggt för kvinnliga entreprenörer — inte ännu en nätverksgrupp.',
    icon: '◆',
  },
  {
    title: 'Uppdragstavlan',
    accent: 'är din nya säljkanal',
    body: 'Andra medlemmar postar betalda uppdrag varje vecka. Du ser dem direkt, ansöker med ett tryck, och får betalt via plattformen.',
    icon: '◈',
  },
  {
    title: 'Ditt CRM',
    accent: 'och digitala visitkort',
    body: 'Hantera alla dina affärskontakter privat och säkert. Dela ditt digitala visitkort med en länk — ingen app krävs för mottagaren.',
    icon: '◭',
  },
  {
    title: 'Fråga Masterminds',
    accent: 'din AI-rådgivare',
    body: 'Pitch-feedback, prissättning, strategi — dygnet runt. Som att ha en erfaren mentor i fickan.',
    icon: '✦',
  },
  {
    title: 'Bygg din',
    accent: 'Impact',
    body: 'Varje uppdrag, kontakt och event räknas. Se ditt eget värde växa — och bygg det track record som öppnar dörrar till investerare.',
    icon: '◉',
  },
]

export default function OnboardingScreen({ onComplete }) {
  const { user } = useAuth()
  const [step, setStep] = useState(0)
  const [saving, setSaving] = useState(false)

  const isLast = step === STEPS.length - 1
  const current = STEPS[step]

  async function finish() {
    setSaving(true)
    try {
      await supabase.from('profiles').update({ onboarding_completed: true }).eq('id', user.id)
    } catch (e) {
      // fail silently — don't block user
    }
    setSaving(false)
    onComplete()
  }

  function next() {
    if (isLast) finish()
    else setStep(s => s + 1)
  }

  return (
    <div style={{ background: 'var(--ink)', minHeight: '100dvh', display: 'flex', flexDirection: 'column', maxWidth: 430, margin: '0 auto' }}>

      <div style={{ padding: '20px 28px 0', display: 'flex', justifyContent: 'flex-end' }}>
        <button onClick={finish} style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
          Hoppa över
        </button>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 36px', textAlign: 'center' }}>
        <div
          key={step}
          className="fade-up"
          style={{
            width: 88, height: 88, borderRadius: '50%',
            border: '1px solid var(--border-gold)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 36,
            background: 'linear-gradient(135deg, var(--purple-deep), var(--purple-mid))',
          }}
        >
          <span style={{ color: 'var(--gold)', fontSize: 32 }}>{current.icon}</span>
        </div>

        <div key={`title-${step}`} className="fade-up-1">
          <div className="display-italic" style={{ fontSize: 32, color: 'var(--white)', lineHeight: 1.2, marginBottom: 6 }}>
            {current.title}
          </div>
          <div className="display" style={{ fontSize: 32, color: 'var(--gold)', lineHeight: 1.2, marginBottom: 20 }}>
            {current.accent}
          </div>
          <div style={{ fontSize: 14, color: 'var(--text-secondary)', fontWeight: 300, lineHeight: 1.8, maxWidth: 320 }}>
            {current.body}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 28 }}>
        {STEPS.map((_, i) => (
          <div key={i} style={{
            width: i === step ? 24 : 8,
            height: 8,
            borderRadius: 4,
            background: i === step ? 'var(--gold)' : 'var(--border)',
            transition: 'all 0.3s ease',
          }} />
        ))}
      </div>

      <div style={{ padding: '0 28px 40px' }}>
        <button className="btn-gold" onClick={next} disabled={saving} style={{ marginTop: 0 }}>
          {isLast ? (saving ? 'Förbereder…' : 'Kom igång') : 'Nästa'}
        </button>
      </div>
    </div>
  )
}
