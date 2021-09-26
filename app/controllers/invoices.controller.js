const db = require("../models");
const sequelize = require("sequelize");
const Invoice = db.invoice;
const Subscription = db.subscription;

exports.getInvoicesByUserId = (req, res) => {
    Invoice.findAll({where: {userId: req.params.userId}})
      .then(data => res.status(200).send(data))
      .catch(err => {
          const response = {
              data: "Error al obtener facturas",
              message: err.message || "Error",
              status: 500
          }
          res.status(500).send(response);
      });
}

exports.getInvoicesById = async (req, res) => {
    Invoice.findOne({
        where: {
            userId: req.params.userId,
            id: req.params.billId
        }
    })
      .then(data => {
          if (data !== null) res.status(200).send(data);
          throw "Factura no encontrada"
      })
      .catch(err => {
          const response = {
              data: "Factura no encontrada",
              message: err || "Error",
              status: 500
          }
          res.status(500).send(response);
      });
}

exports.createNewPaid = (req, res) => {
    Subscription.findAll({where: {userId: req.params.userId}})
      .then(subscriptions => {
          if (subscriptions.length !== 0) {
              let subscriptionID = 0;
              let invoiceData = {
                  userId: req.params.userId,
                  totalAmount: 0,
                  invoiceNumber: Math.floor(Math.random() * (90000 - 1) + 1).toString(),
                  description: "Cobro de paquetes:"
              }
              subscriptions.map(sub => {
                  const {
                      id,
                      userId,
                      name,
                      subscriptionId,
                      packageId,
                      cost,
                      billState,
                      subscribed,
                      createdAt
                  } = sub.dataValues;

                  subscriptionID = subscriptionId;

                  if (checkDate(createdAt)) {
                      invoiceData.totalAmount += cost;
                      invoiceData.description = invoiceData.description + ' ' + name + ',';
                  }
              })

              Invoice.create(invoiceData)
                .then(data => {
                    Subscription.update({billState: 1}, {where: {subscriptionId: subscriptionID}})
                      .then(async updatedData => {
                          await updateExternalSubscriptionStatus(subscriptionID, "PAGADO")
                      })
                      .catch(err => res.status(404).send(err))
                })
                .catch(err => res.status(404).send(err))
              res.status(201).send("Invoice was created");
          }
          throw "Cannot create invoice because userId doesn't exist"
      })
      .catch(err => res.status(404).send(err));
}


const updateExternalSubscriptionStatus = (subscriptionId, state) => {
    let payload = {
        "id_suscripcion": subscriptionId,
        "estado": state
    }

    console.log(payload)

}


const checkDate = (_subDate) => {
    const date = new Date();
    const day = date.getDate();
    const month = date.getMonth();
    const subDate = new Date(_subDate)
    return subDate.getDate() === day && (month - subDate.getMonth()) > 0;
}
