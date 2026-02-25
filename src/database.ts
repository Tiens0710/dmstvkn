// src/database.ts - FinWise Personal Finance Database
import SQLite from 'react-native-sqlite-storage';

SQLite.enablePromise(true);

const database_name = 'finwise.db';
const database_version = '1.0';
const database_displayname = 'FinWise Database';
const database_size = 200000;

export let db: SQLite.SQLiteDatabase;

// ============================================================
// INTERFACES
// ============================================================

export interface Account {
  id: number;
  name: string;
  type: 'cash' | 'bank' | 'ewallet' | 'credit';
  balance: number;
  icon: string;
  color: string;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: number;
  name: string;
  type: 'income' | 'expense';
  icon: string;
  color: string;
  budgetLimit: number;
}

export interface Transaction {
  id: number;
  amount: number;
  type: 'income' | 'expense';
  categoryId: number;
  accountId: number;
  note: string;
  date: string;
  isRecurring: boolean;
  createdAt: string;
  // Joined fields
  categoryName?: string;
  categoryIcon?: string;
  categoryColor?: string;
  accountName?: string;
}

export interface Budget {
  id: number;
  categoryId: number;
  amountLimit: number;
  period: 'monthly' | 'weekly';
  startDate: string;
  // Joined fields
  categoryName?: string;
  categoryIcon?: string;
  categoryColor?: string;
  spent?: number;
}

export interface CreateTransactionInput {
  amount: number;
  type: 'income' | 'expense';
  categoryId: number;
  accountId: number;
  note?: string;
  date?: string;
  isRecurring?: boolean;
}

export interface CreateAccountInput {
  name: string;
  type: 'cash' | 'bank' | 'ewallet' | 'credit';
  balance?: number;
  icon?: string;
  color?: string;
  currency?: string;
}

export interface CreateBudgetInput {
  categoryId: number;
  amountLimit: number;
  period?: 'monthly' | 'weekly';
  startDate?: string;
}

// ============================================================
// DATABASE SETUP
// ============================================================

export async function openDatabase() {
  if (db) return db;
  db = await SQLite.openDatabase({
    name: database_name,
    location: 'default',
  });
  return db;
}

export async function initDatabase() {
  const db = await openDatabase();

  // Bảng tài khoản/ví
  await db.executeSql(`CREATE TABLE IF NOT EXISTS accounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'cash',
    balance REAL NOT NULL DEFAULT 0,
    icon TEXT DEFAULT '💰',
    color TEXT DEFAULT '#4F46E5',
    currency TEXT DEFAULT 'VND',
    createdAt TEXT,
    updatedAt TEXT
  )`);

  // Bảng danh mục
  await db.executeSql(`CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'expense',
    icon TEXT DEFAULT '📦',
    color TEXT DEFAULT '#64748B',
    budgetLimit REAL DEFAULT 0
  )`);

  // Bảng giao dịch
  await db.executeSql(`CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    amount REAL NOT NULL,
    type TEXT NOT NULL DEFAULT 'expense',
    categoryId INTEGER,
    accountId INTEGER,
    note TEXT DEFAULT '',
    date TEXT NOT NULL,
    isRecurring INTEGER DEFAULT 0,
    createdAt TEXT,
    FOREIGN KEY (categoryId) REFERENCES categories (id),
    FOREIGN KEY (accountId) REFERENCES accounts (id)
  )`);

  // Bảng ngân sách
  await db.executeSql(`CREATE TABLE IF NOT EXISTS budgets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    categoryId INTEGER NOT NULL,
    amountLimit REAL NOT NULL,
    period TEXT DEFAULT 'monthly',
    startDate TEXT,
    FOREIGN KEY (categoryId) REFERENCES categories (id)
  )`);
}

// ============================================================
// ACCOUNT FUNCTIONS
// ============================================================

