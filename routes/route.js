let express = require('express')
let router = express.Router()
let user = require('../controllers/userControllers')
const authenticateToken = require("../middleware/authenticaionMiddleware")
let {
    createUserValidator,
    loginValidator,
    forgot_password_validator,
    validateChangePassword } = require('../middleware/validationMiddleware')



// user auth routes 
router.post("/create_user", createUserValidator, authenticateToken, user.create_user)
router.post("/login", loginValidator, user.login)
router.post("/forgot_password", forgot_password_validator, user.forgot_password)
router.post("/reset_password/:token", user.reset_password)
router.post("/change_password", authenticateToken, validateChangePassword, user.change_password)

module.exports = router