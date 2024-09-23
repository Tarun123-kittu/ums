const express = require('express')
const router = express.Router()
const userController = require('../controllers/userController')
const rolesPermissionsController = require("../controllers/rolesAndPermissionController")
const holidaysAndEventsController = require("../controllers/holidaysAndEventsController")
const attendanceController = require("../controllers/attendanceController")
const leaveController = require("../controllers/leaveController")
const interviewLeadsController = require('../controllers/interviewLeads')
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
    validateHolidaysAndEvents,
    disableRoleValidations,
    assignRoleValidations,
    validateUnmarkAttendance,
    validateGetAttendanceDetails,
    validateUpdateUserAttendance,
    validateLeaveRequest,
    validateCreateLeads,
    validateUpdateLead
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
router.post("/create_user", authenticateToken, createUserValidator, validateCreateUserDataTypes, userController.create_user)
router.post("/login", loginValidator, validateLoginDAtaTypes, userController.login)
router.post("/forgot_password", forgetPasswordValidator, validateForgotPasswordDataTypes, userController.forgot_password)
router.post("/reset_password/:token", validateResetPasswordDataTypes, userController.reset_password)
router.post("/change_password", validateChangePassword, validateChangePasswordDataTypes, userController.change_password)
router.get("/get_employee_details/:id", authenticateToken, userController.get_employee_details)
router.get("/get_employees", authenticateToken, userController.get_employees)
router.patch("/delete_employee/:id", authenticateToken, userController.delete_employee)
router.put("/update_user", authenticateToken, userController.update_user)
router.get("/get_all_username", authenticateToken, userController.get_all_users_name)




// roles and permissions
router.get("/get_user_permissions", authenticateToken, rolesPermissionsController.get_user_permissions)
router.get("/get_roles_and_users", authenticateToken, rolesPermissionsController.get_roles_and_users)
router.post("/assign_role", authenticateToken, assignRoleValidations, rolesPermissionsController.assign_role)
router.post("/assign_new_permissions_to_roles", authenticateToken, validateAssignRolesPermission, rolesPermissionsController.assign_new_permissions_to_new_role)
router.patch("/update_permissions_assigned_to_role", authenticateToken, validateUpdateRolesPermission, rolesPermissionsController.update_permissions_assigned_to_role)
router.patch("/delete_role", authenticateToken, rolesPermissionsController.disabled_role)
router.delete("/delete_user_role", authenticateToken, validateDeleteUserRole, rolesPermissionsController.delete_user_role)
router.get("/get_roles_permissions", authenticateToken, rolesPermissionsController.get_roles_permissions)
router.get("/get_role_assigned_to_users", authenticateToken, rolesPermissionsController.get_role_assigned_to_users)



//holidays and events
router.post("/add_holidayOrEvent", authenticateToken, validateHolidaysAndEvents, holidaysAndEventsController.add_holidayOrEvent)
router.put("/update_holidayOrEvent", authenticateToken, holidaysAndEventsController.update_holidayOrEvent)
router.get("/get_all_holidaysOrEvents", authenticateToken, holidaysAndEventsController.get_all_holidaysOrEvents)
router.delete("/delete_holidayOrEvent", authenticateToken, holidaysAndEventsController.delete_holidayOrEvent)


// attendance
router.post("/mark_attendance", authenticateToken, attendanceController.mark_attendance)
router.post("/unmark_attendance", authenticateToken, validateUnmarkAttendance, attendanceController.unmark_attendance)
router.get("/get_attendance_details", authenticateToken, validateGetAttendanceDetails, attendanceController.get_attendance_details)
router.put("/update_attendance_details", authenticateToken, validateUpdateUserAttendance, attendanceController.update_attendance_details)
router.get("/get_attendances", authenticateToken, attendanceController.get_attendances)
router.get("/get_attendances_report", authenticateToken, attendanceController.get_attendance_report)
router.put("/mark_break", authenticateToken, attendanceController.mark_break)
router.put("/unmark_break", authenticateToken, attendanceController.unmark_break)

// leave routes
router.post("/apply_leave", authenticateToken, validateLeaveRequest, leaveController.apply_leave)
router.get("/get_applied_leaves", authenticateToken, leaveController.all_applied_leaves)
router.get("/get_user_pending_leaves", authenticateToken, leaveController.calculate_pending_leaves)
router.put("/update_pending_leaaves", authenticateToken, leaveController.update_pending_leave)
router.get("/all_user_applied_leaves/:status", authenticateToken, leaveController.get_all_users_pending_leaves)



//interview leads
router.post("/create_lead", authenticateToken, validateCreateLeads, interviewLeadsController.create_lead)
router.get("/get_lead", authenticateToken, validateUpdateLead, interviewLeadsController.get_lead)
router.put("/update_lead", authenticateToken, validateUpdateLead, interviewLeadsController.update_lead)
router.get("/get_all_leads", authenticateToken, interviewLeadsController.get_all_leads)
router.delete("/delete_lead", authenticateToken, validateUpdateLead, interviewLeadsController.delete_lead)

module.exports = router