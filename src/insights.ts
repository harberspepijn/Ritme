import {
  addDays,
  asDate,
  dateRange,
  findLog,
  goalAt,
  isScheduled,
  localDate,
  total,
  type Data,
  type Goal,
  type Habit,
} from './model';

export type NumericPoint = { day: string; value: number | null; goal: Goal | undefined };
// An explicit zero is a measurement; an empty draft or missing log is not.
export function numericSeries(
  data: Data,
  habit: Habit,
  start: string,
  end: string,
  today: string,
): NumericPoint[] {
  return dateRange(start, end).map((day) => {
    const log = findLog(data, habit.id, day);
    const goal = log?.snapshot ?? (isScheduled(habit, day) ? goalAt(habit, day) : undefined);
    const numeric = goal?.kind === 'minimum' || goal?.kind === 'maximum';
    const recorded =
      log && (log.events.length > 0 || (log.snapshot.kind === 'maximum' && log.closed));
    return {
      day,
      goal: numeric ? goal : undefined,
      value: day <= today && numeric && recorded ? total(log) : null,
    };
  });
}
export function comparisonRanges(
  start: string,
  end: string,
  today: string,
  period: 'week' | 'month',
) {
  const completedEnd = end < today ? end : addDays(today, -1);
  const previousStart =
    period === 'week'
      ? addDays(start, -7)
      : localDate(new Date(asDate(start).getFullYear(), asDate(start).getMonth() - 1, 1, 12));
  const available = dateRange(start, completedEnd).length;
  const previousLength = dateRange(previousStart, addDays(start, -1)).length;
  // Same number of completed calendar days, also across unequal month lengths.
  const length = Math.min(available, previousLength);
  return {
    start,
    end: addDays(start, length - 1),
    previousStart,
    previousEnd: addDays(previousStart, length - 1),
  };
}
export function compareNumeric(
  data: Data,
  habit: Habit,
  start: string,
  end: string,
  today: string,
  period: 'week' | 'month',
) {
  const ranges = comparisonRanges(start, end, today, period);
  const current = numericSeries(data, habit, ranges.start, ranges.end, today).filter((p) => p.goal);
  const previous = numericSeries(
    data,
    habit,
    ranges.previousStart,
    ranges.previousEnd,
    today,
  ).filter((p) => p.goal);
  const currentValues = current.filter((p) => p.value !== null);
  const previousValues = previous.filter((p) => p.value !== null);
  const all = [...current, ...previous];
  const signature = (goal: Goal) =>
    JSON.stringify([goal.kind, goal.unit, goal.target, goal.schedule]);
  const comparable =
    all.length > 0 && all.every((p) => signature(p.goal!) === signature(all[0].goal!));
  const enough =
    currentValues.length >= 3 &&
    previousValues.length >= 3 &&
    currentValues.length >= current.length / 2 &&
    previousValues.length >= previous.length / 2;
  const mean = (points: NumericPoint[]) =>
    points.reduce((sum, p) => sum + p.value!, 0) / points.length;
  return {
    ...ranges,
    currentCount: currentValues.length,
    previousCount: previousValues.length,
    reason:
      !comparable && all.length > 0 ? ('changed' as const) : !enough ? ('sparse' as const) : null,
    delta:
      comparable && enough
        ? Math.round((mean(currentValues) - mean(previousValues)) * 10) / 10
        : null,
    unit: all[0]?.goal?.unit ?? '',
  };
}
