const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Role extends Model {}
  
  Role.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
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
    modelName: 'Role',
    tableName: 'Roles',
    timestamps: true,
  });

  return Role;
};
