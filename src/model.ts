import { z } from 'zod';

export function localDate(d = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
export function asDate(day: string) {
  return new Date(`${day}T12:00:00`);
}
export function addDays(day: string, n: number) {
  const d = asDate(day);
  d.setDate(d.getDate() + n);
  return localDate(d);
}
export function monday(day: string) {
  return addDays(day, -((asDate(day).getDay() + 6) % 7));
}
export function dateRange(start: string, end: string) {
  const result: string[] = [];
  for (let day = start; day <= end; day = addDays(day, 1)) result.push(day);
  return result;
}
export const dateLabel = (
  day: string,
  options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long' },
) => asDate(day).toLocaleDateString('nl-NL', options);
const daySchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine((d) => !isNaN(asDate(d).getTime()) && localDate(asDate(d)) === d, 'Ongeldige datum');
const idSchema = z.string().min(1).max(100);
export const icons = ['leaf', 'book', 'moon', 'walk', 'water', 'phone', 'heart', 'sun'] as const;
export const kindSchema = z.enum(['binary', 'minimum', 'maximum', 'avoid']);
const scheduleSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('daily') }).strict(),
  z
    .object({
      type: z.literal('days'),
      days: z
        .array(z.number().int().min(0).max(6))
        .min(1)
        .max(7)
        .refine((a) => new Set(a).size === a.length),
    })
    .strict(),
  z.object({ type: z.literal('weekly'), count: z.number().int().min(1).max(7) }).strict(),
]);
export const goalSchema = z
  .object({
    effective: daySchema,
    kind: kindSchema,
    target: z.number().finite().min(0).max(100000),
    unit: z.string().trim().min(1).max(30),
    time: z.string().regex(/^(|([01]\d|2[0-3]):[0-5]\d)$/),
    schedule: scheduleSchema,
  })
  .strict()
  .refine((v) => v.kind !== 'minimum' || v.target > 0, 'Een minimum moet groter dan nul zijn');
const habitSchema = z
  .object({
    id: idSchema,
    name: z.string().trim().min(1).max(80),
    icon: z.enum(icons),
    reason: z.string().max(240),
    coping: z.string().max(300),
    createdOn: daySchema,
    state: z.enum(['active', 'paused', 'archived']),
    pauses: z.array(z.object({ from: daySchema, to: daySchema.nullable() }).strict()).max(10000),
    versions: z.array(goalSchema).min(1).max(10000),
  })
  .strict();
const eventSchema = z
  .object({
    id: idSchema,
    amount: z.number().finite().min(-1000000).max(1000000),
    at: z.iso.datetime(),
  })
  .strict();
const logSchema = z
  .object({
    habitId: idSchema,
    date: daySchema,
    snapshot: goalSchema,
    events: z.array(eventSchema).max(10000),
    answer: z.boolean().nullable(),
    closed: z.boolean(),
    time: z.string().regex(/^(|([01]\d|2[0-3]):[0-5]\d)$/),
    updatedAt: z.iso.datetime(),
  })
  .strict();
