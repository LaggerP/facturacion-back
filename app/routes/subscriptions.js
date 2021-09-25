const router = require("express").Router();
const subscriptions = require("../controllers/subscriptions.controller.js");

// GET SUBSCRIPTIONS BY USER ID - /api/subscriptions/<userId>
router.get('/:userId', subscriptions.getSubscriptionsByUserId);

// POST SUBSCRIPTION- /api/subscriptions/external/new
router.post('/external/new', subscriptions.createExternalSubscription);

// [INTEGRATION ENDPOINT] POST SUBSCRIPTION- /api/subscriptions/internal/new
//router.post('/internal/new', subscriptions.createExternalSubscription);

module.exports = router;
