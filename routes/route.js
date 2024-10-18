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
const leaveController = require("../controllers/leaveController")
const finalRoundsController = require("../controllers/finalRoundsController")
const dashboardController = require("../controllers/dashboardControllers")
const interviewLeadsController = require('../controllers/interviewLeads')
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
    assignRoleValidations,
    validateUnmarkAttendance,
    validateGetAttendanceDetails,
    validateUpdateUserAttendance,
    validateLeaveRequest,
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
    ValidateUpdateSeries,
    validateCheckLeadAnswer,
    validateFaceToFaceOrFinalRound,
    validateUpdateInRound,
    updateUserValidator
} = require('../middleware/validationMiddleware')

const {
    validateLoginDAtaTypes,
    validateForgotPasswordDataTypes,
    validateResetPasswordDataTypes,
    validateChangePasswordDataTypes,
} = require("../middleware/validateUserDataTypes")






// user auth routes 
router.post("/create_user", authenticateToken, createUserValidator, userController.create_user)
router.post("/login", loginValidator, validateLoginDAtaTypes, userController.login)
router.post("/forgot_password", forgetPasswordValidator, validateForgotPasswordDataTypes, userController.forgot_password)
router.post("/reset_password/:token", validateResetPasswordDataTypes, userController.reset_password)
router.post("/change_password", validateChangePassword, validateChangePasswordDataTypes, userController.change_password)
router.get("/get_employee_details/:id", authenticateToken, userController.get_employee_details)
router.get("/get_employees", authenticateToken, userController.get_employees)
router.patch("/delete_employee/:id", authenticateToken, userController.delete_employee)
router.put("/update_user", authenticateToken, updateUserValidator, userController.update_user)
router.get("/get_all_username", authenticateToken, userController.get_all_users_name)
router.get("/get_user_documents", authenticateToken, userController.get_user_documents)




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
router.get("/get_all_roles", authenticateToken, rolesPermissionsController.get_all_roles)



//holidays and events
router.post("/add_holidayOrEvent", authenticateToken, validateHolidaysAndEvents, holidaysAndEventsController.add_holidayOrEvent)
router.put("/update_holidayOrEvent", authenticateToken, holidaysAndEventsController.update_holidayOrEvent)
router.get("/get_all_holidaysOrEvents", authenticateToken, holidaysAndEventsController.get_all_holidaysOrEvents)
router.delete("/delete_holidayOrEvent", authenticateToken, holidaysAndEventsController.delete_holidayOrEvent)
router.get("/get_holiday_and_event", authenticateToken, holidaysAndEventsController.get_holidayOrEvent)
router.get("/get_events_and_birthdays", authenticateToken, holidaysAndEventsController.get_events_and_birthdays)
router.get("/get_current_and_next_month_events", authenticateToken, holidaysAndEventsController.get_current_and_next_month_events)



// attendance
router.post("/mark_attendance", authenticateToken, attendanceController.mark_attendance)
router.post("/unmark_attendance", authenticateToken, validateUnmarkAttendance, attendanceController.unmark_attendance)
router.get("/get_attendance_details", authenticateToken, validateGetAttendanceDetails, attendanceController.get_attendance_details)
router.put("/update_attendance_details", authenticateToken, validateUpdateUserAttendance, attendanceController.update_attendance_details)
router.get("/get_attendances", authenticateToken, attendanceController.get_attendances)
router.get("/get_attendances_report", authenticateToken, attendanceController.get_attendance_report)
router.put("/mark_break", authenticateToken, attendanceController.mark_break)
router.put("/unmark_break", authenticateToken, attendanceController.unmark_break)
router.get("/get_user_monthly_report", authenticateToken, attendanceController.get_user_monthly_report)



// leave routes
router.post("/apply_leave", authenticateToken, validateLeaveRequest, leaveController.apply_leave)
router.get("/get_applied_leaves", authenticateToken, leaveController.all_applied_leaves)
router.get("/get_user_pending_leaves", authenticateToken, leaveController.calculate_pending_leaves_for_selected_user)
router.put("/update_pending_leaaves", authenticateToken, leaveController.update_pending_leave)
router.get("/all_user_applied_leaves", authenticateToken, leaveController.get_all_users_pending_leaves)
router.get("/get_applied_leave_detail", authenticateToken, leaveController.get_applied_leave_details)
router.get("/all_users_pending_leaves", authenticateToken, leaveController.calculate_pending_leaves_for_all_users)
router.get("/leave_bank_report", authenticateToken, leaveController.leave_bank_report)
router.get("/user_applied_leaves", authenticateToken, leaveController.get_user_applied_leaves)



//interview leads
router.post("/create_lead", authenticateToken, validateCreateLeads, interviewLeadsController.create_lead)
router.get("/get_lead", authenticateToken, validateUpdateLead, interviewLeadsController.get_lead)
router.put("/update_lead", authenticateToken, validateUpdateLead, interviewLeadsController.update_lead)
router.get("/get_all_leads", authenticateToken, interviewLeadsController.get_all_leads)
router.delete("/delete_lead", authenticateToken, validateUpdateLead, interviewLeadsController.delete_lead)
router.get("/get_face_to_face_round_leads", authenticateToken, interviewLeadsController.get_face_to_face_round_leads)
router.get("/get_final_round_leads", authenticateToken, interviewLeadsController.get_final_round_leads)


