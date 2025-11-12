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

async function clearFailedMigration() {
  try {
    await sequelize.query(
      "DELETE FROM \"SequelizeMeta\" WHERE name LIKE '%fix-announcements%';"
    );
    console.log('✅ Failed migration records cleared');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

clearFailedMigration();
