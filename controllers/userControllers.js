const { sequelize } = require('../models');
const router = require('../routes/route');


//### test route
exports.test = async (req, res) => {
  res.send("test api is working..")
}


//### create user
exports.createUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const checkEmailQuery = ` SELECT * FROM Users WHERE email = ?`;
    const [existingUser] = await sequelize.query(checkEmailQuery, {
      replacements: [email],
      type: sequelize.QueryTypes.SELECT
    });

    if (existingUser) {return res.status(400).json({ message: "Email already exists. Please use another email.", type: 'error' });}

    const insertUserQuery = `INSERT INTO Users (username, email, password) VALUES (?, ?, ?)`;
    await sequelize.query(insertUserQuery, {
      replacements: [username, email, password],
      type: sequelize.QueryTypes.INSERT
    });

    return res.status(201).json({ message: "User created successfully.", type: 'success' });
  } catch (error) {
    console.error("ERROR::", error);
    return res.status(500).json({ message: "Internal Server Error.", type: 'error', error: error.message });
  }
};




// ## get user 
exports.getUser = async(req,res)=>{

}