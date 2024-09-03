let express = require('express')
let router = express.Router()
let user = require('../controllers/userControllers')
let rolesPermissions = require("../controllers/rolesAndPermissionController")
const authenticateToken = require("../middleware/authenticaionMiddleware")
let {
    createUserValidator,
    loginValidator,
    forgot_password_validator,
    validateChangePassword,
    validateNewRole,
    validateNewPermission,
    validateUpdateRolesPermission,
    validateAssignRolesPermission } = require('../middleware/validationMiddleware')
const { validateCreateUserDataTypes,
    validateLoginDAtaTypes,
    validateForgotPasswordDataTypes,
    validateResetPasswordDataTypes,
    validateChangePasswordDataTypes,
    validateNewRoledDataTypes,
    validateNewPermissionDataTypes } = require("../middleware/validateUserDataTypes")



// user auth routes 
router.post("/create_user", authenticateToken, createUserValidator, validateCreateUserDataTypes, user.create_user)
router.post("/login", loginValidator, validateLoginDAtaTypes, user.login)
router.post("/forgot_password", forgot_password_validator, validateForgotPasswordDataTypes, user.forgot_password)
router.post("/reset_password/:token", validateResetPasswordDataTypes, user.reset_password)
router.post("/change_password", authenticateToken, validateChangePassword, validateChangePasswordDataTypes, user.change_password)
router.post("/assign_new_permissions_to_roles", validateAssignRolesPermission, rolesPermissions.assign_new_permissions_to_new_role)
router.patch("/update_permissions_assigned_to_role", validateUpdateRolesPermission, rolesPermissions.update_permissions_assigned_to_role)

module.exports = router