const express = require('express')
const router = express.Router()
const userController = require('../controllers/employeeController')
const rolesPermissionsController = require("../controllers/rolesAndPermissionController")
const holidaysAndEventsController = require("../controllers/holidaysAndEventsController")
const verifyAccess = require("../middleware/verifyAccessMiddleware")
const authenticateToken = require("../middleware/authenticaionMiddleware")
const {
    createUserValidator,
    loginValidator,
    forgetPasswordValidator,
    validateChangePassword,
    validateUpdateRolesPermission,
    validateAssignRolesPermission,
    validateDeleteUserRole,
    assignRoleValidations,
    validateHolidaysAndEvents,
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
router.get("/get_user_permissions", authenticateToken, rolesPermissionsController.get_user_permissions)
router.get("/get_roles_and_users", authenticateToken, rolesPermissionsController.get_roles_and_users)
router.post("/assign_role", authenticateToken, assignRoleValidations,rolesPermissionsController.assign_role)
router.post("/assign_new_permissions_to_roles", authenticateToken, validateAssignRolesPermission, rolesPermissionsController.assign_new_permissions_to_new_role)
router.patch("/update_permissions_assigned_to_role", authenticateToken, validateUpdateRolesPermission, rolesPermissionsController.update_permissions_assigned_to_role)
router.patch("/delete_role", authenticateToken, rolesPermissionsController.disabled_role)
router.delete("/delete_user_role",authenticateToken,validateDeleteUserRole,rolesPermissionsController.delete_user_role)



//holidays and events
router.post("/add_holidayOrEvent",authenticateToken,validateHolidaysAndEvents,holidaysAndEventsController.add_holidayOrEvent)
router.put("/update_holidayOrEvent",authenticateToken,holidaysAndEventsController.update_holidayOrEvent)
router.get("/get_all_holidaysOrEvents",authenticateToken,holidaysAndEventsController.get_all_holidaysOrEvents)
router.delete("/delete_holidayOrEvent",authenticateToken,holidaysAndEventsController.delete_holidayOrEvent)


// attendance
router.post("/mark_attendance", authenticateToken, validateAttendance, attendance.mark_attendance)
router.post("/unmark_attendance", authenticateToken, validateUnmarkAttendance, attendance.unmark_attendance)

module.exports = router