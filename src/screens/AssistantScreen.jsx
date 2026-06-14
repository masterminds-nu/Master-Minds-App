import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../lib/AuthContext'

const SUGGESTIONS = [
  'Hjälp mig prissätta en konsulttjänst',
  'Ge feedback på min pitch',
  'Skriv ett LinkedIn-inlägg om mitt uppdrag',
  'Hur förbereder jag mig för en investerare?',
]

const SYSTEM_PROMPT = `Du är "Fråga Masterminds" — en AI-affärsassistent inbyggd i Masterminds.nu, en svensk medlemsplattform för kvinnliga entreprenörer.

Din ton är varm, direkt och kunnig — som en erfaren mentor och rådgivare som verkligen vill att medlemmen ska lyckas. Du ger konkreta, handlingsbara råd inom: prissättning, pitching, affärsstrategi, marknadsföring, förhandling, investerarrelationer och varumärkesbyggande.

Du skriver på svenska om inte personen skriver på annat språk. Håll svaren koncisa men substansfulla — undvik onödiga inledningsfraser. Var konkret och praktisk, ge exempel och konkreta nästa steg.

Du representerar Masterminds värderingar: kvinnliga entreprenörer förtjänar samma ekonomiska infrastruktur och nätverk som män historiskt haft. Du är peppande utan att vara flummig — affärsmässig och skarp.`

export default function AssistantScreen() {
  const { profile } = useAuth()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef(null)

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function sendMessage(text) {
    const messageText = text || input
    if (!messageText.trim() || loading) return

    const userMsg = { role: 'user', content: messageText }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
        }),
      })
      const data = await response.json()
      const textBlocks = data.content?.filter(c => c.type === 'text').map(c => c.text).join('\n') || 'Jag kunde inte generera ett svar just nu. Försök igen.'
      setMessages(prev => [...prev, { role: 'assistant', content: textBlocks }])
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Något gick fel. Kontrollera din anslutning och försök igen.' }])
    }
    setLoading(false)
  }

  return (
    <div style={{ background: 'var(--ink)', minHeight: '100%', display: 'flex', flexDirection: 'column' }}>

      {/* Header */}
      <div className="fade-up" style={{ padding: '12px 28px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', border: '1px solid var(--border-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ color: 'var(--gold)', fontSize: 14 }}>◆</span>
          </div>
          <div className="display" style={{ fontSize: 22, color: 'var(--white)' }}>Fråga Masterminds</div>
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 300 }}>
          Din AI-affärsrådgivare, dygnet runt
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 12, minHeight: 200 }}>

        {messages.length === 0 && (
          <div className="fade-up-1">
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 300, lineHeight: 1.7, padding: '0 8px', marginBottom: 20 }}>
              Hej{profile?.full_name ? ` ${profile.full_name.split(' ')[0]}` : ''}! Jag kan hjälpa dig med prissättning, pitching, strategi och mycket annat. Vad funderar du på?
            </div>
            <div className="section-label" style={{ padding: '0 8px' }}>Förslag</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {SUGGESTIONS.map((s, i) => (
                <div key={i} className="card" onClick={() => sendMessage(s)} style={{ padding: '12px 16px', fontSize: 13, color: 'var(--text-primary)', fontWeight: 300 }}>
                  {s}
                </div>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} style={{
            alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
            maxWidth: '85%',
          }}>
            {m.role === 'assistant' && (
              <div style={{ fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 6, paddingLeft: 4 }}>
                Masterminds AI
              </div>
            )}
            <div style={{
              background: m.role === 'user' ? 'var(--purple-mid)' : 'var(--surface)',
              border: m.role === 'user' ? 'none' : '1px solid var(--border)',
              borderRadius: 16,
              padding: '12px 16px',
              fontSize: 13,
              color: 'var(--white)',
              fontWeight: 300,
              lineHeight: 1.6,
              whiteSpace: 'pre-wrap',
            }}>
              {m.content}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ alignSelf: 'flex-start', maxWidth: '85%' }}>
            <div style={{ fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 6, paddingLeft: 4 }}>
              Masterminds AI
            </div>
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '12px 16px', fontSize: 13, color: 'var(--text-tertiary)', fontWeight: 300 }}>
              Tänker…
            </div>
          </div>
        )}

        <div ref={scrollRef} />
      </div>

      {/* Input */}
      <div style={{ padding: '16px 20px', position: 'sticky', bottom: 0, background: 'var(--ink)' }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
          <textarea
            placeholder="Skriv din fråga…"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
            rows={1}
            style={{
              flex: 1,
              padding: '12px 16px',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 14,
              color: 'var(--white)',
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 13,
              fontWeight: 300,
              outline: 'none',
              resize: 'none',
              maxHeight: 100,
            }}
          />
          <button
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
            style={{
              width: 44, height: 44,
              borderRadius: 12,
              background: 'var(--gold)',
              border: 'none',
              color: 'var(--ink)',
              fontSize: 18,
              cursor: 'pointer',
              flexShrink: 0,
              opacity: (loading || !input.trim()) ? 0.4 : 1,
            }}
          >
            ↑
          </button>
        </div>
      </div>
    </div>
  )
}
