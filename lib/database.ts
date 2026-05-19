import * as SQLite from "expo-sqlite";

let db: SQLite.SQLiteDatabase | null = null;

/**
 * Get (or initialize) the SQLite database connection.
 */
export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (db) return db;

  db = await SQLite.openDatabaseAsync("newwww.db");

  // Enable WAL mode for better performance
  await db.execAsync("PRAGMA journal_mode = WAL;");

  return db;
}

/**
 * Run a batch of SQL statements (for schema setup, etc.).
 */
export async function execSql(sql: string): Promise<void> {
  const database = await getDatabase();
  await database.execAsync(sql);
}

/**
 * Execute a SQL statement with optional params (INSERT, UPDATE, DELETE).
 */
export async function runSql(
  sql: string,
  params?: any[],
): Promise<SQLite.SQLiteRunResult> {
  const database = await getDatabase();
  return database.runAsync(sql, params);
}

/**
 * Query all matching rows.
 */
export async function getAllSql<T = any>(
  sql: string,
  params?: any[],
): Promise<T[]> {
  const database = await getDatabase();
  return database.getAllAsync(sql, params);
}

/**
 * Query the first matching row.
 */
export async function getFirstSql<T = any>(
  sql: string,
  params?: any[],
): Promise<T | null> {
  const database = await getDatabase();
  return database.getFirstAsync(sql, params);
}
