const router = require('express').Router();
const invoices = require("../controllers/invoices.controller.js");

//POST NEW PAID BY USER ID- /api/invoices/<userId>/new-paid
router.post("/:userId/new-paid", invoices.createNewPaid);

//CHANGE STATUS FOR NON PAY - /api/invoices/<userId>/new-paid
router.post("/:userId/:subscriptionId/non-paid", invoices.createNonPay);

//GET BILLS BY USER ID- /api/invoices/<userId>
router.get("/:userId", invoices.getInvoicesByUserId);

//GET BILLS BY ID - /api/invoices/<userId>/<billId>
router.get("/:userId/:billId", invoices.getInvoicesById);



module.exports = router;
