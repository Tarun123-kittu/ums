let express = require('express')
let router = express.Router()
let user = require('../controllers/userControllers')
let rolesAndPermissions = require("../controllers/RolesAndPermissionController")
let authenticateToken = require("../middleware/authenticaionMiddleware")
let verifyAccess = require("../middleware/verifyAccessMiddleware")
let { 
    createUserValidator, 
    loginValidator, 
    forgetPasswordValidator,
    validateChangePassword} = require('../middleware/validationMiddleware')






// user auth routes 
router.post("/create_user",authenticateToken,verifyAccess("Salary","create"),createUserValidator,user.create_user)
router.post("/login", loginValidator, user.login)
router.post("/forgot_password", forgetPasswordValidator, user.forgot_password)
router.post("/reset_password/:token", user.reset_password)
router.post("/change_password",authenticateToken,validateChangePassword,user.change_password)

//roles and permissions
router.get("/get_user_permissions",authenticateToken,rolesAndPermissions.get_user_permissions)
router.get("/get_roles_and_users",authenticateToken,rolesAndPermissions.get_roles_and_users)
router.post("/assign_role",authenticateToken,rolesAndPermissions.assign_role)





module.exports = router