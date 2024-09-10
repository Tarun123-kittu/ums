const { check, validationResult, body } = require('express-validator')


const createUserValidator = [
    check("name", "Name is required.").not().isEmpty(),
    check("username", "Username is required.").not().isEmpty(),
    check("email", "Email is required.").not().isEmpty(),
    check("email", "Please enter a correct email format.").isEmail(),
    check("mobile", "Mobile number is required.").not().isEmpty(),
    check("mobile", "Mobile number must be numeric and 10 digits.").isLength({ min: 10, max: 10 }).isNumeric(),
    check("emergency_contact_relationship", "Emergency contact relationship is required.").not().isEmpty(),
    check("emergency_contact_name", "Emergency contact name is required.").not().isEmpty(),
    check("emergency_contact", "Emergency contact number is required.").not().isEmpty(),
    check("emergency_contact", "Emergency contact number must be numeric and 10 digits.").isLength({ min: 10, max: 10 }).isNumeric(),
    check("bank_name", "Bank name is required.").not().isEmpty(),
    check("account_number", "Account number is required.").not().isEmpty(),
    check("account_number", "Account number must be numeric.").isNumeric(),
    check("ifsc", "IFSC code is required.").not().isEmpty(),
    check("increment_date", "Increment date is required.").not().isEmpty(),
    check("increment_date", "Invalid date format. Use YYYY-MM-DD.").isISO8601(),
    check("gender", "Gender is required.").not().isEmpty(),
    check("dob", "Date of birth is required.").not().isEmpty(),
    check("dob", "Invalid date format for DOB. Use YYYY-MM-DD.").isISO8601(),
    check("doj", "Date of joining is required.").not().isEmpty(),
    check("doj", "Invalid date format for DOJ. Use YYYY-MM-DD.").isISO8601(),
    check("skype_email", "Skype email is required.").not().isEmpty(),
    check("skype_email", "Invalid Skype email format.").isEmail(),
    check("ultivic_email", "Ultivic email is required.").not().isEmpty(),
    check("ultivic_email", "Invalid Ultivic email format.").isEmail(),
    check("salary", "Salary is required.").not().isEmpty(),
    check("salary", "Salary must be numeric.").isNumeric(),
    check("security", "Security is required.").not().isEmpty(),
    check("security", "Security must be numeric.").isNumeric(),
    check("total_security", "Total security is required.").not().isEmpty(),
    check("total_security", "Total security must be numeric.").isNumeric(),
    check("installments", "Installments are required.").not().isEmpty(),
    check("installments", "Installments must be numeric.").isNumeric(),
    check("position", "Position is required.").not().isEmpty(),
    check("department", "Department is required.").not().isEmpty(),
    check("status", "Status is required.").not().isEmpty(),
    check("password", "Please enter your password.").not().isEmpty(),
    check("address", "Address is required.").not().isEmpty(),
    check("role", "Role is required.").not().isEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: errors.array()[0].msg, type: 'error' });
        }
        next();
    }
];


const loginValidator = [
    check("email", "Email is required.").not().isEmpty(),
    check("email", "Please enter a correct email format.").isEmail(),
    check("password", "Please enter your password.").not().isEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: errors.array()[0].msg, type: 'error' });
        }
        next();
    }
]

const forgetPasswordValidator = [
    check("email", "Email is required.").not().isEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: errors.array()[0].msg, type: 'error' });
        }
        next();
    }
]


const validateChangePassword = [
    check('password', 'Please enter password.').not().isEmpty(),
    check('newPassword', 'Please enter new password.').not().isEmpty(),
    check('confirmPassword', 'Please enter confirm password.').not().isEmpty(),
    body('confirmPassword').custom((value, { req }) => {
        if (value !== req.body.newPassword) {
            throw new Error('Confirm password does not match new password.');
        }
        return true;
    }),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: errors.array()[0].msg, type: 'error' });
        }
        next();
    }
];

const validateNewRole = [
    check("role", "Role is Required").not().isEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: errors.array()[0].msg, type: 'error' });
        }
        next();
    }
];


