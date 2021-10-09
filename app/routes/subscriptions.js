const router = require("express").Router();
const subscriptions = require("../controllers/subscriptions.controller.js");
const {verifyInternalClientToken} = require('../auth/authorization');

// GET SUBSCRIPTIONS BY USER ID - /api/subscriptions/<userId>
router.get('/:userId',  verifyInternalClientToken, subscriptions.getSubscriptionsByUserId);

// POST SUBSCRIPTION- /api/subscriptions/external/new
router.post('/external/new', verifyInternalClientToken, subscriptions.createExternalSubscription);

// [INTEGRATION ENDPOINT] POST SUBSCRIPTION- /api/subscriptions/internal/new
router.post('/internal/new', verifyInternalClientToken, subscriptions.createInternalSubscription);

// [INTEGRATION ENDPOINT] CHANGE SUBSCRIPTION STATUS- /api/subscriptions/:userId/:subscriptionId/:packageId
router.patch('/:userId/:subscriptionId/:packageId',  verifyInternalClientToken, subscriptions.changePreDeleteSubscriptionStatus);

module.exports = router;
