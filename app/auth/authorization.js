require('dotenv').config()
const jwt = require('jsonwebtoken');
const fs = require("fs");
const PUBLIC_KEY = fs.readFileSync(__dirname + '/jwtPublic.key');

/**
 * Checks if token from FyA app is valid.
 * @param req
 * @param res
 * @param next
 */
const verifyInternalClientToken = async (req, res, next) => {
    const bearer = req.headers.authorization;
    if (bearer === undefined) res.status(400).json({errorMessage: "Provide a valid token"})
    else {
        const bearerToken = bearer.split(' ')[1];
        jwt.verify(bearerToken, process.env.FyA_AUTH_SECRET, (err, decoded) => {
            if (err) res.status(403).json({errorMessage: "Not Authorized"});
            next();
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
    let {token, from} = req.params;
    if (token.length === 0) res.status(400).json({errorMessage: "Provide a valid token "});
    jwt.verify(token, PUBLIC_KEY, (err, decoded) => {
        if (err) res.status(403).json({errorMessage: "Not Authorized"});
        req.body.clientData = decoded;
        next();
    });
};

module.exports = {
    verifyInternalClientToken,
    verifyExternalClientToken
};
