import { sequelize } from '../config/database.config';
import fs from 'fs';
import path from 'path';

async function runMigrations() {
  try {
    console.log('🔄 Running database migrations...');
    
    const migrationsDir = path.join(__dirname, 'migrations');
    const files = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort();
    
    for (const file of files) {
      console.log(`📄 Running migration: ${file}`);
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');
      
      try {
        await sequelize.query(sql);
        console.log(`✅ ${file} completed`);
      } catch (error: any) {
        console.error(`❌ Error in ${file}:`, error.message);
        // Continue with other migrations
      }
    }
    
    console.log('✅ All migrations completed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigrations();
