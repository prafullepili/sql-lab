import { openDB } from 'idb';
import { seedDatabase } from './seed.js';

const STORAGE_NAME = 'sql-fieldnotes';
const STORAGE_VERSION = 1;
const SNAPSHOT_STORE = 'sqlite';
const SNAPSHOT_KEY = 'snapshot';

let databasePromise;
let SQL;
let database;
let queryQueue = Promise.resolve();

function getStorage() {
  return openDB(STORAGE_NAME, STORAGE_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(SNAPSHOT_STORE)) db.createObjectStore(SNAPSHOT_STORE);
    },
  });
}

async function readSnapshot() {
  const storage = await getStorage();
  try {
    return await storage.get(SNAPSHOT_STORE, SNAPSHOT_KEY);
  } finally {
    storage.close();
  }
}

async function writeSnapshot(snapshot) {
  const storage = await getStorage();
  try {
    await storage.put(SNAPSHOT_STORE, snapshot, SNAPSHOT_KEY);
  } finally {
    storage.close();
  }
}

function registerFunctions(db) {
  // SQLite in sql.js does not include CONCAT in every build. This keeps the
  // common Databricks SQL lesson examples runnable in the local sandbox.
  db.create_function('CONCAT', (...values) => (
    values.some((value) => value == null) ? null : values.map(String).join('')
  ));
}

function createDatabase(snapshot) {
  const db = snapshot ? new SQL.Database(new Uint8Array(snapshot)) : new SQL.Database();
  registerFunctions(db);
  return db;
}

export function initializeDatabase() {
  if (!databasePromise) {
    databasePromise = (async () => {
      if (!window.initSqlJs) throw new Error('The local SQLite engine did not load. Refresh the page to try again.');
      SQL = await window.initSqlJs({
        locateFile: (file) => `${import.meta.env.BASE_URL}vendor/${file}`,
      });
      const snapshot = await readSnapshot().catch(() => null);
      database = createDatabase(snapshot);
      seedDatabase(database);
      await writeSnapshot(database.export()).catch(() => {});
      return database;
    })().catch((error) => {
      databasePromise = null;
      throw error;
    });
  }
  return databasePromise;
}

export async function getDatabase() {
  return initializeDatabase();
}

async function executeAndPersist(sql) {
  const db = await initializeDatabase();
  const beforeQuery = db.export();
  try {
    const results = db.exec(sql);
    await writeSnapshot(db.export());
    return results;
  } catch (error) {
    // Restore the last consistent state if a multi-statement query fails partway.
    db.close();
    database = createDatabase(beforeQuery);
    databasePromise = Promise.resolve(database);
    throw error;
  }
}

export function runSql(sql) {
  const run = queryQueue.then(() => executeAndPersist(sql));
  queryQueue = run.catch(() => {});
  return run;
}

export async function inspectSchema() {
  const db = await initializeDatabase();
  const found = db.exec(`
    SELECT name, type
    FROM sqlite_master
    WHERE type IN ('table', 'view')
      AND name NOT LIKE 'sqlite_%'
    ORDER BY CASE type WHEN 'table' THEN 0 ELSE 1 END, name;
  `)[0]?.values || [];

  const tables = {};
  for (const [name, type] of found) {
    const escapedName = String(name).replaceAll('"', '""');
    const columns = db.exec(`PRAGMA table_info("${escapedName}");`)[0]?.values || [];
    const count = db.exec(`SELECT COUNT(*) FROM "${escapedName}";`)[0]?.values?.[0]?.[0] ?? 0;
    tables[name] = {
      type,
      rows: Number(count),
      cols: columns.map((column) => [column[1], column[2] || 'ANY', column[5] ? 'PK' : null]),
    };
  }
  return tables;
}

export async function resetDatabase() {
  const db = await initializeDatabase();
  db.close();
  database = new SQL.Database();
  registerFunctions(database);
  seedDatabase(database);
  await writeSnapshot(database.export());
  databasePromise = Promise.resolve(database);
  return inspectSchema();
}
