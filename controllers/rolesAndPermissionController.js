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