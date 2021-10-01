const db = require("../models");
const sequelize = require("sequelize");
const axios = require("axios");

const Invoice = db.invoice;
const Subscription = db.subscription;

/**
 * GET all Invoices by UserId
 * @param req {userId}
 * @param res
 */
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

/**
 * GET one invoice by UserId
 * @param req {userId}
 * @param res
 */
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

/**
 * CREATE new payment by userId
 * @param req {userId}
 * @param res
 */
exports.createNewPaid = (req, res) => {
    Subscription.findAll({where: {userId: req.params.userId, subscribed: true}})
      .then(async subscriptions => {
          let subscriptionIDs = [];
          if (subscriptions.length !== 0) {
              let createInvoice = false;
              let invoiceData = {
                  userId: req.params.userId,
                  totalAmount: 0,
                  invoiceNumber: Math.floor(Math.random() * (90000 - 1) + 1).toString(),
                  description: "Cobro de paquetes:"
              }
              subscriptions.map(sub => {
                  const {name, subscriptionId, cost, createdAt} = sub.dataValues;

                  subscriptionIDs.push(subscriptionId);

                  if (checkDate(createdAt)) {
                      invoiceData.totalAmount += cost;
                      invoiceData.description = invoiceData.description + ' ' + name + ',';
                      createInvoice = true;
                  }
              })

              if (createInvoice) {
                  let status = await createNewInvoice(invoiceData, subscriptionIDs);
                  if (status === 200) res.status(201).send("Invoice was created");
                  else res.status(400).send("The subscription to modify doesn't exist [module subs]")
              } else res.status(202).send("There are no subscriptions to create an invoice.");
          } else throw "Cannot create invoice because userId doesn't exist"
      })
      .catch(err => res.status(404).send(err));
}

/**
 * CREATE new NON payment by userId and subscriptionId
 * @param req {userId, subscriptionId}
 * @param res
 */
exports.createNonPay = (req, res) => {
    Subscription.update({billState: 1}, {
        where: {
            subscriptionId: req.params.subscriptionId, userId: req.params.userId
        }
    }).then(data => {
        /*
       [INTEGRATION CODE]
           //const data = await updateExternalSubscriptionStatus(req.param.subscriptionId, "NO_PAGADO");
           if (data === 200) res.status(200).send("Pago con estado NO_PAGADO realizado")
           res.status(400).send("Error al cambiar estado")
    */
        try {
            if (data[0] === 0) {
                res.status(400).send("Verifique que los datos proporcionados sean válidos")
            }

            res.status(200).send("Pago con estado NO_PAGADO realizado")
        } catch (e) {
            res.status(500).send(e)
        }
    }).catch(e => {
        res.status(500).send(e)
    });
}

/**
 * CREATE invoice and change all billState;
 * @param invoice
 * @param subscriptionIDs
 */
const createNewInvoice = async (invoice, subscriptionIDs) => {
    const newInvoices = await Invoice.create(invoice);
    if (newInvoices.dataValues !== null) {
        for (const subsId of subscriptionIDs) {
            await Subscription.update({billState: 1}, {where: {subscriptionId: subsId}});
            const data = await updateExternalSubscriptionStatus(subsId, "PAGADO")
            if (data === 400) return 400;
        }
        return 200;
    } else return 400;
}

/**
 * CHANGE subscription module BD status value;
 * @param subscriptionId
 * @param state
 */
const updateExternalSubscriptionStatus = async (subscriptionId, state) => {
    let payload = {"id_suscripcion": subscriptionId, "estado": state}
    return await axios.put('https://suscripciones-backend.herokuapp.com/api/subscriptions/v1/modify/status', payload)
      .then(async res => res.status)
      .catch((err) => err.response.status);
}

/**
 * VERIFY if the date (_subDate from DB) is 30 days different from the current date;
 * @param _subDate
 */
const checkDate = (_subDate) => {
    const date = new Date();
    const day = date.getDate();
    const month = date.getMonth();
    const subDate = new Date(_subDate)
    return subDate.getDate() - 1 === day && (month - subDate.getMonth()) > 0;
}