export const dataSchema = z
  .object({
    schemaVersion: z.literal(1),
    habits: z.array(habitSchema).max(1000),
    logs: z.array(logSchema).max(100000),
    theme: z.enum(['system', 'light', 'dark']),
  })
  .strict()
  .superRefine((data, ctx) => {
    const fail = (message: string) => ctx.addIssue({ code: 'custom', message });
    const ids = new Set(data.habits.map((h) => h.id));
    if (ids.size !== data.habits.length) fail('Dubbele gewoontes');
    const keys = new Set<string>();
    for (const h of data.habits) {
      if (h.versions[0].effective !== h.createdOn) fail('Ontbrekende eerste doelversie');
      if (h.versions.some((v, i) => i > 0 && v.effective <= h.versions[i - 1].effective))
        fail('Doelversies staan niet in volgorde');
      if (h.versions.some((v) => v.kind !== h.versions[0].kind))
        fail('Meetwijze mag niet veranderen');
      if (
        h.pauses.some(
          (p, i) =>
            p.from < h.createdOn ||
            (p.to !== null && p.to <= p.from) ||
            (i > 0 && (h.pauses[i - 1].to === null || p.from < h.pauses[i - 1].to!)),
        )
      )
        fail('Ongeldige pauzes');
      const open = h.pauses.some((p) => p.to === null);
      if ((h.state === 'active') === open) fail('Pauzestatus klopt niet');
    }
    for (const l of data.logs) {
      const h = data.habits.find((h) => h.id === l.habitId);
      if (
        !h ||
        l.date < h.createdOn ||
        l.snapshot.effective > l.date ||
        l.snapshot.kind !== h.versions[0].kind
      )
        fail('Registratie verwijst naar een ongeldige gewoonte of datum');
      const key = `${l.habitId}/${l.date}`;
      if (keys.has(key)) fail('Dubbele dagregistratie');
      keys.add(key);
      if (new Set(l.events.map((e) => e.id)).size !== l.events.length) fail('Dubbele momenten');
      if (total(l) < 0 || total(l) > 1000000) fail('Ongeldig dagtotaal');
      if (l.snapshot.kind === 'binary' && (l.events.length || l.closed))
        fail('Ongeldige ja/nee-registratie');
      if (l.snapshot.kind !== 'binary' && l.answer !== null)
        fail('Ongeldig antwoord bij meetwijze');
      if (
        l.snapshot.kind === 'avoid' &&
        (l.events.some((e) => !Number.isInteger(e.amount)) || (total(l) > 0 && l.closed))
      )
        fail('Een dag met een moment kan niet bevestigd vermeden zijn');
    }
  });
export type Kind = z.infer<typeof kindSchema>;
export type Goal = z.infer<typeof goalSchema>;
export type Habit = z.infer<typeof habitSchema>;
export type Log = z.infer<typeof logSchema>;
export type Data = z.infer<typeof dataSchema>;
export type Status = 'success' | 'failed' | 'unknown' | 'pending' | 'off' | 'future';
export const statusLabels: Record<Status, string> = {
  success: 'Gelukt',
  failed: 'Niet gelukt',
  unknown: 'Onbekend',
  pending: 'Nog open',
  off: 'Niet gepland',
  future: 'Toekomstig',
};
export const emptyData = (): Data => ({ schemaVersion: 1, habits: [], logs: [], theme: 'system' });
export const uid = () => crypto.randomUUID();
export const total = (log?: Pick<Log, 'events'>) =>
  Math.round((log?.events.reduce((sum, event) => sum + event.amount, 0) ?? 0) * 100) / 100;
