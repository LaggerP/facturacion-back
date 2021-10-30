const dbConfig = require('../config/db.config.js');

const Sequelize = require("sequelize");

const sequelize = new Sequelize(dbConfig.DB_URI, {
  dialect: dbConfig.dialect,
  protocol: dbConfig.protocol,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  }
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.invoice = require("./invoice.model.js")(sequelize, Sequelize);
db.subscription = require("./subscription.model.js")(sequelize, Sequelize);
db.user = require("./user.model.js")(sequelize, Sequelize);

module.exports = db;
