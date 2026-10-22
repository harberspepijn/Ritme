import { useId } from 'react';
import { Check, ChevronRight, Plus } from 'lucide-react';
import {
  evaluate,
  findLog,
  goalAt,
  goalText,
  statusLabels,
  total,
  weekSummary,
  type Data,
  type Habit,
} from '../model';
import { HabitIcon } from './Icon';
export default function HabitRow({
  habit,
  data,
  day,
  today,
  onOpen,
  onQuick,
  disabled,
}: {
  habit: Habit;
  data: Data;
  day: string;
  today: string;
  onOpen: () => void;
  onQuick: (amount?: number) => void;
  disabled: boolean;
}) {
  const description = useId();
  const log = findLog(data, habit.id, day);
  const goal = log?.snapshot ?? goalAt(habit, day)!;
  const status = evaluate(habit, day, log, today);
  const numeric = goal.kind === 'minimum' || goal.kind === 'maximum';
  const registered = !!log && (log.events.length > 0 || (goal.kind !== 'minimum' && log.closed));
  const n = total(log);
  const weekly = goal.schedule.type === 'weekly' ? weekSummary(data, habit, day, today) : null;
  const steps = goal.unit === 'minuten' ? [5, 15] : [1, 5];
  return (
    <article className={`habit-row ${status}`}>
      <button
        className="row-main"
        onClick={onOpen}
        aria-label={`${habit.name} bekijken en aanpassen`}
        aria-describedby={description}
      >
        <span className={`habit-icon icon-${habit.icon}`}>
          <HabitIcon name={habit.icon} />
        </span>
        <span className="row-copy" id={description}>
          <strong>{habit.name}</strong>
          <span className="row-goal">
            {numeric ? (
              <>
                <span className="sr-only">{goalText(goal)}. </span>
                <span className="row-value" key={log?.updatedAt}>
                  {registered ? n : '—'} / {goal.target} {goal.unit}
                </span>{' '}
                <span>{goal.kind === 'minimum' ? 'min.' : 'max.'}</span>
              </>
            ) : goal.kind === 'avoid' && registered ? (
              `${n} ${n === 1 ? 'moment' : 'momenten'} · doel: vermijden`
            ) : (
              goalText(goal)
            )}
            {weekly && ` · ${weekly.success}/${weekly.target} deze week`}
          </span>
          <span className={`row-status ${status}`}>
            {status === 'success' && <Check size={13} />}
            {statusLabels[status]}
            {numeric && <span className="row-hint"> · Totaal aanpassen</span>}
            {goal.kind === 'avoid' && (
              <span className="row-hint">
                {' '}
                · {registered ? `${n} ${n === 1 ? 'moment' : 'momenten'}` : 'Nog niet bevestigd'}
              </span>
            )}
          </span>
        </span>
      </button>
      <div className="row-actions">
        {goal.kind === 'minimum' ? (
          steps.map((step) => (
            <button
              key={step}
              className="quick-button"
              disabled={disabled}
              onClick={() => onQuick(step)}
              aria-label={`${habit.name}: ${step} toevoegen`}
            >
              <Plus size={14} />
              <span>{step}</span>
            </button>
          ))
        ) : goal.kind === 'binary' ? (
          <button
            className={`check-button ${status === 'success' ? 'checked' : ''}`}
            disabled={disabled}
            onClick={status === 'success' ? onOpen : () => onQuick()}
            aria-label={`${habit.name}: ${status === 'success' ? 'gelukt, aanpassen' : 'gelukt'}`}
          >
            <Check size={20} />
          </button>
        ) : (
          <button
            className="icon-button detail-arrow"
            onClick={onOpen}
            aria-label={`${habit.name} registreren`}
          >
            <ChevronRight size={22} />
          </button>
        )}
      </div>
    </article>
  );
}
