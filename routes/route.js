let express = require('express')
let router = express.Router()
let user = require('../controllers/userControllers')
let {createUserValidator} = require('../middleware/validationMiddleware')

//test route
router.get("/test",user.test)

router.post("/create_user",createUserValidator,user.createUser)
router.get("/get_user",user.getUser)

module.exports = router