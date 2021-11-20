require('dotenv').config()

module.exports = {
    DATABASE_URL: process.env.DEV === "true" ? process.env.DEV_DATABASE_URL : process.env.DATABASE_URL,
    dialect: 'postgres',
    protocol: 'postgres',
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
};
