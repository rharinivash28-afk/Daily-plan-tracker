import React, { useEffect, useMemo, useRef, useState } from 'react'

/* ------------------------------------------------------------------ *
 *  Daily Life Tracker — single-file React artifact
 *  Persistent storage via window.storage (Claude artifact API) with a
 *  graceful localStorage fallback so it runs anywhere.
 * ------------------------------------------------------------------ */

/* ---------------------------- storage ----------------------------- */
// Works with the async window.storage artifact API and falls back to
// localStorage when that API isn't present (e.g. a plain browser build).
const store = {
  async get(key) {
    try {
      if (typeof window !== 'undefined' && window.storage?.getItem) {
        const v = await window.storage.getItem(key)
        if (v !== undefined && v !== null) return v
      }
    } catch (_) { /* fall through */ }
    try { return localStorage.getItem(key) } catch (_) { return null }
  },
  async set(key, value) {
    let ok = false
    try {
      if (typeof window !== 'undefined' && window.storage?.setItem) {
        await window.storage.setItem(key, value)
        ok = true
      }
    } catch (_) { /* fall through */ }
    try { localStorage.setItem(key, value) } catch (_) { /* ignore */ }
    return ok
  },
}

/* ----------------------------- dates ------------------------------ */
const pad = (n) => String(n).padStart(2, '0')
const toKey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
const todayKey = () => toKey(new Date())
const keyToDate = (k) => {
  const [y, m, d] = k.split('-').map(Number)
  return new Date(y, m - 1, d)
}
const shiftKey = (k, days) => {
  const d = keyToDate(k)
  d.setDate(d.getDate() + days)
  return toKey(d)
}
const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const prettyDate = (k) => {
  const d = keyToDate(k)
  return { weekday: WEEKDAYS[d.getDay()], main: `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}` }
}

/* --------------------------- defaults ----------------------------- */
const MOODS = [
  { e: '😄', label: 'Great' },
  { e: '🙂', label: 'Good' },
  { e: '😐', label: 'Okay' },
  { e: '😔', label: 'Low' },
  { e: '😣', label: 'Stressed' },
  { e: '😴', label: 'Tired' },
]

const freshDay = () => ({
  wakeUp: false,
  water: 0,
  waterGoal: 8,
  skinAM: false,
  skinPM: false,
  todos: [],
  classTopic: '',
  beyondTopic: '',
  mood: null,
  exerciseDone: false,
  exerciseMins: 0,
  exerciseGoal: 30,
  gratitude: '',
  customValues: {}, // keyed by custom def id
})

const clampPct = (v) => Math.max(0, Math.min(100, Math.round(v)))

/* ====================================================================
 *  App
 * ==================================================================== */
