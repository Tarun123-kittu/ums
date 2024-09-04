let express = require('express')
let router = express.Router()
let user = require('../controllers/userControllers')
let rolesPermissions = require("../controllers/rolesAndPermissionController")
let verifyAccess = require("../middleware/verifyAccessMiddleware")
const authenticateToken = require("../middleware/authenticaionMiddleware")
let {
    createUserValidator,
    loginValidator,
    forgetPasswordValidator,
    validateChangePassword,
    validateUpdateRolesPermission,
<<<<<<< HEAD
    validateAssignRolesPermission,
    validateDeleteUserRole
 } = require('../middleware/validationMiddleware')

const { 
    validateCreateUserDataTypes,
=======
    assignRoleValidations,
    disableRoleValidations,
    validateAssignRolesPermission } = require('../middleware/validationMiddleware')
const { validateCreateUserDataTypes,
>>>>>>> a6787e3738b34330d9ebeb7a5ccbad5f0be5c1ba
    validateLoginDAtaTypes,
    validateForgotPasswordDataTypes,
    validateResetPasswordDataTypes,
    validateChangePasswordDataTypes,
    validateDisableRoleDataTypes,
} = require("../middleware/validateUserDataTypes")



// user auth routes 
router.post("/create_user", authenticateToken, verifyAccess("Users", "create"), createUserValidator, validateCreateUserDataTypes, user.create_user)
router.post("/login", loginValidator, validateLoginDAtaTypes, user.login)
router.post("/forgot_password", forgetPasswordValidator, validateForgotPasswordDataTypes, user.forgot_password)
router.post("/reset_password/:token", validateResetPasswordDataTypes, user.reset_password)
router.post("/change_password", validateChangePassword, validateChangePasswordDataTypes, user.change_password)


// roles and permissions
router.get("/get_user_permissions", authenticateToken, verifyAccess("Users", "view"), rolesPermissions.get_user_permissions)
router.get("/get_roles_and_users", authenticateToken, verifyAccess("Users", "view"), rolesPermissions.get_roles_and_users)
router.post("/assign_role", authenticateToken, assignRoleValidations, rolesPermissions.assign_role)
router.post("/assign_new_permissions_to_roles", authenticateToken, validateAssignRolesPermission, rolesPermissions.assign_new_permissions_to_new_role)
router.patch("/update_permissions_assigned_to_role", authenticateToken, validateUpdateRolesPermission, rolesPermissions.update_permissions_assigned_to_role)
<<<<<<< HEAD
router.patch("/delete_role", authenticateToken, rolesPermissions.disabled_role)
router.delete("/delete_user_role",authenticateToken,validateDeleteUserRole,rolesPermissions.delete_user_role)
=======
router.patch("/delete_role", authenticateToken, disableRoleValidations, validateDisableRoleDataTypes, rolesPermissions.disabled_role)
>>>>>>> a6787e3738b34330d9ebeb7a5ccbad5f0be5c1ba







module.exports = router