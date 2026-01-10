// Mock DataSource for demo purposes
// In production, configure with actual TypeORM DataSource

export const AppDataSource = {
  isInitialized: false,
  async initialize() {
    console.log('[DataSource] Mock database initialized');
    this.isInitialized = true;
    return this;
  },
  getRepository(entity: any) {
    return {
      find: async () => [],
      findOne: async () => null,
      save: async (data: any) => ({ id: Date.now(), ...data }),
      delete: async () => ({ affected: 1 })
    };
  }
};

export default AppDataSource;


