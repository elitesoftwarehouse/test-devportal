// Mock database pool for demo

export const pool = {
  async query(sql: string, params?: any[]) {
    console.log('[Pool] Mock query:', sql.substring(0, 100));
    return { rows: [] };
  },
  async connect() {
    return {
      query: async (sql: string, params?: any[]) => ({ rows: [] }),
      release: () => {}
    };
  }
};

export default pool;