//hr round 
router.get("/get_hr_round_questions", authenticateToken, hrRoundController.get_hr_round_questions)
router.post("/hr_round", authenticateToken, validateHrRound, hrRoundController.hr_round)
router.put("/hr_round_result", authenticateToken, validateHrRoundResult, hrRoundController.hr_round_result)
router.put("/update_lead_response", authenticateToken, validateUpdateLeadResonse, hrRoundController.update_lead_response)
router.get("/get_hr_assign_questions_to_lead", authenticateToken, hrRoundController.get_hr_assign_questions_to_lead)
router.get("/get_hr_round_candidate", authenticateToken, hrRoundController.get_hr_round_candidate)
router.get("/get_hr_round_assign_questions_to_lead", authenticateToken, hrRoundController.get_hr_round_assign_questions_to_lead)
router.put("/update_key_point", authenticateToken, hrRoundController.update_key_point)
router.put("/send_test_link", authenticateToken, hrRoundController.sendLeadInterviewLink)



//languages
router.post("/create_language", authenticateToken, validateCreateLanguage, languageController.create_language)
router.get("/get_all_languages", authenticateToken, languageController.get_all_languages)
router.get("/get_language", authenticateToken, ValidateGetLanguage, languageController.get_language)
router.put("/update_language", authenticateToken, ValidateUpdateLanguage, languageController.update_language)
router.delete("/delete_language", authenticateToken, ValidateGetLanguage, languageController.delete_language)


//test series 
router.post("/create_series", authenticateToken, ValidateCreateSeries, testSeriesController.create_series)
router.get("/get_all_series", authenticateToken, testSeriesController.get_all_series)
router.get("/get_series", authenticateToken, ValidateGetSeries, testSeriesController.get_series)
router.put("/update_series", authenticateToken, ValidateUpdateSeries, testSeriesController.update_series)
router.delete("/delete_series", authenticateToken, ValidateGetSeries, testSeriesController.delete_series)
router.get("/get_language_test_series", authenticateToken, testSeriesController.get_specific_language_series)


//technical round questions
router.post("/add_objective", authenticateToken, technicalQuestionsController.add_objective)
router.post("/add_subjective", authenticateToken, technicalQuestionsController.add_subjective)
router.post("/add_logical", authenticateToken, technicalQuestionsController.add_logical)
router.get("/get_questions_answers", authenticateToken, technicalQuestionsController.get_questions_answers)
router.get("/get_lead_questions", technicalQuestionsController.get_lead_questions)
router.post("/submit_technical_round", technicalQuestionsController.submit_technical_round)
router.get("/get_logical_subjective_questions", authenticateToken, technicalQuestionsController.get_logical_subjective_questions)
router.get("/get_objective_questions", authenticateToken, technicalQuestionsController.get_objective_questions)
router.put("/update_logical_and_subjective_question", authenticateToken, technicalQuestionsController.update_subjective_and_logical_question)
router.put("/update_objective_question", authenticateToken, technicalQuestionsController.update_objective)
router.delete("/delete_subjective", authenticateToken, technicalQuestionsController.delete_subjective)
router.delete("/delete_objective", authenticateToken, technicalQuestionsController.delete_objective)
router.get("/all_technical_round_leads", authenticateToken, technicalQuestionsController.get_all_technical_round_leads)
router.put("/update_status", authenticateToken, technicalQuestionsController.update_technical_lead_status)
router.get("/verify_lead", technicalQuestionsController.check_lead_and_token)
router.put("/start_test", technicalQuestionsController.start_test)
router.put("/technical_round_result", authenticateToken, technicalQuestionsController.technical_round_result)
router.get("/get_lead_technical_response", authenticateToken, technicalQuestionsController.get_lead_technical_response)
router.put("/check_lead_answer", authenticateToken, validateCheckLeadAnswer, technicalQuestionsController.check_lead_answer)


//final and face-to-face round
router.put("/final_or_face_to_face_round", authenticateToken, validateFaceToFaceOrFinalRound, finalRoundsController.final_or_face_to_face_round)
router.put("/update_in_round_count", authenticateToken, validateUpdateInRound, finalRoundsController.update_in_round_count)



//dashbord
router.get("/get_dashboard_leaves", authenticateToken, dashboardController.get_dashboard_leaves)
router.get("/get_dashboard_interview_leads_overview", authenticateToken, dashboardController.get_dashboard_interview_leads_overview)
router.get("/get_employees_working_time", authenticateToken, dashboardController.get_employees_working_time)
router.get("/get_user_today_attendance", authenticateToken, dashboardController.get_user_today_attendance)
router.get("/get_all_present_employee", authenticateToken, dashboardController.get_all_present_employee)
router.get("/get_all_on_leave_employees", authenticateToken, dashboardController.get_all_on_leave_employees)
router.get("/get_all_interviews", authenticateToken, dashboardController.get_all_interviews)




module.exports = router