export default function App() {
  const [dateKey, setDateKey] = useState(todayKey())
  const [data, setData] = useState(null) // null === loading
  const [customDefs, setCustomDefs] = useState([])
  const [defsLoaded, setDefsLoaded] = useState(false)
  const loadedFor = useRef(null)

  /* load global custom-tracker definitions once */
  useEffect(() => {
    let alive = true
    ;(async () => {
      const raw = await store.get('dlt:customDefs')
      if (!alive) return
      try { setCustomDefs(raw ? JSON.parse(raw) : []) } catch { setCustomDefs([]) }
      setDefsLoaded(true)
    })()
    return () => { alive = false }
  }, [])

  /* persist custom defs */
  useEffect(() => {
    if (!defsLoaded) return
    store.set('dlt:customDefs', JSON.stringify(customDefs))
  }, [customDefs, defsLoaded])

  /* load the day whenever the date changes */
  useEffect(() => {
    let alive = true
    setData(null)
    loadedFor.current = null
    ;(async () => {
      const raw = await store.get(`dlt:day:${dateKey}`)
      if (!alive) return
      let parsed = freshDay()
      if (raw) {
        try { parsed = { ...freshDay(), ...JSON.parse(raw) } } catch { /* keep fresh */ }
      }
      loadedFor.current = dateKey
      setData(parsed)
    })()
    return () => { alive = false }
  }, [dateKey])

  /* persist the day on every change (only once it belongs to this date) */
  useEffect(() => {
    if (!data || loadedFor.current !== dateKey) return
    store.set(`dlt:day:${dateKey}`, JSON.stringify(data))
  }, [data, dateKey])

  const update = (patch) => setData((d) => ({ ...d, ...(typeof patch === 'function' ? patch(d) : patch) }))

  /* ------------------------- progress math ------------------------ */
  const sections = useMemo(() => {
    if (!data) return []
    const list = [
      { id: 'wake', pct: data.wakeUp ? 100 : 0 },
      { id: 'water', pct: clampPct((data.water / Math.max(1, data.waterGoal)) * 100) },
      { id: 'skin', pct: (data.skinAM ? 50 : 0) + (data.skinPM ? 50 : 0) },
      {
        id: 'todo',
        pct: data.todos.length ? clampPct((data.todos.filter((t) => t.done).length / data.todos.length) * 100) : 0,
      },
      { id: 'class', pct: data.classTopic.trim() ? 100 : 0 },
      { id: 'beyond', pct: data.beyondTopic.trim() ? 100 : 0 },
      { id: 'mood', pct: data.mood != null ? 100 : 0 },
      {
        id: 'exercise',
        pct: clampPct(Math.max(data.exerciseDone ? 100 : 0, (data.exerciseMins / Math.max(1, data.exerciseGoal)) * 100)),
      },
      { id: 'gratitude', pct: data.gratitude.trim() ? 100 : 0 },
    ]
    for (const def of customDefs) {
      const v = data.customValues?.[def.id]
      let pct = 0
      if (def.type === 'toggle') pct = v ? 100 : 0
      else if (def.type === 'counter') pct = clampPct(((Number(v) || 0) / Math.max(1, def.goal || 1)) * 100)
      else if (def.type === 'text') pct = (v && String(v).trim()) ? 100 : 0
      list.push({ id: `custom:${def.id}`, pct })
    }
    return list
  }, [data, customDefs])

  const overall = useMemo(() => {
    if (!sections.length) return 0
    return clampPct(sections.reduce((a, s) => a + s.pct, 0) / sections.length)
  }, [sections])

  const pctOf = (id) => sections.find((s) => s.id === id)?.pct ?? 0

  /* --------------------------- custom ----------------------------- */
  const addCustom = (name, type, goal) => {
    const id = `c_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`
    setCustomDefs((d) => [...d, { id, name, type, goal: type === 'counter' ? Math.max(1, goal || 1) : undefined }])
  }
  const removeCustom = (id) => {
    setCustomDefs((d) => d.filter((c) => c.id !== id))
  }
  const setCustomValue = (id, value) =>
    update((d) => ({ customValues: { ...d.customValues, [id]: value } }))

  /* ----------------------------- render --------------------------- */
  const pd = prettyDate(dateKey)
  const isToday = dateKey === todayKey()

  return (
    <div style={S.root}>
      <StyleSheet />
      <Aurora />

      <main style={S.page}>
        {/* ----- header / date nav ----- */}
        <header style={S.header}>
          <div style={S.brandRow}>
            <div style={S.logoDot} />
            <h1 style={S.brand}>Daily<span style={{ color: 'var(--amber)' }}>Life</span></h1>
            <span style={S.brandSub}>tracker</span>
          </div>

          <div style={S.dateNav}>
            <button style={S.navBtn} onClick={() => setDateKey((k) => shiftKey(k, -1))} aria-label="Previous day">‹</button>
            <div style={S.dateCenter}>
              <div style={S.weekday}>{pd.weekday}{isToday && <span style={S.todayPill}>Today</span>}</div>
              <input
                type="date"
                value={dateKey}
                onChange={(e) => e.target.value && setDateKey(e.target.value)}
                style={S.dateInput}
                aria-label="Pick a date"
              />
              <div style={S.dateMain}>{pd.main}</div>
            </div>
            <button style={S.navBtn} onClick={() => setDateKey((k) => shiftKey(k, 1))} aria-label="Next day">›</button>
          </div>

          {!isToday && (
            <button style={S.jumpToday} onClick={() => setDateKey(todayKey())}>↩ Jump to today</button>
          )}
        </header>

        {/* ----- master progress ----- */}
        <section style={S.masterCard}>
          <div style={S.masterTop}>
            <div>
              <div style={S.masterLabel}>Day Progress</div>
              <div style={S.masterHint}>{overall >= 100 ? 'Perfect day. Well done. ✨' : overall >= 60 ? 'Strong momentum — keep going.' : overall > 0 ? 'A good start. One step at a time.' : 'A fresh day awaits.'}</div>
            </div>
            <div style={S.masterPctWrap}>
              <span style={S.masterPct}>{overall}</span><span style={S.masterPctSign}>%</span>
            </div>
          </div>
          <Bar pct={overall} big />
        </section>

        {/* ----- grid of sections ----- */}
        <div style={S.grid}>
          {/* Wake Up */}
          <Card title="Wake Up" icon="🌅" pct={pctOf('wake')}>
            <ToggleRow
              active={data?.wakeUp}
              onToggle={() => update((d) => ({ wakeUp: !d.wakeUp }))}
              onLabel="Up & at it"
              offLabel="Mark as awake"
            />
          </Card>

          {/* Water */}
          <Card title="Water Intake" icon="💧" pct={pctOf('water')}>
            <div style={S.waterWrap}>
              <button style={S.counterBtn} onClick={() => update((d) => ({ water: Math.max(0, d.water - 1) }))} disabled={!data || data.water <= 0}>−</button>
              <div style={S.counterMid}>
                <div style={S.counterNum}>{data?.water ?? 0}<span style={S.counterGoal}> / {data?.waterGoal ?? 8}</span></div>
                <div style={S.counterUnit}>glasses</div>
              </div>
              <button style={S.counterBtn} onClick={() => update((d) => ({ water: d.water + 1 }))} disabled={!data}>+</button>
            </div>
            <div style={S.dropsRow}>
              {Array.from({ length: data?.waterGoal ?? 8 }).map((_, i) => (
                <span key={i} style={{ ...S.drop, opacity: i < (data?.water ?? 0) ? 1 : 0.18, transform: i < (data?.water ?? 0) ? 'scale(1)' : 'scale(0.8)' }}>💧</span>
              ))}
            </div>
          </Card>

          {/* Skincare */}
          <Card title="Skincare" icon="🧴" pct={pctOf('skin')}>
            <div style={S.splitRow}>
              <SplitToggle label="Morning" sub="☀️ AM" active={data?.skinAM} onToggle={() => update((d) => ({ skinAM: !d.skinAM }))} />
              <SplitToggle label="Night" sub="🌙 PM" active={data?.skinPM} onToggle={() => update((d) => ({ skinPM: !d.skinPM }))} />
            </div>
          </Card>

          {/* Exercise */}
          <Card title="Exercise / Movement" icon="🏃" pct={pctOf('exercise')}>
            <ToggleRow
              active={data?.exerciseDone}
              onToggle={() => update((d) => ({ exerciseDone: !d.exerciseDone }))}
              onLabel="Moved today"
              offLabel="Mark as done"
            />
            <div style={S.minsRow}>
              <button style={S.miniBtn} onClick={() => update((d) => ({ exerciseMins: Math.max(0, d.exerciseMins - 5) }))} disabled={!data}>−5</button>
              <div style={S.minsMid}>
                <span style={S.minsNum}>{data?.exerciseMins ?? 0}</span>
                <span style={S.minsUnit}>min / {data?.exerciseGoal ?? 30}</span>
              </div>
              <button style={S.miniBtn} onClick={() => update((d) => ({ exerciseMins: d.exerciseMins + 5 }))} disabled={!data}>+5</button>
            </div>
          </Card>

          {/* Mood */}
          <Card title="Mood Check-in" icon="🫧" pct={pctOf('mood')} wide>
            <div style={S.moodRow}>
              {MOODS.map((m, i) => (
                <button
                  key={m.label}
                  onClick={() => update((d) => ({ mood: d.mood === i ? null : i }))}
                  style={{ ...S.moodBtn, ...(data?.mood === i ? S.moodBtnActive : {}) }}
                  title={m.label}
                >
                  <span style={S.moodEmoji}>{m.e}</span>
                  <span style={S.moodLabel}>{m.label}</span>
                </button>
              ))}
            </div>
          </Card>

          {/* To-Do */}
          <Card title="To-Do List" icon="✅" pct={pctOf('todo')} wide>
            <TodoList todos={data?.todos ?? []} onChange={(todos) => update({ todos })} disabled={!data} />
          </Card>

          {/* Class topic */}
          <Card title="Learned in Class" icon="📘" pct={pctOf('class')}>
            <TextArea
              value={data?.classTopic ?? ''}
              onChange={(v) => update({ classTopic: v })}
              placeholder="What did you learn in class today?"
              disabled={!data}
            />
          </Card>

          {/* Beyond topic */}
          <Card title="Learned Beyond Class" icon="🌍" pct={pctOf('beyond')}>
            <TextArea
              value={data?.beyondTopic ?? ''}
              onChange={(v) => update({ beyondTopic: v })}
              placeholder="A skill, idea, or fact from the wider world…"
              disabled={!data}
            />
          </Card>

          {/* Gratitude */}
          <Card title="Gratitude Note" icon="🕊️" pct={pctOf('gratitude')} wide>
            <TextArea
              value={data?.gratitude ?? ''}
              onChange={(v) => update({ gratitude: v })}
              placeholder="One thing you're grateful for today…"
              disabled={!data}
              rows={2}
            />
          </Card>

          {/* Custom trackers */}
          {customDefs.map((def) => (
            <Card
              key={def.id}
              title={def.name}
              icon="⭐"
              pct={pctOf(`custom:${def.id}`)}
              onRemove={() => removeCustom(def.id)}
            >
              <CustomControl def={def} value={data?.customValues?.[def.id]} onChange={(v) => setCustomValue(def.id, v)} disabled={!data} />
            </Card>
          ))}

          {/* Add custom */}
          <AddCustomCard onAdd={addCustom} />
        </div>

        <footer style={S.footer}>
          <span>Your data lives privately on this device · {customDefs.length + 9} trackers</span>
        </footer>
      </main>
    </div>
  )
}

