'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class User extends Model { }

  User.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    mobile: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    emergency_contact_relationship: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    emergency_contact_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    emergency_contact: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    bank_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    account_number: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    ifsc: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    increment_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    pending_leave: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
    },
    gender: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    dob: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    doj: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    skype_email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    ultivic_email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    salary: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    security: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    total_security: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    installments: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    position: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    department: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    password_reset_token: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    is_disabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
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
    modelName: 'User',
    tableName: 'Users',
    timestamps: true,
  });

  return User;
};
