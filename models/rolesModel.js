const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Roles extends Model {}

  Roles.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  }, {
    sequelize,
    modelName: 'Roles',
    tableName: 'roles',
    timestamps: true,
  });

  return Roles;
};