/* ====================================================================
 *  Reusable pieces
 * ==================================================================== */

function Bar({ pct, big }) {
  const done = pct >= 100
  return (
    <div style={{ ...S.barTrack, height: big ? 14 : 8 }}>
      <div
        style={{
          ...S.barFill,
          width: `${pct}%`,
          background: done
            ? 'linear-gradient(90deg, #ffd479, #ffb84d, #ff8a5c)'
            : 'linear-gradient(90deg, #ff8a5c, #ffb84d)',
          boxShadow: pct > 0 ? '0 0 14px rgba(255,160,90,0.55)' : 'none',
        }}
      >
        {pct > 8 && <span style={S.barShine} />}
      </div>
    </div>
  )
}

function Card({ title, icon, pct, children, wide, onRemove }) {
  const done = pct >= 100
  return (
    <section style={{ ...S.card, ...(wide ? S.cardWide : {}), ...(done ? S.cardDone : {}) }}>
      <div style={S.cardHead}>
        <div style={S.cardTitleWrap}>
          <span style={S.cardIcon}>{icon}</span>
          <h3 style={S.cardTitle}>{title}</h3>
        </div>
        <div style={S.cardHeadRight}>
          <span style={{ ...S.cardPct, color: done ? 'var(--amber)' : 'var(--muted)' }}>{pct}%</span>
          {onRemove && (
            <button style={S.removeBtn} onClick={onRemove} title="Remove tracker" aria-label="Remove tracker">×</button>
          )}
        </div>
      </div>
      <Bar pct={pct} />
      <div style={S.cardBody}>{children}</div>
    </section>
  )
}

