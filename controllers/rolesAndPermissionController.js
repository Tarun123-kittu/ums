const { sequelize } = require('../models');

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

