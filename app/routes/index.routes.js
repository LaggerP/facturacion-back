module.exports = app => {

    const bills = require("../controllers/bills.controller.js");
    //const suscriptions = require("../controllers/suscriptions.controller.js");
    //const users = require("../controllers/users.controller.js");

    const Authorization = require('../auth/authorization');

    const router = require("express").Router();

    //GET BILLS - /api/bills
    router.get("/bills/", bills.getBills);

    //GET BILLS BY ID - /api/bills/<billId>
    router.get("/bills/:billId", bills.getBillById);

    app.use('/api', router);
};
