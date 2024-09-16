const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Options extends Model {}

  Options.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      question_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'TechnicalRoundQuestions', 
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      option: {
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
    },
    {
      sequelize,
      modelName: 'Options',
      tableName: 'options',
      timestamps: true,
    }
  );

  return Options;
};
