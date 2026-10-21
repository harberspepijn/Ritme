import { Check, ChevronRight, Plus } from 'lucide-react';
import {
  evaluate,
  findLog,
  goalAt,
  goalText,
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
  onQuick: () => void;
  disabled: boolean;
}) {
  const log = findLog(data, habit.id, day);
  const goal = log?.snapshot ?? goalAt(habit, day)!;
  const status = evaluate(habit, day, log, today);
  const numeric = goal.kind === 'minimum' || goal.kind === 'maximum';
  const n = total(log);
  const weekly = goal.schedule.type === 'weekly' ? weekSummary(data, habit, day, today) : null;
  let caption =
    status === 'success'
      ? 'Gelukt'
      : status === 'failed'
        ? goal.kind === 'avoid'
          ? `${n} ${n === 1 ? 'moment' : 'momenten'}`
          : goal.kind === 'maximum'
            ? 'Boven je doel'
            : 'Niet gelukt'
        : status === 'pending'
          ? goal.kind === 'maximum'
            ? 'Voorlopig binnen doel'
            : 'Onderweg'
          : 'Nog open';
  if (numeric && log?.events.length)
    caption = `${n} / ${goal.target} ${goal.unit} · ${caption.toLowerCase()}`;
  return (
    <article className={`habit-row ${status}`}>
      <button
        className="row-main"
        onClick={onOpen}
        aria-label={`${habit.name} bekijken en aanpassen`}
      >
        <span className={`habit-icon icon-${habit.icon}`}>
          <HabitIcon name={habit.icon} />
        </span>
        <span className="row-copy">
          <strong>{habit.name}</strong>
          <span className="row-goal">
            {goalText(goal)}
            {weekly && ` · ${weekly.success}/${weekly.target} deze week`}
          </span>
          <span className={`row-status ${status}`}>
            {status === 'success' && <Check size={12} />}
            {caption}
          </span>
        </span>
      </button>
      <div className="row-actions">
        {status === 'success' ? (
          <button
            className="check-button checked"
            onClick={onOpen}
            aria-label={`${habit.name}: gelukt, aanpassen`}
          >
            <Check size={20} />
          </button>
        ) : goal.kind === 'binary' ? (
          <button
            className="check-button"
            disabled={disabled}
            onClick={onQuick}
            aria-label={`${habit.name}: gelukt`}
          >
            <Check size={20} />
          </button>
        ) : goal.kind === 'minimum' ? (
          <button
            className="quick-button"
            disabled={disabled}
            onClick={onQuick}
            aria-label={`${habit.name}: ${goal.unit === 'minuten' ? 5 : 1} toevoegen`}
          >
            <Plus size={15} />
            <span>{goal.unit === 'minuten' ? 5 : 1}</span>
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
