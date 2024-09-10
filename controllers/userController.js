const { sequelize } = require('../models');
const { User } = require("../models")
const bcrypt = require('bcrypt')
const { successResponse, errorResponse } = require("../utils/responseHandler")
const {
  encrypt_password,
  password_compare,
  send_email,
  createToken,
  passwordResetToken,
  isTokenExpired } = require("../utils/commonFuntions")



exports.create_user = async (req, res) => {
  const t = await sequelize.transaction();  // Start a transaction

  try {
    const {
      name, username, email, mobile, emergency_contact_relationship, emergency_contact_name,
      emergency_contact, bank_name, account_number, ifsc, increment_date, gender, dob, doj, skype_email,
      ultivic_email, salary, security, total_security, installments, position, department, status, password,
      address, role, confirm_password
    } = req.body;

    // Check if email already exists
    const checkEmailQuery = `SELECT * FROM users WHERE email = ?`;
    const [existingUser] = await sequelize.query(checkEmailQuery, {
      replacements: [email],
      type: sequelize.QueryTypes.SELECT,
      transaction: t  // Include the transaction
    });

    if (existingUser) {
      await t.rollback();  // Rollback transaction on error
      return res.status(400).json(errorResponse("Email already exists. Please use another email."));
    }

    if (confirm_password !== password) {
      await t.rollback();  // Rollback transaction on error
      return res.status(400).json(errorResponse("Password and confirm password do not match."));
    }

    const hashedPassword = await encrypt_password(password);

    const createUserQuery = `
        INSERT INTO users (
          name, username, email, mobile, emergency_contact_relationship, emergency_contact_name,
          emergency_contact, bank_name, account_number, ifsc, increment_date, gender, dob, doj, skype_email,
          ultivic_email, salary, security, total_security, installments, position, department, status, 
          password, address, role
        ) VALUES (
          ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?
        )
      `;

    const values = [
      name, username, email, mobile, emergency_contact_relationship, emergency_contact_name,
      emergency_contact, bank_name, account_number, ifsc, increment_date, gender, dob, doj, skype_email,
      ultivic_email, salary, security, total_security, installments, position, department, status,
      hashedPassword, address, role
    ];

    const is_user_created = await sequelize.query(createUserQuery, {
      replacements: values,
      transaction: t  // Include the transaction
    });

    if (!is_user_created) {
      await t.rollback();  // Rollback transaction on error
      return res.status(400).json(errorResponse("Error while creating user, please try again later"));
    }

    const get_role_id = `SELECT id FROM roles WHERE role = ?`;
    const [is_role_exist] = await sequelize.query(get_role_id, {
      replacements: [role],
      type: sequelize.QueryTypes.SELECT,
      transaction: t  // Include the transaction
    });

    if (!is_role_exist) {
      await t.rollback();  // Rollback transaction on error
      return res.status(400).json(errorResponse("Sorry, role does not exist"));
    }

    const role_id = is_role_exist.id;
    const user_id = is_user_created[0];

    const assigned_role_to_employee = `INSERT INTO employee_roles (employee_id, role_id) VALUES(?, ?)`;
    const [is_role_assigned] = await sequelize.query(assigned_role_to_employee, {
      replacements: [user_id, role_id],
      type: sequelize.QueryTypes.INSERT,
      transaction: t  // Include the transaction
    });

    if (!is_role_assigned) {
      await t.rollback();  // Rollback transaction on error
      return res.status(400).json(errorResponse("Error while assigning new role to employee"));
    }

    // Commit the transaction if everything is successful
    await t.commit();

    // Send confirmation email
    await send_email({
      email: email,
      subject: `Ums Credentials`,
      message: `Hey, your account for Ultivic has been created. Please log in with these credentials. Email: ${email} and password: ${password}`
    });

    return res.status(201).json(successResponse("User has been created successfully, a confirmation email has been sent to the user's email."));
  } catch (error) {
    await t.rollback();  // Rollback transaction on any error
    console.error("ERROR::", error);
    return res.status(500).json(errorResponse(error.message));
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
      users u
  LEFT JOIN 
      user_roles ur ON u.id = ur.user_id
  LEFT JOIN 
      roles r ON ur.role_id = r.id
  LEFT JOIN 
      roles_permissions rp ON r.id = rp.role_id
  LEFT JOIN 
      permissions p ON rp.permission_id = p.id
  WHERE 
      u.email = :email AND u.is_disabled = false
`;

  try {
    const userRolesData = await sequelize.query(getUserAndRolesQuery, {
      replacements: { email },
      type: sequelize.QueryTypes.SELECT
    });

    if (!userRolesData || userRolesData.length === 0) { return res.status(400).json({ message: "User with this email does not exist.", type: 'error' }); }

    const { user_id, username, password: hashedPassword } = userRolesData[0];

    const isPasswordTrue = await password_compare(hashedPassword, password);

    if (!isPasswordTrue) { return res.status(401).json({ type: "error", message: "Invalid Password" }); }


    const roles = [...new Set(userRolesData.map(roleData => roleData.role_name))];

    const permissions = userRolesData.reduce((acc, roleData) => {
      const { permission_name, can_view, can_update, can_create, can_delete } = roleData;

      acc.push({
        name: permission_name,
        can_view,
        can_update,
        can_create,
        can_delete,
      });

      return acc;
    }, []);

    // Create JWT token with roles, employee_id, and other details
    const token = await createToken(roles, user_id, username, email);

    return res.status(200).json({
      type: "success",
      message: "Logged in successfully",
      token,
      roles,
    });

  } catch (error) {
    console.error("Error during login:", error);
    return res.status(500).json(errorResponse(error.message));
  }
};





exports.forgot_password = async (req, res) => {
  const { email } = req.body;
  const getUser = `SELECT * FROM users WHERE email = ? AND is_disabled = false`;

  try {
    const isUserExist = await sequelize.query(getUser, {
      replacements: [email],
      type: sequelize.QueryTypes.SELECT
    });

    if (isUserExist.length === 0) { return res.status(404).json(errorResponse("No user found related to this email")); }

    const resetToken = await passwordResetToken();

    const update_password_reset_token = 'UPDATE users SET password_reset_token = ? WHERE email = ?';
    const [isUserUpdated] = await sequelize.query(update_password_reset_token, {
      replacements: [resetToken, email],
      type: sequelize.QueryTypes.UPDATE
    });

    if (isUserUpdated) { return res.status(400).json(errorResponse("Unable to generate the key, please try again later")); }

    const resetUrl = `${req.protocol}://${req.get('host')}/reset_password/${resetToken}`;
    const message = `You can reset your password from this URL ${resetUrl}. Ignore if you don't need to reset your password.`;

    await send_email({
      email: email,
      subject: "Recovery Email",
      message
    });

    res.status(200).json(successResponse("Email sent successfully"));

  } catch (error) {
    const resetToken = null;
    const expirationTime = null;

    await sequelize.query(`
  UPDATE users 
  SET password_reset_token = ?
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
    if (!hashed_token) return res.status(400).json({ type: "error", message: "Token is required" })
    const { password, confirm_password } = req.body;

    if (confirm_password !== password) { return res.status(400).json({ type: "error", message: "Password doesn't match" }); }

    const getTheUser = `SELECT id, password_reset_token, email FROM users WHERE password_reset_token = ?;`;

    const isUser = await sequelize.query(getTheUser, {
      replacements: [hashed_token],
      type: sequelize.QueryTypes.SELECT
    });

    if (isUser.length === 0) { return res.status(400).json(errorResponse("Invalid or expired token.")); }

    const hashedPassword = await encrypt_password(password);
    const email = isUser[0].email;

    const update_password_query = `UPDATE users SET password = :hashedPassword WHERE email = :email`;
    const updatePassword = await sequelize.query(update_password_query, {
      replacements: { hashedPassword, email },
      type: sequelize.QueryTypes.UPDATE
    });
    if (!updatePassword) return res.status(400).json(errorResponse("Problem while updating the password."))

    res.status(200).json(successResponse("Password updated successfully."));
  } catch (error) {
    const update_password_query = `UPDATE users SET password_reset_token = NULL WHERE email = :email`;
    const updatePassword = await sequelize.query(update_password_query, {
      replacements: { email },
      type: sequelize.QueryTypes.UPDATE
    });
    res.status(500).json(errorResponse(error.message));
  }
};





exports.change_password = async (req, res) => {
  try {
    const id = req.result.user_id;
    const { password, newPassword } = req.body;

    const GetUserQuery = `
  SELECT * FROM users WHERE id = :id AND is_disabled = false;
  `;
    const [users] = await sequelize.query(GetUserQuery, {
      replacements: { id },
      type: sequelize.QueryTypes.SELECT
    });

    if (users.length === 0) { return res.status(400).json(errorResponse('Logged-in user not found')) }

    const isPassCorrect = await bcrypt.compare(password, users.password);
    if (!isPassCorrect) { return res.status(400).json(errorResponse('Entered current password is not correct')); }

    const salt = await bcrypt.genSalt(10);
    const passhash = await bcrypt.hash(newPassword, salt);

    const updateQuery = `
  UPDATE users SET password = :passhash WHERE id = :id`;
    await sequelize.query(updateQuery, {
      replacements: { passhash, id },
      type: sequelize.QueryTypes.UPDATE
    });

    return res.status(200).json(successResponse('Password changed successfully.'));
  } catch (error) {
    console.error('ERROR', error);
    return res.status(500).json(errorResponse(error.message));
  }
}






exports.get_employee_details = async (req, res) => {
  const { id } = req.params;
  if (!id) return res.status(400).json({ type: "error", message: "Employee id is required to perform this action" });
  try {
    const get_employee_query = `
      SELECT 
        id, name, username, email, mobile, emergency_contact_relationship, emergency_contact_name,
        emergency_contact, bank_name, account_number, ifsc, increment_date, gender, dob, doj, skype_email,
        ultivic_email, salary, security, total_security, installments, position, department, status, 
        address, role, is_disabled 
      FROM 
        users 
      WHERE 
        id = ? AND is_disabled = false
    `;

    const employee_details = await sequelize.query(get_employee_query, {
      replacements: [id],
      type: sequelize.QueryTypes.SELECT
    });

    if (!employee_details || employee_details.length === 0) {
      return res.status(400).json({
        type: "error",
        message: "No User Found or User is disabled"
      });
    }

    return res.status(200).json({
      type: "success",
      data: employee_details,
    });
  } catch (error) {
    return res.status(400).json({
      type: "error",
      message: error?.message
    });
  }
};

exports.get_employees = async (req, res) => {
  const { name, status } = req.query;

  try {
    let get_all_employee_query = `
      SELECT 
        id, name, username, email, mobile, emergency_contact_relationship, emergency_contact_name,
        emergency_contact, bank_name, account_number, ifsc, increment_date, gender, dob, doj, skype_email,
        ultivic_email, salary, security, total_security, installments, position, department, status, 
        address, role, is_disabled 
      FROM 
        users 
      WHERE is_disabled = false
    `;

    const replacements = {};

    if (name) {
      get_all_employee_query += ` AND name LIKE :name`;
      replacements.name = `%${name}%`;
    }

    if (status) {
      get_all_employee_query += ` AND status = :status`;
      replacements.status = status;
    }

    const employee_details = await sequelize.query(get_all_employee_query, {
      replacements,
      type: sequelize.QueryTypes.SELECT,
    });

    if (!employee_details || employee_details.length === 0) {
      return res.status(400).json({
        type: "error",
        message: "No users found matching the criteria",
      });
    }

    return res.status(200).json({
      type: "success",
      data: employee_details,
    });
  } catch (error) {
    return res.status(400).json({
      type: "error",
      message: error?.message,
    });
  }
};

exports.delete_employee = async (req, res) => {
  const { id } = req.params;
  if (!id) return res.status(400).json({ type: "error", message: "Employee id is required to perform this action" });
  try {
    const employee_delete_query = `UPDATE users SET is_disabled = true WHERE id = ?`;
    const is_user_deleted = await sequelize.query(employee_delete_query, {
      replacements: [id],
      type: sequelize.QueryTypes.UPDATE
    });

    if (!is_user_deleted) return res.status(400).json({ type: "error", message: "Error while deleting the employee" })
    return res.status(400).json({
      type: "success",
      message: "Employee deleted successfully !!"
    })
  } catch (error) {
    return res.status(400).json({
      type: "error",
      message: error?.message,
    });
  }
}

