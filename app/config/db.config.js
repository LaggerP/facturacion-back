require('dotenv').config()

module.exports = {
    DB_URI: process.env.DEV === "true" ? process.env.DEV_DB_URI : process.env.PROD_DB_URI,
    dialect: 'postgres',
    protocol: 'postgres',
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
};
