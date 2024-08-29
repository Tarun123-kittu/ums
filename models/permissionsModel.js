'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Permissions extends Model {
    static associate(models) {

      Permissions.belongsToMany(models.Roles, {
        through: 'Roles_Permissions',
        foreignKey: 'permission_id',
        otherKey: 'role_id',
        as: 'roles',
      });
    }
  }

  Permissions.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    permission: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'Permissions',
    tableName: 'Permissions',
    timestamps: true,
  });

  return Permissions;
};
