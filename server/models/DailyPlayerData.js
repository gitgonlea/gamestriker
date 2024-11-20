'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class DailyPlayerData extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      DailyPlayerData.belongsTo(models.Server, {foreignKey: 'server_id', onDelete: 'CASCADE'})
    }
  }
  DailyPlayerData.init({
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    hour_24: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: -1
    },
    hour_22: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: -1
    },
    hour_20: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: -1
    },
    hour_18: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: -1
    },
    hour_16: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: -1
    },
    hour_14: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: -1
    },
    hour_12: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: -1
    },
    hour_10: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: -1
    },
    hour_8: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: -1
    },
    hour_6: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: -1
    },
    hour_4: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: -1
    },
    hour_2: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: -1
    },
    server_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: -1
    }
  }, {
    sequelize,
    modelName: 'DailyPlayerData',
    tableName: 'daily_player_data',
    timestamps: false,
    uniqueKeys: {
      unique_server_month_year: {
        fields: ['server_id', 'date']
      }
    }
  });
  return DailyPlayerData;
};
