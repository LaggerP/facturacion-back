module.exports = (sequelize, Sequelize) => {
    const Subscription = sequelize.define("subscriptions", {
        userId: {
            type: Sequelize.INTEGER,
        },
        name: {
            type: Sequelize.STRING,
            validate: {
                len: {
                    args: [2, 255],
                    msg: "ERROR-2"
                }
            }
        },
        packageId: {
            type: Sequelize.INTEGER
        },
        cost: {
            type: Sequelize.FLOAT
        },
        entryDate: {
            type: Sequelize.DATE
        },
        bill_state: {
            type: Sequelize.INTEGER
        },
        suscribed: {
            type: Sequelize.BOOLEAN
        },
    });
    return Subscription;
};