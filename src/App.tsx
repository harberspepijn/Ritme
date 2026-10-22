import { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowUpRight,
  Archive,
  BarChart3,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Leaf,
  Pause,
  Play,
  Plus,
  Settings2,
  ShieldCheck,
  SlidersHorizontal,
  Sun,
  Trash2,
  X,
} from 'lucide-react';
import {
  addAmount,
  addDays,
  asDate,
  changeState,
  dateLabel,
  emptyData,
  evaluate,
  findLog,
  goalAt,
  goalText,
  isScheduled,
  localDate,
  monday,
  newLog,
  scheduleText,
  statusLabels,
  updateLog,
  type Data,
  type Habit,
  type Log,
} from './model';
import { loadData, saveData } from './storage';
import { HabitIcon, Mark } from './components/Icon';
import HabitForm, { examples, type Seed } from './components/HabitForm';
import HabitRow from './components/HabitRow';
import LogEditor from './components/LogEditor';
import Insights from './components/Insights';
import Modal from './components/Modal';
import Settings from './components/Settings';

type Tab = 'today' | 'habits' | 'insights';
type Overlay =
  | { type: 'form'; habit?: Habit; seed?: Seed }
  | { type: 'log'; habit: Habit; day: string; log: Log }
  | { type: 'settings' }
  | { type: 'detail'; id: string }
  | { type: 'delete'; habit: Habit }
  | null;
type Toast = { text: string; undo?: { before: Data; after: Data } };
const tabs = [
  { id: 'today', label: 'Vandaag', icon: Sun },
  { id: 'habits', label: 'Gewoontes', icon: Leaf },
  { id: 'insights', label: 'Inzicht', icon: BarChart3 },
] as const;

function Botanical() {
  return (
    <svg className="botanical" viewBox="0 0 260 280" fill="none" aria-hidden="true">
      <circle cx="130" cy="134" r="98" stroke="currentColor" opacity=".13" />
      <circle cx="130" cy="134" r="75" stroke="currentColor" opacity=".1" />
      <path
        d="M130 235C130 194 123 157 135 109C141 86 150 65 169 46"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M130 192C89 192 61 163 66 130C102 130 129 154 130 192Z"
        fill="currentColor"
        fillOpacity=".12"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M130 165C168 165 195 141 191 109C159 111 136 133 130 165Z"
        fill="currentColor"
        fillOpacity=".2"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M139 103C111 95 99 72 108 47C135 57 147 78 139 103Z"
        fill="currentColor"
        fillOpacity=".1"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M153 72C179 76 199 62 201 40C174 35 158 48 153 72Z"
        fill="currentColor"
        fillOpacity=".15"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M79 145L129 190M178 122L132 163M114 61L139 103M156 69L190 46"
        stroke="currentColor"
        strokeOpacity=".45"
      />
      <path d="M107 237H151" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="66" cy="75" r="3" fill="currentColor" fillOpacity=".3" />
      <circle cx="208" cy="194" r="2" fill="currentColor" fillOpacity=".3" />
    </svg>
  );
}

