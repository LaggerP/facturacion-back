const router = require('express').Router();
const user = require("../controllers/users.controller.js");

//GET USER BY OBJECT ID - /api/user/<objId>
router.get("/:objId", user.getUserByObjectId);

//GET USER BY OBJECT ID - /api/user/<userId>
router.get("/:userId", user.getUserById);


module.exports = router;
