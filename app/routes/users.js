const router = require('express').Router();
const user = require('../controllers/users.controller.js');
const {verifyExternalClientToken, verifyInternalClientToken} = require('../auth/authorization');

// [INTEGRATION ENDPOINT] GET USER BY OBJECT ID - /api/user/<objId>
router.get('/:from/:token', verifyExternalClientToken, user.getUserData);

// GET USER BY OBJECT ID - /api/user/<userId>
router.get('/:userId', verifyInternalClientToken, user.getUserById);


module.exports = router;
