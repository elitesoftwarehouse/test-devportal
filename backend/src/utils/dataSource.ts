import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { ProfessionalProfile } from '../models/ProfessionalProfile';

let dataSource: DataSource | null = null;

export function getDataSource(): DataSource {
  if (!dataSource) {
    dataSource = new DataSource({
      type: 'sqlite',
      database: process.env.DB_PATH || ':memory:',
      synchronize: true,
      logging: false,
      entities: [ProfessionalProfile],
    });
  }
  if (!dataSource.isInitialized) {
    throw new Error('DATASOURCE_NOT_INITIALIZED');
  }
  return dataSource;
}

export async function initDataSource(): Promise<DataSource> {
  if (!dataSource) {
    dataSource = new DataSource({
      type: 'sqlite',
      database: process.env.DB_PATH || ':memory:',
      synchronize: true,
      logging: false,
      entities: [ProfessionalProfile],
    });
  }
  if (!dataSource.isInitialized) {
    await dataSource.initialize();
  }
  return dataSource;
}

export async function closeDataSource(): Promise<void> {
  if (dataSource && dataSource.isInitialized) {
    await dataSource.destroy();
  }
}
