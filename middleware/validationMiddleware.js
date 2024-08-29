const {check,validationResult} = require('express-validator')


const createUserValidator = [
    check("username","Username is required.").not().isEmpty(),
    check("email","Email is required.").not().isEmpty(),
    check("email","Please enter a correct email format.").isEmail(),
    check("password","Please enter your password.").not().isEmpty(),
    (req,res,next)=>{
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ message: errors.array()[0].msg, type: 'error' });
        }
        next();
    }
]

module.exports={
    createUserValidator
}