let { errorResponse, successResponse } = require("../utils/responseHandler")
let getPermissionsForRole = require("../utils/getPermissions")
let { sequelize } = require('../models')



exports.get_employee_permissions = async (req, res) => {
    try {
        let role = req.result.roles

        let permissions = await getPermissionsForRole(role)

        if (permissions.length < 1) { return res.status(400).json(errorResponse("Not a single Permission assigned to this role.")) }

        return res.status(200).json(successResponse("successfully fetched.", permissions))

    } catch (error) {

        console.log("ERROR::", error)
        return res.status(500).json(errorResponse(error.message))
    }
}

// ---


exports.get_roles_and_employees = async (req, res) => {
    try {
        const rolesWithEmployees = await sequelize.query(`
            SELECT 
                u.username, 
                r.role
            FROM 
                user_roles ur
            JOIN 
                users u ON ur.employee_id = u.id
            JOIN 
                roles r ON ur.role_id = r.id;
        `, {
            type: sequelize.QueryTypes.SELECT
        });

        if (rolesWithEmployees.length < 1) {
            return res.status(400).json(errorResponse("No data found."));
        }


        const groupedData = rolesWithEmployees.reduce((acc, { role, username }) => {
            if (!acc[role]) {
                acc[role] = [];
            }

            acc[role].push(username);
            return acc;
        }, {});


        const rolesWithTheirEmployees = Object.keys(groupedData).map(role => ({
            role,
            employees: groupedData[role]
        }));

        return res.status(200).json(successResponse('Successfully fetched.', rolesWithTheirEmployees));

    } catch (error) {
        console.log("ERROR::", error);
        return res.status(500).json(errorResponse(error.message));
    }
};


// ---

exports.assign_role = async (req, res) => {
    const { employee_id, role_id } = req.body;

    try {

        const check_existing_role_query = `
            SELECT * FROM user_roles 
            WHERE user_id = ? AND role_id = ?`;

        const existingRole = await sequelize.query(check_existing_role_query, {
            replacements: [employee_id, role_id],
            type: sequelize.QueryTypes.SELECT
        });


        if (existingRole.length > 0) {
            return res.status(400).json(errorResponse("This role is already assigned to the employee."));
        }


        const assign_new_role_query = `
            INSERT INTO user_roles (user_id, role_id, created_at, updated_at) 
            VALUES (?, ?, NOW(), NOW())`;

        const is_role_assigned = await sequelize.query(assign_new_role_query, {
            replacements: [employee_id, role_id],
            type: sequelize.QueryTypes.INSERT
        });

        if (!is_role_assigned) {
            return res.status(400).json(errorResponse("Failed to assign role."));
        }

        return res.status(200).json(successResponse("Role assigned to the employee successfully."));

    } catch (error) {
        console.error("Error during role assignment:", error);
        return res.status(500).json(errorResponse(error.message));
    }
};



// --- 



exports.assign_new_permissions_to_new_role = async (req, res) => {
    const { permission_data, role, employee_id } = req.body;

    const transaction = await sequelize.transaction();

    try {
        // Step 1: Insert a new role
        const add_new_role_query = `INSERT INTO roles (role) VALUES (?)`;
        const [insert_role_result] = await sequelize.query(add_new_role_query, {
            replacements: [role],
            type: sequelize.QueryTypes.INSERT,
            transaction
        });
        console.log("roles ------", insert_role_result)
        const role_id = insert_role_result;

        if (!role_id) throw new Error("Error while creating new role");

        // Step 2: Assign the new role to employees
        if (employee_id?.length > 0) {
            const employeeRolesValues = employee_id.map(id => `(${id}, ${role_id})`).join(', ');
            const insert_employee_roles_query = `
                INSERT INTO user_roles (employee_id, role_id) 
                VALUES ${employeeRolesValues}
            `;
            await sequelize.query(insert_employee_roles_query, {
                type: sequelize.QueryTypes.INSERT,
                transaction
            });
        }

        // Step 3: Batch insert role permissions
        const permissionValues = permission_data.map(obj =>
            `(${role_id}, ${obj.permission_id}, ${obj.can_view}, ${obj.can_create}, ${obj.can_update}, ${obj.can_delete})`
        ).join(', ');

        const insert_permissions_query = `
            INSERT INTO roles_permissions (role_id, permission_id, can_view, can_create, can_update, can_delete)
            VALUES ${permissionValues}
        `;
        await sequelize.query(insert_permissions_query, {
            type: sequelize.QueryTypes.INSERT,
            transaction
        });

        // Commit transaction
        await transaction.commit();

        res.status(200).json({
            type: "success",
            message: "New role and permissions assigned successfully."
        });

    } catch (error) {
        console.log("ERROR::", error)
        await transaction.rollback();
        res.status(400).json({
            type: "error",
            message: error.message
        });
    }
};

// ---- timestramps shows 000000



