const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
class HolidayAndEvent extends Model { }

HolidayAndEvent.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        date: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },
        occasion_name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        occasion_type: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        occasion_description:{
            type: DataTypes.STRING,
            allowNull: true,
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
    },
    {
        sequelize,
        modelName: 'HolidayAndEvent',
        tableName: 'holidays_and_events',
        timestamps: true,
    });

   return HolidayAndEvent;
};