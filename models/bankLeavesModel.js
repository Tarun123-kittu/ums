const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    class BankLeaves extends Model { }

    BankLeaves.init({
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        employee_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        paid_leave: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        taken_leave: {
            type: DataTypes.FLOAT,
            allowNull: true,
        },
        month_year: {
            type: DataTypes.DATE, 
            allowNull: true,
        },
        session: {
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
    }, {
        sequelize,
        modelName: 'BankLeaves',
        tableName: 'bank_leaves',
        timestamps: true, 
    });

    return BankLeaves;
};
