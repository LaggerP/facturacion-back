const db = require("../models");
const sequelize = require("sequelize");
const axios = require("axios");

const Invoice = db.invoice;
const Subscription = db.subscription;
const {createPDFInvoice} = require("../services/pdf")
const {sendNewInvoiceEmail, sendNonPaidEmail} = require("../services/mailer")


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
 * CREATE new payment by userId and email
 * @param req {userId, email}
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
                  invoiceData.description = invoiceData.description.slice(0, -1) //delete final coma
                  let status = await createNewInvoice(invoiceData, subscriptionIDs);
                  if (status === 200) {
                      await sendNewInvoiceEmail(req.body.email, invoiceData.description, invoiceData.invoiceNumber)
                      res.status(201).send("Invoice was created");
                  } else res.status(400).send("The subscription to modify doesn't exist [module subs]")
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
exports.createNonPay = async (req, res) => {
    try {
        //billState: 2 (DEMORADO)
        const updatedState = await Subscription.update({billState: 2}, {
            where: {subscriptionId: req.params.subscriptionId, userId: req.params.userId}
        });

        if (updatedState[0] !== 0) {
            const externalUpdated = await updateExternalSubscriptionStatus(req.params.subscriptionId, "DEMORADO");
            if (externalUpdated === 200) {
                await sendNonPaidEmail(req.body.email);
                res.status(200).send("Pago con estado DEMORADO realizado");
            } else if (externalUpdated === 400) {
                res.status(400).send("SUBSCRIPTION MODULE - La subscriptionId" +
                  " brindada no existe en el módulo de" +
                  " suscripciones");
            } else res.status(500).send("SUBSCRIPTION MODULE - Server error");
        } else {
            res.status(400).send("Verifique que los datos proporcionados sean válidos");
        }
    } catch (error) {
        res.status(500).send("Server FyA error")
    }
}

/**
 * CREATE new pdf Invoice
 * @param req {userId, billId}
 * @param res
 */
exports.getPDFInvoice = (req, res) => {
    Invoice.findOne({
        where: {
            userId: req.params.userId,
            id: req.params.billId
        }
    })
        .then(async data => {
            if (data !== null) {
                Subscription.findAll({where: {userId: req.params.userId, subscribed: true}})
                    .then(async subscriptions => {
                        if(subscriptions !== null){
                            //Generate PDF
                            await createPDFInvoice(res, data, subscriptions);
                        }else{
                            throw "Factura no encontrada";
                        }
                    })
                    .catch(err => {
                        const response = {
                            data: "Error al obtener suscripciones",
                            message: err.message || "Error",
                            status: 500
                        }
                        res.status(500).send(response);
                    });
            } else {
                throw "Factura no encontrada";
            }
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
    let headers = {'X-Auth-Key': process.env.SECRET_SUBSCRIPTIONS_KEY}
    return await axios.put('https://suscripciones-backend.herokuapp.com/api/subscriptions/v1/modify/status', payload, {headers:headers})
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
    return subDate.getDate() === day && (month - subDate.getMonth()) > 0;
}
