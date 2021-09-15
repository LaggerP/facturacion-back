module.exports = (sequelize, Sequelize) => {
    const Factura = sequelize.define("facturas", {
        usuarioId: {
            type: Sequelize.INTEGER,
        },
        fechaFacturacion: {
            type: Sequelize.DATE,
        },
        montoTotal: {
            type: Sequelize.FLOAT
        },
        nroFactura: {
            type: Sequelize.STRING
        },
        descripcion: {
            type: Sequelize.TEXT
        }
    });
    return Factura;
};