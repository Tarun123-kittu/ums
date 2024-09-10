const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Attendance extends Model { }

  Attendance.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    in_time: {
      type: DataTypes.TIME,
      allowNull: true,
    },
    out_time: {
      type: DataTypes.TIME,
      allowNull: true,
    },
    total_time: {
      type: DataTypes.TIME,
      allowNull: true,
    },
    on_break: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    status: {
      type: DataTypes.ENUM('PRESENT', 'ABSENT', 'LEAVE', 'SUSPENDED'),
      allowNull: true,
      defaultValue: 'ABSENT',
    },
    report: {
      type: DataTypes.STRING(2000),
      allowNull: true,
    },
    remark: {
      type: DataTypes.STRING(2000),
      allowNull: true,
    },
    rating: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: 5,
    },
    login_device: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    login_mobile: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    logout_device: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    logout_mobile: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    created_by: {
      type: DataTypes.INTEGER,
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
    modelName: 'Attendance',
    tableName: 'attendances',
    timestamps: true,
  });

  return Attendance;
};
