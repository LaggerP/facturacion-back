require('dotenv').config()
const jwt = require('jsonwebtoken');
const db = require("../models");
const user = db.user;

const authorization = function (req, res, next) {
    const token = req.headers['x-access-token'];

    //No hay token
    let missingTokenMessage = {
        auth: false,
        mensaje: "ERROR-0001",
        status: 403
    }

    if (!token) {
        res.status(403).send(missingTokenMessage);
    } else {
        //Error al autenticar token
        jwt.verify(token, process.env.AUTH_SECRET, function (err, decoded) {
            let unauthorizedMessage = {
                auth: false,
                mensaje: "ERROR-0002",
                status: 401
            }
            if (err) res.status(403).send(unauthorizedMessage);

            user.findOne({
                where: {
                    id: decoded.usuario.id,
                    correo: decoded.usuario.correo,
                    habilitado: true,
                    token: token
                }
            })
              .then(data => {
                  if (data == null) {
                      //El usuario enviado por token no coincide o no está habilitado
                      let mensaje = {
                          auth: false,
                          mensaje: "ERROR-0003",
                          status: 403
                      }
                      res.status(403).send(mensaje);
                  } else {
                      req.userId = data.id;
                      next();
                  }
              })
        });
    }
};


/**
 * Checks if token from web/mobile app is valid.
 * @param req
 * @param res
 * @param next
 */
const verifyExternalClientToken = async (req, res, next) => {
    let {token, client} = req.body;
    if (token.length === 0) res.status(400).json({error: "Provide a valid token "});
    const secretKey = client === "web" ? process.env.SECRET_WEB_JWT : process.env.SECRET_MOBILE_JWT;
    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) res.status(403).json({error: "Not Authorized"});
        req.body.clientData = decoded;
        next();
    });

};

module.exports = {
    authorization,
    verifyExternalClientToken
};
