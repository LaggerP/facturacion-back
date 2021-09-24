const db = require("../models");
const Bill = db.bill;

exports.getBills = (req, res) => {
    Bill.findAll()
        .then(data => {
            res.status(200).send(data);
        })
        .catch(err => {
            const respuesta = {
                data: "ERROR-001",
                message: err.message || "Error",
                status: 500
            }
            res.status(500).send(respuesta);
        });
}

exports.getBillById = (req, res) => {
    Bill.findOne({where: {id: req.params.billId}})
        .then(data => {
            res.status(200).send(data);
        })
        .catch(err => {
            const respuesta = {
                data: "ERROR-001",
                message: err.message || "Error",
                status: 500
            }
            res.status(500).send(respuesta);
        });
}