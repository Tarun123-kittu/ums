const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class InterviewLead extends Model {}

  InterviewLead.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone_number: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    gender: {
      type: DataTypes.ENUM('Male', 'Female', 'Other'),
      allowNull: false,
    },
    dob: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    experience: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
    },
    current_salary: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: null,
    },
    expected_salary: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: null,
    },
    profile: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    },
    last_company: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    },
    state: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    house_address: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    in_round: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    test_auth_token: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    is_open: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    assigned_test_series: {
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
    },
  }, {
    sequelize,
    modelName: 'InterviewLead',
    tableName: 'Interview_Leads',
    timestamps: true,
  });

  return InterviewLead;
};
