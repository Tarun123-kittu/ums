const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Languages extends Model {}

  Languages.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    language: {
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
    modelName: 'Language',
    tableName: 'languages', 
    timestamps: true, 
  });

  return Languages;
};