export async function addAccount(input: CreateAccountInput): Promise<number> {
  const db = await openDatabase();
  const now = new Date().toISOString();
  const [result] = await db.executeSql(
    `INSERT INTO accounts (name, type, balance, icon, color, currency, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      input.name,
      input.type,
      input.balance || 0,
      input.icon || '💰',
      input.color || '#4F46E5',
      input.currency || 'VND',
      now,
      now,
    ]
  );
  return result.insertId;
}

export async function getAccounts(): Promise<Account[]> {
  const db = await openDatabase();
  const [results] = await db.executeSql('SELECT * FROM accounts ORDER BY createdAt ASC');
  const accounts: Account[] = [];
  for (let i = 0; i < results.rows.length; i++) {
    accounts.push(results.rows.item(i));
  }
  return accounts;
}

export async function getAccountById(id: number): Promise<Account | null> {
  const db = await openDatabase();
  const [results] = await db.executeSql('SELECT * FROM accounts WHERE id = ?', [id]);
  if (results.rows.length === 0) return null;
  return results.rows.item(0);
}

export async function updateAccountBalance(id: number, newBalance: number): Promise<void> {
  const db = await openDatabase();
  const now = new Date().toISOString();
  await db.executeSql(
    'UPDATE accounts SET balance = ?, updatedAt = ? WHERE id = ?',
    [newBalance, now, id]
  );
}

export async function deleteAccount(id: number): Promise<void> {
  const db = await openDatabase();
  await db.executeSql('DELETE FROM accounts WHERE id = ?', [id]);
}

export async function getTotalBalance(): Promise<number> {
  const db = await openDatabase();
  const [results] = await db.executeSql('SELECT COALESCE(SUM(balance), 0) as total FROM accounts');
  return results.rows.item(0).total;
}

// ============================================================
// CATEGORY FUNCTIONS
// ============================================================

export async function addCategory(
  name: string,
  type: 'income' | 'expense',
  icon: string,
  color: string,
  budgetLimit: number = 0
): Promise<number> {
  const db = await openDatabase();
  const [result] = await db.executeSql(
    `INSERT INTO categories (name, type, icon, color, budgetLimit) VALUES (?, ?, ?, ?, ?)`,
    [name, type, icon, color, budgetLimit]
  );
  return result.insertId;
}

export async function getCategories(type?: 'income' | 'expense'): Promise<Category[]> {
  const db = await openDatabase();
  let query = 'SELECT * FROM categories';
  const params: any[] = [];
  if (type) {
    query += ' WHERE type = ?';
    params.push(type);
  }
  query += ' ORDER BY name ASC';
  const [results] = await db.executeSql(query, params);
  const categories: Category[] = [];
  for (let i = 0; i < results.rows.length; i++) {
    categories.push(results.rows.item(i));
  }
  return categories;
}

// ============================================================
// TRANSACTION FUNCTIONS
// ============================================================

export async function addTransaction(input: CreateTransactionInput): Promise<number> {
  const db = await openDatabase();
  const now = new Date().toISOString();
  const date = input.date || now.split('T')[0];

  const [result] = await db.executeSql(
    `INSERT INTO transactions (amount, type, categoryId, accountId, note, date, isRecurring, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      input.amount,
      input.type,
      input.categoryId,
      input.accountId,
      input.note || '',
      date,
      input.isRecurring ? 1 : 0,
      now,
    ]
  );

  // Cập nhật balance tài khoản
  const account = await getAccountById(input.accountId);
  if (account) {
    const newBalance =
      input.type === 'income'
        ? account.balance + input.amount
        : account.balance - input.amount;
    await updateAccountBalance(input.accountId, newBalance);
  }

  return result.insertId;
}

export async function getTransactions(limit: number = 50, offset: number = 0): Promise<Transaction[]> {
  const db = await openDatabase();
  const [results] = await db.executeSql(
    `SELECT t.*, c.name as categoryName, c.icon as categoryIcon, c.color as categoryColor, a.name as accountName
     FROM transactions t
     LEFT JOIN categories c ON t.categoryId = c.id
     LEFT JOIN accounts a ON t.accountId = a.id
     ORDER BY t.date DESC, t.createdAt DESC
     LIMIT ? OFFSET ?`,
    [limit, offset]
  );
  const txns: Transaction[] = [];
  for (let i = 0; i < results.rows.length; i++) {
    const row = results.rows.item(i);
    txns.push({ ...row, isRecurring: row.isRecurring === 1 });
  }
  return txns;
}

