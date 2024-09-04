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
                u.username, 
                r.role
            FROM 
                user_roles ur
            JOIN 
                users u ON ur.user_id = u.id
            JOIN 
                roles r ON ur.role_id = r.id;
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
    try {

    } catch (error) {
        console.log("ERROR:: ", error)
        return res.status(500).json(errorResponse(error.response))
    }
}

exports.assign_new_permissions_to_new_role = async (req, res) => {
    // name : hankish , 3-9-2024
    const { permission_data, role } = req.body;
    try {
        var add_new_role_query = `INSERT INTO roles (role) VALUES (?)`;
        var [insert_role] = await sequelize.query(add_new_role_query, {
            replacements: [role],
            type: sequelize.QueryTypes.INSERT
        });

        if (!insert_role) return res.status(400).json({ type: "error", message: "Error while creating new role" })
        const values = permission_data.map(obj =>
            `(${insert_role}, ${obj.permission_id}, ${obj.can_view}, ${obj.can_create}, ${obj.can_update}, ${obj.can_delete})`
        ).join(', ');

        const query = `
                INSERT INTO roles_permissions (role_id, permission_id, can_view, can_create, can_update, can_delete)
                VALUES ${values}
            `;

        const insert_permissions = await sequelize.query(query, {
            type: sequelize.QueryTypes.INSERT
        });

        if (!insert_permissions) {
            return res.status(400).json({ type: "error", message: "Error while creating new Permissions" });
        }

        res.status(200).json({
            type: "success",
            message: "New permissions created successfully"
        });

    } catch (error) {
        res.status(400).json({
            type: "error",
            message: error.message
        });
    }
};

exports.update_permissions_assigned_to_role = async (req, res) => {
    // name : hankish , 3-9-2024
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
    // name: hankish, 4-9-2024
    const { role_id } = req.body;

    try {
        // Disable the role in the 'roles' table
        const disableRoleQuery = `UPDATE roles SET is_disabled = 1 WHERE id = ?`;
        const isRoleDisabled = await sequelize.query(disableRoleQuery, {
            replacements: [role_id],
            type: sequelize.QueryTypes.UPDATE
        });

        if (!isRoleDisabled) {
            return res.status(400).json({ type: "error", message: "Error while disabling role, please try again later" });
        }

        // Check if the role exists in 'user_roles'
        const checkRoleInUserRoles = `SELECT * FROM user_roles WHERE role_id = ?`;
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
                return res.status(400).json({ type: "error", message: "123456Error while disabling role in roles_permissions, please try again later" });
            }
        }

        // Disable the role in 'user_roles' if it exists
        if (isRoleExistInUserRoles > 0) {
            const disableRoleInUserRoles = `UPDATE user_roles SET is_disabled = 1 WHERE role_id = ?`;
            const [isRoleDisabledInUserRoles] = await sequelize.query(disableRoleInUserRoles, {
                replacements: [role_id],
                type: sequelize.QueryTypes.UPDATE
            });

            if (!isRoleDisabledInUserRoles) {
                return res.status(400).json({ type: "error", message: "Error while disabling role in user_roles, please try again later" });
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

