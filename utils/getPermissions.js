const {sequelize} = require("../models")

const getPermissionsForRole = async (roleName) => {
    const query = `
      SELECT
          r.role AS role_name,
          p.permission AS permission_name,
          rp.can_view,
          rp.can_update,
          rp.can_create,
          rp.can_delete
      FROM
          roles r
      JOIN
          roles_permissions rp ON r.id = rp.role_id
      JOIN
          permissions p ON rp.permission_id = p.id
      WHERE
          r.role = :role_name;
    `;
  
    try {
      const permissionsData = await sequelize.query(query, {
        replacements: { role_name: roleName },
        type: sequelize.QueryTypes.SELECT
      });
  
      if (!permissionsData || permissionsData.length === 0) {
        throw new Error(`No permissions found for role: ${roleName}`);
      }
  

      const permissionsByRole = permissionsData.map(({ permission_name, can_view, can_update, can_create, can_delete }) => ({
        permission_name,
        can_view,
        can_update,
        can_create,
        can_delete
      }));
  
      return permissionsByRole;
    } catch (error) {
      console.error("Error fetching permissions:", error);
      throw error;
    }
  };
  

  module.exports = getPermissionsForRole