exports.update_permissions_assigned_to_role = async (req, res) => {
    // hankish 3-9-2024
    const { permission_data } = req.body;
    try {
        const updatePromises = permission_data.map(obj => {
            const query = `
                UPDATE roles_permissions
                SET 
                    can_view = ${obj.can_view}, 
                    can_create = ${obj.can_create}, 
                    can_update = ${obj.can_update}, 
                    can_delete = ${obj.can_delete}
                WHERE 
                    role_id = ${obj.role_id} AND 
                    permission_id = ${obj.permission_id}
            `;

            return sequelize.query(query, {
                type: sequelize.QueryTypes.UPDATE
            });
        });

        await Promise.all(updatePromises);

        res.status(200).json({
            type: "success",
            message: "Permissions updated successfully"
        });

    } catch (error) {
        res.status(400).json({
            type: "error",
            message: error.message
        });
    }
};

// -----



exports.disabled_role = async (req, res) => {
    // hankish 4-9-2024
    const { role_id } = req.body;

    const transaction = await sequelize.transaction();

    try {
        // Step 1: Disable the role in the 'roles' table
        const disableRoleQuery = `UPDATE roles SET is_disabled = 1 WHERE id = ?`;
        const [isRoleDisabled] = await sequelize.query(disableRoleQuery, {
            replacements: [role_id],
            type: sequelize.QueryTypes.UPDATE,
            transaction
        });

        if (isRoleDisabled[0] === 0) {
            throw new Error("Error while disabling role in 'roles' table");
        }

        // Step 2: Check if the role exists in 'employee_roles'
        const checkRoleInEmployeeRoles = `SELECT * FROM user_roles WHERE role_id = ?`;
        const isRoleExistInEmployeeRoles = await sequelize.query(checkRoleInEmployeeRoles, {
            replacements: [role_id],
            type: sequelize.QueryTypes.SELECT,
            transaction
        });

        // Step 3: Check if the role exists in 'roles_permissions'
        const checkRoleInRolesPermissions = `SELECT * FROM user_permissions WHERE role_id = ?`;
        const isRoleExistInRolesPermissions = await sequelize.query(checkRoleInRolesPermissions, {
            replacements: [role_id],
            type: sequelize.QueryTypes.SELECT,
            transaction
        });

        // Step 4: Disable the role in 'roles_permissions' if it exists
        if (isRoleExistInRolesPermissions.length > 0) {
            const disableRoleInRolesPermissions = `UPDATE roles_permissions SET is_disabled = 1 WHERE role_id = ?`;
            const [isRoleDisabledInRolesPermissions] = await sequelize.query(disableRoleInRolesPermissions, {
                replacements: [role_id],
                type: sequelize.QueryTypes.UPDATE,
                transaction
            });

            if (isRoleDisabledInRolesPermissions[0] === 0) {
                throw new Error("Error while disabling role in 'roles_permissions' table");
            }
        }

        // Step 5: Disable the role in 'employee_roles' if it exists
        if (isRoleExistInEmployeeRoles.length > 0) {
            const disableRoleInEmployeeRoles = `UPDATE user_roles SET is_disabled = 1 WHERE role_id = ?`;
            const [isRoleDisabledInEmployeeRoles] = await sequelize.query(disableRoleInEmployeeRoles, {
                replacements: [role_id],
                type: sequelize.QueryTypes.UPDATE,
                transaction
            });

            if (isRoleDisabledInEmployeeRoles[0] === 0) {
                throw new Error("Error while disabling role in 'employee_roles' table");
            }
        }

        // Commit transaction
        await transaction.commit();

        res.status(200).json({
            type: "success",
            message: "Role disabled successfully"
        });

    } catch (error) {
        console.log("ERROR::", error)
        await transaction.rollback();
        res.status(500).json({
            type: "error",
            message: error.message
        });
    }
};



// ------


exports.delete_employee_role = async (req, res) => {
    try {
        const userId = req.result.userId;
        const roleId = req.query.roleId;

        // Check if the relationship exists
        const [existingRelationship] = await sequelize.query(
            `SELECT * FROM user_roles WHERE user_id = :userId AND role_id = :roleId`,
            {
                replacements: { userId, roleId },
                type: sequelize.QueryTypes.SELECT
            }
        );

        if (!existingRelationship) {
            return res.status(404).json({
                message: "Employee-role assignment not found.",
                type: 'error'
            });
        }

        // Delete the relationship
        await sequelize.query(
            `DELETE FROM user_roles WHERE user_id = :userId AND role_id = :roleId`,
            {
                replacements: { userId, roleId },
                type: sequelize.QueryTypes.DELETE
            }
        );

        return res.status(200).json({
            message: "Employee-role assignment removed successfully.",
            type: 'success'
        });
    } catch (error) {
        console.log("ERROR::", error);
        return res.status(500).json({
            message: error.message,
            type: 'error'
        });
    }
};


