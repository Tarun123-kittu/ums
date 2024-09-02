const { sequelize } = require('../models');
const { User } = require("../models")
const { encrypt_password, password_compare } = require("../commom/password_hashing")
const send_email = require("../commom/sendEmail")
const { createToken } = require("../commom/create_token")
const passwordResetToken = require("../commom/forgot-password-token")



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

exports.forgot_password = async (req, res) => {
  const { email } = req.body;
  const getUser = `SELECT * FROM Users WHERE email = ?`;

  try {
    const isUserExist = await sequelize.query(getUser, {
      replacements: [email],
      type: sequelize.QueryTypes.SELECT
    });

    if (isUserExist.length === 0) {
      return res.status(404).json({ type: "error", message: "No user found related to this email" });
    }

    const resetToken = await passwordResetToken();
    const expirationTime = new Date();

    const update_password_reset_token = 'UPDATE Users SET password_reset_token = ?,password_reset_token_expires_in = ? WHERE email = ?';
    const [isUserUpdated] = await sequelize.query(update_password_reset_token, {
      replacements: [resetToken, expirationTime, email],
      type: sequelize.QueryTypes.UPDATE
    });

    if (isUserUpdated) {
      return res.status(400).json({ type: "error", message: "Unable to generate the key, please try again later" });
    }

    const resetUrl = `${req.protocol}://${req.get('host')}/resetPassword/${resetToken}`;
    const message = `You can reset your password from this URL ${resetUrl}. Ignore if you don't need to reset your password.`;

    await send_email({
      email: email,
      subject: "Recovery Email",
      message
    });

    res.status(200).json({
      status: "success",
      message: "Email sent successfully"
    });

  } catch (error) {
    const resetToken = null;
    const expirationTime = null;

    await sequelize.query(`
      UPDATE Users 
      SET password_reset_token = ?, 
          password_reset_token_expires_in = ? 
      WHERE email = ?
    `, {
      replacements: [resetToken, expirationTime, email],
      type: sequelize.QueryTypes.UPDATE
    });
    res.status(500).json({ type: "error", message: "An error occurred. Please try again later." });
  }
};

exports.reset_password = async (req, res, next) => {
  try {
    const hashed_token = req.params.token;
    const { password, confirm_password } = req.body;

    if (confirm_password !== password) {
      return res.status(400).json({ type: "error", message: "Password doesn't match" });
    }

    const getTheUser = `SELECT id, password_reset_token, password_reset_token_expires_in, email FROM Users WHERE password_reset_token = ? AND password_reset_token_expires_in > NOW();`;

    const isUser = await sequelize.query(getTheUser, {
      replacements: [hashed_token],
      type: sequelize.QueryTypes.SELECT
    });

    if (isUser.length === 0) {
      return res.status(400).json({ type: "error", message: "Invalid or expired token" });
    }

    const tokenExpiryDate = new Date(isUser[0].password_reset_token_expires_in);
    const currentDate = new Date();
    const offset = currentDate.getTimezoneOffset();
    const localDate = new Date(currentDate.getTime() - offset * 60000);

    const timeDifference = localDate.getTime() - tokenExpiryDate.getTime();

    const tenMinutesInMillis = 10  60  1000;


    if (timeDifference > tenMinutesInMillis) {
      return res.status(400).json({ type: "error", message: "Token Expired" });
    }

    const hashedPassword = await encrypt_password(password);
    const email = isUser[0].email;

    const update_password_query = `UPDATE Users SET password = ? WHERE email = ?`;
    const [updatePassword] = await sequelize.query(update_password_query, {
      replacements: [hashedPassword, email],
      type: sequelize.QueryTypes.UPDATE
    });

    if (!updatePassword) return res.status(400).json({ type: "error", message: "Problem while updating the password" })

    res.status(200).json({ type: "success", message: "Password updated successfully" });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ message: error.message });
  }
};


