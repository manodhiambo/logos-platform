import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is not set');
}

console.log('🔍 Database URL (masked):', databaseUrl.replace(/:[^:@]+@/, ':****@'));

// Parse the URL to see what Sequelize is using
try {
  const url = new URL(databaseUrl);
  console.log('📊 Parsed connection details:');
  console.log('  Protocol:', url.protocol);
  console.log('  Host:', url.hostname);
  console.log('  Port:', url.port || '5432 (default)');
  console.log('  Database:', url.pathname.slice(1));
  console.log('  Username:', url.username);
} catch (e) {
  console.error('❌ Failed to parse DATABASE_URL:', e);
}

export const sequelize = new Sequelize(databaseUrl, {
  dialect: 'postgres',
  logging: false,
  dialectOptions: {
    ssl: false, // Render internal connections don't use SSL
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

export default sequelize;
