const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class TechnicalRoundQuestions extends Model {}

  TechnicalRoundQuestions.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      test_series_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'TestSeries', 
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
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
      question_type: {
        type: DataTypes.ENUM('subjective', 'objective', 'logical'),
        allowNull: false,
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
    },
    {
      sequelize,
      modelName: 'TechnicalRoundQuestions',
      tableName: 'technical_round_questions',
      timestamps: true,
    }
  );

  return TechnicalRoundQuestions;
};
