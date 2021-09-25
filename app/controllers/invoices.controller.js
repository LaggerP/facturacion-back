const db = require("../models");
const Invoice = db.invoice;

exports.getInvoicesByUserId = (req, res) => {
    Invoice.findAll({where: {userId: req.params.userId}})
      .then(data => {
          res.status(200).send(data);
      })
      .catch(err => {
          const response = {
              data: "Error al obtener facturas",
              message: err.message || "Error",
              status: 500
          }
          res.status(500).send(response);
      });
}

exports.getInvoicesById = (req, res) => {
    Invoice.findOne({
        where: {
            userId: req.params.userId,
            id: req.params.billId
        }
    })
      .then(data => {
          res.status(200).send(data);
      })
      .catch(err => {
          const response = {
              data: "Factura no encontrada",
              message: err.message || "Error",
              status: 500
          }
          res.status(500).send(response);
      });
}
