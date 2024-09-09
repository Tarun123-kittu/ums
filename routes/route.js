let express = require('express')
let router = express.Router()
let user = require('../controllers/userController')
let rolesPermissions = require("../controllers/rolesAndPermissionController")
let attendance = require("../controllers/attendanceController")
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
    assignRoleValidations,
    validateAttendance,
    validateUnmarkAttendance
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
router.post("/create_user", authenticateToken, createUserValidator, validateCreateUserDataTypes, user.create_user)
router.post("/login", loginValidator, validateLoginDAtaTypes, user.login)
router.post("/forgot_password", forgetPasswordValidator, validateForgotPasswordDataTypes, user.forgot_password)
router.post("/reset_password/:token", validateResetPasswordDataTypes, user.reset_password)
router.post("/change_password", validateChangePassword, validateChangePasswordDataTypes, user.change_password)
router.get("/get_employee_details/:id", authenticateToken, user.get_employee_details)
router.get("/get_employees", authenticateToken, user.get_employees)
router.patch("/delete_employee/:id", authenticateToken, user.delete_employee)



// roles and permissions
router.get("/get_user_permissions", authenticateToken, rolesPermissions.get_user_permissions)
router.get("/get_roles_and_users", authenticateToken, rolesPermissions.get_roles_and_users)
router.post("/assign_role", authenticateToken, assignRoleValidations, rolesPermissions.assign_role)
router.post("/assign_new_permissions_to_roles", authenticateToken, validateAssignRolesPermission, rolesPermissions.assign_new_permissions_to_new_role)
router.patch("/update_permissions_assigned_to_role", authenticateToken, validateUpdateRolesPermission, rolesPermissions.update_permissions_assigned_to_role)
router.patch("/delete_role", authenticateToken, rolesPermissions.disabled_role)
router.delete("/delete_user_role", authenticateToken, validateDeleteUserRole, rolesPermissions.delete_user_role)


// attendnce routes
router.post("/mark_attendance", authenticateToken, validateAttendance, attendance.mark_attendance)
router.post("/unmark_attendance", authenticateToken, validateUnmarkAttendance, attendance.unmark_attendance)











module.exports = router