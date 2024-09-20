let { errorResponse, successResponse } = require("../utils/responseHandler")
let getPermissionsForRole = require("../utils/getPermissions")
let { sequelize } = require('../models')






exports.get_user_permissions = async (req, res) => {
    try {
        let role = req.result.roles

        let permissions = await getPermissionsForRole(role)

        if (permissions.length < 1) { return res.status(400).json(errorResponse("Not a single Permission assigned to this role.")) }

        return res.status(200).json(successResponse("successfully fetched.", permissions))

    } catch (error) {
        return res.status(500).json(errorResponse(error.message))
    }
}
exports.get_roles_and_users = async (req, res) => {
    try {
        const rolesWithUsers = await sequelize.query(`
            SELECT 
                u.username, 
                r.role
            FROM 
                user_roles ur
            JOIN 
                Users u ON ur.user_id = u.id
            JOIN 
                Roles r ON ur.role_id = r.id
            WHERE 
                u.is_disabled = false;
        `, {
            type: sequelize.QueryTypes.SELECT
        });

        if (rolesWithUsers.length < 1) {
            return res.status(400).json(errorResponse("No data found."));
        }

        // Group users by their roles
        const groupedData = rolesWithUsers.reduce((acc, { role, username }) => {
            if (!acc[role]) {
                acc[role] = [];  // Initialize the array if it doesn't exist
            }
            acc[role].push(username);  // Push username to the corresponding role
            return acc;
        }, {});

        // Convert grouped data into the desired format
        const rolesWithTheirUsers = Object.keys(groupedData).map(role => ({
            role,
            username: groupedData[role]  // Array of usernames
        }));

        return res.status(200).json(successResponse('Successfully fetched.', rolesWithTheirUsers));

    } catch (error) {
        return res.status(500).json(errorResponse(error.message));
    }
};

exports.assign_role = async (req, res) => {
    const { user_id, role_id } = req.body;
    try {
        const check_existing_role_query = `
            SELECT * FROM user_roles 
            WHERE user_id = ? AND role_id = ?`;

        const existingRole = await sequelize.query(check_existing_role_query, {
            replacements: [user_id, role_id],
            type: sequelize.QueryTypes.SELECT
        });

        if (existingRole.length > 0) {
            return res.status(400).json(errorResponse("This role is already assigned to the user."));
        }


        const assign_new_role_query = `
            INSERT INTO user_roles (user_id, role_id, createdAt, updatedAt) 
            VALUES (?, ?, NOW(), NOW())`;

        const is_role_assigned = await sequelize.query(assign_new_role_query, {
            replacements: [user_id, role_id],
            type: sequelize.QueryTypes.INSERT
        });

        if (!is_role_assigned) {
            return res.status(400).json(errorResponse("Failed to assign role."));
        }

        return res.status(200).json(successResponse("Role assigned to the user successfully."));

    } catch (error) {
        return res.status(500).json(errorResponse(error.message));
    }
};




exports.assign_new_permissions_to_new_role = async (req, res) => {
    const { permission_data, role, user_id } = req.body;

    const transaction = await sequelize.transaction();

    try {
        // Step 1: Insert a new role
        const add_new_role_query = `INSERT INTO roles (role) VALUES (?)`;
        const [insert_role_result] = await sequelize.query(add_new_role_query, {
            replacements: [role],
            type: sequelize.QueryTypes.INSERT,
            transaction
        });
        const role_id = insert_role_result ? insert_role_result : null;

        if (!role_id) throw new Error("Error while creating new role");


        // Step 2: Insert into user_roles if user_id is provided
        if (user_id?.length > 0) {
            const userRolesValues = user_id.map(id => `(${id}, ${role_id})`).join(', ');
            const insert_user_roles_query = `
                INSERT INTO user_roles (user_id, role_id) 
                VALUES ${userRolesValues}
            `;
            await sequelize.query(insert_user_roles_query, {
                type: sequelize.QueryTypes.INSERT,
                transaction
            });
        }


        // Step 3: Insert permissions
        const permissionValues = permission_data.map(obj =>
            `(${role_id}, ${obj.permission_id}, ${obj.can_view ? 1 : 0}, ${obj.can_create ? 1 : 0}, ${obj.can_update ? 1 : 0}, ${obj.can_delete ? 1 : 0})`
        ).join(', ');

        const insert_permissions_query = `
            INSERT INTO roles_permissions (role_id, permission_id, can_view, can_create, can_update, can_delete)
            VALUES ${permissionValues}
        `;

        await sequelize.query(insert_permissions_query, {
            type: sequelize.QueryTypes.INSERT,
            transaction
        });

        // Commit the transaction
        await transaction.commit();
        res.status(200).json({
            type: "success",
            message: "New role and permissions assigned successfully."
        });

    } catch (error) {

        if (error.message.includes('foreign key constraint fails')) {
            res.status(400).json({
                type: "error",
                message: "One or more user IDs do not exist in the database. Please check the user IDs and try again."
            });
        } else {
            res.status(400).json({
                type: "error",
                message: error.message
            });
        }
    }
};





