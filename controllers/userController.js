const { sequelize } = require('../models');
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
  const t = await sequelize.transaction();

  try {
    const {
      name, username, email, mobile, emergency_contact_relationship, emergency_contact_name,
      emergency_contact, bank_name, account_number, ifsc, increment_date, gender, dob, doj, skype_email,
      ultivic_email, salary, security, total_security, installments, position, department, status, password,
      address, role, confirm_password
    } = req.body;


    const checkEmailQuery = `SELECT * FROM users WHERE email = ?`;
    const [existingUser] = await sequelize.query(checkEmailQuery, {
      replacements: [email],
      type: sequelize.QueryTypes.SELECT,
      transaction: t
    });

    if (existingUser) {
      await t.rollback();
      return res.status(400).json(errorResponse("Email already exists. Please use another email."));
    }

    if (confirm_password !== password) {
      await t.rollback();
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

    const assigned_role_to_employee = `INSERT INTO user_roles (user_id, role_id) VALUES(?, ?)`;
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
      id: user_id
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
  const { name, status, limit = 10, page } = req.query; // default limit is 10, page is 1

  try {
    // Base query for getting employees
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

    // Base query for counting total employees
    let count_query = `
      SELECT COUNT(*) AS total 
      FROM users 
      WHERE is_disabled = false
    `;

    const replacements = {};

    // Add filters if any
    if (name) {
      get_all_employee_query += ` AND name LIKE :name`;
      count_query += ` AND name LIKE :name`;
      replacements.name = `%${name}%`;
    }

    if (status) {
      get_all_employee_query += ` AND status = :status`;
      count_query += ` AND status = :status`;
      replacements.status = status;
    }

    // Calculate offset for pagination
    const offset = (page - 1) * limit;
    get_all_employee_query += ` LIMIT :limit OFFSET :offset`;

    // Add pagination parameters to replacements
    replacements.limit = parseInt(limit, 10);
    replacements.offset = parseInt(offset, 10);

    // Execute the count query to get the total number of employees
    const totalCountResult = await sequelize.query(count_query, {
      replacements,
      type: sequelize.QueryTypes.SELECT,
    });

    const totalEmployees = totalCountResult[0].total;

    // Calculate total pages dynamically based on limit and total results
    const totalPages = Math.ceil(totalEmployees / limit);

    // Execute the employee query to get paginated data
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

    // Check if requested page exceeds total available pages
    if (page > totalPages) {
      return res.status(400).json({
        type: "error",
        message: `Page ${page} exceeds total number of pages (${totalPages}).`
      });
    }

    // Return response with employee data and dynamic pagination info
    return res.status(200).json({
      type: "success",
      data: employee_details,
      total_pages: totalPages,
      current_page: parseInt(page, 10),
      total_employees: totalEmployees,
      limit: parseInt(limit, 10),
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
    return res.status(200).json({
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





exports.update_user = async (req, res) => {
  const {
    id, name, username, email, mobile, emergency_contact_relationship, emergency_contact_name,
    emergency_contact, bank_name, account_number, ifsc, increment_date, gender, dob, doj, skype_email,
    ultivic_email, salary, security, total_security, installments, position, department, status,
    address
  } = req.body;

  try {
 
    if (!id) {
      return res.status(400).json({ error: "ID is required for updating user." });
    }

 
    const checkEmailQuery = `SELECT * FROM users WHERE id = ?`;
    const [existingUser] = await sequelize.query(checkEmailQuery, {
      replacements: [id],
      type: sequelize.QueryTypes.SELECT,
    });

    if (!existingUser) return res.status(400).json({ type: "error", message: "User Not Found" })

 
    if (existingUser.length === 0) {
      return res.status(404).json({ error: "User not found." });
    }

   
    const update_user_query = `
      UPDATE users
      SET 
        name = COALESCE(?, name),
        username = COALESCE(?, username),
        email = COALESCE(?, email),
        mobile = COALESCE(?, mobile),
        emergency_contact_relationship = COALESCE(?, emergency_contact_relationship),
        emergency_contact_name = COALESCE(?, emergency_contact_name),
        emergency_contact = COALESCE(?, emergency_contact),
        bank_name = COALESCE(?, bank_name),
        account_number = COALESCE(?, account_number),
        ifsc = COALESCE(?, ifsc),
        increment_date = COALESCE(?, increment_date),
        gender = COALESCE(?, gender),
        dob = COALESCE(?, dob),
        doj = COALESCE(?, doj),
        skype_email = COALESCE(?, skype_email),
        ultivic_email = COALESCE(?, ultivic_email),
        salary = COALESCE(?, salary),
        security = COALESCE(?, security),
        total_security = COALESCE(?, total_security),
        installments = COALESCE(?, installments),
        position = COALESCE(?, position),
        department = COALESCE(?, department),
        status = COALESCE(?, status),
        address = COALESCE(?, address)
      WHERE id = ?
    `;

    
    const result = await sequelize.query(update_user_query, {
      replacements: [
        name, username, email, mobile, emergency_contact_relationship, emergency_contact_name,
        emergency_contact, bank_name, account_number, ifsc, increment_date, gender, dob, doj, skype_email,
        ultivic_email, salary, security, total_security, installments, position, department, status,
        address, id
      ]
    });

    res.status(200).json({ message: "User updated successfully." });

  } catch (error) {
    res.status(500).json({ error: "Error updating user", details: error.message });
  }
};





exports.get_all_users_name = async (req, res) => {
  try {
    const get_users_query = `SELECT username,name,id FROM users WHERE is_disabled = false`;
    const all_users = await sequelize.query(get_users_query, {
      type: sequelize.QueryTypes.SELECT,
    });
    if (!all_users) return res.status(404).json({ type: "error", message: "No Users Found" })

    return res.status(200).json({ type: "success", data: all_users })
  } catch (error) {
    return res.status(400).json({ type: "error", message: error.message })
  }
}




