module.exports = (sequelize, Sequelize) => {
    const Invoice = sequelize.define("invoices", {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        userId: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        billingDate: {
            type: Sequelize.DATE,
            allowNull: false
        },
        totalAmount: {
            type: Sequelize.FLOAT,
            allowNull: false
        },
        invoiceNumber: {
            type: Sequelize.STRING,
            allowNull: false
        },
        description: {
            type: Sequelize.TEXT,
            allowNull: false
        }
    });
    return Invoice;
};
