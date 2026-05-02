"use client"
import { useState } from 'react'

const API = 'http://localhost:8003'

const defaultHouse = {
  sqft_living: 2500, sqft_lot: 5000, bedrooms: 4, bathrooms: 2.5,
  floors: 2.0, waterfront: 0, view: 2, condition: 4, grade: 8,
  yr_built: 1995, yr_renovated: 0, zipcode: '98001',
}

const presets = [
  { label: '🏠 Starter Home', sqft_living: 1200, sqft_lot: 3000, bedrooms: 2, bathrooms: 1.0, floors: 1.0, waterfront: 0, view: 0, condition: 3, grade: 5, yr_built: 1975, yr_renovated: 0, zipcode: '98001' },
  { label: '🏡 Family Home', sqft_living: 2500, sqft_lot: 6500, bedrooms: 4, bathrooms: 2.5, floors: 2.0, waterfront: 0, view: 2, condition: 4, grade: 8, yr_built: 1995, yr_renovated: 2010, zipcode: '98052' },
  { label: '🏰 Luxury Estate', sqft_living: 5500, sqft_lot: 20000, bedrooms: 6, bathrooms: 5.0, floors: 3.0, waterfront: 1, view: 4, condition: 5, grade: 12, yr_built: 2015, yr_renovated: 0, zipcode: '98199' },
]

function PriceCard({ label, price }: { label: string; price: string }) {
  return (
    <div style={{ background: '#22263a', borderRadius: 10, padding: '16px 20px', textAlign: 'center' }}>
      <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 800, color: '#10b981' }}>{price}</div>
    </div>
  )
}

function StarRating({ value, max, label }: any) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <span style={{ fontSize: 11, color: '#64748b', width: 70, flexShrink: 0 }}>{label}</span>
      <div style={{ display: 'flex', gap: 3 }}>
        {Array.from({ length: max }, (_, i) => (
          <div key={i} style={{ width: 12, height: 12, borderRadius: '50%', background: i < value ? '#6366f1' : '#22263a', border: '1px solid #2e3247' }} />
        ))}
      </div>
      <span style={{ fontSize: 11, color: '#94a3b8' }}>{value}/{max}</span>
    </div>
  )
}