export function goalAt(h: Habit, day: string): Goal | undefined {
  return h.versions.filter((v) => v.effective <= day).at(-1);
}
export function isAvailable(h: Habit, day: string) {
  return (
    day >= h.createdOn && !h.pauses.some((p) => p.from <= day && (p.to === null || day < p.to))
  );
}
export function isScheduled(h: Habit, day: string) {
  const g = goalAt(h, day);
  return (
    !!g &&
    isAvailable(h, day) &&
    (g.schedule.type !== 'days' || g.schedule.days.includes((asDate(day).getDay() + 6) % 7))
  );
}
export function findLog(data: Data, id: string, day: string) {
  return data.logs.find((l) => l.habitId === id && l.date === day);
}
export function evaluate(h: Habit, day: string, log?: Log, today = localDate()): Status {
  if (!log && !isScheduled(h, day)) return 'off';
  if (day > today) return 'future';
  const empty = day === today ? 'pending' : 'unknown';
  if (!log) return empty;
  const g = log.snapshot;
  if (g.kind === 'binary') return log.answer === null ? empty : log.answer ? 'success' : 'failed';
  const n = total(log);
  if (g.kind === 'avoid') return n > 0 ? 'failed' : log.closed ? 'success' : empty;
  if (g.kind === 'maximum')
    return n > g.target ? 'failed' : log.closed ? 'success' : log.events.length ? 'pending' : empty;
  return !log.events.length
    ? empty
    : n >= g.target
      ? 'success'
      : day < today
        ? 'failed'
        : 'pending';
}
export function goalText(g: Goal) {
  if (g.kind === 'binary') return g.time ? `Richttijd ${g.time}` : 'Eén klein moment';
  if (g.kind === 'avoid') return 'Een dag bewust vermijden';
  return `${g.kind === 'minimum' ? 'Minimaal' : 'Maximaal'} ${g.target} ${g.unit}`;
}
export function scheduleText(g: Goal) {
  const s = g.schedule;
  return s.type === 'daily'
    ? 'Elke dag'
    : s.type === 'weekly'
      ? `${s.count} ${s.count === 1 ? 'dag' : 'dagen'} per week`
      : s.days.map((d) => ['ma', 'di', 'wo', 'do', 'vr', 'za', 'zo'][d]).join(' · ');
}
export function newLog(h: Habit, day: string): Log {
  const goal = goalAt(h, day);
  if (!goal || !isScheduled(h, day) || day > localDate())
    throw new Error('Deze dag is niet beschikbaar om te registreren.');
  return {
    habitId: h.id,
    date: day,
    snapshot: structuredClone(goal),
    events: [],
    answer: null,
    closed: false,
    time: '',
    updatedAt: new Date().toISOString(),
  };
}
export function updateLog(
  data: Data,
  h: Habit,
  day: string,
  change: (log: Log) => Log | null,
): Data {
  const before = findLog(data, h.id, day) ?? newLog(h, day);
  const after = change(structuredClone(before));
  return {
    ...data,
    logs: [
      ...data.logs.filter((l) => !(l.habitId === h.id && l.date === day)),
      ...(after ? [{ ...after, updatedAt: new Date().toISOString() }] : []),
    ],
  };
}
export function addAmount(log: Log, amount: number): Log {
  if (!Number.isFinite(amount) || total(log) + amount < 0 || total(log) + amount > 1000000)
    throw new Error('Gebruik een geldig aantal tussen 0 en 1.000.000.');
  return {
    ...log,
    closed: log.snapshot.kind === 'avoid' && total(log) + amount > 0 ? false : log.closed,
    events: [...log.events, { id: uid(), amount, at: new Date().toISOString() }],
  };
}
export function changeState(h: Habit, state: Habit['state'], day = localDate()): Habit {
  const pauses = h.pauses.map((p) => ({ ...p }));
  const open = pauses.find((p) => p.to === null);
  if (state === 'active' && open) {
    if (open.from === day) pauses.splice(pauses.indexOf(open), 1);
    else open.to = day;
  } else if (state !== 'active' && !open) pauses.push({ from: day, to: null });
  return { ...h, state, pauses };
}
export function weekSummary(data: Data, h: Habit, day: string, today = localDate()) {
  const start = monday(day);
  const end = addDays(start, 6);
  const days = dateRange(start, end).filter((d) => isScheduled(h, d) || !!findLog(data, h.id, d));
  const g = days.length
    ? (findLog(data, h.id, days[0])?.snapshot ?? goalAt(h, days[0]))
    : goalAt(h, day);
  const target = g?.schedule.type === 'weekly' ? g.schedule.count : 0;
  const success = days.filter(
    (d) => d <= today && evaluate(h, d, findLog(data, h.id, d), today) === 'success',
  ).length;
  const unknown = days.filter(
    (d) => d <= today && evaluate(h, d, findLog(data, h.id, d), today) === 'unknown',
  ).length;
  return {
    start,
    end,
    target,
    success,
    unknown,
    eligible: days.length,
    reached: target > 0 && success >= target,
  };
}
export function parseImport(text: string): Data {
  if (text.length > 10 * 1024 * 1024) throw new Error('Het bestand is groter dan 10 MB.');
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error('Dit bestand bevat geen geldige JSON.');
  }
  const result = dataSchema.safeParse(parsed);
  if (!result.success)
    throw new Error(
      'Dit is geen geldig Ritme-bestand (versie 1). Je huidige gegevens zijn behouden.',
    );
  return result.data;
}
