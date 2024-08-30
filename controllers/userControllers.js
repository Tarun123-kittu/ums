const { sequelize } = require('../models');
const { User } = require("../models")
const { encrypt_password, password_compare } = require("../commom/password_hashing")
const send_email = require("../commom/sendEmail")
const { createToken } = require("../commom/create_token")



exports.createUser = async (req, res) => {
  try {
    const { email, username, password, confirm_password } = req.body;


    const checkEmailQuery = ` SELECT * FROM Users WHERE email = ?`;
    const [existingUser] = await sequelize.query(checkEmailQuery, {
      replacements: [email],
      type: sequelize.QueryTypes.SELECT
    });

    if (existingUser) { return res.status(400).json({ message: "Email already exists. Please use another email.", type: 'error' }); }

    if (confirm_password !== password) {
      return res.status(400).json({ type: "failed", message: "Password and confirm password do not match." });
    }

    const hashedPassword = await encrypt_password(password)

    const newUser = await User.create({
      username,
      email,
      password: hashedPassword
    });

    await send_email({
      email: email,
      subject: `Ums Credentials`,
      message: `Hey your account for ultivic has been creadted please login with these credwntials. Email : ${email} and password : ${password}`
    })

    return res.status(201).json({
      type: "success",
      message: "User has been created successfully a confirmation Email has been sent to the user email",
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      type: "error",
      message: error.message,
    });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  const getUserAndRolesQuery = `
    SELECT 
        u.id AS user_id, 
        u.username, 
        u.password, 
        r.role AS role_name, 
        p.permission AS permission_name,
        rp.can_view,
        rp.can_update,
        rp.can_create,
        rp.can_delete
    FROM 
        Users u
    LEFT JOIN 
        user_roles ur ON u.id = ur.user_id
    LEFT JOIN 
        roles r ON ur.role_id = r.id
    LEFT JOIN 
        roles_permissions rp ON r.id = rp.role_id
    LEFT JOIN 
        permissions p ON rp.permission_id = p.id
    WHERE 
        u.email = :email;
  `;

  try {
    const userRolesData = await sequelize.query(getUserAndRolesQuery, {
      replacements: { email },
      type: sequelize.QueryTypes.SELECT
    });

    if (!userRolesData || userRolesData.length === 0) {
      return res.status(400).json({ message: "User with this email does not exist.", type: 'error' });
    }

    const { user_id, username, password: hashedPassword } = userRolesData[0];

    const isPasswordTrue = await password_compare(hashedPassword, password);

    if (!isPasswordTrue) {
      return res.status(401).json({ type: "error", message: "Invalid Password" });
    }

    const roles = userRolesData.map(({ role_name, permission_name, can_view, can_update, can_create, can_delete }) => ({
      role_name,
      permission_name,
      can_view,
      can_update,
      can_create,
      can_delete
    }));

    const token = await createToken(roles, user_id, username, email);

    return res.status(200).json({
      type: "success",
      message: "Logged in successfully",
      token
    });

  } catch (error) {
    console.error("Error during login:", error);
    return res.status(500).json({ type: 'error', message: 'Internal Server Error' });
  }
};