function ToggleRow({ active, onToggle, onLabel, offLabel }) {
  return (
    <button onClick={onToggle} style={{ ...S.bigToggle, ...(active ? S.bigToggleOn : {}) }}>
      <span style={{ ...S.checkCircle, ...(active ? S.checkCircleOn : {}) }}>{active ? '✓' : ''}</span>
      <span style={S.bigToggleLabel}>{active ? onLabel : offLabel}</span>
    </button>
  )
}

function SplitToggle({ label, sub, active, onToggle }) {
  return (
    <button onClick={onToggle} style={{ ...S.split, ...(active ? S.splitOn : {}) }}>
      <span style={S.splitSub}>{sub}</span>
      <span style={S.splitLabel}>{label}</span>
      <span style={{ ...S.splitDot, ...(active ? S.splitDotOn : {}) }}>{active ? '✓' : ''}</span>
    </button>
  )
}

function TextArea({ value, onChange, placeholder, disabled, rows = 3 }) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      rows={rows}
      style={S.textarea}
    />
  )
}

function TodoList({ todos, onChange, disabled }) {
  const [text, setText] = useState('')
  const add = () => {
    const t = text.trim()
    if (!t) return
    onChange([...todos, { id: Date.now().toString(36), text: t, done: false }])
    setText('')
  }
  const toggle = (id) => onChange(todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t)))
  const remove = (id) => onChange(todos.filter((t) => t.id !== id))

  return (
    <div>
      <div style={S.todoInputRow}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && add()}
          placeholder="Add a task and press Enter…"
          disabled={disabled}
          style={S.todoInput}
        />
        <button onClick={add} style={S.todoAddBtn} disabled={disabled}>Add</button>
      </div>
      <div style={S.todoList}>
        {todos.length === 0 && <div style={S.empty}>No tasks yet — add your first one above.</div>}
        {todos.map((t) => (
          <div key={t.id} style={S.todoItem}>
            <button onClick={() => toggle(t.id)} style={{ ...S.todoCheck, ...(t.done ? S.todoCheckOn : {}) }}>{t.done ? '✓' : ''}</button>
            <span style={{ ...S.todoText, ...(t.done ? S.todoTextDone : {}) }}>{t.text}</span>
            <button onClick={() => remove(t.id)} style={S.todoDel} aria-label="Delete task">×</button>
          </div>
        ))}
      </div>
    </div>
  )
}

function CustomControl({ def, value, onChange, disabled }) {
  if (def.type === 'toggle') {
    return (
      <ToggleRow
        active={!!value}
        onToggle={() => onChange(!value)}
        onLabel="Done"
        offLabel="Mark as done"
      />
    )
  }
  if (def.type === 'counter') {
    const v = Number(value) || 0
    return (
      <div style={S.waterWrap}>
        <button style={S.counterBtn} onClick={() => onChange(Math.max(0, v - 1))} disabled={disabled || v <= 0}>−</button>
        <div style={S.counterMid}>
          <div style={S.counterNum}>{v}<span style={S.counterGoal}> / {def.goal}</span></div>
          <div style={S.counterUnit}>count</div>
        </div>
        <button style={S.counterBtn} onClick={() => onChange(v + 1)} disabled={disabled}>+</button>
      </div>
    )
  }
  return (
    <TextArea value={value || ''} onChange={onChange} placeholder="Write something…" disabled={disabled} rows={2} />
  )
}

