'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Roles extends Model {
    static associate(models) {
      Roles.belongsToMany(models.Permissions, {
        through: 'Roles_Permissions',
        foreignKey: 'role_id',
        otherKey: 'permission_id',
        as: 'permissions',
      });
    }
  }

  Roles.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'Roles',
    tableName: 'Roles',
    timestamps: true,
  });

  return Roles;
};
