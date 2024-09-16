const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class TestSeries extends Model {}

  TestSeries.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    language_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Languages',
        key: 'id',
      },
    },
    series_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('pending', 'completed'),
      allowNull: false,
      defaultValue: 'pending',
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
    modelName: 'TestSeries',
    tableName: 'test_series',
    timestamps: true,
  });

  return TestSeries;
};
