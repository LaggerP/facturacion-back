module.exports = app => {
    //const unidades = require("../controllers/unidades.controller.js");

    const Authorization = require('../auth/authorization');

    const router = require("express").Router();


    app.use('/api', router);
};
