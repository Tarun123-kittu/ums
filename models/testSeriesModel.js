const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class TestSeries extends Model { }

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
    time_taken: {
      type: DataTypes.TIME,
      allowNull: false, // This field does not allow null values
    },
    description: {
      type: DataTypes.STRING(500),
      allowNull: false, // This field does not allow null values
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: false, // This field does not allow null values
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
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
