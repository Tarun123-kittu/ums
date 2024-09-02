const { sequelize } = require('../models');
const router = require('../routes/route');
const bcrypt = require('bcrypt');
const saltRounds = 10; 
const {User}  = require('../models')


//### test route
exports.test = async (req, res) => {
  res.send("test api is working..")
}


//### create user
exports.createUser = async (req, res) => {
  try {
    const { email, username, password, confirm_password } = req.body;

   
    const checkEmailQuery = `SELECT * FROM Users WHERE email = ?`;
    const [existingUser] = await sequelize.query(checkEmailQuery, {
      replacements: [email],
      type: sequelize.QueryTypes.SELECT
    });

    if (existingUser) {return res.status(400).json({ message: "Email already exists. Please use another email.", type: 'error' });}

    if (confirm_password !== password) {
      return res.status(400).json({ type: "failed", message: "Password and confirm password do not match." });
    }

    const passwordValidationRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]).+$/;
    if (!passwordValidationRegex.test(password)) {
      return res.status(400).json({
        type: "failed",
        message: "Password must contain at least one uppercase letter and one special character.",
      });
    }

    
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = await User.create({
      username,
      email,
      password: hashedPassword
    });

    return res.status(201).json({
      type: "success",
      message: "User created successfully.",
      data: {
        id: newUser.id, 
        username: newUser.username,
        email: newUser.email
      }
    });

  } catch (error) {
  console.log("ERROR::",error)
  return res.status(500).json({message:"Internal Server Error.",type:"error",error:error.message})
  }
};

// ## get user 
exports.getUser = async (req, res) => {

}