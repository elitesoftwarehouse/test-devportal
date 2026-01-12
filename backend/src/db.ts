// Mock database connection for demo purposes

export interface DbPool {
  query(sql: string, params?: any[]): Promise<{ rows: any[] }>;
}

export const db: DbPool = {
  async query(sql: string, params?: any[]) {
    console.log('[DB] Mock query:', sql.substring(0, 100));
    return { rows: [] };
  }
};

export default db;


