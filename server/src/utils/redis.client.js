import { createClient, defineScript } from 'redis';

export const TOKEN_BUCKET_SCRIPT = `
local key = KEYS[1]
local capacity = tonumber(ARGV[1])
local refill_rate = tonumber(ARGV[2])
local refill_interval = tonumber(ARGV[3])
local now = tonumber(ARGV[4])

local bucket = redis.call('HMGET', key, 'tokens', 'last_refill')
local tokens = tonumber(bucket[1])
local last_refill = tonumber(bucket[2])

if tokens == nil then
    tokens = capacity
    last_refill = now
end

local time_passed = now - last_refill
local refills = math.floor(time_passed / refill_interval)
if refills > 0 then
    tokens = math.min(capacity, tokens + (refills * refill_rate))
    last_refill = last_refill + (refills * refill_interval)
end

local allowed = 0
if tokens >= 1 then
    tokens = tokens - 1
    allowed = 1
end

redis.call('HMSET', key, 'tokens', tokens, 'last_refill', last_refill)
local ttl = math.ceil(capacity / refill_rate) * refill_interval * 2
redis.call('EXPIRE', key, ttl)

return {allowed, tokens}
`;

export const RESERVE_SEAT_SCRIPT = `
local key = KEYS[1]
local max_seats = tonumber(ARGV[1])

local current_participants = tonumber(redis.call('GET', key) or '0')

if current_participants < max_seats then
    redis.call('INCR', key)
    return 1
else
    return 0
end
`;

const redisClient = createClient({
    url: process.env.REDIS_URL || 'redis://127.0.0.1:6379'
});

redisClient.on('error', (err) => console.error('Redis Client Error', err));

let isConnected = false;

export const connectRedis = async () => {
    if (!isConnected) {
        await redisClient.connect();
        isConnected = true;
    }
};

redisClient.tokenBucket = async (key, capacity, refillRate, refillInterval, now) => {
    return redisClient.eval(TOKEN_BUCKET_SCRIPT, {
        keys: [key],
        arguments: [String(capacity), String(refillRate), String(refillInterval), String(now)]
    });
};

redisClient.reserveSeat = async (key, maxSeats) => {
    return redisClient.eval(RESERVE_SEAT_SCRIPT, {
        keys: [key],
        arguments: [String(maxSeats)]
    });
};

export default redisClient;