export async function getTransactionsByPeriod(
  startDate: string,
  endDate: string,
  type?: 'income' | 'expense'
): Promise<Transaction[]> {
  const db = await openDatabase();
  let query = `SELECT t.*, c.name as categoryName, c.icon as categoryIcon, c.color as categoryColor, a.name as accountName
     FROM transactions t
     LEFT JOIN categories c ON t.categoryId = c.id
     LEFT JOIN accounts a ON t.accountId = a.id
     WHERE t.date >= ? AND t.date <= ?`;
  const params: any[] = [startDate, endDate];

  if (type) {
    query += ' AND t.type = ?';
    params.push(type);
  }
  query += ' ORDER BY t.date DESC, t.createdAt DESC';

  const [results] = await db.executeSql(query, params);
  const txns: Transaction[] = [];
  for (let i = 0; i < results.rows.length; i++) {
    const row = results.rows.item(i);
    txns.push({ ...row, isRecurring: row.isRecurring === 1 });
  }
  return txns;
}

export async function deleteTransaction(id: number): Promise<void> {
  const db = await openDatabase();

  // Lấy thông tin giao dịch trước khi xóa để hoàn lại balance
  const [txnResult] = await db.executeSql('SELECT * FROM transactions WHERE id = ?', [id]);
  if (txnResult.rows.length > 0) {
    const txn = txnResult.rows.item(0);
    const account = await getAccountById(txn.accountId);
    if (account) {
      const newBalance =
        txn.type === 'income'
          ? account.balance - txn.amount
          : account.balance + txn.amount;
      await updateAccountBalance(txn.accountId, newBalance);
    }
  }

  await db.executeSql('DELETE FROM transactions WHERE id = ?', [id]);
}

export async function getMonthlyTotal(
  year: number,
  month: number,
  type: 'income' | 'expense'
): Promise<number> {
  const db = await openDatabase();
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const endMonth = month === 12 ? 1 : month + 1;
  const endYear = month === 12 ? year + 1 : year;
  const endDate = `${endYear}-${String(endMonth).padStart(2, '0')}-01`;

  const [results] = await db.executeSql(
    `SELECT COALESCE(SUM(amount), 0) as total FROM transactions
     WHERE type = ? AND date >= ? AND date < ?`,
    [type, startDate, endDate]
  );
  return results.rows.item(0).total;
}

export async function getTransactionCountToday(): Promise<number> {
  const db = await openDatabase();
  const today = new Date().toISOString().split('T')[0];
  const [results] = await db.executeSql(
    'SELECT COUNT(*) as count FROM transactions WHERE date = ?',
    [today]
  );
  return results.rows.item(0).count;
}

export async function getCategorySpending(
  year: number,
  month: number
): Promise<{ categoryId: number; categoryName: string; categoryIcon: string; categoryColor: string; total: number }[]> {
  const db = await openDatabase();
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const endMonth = month === 12 ? 1 : month + 1;
  const endYear = month === 12 ? year + 1 : year;
  const endDate = `${endYear}-${String(endMonth).padStart(2, '0')}-01`;

  const [results] = await db.executeSql(
    `SELECT t.categoryId, c.name as categoryName, c.icon as categoryIcon, c.color as categoryColor,
            SUM(t.amount) as total
     FROM transactions t
     LEFT JOIN categories c ON t.categoryId = c.id
     WHERE t.type = 'expense' AND t.date >= ? AND t.date < ?
     GROUP BY t.categoryId
     ORDER BY total DESC`,
    [startDate, endDate]
  );

  const spending = [];
  for (let i = 0; i < results.rows.length; i++) {
    spending.push(results.rows.item(i));
  }
  return spending;
}

export async function getDailySpending(
  year: number,
  month: number
): Promise<{ date: string; total: number }[]> {
  const db = await openDatabase();
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const endMonth = month === 12 ? 1 : month + 1;
  const endYear = month === 12 ? year + 1 : year;
  const endDate = `${endYear}-${String(endMonth).padStart(2, '0')}-01`;

  const [results] = await db.executeSql(
    `SELECT date, SUM(amount) as total
     FROM transactions
     WHERE type = 'expense' AND date >= ? AND date < ?
     GROUP BY date
     ORDER BY date ASC`,
    [startDate, endDate]
  );

  const daily = [];
  for (let i = 0; i < results.rows.length; i++) {
    daily.push(results.rows.item(i));
  }
  return daily;
}

