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

async function fixMigrations() {
  try {
    // Check if comments table exists
    const [tables] = await sequelize.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'comments';"
    );
    
    console.log('Comments table exists:', tables.length > 0);
    
    // Check SequelizeMeta table
    const [migrations] = await sequelize.query(
      "SELECT name FROM \"SequelizeMeta\" WHERE name LIKE '%comment%' ORDER BY name;"
    );
    
    console.log('\nMigrations recorded:');
    migrations.forEach(m => console.log(' -', m.name));
    
    if (tables.length === 0 && migrations.length > 0) {
      console.log('\n⚠️  Table does not exist but migrations are marked as run.');
      console.log('Deleting migration records...');
      
      await sequelize.query(
        "DELETE FROM \"SequelizeMeta\" WHERE name LIKE '%comment%';"
      );
      
      console.log('✅ Migration records deleted. Run migrations again.');
    } else if (tables.length > 0) {
      console.log('\n✅ Comments table already exists!');
    } else {
      console.log('\n✅ Ready to run migrations.');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

fixMigrations();
