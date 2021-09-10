require('dotenv').config()

module.exports = {
  HOST: process.env.DEV == "true"? process.env.DEV_DB_HOST : process.env.PROD_DB_HOST,
  USER: process.env.DEV == "true" ? process.env.DEV_DB_USER : process.env.PROD_DB_USER,
  PASSWORD: process.env.DEV == "true" ? process.env.DEV_DB_PASS : process.env.PROD_DB_PASS,
  DB: process.env.DEV == "true" ? process.env.DEV_DB_DB : process.env.PROD_DB_DB,
  dialect: "mysql",
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
};