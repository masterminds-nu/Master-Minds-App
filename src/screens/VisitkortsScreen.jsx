import { useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/AuthContext'

export default function VisitkortsScreen() {
  const { user, profile } = useAuth()
  const [card, setCard] = useState(null)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState(false)
  const [form, setForm] = useState({
    name: '', title: '', company: '', email: '', phone: '',
    linkedin: '', website: '', tagline: '', theme_color: '#D4A843'
  })

  useEffect(() => { fetchCard() }, [user])

  async function fetchCard() {
    const { data } = await supabase
      .from('digital_cards')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (data) {
      setCard(data)
      setForm({
        name: data.name || profile?.full_name || '',
        title: data.title || '',
        company: data.company || profile?.company_name || '',
        email: data.email || user.email || '',
        phone: data.phone || '',
        linkedin: data.linkedin || '',
        website: data.website || '',
        tagline: data.tagline || '',
        theme_color: data.theme_color || '#D4A843',
      })
    } else {
      // Pre-fill from profile
      setForm(prev => ({
        ...prev,
        name: profile?.full_name || '',
        company: profile?.company_name || '',
        email: user.email || '',
      }))
      setEditing(true)
    }
  }

  async function saveCard() {
    setSaving(true)
    const slug = form.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

    if (card) {
      const { data } = await supabase
        .from('digital_cards')
        .update({ ...form, updated_at: new Date().toISOString() })
        .eq('id', card.id)
        .select().single()
      if (data) setCard(data)
    } else {
      const { data } = await supabase
        .from('digital_cards')
        .insert({ ...form, user_id: user.id, slug })
        .select().single()
      if (data) setCard(data)
    }
    setEditing(false)
    setSaving(false)
  }

  function copyLink() {
    const link = `https://masterminds.nu/k/${card?.slug || 'ditt-kort'}`
    navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const THEMES = ['#D4A843', '#9B6DB5', '#E86496', '#64B4E8', '#64D282', '#E87864']

  // ── EDIT VIEW ──
  if (editing) {
    return (
      <div style={{ background: 'var(--ink)', minHeight: '100%' }}>
        <div style={{ padding: '12px 28px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
          {card && <button onClick={() => setEditing(false)} style={{ background: 'none', border: 'none', color: 'var(--gold)', fontSize: 20, cursor: 'pointer', padding: 0 }}>←</button>}
          <div className="display" style={{ fontSize: 18, color: 'var(--white)' }}>
            {card ? 'Redigera visitkort' : 'Skapa ditt visitkort'}
          </div>
        </div>

        <div style={{ padding: '0 28px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Theme color */}
          <div>
            <div className="section-label">Accentfärg</div>
            <div style={{ display: 'flex', gap: 10 }}>
              {THEMES.map(color => (
                <div key={color} onClick={() => setForm(prev => ({ ...prev, theme_color: color }))}
                  style={{ width: 32, height: 32, borderRadius: '50%', background: color, cursor: 'pointer', border: form.theme_color === color ? '3px solid white' : '3px solid transparent', transition: 'all 0.2s' }} />
              ))}
            </div>
          </div>

          {[
            { key: 'name', placeholder: 'Namn *', type: 'text' },
            { key: 'title', placeholder: 'Titel (t.ex. Grundare & VD)', type: 'text' },
            { key: 'company', placeholder: 'Företag', type: 'text' },
            { key: 'tagline', placeholder: 'Tagline (en mening om dig)', type: 'text' },
            { key: 'email', placeholder: 'E-post', type: 'email' },
            { key: 'phone', placeholder: 'Telefon', type: 'tel' },
            { key: 'linkedin', placeholder: 'LinkedIn URL', type: 'url' },
            { key: 'website', placeholder: 'Hemsida', type: 'url' },
          ].map(f => (
            <input key={f.key} type={f.type} placeholder={f.placeholder} value={form[f.key]}
              onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
              style={{ width: '100%', padding: '14px 16px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, color: 'var(--white)', fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 300, outline: 'none' }} />
          ))}

          <button className="btn-gold" onClick={saveCard} disabled={saving || !form.name}>
            {saving ? 'Sparar…' : 'Spara visitkort'}
          </button>
        </div>
      </div>
    )
  }

  // ── CARD VIEW ──
  const accentColor = card?.theme_color || form.theme_color || '#D4A843'

  return (
    <div style={{ background: 'var(--ink)', minHeight: '100%' }}>

      <div className="fade-up" style={{ padding: '12px 28px 24px' }}>
        <div className="display-italic" style={{ fontSize: 38, lineHeight: 1.1, color: 'var(--white)' }}>
          Digitalt
          <span className="display" style={{ display: 'block', fontStyle: 'normal', fontWeight: 500 }}>Visitkort</span>
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 300, marginTop: 5 }}>
          Dela med en länk eller QR-kod
        </div>
      </div>

      {/* The card itself */}
      <div className="fade-up-1" style={{ margin: '0 28px 24px' }}>
        <div style={{
          borderRadius: 24,
          overflow: 'hidden',
          background: `linear-gradient(160deg, #1A0A28 0%, #2D1248 60%, ${accentColor}22 100%)`,
          border: `1px solid ${accentColor}40`,
          padding: '32px 28px 28px',
          position: 'relative',
        }}>
          {/* Decorative */}
          <div style={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180, borderRadius: '50%', background: `${accentColor}08` }} />
          <div style={{ position: 'absolute', bottom: -20, left: -20, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.02)' }} />

          {/* MM logo */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, position: 'relative', zIndex: 1 }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', border: `1px solid ${accentColor}60`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: accentColor, fontSize: 14 }}>◆</span>
            </div>
            <div className="display" style={{ fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)' }}>
              Masterminds
            </div>
          </div>

          {/* Name & title */}
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div className="display" style={{ fontSize: 30, color: 'var(--white)', lineHeight: 1.1, marginBottom: 6 }}>
              {form.name || 'Ditt namn'}
            </div>
            {form.title && (
              <div style={{ fontSize: 13, color: accentColor, fontWeight: 300, marginBottom: 4 }}>{form.title}</div>
            )}
            {form.company && (
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 300, marginBottom: 16 }}>{form.company}</div>
            )}
            {form.tagline && (
              <div className="display-italic" style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', lineHeight: 1.5, marginBottom: 20, borderLeft: `2px solid ${accentColor}50`, paddingLeft: 12 }}>
                {form.tagline}
              </div>
            )}

            {/* Contact info */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {form.email && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ color: accentColor, fontSize: 13, width: 18, textAlign: 'center' }}>✉</span>
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 300 }}>{form.email}</span>
                </div>
              )}
              {form.phone && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ color: accentColor, fontSize: 13, width: 18, textAlign: 'center' }}>☎</span>
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 300 }}>{form.phone}</span>
                </div>
              )}
              {form.website && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ color: accentColor, fontSize: 13, width: 18, textAlign: 'center' }}>⊕</span>
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 300 }}>{form.website.replace('https://', '')}</span>
                </div>
              )}
              {form.linkedin && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ color: accentColor, fontSize: 13, width: 18, textAlign: 'center' }}>in</span>
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 300 }}>LinkedIn</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* QR placeholder */}
      <div className="fade-up-2" style={{ margin: '0 28px 20px' }}>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '20px', display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 64, height: 64, background: 'white', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <div style={{ fontSize: 9, color: '#333', textAlign: 'center', lineHeight: 1.3, fontWeight: 500 }}>
              QR<br/>KOD
            </div>
          </div>
          <div>
            <div className="display" style={{ fontSize: 15, color: 'var(--white)', marginBottom: 4 }}>Din länk</div>
            <div style={{ fontSize: 11, color: 'var(--gold)', fontWeight: 300 }}>
              masterminds.nu/k/{card?.slug || '…'}
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-tertiary)', marginTop: 4, fontWeight: 300 }}>
              Dela med vem som helst — ingen app krävs
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="fade-up-3" style={{ padding: '0 28px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button className="btn-gold" onClick={copyLink}>
          {copied ? '✓ Länk kopierad!' : '⎘ Kopiera länk'}
        </button>
        <button className="btn-outline" onClick={() => setEditing(true)}>
          Redigera visitkort
        </button>
      </div>

    </div>
  )
}