function AddCustomCard({ onAdd }) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [type, setType] = useState('toggle')
  const [goal, setGoal] = useState(8)

  const submit = () => {
    const n = name.trim()
    if (!n) return
    onAdd(n, type, Number(goal) || 1)
    setName(''); setType('toggle'); setGoal(8); setOpen(false)
  }

  if (!open) {
    return (
      <button style={S.addCard} onClick={() => setOpen(true)}>
        <span style={S.addPlus}>+</span>
        <span style={S.addText}>Add your own tracker</span>
        <span style={S.addSub}>toggle · counter · text</span>
      </button>
    )
  }

  return (
    <section style={{ ...S.card, ...S.addOpenCard }}>
      <div style={S.cardHead}>
        <div style={S.cardTitleWrap}>
          <span style={S.cardIcon}>✨</span>
          <h3 style={S.cardTitle}>New Tracker</h3>
        </div>
        <button style={S.removeBtn} onClick={() => setOpen(false)} aria-label="Cancel">×</button>
      </div>
      <div style={S.cardBody}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          placeholder="Tracker name (e.g. Meditate)"
          style={S.todoInput}
          autoFocus
        />
        <div style={S.typeRow}>
          {['toggle', 'counter', 'text'].map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              style={{ ...S.typeBtn, ...(type === t ? S.typeBtnOn : {}) }}
            >
              {t === 'toggle' ? '🔘 Toggle' : t === 'counter' ? '🔢 Counter' : '📝 Text'}
            </button>
          ))}
        </div>
        {type === 'counter' && (
          <label style={S.goalRow}>
            <span style={S.goalLabel}>Daily goal</span>
            <input
              type="number"
              min={1}
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              style={S.goalInput}
            />
          </label>
        )}
        <button style={S.createBtn} onClick={submit}>Create tracker</button>
      </div>
    </section>
  )
}

/* ---------------------- animated background ----------------------- */
function Aurora() {
  return (
    <div style={S.auroraWrap} aria-hidden="true">
      <div className="blob blob1" />
      <div className="blob blob2" />
      <div className="blob blob3" />
      <div className="blob blob4" />
      <div style={S.grain} />
    </div>
  )
}

