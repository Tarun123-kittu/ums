const express = require('express')
const router = express.Router()
const userController = require('../controllers/userController')
const rolesPermissionsController = require("../controllers/rolesAndPermissionController")
const holidaysAndEventsController = require("../controllers/holidaysAndEventsController")
const attendanceController = require("../controllers/attendanceController")
const hrRoundController = require("../controllers/hrRoundControllers")
const languageController = require("../controllers/languagesControllers")
const testSeriesController = require("../controllers/testSeriesController")
const technicalQuestionsController = require("../controllers/technicalRoundQuestionsController")
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
    validateCreateLeads,
    validateUpdateLead,
    validateHrRound,
    validateHrRoundResult,
    validateUpdateLeadResonse,
    validateCreateLanguage,
    ValidateGetLanguage,
    ValidateUpdateLanguage,
    ValidateCreateSeries,
    ValidateGetSeries,
    ValidateUpdateSeries
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
router.patch("/delete_employee/:id", authenticateToken, validateGetAttendanceDetails, userController.delete_employee)



// roles and permissions
router.get("/get_user_permissions", authenticateToken, rolesPermissionsController.get_user_permissions)
router.get("/get_roles_and_users", authenticateToken, rolesPermissionsController.get_roles_and_users)
router.post("/assign_role", authenticateToken, assignRoleValidations, rolesPermissionsController.assign_role)
router.post("/assign_new_permissions_to_roles", authenticateToken, validateAssignRolesPermission, rolesPermissionsController.assign_new_permissions_to_new_role)
router.patch("/update_permissions_assigned_to_role", authenticateToken, validateUpdateRolesPermission, rolesPermissionsController.update_permissions_assigned_to_role)
router.patch("/delete_role", authenticateToken, rolesPermissionsController.disabled_role)
router.delete("/delete_user_role", authenticateToken, validateDeleteUserRole, rolesPermissionsController.delete_user_role)



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



//interview leads
router.post("/create_lead",authenticateToken,validateCreateLeads,interviewLeadsController.create_lead)
router.get("/get_lead",authenticateToken,validateUpdateLead,interviewLeadsController.get_lead)
router.put("/update_lead",authenticateToken,validateUpdateLead,interviewLeadsController.update_lead)
router.get("/get_all_leads",authenticateToken,interviewLeadsController.get_all_leads)
router.delete("/delete_lead",authenticateToken,validateUpdateLead,interviewLeadsController.delete_lead)



//hr round 
router.get("/get_hr_round_questions",authenticateToken,hrRoundController.get_hr_round_questions)
router.post("/hr_round",authenticateToken,validateHrRound,hrRoundController.hr_round)
router.put("/hr_round_result",authenticateToken,validateHrRoundResult,hrRoundController.hr_round_result)
router.put("/update_lead_response",authenticateToken,validateUpdateLeadResonse,hrRoundController.update_lead_response)



//languages
router.post("/create_language",authenticateToken,validateCreateLanguage,languageController.create_language)
router.get("/get_all_languages",authenticateToken,languageController.get_all_languages)
router.get("/get_language",authenticateToken,ValidateGetLanguage,languageController.get_language)
router.put("/update_language",authenticateToken,ValidateUpdateLanguage,languageController.update_language)
router.delete("/delete_language",authenticateToken,ValidateGetLanguage,languageController.delete_language)


//test series 
router.post("/create_series",authenticateToken,ValidateCreateSeries,testSeriesController.create_series)
router.get("/get_all_series",authenticateToken,ValidateGetLanguage,testSeriesController.get_all_series)
router.get("/get_series",authenticateToken,ValidateGetSeries,testSeriesController.get_series)
router.put("/update_series",authenticateToken,ValidateUpdateSeries,testSeriesController.update_series)
router.delete("/delete_series",authenticateToken,ValidateGetSeries,testSeriesController.delete_series)


//technical round questions
router.post("/add_objective",authenticateToken,technicalQuestionsController.add_objective)
router.post("/add_subjective",authenticateToken,technicalQuestionsController.add_subjective)
router.post("/add_logical",authenticateToken,technicalQuestionsController.add_logical)


module.exports = router