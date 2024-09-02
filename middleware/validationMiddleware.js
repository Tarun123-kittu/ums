const { check, validationResult,body } = require('express-validator')


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



module.exports = {
    createUserValidator, 
    loginValidator, 
    forgot_password_validator,
    validateChangePassword
}

