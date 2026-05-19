import { execSql, getAllSql, runSql } from "./database";

export type TransactionType = "income" | "expense";

export interface Category {
  id: number;
  name: string;
  type: TransactionType;
  icon: string;
  color: string;
}

export interface Transaction {
  id: number;
  amount: number;
  type: TransactionType;
  category_id: number;
  category_name?: string;
  category_icon?: string;
  category_color?: string;
  note: string;
  date: string;
  created_at: string;
}

/**
 * Initialize database tables and seed default categories.
 * Safe to call multiple times — uses IF NOT EXISTS.
 */
export async function initializeDatabase(): Promise<void> {
  // ── Categories table ─────────────────────────────────────────
  await execSql(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
      icon TEXT NOT NULL DEFAULT '📦',
      color TEXT NOT NULL DEFAULT '#6B7280'
    );
  `);

  // ── Transactions table ───────────────────────────────────────
  await execSql(`
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      amount REAL NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
      category_id INTEGER NOT NULL,
      note TEXT NOT NULL DEFAULT '',
      date TEXT NOT NULL DEFAULT (date('now')),
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT
    );
  `);

  // ── Index for faster date-based queries ──────────────────────
  await execSql(`
    CREATE INDEX IF NOT EXISTS idx_transactions_date
    ON transactions(date);
  `);

  // ── Seed default categories (only if empty) ──────────────────
  const existing = await getAllSql<{ count: number }>(
    "SELECT COUNT(*) as count FROM categories",
  );

  if (existing[0]?.count === 0) {
    const expenseCategories = [
      ["🍔", "Food & Dining", "#EF4444"],
      ["🚗", "Transport", "#F97316"],
      ["🛒", "Shopping", "#EAB308"],
      ["🏠", "Housing", "#22C55E"],
      ["💡", "Utilities", "#06B6D4"],
      ["❤️", "Healthcare", "#EC4899"],
      ["🎮", "Entertainment", "#8B5CF6"],
      ["📚", "Education", "#6366F1"],
      ["💼", "Business", "#14B8A6"],
      ["❓", "Other", "#6B7280"],
    ];

    const incomeCategories = [
      ["💰", "Salary", "#22C55E"],
      ["📈", "Investments", "#3B82F6"],
      ["🎁", "Gifts", "#EC4899"],
      ["🏪", "Side Hustle", "#8B5CF6"],
      ["💵", "Other Income", "#6B7280"],
    ];

    for (const [icon, name, color] of expenseCategories) {
      await runSql(
        "INSERT INTO categories (name, type, icon, color) VALUES (?, ?, ?, ?)",
        [name, "expense", icon, color],
      );
    }

    for (const [icon, name, color] of incomeCategories) {
      await runSql(
        "INSERT INTO categories (name, type, icon, color) VALUES (?, ?, ?, ?)",
        [name, "income", icon, color],
      );
    }

    console.log("✅ Default categories seeded.");
  }
}
