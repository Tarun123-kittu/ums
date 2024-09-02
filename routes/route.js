let express = require('express')
let router = express.Router()
let user = require('../controllers/userControllers')
let { createUserValidator, loginValidator, forgot_password_validator } = require('../middleware/validationMiddleware')
const authenticateToken = require("../middleware/authenticaionMiddleware")

//test route
// router.get("/test",user.test)

router.post("/create_user", createUserValidator, authenticateToken, user.createUser)
router.post("/login", loginValidator, user.login)
router.post("/forgot_password", forgot_password_validator, user.forgot_password)
router.post("/reset_password/:token", user.reset_password)

module.exports = router