import { useState, type FormEvent } from 'react';
import { ArrowUpRight, Check, Minus, Plus } from 'lucide-react';
import {
  addDays,
  goalSchema,
  icons,
  localDate,
  monday,
  uid,
  type Goal,
  type Habit,
  type Kind,
} from '../model';
import { HabitIcon } from './Icon';
import Modal from './Modal';
export type Seed = { name: string; icon: Habit['icon']; kind: Kind; target: number; unit: string };
export const examples: Seed[] = [
  { name: 'Even lezen', icon: 'book', kind: 'minimum', target: 20, unit: 'minuten' },
  { name: 'Een frisse neus', icon: 'walk', kind: 'minimum', target: 15, unit: 'minuten' },
  { name: 'Op tijd naar bed', icon: 'moon', kind: 'binary', target: 1, unit: 'keer' },
];
const labels: Record<Habit['icon'], string> = {
  leaf: 'Plant',
  book: 'Boek',
  moon: 'Maan',
  walk: 'Wandelen',
  water: 'Water',
  phone: 'Telefoon',
  heart: 'Hart',
  sun: 'Zon',
};
export default function HabitForm({
  habit,
  seed,
  onSave,
  onClose,
}: {
  habit?: Habit;
  seed?: Seed;
  onSave: (habit: Habit) => Promise<void>;
  onClose: () => void;
}) {
  const latest = habit?.versions.at(-1);
  const [direction, setDirection] = useState(
    latest?.kind === 'maximum' || latest?.kind === 'avoid' ? 'reduce' : 'build',
  );
  const [kind, setKind] = useState<Kind>(latest?.kind ?? seed?.kind ?? 'binary');
  const [name, setName] = useState(habit?.name ?? seed?.name ?? '');
  const [icon, setIcon] = useState<Habit['icon']>(habit?.icon ?? seed?.icon ?? 'leaf');
  const [target, setTarget] = useState(String(latest?.target ?? seed?.target ?? 20));
  const [unit, setUnit] = useState(latest?.unit ?? seed?.unit ?? 'minuten');
  const [time, setTime] = useState(latest?.time ?? (seed?.icon === 'moon' ? '21:15' : ''));
  const [schedule, setSchedule] = useState<Goal['schedule']['type']>(
    latest?.schedule.type ?? 'daily',
  );
  const [days, setDays] = useState(
    latest?.schedule.type === 'days' ? latest.schedule.days : [0, 1, 2, 3, 4],
  );
  const [count, setCount] = useState(
    latest?.schedule.type === 'weekly' ? latest.schedule.count : 3,
  );
  const [reason, setReason] = useState(habit?.reason ?? '');
  const [coping, setCoping] = useState(habit?.coping ?? '');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const effective = habit
    ? schedule === 'weekly' || latest?.schedule.type === 'weekly'
      ? addDays(monday(localDate()), 7)
      : addDays(localDate(), 1)
    : localDate();
  async function submit(e: FormEvent) {
    e.preventDefault();
    setError('');
    const goal = goalSchema.safeParse({
      effective,
      kind,
      target: kind === 'minimum' || kind === 'maximum' ? Number(target) : 1,
      unit: unit.trim() || 'keer',
      time,
      schedule:
        schedule === 'days'
          ? { type: schedule, days: [...days].sort() }
          : schedule === 'weekly'
            ? { type: schedule, count }
            : { type: schedule },
    });
    if (
      !name.trim() ||
      !goal.success ||
      ((kind === 'minimum' || kind === 'maximum') && !target.trim())
    ) {
      setError('Vul een naam, geldig doel en minstens één geplande dag in.');
      return;
    }
    const newHabit: Habit = habit
      ? {
          ...habit,
          name: name.trim(),
          icon,
          reason,
          coping,
          versions: [...habit.versions.filter((v) => v.effective < effective), goal.data],
        }
      : {
          id: uid(),
          name: name.trim(),
          icon,
          reason,
          coping,
          createdOn: localDate(),
          state: 'active',
          pauses: [],
          versions: [goal.data],
        };
    setSaving(true);
    try {
      await onSave(newHabit);
    } catch {
      setError('Opslaan lukt niet. Probeer het opnieuw.');
      setSaving(false);
    }
  }
  return (
    <Modal
      title={habit ? 'Gewoonte aanpassen' : 'Een klein begin.'}
      subtitle={
        habit
          ? 'Laat je gewoonte met je meegroeien.'
          : 'Wat wil je wat vaker — of juist minder — doen?'
      }
      onClose={onClose}
    >
      <form onSubmit={submit} className="habit-form">
        {!habit && (
          <div className="segmented direction">
            <button
              type="button"
              className={direction === 'build' ? 'selected' : ''}
              onClick={() => {
                setDirection('build');
                setKind('binary');
              }}
            >
              <Plus size={17} /> Opbouwen
            </button>
            <button
              type="button"
              className={direction === 'reduce' ? 'selected' : ''}
              onClick={() => {
                setDirection('reduce');
                setKind('maximum');
              }}
            >
              <Minus size={17} /> Verminderen
            </button>
          </div>
        )}
        <label>
          Naam van je gewoonte
          <input
            data-initial-focus
            name="habit-name"
            placeholder="Bijvoorbeeld: een boek lezen"
            value={name}
            maxLength={80}
            required
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <div className="form-pair">
          <label>
            Meetwijze
            <select
              value={kind}
              disabled={!!habit}
              onChange={(e) => setKind(e.target.value as Kind)}
            >
              {(direction === 'build'
                ? [
                    ['binary', 'Ja / nee'],
                    ['minimum', 'Een minimum halen'],
                  ]
                : [
                    ['maximum', 'Onder een maximum blijven'],
                    ['avoid', 'Bewust vermijden'],
                  ]
              ).map(([value, label]) => (
                <option value={value} key={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          {(kind === 'minimum' || kind === 'maximum') && (
            <label>
              Doel per dag
              <input
                type="number"
                inputMode="decimal"
                min={kind === 'minimum' ? 0.01 : 0}
                max={100000}
                step="0.01"
                required
                value={target}
                onChange={(e) => setTarget(e.target.value)}
              />
            </label>
          )}
        </div>
        {(kind === 'minimum' || kind === 'maximum') && (
          <label>
            Eenheid
            <input
              list="units"
              value={unit}
              maxLength={30}
              required
              onChange={(e) => setUnit(e.target.value)}
            />
            <datalist id="units">
              <option value="minuten" />
              <option value="keren" />
              <option value="glazen" />
              <option value="pagina’s" />
            </datalist>
          </label>
        )}
        {kind === 'binary' && (
          <label>
            Gewenst tijdstip <span className="optional">optioneel</span>
            <input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
            <span className="field-note">
              Een richttijd, geen melding. Je geeft zelf aan of het gelukt is, ook na middernacht.
            </span>
          </label>
        )}
        {kind === 'maximum' && (
          <p className="info-note">Je rondt de dag zelf af. Tot die tijd is je totaal voorlopig.</p>
        )}
        {kind === 'avoid' && (
          <p className="info-note">
            Bevestig een dag zonder momenten, of registreer een moment. Een lege dag blijft
            onbekend.
          </p>
        )}
        <label>
          Wanneer?
          <select
            value={schedule}
            onChange={(e) => setSchedule(e.target.value as Goal['schedule']['type'])}
          >
            <option value="daily">Elke dag</option>
            <option value="days">Op vaste weekdagen</option>
            <option value="weekly">Een aantal dagen per week</option>
          </select>
        </label>
        {schedule === 'days' && (
          <div className="day-picker" aria-label="Geplande weekdagen">
            {['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo'].map((d, i) => (
              <button
                key={d}
                type="button"
                aria-pressed={days.includes(i)}
                onClick={() =>
                  setDays(days.includes(i) ? days.filter((n) => n !== i) : [...days, i])
                }
              >
                {d}
              </button>
            ))}
          </div>
        )}
        {schedule === 'weekly' && (
          <label>
            Dagen per kalenderweek
            <div className="frequency">
              <button
                type="button"
                className="icon-button"
                disabled={count <= 1}
                onClick={() => setCount(count - 1)}
                aria-label="Minder dagen"
              >
                <Minus size={17} />
              </button>
              <strong>{count}</strong>
              <button
                type="button"
                className="icon-button"
                disabled={count >= 7}
                onClick={() => setCount(count + 1)}
                aria-label="Meer dagen"
              >
                <Plus size={17} />
              </button>
              <span className="muted">Jij kiest de dagen.</span>
            </div>
            <span className="field-note">Maandag t/m zondag. Elke behaalde dag telt één keer.</span>
          </label>
        )}
        <fieldset className="icon-picker">
          <legend>Pictogram</legend>
          <div>
            {icons.map((i) => (
              <button
                key={i}
                type="button"
                aria-label={labels[i]}
                aria-pressed={icon === i}
                onClick={() => setIcon(i)}
              >
                <HabitIcon name={i} />
              </button>
            ))}
          </div>
        </fieldset>
        <details className="optional-fields">
          <summary>
            Maak het persoonlijk{' '}
            <span>
              optioneel <ArrowUpRight size={14} />
            </span>
          </summary>
          <label>
            Waarom wil je dit?
            <textarea
              rows={2}
              value={reason}
              maxLength={240}
              placeholder="Ik wil meer ruimte in mijn hoofd."
              onChange={(e) => setReason(e.target.value)}
            />
          </label>
          <label>
            Als het lastig wordt, dan…
            <textarea
              rows={2}
              value={coping}
              maxLength={300}
              placeholder="Leg ik mijn telefoon weg en lees ik vijf minuten."
              onChange={(e) => setCoping(e.target.value)}
            />
          </label>
        </details>
        {habit && (
          <p className="info-note">
            Doel en planning gelden vanaf{' '}
            {effective === addDays(localDate(), 1) ? 'morgen' : 'volgende maandag'}. Eerdere
            registraties behouden hun doel. Naam en toelichting veranderen direct.
          </p>
        )}
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        <footer className="modal-footer">
          <button type="button" className="button secondary" onClick={onClose}>
            Annuleren
          </button>
          <button type="submit" className="button primary" disabled={saving}>
            <Check size={18} />
            {saving ? 'Opslaan…' : habit ? 'Wijzigingen bewaren' : 'Gewoonte toevoegen'}
          </button>
        </footer>
      </form>
    </Modal>
  );
}
