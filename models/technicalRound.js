const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class TechnicalRound extends Model {}

  TechnicalRound.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    interview_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    lead_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    question_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    answer: {
        type: DataTypes.STRING,
        allowNull: false,
      },
<<<<<<< HEAD
=======
      answer_status: {
        type: DataTypes.ENUM('correct', 'incorrect', 'not_attempted'),
        allowNull: false,
    },
    key_point: {
        type: DataTypes.STRING,
        allowNull: true,
    },
>>>>>>> testing
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
    modelName: 'TechnicalRound',
    tableName: 'technical_round',
    timestamps: true,
  });

  return TechnicalRound;
};
