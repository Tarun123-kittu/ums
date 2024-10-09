const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Leaves extends Model { }

  Leaves.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    from_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    to_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    count: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    count_from: {
      type: DataTypes.TINYINT,
      allowNull: true,
    },
    count_to: {
      type: DataTypes.TINYINT,
      allowNull: true,
    },
    sandwich: {
      type: DataTypes.TINYINT,
      allowNull: true,
      defaultValue: 0,
    },
    description: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    type: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('ACCEPTED', 'REJECTED', 'PENDING', 'CANCELLED'),
      allowNull: true,
      defaultValue: 'PENDING',
    },
    status_changed_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    remark: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      onUpdate: DataTypes.NOW,
    },
  }, {
    sequelize,
    modelName: 'Leave',
    tableName: 'leaves',
    timestamps: true,
  });

  return Leaves;
};
