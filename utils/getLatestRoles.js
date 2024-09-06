const { sequelize } = require('../models');


let getLatestRoles = async (userId) => {
    try {
            const getEmployeeRolesQuery = `
                SELECT 
                    e.id AS employee_id, 
                    r.role AS role_name
                FROM 
                    Employees e
                LEFT JOIN 
                    employee_roles er ON e.id = er.employee_id
                LEFT JOIN 
                    roles r ON er.role_id = r.id
                WHERE 
                    e.id = :userId
            `;

            const employeeRolesData = await sequelize.query(getEmployeeRolesQuery, {
                replacements: { userId },
                type: sequelize.QueryTypes.SELECT,
            });

            if (!employeeRolesData || employeeRolesData.length === 0) {
                return res.status(403).json({ message: "Employee roles not found", type: 'error' });
            }

          
            const roles = [...new Set(employeeRolesData.map(roleData => roleData.role_name))];

            return roles

    } catch (error) {
        console.log("ERROR::", error);
        return res.status(401).json({ message: "Internal Server Error", type: "error", data: error.message });
    }
};

module.exports = getLatestRoles;
