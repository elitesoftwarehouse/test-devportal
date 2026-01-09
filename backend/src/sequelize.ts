import { Sequelize } from 'sequelize';

let sequelizeInstance: Sequelize | null = null;

export async function getSequelizeInstance(): Promise<Sequelize> {
  if (!sequelizeInstance) {
    sequelizeInstance = new Sequelize(
      process.env.DB_NAME || 'elite_portal',
      process.env.DB_USER || 'root',
      process.env.DB_PASSWORD || '',
      {
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT) || 3306,
        dialect: 'mysql',
        logging: false,
      }
    );
  }
  return sequelizeInstance;
}
