module.exports = (sequelize, Sequelize) => {
    const Invoice = sequelize.define("Invoices", {
        userId: {
            type: Sequelize.INTEGER,
        },
        billingDate: {
            type: Sequelize.DATE,
        },
        totalAmount: {
            type: Sequelize.FLOAT
        },
        invoiceNbr: {
            type: Sequelize.STRING
        },
        description: {
            type: Sequelize.TEXT
        }
    });
    return Invoice;
};