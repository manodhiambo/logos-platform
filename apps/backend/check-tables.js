const { sequelize } = require('./dist/config/database.config');

async function checkTables() {
  try {
    const [results] = await sequelize.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;"
    );
    console.log('Existing tables:');
    results.forEach(row => console.log(' -', row.table_name));
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkTables();
