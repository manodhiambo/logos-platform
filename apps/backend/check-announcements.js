const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('postgresql://logos_user:9HdXZOWCm08sjiX5VdlHNbWED9UafTpd@dpg-d40t6u8dl3ps73dahakg-a.oregon-postgres.render.com/logos_platform', {
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  },
  logging: false
});

async function checkTable() {
  try {
    // Check if announcements table exists
    const [tables] = await sequelize.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'announcements';"
    );
    
    console.log('Announcements table exists:', tables.length > 0);
    
    if (tables.length > 0) {
      // Check columns
      const [columns] = await sequelize.query(
        "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'announcements' ORDER BY column_name;"
      );
      
      console.log('\nColumns in announcements table:');
      columns.forEach(col => console.log(` - ${col.column_name} (${col.data_type})`));
    } else {
      console.log('\n⚠️  Announcements table does not exist. Need to create it.');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkTable();