export default function App() {
  const [data, setData] = useState<Data | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [tab, setTab] = useState<Tab>('today');
  const [today, setToday] = useState(localDate());
  const [day, setDay] = useState(localDate());
  const [overlay, setOverlay] = useState<Overlay>(null);
  const [toast, setToast] = useState<Toast | null>(null);
  const [error, setError] = useState('');
  const [pending, setPending] = useState(0);
  const [habitFilter, setHabitFilter] = useState<'active' | 'archived'>('active');
  const [online, setOnline] = useState(navigator.onLine);
  const channel = useRef<BroadcastChannel | null>(null);
  const queue = useRef<Promise<unknown>>(Promise.resolve());
  const currentToday = useRef(today);
  async function read() {
    try {
      setData(await loadData());
      setLoadError(false);
    } catch {
      setLoadError(true);
    }
  }
  useEffect(() => {
    void read();
    channel.current = new BroadcastChannel('ritme-changes');
    channel.current.onmessage = () => {
      setToast(null);
      setOverlay(null);
      void read();
    };
    return () => {
      channel.current?.close();
    };
  }, []);
  useEffect(() => {
    const refresh = () => {
      const next = localDate();
      if (next !== currentToday.current) {
        const previous = currentToday.current;
        currentToday.current = next;
        setToday(next);
        setDay((d) => (d === previous ? next : d));
      }
      setOnline(navigator.onLine);
    };
    const timer = window.setInterval(refresh, 30000);
    window.addEventListener('focus', refresh);
    window.addEventListener('online', refresh);
    window.addEventListener('offline', refresh);
    return () => {
      clearInterval(timer);
      window.removeEventListener('focus', refresh);
      window.removeEventListener('online', refresh);
      window.removeEventListener('offline', refresh);
    };
  }, []);
  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const apply = () => {
      document.documentElement.dataset.theme =
        data?.theme === 'dark' || (data?.theme === 'system' && media.matches) ? 'dark' : 'light';
    };
    apply();
    media.addEventListener('change', apply);
    return () => media.removeEventListener('change', apply);
  }, [data?.theme]);
  useEffect(() => {
    if (!toast) return;
    const timeout = setTimeout(() => setToast(null), toast.undo ? 10000 : 4500);
    return () => clearTimeout(timeout);
  }, [toast]);

  async function commit(update: (data: Data) => Data, message?: string, undo = false) {
    setPending((p) => p + 1);
    setError('');
    const work = async () => {
      const run = async () => {
        const before = await loadData();
        const after = update(before);
        await saveData(after);
        setData(after);
        channel.current?.postMessage('updated');
        setToast(message ? { text: message, undo: undo ? { before, after } : undefined } : null);
      };
      if (navigator.locks) await navigator.locks.request('ritme-write', run);
      else await run();
    };
    const operation = queue.current.then(work, work);
    queue.current = operation.catch(() => {});
    try {
      await operation;
    } catch (e) {
      setError(
        e instanceof Error && e.message.startsWith('Deze registratie')
          ? e.message
          : 'Bewaren is niet gelukt. Je vorige gegevens zijn behouden. Controleer of deze browser lokale opslag toestaat.',
      );
      throw e;
    } finally {
      setPending((p) => p - 1);
    }
  }
  function action(update: (data: Data) => Data, message: string, undo = false) {
    void commit(update, message, undo).catch(() => {});
  }
  function openLog(habit: Habit, date: string) {
    if (!data || date > today) return;
    try {
      setOverlay({
        type: 'log',
        habit,
        day: date,
        log: findLog(data, habit.id, date) ?? newLog(habit, date),
      });
    } catch {
      setToast({ text: 'Deze gewoonte was op deze dag niet gepland.' });
    }
  }
  function quick(habit: Habit, amount?: number) {
    action(
      (d) => {
        const current = d.habits.find((h) => h.id === habit.id);
        if (!current) throw new Error('Deze registratie bestaat niet meer.');
        return updateLog(d, current, day, (log) =>
          log.snapshot.kind === 'binary'
            ? { ...log, answer: true }
            : log.snapshot.kind === 'minimum'
              ? addAmount(log, amount ?? (log.snapshot.unit === 'minuten' ? 5 : 1))
              : log,
        );
      },
      amount ? `+${amount} vastgelegd voor ${habit.name}.` : `${habit.name}: gelukt.`,
      true,
    );
  }
  async function saveHabit(habit: Habit) {
    await commit(
      (d) => ({
        ...d,
        habits: d.habits.some((h) => h.id === habit.id)
          ? d.habits.map((h) => (h.id === habit.id ? habit : h))
          : [...d.habits, habit],
      }),
      'Je gewoonte is bewaard.',
    );
    setOverlay(null);
  }
  const setHabitState = (h: Habit, state: Habit['state']) => {
    action(
      (d) => ({ ...d, habits: d.habits.map((x) => (x.id === h.id ? changeState(x, state) : x)) }),
      state === 'active'
        ? 'Je gewoonte is weer actief.'
        : state === 'paused'
          ? 'Even pauze. Je historie blijft bewaard.'
          : 'Gearchiveerd. Je historie blijft bewaard.',
      true,
    );
    setOverlay(null);
  };
  if (loadError)
    return (
      <div className="startup">
        <Mark />
        <h1>Je ritme is even niet bereikbaar.</h1>
        <p>
          Lokale opslag kon niet worden gelezen. Je gegevens zijn niet overschreven. Controleer de
          browserinstellingen en probeer opnieuw.
        </p>
        <button className="button primary" onClick={read}>
          Opnieuw proberen
        </button>
      </div>
    );
  if (!data)
    return (
      <div className="startup">
        <Mark />
        <p>Een moment voor je ritme…</p>
      </div>
    );

  const active = data.habits.filter((h) => h.state !== 'archived');
  const scheduled = data.habits.filter((h) => isScheduled(h, day) || !!findLog(data, h.id, day));
  const daily = scheduled.filter(
    (h) => (findLog(data, h.id, day)?.snapshot ?? goalAt(h, day))?.schedule.type !== 'weekly',
  );
  const flexible = scheduled.filter(
    (h) => (findLog(data, h.id, day)?.snapshot ?? goalAt(h, day))?.schedule.type === 'weekly',
  );
  const complete = daily.filter((h) =>
    ['success', 'failed'].includes(evaluate(h, day, findLog(data, h.id, day), today)),
  ).length;
  const weekStart = monday(day);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const detailHabit =
    overlay?.type === 'detail' ? data.habits.find((h) => h.id === overlay.id) : undefined;
  const yesterday = addDays(today, -1);
  const yesterdayOpen = data.habits.filter(
    (h) =>
      isScheduled(h, yesterday) &&
      goalAt(h, yesterday)?.schedule.type !== 'weekly' &&
      ['unknown', 'pending'].includes(
        evaluate(h, yesterday, findLog(data, h.id, yesterday), today),
      ),
  ).length;
  const currentMonth = dateLabel(day, { month: 'long', year: 'numeric' });

  return (
    <div className="app-shell">
      <header className="topbar">
        <button
          className="brand"
          aria-label="Ritme, naar vandaag"
          onClick={() => {
            setTab('today');
            setDay(today);
          }}
        >
          <Mark />
          <span>
            ritme<span className="brand-dot">.</span>
          </span>
        </button>
        <nav className="desktop-nav" aria-label="Hoofdnavigatie">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={tab === id ? 'active' : ''}
              aria-current={tab === id ? 'page' : undefined}
              onClick={() => setTab(id)}
            >
              <Icon size={17} />
              {label}
            </button>
          ))}
        </nav>
        <div className="topbar-end">
          <span className="local-indicator">
            <i />
            {online ? 'Alleen van jou' : 'Je bent offline'}
          </span>
          <button
            className="icon-button settings-button"
            aria-label="Instellingen"
            onClick={() => setOverlay({ type: 'settings' })}
          >
            <Settings2 size={20} />
          </button>
        </div>
      </header>
      <main
        id="main"
        className={`main-content page-${tab} ${data.habits.length ? 'has-habits' : ''}`}
      >
        <div className="page-heading">
          <div>
            <p className="eyebrow">
              {tab === 'today'
                ? `${dateLabel(day, { weekday: 'long' })} · ${dateLabel(day, { day: 'numeric', month: 'long' })}`
                : tab === 'habits'
                  ? 'RUIMTE VOOR WAT TELT'
                  : 'KIJK EENS HOEVER JE BENT'}
            </p>
            <h1>
              {tab === 'today' && data.habits.length > 0 ? (
                day === today ? (
                  'Vandaag'
                ) : (
                  'Jouw dag'
                )
              ) : tab === 'today' ? (
                <>
                  Kleine stappen.
                  <br />
                  <em>Jouw ritme.</em>
                </>
              ) : data.habits.length > 0 ? (
                tab === 'habits' ? (
                  'Jouw gewoontes'
                ) : (
                  'Jouw inzicht'
                )
              ) : tab === 'habits' ? (
                <>
                  Wat je aandacht
                  <br />
                  <em>wilt geven.</em>
                </>
              ) : (
                <>
                  Vooruitgang op
                  <br />
                  <em>jouw tempo.</em>
                </>
              )}
            </h1>
            <p className="page-intro">
              {tab === 'today'
                ? data.habits.length
                  ? daily.length
                    ? `${complete} van ${daily.length} afgerond${flexible.length ? ` · ${flexible.length} met een weekdoel` : ''}`
                    : flexible.length
                      ? 'Deze week: kies jouw momenten.'
                      : 'Geen gewoontes gepland voor deze dag.'
                  : 'Je hoeft niet alles te doen. Begin met iets kleins.'
                : tab === 'habits'
                  ? 'Meer van wat goed voelt. Minder van wat je afleidt.'
                  : 'Geen perfecte reeks nodig. Elke bewuste stap telt.'}
            </p>
          </div>
          <button
            className="button primary heading-add"
            onClick={() => setOverlay({ type: 'form' })}
          >
            <Plus size={18} />
            Nieuwe gewoonte
          </button>
        </div>
        {error && (
          <div className="error-banner" role="alert">
            <p>{error}</p>
            <button
              className="icon-button"
              aria-label="Melding sluiten"
              onClick={() => setError('')}
            >
              <X size={18} />
            </button>
          </div>
        )}
        {tab === 'today' && (
          <div className="today-layout">
            <section className="today-primary" aria-label="Dagelijkse gewoontes">
              <div className="week-header">
                <div className="month-label">
                  <CalendarDays size={16} />
                  <span>{currentMonth}</span>
                </div>
                <div className="week-controls">
                  {day !== today && (
                    <button className="text-button" onClick={() => setDay(today)}>
                      Vandaag
                    </button>
                  )}
                  <label className="date-jump">
                    <span className="sr-only">Kies een datum</span>
                    <input
                      type="date"
                      value={day}
                      max={today}
                      min="2000-01-01"
                      onChange={(e) => {
                        if (e.target.value && e.target.value <= today) setDay(e.target.value);
                      }}
                    />
                  </label>
                  <button
                    className="icon-button"
                    aria-label="Vorige week"
                    onClick={() => setDay(addDays(day, -7))}
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    className="icon-button"
                    aria-label="Volgende week"
                    disabled={weekStart >= monday(today)}
                    onClick={() => setDay(addDays(day, 7) > today ? today : addDays(day, 7))}
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
              <div className="week-strip">
                {weekDays.map((date) => {
                  const logs = data.logs.filter((l) => l.date === date);
                  return (
                    <button
                      key={date}
                      className={`${date === day ? 'selected' : ''} ${date === today ? 'today' : ''}`}
                      aria-label={dateLabel(date, {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                      })}
                      aria-pressed={date === day}
                      disabled={date > today}
                      onClick={() => setDay(date)}
                    >
                      <span>{dateLabel(date, { weekday: 'short' }).replace('.', '')}</span>
                      <strong>{asDate(date).getDate()}</strong>
                      <i className={logs.length ? 'has-log' : ''} />
                    </button>
                  );
                })}
              </div>
              <div className="list-heading daily-list-heading">
                <h2>
                  {day === today
                    ? 'Vandaag'
                    : dateLabel(day, { weekday: 'long', day: 'numeric', month: 'short' })}
                </h2>
                {daily.length > 0 && (
                  <span className="completion-count">
                    <span>{complete}</span> van {daily.length} afgerond
                  </span>
                )}
                {data.habits.length === 0 && (
                  <span className="muted small-text">Een nieuw begin</span>
                )}
              </div>
              {daily.length > 0 && (
                <div
                  className="summary-progress"
                  role="progressbar"
                  aria-label="Afgeronde dagelijkse gewoontes"
                  aria-valuenow={complete}
                  aria-valuemax={daily.length}
                >
                  <i style={{ width: `${(complete / daily.length) * 100}%` }} />
                </div>
              )}
              <div className="habit-list">
                {daily.map((h) => (
                  <HabitRow
                    key={h.id}
                    habit={h}
                    data={data}
                    day={day}
                    today={today}
                    onOpen={() => openLog(h, day)}
                    onQuick={(amount) => quick(h, amount)}
                    disabled={pending > 0}
                  />
                ))}
              </div>
              {scheduled.length === 0 && (
                <div className="empty-state">
                  <div className="empty-symbol">
                    <Leaf size={30} strokeWidth={1.3} />
                    <span />
                    <i />
                  </div>
                  <h3>
                    {data.habits.length === 0
                      ? 'Hier begint jouw ritme.'
                      : 'Een beetje ruimte vandaag.'}
                  </h3>
                  <p>
                    {data.habits.length === 0
                      ? 'Een paar minuten lezen. Even naar buiten. Kies één kleine gewoonte die bij je past.'
                      : 'Er staan geen gewoontes gepland voor deze dag. Rust hoort er ook bij.'}
                  </p>
                  <button className="button primary" onClick={() => setOverlay({ type: 'form' })}>
                    <Plus size={17} />
                    {data.habits.length === 0 ? 'Mijn eerste gewoonte' : 'Een gewoonte toevoegen'}
                  </button>
                  {data.habits.length === 0 && (
                    <span className="empty-hint">Klein beginnen is ook beginnen.</span>
                  )}
                </div>
              )}
              {flexible.length > 0 && (
                <>
                  <div className="list-heading flexible-heading">
                    <div>
                      <h2>Deze week</h2>
                      <span className="field-note">Een weekdoel. Jij kiest de dagen.</span>
                    </div>
                    <span className="week-tag">VRIJE PLANNING</span>
                  </div>
                  <div className="habit-list">
                    {flexible.map((h) => (
                      <HabitRow
                        key={h.id}
                        habit={h}
                        data={data}
                        day={day}
                        today={today}
                        onOpen={() => openLog(h, day)}
                        onQuick={(amount) => quick(h, amount)}
                        disabled={pending > 0}
                      />
                    ))}
                  </div>
                </>
              )}
              {scheduled.length > 0 && (
                <button className="add-row" onClick={() => setOverlay({ type: 'form' })}>
                  <Plus size={18} />
                  Een gewoonte toevoegen
                </button>
              )}
              {day === today && yesterdayOpen > 0 && (
                <button className="yesterday-note" onClick={() => setDay(yesterday)}>
                  <span className="yesterday-icon">
                    <ArrowLeft size={18} />
                  </span>
                  <span>
                    <strong>Nog even terug naar gisteren?</strong>
                    <small>
                      {yesterdayOpen} {yesterdayOpen === 1 ? 'gewoonte staat' : 'gewoontes staan'}{' '}
                      nog niet bevestigd. Je kunt ze rustig bijwerken.
                    </small>
                  </span>
                  <ChevronRight size={18} />
                </button>
              )}
              <div className="today-footer">
                <ShieldCheck size={14} />
                <span>Jouw gegevens blijven in deze browser.</span>
                <button className="text-button" onClick={() => setOverlay({ type: 'settings' })}>
                  Meer weten
                </button>
              </div>
            </section>
            {data.habits.length === 0 && (
              <aside className="today-aside">
                <div className="reflection">
                  <span className="eyebrow">OP JOUW TEMPO</span>
                  <Botanical />
                  <h2>
                    Groei zit in
                    <br />
                    het kleine.
                  </h2>
                  <p>
                    Niet elke dag hoeft perfect.
                    <br />
                    Er even bij stilstaan telt ook.
                  </p>
                  <div className="reflection-line" />
                  <span className="reflection-caption">EEN BEETJE AANDACHT, ELKE DAG.</span>
                </div>
                <div className="suggestions">
                  <div className="aside-title">
                    <h3>Een idee om mee te beginnen</h3>
                    <ArrowUpRight size={16} />
                  </div>
                  {examples.map((seed) => (
                    <button
                      key={seed.name}
                      className="suggestion"
                      onClick={() => setOverlay({ type: 'form', seed })}
                    >
                      <HabitIcon name={seed.icon} size={18} />
                      <span>{seed.name}</span>
                      <Plus size={16} />
                    </button>
                  ))}
                </div>
              </aside>
            )}
          </div>
        )}
        {tab === 'habits' && (
          <section className="habits-page">
            <div className="habits-toolbar">
              <div className="segmented">
                <button
                  className={habitFilter === 'active' ? 'selected' : ''}
                  onClick={() => setHabitFilter('active')}
                >
                  Mijn gewoontes <span>{active.length}</span>
                </button>
                <button
                  className={habitFilter === 'archived' ? 'selected' : ''}
                  onClick={() => setHabitFilter('archived')}
                >
                  Archief <span>{data.habits.length - active.length}</span>
                </button>
              </div>
              <span className="muted small-text">Een gewoonte groeit met je mee.</span>
            </div>
            <div className="manage-list">
              {data.habits
                .filter((h) =>
                  habitFilter === 'archived' ? h.state === 'archived' : h.state !== 'archived',
                )
                .map((h) => {
                  const g = goalAt(h, today) ?? h.versions[0];
                  return (
                    <button
                      key={h.id}
                      className="manage-row"
                      onClick={() => setOverlay({ type: 'detail', id: h.id })}
                    >
                      <span className={`habit-icon icon-${h.icon}`}>
                        <HabitIcon name={h.icon} />
                      </span>
                      <span className="row-copy">
                        <strong>{h.name}</strong>
                        <span className="row-goal">
                          {goalText(g)} · {scheduleText(g)}
                        </span>
                        {h.versions.at(-1)!.effective > today && (
                          <span className="field-note">
                            Nieuw doel gepland vanaf {dateLabel(h.versions.at(-1)!.effective)}
                          </span>
                        )}
                      </span>
                      <span className={`state-pill ${h.state}`}>
                        {h.state === 'paused'
                          ? 'Gepauzeerd'
                          : h.state === 'archived'
                            ? 'Gearchiveerd'
                            : 'Actief'}
                      </span>
                      <ChevronRight size={18} />
                    </button>
                  );
                })}
            </div>
            {!data.habits.some((h) =>
              habitFilter === 'archived' ? h.state === 'archived' : h.state !== 'archived',
            ) && (
              <div className="empty-state">
                <Leaf size={28} />
                <h3>
                  {habitFilter === 'archived'
                    ? 'Je archief is nog leeg.'
                    : 'Wat wil jij aandacht geven?'}
                </h3>
                <p>
                  {habitFilter === 'archived'
                    ? 'Gewoontes die je archiveert, bewaren hier hun verhaal.'
                    : 'Begin met iets haalbaars. Je kunt het later altijd aanpassen.'}
                </p>
                {habitFilter === 'active' && (
                  <button className="button primary" onClick={() => setOverlay({ type: 'form' })}>
                    <Plus size={18} />
                    Mijn eerste gewoonte
                  </button>
                )}
              </div>
            )}
            <div className="gentle-note">
              <CircleHelp size={18} />
              <p>
                Een pauze nodig? Pauzeer een gewoonte zonder je historie te verliezen. Je kunt
                altijd weer verder.
              </p>
            </div>
          </section>
        )}
        {tab === 'insights' &&
          (data.habits.length ? (
            <Insights data={data} today={today} onDay={openLog} />
          ) : (
            <div className="empty-state insight-empty">
              <BarChart3 size={30} strokeWidth={1.3} />
              <h3>Je verhaal moet nog beginnen.</h3>
              <p>
                Als je iets registreert, zie je hier je eigen vooruitgang. Zonder verzonnen cijfers
                of perfecte verwachtingen.
              </p>
              <button className="button primary" onClick={() => setOverlay({ type: 'form' })}>
                <Plus size={18} />
                Een gewoonte toevoegen
              </button>
            </div>
          ))}
        <footer className="page-footer">
          <span>Ritme vinden kost tijd. Neem de jouwe.</span>
          <Mark />
        </footer>
      </main>
      <nav className="mobile-nav" aria-label="Mobiele navigatie">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            className={tab === id ? 'active' : ''}
            aria-current={tab === id ? 'page' : undefined}
            onClick={() => {
              setTab(id);
              window.scrollTo({ top: 0 });
            }}
          >
            <Icon size={21} strokeWidth={1.7} />
            <span>{label}</span>
          </button>
        ))}
      </nav>
      {toast && (
        <div className="toast" role="status">
          <Check size={17} />
          <span>{toast.text}</span>
          {toast.undo && (
            <button
              onClick={() => {
                const previous = toast.undo!;
                action((d) => {
                  if (JSON.stringify(d) !== JSON.stringify(previous.after))
                    throw new Error(
                      'Deze registratie is inmiddels gewijzigd. Open haar om te corrigeren.',
                    );
                  return previous.before;
                }, 'Ongedaan gemaakt.');
              }}
            >
              Ongedaan maken
            </button>
          )}
          <button
            className="toast-close"
            aria-label="Feedback sluiten"
            onClick={() => setToast(null)}
          >
            <X size={16} />
          </button>
        </div>
      )}
      {overlay?.type === 'form' && (
        <HabitForm
          habit={overlay.habit}
          seed={overlay.seed}
          onSave={saveHabit}
          onClose={() => setOverlay(null)}
        />
      )}
      {overlay?.type === 'log' && (
        <LogEditor
          habit={overlay.habit}
          initial={overlay.log}
          day={overlay.day}
          onClose={() => setOverlay(null)}
          onSave={async (log) => {
            await commit(
              (d) => {
                const current = d.habits.find((h) => h.id === overlay.habit.id);
                if (!current) throw new Error('Deze registratie bestaat niet meer.');
                return updateLog(d, current, overlay.day, () => log);
              },
              log ? 'Je moment is bewaard.' : 'Registratie leeggemaakt.',
              true,
            );
            setOverlay(null);
          }}
        />
      )}
      {overlay?.type === 'settings' && (
        <Settings
          data={data}
          onTheme={(theme) => action((d) => ({ ...d, theme }), 'Weergave aangepast.')}
          onImport={async (imported) => {
            await commit(() => imported);
          }}
          onClear={async () => {
            await commit(() => emptyData(), 'Je hebt weer een leeg begin.');
          }}
          onClose={() => setOverlay(null)}
        />
      )}
      {overlay?.type === 'detail' && detailHabit && (
        <Modal
          wide
          title={detailHabit.name}
          subtitle={`Sinds ${dateLabel(detailHabit.createdOn)} · ${scheduleText(goalAt(detailHabit, today) ?? detailHabit.versions[0])}`}
          onClose={() => setOverlay(null)}
        >
          <div className="habit-detail">
            <div className="detail-actions">
              <button
                className="button secondary"
                onClick={() => setOverlay({ type: 'form', habit: detailHabit })}
              >
                <SlidersHorizontal size={16} />
                Aanpassen
              </button>
              <button
                className="button secondary"
                onClick={() =>
                  setHabitState(detailHabit, detailHabit.state === 'active' ? 'paused' : 'active')
                }
              >
                {detailHabit.state === 'active' ? <Pause size={16} /> : <Play size={16} />}
                {detailHabit.state === 'active' ? 'Pauzeren' : 'Hervatten'}
              </button>
              {detailHabit.state !== 'archived' && (
                <button
                  className="button secondary"
                  onClick={() => setHabitState(detailHabit, 'archived')}
                >
                  <Archive size={16} />
                  Archiveren
                </button>
              )}
            </div>
            {detailHabit.reason && <p className="personal-note">“{detailHabit.reason}”</p>}
            <Insights onlyHabit={detailHabit} data={data} today={today} onDay={openLog} />
            <h3>Recente registraties</h3>
            <div className="recent-logs">
              {data.logs
                .filter((l) => l.habitId === detailHabit.id)
                .sort((a, b) => b.date.localeCompare(a.date))
                .slice(0, 10)
                .map((log) => (
                  <button key={log.date} onClick={() => openLog(detailHabit, log.date)}>
                    <span>
                      {dateLabel(log.date)}
                      <small>
                        Bijgewerkt{' '}
                        {new Date(log.updatedAt).toLocaleString('nl-NL', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </small>
                    </span>
                    <span>{statusLabels[evaluate(detailHabit, log.date, log, today)]}</span>
                    <ChevronRight size={16} />
                  </button>
                ))}
              {!data.logs.some((l) => l.habitId === detailHabit.id) && (
                <p className="muted">Nog geen registraties. Er is alle ruimte om te beginnen.</p>
              )}
            </div>
            <button
              className="text-button danger delete-habit"
              onClick={() => setOverlay({ type: 'delete', habit: detailHabit })}
            >
              <Trash2 size={16} />
              Gewoonte definitief verwijderen
            </button>
          </div>
        </Modal>
      )}
      {overlay?.type === 'delete' && (
        <Modal title="Deze gewoonte verwijderen?" onClose={() => setOverlay(null)}>
          <div className="confirm-content">
            <p>
              ‘{overlay.habit.name}’ en alle bijbehorende registraties worden definitief verwijderd.
              Met archiveren kun je de historie bewaren.
            </p>
            <div className="modal-footer">
              <button
                className="button secondary"
                onClick={() => setOverlay({ type: 'detail', id: overlay.habit.id })}
              >
                Annuleren
              </button>
              <button
                className="button danger-button"
                disabled={pending > 0}
                onClick={async () => {
                  try {
                    await commit(
                      (d) => ({
                        ...d,
                        habits: d.habits.filter((h) => h.id !== overlay.habit.id),
                        logs: d.logs.filter((l) => l.habitId !== overlay.habit.id),
                      }),
                      'Gewoonte verwijderd.',
                    );
                    setOverlay(null);
                  } catch {
                    /* The page shows the storage error. */
                  }
                }}
              >
                Definitief verwijderen
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
