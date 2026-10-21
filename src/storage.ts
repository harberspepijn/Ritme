import { openDB } from 'idb';
import { dataSchema, emptyData, type Data } from './model';
const db = () =>
  openDB('ritme', 1, {
    upgrade(db) {
      db.createObjectStore('app');
    },
  });
export async function loadData(): Promise<Data> {
  const connection = await db();
  try {
    const saved = await connection.get('app', 'data');
    return saved ? dataSchema.parse(saved) : emptyData();
  } finally {
    connection.close();
  }
}
export async function saveData(data: Data) {
  const valid = dataSchema.parse(data);
  const connection = await db();
  try {
    const tx = connection.transaction('app', 'readwrite');
    await tx.store.put(valid, 'data');
    await tx.done;
  } finally {
    connection.close();
  }
}
