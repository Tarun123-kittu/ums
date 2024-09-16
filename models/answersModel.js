const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Answers extends Model {}

  Answers.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      language_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Languages',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      series_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'TestSeries',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      answer: {
        type: DataTypes.TEXT,
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
      correct_answer: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      correct_option: {
        type: DataTypes.STRING,
        allowNull: true,
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
      modelName: 'Answers',
      tableName: 'answers',
      timestamps: true,
    }
  );

  return Answers;
};
