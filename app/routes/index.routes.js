module.exports = app => {

    const bills = require("../controllers/bills.controller.js");
    const subscriptions = require("../controllers/subscriptions.controller.js");
    const users = require("../controllers/users.controller.js");

    const Authorization = require('../auth/authorization');

    const router = require("express").Router();

    //GET BILLS BY USER ID- /api/bills/<userId>
    router.get("/bills/:userId", bills.getBillsByUserId);

    //GET BILLS BY ID - /api/bills/<billId>
    router.get("/bills/:billId", bills.getBillById);

    //GET SUBSCRIPTIONS BY USER ID - /api/subscriptions/<userId>
    router.get("/subscriptions/:userId", subscriptions.getSubscriptionsByUserId);

    //GET USER BY OBJECT ID - /api/bills/<billId>
    router.get("/users/:userId", users.getUserByObjectId);

    app.use('/api', router);
};
