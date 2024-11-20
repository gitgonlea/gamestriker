'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class DailyPlayerScoreServerData extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      DailyPlayerScoreServerData.belongsTo(models.Server, {foreignKey: 'server_id', onDelete: 'CASCADE'})
    }
  }
  DailyPlayerScoreServerData.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    date: {
        type: DataTypes.DATE,
        allowNull: true
    },
    hour_24: DataTypes.INTEGER,
    hour_23: DataTypes.INTEGER,
    hour_22: DataTypes.INTEGER,
    hour_21: DataTypes.INTEGER,
    hour_20: DataTypes.INTEGER,
    hour_19: DataTypes.INTEGER,
    hour_18: DataTypes.INTEGER,
    hour_17: DataTypes.INTEGER,
    hour_16: DataTypes.INTEGER,
    hour_15: DataTypes.INTEGER,
    hour_14: DataTypes.INTEGER,
    hour_13: DataTypes.INTEGER,
    hour_12: DataTypes.INTEGER,
    hour_11: DataTypes.INTEGER,
    hour_10: DataTypes.INTEGER,
    hour_9: DataTypes.INTEGER,
    hour_8: DataTypes.INTEGER,
    hour_7: DataTypes.INTEGER,
    hour_6: DataTypes.INTEGER,
    hour_5: DataTypes.INTEGER,
    hour_4: DataTypes.INTEGER,
    hour_3: DataTypes.INTEGER,
    hour_2: DataTypes.INTEGER,
    hour_1: DataTypes.INTEGER,
    server_id: DataTypes.INTEGER,
    player_name: {
        type: DataTypes.STRING(50),
        allowNull: true
    }
  }, {
    sequelize,
    tableName: 'daily_player_score_server_data',
    collate: 'utf8mb4_general_ci',
    timestamps: false,
    uniqueKeys: {
      unique_server_month_year: {
        fields: ['id', 'player_name', 'date']
      }
    }
    
  });
  return DailyPlayerScoreServerData;
};
