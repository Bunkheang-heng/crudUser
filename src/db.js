import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pkg;

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'node12344',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 2001,
  database: process.env.DB_NAME || 'node_db'
});

pool.on('connect', () => {
  console.log('Connected to the database');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

export default pool;
