const router = require('express').Router();
const invoices = require("../controllers/invoices.controller.js");

//GET BILLS BY USER ID- /api/invoices/<userId>
router.get("/:userId", invoices.getInvoicesByUserId);

//GET BILLS BY ID - /api/invoices/<userId>/<billId>
router.get("/:userId/:billId", invoices.getInvoicesById);

module.exports = router;
