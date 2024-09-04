const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Permission extends Model { }

  Permission.init({
    id: {
      type: DataTypes.INTEGER, 
      autoIncrement: true,
      primaryKey: true,
    },
    permission: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    is_disabled: { 
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,  
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
    modelName: 'Permission',
    tableName: 'Permissions',
    timestamps: true,
  });

  return Permission;
};
