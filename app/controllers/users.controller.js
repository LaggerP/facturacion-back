const db = require("../models");
const User = db.user;

exports.getUsers = (req, res) => {
    User.findAll()
        .then(data => {
            res.status(200).send(data);
        })
        .catch(err => {
            const response = {
                data: "Errpr al obtener usuarios",
                message: err.message || "Error",
                status: 500
            }
            res.status(500).send(response);
        });
}

exports.getUserById = (req, res) => {
    User.findOne({where: {id: req.params.userId}})
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