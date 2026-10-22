import { describe, expect, it } from 'vitest';
import { compareNumeric, comparisonRanges, numericSeries } from '../src/insights';
import { dateRange, emptyData, evaluate, type Data, type Habit, type Log } from '../src/model';
const habit: Habit = {
  id: 'screen',
  name: 'Schermtijd',
  icon: 'phone',
  reason: '',
  coping: '',
  createdOn: '2026-10-01',
  state: 'active',
  pauses: [],
  versions: [
    {
      effective: '2026-10-01',
      kind: 'maximum',
      target: 120,
      unit: 'minuten',
      time: '',
      schedule: { type: 'daily' },
    },
  ],
};
function log(day: string, amount?: number, closed = false): Log {
  return {
    habitId: habit.id,
    date: day,
    snapshot: structuredClone(habit.versions[0]),
    answer: null,
    closed,
    time: '',
    updatedAt: `${day}T10:00:00.000Z`,
    events: amount === undefined ? [] : [{ id: day, amount, at: `${day}T10:00:00.000Z` }],
  };
}
const data = (logs: Log[] = [], h = habit): Data => ({ ...emptyData(), habits: [h], logs });

describe('dagstatus rond datumwisseling', () => {
  it('laat vrije en gepauzeerde dagen niet als toekomst of onbekend meetellen', () => {
    const h = structuredClone(habit);
    h.versions[0].schedule = { type: 'days', days: [0] };
    expect(evaluate(h, '2026-10-20', undefined, '2026-10-19')).toBe('off');
    expect(evaluate(h, '2026-10-26', undefined, '2026-10-19')).toBe('future');
    h.pauses = [{ from: '2026-10-26', to: null }];
    h.state = 'paused';
    expect(evaluate(h, '2026-10-26', undefined, '2026-10-19')).toBe('off');
  });
  it('maakt een voorlopig maximum bij middernacht niet alsnog geslaagd', () => {
    const l = log('2026-10-21', 60);
    expect(evaluate(habit, l.date, l, '2026-10-21')).toBe('pending');
    expect(evaluate(habit, l.date, l, '2026-10-22')).toBe('pending');
    expect(evaluate(habit, l.date, { ...l, closed: true }, '2026-10-22')).toBe('success');
    expect(evaluate(habit, '2026-10-22', undefined, '2026-10-22')).toBe('pending');
  });
});
describe('echte numerieke waarden', () => {
  it('onderscheidt gaten, lege concepten, expliciete nul en toekomst', () => {
    const series = numericSeries(
      data([log('2026-10-19', 0), log('2026-10-20'), log('2026-10-22', 25), log('2026-10-23', 30)]),
      habit,
      '2026-10-19',
      '2026-10-25',
      '2026-10-22',
    );
    expect(series.map((p) => p.value)).toEqual([0, null, null, 25, null, null, null]);
    expect(
      numericSeries(
        data([log('2026-10-19', undefined, true)]),
        habit,
        '2026-10-19',
        '2026-10-19',
        '2026-10-22',
      )[0].value,
    ).toBe(0);
  });
  it('bewaart snapshots, eenheden en correcties bij nieuwe doelen', () => {
    const h = structuredClone(habit);
    h.versions.push({ ...h.versions[0], effective: '2026-10-21', unit: 'uren', target: 2 });
    const l = log('2026-10-20', 90);
    l.events.push({ id: 'correction', amount: -15, at: l.updatedAt });
    const series = numericSeries(data([l], h), h, '2026-10-20', '2026-10-21', '2026-10-22');
    expect(series[0].value).toBe(75);
    expect(series.map((p) => [p.goal?.unit, p.goal?.target])).toEqual([
      ['minuten', 120],
      ['uren', 2],
    ]);
    expect(series[1].value).toBeNull();
  });
});
describe('vergelijkbare perioden', () => {
  it('vergelijkt alleen verstreken dagen met hetzelfde deel van vorige week', () => {
    expect(comparisonRanges('2026-10-19', '2026-10-25', '2026-10-22', 'week')).toEqual({
      start: '2026-10-19',
      end: '2026-10-21',
      previousStart: '2026-10-12',
      previousEnd: '2026-10-14',
    });
    const logs = [
      ...dateRange('2026-10-12', '2026-10-14').map((d) => log(d, 100)),
      ...dateRange('2026-10-19', '2026-10-21').map((d) => log(d, 80)),
      log('2026-10-22', 999),
    ];
    expect(
      compareNumeric(data(logs), habit, '2026-10-19', '2026-10-25', '2026-10-22', 'week'),
    ).toMatchObject({ delta: -20, currentCount: 3, previousCount: 3, reason: null });
  });
  it('telt ontbrekende dagen niet als nul en weigert beperkte dekking', () => {
    const logs = [
      ...dateRange('2026-10-12', '2026-10-15').map((d) => log(d, 100)),
      ...dateRange('2026-10-19', '2026-10-22').map((d) => log(d, 0)),
    ];
    expect(
      compareNumeric(data(logs), habit, '2026-10-19', '2026-10-25', '2026-10-26', 'week').delta,
    ).toBe(-100);
    expect(
      compareNumeric(
        data(logs.filter((l) => l.date !== '2026-10-22')),
        habit,
        '2026-10-19',
        '2026-10-25',
        '2026-10-26',
        'week',
      ),
    ).toMatchObject({ delta: null, reason: 'sparse' });
    expect(
      compareNumeric(data(), habit, '2026-10-19', '2026-10-25', '2026-10-19', 'week').delta,
    ).toBeNull();
  });
  it('combineert gewijzigde doelen en eenheden niet', () => {
    const logs = [
      ...dateRange('2026-10-12', '2026-10-14').map((d) => log(d, 100)),
      ...dateRange('2026-10-19', '2026-10-21').map((d) => log(d, 80)),
    ];
    logs[4].snapshot.unit = 'uren';
    expect(
      compareNumeric(data(logs), habit, '2026-10-19', '2026-10-25', '2026-10-22', 'week'),
    ).toMatchObject({ delta: null, reason: 'changed' });
  });
  it('houdt maandlengten en jaargrenzen gelijk', () => {
    expect(comparisonRanges('2026-03-01', '2026-03-31', '2026-04-01', 'month')).toEqual({
      start: '2026-03-01',
      end: '2026-03-28',
      previousStart: '2026-02-01',
      previousEnd: '2026-02-28',
    });
    expect(comparisonRanges('2026-01-01', '2026-01-31', '2026-01-05', 'month')).toMatchObject({
      end: '2026-01-04',
      previousStart: '2025-12-01',
      previousEnd: '2025-12-04',
    });
  });
});
