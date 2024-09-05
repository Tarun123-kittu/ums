'use strict';

const { EmployeeRoles, Employee, Role } = require('../models'); 

module.exports = {
  up: async (queryInterface, Sequelize) => {

  
    const employeeRolesMappings = [
      { employeeId: '1', roleId: '1' },  // Static admin user and admin role
      { employeeId: "1", roleId: "3" }   // Assigning another role (e.g., for additional permissions)
    ];

    for (const mapping of employeeRolesMappings) {
      const { employeeId, roleId } = mapping;

      
      const employeeExists = await Employee.findByPk(employeeId);
      const roleExists = await Role.findByPk(roleId);

      if (!employeeExists) {
        console.log(`Employee with ID ${employeeId} does not exist.`);
        continue;
      }

      if (!roleExists) {
        console.log(`Role with ID ${roleId} does not exist.`);
        continue;
      }


      const [employeeRole, created] = await EmployeeRoles.findOrCreate({
        where: {
          employee_id: employeeId, 
          role_id: roleId,
        },
        defaults: {
          is_disabled: false
        },
      });

      if (created) {
        console.log(`Role ${roleId} assigned to employee ${employeeId}.`);
      } else {
        console.log(`Employee ${employeeId} already assigned to role ${roleId}.`);
      }
    }
  },

  down: async (queryInterface, Sequelize) => {
    
    await queryInterface.bulkDelete('employee_roles', null, {});
  }
};
