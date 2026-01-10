import knex, { Knex } from 'knex';
import { knexConfig } from './knexfile';

export const db: Knex = knex(knexConfig);
