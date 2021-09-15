module.exports = (sequelize, Sequelize) => {
    const Usuario = sequelize.define("usuarios", {
        email: {
            type: Sequelize.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: {
                    msg: "ERROR-1"
                }
            }
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
        apellido: {
            type: Sequelize.STRING,
            validate: {
                len: {
                    args: [2, 255],
                    msg: "ERROR-3"
                }
            }
        },
        telefono: {
            type: Sequelize.STRING
        }
    });
    return Usuario;
};