// ============================================================
// BUDGET FUNCTIONS
// ============================================================

export async function addBudget(input: CreateBudgetInput): Promise<number> {
  const db = await openDatabase();
  const startDate = input.startDate || new Date().toISOString().split('T')[0];
  const [result] = await db.executeSql(
    `INSERT INTO budgets (categoryId, amountLimit, period, startDate) VALUES (?, ?, ?, ?)`,
    [input.categoryId, input.amountLimit, input.period || 'monthly', startDate]
  );
  return result.insertId;
}

export async function getBudgets(): Promise<Budget[]> {
  const db = await openDatabase();
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const endMonth = month === 12 ? 1 : month + 1;
  const endYear = month === 12 ? year + 1 : year;
  const endDate = `${endYear}-${String(endMonth).padStart(2, '0')}-01`;

  const [results] = await db.executeSql(
    `SELECT b.*, c.name as categoryName, c.icon as categoryIcon, c.color as categoryColor,
            COALESCE((SELECT SUM(t.amount) FROM transactions t
                      WHERE t.categoryId = b.categoryId AND t.type = 'expense'
                      AND t.date >= ? AND t.date < ?), 0) as spent
     FROM budgets b
     LEFT JOIN categories c ON b.categoryId = c.id
     ORDER BY c.name ASC`,
    [startDate, endDate]
  );

  const budgets: Budget[] = [];
  for (let i = 0; i < results.rows.length; i++) {
    budgets.push(results.rows.item(i));
  }
  return budgets;
}

export async function getOverBudgetCount(): Promise<number> {
  const budgets = await getBudgets();
  return budgets.filter(b => (b.spent || 0) > b.amountLimit).length;
}

export async function deleteBudget(id: number): Promise<void> {
  const db = await openDatabase();
  await db.executeSql('DELETE FROM budgets WHERE id = ?', [id]);
}

// ============================================================
// SEED DATA
// ============================================================

