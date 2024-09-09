let express = require('express')
let router = express.Router()
let user = require('../controllers/employeeController')
let rolesPermissions = require("../controllers/rolesAndPermissionController")
let verifyAccess = require("../middleware/verifyAccessMiddleware")
const authenticateToken = require("../middleware/authenticaionMiddleware")
let {
    createUserValidator,
    loginValidator,
    forgetPasswordValidator,
    validateChangePassword,
    validateUpdateRolesPermission,
    validateAssignRolesPermission,
    validateDeleteUserRole,
    disableRoleValidations,
    assignRoleValidations
} = require('../middleware/validationMiddleware')

const {
    validateCreateUserDataTypes,
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
router.get("/get_employee_details/:id", authenticateToken, user.get_employee_details)
router.get("/get_users", authenticateToken, user.get_users)
router.patch("/delete_employee/:id", authenticateToken, user.delete_employee)



// roles and permissions
router.get("/get_employee_permissions", authenticateToken, verifyAccess("Salary", "view"), rolesPermissions.get_employee_permissions)
router.get("/get_roles_and_employees", authenticateToken, verifyAccess("Salary", "view"), rolesPermissions.get_roles_and_employees)
router.post("/assign_role", authenticateToken, assignRoleValidations, rolesPermissions.assign_role)
router.post("/assign_new_permissions_to_roles", authenticateToken, validateAssignRolesPermission, rolesPermissions.assign_new_permissions_to_new_role)
router.patch("/update_permissions_assigned_to_role", authenticateToken, validateUpdateRolesPermission, rolesPermissions.update_permissions_assigned_to_role)
router.patch("/delete_role", authenticateToken, rolesPermissions.disabled_role)
router.delete("/delete_employee_role", authenticateToken, validateDeleteUserRole, rolesPermissions.delete_employee_role)







module.exports = router