const router = require('express').Router();
const user = require('../controllers/users.controller.js');
const middleware = require('../auth/authorization');

// [INTEGRATION ENDPOINT] GET USER BY OBJECT ID - /api/user/<objId>
router.get('/get-user-data/', middleware.verifyExternalClientToken, user.getUserData);

// GET USER BY OBJECT ID - /api/user/<userId>
router.get('/:userId', user.getUserById);


module.exports = router;
