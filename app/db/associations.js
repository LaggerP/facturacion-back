const db = require("../models");

const Suscripcion = db.suscripcion;
const Usuario = db.usuario;
const Factura = db.factura;

//Suscripcion tiene un usuario
Usuario.hasOne(Suscripcion, {foreignKey: 'usuarioId'});
Suscripcion.belongsTo(Usuario, {foreignKey: 'usuarioId'});

//Factura tiene un usuario
Usuario.hasOne(Factura, {foreignKey: 'usuarioId'});
Factura.belongsTo(Usuario, {foreignKey: 'usuarioId'});