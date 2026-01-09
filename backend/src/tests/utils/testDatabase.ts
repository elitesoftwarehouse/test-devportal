import 'reflect-metadata';
import { DataSource } from 'typeorm';
import ormconfig from '../../ormconfig.test';

let testDataSource: DataSource | null = null;

export async function getTestDataSource(): Promise<DataSource> {
  if (testDataSource && testDataSource.isInitialized) {
    return testDataSource;
  }

  testDataSource = new DataSource(ormconfig as any);
  await testDataSource.initialize();
  return testDataSource;
}

export async function resetTestDatabase(): Promise<void> {
  if (!testDataSource || !testDataSource.isInitialized) {
    return;
  }

  const entities = testDataSource.entityMetadatas;

  for (const entity of entities) {
    const repository = testDataSource.getRepository(entity.name);
    await repository.query(`TRUNCATE TABLE "${entity.tableName}" RESTART IDENTITY CASCADE;`);
  }
}

export async function closeTestDataSource(): Promise<void> {
  if (testDataSource && testDataSource.isInitialized) {
    await testDataSource.destroy();
  }
}
