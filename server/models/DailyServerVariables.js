'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class DailyServerVariables extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      DailyServerVariables.belongsTo(models.Server, {foreignKey: 'server_id', onDelete: 'CASCADE'})
    }
  }
  DailyServerVariables.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    server_id: {
      type: DataTypes.INTEGER,
    },
    variables_data: {
      type: DataTypes.TEXT('long'),
      allowNull: true,
      defaultValue: null,
      collate: 'utf8mb4_bin'
    }
  }, {
    sequelize, // Connection instance
    modelName: 'DailyServerVariables', // Model name
    tableName: 'daily_server_variables', // Table name
    timestamps: false // Disable timestamps
    
  });
  return DailyServerVariables;
};
