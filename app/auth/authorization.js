var jwt = require('jsonwebtoken');
const db = require("../models");
const Usuario = db.usuario;
require('dotenv').config()

var authorization = function (req, res, next) {
    var token = req.headers['x-access-token'];

    //No hay token
    let mensaje = {
        auth: false,
        mensaje: "ERROR-0001",
        status: 403
    }

    if (!token){
        res.status(403).send(mensaje);
    }else{
        //Error al autenticar token
        jwt.verify(token, process.env.AUTH_SECRET, function (err, decoded) {
            let mensaje = {
                auth: false,
                mensaje: "ERROR-0002",
                status: 403
            }
            if (err)
                res.status(403).send(mensaje);

            Usuario.findOne({where: {id: decoded.usuario.id, correo: decoded.usuario.correo, habilitado: true, token: token}})
                .then(data => {
                    if(data == null){
                        //El usuario enviado por token no coincide o no está habilitado
                        let mensaje = {
                            auth: false,
                            mensaje: "ERROR-0003",
                            status: 403
                        }
                        res.status(403).send(mensaje);
                    }else{
                        req.userId = data.id;
                        next();
                    }
                })
        });
    }
}

module.exports = authorization;