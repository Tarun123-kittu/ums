const { errorResponse } = require("../utils/responseHandler");
const getPermissionsForRoles = require("../utils/getPermissions");



const verifyAccess = (permissionName, action) => {
  return async (req, res, next) => {
    try {
      const userRoles = req.result.roles;

      const permissionsByRoles = await getPermissionsForRoles(userRoles);

      const actionMap = {
        view: "can_view",
        update: "can_update",
        create: "can_create",
        delete: "can_delete",
      };

      if (!actionMap[action]) {
        return res.status(400).json(errorResponse("Invalid action: " + action));
      }
     
      let hasPermission = false;

      for (const rolePermissions of permissionsByRoles) {
        const permission = rolePermissions.permissions.find(
          (perm) => perm.permission_name === permissionName
        );

        if (permission && permission[actionMap[action]] === 1) {
          hasPermission = true;
          break; 
        }
      }

      if (hasPermission) {
        return next(); 
      }

      return res.status(403).json(
        errorResponse(
          `Access Denied: You do not have ${action} permission for ${permissionName}`
        )
      );
    } catch (error) {
      console.error("ERROR::", error);
      return res.status(500).json(errorResponse(error.message));
    }
  };
};

module.exports = verifyAccess;
