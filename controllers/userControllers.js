const { sequelize } = require('../models');
const router = require('../routes/route');
const bcrypt = require('bcrypt');
const saltRounds = 10; 


//### test route
exports.test = async (req, res) => {
  res.send("test api is working..")
}


//### create user
exports.createUser = async (req, res) => {
  try {
    const { email, username, password, confirm_password } = req.body;

    const checkEmail = `SELECT * FROM Users WHERE email = ?`;
    const [isEmailExist] = await sequelize.query(checkEmail, {
      replacements: [email],
      type: sequelize.QueryTypes.SELECT,
    });
    if (isEmailExist) return res.status(409).json({ type: "failed", message: "user with this email is already exist.Please sign up with diffrent email" })

    if (confirm_password !== password) return res.status(400).json({ type: "failed", message: "Password and confirm pasword doesn't matched" })

    const passwordValidationRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]).+$/;
    if (!passwordValidationRegex.test(password)) {
      return res.status(400).json({
        type: "failed",
        message: "Password must contain at least one uppercase letter and one special character.",
      });
    }
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const createUserQuery = `INSERT INTO Users (username,email,password) VALUES (?,?,?)`;
    const createNewUser = await sequelize.query(createUserQuery, {
      replacements: [username, email, hashedPassword],
      type: sequelize.QueryTypes.INSERT
    })

    if (!createNewUser) return res.status(400).json({ type: "failed", message: "Error while create new user" })

    return res.status(201).json({
      type: "success",
      message: "User created successfully.",
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      type: "error",
      message: error?.message,
    });
  }
};





// ## get user 
exports.getUser = async (req, res) => {

}