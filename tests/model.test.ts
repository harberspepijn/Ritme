import { describe, expect, it } from 'vitest';
import {
  addAmount,
  addDays,
  changeState,
  dataSchema,
  emptyData,
  evaluate,
  goalAt,
  isScheduled,
  localDate,
  monday,
  newLog,
  parseImport,
  total,
  updateLog,
  weekSummary,
  type Data,
  type Goal,
  type Habit,
  type Kind,
  type Log,
} from '../src/model';
const day = '2026-10-21';
const goal = (kind: Kind = 'minimum', target = 20): Goal => ({
  effective: '2026-10-19',
  kind,
  target,
  unit: 'minuten',
  time: '',
  schedule: { type: 'daily' },
});
const habit = (kind: Kind = 'minimum', target = 20): Habit => ({
  id: 'habit-1',
  name: 'Lezen',
  icon: 'book',
  reason: '',
  coping: '',
  createdOn: '2026-10-19',
  state: 'active',
  pauses: [],
  versions: [goal(kind, target)],
});
const log = (kind: Kind = 'minimum', target = 20): Log => ({
  habitId: 'habit-1',
  date: day,
  snapshot: goal(kind, target),
  events: [],
  answer: null,
  closed: false,
  time: '',
  updatedAt: '2026-10-21T10:00:00.000Z',
});
const withData = (h: Habit, logs: Log[] = []): Data => ({ ...emptyData(), habits: [h], logs });

