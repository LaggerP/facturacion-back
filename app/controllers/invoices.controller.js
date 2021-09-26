const db = require("../models");
const sequelize = require("sequelize");
const axios = require("axios");

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
    console.log(req.params)
    Subscription.findAll({where: {userId: req.params.userId}})
      .then(subscriptions => {
          console.log(subscriptions.length)
          if (subscriptions.length !== 0) {
              let createInvoice = false;
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
                      createInvoice = true;
                  }
              })
              if (createInvoice) {
                  let status;
                  Invoice.create(invoiceData)
                    .then(data => {
                        Subscription.update({billState: 1}, {where: {subscriptionId: subscriptionID}})
                          .then(async updatedData => {
                              status = await updateExternalSubscriptionStatus(subscriptionID, "PAGADO")
                          })
                          .catch(err => res.status(404).send(err))
                    })
                    .catch(err => res.status(404).send(err))
                  if (status === 200) res.status(201).send("Invoice was created");
                  else res.status(400).send("The subscription to modify doesn't exist [module subs]")
              } else res.status(202).send("There are no subscriptions to create an invoice.");


          } else throw "Cannot create invoice because userId doesn't exist"
      })
      .catch(err => res.status(404).send(err));
}


const updateExternalSubscriptionStatus = (subscriptionId, state) => {
    let payload = {
        "id_suscripcion": subscriptionId,
        "estado": state
    }


    return axios.put('https://suscripciones-backend.herokuapp.com/api/subscriptions/v1/modify/status', payload)
      .then(res => res.status)
      .catch((err) => err.response.status);


}


const checkDate = (_subDate) => {
    const date = new Date();
    const day = date.getDate();
    const month = date.getMonth();
    const subDate = new Date(_subDate)
    return subDate.getDate() === day && (month - subDate.getMonth()) > 0;
}
