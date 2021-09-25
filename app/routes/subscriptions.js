const router = require("express").Router();
const subscriptions = require("../controllers/subscriptions.controller.js");

//GET SUBSCRIPTIONS BY USER ID - /api/subscriptions/<userId>
router.get("/:userId", subscriptions.getSubscriptionsByUserId);


module.exports = router;
