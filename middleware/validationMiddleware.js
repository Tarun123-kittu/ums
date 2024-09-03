const { check, validationResult, body } = require('express-validator')


const createUserValidator = [
    check("username", "Username is required.").not().isEmpty(),
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

const forgot_password_validator = [
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
        .not().isEmpty().withMessage("Can Read is required and must be a boolean value")
        .isBoolean(),
    check("permission_data.*.can_update")
        .if((value, { req }) => !req.body.role)
        .not().isEmpty().withMessage("Can Create is required and must be a boolean value")
        .isBoolean(),
    check("permission_data.*.can_delete")
        .if((value, { req }) => !req.body.role)
        .not().isEmpty().withMessage("Can Delete is required and must be a boolean value")
        .isBoolean(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: errors.array()[0].msg, type: 'error' });
        }
        next();
    }
];

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



module.exports = {
    createUserValidator,
    loginValidator,
    forgot_password_validator,
    validateChangePassword,
    validateNewRole,
    validateNewPermission,
    validateAssignRolesPermission,
    validateUpdateRolesPermission
}

