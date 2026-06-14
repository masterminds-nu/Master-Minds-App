import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/AuthContext'

const INVESTORS = [
  {
    name: 'Feminvest',
    type: 'Investerarnätverk',
    focus: ['Tidig fas', 'Alla branscher', 'Kvinnligt grundade'],
    ticket: '500k – 5M SEK',
    description: 'Sveriges största nätverk för kvinnliga investerare. Fokuserar på att öka kvinnors investeringar i tidiga skeden.',
    match: 'Hög matchning',
    matchColor: '#64D282',
  },
  {
    name: 'BackingMinds',
    type: 'Venture Capital',
    focus: ['Seed', 'Tech & Konsument', 'Diversifierade team'],
    ticket: '2M – 15M SEK',
    description: 'VC-fond grundad av Susanne Najafi och Sara Wimmercranz, med fokus på underrepresenterade grundare.',
    match: 'Hög matchning',
    matchColor: '#64D282',
  },
  {
    name: 'Almi Invest',
    type: 'Statlig riskkapital',
    focus: ['Tidig fas', 'Innovation', 'Regional spridning'],
    ticket: '300k – 10M SEK',
    description: 'Statligt ägd riskkapitalaktör som matchar privat kapital i tidiga investeringar över hela Sverige.',
    match: 'Medel matchning',
    matchColor: '#D4A843',
  },
  {
    name: 'Unconventional Ventures',
    type: 'Venture Capital',
    focus: ['Impact', 'Hållbarhet', 'Mångfald'],
    ticket: '1M – 8M SEK',
    description: 'Fond med fokus på impact-driven startups och underrepresenterade grundarteam i Norden.',
    match: 'Medel matchning',
    matchColor: '#D4A843',
  },
  {
    name: 'Course Corrected',
    type: 'Angel-syndikat',
    focus: ['Pre-seed', 'Idéfas', 'Mentorskap'],
    ticket: '100k – 1M SEK',
    description: 'Angel-syndikat som kombinerar kapital med aktivt mentorskap för tidiga grundare.',
    match: 'Medel matchning',
    matchColor: '#D4A843',
  },
]

