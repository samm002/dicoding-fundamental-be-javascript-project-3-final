const redis = require('redis');
const generateSecondFromHour = require('../utils/generateSecondFromHour');

class Cache {
  constructor() {
    this._generateSecondFromHour = generateSecondFromHour;
    this._client = redis.createClient({
      socket: {
        host: process.env.REDIS_SERVER,
      },
    });

    this._client.on('error', (error) => {
      console.error(error);
    });

    this._client.on('connect', () => {
      console.log('Redis connection success');
    });

    this._client.connect();
  }

  // Fix set cache duration to 30 minutes
  async set(key, value, expirationInSecond = process.env.CACHE_DURATION || 0.5) {
    await this._client.set(key, value, {
      EX: this._generateSecondFromHour(expirationInSecond),
    });
  }

  async get(key) {
    const result = await this._client.get(key);

    if (result === null) throw new Error('Cache not found');

    return result;
  }

  delete(key) {
    return this._client.del(key);
  }
}

module.exports = Cache;
