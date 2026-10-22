import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowDownRight,
  ArrowUpRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Minus,
} from 'lucide-react';
import {
  addDays,
  asDate,
  dateLabel,
  dateRange,
  evaluate,
  findLog,
  goalAt,
  isScheduled,
  localDate,
  monday,
  total,
  weekSummary,
  statusLabels,
  type Data,
  type Habit,
  type Status,
} from '../model';
import { HabitIcon } from './Icon';
import NumericChart from './NumericChart';
import { numericSeries } from '../insights';
export function Calendar({
  data,
  habit,
  start,
  end,
  today,
  onDay,
}: {
  data: Data;
  habit: Habit;
  start: string;
  end: string;
  today: string;
  onDay: (day: string) => void;
}) {
  const days = dateRange(start, end);
  return (
    <div className="calendar">
      <div className="calendar-labels">
        {['M', 'D', 'W', 'D', 'V', 'Z', 'Z'].map((d, i) => (
          <span key={i}>{d}</span>
        ))}
      </div>
      <div className="calendar-grid">
        {Array.from({ length: (asDate(start).getDay() + 6) % 7 }, (_, i) => (
          <span key={`pad-${i}`} />
        ))}
        {days.map((day) => {
          const s = evaluate(habit, day, findLog(data, habit.id, day), today);
          return (
            <button
              key={day}
              className={`calendar-day ${s} ${day === today ? 'is-today' : ''}`}
              disabled={s === 'off' || s === 'future'}
              aria-label={`${dateLabel(day)}: ${statusLabels[s]}`}
              onClick={() => onDay(day)}
            >
              <span>{asDate(day).getDate()}</span>
              <i>
                {s === 'success' ? (
                  <Check size={10} />
                ) : s === 'failed' ? (
                  <Minus size={10} />
                ) : s === 'unknown' ? (
                  '·'
                ) : s === 'future' ? (
                  '›'
                ) : s === 'pending' ? (
                  '◦'
                ) : (
                  ''
                )}
              </i>
            </button>
          );
        })}
      </div>
    </div>
  );
}
export function Legend() {
  return (
    <div className="legend">
      {(['success', 'failed', 'unknown', 'pending', 'future', 'off'] as Status[]).map((s) => (
        <span key={s}>
          <i className={s}>
            {s === 'success'
              ? '✓'
              : s === 'failed'
                ? '−'
                : s === 'pending'
                  ? '◦'
                  : s === 'future'
                    ? '›'
                    : s === 'unknown'
                      ? '·'
                      : ''}
          </i>
          {statusLabels[s]}
        </span>
      ))}
    </div>
  );
}
export default function Insights({
  data,
  today,
  onDay,
  onlyHabit,
}: {
  data: Data;
  today: string;
  onDay: (habit: Habit, day: string) => void;
  onlyHabit?: Habit;
}) {
  const [period, setPeriod] = useState<'week' | 'month'>('week');
  const [anchor, setAnchor] = useState(today);
  const [selected, setSelected] = useState('all');
  const lastToday = useRef(today);
  useEffect(() => {
    const previous = lastToday.current;
    setAnchor((a) => (a === previous ? today : a));
    lastToday.current = today;
  }, [today]);
  const start = period === 'week' ? monday(anchor) : `${anchor.slice(0, 7)}-01`;
  const end =
    period === 'week'
      ? addDays(start, 6)
      : localDate(new Date(asDate(start).getFullYear(), asDate(start).getMonth() + 1, 0, 12));
  const habits = onlyHabit
    ? [onlyHabit]
    : data.habits.filter((h) => selected === 'all' || h.id === selected);
  const knownHabits = useMemo(
    () => data.habits.filter((h) => h.createdOn <= end),
    [data.habits, end],
  );
  function move(direction: number) {
    if (period === 'week') setAnchor(addDays(anchor, direction * 7));
    else {
      const d = asDate(start);
      d.setMonth(d.getMonth() + direction);
      setAnchor(localDate(d));
    }
  }
  return (
    <div className="insights-content">
      <div className="insights-toolbar">
        <div className="segmented">
          <button className={period === 'week' ? 'selected' : ''} onClick={() => setPeriod('week')}>
            Week
          </button>
          <button
            className={period === 'month' ? 'selected' : ''}
            onClick={() => setPeriod('month')}
          >
            Maand
          </button>
        </div>
        {!onlyHabit && (
          <select
            aria-label="Filter op gewoonte"
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
          >
            <option value="all">Alle gewoontes</option>
            {data.habits.map((h) => (
              <option value={h.id} key={h.id}>
                {h.name}
              </option>
            ))}
          </select>
        )}
      </div>
      <div className="period-selector">
        <button className="icon-button" aria-label="Vorige periode" onClick={() => move(-1)}>
          <ChevronLeft size={18} />
        </button>
        <strong>
          {period === 'week'
            ? `${dateLabel(start, { day: 'numeric', month: 'short' })} — ${dateLabel(end, { day: 'numeric', month: 'short', year: 'numeric' })}`
            : dateLabel(start, { month: 'long', year: 'numeric' })}
        </strong>
        <button
          className="icon-button"
          aria-label="Volgende periode"
          disabled={end >= today}
          onClick={() => move(1)}
        >
          <ChevronRight size={18} />
        </button>
      </div>
      {knownHabits.length === 0 && (
        <p className="empty-small">
          In deze periode waren er nog geen gewoontes. Je begint waar je bent.
        </p>
      )}
      <div className="insight-grid">
        {habits
          .filter((h) => h.createdOn <= end)
          .map((h) => {
            const days = dateRange(start, end > today ? today : end);
            const scheduled = days.filter((d) => isScheduled(h, d) || !!findLog(data, h.id, d));
            const states = scheduled.map((d) => evaluate(h, d, findLog(data, h.id, d), today));
            const successes = states.filter((s) => s === 'success').length;
            const unknown = states.filter((s) => s === 'unknown').length;
            const pending = states.filter((s) => s === 'pending').length;
            const goal = goalAt(h, end) ?? h.versions[0];
            const weekly = goal.schedule.type === 'weekly';
            const weeks = [...new Set(days.map(monday))]
              .map((w) => weekSummary(data, h, w, today))
              .filter((w) => w.eligible > 0 && w.target > 0);
            const logs = scheduled
              .map((d) => findLog(data, h.id, d))
              .filter((l) => l !== undefined);
            const numeric = numericSeries(data, h, start, end, today).filter(
              (p) => p.value !== null,
            );
            const average = numeric.length
              ? Math.round((numeric.reduce((n, p) => n + p.value!, 0) / numeric.length) * 10) / 10
              : null;
            const sameUnit = numeric.every((p) => p.goal?.unit === goal.unit);
            return (
              <article className="insight-card" key={h.id}>
                <header>
                  <span className="habit-icon small">
                    <HabitIcon name={h.icon} size={19} />
                  </span>
                  <h3>{h.name}</h3>
                  {goal.kind === 'maximum' || goal.kind === 'avoid' ? (
                    <ArrowDownRight size={18} className="muted" />
                  ) : (
                    <ArrowUpRight size={18} className="muted" />
                  )}
                </header>
                <div className="insight-metric">
                  {weekly && period === 'week' ? (
                    <>
                      <strong>
                        {weeks[0]?.success ?? 0}
                        <span>
                          {' '}
                          /{' '}
                          {weeks[0]?.target ??
                            (goal.schedule.type === 'weekly' ? goal.schedule.count : 0)}
                        </span>
                      </strong>
                      <span>
                        behaalde {(weeks[0]?.success ?? 0) === 1 ? 'dag' : 'dagen'} deze week
                      </span>
                    </>
                  ) : weekly ? (
                    <>
                      <strong>
                        {weeks.filter((w) => w.reached).length}
                        <span> / {weeks.length}</span>
                      </strong>
                      <span>weekdoelen bevestigd · weken die deze maand raken</span>
                    </>
                  ) : (
                    <>
                      <strong>
                        {successes}
                        <span> / {scheduled.length}</span>
                      </strong>
                      <span>geplande {scheduled.length === 1 ? 'dag' : 'dagen'} gelukt</span>
                    </>
                  )}
                </div>
                <p className="insight-context">
                  {unknown} {unknown === 1 ? 'dag onbekend' : 'dagen onbekend'}
                  {pending > 0 && ` · ${pending} nog open`}
                  {average !== null && sameUnit && (
                    <>
                      <br />
                      Gemiddeld {average.toLocaleString('nl-NL')} {goal.unit} · {numeric.length}{' '}
                      geregistreerde {numeric.length === 1 ? 'dag' : 'dagen'}
                    </>
                  )}
                  {average !== null && !sameUnit && (
                    <>
                      <br />
                      Eenheid gewijzigd; geen gecombineerd gemiddelde.
                    </>
                  )}
                  {goal.kind === 'avoid' && (
                    <>
                      <br />
                      {logs.reduce((sum, l) => sum + total(l), 0)}{' '}
                      {logs.reduce((sum, l) => sum + total(l), 0) === 1 ? 'moment' : 'momenten'}{' '}
                      geregistreerd
                    </>
                  )}
                </p>
                {weekly && (
                  <p className="field-note">
                    Je kiest zelf je dagen. Lege dagen zijn geen dagelijkse verplichtingen.
                    {weeks.some((w) => w.eligible < w.target) &&
                      ' Deze gedeeltelijke week heeft minder beschikbare dagen dan je weekdoel.'}
                  </p>
                )}
                {(goal.kind === 'minimum' || goal.kind === 'maximum') && (
                  <NumericChart
                    data={data}
                    habit={h}
                    start={start}
                    end={end}
                    today={today}
                    period={period}
                  />
                )}
                <Calendar
                  data={data}
                  habit={h}
                  start={start}
                  end={end}
                  today={today}
                  onDay={(day) => onDay(h, day)}
                />
              </article>
            );
          })}
      </div>
      <Legend />
      <p className="insight-footnote">
        Alleen wat je zelf registreert, telt mee. Vandaag zonder invoer is nog open. Maximum- en
        vermijddoelen vereisen je bevestiging. Een verstreken geplande dag zonder invoer is
        onbekend. Toekomstige dagen tellen nog niet mee. Gemiddelden gebruiken alleen geregistreerde
        dagen.
      </p>
    </div>
  );
}
