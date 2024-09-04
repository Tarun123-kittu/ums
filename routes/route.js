let express = require('express')
let router = express.Router()
let user = require('../controllers/userControllers')
let rolesPermissions = require("../controllers/rolesAndPermissionController")
const authenticateToken = require("../middleware/authenticaionMiddleware")
let {
    createUserValidator,
    loginValidator,
    forgetPasswordValidator,
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
} = require("../middleware/validateUserDataTypes")



// user auth routes 
router.post("/create_user", authenticateToken, createUserValidator, validateCreateUserDataTypes, user.create_user)
router.post("/login", loginValidator, validateLoginDAtaTypes, user.login)
router.post("/forgot_password", forgetPasswordValidator, validateForgotPasswordDataTypes, user.forgot_password)
router.post("/reset_password/:token", validateResetPasswordDataTypes, user.reset_password)
router.post("/change_password", authenticateToken, validateChangePassword, validateChangePasswordDataTypes, user.change_password)


//roles and permissions
router.get("/get_user_permissions", authenticateToken, rolesPermissions.get_user_permissions)
router.get("/get_roles_and_users", authenticateToken, rolesPermissions.get_roles_and_users)
router.post("/assign_role", authenticateToken, rolesPermissions.assign_role)
router.post("/assign_new_permissions_to_roles", validateAssignRolesPermission, rolesPermissions.assign_new_permissions_to_new_role)
router.patch("/update_permissions_assigned_to_role", validateUpdateRolesPermission, rolesPermissions.update_permissions_assigned_to_role)





module.exports = router