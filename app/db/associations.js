const db = require("../models");

const Subscription = db.subscription;
const User = db.user;
const Invoice = db.invoice;

//Suscripcion tiene un usuario
User.hasOne(Subscription, {foreignKey: 'userId'});
Subscription.belongsTo(User, {foreignKey: 'userId'});

//Factura tiene un usuario
User.hasOne(Invoice, {foreignKey: 'userId'});
Invoice.belongsTo(User, {foreignKey: 'userId'});
