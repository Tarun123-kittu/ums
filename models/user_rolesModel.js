'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class UserRoles extends Model { }

  UserRoles.init({
    id: {
      type: DataTypes.INTEGER, 
      autoIncrement: true, 
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER, 
      references: {
        model: 'Users',
        key: 'id',
      },
      onUpdate: 'CASCADE', 
      onDelete: 'CASCADE', 
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
    is_disabled: { 
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,  
    },
    is_disabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  }, {
    sequelize,
    modelName: 'UserRoles',
    tableName: 'user_roles',
    underscored: true,
  });

  return UserRoles;
};
