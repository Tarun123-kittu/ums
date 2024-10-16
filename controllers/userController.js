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
            name,
            username,
            email,
            mobile,
            gender,
            dob,
            doj,
            password,
            confirm_password,
            address,
            role,
           
            emergency_contact_relationship,
            emergency_contact_name,
            emergency_contact,
            bank_name,
            account_number,
            ifsc,
            increment_date,
            skype_email,
            ultivic_email,
            salary,
            security,
            total_security,
            installments,
            position,
            department,
            status,
            documents,
        } = req.body;

       
        console.log("Incoming request body:", req.body);

     
        const existingUser = await sequelize.query(
            `SELECT * FROM users WHERE email = ?`,
            {
                replacements: [email],
                type: sequelize.QueryTypes.SELECT,
                transaction: t,
            }
        );

        if (existingUser.length > 0) {
            await t.rollback();
            return res.status(400).json({ message: "Email already exists." });
        }

     
        if (confirm_password !== password) {
            await t.rollback();
            return res.status(400).json({ message: "Password and confirm password do not match." });
        }

       
        const hashedPassword = await encrypt_password(password);

       
        const fields = [
            'name',
            'username',
            'email',
            'mobile',
            'gender',
            'dob',
            'doj',
            'password',
            'address',
            'role',
            'position',
            'department',
            'status',
            'createdAt',
            'updatedAt',
        ];

        const values = [
            name,
            username,
            email,
            mobile,
            gender,
            dob,
            doj,
            hashedPassword,
            address,
            role,
            position,
            department,
            status,
            new Date(),
            new Date(),
        ];


        if (emergency_contact_relationship) {
            fields.push('emergency_contact_relationship');
            values.push(emergency_contact_relationship);
        }

        if (emergency_contact_name) {
            fields.push('emergency_contact_name');
            values.push(emergency_contact_name);
        }

        if (emergency_contact) {
            fields.push('emergency_contact');
            values.push(emergency_contact);
        }

        if (bank_name) {
            fields.push('bank_name');
            values.push(bank_name);
        }

        if (account_number) {
            fields.push('account_number');
            values.push(account_number);
        }

        if (ifsc) {
            fields.push('ifsc');
            values.push(ifsc);
        }

        if (increment_date) {
            fields.push('increment_date');
            values.push(increment_date);
        }

        if (skype_email) {
            fields.push('skype_email');
            values.push(skype_email);
        }

        if (ultivic_email) {
            fields.push('ultivic_email');
            values.push(ultivic_email);
        }

        if (salary) {
            fields.push('salary');
            values.push(salary);
        }

        if (security) {
            fields.push('security');
            values.push(security);
        }

        if (total_security) {
            fields.push('total_security');
            values.push(total_security);
        }

        if (installments) {
            fields.push('installments');
            values.push(installments);
        }

       
        const createUserQuery = `
            INSERT INTO users (${fields.join(', ')}) VALUES (${values.map(() => '?').join(', ')})
        `;

        
        console.log("Final SQL query:", createUserQuery);
        console.log("Values to insert:", values);

       
        await sequelize.query(createUserQuery, {
            replacements: values,
            transaction: t,
        });

        const user_id = await sequelize.query(
            `SELECT LAST_INSERT_ID() AS user_id`,
            { type: sequelize.QueryTypes.SELECT, transaction: t }
        );

 
        const roleRecord = await sequelize.query(
            `SELECT id FROM roles WHERE role = ?`,
            { replacements: [role], type: sequelize.QueryTypes.SELECT, transaction: t }
        );

        if (roleRecord.length === 0) {
            await t.rollback();
            return res.status(400).json({ message: "Role does not exist." });
        }

        const role_id = roleRecord[0].id;

        await sequelize.query(
            `INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)`,
            { replacements: [user_id[0].user_id, role_id], transaction: t }
        );

       
        if (documents && documents.length > 0) {
            for (const doc of documents) {
                await sequelize.query(
                    `INSERT INTO documents (user_id, document_name) VALUES (?, ?)`,
                    { replacements: [user_id[0].user_id, doc], transaction: t }
                );
            }
        }

        await t.commit();

      
        await send_email({
            email: email,
            subject: `Ums Credentials`,
            message: `Hey, your account for Ultivic has been created. Please log in with these credentials. Email: ${email} and password: ${password}`,
        });

        return res.status(201).json({ message: "User has been created successfully." });
    } catch (error) {
        await t.rollback();
        console.error("ERROR::", error);
        return res.status(500).json({ message: "An error occurred while creating the user." });
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
  const { name, status, limit = 10, page } = req.query; 

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

    
    let count_query = `
      SELECT COUNT(*) AS total 
      FROM users 
      WHERE is_disabled = false
    `;

    const replacements = {};

   
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

   
    const offset = (page - 1) * limit;
    get_all_employee_query += ` LIMIT :limit OFFSET :offset`;

    
    replacements.limit = parseInt(limit, 10);
    replacements.offset = parseInt(offset, 10);

   
    const totalCountResult = await sequelize.query(count_query, {
      replacements,
      type: sequelize.QueryTypes.SELECT,
    });

    const totalEmployees = totalCountResult[0].total;

    
    const totalPages = Math.ceil(totalEmployees / limit);

  
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


    if (page > totalPages) {
      return res.status(400).json({
        type: "error",
        message: `Page ${page} exceeds total number of pages (${totalPages}).`
      });
    }

   
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




