let { errorResponse, successResponse } = require("../utils/responseHandler")
let getPermissionsForRole = require("../utils/getPermissions")
let { sequelize } = require('../models')



exports.get_user_permissions = async (req, res) => {
    try {
        let role = req.user.roles

        let permissions = await getPermissionsForRole(role)

        if (permissions.length < 1) { return res.status(400).json(errorResponse("Not a single Permission assigned to this role.")) }

        return res.status(200).json(successResponse("successfully fetched.", permissions))

    } catch (error) {

        console.log("ERROR::", error)
        return res.status(500).json(errorResponse(error.message))
    }
}




exports.get_roles_and_users = async (req, res) => {
    try {
        const rolesWithUsers = await sequelize.query(`
            SELECT 
                e.username, 
                r.role
            FROM 
                employee_roles er
            JOIN 
                employees u ON er.employee_id = ueid
            JOIN 
                roles r ON er.role_id = r.id;
        `, {
            type: sequelize.QueryTypes.SELECT
        });

        if (rolesWithUsers.length < 1) { return res.status(400).json(errorResponse("No data found.")) }

        const groupedData = rolesWithUsers.reduce((acc, { role, username }) => {

            if (!acc[role]) {
                acc[role] = [];
            }

            acc[role].push(username);
            return acc;
        }, {});


        const rolesWithTheirUsers = Object.keys(groupedData).map(role => ({
            role,
            users: groupedData[role]
        }));

        return res.status(200).json(successResponse('successfully fetched.', rolesWithTheirUsers))

    } catch (error) {
        console.log("ERROR::", error)
        return res.status(500).json(errorResponse(error.message))
    }
}



exports.assign_role = async (req, res) => {
    // hankish,4-9-2024
    const { user_id, role_id } = req.body
    try {
        const assign_new_role_query = `INSERT INTO employee_roles (user_id,role_id) VALUES (?,?)`;

        const is_role_assigned = await sequelize.query(assign_new_role_query, {
            replacements: [user_id, role_id],
            type: sequelize.QueryTypes.INSERT
        });

        if (!is_role_assigned) return res.status(400).json(errorResponse(error.response))

        res.status(200).json(successResponse("Role assigned to the User Successfully"))
    } catch (error) {
        return res.status(500).json(errorResponse(error.response))
    }
}

exports.assign_new_permissions_to_new_role = async (req, res) => {
    // hankish 4-9-2024
    const { permission_data, role, user_id } = req.body;

    const transaction = await sequelize.transaction();

    try {
        // Insert new role
        const add_new_role_query = `INSERT INTO roles (role) VALUES (?)`;
        const [insert_role_result] = await sequelize.query(add_new_role_query, {
            replacements: [role],
            type: sequelize.QueryTypes.INSERT,
            transaction
        });

        const role_id = insert_role_result;

        if (!role_id) throw new Error("Error while creating new role");

        // Batch insert user roles
        if (user_id?.length > 0) {
            const userRolesValues = user_id.map(id => `(${id}, ${role_id})`).join(', ');
            const insert_user_roles_query = `
                INSERT INTO employee_roles (user_id, role_id) 
                VALUES ${userRolesValues}
            `;
            await sequelize.query(insert_user_roles_query, {
                type: sequelize.QueryTypes.INSERT,
                transaction
            });
        }

        // Batch insert role permissions
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
            message: "New permissions created successfully"
        });

    } catch (error) {
        // Rollback transaction in case of error
        await transaction.rollback();
        res.status(400).json({
            type: "error",
            message: error.message
        });
    }
};




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





exports.disabled_role = async (req, res) => {
    // hankish 4-9-2024
    const { role_id } = req.body;

    try {
        // Disable the role in the 'roles' table
        const disableRoleQuery = `UPDATE roles SET is_disabled = 1 WHERE id = ?`;
        const isRoleDisabled = await sequelize.query(disableRoleQuery, {
            replacements: [role_id],
            type: sequelize.QueryTypes.UPDATE
        });

        if (!isRoleDisabled) {
            return res.status(400).json({ type: "error", message: "Error while deleting role, please try again later" });
        }

        // Check if the role exists in 'user_roles'
        const checkRoleInUserRoles = `SELECT * FROM employee_roles WHERE role_id = ?`;
        const isRoleExistInUserRoles = await sequelize.query(checkRoleInUserRoles, {
            replacements: [role_id],
            type: sequelize.QueryTypes.SELECT
        });

        // Check if the role exists in 'roles_permissions'
        const checkRoleInRolePermissions = `SELECT * FROM roles_permissions WHERE role_id = ?`;
        const isRoleExistInRolePermissions = await sequelize.query(checkRoleInRolePermissions, {
            replacements: [role_id],
            type: sequelize.QueryTypes.SELECT
        });

        // Disable the role in 'roles_permissions' if it exists
        if (isRoleExistInRolePermissions > 0) {
            const disableRoleInRolePermissions = `UPDATE roles_permissions SET is_disabled = 1 WHERE role_id = ?`;
            const [isRoleDisabledInRolePermissions] = await sequelize.query(disableRoleInRolePermissions, {
                replacements: [role_id],
                type: sequelize.QueryTypes.UPDATE
            });

            if (!isRoleDisabledInRolePermissions) {
                return res.status(400).json({ type: "error", message: "Error while deleting role in roles_permissions, please try again later" });
            }
        }

        // Disable the role in 'user_roles' if it exists
        if (isRoleExistInUserRoles > 0) {
            const disableRoleInUserRoles = `UPDATE employee_roles SET is_disabled = 1 WHERE role_id = ?`;
            const [isRoleDisabledInUserRoles] = await sequelize.query(disableRoleInUserRoles, {
                replacements: [role_id],
                type: sequelize.QueryTypes.UPDATE
            });

            if (!isRoleDisabledInUserRoles) {
                return res.status(400).json({ type: "error", message: "Error while deleting role in user_roles, please try again later" });
            }
        }

        res.status(200).json({
            type: "success",
            message: "Role disabled successfully"
        });

    } catch (error) {
        res.status(500).json({
            type: "error",
            message: error.message
        });
    }
};




exports.delete_user_role = async (req, res) => {
    try {
        const userId = req.result.userId;
        const roleId = req.query.roleId;


        const [existingRelationship] = await sequelize.query(
            `SELECT * FROM employee_roles WHERE employee_id = :userId AND role_id = :roleId`,
            {
                replacements: { userId, roleId },
                type: sequelize.QueryTypes.SELECT
            }
        );

        if (!existingRelationship) {
            return res.status(404).json({
                message: "User-role assignment not found.",
                type: 'error'
            });
        }

        const result = await sequelize.query(
            `DELETE FROM employee_roles WHERE employee_id = :userId AND role_id = :roleId`,
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
        console.log("ERROR::", error);
        return res.status(500).json({
            message: error.message,
            type: 'error'
        });
    }
};

