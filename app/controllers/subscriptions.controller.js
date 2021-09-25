const db = require("../models");
const Subscription = db.subscription;

exports.getSubscriptionsByUserId = (req, res) => {
    Subscription.findAll({ where: { userId: req.params.userId } })
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