export default function InvestorScreen({ navigate }) {
  const { profile } = useAuth()
  const [selected, setSelected] = useState(null)
  const [interestSent, setInterestSent] = useState({})

  const isVIP = profile?.membership_tier === 'VIP'

  function expressInterest(name) {
    setInterestSent(prev => ({ ...prev, [name]: true }))
  }

  // ── LOCKED VIEW for non-VIP ──
  if (!isVIP) {
    return (
      <div style={{ background: 'var(--ink)', minHeight: '100%' }}>
        <div className="fade-up" style={{ padding: '12px 28px 24px' }}>
          <div className="display-italic" style={{ fontSize: 38, lineHeight: 1.1, color: 'var(--white)' }}>
            Investerar
            <span className="display" style={{ display: 'block', fontStyle: 'normal', fontWeight: 500 }}>matchning</span>
          </div>
        </div>

        <div className="fade-up-1" style={{ margin: '0 28px', background: 'linear-gradient(160deg, var(--purple-deep), var(--purple-mid))', borderRadius: 20, padding: '32px 24px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -30, right: -30, width: 140, height: 140, borderRadius: '50%', background: 'rgba(212,168,67,0.06)' }} />
          <div style={{ fontSize: 28, color: 'var(--gold)', marginBottom: 16, position: 'relative' }}>◆</div>
          <div className="display" style={{ fontSize: 22, color: 'var(--white)', marginBottom: 10, position: 'relative' }}>
            Endast för VIP-medlemmar
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 300, lineHeight: 1.7, marginBottom: 24, position: 'relative' }}>
            Investerarmatchning ger dig direkt tillgång till kuraterade investerare baserat på din bransch och fas — och en formell pipeline via Masterminds.
          </div>
          <button className="btn-gold" style={{ position: 'relative' }} onClick={() => navigate && navigate('profil')}>
            Uppgradera till VIP
          </button>
        </div>

        <div className="fade-up-2" style={{ padding: '24px 28px 0' }}>
          <div className="section-label">Vad VIP-medlemmar får</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              'Kuraterad lista av investerare matchade mot din bransch',
              'Formell introduktion via Masterminds endorsement',
              'Tillgång till Investment Ready-programmet',
            ].map((t, i) => (
              <div key={i} className="card" style={{ padding: '14px 16px', fontSize: 12, color: 'var(--text-secondary)', fontWeight: 300, cursor: 'default' }}>
                {t}
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // ── DETAIL VIEW ──
  if (selected) {
    return (
      <div style={{ background: 'var(--ink)', minHeight: '100%' }}>
        <div style={{ padding: '12px 28px 0', display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
          <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: 'var(--gold)', fontSize: 20, cursor: 'pointer', padding: 0 }}>←</button>
          <div className="display" style={{ fontSize: 18, color: 'var(--white)' }}>Investerare</div>
        </div>

        <div style={{ margin: '0 28px 24px', background: 'linear-gradient(135deg, var(--purple-deep), var(--purple-mid))', borderRadius: 20, padding: '28px 24px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', background: 'rgba(212,168,67,0.06)' }} />
          <div style={{ fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 8 }}>{selected.type}</div>
          <div className="display" style={{ fontSize: 28, color: 'var(--white)', marginBottom: 6 }}>{selected.name}</div>
          <div style={{ display: 'inline-flex', alignItems: 'center', padding: '5px 12px', borderRadius: 20, background: `${selected.matchColor}25`, color: selected.matchColor, fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            {selected.match}
          </div>
        </div>

        <div style={{ padding: '0 28px', display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
          <div className="card" style={{ padding: '16px 18px', cursor: 'default' }}>
            <div style={{ fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: 8 }}>Om</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 300, lineHeight: 1.7 }}>{selected.description}</div>
          </div>
          <div className="card" style={{ padding: '16px 18px', cursor: 'default' }}>
            <div style={{ fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: 8 }}>Investeringsstorlek</div>
            <div className="display" style={{ fontSize: 18, color: 'var(--gold)' }}>{selected.ticket}</div>
          </div>
          <div className="card" style={{ padding: '16px 18px', cursor: 'default' }}>
            <div style={{ fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: 10 }}>Fokusområden</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {selected.focus.map((f, i) => (
                <div key={i} style={{ padding: '6px 12px', border: '1px solid var(--border-gold)', borderRadius: 20, fontSize: 11, color: 'var(--gold)', fontWeight: 300 }}>{f}</div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ padding: '0 28px' }}>
          {interestSent[selected.name] ? (
            <div style={{ textAlign: 'center', padding: 16, color: 'var(--gold)', fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              ✓ Intresseanmälan skickad
            </div>
          ) : (
            <button className="btn-gold" onClick={() => expressInterest(selected.name)}>
              Begär introduktion via Masterminds
            </button>
          )}
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)', textAlign: 'center', marginTop: 10, fontWeight: 300, lineHeight: 1.6 }}>
            Masterminds team kontaktar dig inom 5 arbetsdagar för att förbereda en introduktion.
          </div>
        </div>
      </div>
    )
  }

  // ── LIST VIEW ──
  return (
    <div style={{ background: 'var(--ink)', minHeight: '100%' }}>

      <div className="fade-up" style={{ padding: '12px 28px 16px' }}>
        <div className="display-italic" style={{ fontSize: 38, lineHeight: 1.1, color: 'var(--white)' }}>
          Investerar
          <span className="display" style={{ display: 'block', fontStyle: 'normal', fontWeight: 500 }}>matchning</span>
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 300, marginTop: 6 }}>
          Kuraterat för VIP-medlemmar
        </div>
      </div>

      <div className="fade-up-1" style={{ padding: '0 28px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {INVESTORS.map((inv, i) => (
          <div key={i} className="card" onClick={() => setSelected(inv)} style={{ padding: '16px 18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <div>
                <div className="display" style={{ fontSize: 18, color: 'var(--white)', marginBottom: 2 }}>{inv.name}</div>
                <div style={{ fontSize: 10, color: 'var(--text-tertiary)', fontWeight: 300, letterSpacing: '0.05em' }}>{inv.type}</div>
              </div>
              <div style={{ padding: '4px 10px', borderRadius: 12, background: `${inv.matchColor}20`, color: inv.matchColor, fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', flexShrink: 0 }}>
                {inv.match}
              </div>
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 300, marginBottom: 10 }}>{inv.ticket}</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {inv.focus.map((f, j) => (
                <div key={j} style={{ padding: '3px 10px', background: 'var(--surface)', borderRadius: 12, fontSize: 9, color: 'var(--text-secondary)', fontWeight: 300 }}>{f}</div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="fade-up-2" style={{ padding: '20px 28px 8px' }}>
        <div style={{ fontSize: 11, color: 'var(--text-tertiary)', textAlign: 'center', fontWeight: 300, lineHeight: 1.6 }}>
          Matchning baseras på din profil och bransch. Uppdatera din profil för bättre matchningar.
        </div>
      </div>
    </div>
  )
}
