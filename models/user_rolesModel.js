'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class UserRoles extends Model { }

  UserRoles.init({
    id: {
      type: DataTypes.INTEGER, // Changed to INTEGER for auto-incrementing
      autoIncrement: true, // Added for auto-increment
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER, // Changed to INTEGER to match the Users table
      references: {
        model: 'Users',
        key: 'id',
      },
      onUpdate: 'CASCADE', // Optional: Define behavior on update
      onDelete: 'CASCADE', // Optional: Define behavior on delete
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
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'created_at',
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'updated_at',
    },
  }, {
    sequelize,
    modelName: 'UserRoles',
    tableName: 'user_roles',
    underscored: true,
  });

  return UserRoles;
};
