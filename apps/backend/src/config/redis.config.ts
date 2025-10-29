import Redis from 'ioredis';
import config from './env.config';

// Redis is optional - comment out if not using
/*
const redis = new Redis({
  host: config.redis.host,
  port: config.redis.port,
});

redis.on('error', (err: any) => {
  console.error('Redis connection error:', err);
});
*/

// Export null for now if not using Redis
export default null; // redis;
