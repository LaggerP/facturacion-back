module.exports = (sequelize, Sequelize) => {
    const Subscription = sequelize.define("subscriptions", {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        userId: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },
        name: {
            type: Sequelize.STRING,
            allowNull: false,
            validate: {
                len: {
                    args: [2, 255],
                    msg: "ERROR-2"
                }
            }
        },
        subscriptionId: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },
        packageId: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },
        cost: {
            type: Sequelize.FLOAT,
            allowNull: false,
        },
        entryDate: {
            type: Sequelize.DATE,
            allowNull: false,
        },
        billState: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },
        suscribed: {
            type: Sequelize.BOOLEAN
        },
    });
    return Subscription;
};
