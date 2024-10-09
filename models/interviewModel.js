const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    class Interview extends Model {}

    Interview.init(
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            },
            lead_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            interview_link_click_count: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },
            hr_round_result: {
                type: DataTypes.ENUM('selected', 'rejected', 'pending', 'on hold'),
                allowNull: true,
                defaultValue: 'pending',
            },
            technical_round_result: {
                type: DataTypes.ENUM('selected', 'rejected', 'pending', 'on hold','opened'),
                allowNull: true,
                defaultValue: 'pending',
            },
            technical_round_checked_by:{
              type:DataTypes.STRING,
              allowNull:false
            },
            face_to_face_result:{
                type:  DataTypes.ENUM('selected', 'rejected', 'pending', 'on hold'),
                allowNull: true,
                defaultValue: 'pending',
            },
            final_result:{
                type:  DataTypes.ENUM('selected', 'rejected', 'pending', 'on hold'),
                allowNull: true,
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
        },
        {
            sequelize,
            modelName: 'Interview',
            tableName: 'Interviews',
            timestamps: true,
        }
    );

    return Interview;
};
