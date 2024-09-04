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