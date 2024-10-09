const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    class HRRound extends Model { }

    HRRound.init(
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            },
            interview_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'Interviews',
                    key: 'id',
                },
                onDelete: 'CASCADE',
            },
            lead_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'Interview_Leads',
                    key: 'id',
                },
                onDelete: 'CASCADE',
            },
            questionid: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'HR_Round_Questions',
                    key: 'id',
                },
                onDelete: 'CASCADE',
            },
            answer: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            key_point: {
                type: DataTypes.STRING(1000),
                allowNull: true,
            },
            auth_token: {
                type: DataTypes.STRING(500),
                allowNull: false,
            },
            is_open: {
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
        },
        {
            sequelize,
            modelName: 'HRRound',
            tableName: 'HR_Rounds',
            timestamps: true,
        }
    );

    return HRRound;
};
