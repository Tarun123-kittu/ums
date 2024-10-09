const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class HR_Round_Questions extends Model {}

  HR_Round_Questions.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    question: {
      type: DataTypes.TEXT,
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
    modelName: 'HR_Round_Questions',
    tableName: 'HR_Round_Questions',
    timestamps: true,
  });

  return HR_Round_Questions;
};
