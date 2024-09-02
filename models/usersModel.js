'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class User extends Model { }

  User.init({
    id: {
      type: DataTypes.INTEGER, // Changed to INTEGER for auto-incrementing
      autoIncrement: true, // Added for auto-increment
      primaryKey: true,
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
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    password_reset_token: {
      type: DataTypes.STRING, // Adjust the type as needed
      allowNull: true, // Allowing null since not all users will have a reset token
    },
    password_reset_token_expires_in: {
      type: DataTypes.DATE, // New field added
      allowNull: true, // Allowing null if the token expiration date is not set
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