describe('lokale kalender', () => {
  it('gebruikt lokale dag rond middernacht, geen UTC-afsnede', () => {
    const date = new Date(2026, 9, 21, 0, 30);
    expect(localDate(date)).toBe(day);
    expect(localDate(new Date(2026, 9, 21, 23, 59))).toBe(day);
  });
  it('rekent goed over zomer-/wintertijd en jaargrenzen', () => {
    expect(addDays('2026-03-28', 1)).toBe('2026-03-29');
    expect(addDays('2026-03-29', 1)).toBe('2026-03-30');
    expect(addDays('2026-10-25', 1)).toBe('2026-10-26');
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
    expect(monday('2026-10-25')).toBe('2026-10-19');
    expect(monday('2026-10-26')).toBe('2026-10-26');
  });
});
describe('vier meetwijzen', () => {
  it.each(['binary', 'minimum', 'maximum', 'avoid'] as Kind[])(
    '%s onderscheidt vandaag, verleden en toekomst',
    (kind) => {
      expect(evaluate(habit(kind), day, undefined, day)).toBe('pending');
      expect(evaluate(habit(kind), day, undefined, addDays(day, 1))).toBe('unknown');
      expect(evaluate(habit(kind), addDays(day, 1), undefined, day)).toBe('future');
      expect(evaluate(habit(kind), day, log(kind), day)).toBe('pending');
      expect(evaluate(habit(kind), day, log(kind), addDays(day, 1))).toBe('unknown');
    },
  );
  it('beoordeelt ja/nee alleen op expliciete keuze, ook na middernacht', () => {
    const h = habit('binary');
    h.versions[0].time = '21:15';
    expect(evaluate(h, day, { ...log('binary'), answer: false, time: '00:30' }, day)).toBe(
      'failed',
    );
    expect(evaluate(h, day, { ...log('binary'), answer: true, time: '00:30' }, day)).toBe(
      'success',
    );
    expect(evaluate(h, day, { ...log('binary'), answer: null, time: '20:00' }, day)).toBe(
      'pending',
    );
  });
  it('telt meerdere registraties en correcties, ook nul is geregistreerd', () => {
    const h = habit();
    let l = addAmount(log(), 5);
    l = addAmount(l, 15);
    expect(total(l)).toBe(20);
    expect(evaluate(h, day, l, day)).toBe('success');
    l = addAmount(l, -5);
    expect(total(l)).toBe(15);
    expect(l.events).toHaveLength(3);
    expect(evaluate(h, day, l, day)).toBe('pending');
    expect(evaluate(h, day, l, '2026-10-22')).toBe('failed');
    expect(evaluate(h, day, undefined, '2026-10-22')).toBe('unknown');
    expect(evaluate(h, day, addAmount(log(), 0), '2026-10-22')).toBe('failed');
  });
  it('laat geen negatief of niet-eindig totaal toe', () => {
    expect(() => addAmount(log(), -1)).toThrow();
    expect(() => addAmount(log(), NaN)).toThrow();
    expect(() => addAmount(log(), Infinity)).toThrow();
    expect(() => addAmount(log(), 1000001)).toThrow();
  });
  it('een maximum slaagt pas na afronden en nooit boven de grens', () => {
    const h = habit('maximum', 30);
    let l = addAmount(log('maximum', 30), 25);
    expect(evaluate(h, day, l, day)).toBe('pending');
    expect(evaluate(h, day, { ...l, closed: true }, day)).toBe('success');
    l = addAmount(l, 6);
    expect(evaluate(h, day, { ...l, closed: true }, day)).toBe('failed');
    expect(evaluate(h, day, { ...log('maximum', 30), closed: true }, day)).toBe('success');
  });
  it('vermijden vereist bevestiging en incidenten sluiten succes uit', () => {
    const h = habit('avoid');
    let l = { ...log('avoid'), closed: true };
    expect(evaluate(h, day, l, day)).toBe('success');
    l = addAmount(l, 1);
    expect(l.closed).toBe(false);
    expect(evaluate(h, day, { ...l, closed: true }, day)).toBe('failed');
    l = addAmount(l, -1);
    expect(evaluate(h, day, l, day)).toBe('pending');
    expect(evaluate(h, day, { ...l, closed: true }, day)).toBe('success');
  });
});
describe('planning en historie', () => {
  it('sluit dagen vóór aanmaak, vaste vrije dagen en pauzes uit', () => {
    let h = habit();
    h.versions[0].schedule = { type: 'days', days: [0, 2, 4] };
    expect(isScheduled(h, '2026-10-18')).toBe(false);
    expect(isScheduled(h, '2026-10-20')).toBe(false);
    expect(isScheduled(h, day)).toBe(true);
    h = changeState(h, 'paused', day);
    expect(isScheduled(h, day)).toBe(false);
    expect(evaluate(h, day, undefined, day)).toBe('off');
    h = changeState(h, 'active', '2026-10-23');
    expect(isScheduled(h, day)).toBe(false);
    expect(isScheduled(h, '2026-10-23')).toBe(true);
  });
  it('herstart op dezelfde dag maakt geen ongeldige pauze', () => {
    const h = changeState(changeState(habit(), 'paused', day), 'active', day);
    expect(h.pauses).toEqual([]);
    expect(dataSchema.safeParse(withData(h)).success).toBe(true);
  });
  it('archiveren en hervatten bewaren de afgesloten periode en historie', () => {
    let h = changeState(habit(), 'archived', day);
    const l = { ...addAmount(log(), 20), date: '2026-10-20' };
    expect(evaluate(h, '2026-10-20', l, day)).toBe('success');
    h = changeState(h, 'active', '2026-10-25');
    expect(isScheduled(h, '2026-10-23')).toBe(false);
    expect(isScheduled(h, '2026-10-25')).toBe(true);
  });
  it('bewaart eerdere doelen, inclusief snapshots op dezelfde dag', () => {
    const h = habit();
    const l = addAmount(log(), 20);
    h.versions.push({ ...goal(), effective: '2026-10-22', target: 40 });
    expect(goalAt(h, day)?.target).toBe(20);
    expect(goalAt(h, '2026-10-22')?.target).toBe(40);
    expect(evaluate(h, day, l, '2026-10-23')).toBe('success');
    h.versions[0].target = 40;
    expect(evaluate(h, day, l, day)).toBe('success');
  });
  it('een weekdoel telt unieke behaalde dagen in maandag-zondag', () => {
    const h = habit();
    h.versions[0].schedule = { type: 'weekly', count: 3 };
    const logs = ['2026-10-19', '2026-10-20', '2026-10-21'].map((date) => ({
      ...addAmount(addAmount(log(), 10), 10),
      date,
      snapshot: h.versions[0],
    }));
    const d = withData(h, logs);
    const summary = weekSummary(d, h, day, '2026-10-25');
    expect(summary).toMatchObject({ target: 3, success: 3, unknown: 3, reached: true });
    expect(weekSummary(d, h, '2026-10-26', '2026-10-28').success).toBe(0);
  });
  it('wijziging vanaf volgende maandag verandert de oude week niet', () => {
    const h = habit();
    h.versions[0].schedule = { type: 'weekly', count: 3 };
    h.versions.push({ ...goal(), effective: '2026-10-26', schedule: { type: 'weekly', count: 5 } });
    expect(weekSummary(withData(h), h, day, day).target).toBe(3);
    expect(weekSummary(withData(h), h, '2026-10-26', '2026-10-26').target).toBe(5);
  });
  it('meldt beperkte beschikbare dagen in een gedeeltelijke week', () => {
    const h = habit();
    h.createdOn = '2026-10-24';
    h.versions[0].effective = h.createdOn;
    h.versions[0].schedule = { type: 'weekly', count: 3 };
    expect(weekSummary(withData(h), h, '2026-10-24', '2026-10-25')).toMatchObject({
      eligible: 2,
      target: 3,
      reached: false,
    });
  });
  it('corrigeert één dag zonder andere registraties te overschrijven', () => {
    const h = habit();
    let d = withData(h, [{ ...log(), date: '2026-10-20' }]);
    d = updateLog(d, h, day, (l) => addAmount(l, 20));
    expect(d.logs).toHaveLength(2);
    expect(total(d.logs[1])).toBe(20);
    d = updateLog(d, h, day, () => null);
    expect(d.logs).toHaveLength(1);
    expect(d.logs[0].date).toBe('2026-10-20');
  });
  it('weigert registraties buiten planning en vóór aanmaak', () => {
    expect(() => newLog(habit(), '2026-10-18')).toThrow();
    expect(() => newLog(changeState(habit(), 'paused', day), day)).toThrow();
  });
});
describe('gevalideerde overdracht', () => {
  it('export/import behoudt alle gegevens', () => {
    const d = withData(habit(), [addAmount(log(), 20)]);
    expect(parseImport(JSON.stringify(d))).toEqual(d);
  });
  it.each([
    '{}',
    'null',
    '{',
    '{"schemaVersion":2}',
    '{"schemaVersion":1,"habits":[],"logs":[],"theme":"light","extra":true}',
  ])('weigert ongeldige invoer: %s', (text) => {
    expect(() => parseImport(text)).toThrow();
  });
  it('weigert onmogelijke data, dubbele IDs en verweesde registraties', () => {
    expect(() =>
      parseImport(JSON.stringify(withData({ ...habit(), createdOn: '2026-02-30' }))),
    ).toThrow();
    expect(() =>
      parseImport(JSON.stringify({ ...emptyData(), habits: [habit(), habit()] })),
    ).toThrow();
    expect(() => parseImport(JSON.stringify({ ...emptyData(), logs: [log()] }))).toThrow();
    expect(() => parseImport(JSON.stringify(withData(habit(), [log(), log()])))).toThrow();
  });
  it('weigert tegenstrijdige vermijdregistratie', () => {
    const l = { ...addAmount(log('avoid'), 1), closed: true };
    expect(() => parseImport(JSON.stringify(withData(habit('avoid'), [l])))).toThrow();
  });
  it('weigert ongeldige doel- en pauzehistorie', () => {
    const h = habit();
    h.versions.push(h.versions[0]);
    expect(() => parseImport(JSON.stringify(withData(h)))).toThrow();
    expect(() => parseImport(JSON.stringify(withData({ ...habit(), state: 'paused' })))).toThrow();
  });
});
