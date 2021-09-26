const db = require("../models");
const jwt = require("jsonwebtoken");
const User = db.user;
const Subscription = db.subscription;
const Invoice = db.invoice;

/**
 * Get all fundamental data from user if client token is valid.
 * @param req
 * @param res
 */
exports.getUserData = (req, res) => {
    User.findOne({where: {objId: req.body.clientData.objectId}})
      .then(async data => {
          const packages = await Subscription.findAll({where: {userId: data.id}});
          const lastInvoice = await Invoice.findOne({
              where: { userId: data.id },
              order: [ [ 'id', 'DESC' ]],
          });
          res.status(200).json({
              userData: data,
              packages : packages,
              lastInvoice: lastInvoice,
              token: await jwt.sign({id: data.id}, process.env.FyA_AUTH_SECRET, {expiresIn: 86400})
          });
      })
      .catch(err => {
          const response = {
              data: "Usuario no encontrado",
              message: err.message || "Error",
              status: 500
          }
          res.status(500).send(response);
      });
}

/**
 * Get user by user ID.
 * @param req
 * @param res
 */
exports.getUserById = (req, res) => {
    User.findOne({where: {id: req.params.userId}})
      .then(data => {
          res.status(200).send(data);
      })
      .catch(err => {
          const response = {
              data: "Usuario no encontrado",
              message: err.message || "Error",
              status: 500
          }
          res.status(500).send(response);
      });
}
