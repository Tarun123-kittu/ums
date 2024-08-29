'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class RolesPermissions extends Model {}

  RolesPermissions.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    role_id: {
      type: DataTypes.UUID,
      references: {
        model: 'Roles', 
        key: 'id',
      },
    },
    permission_id: {
      type: DataTypes.UUID,
      references: {
        model: 'Permissions', 
        key: 'id',
      },
    },
    can_view: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    can_create: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    can_update: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    can_delete: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'createdAt',
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'updatedAt',
    },
  }, {
    sequelize,
    modelName: 'RolesPermissions',
    tableName: 'roles_permissions',
    underscored: true, 
  });

  return RolesPermissions;
};
