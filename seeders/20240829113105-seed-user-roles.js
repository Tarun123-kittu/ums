const { sequelize } = require('../models');

const getLatestRoles = async (userId) => {
    try {
        // SQL query to fetch roles for a given userId
        const getUserRolesQuery = `
            SELECT 
                u.id AS user_id, 
                r.role AS role_name
            FROM 
                Users u
            LEFT JOIN 
                user_roles ur ON u.id = ur.user_id
            LEFT JOIN 
                Roles r ON ur.role_id = r.id
            WHERE 
                u.id = :userId
        `;

        // Execute the query
        const userRolesData = await sequelize.query(getUserRolesQuery, {
            replacements: { userId },
            type: sequelize.QueryTypes.SELECT,
        });

        // If no data is found, return an empty array
        if (!userRolesData || userRolesData.length === 0) {
            return { success: false, message: "No roles found for this user.", roles: [] };
        }

        // Extract unique role names
        const roles = [...new Set(userRolesData.map(roleData => roleData.role_name))];

        return { success: true, roles };
    } catch (error) {
        console.error("ERROR::", error);
        // Return a structured error object
        return { success: false, message: "Internal Server Error", error: error.message };
    }
};

module.exports = getLatestRoles;
