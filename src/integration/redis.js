const redis = require('redis');
const dotenv = require("dotenv");

dotenv.config();

// const client = redis.createClient({
//     password: process.env.REDIS_PASSWORD,
//     socket: {
//         host: process.env.REDIS_HOST,
//         port: process.env.REDIS_PORT
//     }
// })

// client.on('connect', () => {
//     console.log('Redis client connected')
// })

// client.on('error', (err) => {
//     console.error('Redis client error: ', err);
// });

// module.exports = client
async function initializeRedis() {
	const client = redis.createClient({
		password: process.env.REDIS_PASSWORD,
		socket: {
			host: process.env.REDIS_HOST,
			port: process.env.REDIS_PORT,
		},
	});

	client.on("error", (err) => {
		console.error("Redis Client Error", err);
	});

    client.on('connect', () => {
         console.log('Redis client connected')
        })

	await client.connect();
    
	return client;
}

const redisClientPromise = initializeRedis();

module.exports = redisClientPromise;