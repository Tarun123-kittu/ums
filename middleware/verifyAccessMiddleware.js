const {successResponse,errorResponse} = require("../utils/responseHandler")
const getPermissionsForRole = require("../utils/getPermissions")

const verifyAccess = (permissionName, action) => {

    return async (req, res, next) => {
        try {
            
            const userRoles = req.user.roles;

            let permissions = await getPermissionsForRole(userRoles);

            const permission = permissions.find(p => p.permission_name === permissionName);

            if (!permission) {
                console.warn(`Warning: No permissions found for ${permissionName}`);
                return next(); 
            }

            const actionMap = {
                'view': 'can_view',
                'update': 'can_update',
                'create': 'can_create',
                'delete': 'can_delete'
            };

            if (!actionMap[action]) {
                return res.status(400).json(errorResponse('Invalid action : '+ action) );
            }

            if (permission[actionMap[action]] === 1) {
                return next();
            }

            return res.status(403).json(errorResponse( `Access Denied: You do not have ${action} permission for ${permissionName}`));
        } catch (error) {
            console.error("ERROR::", error);
            return res.status(500).json(errorResponse(error.message));
        }
    };
};



module.exports = verifyAccess;
