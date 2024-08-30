let express = require('express')
let router = express.Router()
let user = require('../controllers/userControllers')
let { createUserValidator, loginValidator } = require('../middleware/validationMiddleware')
const authenticateToken = require("../middleware/authenticaionMiddleware")

//test route
// router.get("/test",user.test)

router.post("/create_user", createUserValidator, authenticateToken, user.createUser)
router.post("/login", loginValidator, user.login)

module.exports = router