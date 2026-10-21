import { useState } from 'react';
import { Check, Minus, Plus, RotateCcw } from 'lucide-react';
import Modal from './Modal';
import { addAmount, dateLabel, evaluate, goalText, total, type Habit, type Log } from '../model';
import { HabitIcon } from './Icon';
export default function LogEditor({
  habit,
  initial,
  day,
  onSave,
  onClose,
}: {
  habit: Habit;
  initial: Log;
  day: string;
  onSave: (log: Log | null) => Promise<void>;
  onClose: () => void;
}) {
  const [log, setLog] = useState(structuredClone(initial));
  const [value, setValue] = useState(String(total(initial)));
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const g = log.snapshot;
  const status = evaluate(habit, day, log);
  function amount(n: number) {
    try {
      const next = addAmount(log, n);
      setLog(next);
      setValue(String(total(next)));
      setError('');
    } catch (e) {
      setError((e as Error).message);
    }
  }
  async function save(clear = false) {
    setSaving(true);
    setError('');
    try {
      let next = log;
      if (!clear && (g.kind === 'minimum' || g.kind === 'maximum')) {
        if (
          value.trim() === '' ||
          !Number.isFinite(Number(value)) ||
          Number(value) < 0 ||
          Number(value) > 1000000
        )
          throw new Error('Vul een geldig dagtotaal in.');
        const delta = Number(value) - total(log);
        if (delta !== 0 || !log.events.length) next = addAmount(log, delta);
      }
      await onSave(clear ? null : next);
    } catch (e) {
      setError((e as Error).message || 'Bewaren is niet gelukt.');
      setSaving(false);
    }
  }
  return (
    <Modal
      title={habit.name}
      subtitle={dateLabel(day, { weekday: 'long', day: 'numeric', month: 'long' })}
      onClose={onClose}
    >
      <div className="log-editor">
        <div className="log-goal">
          <span className="habit-icon">
            <HabitIcon name={habit.icon} />
          </span>
          <div>
            <strong>{goalText(g)}</strong>
            <span className="muted">Een eerlijk moment voor jezelf.</span>
          </div>
        </div>
        {habit.reason && <p className="personal-note">“{habit.reason}”</p>}
        {g.kind === 'binary' && (
          <>
            <div className="binary-options">
              <button
                className={log.answer === true ? 'chosen' : ''}
                aria-pressed={log.answer === true}
                onClick={() => setLog({ ...log, answer: true })}
              >
                <Check />
                Gelukt
              </button>
              <button
                className={log.answer === false ? 'chosen soft' : ''}
                aria-pressed={log.answer === false}
                onClick={() => setLog({ ...log, answer: false })}
              >
                <Minus />
                Niet gelukt
              </button>
            </div>
            {g.time && (
              <label>
                Werkelijk tijdstip <span className="optional">optioneel</span>
                <input
                  type="time"
                  value={log.time}
                  onChange={(e) => setLog({ ...log, time: e.target.value })}
                />
                <span className="field-note">
                  Dit tijdstip hoort bij de gekozen dag, ook na middernacht. Jouw keuze hierboven
                  bepaalt het resultaat.
                </span>
              </label>
            )}
          </>
        )}
        {(g.kind === 'minimum' || g.kind === 'maximum') && (
          <>
            <label>
              Totaal in {g.unit}
              <div className="number-control">
                <button
                  className="icon-button"
                  disabled={Number(value) <= 0}
                  aria-label="Eén minder"
                  onClick={() => {
                    const n = Math.max(0, Number(value) - 1);
                    setValue(String(n));
                  }}
                >
                  <Minus size={20} />
                </button>
                <input
                  type="number"
                  inputMode="decimal"
                  min="0"
                  max="1000000"
                  step="0.01"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                />
                <button
                  className="icon-button"
                  aria-label="Eén meer"
                  onClick={() => setValue(String(Math.min(1000000, Number(value) + 1)))}
                >
                  <Plus size={20} />
                </button>
              </div>
            </label>
            <div className="quick-amounts">
              {(g.unit === 'minuten' ? [5, 10, 15] : [1, 2, 5]).map((n) => (
                <button
                  className="button secondary"
                  key={n}
                  onClick={() => {
                    const base = Number(value);
                    if (Number.isFinite(base)) setValue(String(Math.min(1000000, base + n)));
                  }}
                >
                  + {n} {g.unit}
                </button>
              ))}
            </div>
            {g.kind === 'maximum' && (
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={log.closed}
                  onChange={(e) => setLog({ ...log, closed: e.target.checked })}
                />
                <span>
                  Deze dag is afgerond
                  <small>Pas dan telt een totaal binnen je grens als gelukt.</small>
                </span>
              </label>
            )}
            {g.kind === 'maximum' && Number(value) > g.target && (
              <p className="info-note">
                Je zit boven je doel. Afronden verandert dat niet. Morgen is er weer ruimte.
              </p>
            )}
          </>
        )}
        {g.kind === 'avoid' && (
          <>
            <div className="avoid-count">
              <strong>{total(log)}</strong>
              <span>geregistreerde {total(log) === 1 ? 'moment' : 'momenten'}</span>
            </div>
            <div className="binary-options">
              <button onClick={() => amount(1)}>
                <Plus size={22} />
                Moment registreren
              </button>
              <button
                disabled={total(log) > 0}
                className={log.closed ? 'chosen' : ''}
                aria-pressed={log.closed}
                onClick={() => setLog({ ...log, closed: !log.closed })}
              >
                <Check size={22} />
                Dag vermeden
              </button>
            </div>
            {total(log) > 0 ? (
              <>
                <p className="info-note">
                  Een moment zegt niet alles over je dag. Je hebt het bewust opgemerkt.
                </p>
                <button className="text-button" onClick={() => amount(-1)}>
                  <RotateCcw size={15} />
                  Laatste moment corrigeren (−1)
                </button>
              </>
            ) : (
              <p className="field-note">
                Bevestig alleen als de dag voorbij is. Zonder bevestiging blijft deze dag onbekend.
              </p>
            )}
          </>
        )}
        {habit.coping && (
          <div className="coping">
            <span className="eyebrow">ALS HET LASTIG WORDT</span>
            <p>{habit.coping}</p>
          </div>
        )}
        {log.events.length > 0 && (
          <details className="events">
            <summary>
              {log.events.length} {log.events.length === 1 ? 'registratie' : 'registraties'} en
              correcties
            </summary>
            <ul>
              {log.events
                .slice(-12)
                .reverse()
                .map((e) => (
                  <li key={e.id}>
                    <span>
                      {new Date(e.at).toLocaleTimeString('nl-NL', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    <strong>
                      {e.amount >= 0 ? '+' : ''}
                      {e.amount} {g.kind === 'avoid' ? 'moment(en)' : g.unit}
                    </strong>
                  </li>
                ))}
            </ul>
          </details>
        )}
        {status === 'success' && (
          <p className="success-message">
            <Check size={16} />
            Deze registratie is gelukt.
          </p>
        )}
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        <footer className="modal-footer">
          <button className="text-button" disabled={saving} onClick={() => save(true)}>
            <RotateCcw size={16} />
            Leegmaken
          </button>
          <button className="button primary" disabled={saving} onClick={() => save()}>
            <Check size={18} />
            {saving ? 'Bewaren…' : 'Bewaren'}
          </button>
        </footer>
      </div>
    </Modal>
  );
}
