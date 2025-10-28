import { Sequelize } from 'sequelize';
import { config } from './env.config';

export const sequelize = new Sequelize(
  config.database.name,
  config.database.user,
  config.database.password,
  {
    host: config.database.host,
    port: config.database.port,
    dialect: 'postgres',
    logging: config.nodeEnv === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    dialectOptions: {
      // Add SSL options if needed for production
      // ssl: {
      //   require: true,
      //   rejectUnauthorized: false,
      // },
    },
  }
);

export const connectDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');
    
    // Sync models in development (be careful in production)
    if (config.nodeEnv === 'development') {
      // await sequelize.sync({ alter: true });
      console.log('📦 Database models synced.');
    }
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
    process.exit(1);
  }
};