export default function HouseApp() {
  const [form, setForm] = useState<any>(defaultHouse)
  const [result, setResult] = useState<any>(null)
  const [comparisons, setComparisons] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function handle(k: string, v: any) { setForm((p: any) => ({ ...p, [k]: v })) }

  async function predict() {
    setLoading(true); setError('')
    try {
      const r = await fetch(`${API}/predict`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      const d = await r.json()
      setResult(d)
    } catch { setError('Cannot reach backend. Start FastAPI on port 8000.') }
    setLoading(false)
  }

  async function addToComparison() {
    if (!result) return
    setComparisons(c => [...c, { ...result, config: `${form.sqft_living}sqft ${form.bedrooms}BR`, label: form.zipcode }].slice(-4))
  }

  async function loadPreset(p: any) {
    const { label, ...rest } = p
    setForm(rest); setResult(null)
  }

  async function runPresets() {
    setComparisons([]); setError('')
    for (const p of presets) {
      const { label, ...rest } = p
      try {
        const r = await fetch(`${API}/predict`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(rest) })
        const d = await r.json()
        setComparisons(c => [...c, { ...d, config: label }])
      } catch { setError('Backend error'); break }
      await new Promise(r => setTimeout(r, 300))
    }
  }

  const pricePer = result && form.sqft_living ? (result.estimated_price / form.sqft_living).toFixed(0) : null
  const ageYears = 2024 - form.yr_built

  return (
    <div style={{ minHeight: '100vh', background: '#0f1117', color: '#e2e8f0', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #1a1d27, #22263a)', borderBottom: '1px solid #2e3247', padding: '18px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, background: 'linear-gradient(90deg, #10b981, #6366f1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>🏠 PropValue AI</div>
          <div style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>AI-Powered Property Valuation Engine</div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {presets.map(p => (
            <button key={p.label} onClick={() => loadPreset(p)} style={{ background: '#22263a', border: '1px solid #2e3247', borderRadius: 8, padding: '8px 14px', color: '#e2e8f0', fontSize: 13, cursor: 'pointer' }}>
              {p.label}
            </button>
          ))}
          <button onClick={runPresets} style={{ background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
            Compare All →
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '28px 40px', display: 'grid', gridTemplateColumns: '1fr 420px', gap: 24 }}>
        {/* LEFT: Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Size & Layout */}
          <div style={{ background: '#1a1d27', border: '1px solid #2e3247', borderRadius: 12, padding: 24 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#10b981', marginBottom: 18, textTransform: 'uppercase', letterSpacing: 1 }}>📐 Size & Layout</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
              {[
                { k: 'sqft_living', l: 'Living Area (sqft)', step: '50', min: 500, max: 10000 },
                { k: 'sqft_lot', l: 'Lot Size (sqft)', step: '100', min: 1000, max: 50000 },
              ].map(f => (
                <div key={f.k}>
                  <label style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 6 }}>{f.l}</label>
                  <input type="number" step={f.step} min={f.min} max={f.max} value={form[f.k]} onChange={e => handle(f.k, Number(e.target.value))}
                    style={{ width: '100%', background: '#22263a', border: '1px solid #2e3247', borderRadius: 8, padding: '10px 12px', color: '#e2e8f0', fontSize: 14, outline: 'none' }} />
                </div>
              ))}
              <div>
                <label style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 6 }}>Bedrooms</label>
                <div style={{ display: 'flex', gap: 6 }}>
                  {[1, 2, 3, 4, 5, 6].map(n => (
                    <button key={n} onClick={() => handle('bedrooms', n)}
                      style={{ flex: 1, padding: '10px 0', background: form.bedrooms === n ? '#6366f1' : '#22263a', border: `1px solid ${form.bedrooms === n ? '#6366f1' : '#2e3247'}`, borderRadius: 8, color: '#e2e8f0', fontSize: 14, fontWeight: form.bedrooms === n ? 700 : 400, cursor: 'pointer' }}>
                      {n}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 6 }}>Bathrooms</label>
                <div style={{ display: 'flex', gap: 6 }}>
                  {[1, 1.5, 2, 2.5, 3, 3.5, 4].map(n => (
                    <button key={n} onClick={() => handle('bathrooms', n)}
                      style={{ flex: 1, padding: '10px 0', background: form.bathrooms === n ? '#6366f1' : '#22263a', border: `1px solid ${form.bathrooms === n ? '#6366f1' : '#2e3247'}`, borderRadius: 8, color: '#e2e8f0', fontSize: 13, fontWeight: form.bathrooms === n ? 700 : 400, cursor: 'pointer' }}>
                      {n}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 6 }}>Floors</label>
                <div style={{ display: 'flex', gap: 6 }}>
                  {[1, 1.5, 2, 2.5, 3].map(n => (
                    <button key={n} onClick={() => handle('floors', n)}
                      style={{ flex: 1, padding: '10px 0', background: form.floors === n ? '#6366f1' : '#22263a', border: `1px solid ${form.floors === n ? '#6366f1' : '#2e3247'}`, borderRadius: 8, color: '#e2e8f0', fontSize: 14, fontWeight: form.floors === n ? 700 : 400, cursor: 'pointer' }}>
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Property Quality */}
          <div style={{ background: '#1a1d27', border: '1px solid #2e3247', borderRadius: 12, padding: 24 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#6366f1', marginBottom: 18, textTransform: 'uppercase', letterSpacing: 1 }}>⭐ Quality & Features</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 16 }}>
              {[
                { k: 'view', l: 'View Rating', min: 0, max: 4 },
                { k: 'condition', l: 'Condition', min: 1, max: 5 },
                { k: 'grade', l: 'Build Grade', min: 4, max: 13 },
              ].map(f => (
                <div key={f.k}>
                  <label style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 8 }}>{f.l}: <strong style={{ color: '#e2e8f0' }}>{form[f.k]}</strong> / {f.max}</label>
                  <input type="range" min={f.min} max={f.max} value={form[f.k]} onChange={e => handle(f.k, Number(e.target.value))}
                    style={{ width: '100%', accentColor: '#6366f1' }} />
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
                <input type="checkbox" checked={form.waterfront === 1} onChange={e => handle('waterfront', e.target.checked ? 1 : 0)} style={{ width: 16, height: 16, accentColor: '#6366f1' }} />
                🌊 Waterfront Property
              </label>
              <div style={{ display: 'flex', gap: 12 }}>
                {[
                  { k: 'yr_built', l: 'Year Built' },
                  { k: 'yr_renovated', l: 'Year Renovated (0=never)' },
                ].map(f => (
                  <div key={f.k}>
                    <label style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 6 }}>{f.l}</label>
                    <input type="number" value={form[f.k]} onChange={e => handle(f.k, Number(e.target.value))}
                      style={{ width: 140, background: '#22263a', border: '1px solid #2e3247', borderRadius: 8, padding: '10px 12px', color: '#e2e8f0', fontSize: 14, outline: 'none' }} />
                  </div>
                ))}
                <div>
                  <label style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 6 }}>Zipcode</label>
                  <input value={form.zipcode} onChange={e => handle('zipcode', e.target.value)}
                    style={{ width: 120, background: '#22263a', border: '1px solid #2e3247', borderRadius: 8, padding: '10px 12px', color: '#e2e8f0', fontSize: 14, outline: 'none' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={predict} disabled={loading} style={{ flex: 2, background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', border: 'none', borderRadius: 10, padding: '14px', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
              {loading ? '⏳ Estimating...' : '💰 Estimate Property Value'}
            </button>
            <button onClick={addToComparison} disabled={!result} style={{ flex: 1, background: result ? '#22263a' : '#1a1d27', color: result ? '#e2e8f0' : '#64748b', border: '1px solid #2e3247', borderRadius: 10, padding: '14px', fontSize: 14, fontWeight: 600, cursor: result ? 'pointer' : 'default' }}>
              + Compare
            </button>
            <button onClick={() => { setForm(defaultHouse); setResult(null) }} style={{ background: '#22263a', color: '#64748b', border: '1px solid #2e3247', borderRadius: 10, padding: '14px 18px', cursor: 'pointer' }}>↺</button>
          </div>

          {/* Comparison Table */}
          {comparisons.length > 0 && (
            <div style={{ background: '#1a1d27', border: '1px solid #2e3247', borderRadius: 12, padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: 1 }}>📊 Property Comparison</div>
                <button onClick={() => setComparisons([])} style={{ background: 'none', color: '#ef4444', border: 'none', fontSize: 13, cursor: 'pointer' }}>Clear</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: `repeat(${comparisons.length}, 1fr)`, gap: 12 }}>
                {comparisons.map((c, i) => (
                  <div key={i} style={{ background: '#22263a', borderRadius: 10, padding: '14px', textAlign: 'center' }}>
                    <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>{c.config}</div>
                    <div style={{ fontSize: 17, fontWeight: 800, color: '#10b981' }}>{c.price_formatted}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {error && <div style={{ background: '#ef444422', border: '1px solid #ef4444', borderRadius: 8, padding: 12, color: '#ef4444', fontSize: 14 }}>⚠️ {error}</div>}
        </div>

        {/* RIGHT: Result + Property Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Price Result */}
          <div style={{ background: '#1a1d27', border: `1px solid ${result ? '#10b98166' : '#2e3247'}`, borderRadius: 12, padding: 28, textAlign: 'center' }}>
            <div style={{ fontSize: 13, color: '#64748b', marginBottom: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>Estimated Market Value</div>
            {result ? (
              <>
                <div style={{ fontSize: 46, fontWeight: 900, color: '#10b981', lineHeight: 1.1 }}>{result.price_formatted}</div>
                {pricePer && <div style={{ fontSize: 14, color: '#64748b', marginTop: 8 }}>${pricePer} per sqft</div>}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 20 }}>
                  <PriceCard label="Low Estimate (−10%)" price={`$${Math.round(result.estimated_price * 0.9).toLocaleString()}`} />
                  <PriceCard label="High Estimate (+10%)" price={`$${Math.round(result.estimated_price * 1.1).toLocaleString()}`} />
                </div>
              </>
            ) : (
              <div style={{ height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: 14 }}>
                Fill in property details and click Estimate
              </div>
            )}
          </div>

          {/* Property Summary Card */}
          <div style={{ background: '#1a1d27', border: '1px solid #2e3247', borderRadius: 12, padding: 20 }}>
            <div style={{ fontSize: 13, color: '#64748b', marginBottom: 14, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>Property Summary</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
              {[
                { l: 'Living Area', v: `${form.sqft_living.toLocaleString()} sqft`, c: '#6366f1' },
                { l: 'Lot Size', v: `${form.sqft_lot.toLocaleString()} sqft`, c: '#8b5cf6' },
                { l: 'Bedrooms', v: `${form.bedrooms} BR`, c: '#10b981' },
                { l: 'Bathrooms', v: `${form.bathrooms} BA`, c: '#10b981' },
                { l: 'Age', v: `${ageYears} years`, c: form.yr_renovated > 0 ? '#f59e0b' : '#64748b' },
                { l: 'Waterfront', v: form.waterfront ? '✅ Yes' : 'No', c: form.waterfront ? '#10b981' : '#64748b' },
              ].map(s => (
                <div key={s.l} style={{ background: '#22263a', borderRadius: 8, padding: '10px 12px' }}>
                  <div style={{ fontSize: 11, color: '#64748b' }}>{s.l}</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: s.c, marginTop: 2 }}>{s.v}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <StarRating label="View" value={form.view} max={4} />
              <StarRating label="Condition" value={form.condition} max={5} />
              <StarRating label="Grade" value={Math.min(form.grade - 3, 10)} max={10} />
            </div>
          </div>

          {/* Market Tips */}
          <div style={{ background: 'linear-gradient(135deg, #1a1d27, #22263a)', border: '1px solid #2e3247', borderRadius: 12, padding: 20 }}>
            <div style={{ fontSize: 13, color: '#64748b', marginBottom: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>💡 Value Drivers</div>
            {[
              { factor: 'Larger living area', impact: '+ High impact', c: '#10b981' },
              { factor: 'Higher grade/condition', impact: '+ Significant boost', c: '#10b981' },
              { factor: 'Waterfront location', impact: '+ Premium pricing', c: '#10b981' },
              { factor: 'Recent renovation', impact: '+ Moderate boost', c: '#f59e0b' },
              { factor: 'Older build year', impact: '− Slight discount', c: '#ef4444' },
            ].map((t, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: i < 4 ? '1px solid #2e3247' : 'none' }}>
                <span style={{ fontSize: 13, color: '#94a3b8' }}>{t.factor}</span>
                <span style={{ fontSize: 12, color: t.c, fontWeight: 600 }}>{t.impact}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