/* --------------------- global styles & fonts ---------------------- */
function StyleSheet() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Space+Grotesk:wght@400;500;600;700&display=swap');

      :root{
        --bg:#160f0e;
        --amber:#ffb24d;
        --rose:#ff8a5c;
        --text:#f6e8df;
        --muted:#b59c8f;
        --card:rgba(46,31,27,0.55);
        --line:rgba(255,180,120,0.12);
      }
      *{ box-sizing:border-box; }
      html,body,#root{ margin:0; height:100%; }
      body{
        background:var(--bg);
        color:var(--text);
        font-family:'Space Grotesk', system-ui, sans-serif;
        -webkit-font-smoothing:antialiased;
        overflow-x:hidden;
      }
      ::selection{ background:rgba(255,160,90,0.35); }

      ::-webkit-scrollbar{ width:10px; height:10px; }
      ::-webkit-scrollbar-thumb{ background:rgba(255,160,90,0.25); border-radius:20px; }
      ::-webkit-scrollbar-track{ background:transparent; }

      .blob{
        position:absolute; border-radius:50%;
        filter:blur(70px); opacity:0.55; mix-blend-mode:screen;
        will-change:transform;
      }
      .blob1{ width:46vw; height:46vw; left:-8vw; top:-6vw;
        background:radial-gradient(circle at 30% 30%, #ff7a3c, transparent 70%);
        animation:drift1 26s ease-in-out infinite; }
      .blob2{ width:42vw; height:42vw; right:-10vw; top:4vw;
        background:radial-gradient(circle at 60% 40%, #c84bd6, transparent 70%);
        animation:drift2 32s ease-in-out infinite; }
      .blob3{ width:50vw; height:50vw; left:8vw; bottom:-18vw;
        background:radial-gradient(circle at 50% 50%, #ffb33c, transparent 70%);
        animation:drift3 30s ease-in-out infinite; }
      .blob4{ width:36vw; height:36vw; right:2vw; bottom:-6vw;
        background:radial-gradient(circle at 40% 60%, #ff4d6d, transparent 70%);
        animation:drift1 38s ease-in-out infinite reverse; }

      @keyframes drift1{
        0%,100%{ transform:translate(0,0) scale(1); }
        33%{ transform:translate(6vw,4vw) scale(1.12); }
        66%{ transform:translate(-4vw,6vw) scale(0.95); }
      }
      @keyframes drift2{
        0%,100%{ transform:translate(0,0) scale(1); }
        33%{ transform:translate(-6vw,5vw) scale(1.1); }
        66%{ transform:translate(5vw,-3vw) scale(0.92); }
      }
      @keyframes drift3{
        0%,100%{ transform:translate(0,0) scale(1); }
        50%{ transform:translate(4vw,-6vw) scale(1.15); }
      }
      @keyframes fadeUp{
        from{ opacity:0; transform:translateY(10px); }
        to{ opacity:1; transform:translateY(0); }
      }
      @keyframes shine{
        0%{ transform:translateX(-100%); }
        60%,100%{ transform:translateX(220%); }
      }

      input,textarea,button{ font-family:inherit; }
      textarea{ resize:vertical; }
      input[type=date]::-webkit-calendar-picker-indicator{ filter:invert(0.7) sepia(1) saturate(4) hue-rotate(-10deg); cursor:pointer; }
      input:focus, textarea:focus{ outline:2px solid rgba(255,170,90,0.5); outline-offset:1px; }
      button{ cursor:pointer; transition:transform .12s ease, background .2s ease, box-shadow .2s ease, border-color .2s ease; }
      button:active{ transform:scale(0.96); }
      button:disabled{ opacity:0.4; cursor:not-allowed; }

      @media (max-width:640px){
        .blob{ filter:blur(50px); }
      }
      @media (prefers-reduced-motion: reduce){
        .blob{ animation:none !important; }
      }
    `}</style>
  )
}

/* ============================== styles ============================= */
const card = {
  position: 'relative',
  background: 'var(--card)',
  border: '1px solid var(--line)',
  borderRadius: 22,
  padding: '18px 18px 20px',
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  boxShadow: '0 10px 30px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.04)',
  animation: 'fadeUp .5s ease both',
}

const S = {
  root: { position: 'relative', minHeight: '100%', isolation: 'isolate' },

  auroraWrap: { position: 'fixed', inset: 0, zIndex: -1, overflow: 'hidden', background: 'radial-gradient(120% 90% at 50% 0%, #241512 0%, #160f0e 55%, #0e0908 100%)' },
  grain: { position: 'absolute', inset: 0, opacity: 0.5, backgroundImage: 'radial-gradient(rgba(0,0,0,0.4) 1px, transparent 1px)', backgroundSize: '3px 3px', pointerEvents: 'none' },

  page: { maxWidth: 880, margin: '0 auto', padding: '28px 18px 60px' },

  /* header */
  header: { marginBottom: 22 },
  brandRow: { display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 18 },
  logoDot: { width: 12, height: 12, borderRadius: 4, background: 'linear-gradient(135deg, #ffd479, #ff7a3c)', boxShadow: '0 0 14px rgba(255,150,80,0.8)', transform: 'translateY(-2px)' },
  brand: { fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: 30, margin: 0, letterSpacing: '-0.5px' },
  brandSub: { fontFamily: "'Fraunces', serif", fontStyle: 'italic', color: 'var(--muted)', fontSize: 16 },

  dateNav: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, background: 'rgba(46,31,27,0.5)', border: '1px solid var(--line)', borderRadius: 18, padding: '10px 12px', backdropFilter: 'blur(12px)' },
  navBtn: { width: 44, height: 44, borderRadius: 14, border: '1px solid var(--line)', background: 'rgba(255,255,255,0.04)', color: 'var(--text)', fontSize: 24, lineHeight: 1, display: 'grid', placeItems: 'center', flexShrink: 0 },
  dateCenter: { textAlign: 'center', position: 'relative', flex: 1 },
  weekday: { fontFamily: "'Fraunces', serif", fontSize: 18, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 },
  todayPill: { fontFamily: "'Space Grotesk', sans-serif", fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', background: 'rgba(255,160,90,0.18)', color: 'var(--amber)', padding: '2px 7px', borderRadius: 20, border: '1px solid rgba(255,160,90,0.3)' },
  dateMain: { fontSize: 13, color: 'var(--muted)', marginTop: 2 },
  dateInput: { position: 'absolute', inset: 0, opacity: 0, width: '100%', height: '100%', cursor: 'pointer', border: 'none' },
  jumpToday: { marginTop: 10, background: 'none', border: 'none', color: 'var(--amber)', fontSize: 13, padding: 4, display: 'block', marginLeft: 'auto' },

  /* master */
  masterCard: { ...card, marginBottom: 20, padding: '20px 22px 24px', background: 'linear-gradient(135deg, rgba(60,38,30,0.6), rgba(46,31,27,0.5))' },
  masterTop: { display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 16, gap: 12 },
  masterLabel: { fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 600 },
  masterHint: { fontSize: 13, color: 'var(--muted)', marginTop: 4 },
  masterPctWrap: { display: 'flex', alignItems: 'baseline', flexShrink: 0 },
  masterPct: { fontFamily: "'Fraunces', serif", fontSize: 46, fontWeight: 700, lineHeight: 1, background: 'linear-gradient(135deg, #ffd479, #ff7a3c)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' },
  masterPctSign: { fontFamily: "'Fraunces', serif", fontSize: 22, color: 'var(--amber)', marginLeft: 2 },

  /* grid */
  grid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 },

  /* card */
  card,
  cardWide: { gridColumn: '1 / -1' },
  cardDone: { borderColor: 'rgba(255,180,90,0.35)', boxShadow: '0 10px 30px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,170,80,0.15), inset 0 1px 0 rgba(255,255,255,0.05)' },
  cardHead: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, gap: 8 },
  cardTitleWrap: { display: 'flex', alignItems: 'center', gap: 9, minWidth: 0 },
  cardIcon: { fontSize: 20, flexShrink: 0 },
  cardTitle: { fontFamily: "'Fraunces', serif", fontSize: 16, fontWeight: 600, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  cardHeadRight: { display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 },
  cardPct: { fontSize: 13, fontWeight: 600, fontVariantNumeric: 'tabular-nums' },
  removeBtn: { width: 24, height: 24, borderRadius: 8, border: '1px solid var(--line)', background: 'rgba(255,255,255,0.03)', color: 'var(--muted)', fontSize: 16, lineHeight: 1, display: 'grid', placeItems: 'center' },
  cardBody: { marginTop: 14 },

  /* bars */
  barTrack: { width: '100%', background: 'rgba(255,255,255,0.07)', borderRadius: 20, overflow: 'hidden', position: 'relative' },
  barFill: { height: '100%', borderRadius: 20, transition: 'width .6s cubic-bezier(.22,1,.36,1)', position: 'relative', overflow: 'hidden' },
  barShine: { position: 'absolute', inset: 0, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)', transform: 'translateX(-100%)', animation: 'shine 2.6s ease-in-out infinite' },

  /* big toggle */
  bigToggle: { width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderRadius: 16, border: '1px solid var(--line)', background: 'rgba(255,255,255,0.03)', color: 'var(--text)', fontSize: 15, fontWeight: 500 },
  bigToggleOn: { background: 'linear-gradient(135deg, rgba(255,140,80,0.22), rgba(255,180,80,0.15))', borderColor: 'rgba(255,170,90,0.45)' },
  bigToggleLabel: { fontWeight: 600 },
  checkCircle: { width: 28, height: 28, borderRadius: '50%', border: '2px solid rgba(255,170,90,0.4)', display: 'grid', placeItems: 'center', fontSize: 15, color: '#160f0e', flexShrink: 0 },
  checkCircleOn: { background: 'linear-gradient(135deg, #ffd479, #ff7a3c)', borderColor: 'transparent', fontWeight: 700 },

  /* split */
  splitRow: { display: 'flex', gap: 12 },
  split: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '16px 10px', borderRadius: 16, border: '1px solid var(--line)', background: 'rgba(255,255,255,0.03)', color: 'var(--text)' },
  splitOn: { background: 'linear-gradient(135deg, rgba(255,140,80,0.22), rgba(255,180,80,0.13))', borderColor: 'rgba(255,170,90,0.45)' },
  splitSub: { fontSize: 12, color: 'var(--muted)' },
  splitLabel: { fontFamily: "'Fraunces', serif", fontSize: 15, fontWeight: 600 },
  splitDot: { width: 24, height: 24, borderRadius: '50%', border: '2px solid rgba(255,170,90,0.4)', display: 'grid', placeItems: 'center', fontSize: 13, color: '#160f0e', marginTop: 2 },
  splitDotOn: { background: 'linear-gradient(135deg, #ffd479, #ff7a3c)', borderColor: 'transparent', fontWeight: 700 },

  /* counter */
  waterWrap: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  counterBtn: { width: 52, height: 52, borderRadius: 16, border: '1px solid rgba(255,170,90,0.3)', background: 'rgba(255,255,255,0.04)', color: 'var(--amber)', fontSize: 26, lineHeight: 1, display: 'grid', placeItems: 'center', flexShrink: 0 },
  counterMid: { textAlign: 'center', flex: 1 },
  counterNum: { fontFamily: "'Fraunces', serif", fontSize: 34, fontWeight: 700, lineHeight: 1, fontVariantNumeric: 'tabular-nums' },
  counterGoal: { fontSize: 18, color: 'var(--muted)', fontWeight: 500 },
  counterUnit: { fontSize: 12, color: 'var(--muted)', marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.1em' },
  dropsRow: { display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 14, justifyContent: 'center' },
  drop: { fontSize: 16, transition: 'all .3s ease' },

  /* exercise mins */
  minsRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginTop: 12 },
  miniBtn: { padding: '8px 14px', borderRadius: 12, border: '1px solid rgba(255,170,90,0.3)', background: 'rgba(255,255,255,0.04)', color: 'var(--amber)', fontSize: 14, fontWeight: 600 },
  minsMid: { textAlign: 'center' },
  minsNum: { fontFamily: "'Fraunces', serif", fontSize: 24, fontWeight: 700 },
  minsUnit: { fontSize: 12, color: 'var(--muted)', marginLeft: 6 },

  /* mood */
  moodRow: { display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8 },
  moodBtn: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, padding: '12px 4px', borderRadius: 14, border: '1px solid var(--line)', background: 'rgba(255,255,255,0.03)', color: 'var(--muted)' },
  moodBtnActive: { background: 'linear-gradient(135deg, rgba(255,140,80,0.25), rgba(255,180,80,0.15))', borderColor: 'rgba(255,170,90,0.5)', color: 'var(--text)', transform: 'translateY(-3px)' },
  moodEmoji: { fontSize: 26, lineHeight: 1 },
  moodLabel: { fontSize: 10.5, fontWeight: 500 },

  /* todo */
  todoInputRow: { display: 'flex', gap: 8, marginBottom: 12 },
  todoInput: { flex: 1, padding: '12px 14px', borderRadius: 13, border: '1px solid var(--line)', background: 'rgba(0,0,0,0.25)', color: 'var(--text)', fontSize: 14, width: '100%' },
  todoAddBtn: { padding: '0 18px', borderRadius: 13, border: 'none', background: 'linear-gradient(135deg, #ffb84d, #ff7a3c)', color: '#231410', fontWeight: 700, fontSize: 14, flexShrink: 0 },
  todoList: { display: 'flex', flexDirection: 'column', gap: 8 },
  empty: { color: 'var(--muted)', fontSize: 13, padding: '6px 2px', fontStyle: 'italic' },
  todoItem: { display: 'flex', alignItems: 'center', gap: 11, padding: '10px 12px', borderRadius: 13, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--line)' },
  todoCheck: { width: 24, height: 24, borderRadius: 8, border: '2px solid rgba(255,170,90,0.4)', background: 'transparent', color: '#160f0e', fontSize: 13, fontWeight: 700, display: 'grid', placeItems: 'center', flexShrink: 0 },
  todoCheckOn: { background: 'linear-gradient(135deg, #ffd479, #ff7a3c)', borderColor: 'transparent' },
  todoText: { flex: 1, fontSize: 14, wordBreak: 'break-word' },
  todoTextDone: { textDecoration: 'line-through', color: 'var(--muted)' },
  todoDel: { width: 24, height: 24, borderRadius: 8, border: 'none', background: 'transparent', color: 'var(--muted)', fontSize: 18, lineHeight: 1, flexShrink: 0 },

  /* textarea */
  textarea: { width: '100%', padding: '12px 14px', borderRadius: 13, border: '1px solid var(--line)', background: 'rgba(0,0,0,0.25)', color: 'var(--text)', fontSize: 14, lineHeight: 1.5, fontFamily: "'Space Grotesk', sans-serif" },

  /* add custom */
  addCard: { ...card, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, minHeight: 150, border: '1.5px dashed rgba(255,170,90,0.35)', background: 'rgba(46,31,27,0.3)', color: 'var(--text)' },
  addPlus: { width: 48, height: 48, borderRadius: '50%', display: 'grid', placeItems: 'center', fontSize: 28, background: 'linear-gradient(135deg, rgba(255,180,80,0.25), rgba(255,120,60,0.2))', border: '1px solid rgba(255,170,90,0.4)', color: 'var(--amber)' },
  addText: { fontFamily: "'Fraunces', serif", fontSize: 15, fontWeight: 600 },
  addSub: { fontSize: 11.5, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em' },
  addOpenCard: { border: '1px solid rgba(255,170,90,0.4)' },
  typeRow: { display: 'flex', gap: 8, marginTop: 10 },
  typeBtn: { flex: 1, padding: '10px 4px', borderRadius: 12, border: '1px solid var(--line)', background: 'rgba(255,255,255,0.03)', color: 'var(--muted)', fontSize: 12.5, fontWeight: 500 },
  typeBtnOn: { background: 'linear-gradient(135deg, rgba(255,140,80,0.22), rgba(255,180,80,0.13))', borderColor: 'rgba(255,170,90,0.45)', color: 'var(--text)' },
  goalRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, gap: 10 },
  goalLabel: { fontSize: 13, color: 'var(--muted)' },
  goalInput: { width: 80, padding: '8px 12px', borderRadius: 11, border: '1px solid var(--line)', background: 'rgba(0,0,0,0.25)', color: 'var(--text)', fontSize: 14 },
  createBtn: { width: '100%', marginTop: 14, padding: '12px', borderRadius: 13, border: 'none', background: 'linear-gradient(135deg, #ffb84d, #ff7a3c)', color: '#231410', fontWeight: 700, fontSize: 14 },

  footer: { textAlign: 'center', marginTop: 32, color: 'var(--muted)', fontSize: 12 },
}
