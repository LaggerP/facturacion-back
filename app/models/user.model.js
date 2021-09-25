module.exports = (sequelize, Sequelize) => {
    const User = sequelize.define("users", {
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
        firstName: {
            type: Sequelize.STRING,
            validate: {
                len: {
                    args: [2, 255],
                    msg: "ERROR-2"
                }
            }
        },
        lastName: {
            type: Sequelize.STRING,
            validate: {
                len: {
                    args: [2, 255],
                    msg: "ERROR-3"
                }
            }
        },
        phoneNumber: {
            type: Sequelize.STRING
        }
    });
    return User;
};