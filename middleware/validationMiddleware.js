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
    check('occasion_type', 'Please provide occasion type.').not().isEmpty()
    .isIn(['holiday','event']).withMessage('ocassion type must be one of : holiday, event'),
    check('date', 'Please provide date.').not().isEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) { return res.status(400).json({ message: errors.array()[0].msg, type: "error" }) }
        next()
    }
]

const validateAttendance = [
    check('date', 'Please provide Today date').not().isEmpty(),
    check('user_id', 'Please provide User Id').not().isEmpty(),
    check('in_time', 'Please provide Attenance Time').not().isEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) { return res.status(400).json({ message: errors.array()[0].msg, type: 'error' }); }
        next();
    }
]

const validateUnmarkAttendance = [
    check('report')
        .trim()
        .not().isEmpty().withMessage('Task is required!!')
        .bail(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: errors.array()[0].msg,
                type: 'error'
            });
        }
        next();
    }
];



const validateGetAttendanceDetails = [
    check('attendanceId', 'Please provide attendance Id.').not().isEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) { return res.status(400).json({ message: errors.array()[0].msg, type: 'error' }); }
        next();
    }
]



const validateUpdateUserAttendance = [
    check("attendanceId", "Please provide attendance Id.").not().isEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) { return res.status(400).json({ message: errors.array()[0].msg, type: 'error' }); }
        next();
    }
]


const validateLeaveRequest = [
    check('from_date')
        .not().isEmpty().withMessage('From date is required')
        .isString().withMessage('From date must be a string'),
    check('to_date')
        .not().isEmpty().withMessage('To date is required')
        .isString().withMessage('To date must be a string'),
    check('type')
        .not().isEmpty().withMessage('Leave type is required')
        .isString().withMessage('Leave type must be a string'),
    check('description')
        .not().isEmpty().withMessage('Leave description is required')
        .isString().withMessage('Leave description must be a string'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: errors.array()[0].msg, type: 'error' });
        }
        next();
    }
];


const validateCreateLeads = [
    check("name", "Please provide name of the lead.").not().isEmpty(),
    check("phone_number", "Please provide phone number of the lead.").not().isEmpty(),
    check("email", "Please provide email of the lead.").not().isEmpty(),
    check("email", "Please enter a correct format of the email.").isEmail(),
    check("gender", "Please provide gender of the lead.").not().isEmpty(),
    check("dob", "Please provide date of birth (DOB) of the lead.").not().isEmpty(),
    check("profile", "Please provide profile of the lead.").not().isEmpty(),
    check("state", "Please provide state of the user.").not().isEmpty(),
    check("house_address", "Please provide address of the lead.").not().isEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) { return res.status(400).json({ message: errors.array()[0].msg, type: 'error' }); }
        next();
    }
]


const validateUpdateLead = [
    check("leadId", "Please provide lead Id in the query params.").not().isEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) { return res.status(400).json({ message: errors.array()[0].msg, type: 'error' }); }
        next();
    }
]



const validateHrRound = [
    check("lead_id", "Please provide lead Id.").not().isEmpty(),
    check("responses", "Please provide question answers .").not().isEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) { return res.status(400).json({ message: errors.array()[0].msg, type: 'error' }); }
        next();
    }
]



const validateHrRoundResult = [
    check("interview_id", "Please provide interview Id.").not().isEmpty(),
    check("hr_round_result", "Please provide result of HR round.").not().isEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) { return res.status(400).json({ message: errors.array()[0].msg, type: 'error' }); }
        next();
    }
]


const validateUpdateLeadResonse = [
    check("id", "Please provide question Id.").not().isEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) { return res.status(400).json({ message: errors.array()[0].msg, type: 'error' }); }
        next();
    }
]


const validateCreateLanguage = [
    check("language", "Please provide language.").not().isEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) { return res.status(400).json({ message: errors.array()[0].msg, type: 'error' }); }
        next();
    }
]


const ValidateGetLanguage = [
    check("languageId", "Please provide language Id.").not().isEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) { return res.status(400).json({ message: errors.array()[0].msg, type: 'error' }); }
        next();
    }
]


const ValidateUpdateLanguage = [
    check("languageId", "Please provide language Id.").not().isEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) { return res.status(400).json({ message: errors.array()[0].msg, type: 'error' }); }
        next();
    }
]


const ValidateCreateSeries = [
    check("language_id", "Please provide language Id.").not().isEmpty(),
    check("series_name", "Please provide series name").not().isEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) { return res.status(400).json({ message: errors.array()[0].msg, type: 'error' }); }
        next();
    }
]


const ValidateGetSeries = [
    check("seriesId", "Please provide Series Id in the query params.").not().isEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) { return res.status(400).json({ message: errors.array()[0].msg, type: 'error' }); }
        next();
    }
]



const ValidateUpdateSeries = [
    check("seriesId", "Please provide Series Id").not().isEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) { return res.status(400).json({ message: errors.array()[0].msg, type: 'error' }); }
        next();
    }
]


const validateTechnicalRoundResult = [
    check("interview_id", "Please provide Interview Id").not().isEmpty(),
    check("technical_round_result", "Please provide technical round result.").not().isEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) { return res.status(400).json({ message: errors.array()[0].msg, type: 'error' }); }
        next();
    }
]



const validateSubmitTechincalRound = [
    check("lead_id", "Please provide lead Id").not().isEmpty(),
    check("responses", "Please provide  lead response for technical round.").not().isEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) { return res.status(400).json({ message: errors.array()[0].msg, type: 'error' }); }
        next();
    }
]



const validateCheckLeadAnswer = [
    check('interview_id', "Interview id not present in request body").not().isEmpty(),
    check('lead_id', "lead id is not present in the request body").not().isEmpty(),
    check('question_id', 'question id not present in the request body').not().isEmpty(),
    check('answer_status', 'answer status is not present in the request body')
        .not().isEmpty()
        .isIn(['correct', 'incorrect', 'not_attempted']).withMessage('Answer status must be one of: correct, incorrect, not_attempted'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: errors.array()[0].msg, type: 'error' });
        }
        next();
    }
];


const validateFaceToFaceOrFinalRound = [
    check('leadId', 'Lead Id not present in the request body').not().isEmpty(),
    check('status', 'status not present in the request body').not().isEmpty()
        .isIn(['selected', 'rejected', 'pending', 'on hold']).withMessage('staus must be one of : selected, rejected, pending, on hold'),
    check('round_type', 'round type not present in the request body').not().isEmpty()
        .isIn(['final','face_to_face']).withMessage('round type must be one of : final, face_to_face'),
        (req, res, next) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ message: errors.array()[0].msg, type: 'error' });
            }
            next();
        }
]


const validateUpdateInRound = [
    check('leadId','Please add lead Id in the query params').not().isEmpty(),
    check('in_round_count','Please add in round count').not().isEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: errors.array()[0].msg, type: 'error' });
        }
        next();
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
    validateAttendance,
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
    validateTechnicalRoundResult,
    validateSubmitTechincalRound,
    validateCheckLeadAnswer,
    validateFaceToFaceOrFinalRound,
    validateUpdateInRound
}

