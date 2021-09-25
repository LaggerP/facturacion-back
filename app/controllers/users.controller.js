const db = require("../models");
const User = db.user;

exports.getUserByObjectId = (req, res) => {
    User.findOne({where: {objId: req.params.objId}})
      .then(data => {
          res.status(200).send(data);
      })
      .catch(err => {
          const response = {
              data: "Ususario no encontrado",
              message: err.message || "Error",
              status: 500
          }
          res.status(500).send(response);
      });
}
