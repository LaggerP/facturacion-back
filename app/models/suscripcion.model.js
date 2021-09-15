module.exports = (sequelize, Sequelize) => {
    const Suscripcion = sequelize.define("suscripciones", {
        usuarioId: {
            type: Sequelize.INTEGER,
        },
        nombre: {
            type: Sequelize.STRING,
            validate: {
                len: {
                    args: [2, 255],
                    msg: "ERROR-2"
                }
            }
        },
        refPaqueteId: {
            type: Sequelize.INTEGER
        },
        precio: {
            type: Sequelize.FLOAT
        },
        fechaAlta: {
            type: Sequelize.DATE
        },
        estado: {
            type: Sequelize.INTEGER
        },
        contratado: {
            type: Sequelize.BOOLEAN
        },
    });
    return Suscripcion;
};