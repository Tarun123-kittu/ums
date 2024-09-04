'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class RolesPermissions extends Model { }

  RolesPermissions.init({
    id: {
      type: DataTypes.INTEGER, // Changed to INTEGER for auto-incrementing
      autoIncrement: true, // Added for auto-increment
      primaryKey: true,
    },
    role_id: {
      type: DataTypes.INTEGER, // Changed to INTEGER to match the Roles table
      references: {
        model: 'Roles',
        key: 'id',
      },
      onUpdate: 'CASCADE', // Optional: Define behavior on update
      onDelete: 'CASCADE', // Optional: Define behavior on delete
    },
    permission_id: {
      type: DataTypes.INTEGER, // Changed to INTEGER to match the Permissions table
      references: {
        model: 'Permissions',
        key: 'id',
      },
      onUpdate: 'CASCADE', // Optional: Define behavior on update
      onDelete: 'CASCADE', // Optional: Define behavior on delete
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