export async function seedSampleData(): Promise<void> {
  const db = await openDatabase();

  // Kiểm tra đã có data chưa
  const [accountCheck] = await db.executeSql('SELECT COUNT(*) as count FROM accounts');
  if (accountCheck.rows.item(0).count > 0) return;

  // === Tài khoản mẫu ===
  const accountIds: number[] = [];
  const accounts: CreateAccountInput[] = [
    { name: 'Tiền mặt', type: 'cash', balance: 5000000, icon: '💵', color: '#059669' },
    { name: 'Vietcombank', type: 'bank', balance: 25000000, icon: '🏦', color: '#1D4ED8' },
    { name: 'MoMo', type: 'ewallet', balance: 2500000, icon: '📱', color: '#D946EF' },
  ];
  for (const acc of accounts) {
    const id = await addAccount(acc);
    accountIds.push(id);
  }

  // === Danh mục chi tiêu ===
  const expCatIds: number[] = [];
  const expenseCategories = [
    { name: 'Ăn uống', icon: '🍜', color: '#DC2626' },
    { name: 'Di chuyển', icon: '🚗', color: '#4F46E5' },
    { name: 'Mua sắm', icon: '🛍️', color: '#D946EF' },
    { name: 'Hóa đơn', icon: '📄', color: '#D97706' },
    { name: 'Giải trí', icon: '🎬', color: '#059669' },
    { name: 'Sức khỏe', icon: '💊', color: '#0EA5E9' },
    { name: 'Giáo dục', icon: '📚', color: '#7C3AED' },
    { name: 'Khác', icon: '📦', color: '#64748B' },
  ];
  for (const cat of expenseCategories) {
    const id = await addCategory(cat.name, 'expense', cat.icon, cat.color);
    expCatIds.push(id);
  }

  // === Danh mục thu nhập ===
  const incCatIds: number[] = [];
  const incomeCategories = [
    { name: 'Lương', icon: '💰', color: '#059669' },
    { name: 'Thưởng', icon: '🎁', color: '#D97706' },
    { name: 'Đầu tư', icon: '📈', color: '#4F46E5' },
    { name: 'Thu nhập khác', icon: '💎', color: '#7C3AED' },
  ];
  for (const cat of incomeCategories) {
    const id = await addCategory(cat.name, 'income', cat.icon, cat.color);
    incCatIds.push(id);
  }

  // === Giao dịch mẫu (tháng hiện tại) ===
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');

  // Helper - tạo ngày trong tháng
  const d = (day: number) => `${y}-${m}-${String(day).padStart(2, '0')}`;

  const sampleTransactions: CreateTransactionInput[] = [
    // Thu nhập
    { amount: 18500000, type: 'income', categoryId: incCatIds[0], accountId: accountIds[1], note: 'Lương tháng ' + m, date: d(1) },
    { amount: 2000000, type: 'income', categoryId: incCatIds[1], accountId: accountIds[1], note: 'Thưởng KPI', date: d(5) },
    // Chi tiêu
    { amount: 85000, type: 'expense', categoryId: expCatIds[0], accountId: accountIds[0], note: 'Cơm trưa', date: d(2) },
    { amount: 45000, type: 'expense', categoryId: expCatIds[0], accountId: accountIds[0], note: 'Cà phê', date: d(2) },
    { amount: 150000, type: 'expense', categoryId: expCatIds[1], accountId: accountIds[2], note: 'Grab đi làm', date: d(3) },
    { amount: 350000, type: 'expense', categoryId: expCatIds[0], accountId: accountIds[0], note: 'Đi ăn tối', date: d(4) },
    { amount: 1200000, type: 'expense', categoryId: expCatIds[3], accountId: accountIds[1], note: 'Tiền điện', date: d(5) },
    { amount: 800000, type: 'expense', categoryId: expCatIds[3], accountId: accountIds[1], note: 'Tiền nước + internet', date: d(5) },
    { amount: 256000, type: 'expense', categoryId: expCatIds[2], accountId: accountIds[2], note: 'Shopee', date: d(7) },
    { amount: 120000, type: 'expense', categoryId: expCatIds[4], accountId: accountIds[0], note: 'Xem phim', date: d(8) },
    { amount: 500000, type: 'expense', categoryId: expCatIds[5], accountId: accountIds[1], note: 'Khám bệnh', date: d(10) },
    { amount: 2000000, type: 'expense', categoryId: expCatIds[6], accountId: accountIds[1], note: 'Khóa học online', date: d(11) },
    { amount: 75000, type: 'expense', categoryId: expCatIds[0], accountId: accountIds[0], note: 'Bánh mì + nước', date: d(12) },
    { amount: 180000, type: 'expense', categoryId: expCatIds[1], accountId: accountIds[2], note: 'Xe ôm', date: d(13) },
    { amount: 1500000, type: 'expense', categoryId: expCatIds[2], accountId: accountIds[1], note: 'Quần áo', date: d(14) },
    { amount: 65000, type: 'expense', categoryId: expCatIds[0], accountId: accountIds[0], note: 'Bún bò', date: d(15) },
  ];

  for (const txn of sampleTransactions) {
    // Sử dụng addTransaction trực tiếp (nó sẽ cập nhật balance)
    // Nhưng vì seed data, ta insert trực tiếp để không ảnh hưởng balance đã set
    const date = txn.date || now.toISOString().split('T')[0];
    await db.executeSql(
      `INSERT INTO transactions (amount, type, categoryId, accountId, note, date, isRecurring, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [txn.amount, txn.type, txn.categoryId, txn.accountId, txn.note || '', date, 0, now.toISOString()]
    );
  }

  // === Ngân sách mẫu ===
  const budgetData: CreateBudgetInput[] = [
    { categoryId: expCatIds[0], amountLimit: 3000000 },   // Ăn uống: 3M
    { categoryId: expCatIds[1], amountLimit: 1500000 },   // Di chuyển: 1.5M
    { categoryId: expCatIds[2], amountLimit: 2000000 },   // Mua sắm: 2M
    { categoryId: expCatIds[3], amountLimit: 3000000 },   // Hóa đơn: 3M
    { categoryId: expCatIds[4], amountLimit: 500000 },    // Giải trí: 500K
  ];
  for (const b of budgetData) {
    await addBudget(b);
  }
}