exports.update_permissions_assigned_to_role = async (req, res) => {

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




exports.disabled_role = async (req, res) => {
    const { role_id } = req.body;

    if (!role_id) {
        return res.status(400).json({
            type: "error",
            message: "Role ID is required."
        });
    }

    const transaction = await sequelize.transaction();

    try {
        // Step 1: Disable the role in the 'roles' table
        const disableRoleQuery = `UPDATE roles SET is_disabled = true WHERE id = ?`;
        const [result] = await sequelize.query(disableRoleQuery, {
            replacements: [role_id],
            type: sequelize.QueryTypes.UPDATE,
            transaction
        });

        // Check the number of affected rows
        const affectedRows = result[1]; // Second element contains affected rows count
        if (affectedRows === 0) {
            throw new Error("Error while disabling role in 'roles' table or no rows were affected.");
        }

        // Step 2: Check if the role exists in 'user_roles'
        const checkRoleInUserRoles = `SELECT * FROM user_roles WHERE role_id = ?`;
        const isRoleExistInUserRoles = await sequelize.query(checkRoleInUserRoles, {
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
            const disableRoleInRolesPermissions = `UPDATE roles_permissions SET is_disabled = true WHERE role_id = ?`;
            const [resultInRolesPermissions] = await sequelize.query(disableRoleInRolesPermissions, {
                replacements: [role_id],
                type: sequelize.QueryTypes.UPDATE,
                transaction
            });

            const affectedRowsInRolesPermissions = resultInRolesPermissions[1];
            if (affectedRowsInRolesPermissions === 0) {
                throw new Error("Error while disabling role in 'roles_permissions' table");
            }
        }

        // Step 5: Disable the role in 'user_roles' if it exists
        if (isRoleExistInUserRoles.length > 0) {
            const disableRoleInUserRoles = `UPDATE user_roles SET is_disabled = true WHERE role_id = ?`;
            const [resultInUserRoles] = await sequelize.query(disableRoleInUserRoles, {
                replacements: [role_id],
                type: sequelize.QueryTypes.UPDATE,
                transaction
            });

            const affectedRowsInUserRoles = resultInUserRoles[1];
            if (affectedRowsInUserRoles === 0) {
                throw new Error("Error while disabling role in 'user_roles' table");
            }
        }

        // Commit transaction
        await transaction.commit();

        res.status(200).json({
            type: "success",
            message: "Role disabled successfully"
        });

    } catch (error) {
        await transaction.rollback();
        res.status(500).json({
            type: "error",
            message: error.message
        });
    }
};
// ------ this api need to recheck 



exports.delete_user_role = async (req, res) => {
    try {
        const userId = req.result.user_id;
        const roleId = req.query.roleId;


        const [existingRelationship] = await sequelize.query(
            `SELECT * FROM user_roles WHERE user_id = :userId AND role_id = :roleId`,
            {
                replacements: { userId, roleId },
                type: sequelize.QueryTypes.SELECT
            }
        );

        if (!existingRelationship) {
            return res.status(404).json({
                message: "user-role assignment not found.",
                type: 'error'
            });
        }


        await sequelize.query(
            `DELETE FROM user_roles WHERE user_id = :userId AND role_id = :roleId`,
            {
                replacements: { userId, roleId },
                type: sequelize.QueryTypes.DELETE
            }
        );
        return res.status(200).json({
            message: "User-role assignment removed successfully.",
            type: 'success'
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message,
            type: 'error'
        });
    }
};

exports.get_roles_permissions = async (req, res) => {
    const role = req.result.roles
    try {
        const get_role_id = `SELECT id FROM roles WHERE role = ?`
        const [is_role_exist] = await sequelize.query(get_role_id, {
            replacements: [role],
            type: sequelize.QueryTypes.SELECT,
        });

        if (!is_role_exist) return res.status(400).json({ type: "error", message: "role not found" })
        const role_id = is_role_exist?.id;

        const roles_permissions_query = `SELECT rp.can_view,rp.can_create,rp.can_update,rp.can_delete,p.permission,r.role FROM roles_permissions rp JOIN permissions p ON rp.permission_id = p.id JOIN roles r ON rp.role_id = r.id WHERE rp.is_disabled = false AND rp.role_id = ?;`
        const all_roles_permissions = await sequelize.query(roles_permissions_query, {
            replacements: [role_id],
            type: sequelize.QueryTypes.SELECT,
        });

        if (!all_roles_permissions) return res.status(400).json({ type: "error", message: "No permissions found" })

        res.status(200).json({ type: "success", data: all_roles_permissions })
    } catch (error) {
        res.status(400).json({ type: "error", message: error.message })
    }
}


