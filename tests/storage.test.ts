import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';
import { loadData, saveData } from '../src/storage';
import { emptyData, type Data } from '../src/model';
beforeEach(async () => {
  await saveData(emptyData());
});
describe('IndexedDB', () => {
  it('bewaart een complete gewoonte en registratie over nieuwe verbindingen', async () => {
    const data: Data = {
      ...emptyData(),
      theme: 'dark',
      habits: [
        {
          id: 'h',
          name: 'Lezen',
          icon: 'book',
          reason: '',
          coping: '',
          createdOn: '2026-10-21',
          state: 'active',
          pauses: [],
          versions: [
            {
              effective: '2026-10-21',
              kind: 'binary',
              target: 1,
              unit: 'keer',
              time: '',
              schedule: { type: 'daily' },
            },
          ],
        },
      ],
      logs: [],
    };
    data.logs.push({
      habitId: 'h',
      date: '2026-10-21',
      snapshot: data.habits[0].versions[0],
      events: [],
      answer: true,
      closed: false,
      time: '',
      updatedAt: '2026-10-21T10:00:00.000Z',
    });
    await saveData(data);
    expect(await loadData()).toEqual(data);
  });
  it('ongeldige import overschrijft eerdere opslag niet', async () => {
    const valid: Data = { ...emptyData(), theme: 'dark' };
    await saveData(valid);
    await expect(saveData({ ...valid, schemaVersion: 99 } as unknown as Data)).rejects.toThrow();
    expect(await loadData()).toEqual(valid);
  });
});