const validateNewPermission = [
    check("permission", "Permission is Required").not().isEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: errors.array()[0].msg, type: 'error' });
        }
        next();
    }
];

const validateAssignRolesPermission = [
    check("role", "Role is required and must be a string").optional().not().isEmpty().isString(),

    check("permission_data")
        .if((value, { req }) => !req.body.role)
        .isArray().withMessage("permission_data must be an array"),

    check("permission_data.*.role_id")
        .if((value, { req }) => !req.body.role)
        .not().isEmpty().withMessage("Role ID is required and must be an integer")
        .isInt(),

    check("permission_data.*.permission_id")
        .if((value, { req }) => !req.body.role)
        .not().isEmpty().withMessage("Permission ID is required and must be an integer")
        .isInt(),

    check("permission_data.*.can_view")
        .if((value, { req }) => !req.body.role)
        .not().isEmpty().withMessage("Can View is required and must be a boolean value")
        .isBoolean(),

    check("permission_data.*.can_create")
        .if((value, { req }) => !req.body.role)
        .not().isEmpty().withMessage("Can Create is required and must be a boolean value")
        .isBoolean(),

    check("permission_data.*.can_update")
        .if((value, { req }) => !req.body.role)
        .not().isEmpty().withMessage("Can Update is required and must be a boolean value")
        .isBoolean(),

    check("permission_data.*.can_delete")
        .if((value, { req }) => !req.body.role)
        .not().isEmpty().withMessage("Can Delete is required and must be a boolean value")
        .isBoolean(),

    check("user_id")
        .optional()
        .isArray().withMessage("user_id must be an array")
        .custom((value) => {
            if (value && value.length > 0) {
                const allIntegers = value.every(Number.isInteger);
                if (!allIntegers) {
                    throw new Error("Each user_id must be an integer");
                }
            }
            return true;
        }),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: errors.array()[0].msg, type: 'error' });
        }
        next();
    }
];

module.exports = validateAssignRolesPermission;


const validateUpdateRolesPermission = [
    check("permission_data").isArray().withMessage("permission_data must be an array"),
    check("permission_data.*.role_id", "Role ID is required and must be an integer").not().isEmpty().isInt(),
    check("permission_data.*.permission_id", "Permission ID is required and must be an integer").not().isEmpty().isInt(),
    check("permission_data.*.can_view", "Can View is required and must be a boolean value").not().isEmpty().isBoolean(),
    check("permission_data.*.can_create", "Can Create is required and must be a boolean value").not().isEmpty().isBoolean(),
    check("permission_data.*.can_update", "Can Update is required and must be a boolean value").not().isEmpty().isBoolean(),
    check("permission_data.*.can_delete", "Can Delete is required and must be a boolean value").not().isEmpty().isBoolean(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: errors.array()[0].msg, type: 'error' });
        }
        next();
    }
];

const assignRoleValidations = [
    check("user_id", "User ID is required and must be an integer").not().isEmpty().isInt(),
    check("role_id", "Role ID is required and must be an integer").not().isEmpty().isInt(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: errors.array()[0].msg, type: 'error' });
        }
        next();
    }
];

const disableRoleValidations = [
    check("role_id", "Role ID is required").not().isEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: errors.array()[0].msg, type: 'error' });
        }
        next();
    }
];



const validateDeleteUserRole = [
    check('roleId', 'Please provide role Id.').not().isEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) { return res.status(400).json({ message: errors.array()[0].msg, type: 'error' }); }
        next();
    }
]



const validateHolidaysAndEvents = [
    check('occasion_name', 'Please provide occasion name.').not().isEmpty(),
    check('occasion_type', 'Please provide occasion type.').not().isEmpty(),
    check('date', 'Please provide date.').not().isEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) { return res.status(400).json({ message: errors.array()[0].msg, type: "error" }) }
        next()
    }
]





module.exports = {
    createUserValidator,
    loginValidator,
    forgetPasswordValidator,
    validateChangePassword,
    validateNewRole,
    validateNewPermission,
    validateAssignRolesPermission,
    validateUpdateRolesPermission,
    assignRoleValidations,
    disableRoleValidations,
    validateDeleteUserRole,
    validateHolidaysAndEvents,
}

