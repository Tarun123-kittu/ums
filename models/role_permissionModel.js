'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class RolesPermissions extends Model { }

  RolesPermissions.init({
    id: {
      type: DataTypes.INTEGER, 
      autoIncrement: true, 
      primaryKey: true,
    },
    role_id: {
      type: DataTypes.INTEGER, 
      references: {
        model: 'Roles',
        key: 'id',
      },
      onUpdate: 'CASCADE', 
      onDelete: 'CASCADE', 
    },
    permission_id: {
      type: DataTypes.INTEGER, 
      references: {
        model: 'Permissions',
        key: 'id',
      },
      onUpdate: 'CASCADE', 
      onDelete: 'CASCADE', 
    },
    is_disabled: { 
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,  
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
    is_disabled: {
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
