'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class RolesPermissions extends Model { }

  RolesPermissions.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
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
    status: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'RolesPermissions',
    tableName: 'Roles_Permissions',
    timestamps: true,
  });

  return RolesPermissions;
};
