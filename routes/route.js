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
    validateHolidaysAndEvents
    
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


module.exports = router