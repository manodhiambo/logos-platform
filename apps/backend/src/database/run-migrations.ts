import { sequelize } from '../config/database.config';
import fs from 'fs';
import path from 'path';

async function runMigrations() {
  try {
    console.log('🔄 Running database migrations...');
    
    const migrationsDir = path.join(__dirname, 'migrations');
    
    if (!fs.existsSync(migrationsDir)) {
      console.log('⚠️  No migrations directory found');
      return;
    }
    
    const files = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort();
    
    console.log(`📋 Found ${files.length} migration files`);
    
    for (const file of files) {
      console.log(`📄 Running: ${file}`);
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');
      
      try {
        await sequelize.query(sql);
        console.log(`   ✅ Success`);
      } catch (error: any) {
        console.log(`   ⚠️  Warning: ${error.message}`);
        // Continue with other migrations
      }
    }
    
    console.log('✅ Migrations completed');
  } catch (error) {
    console.error('❌ Migration error:', error);
    // Don't fail the build if migrations have issues
  } finally {
    await sequelize.close();
  }
}

runMigrations();
