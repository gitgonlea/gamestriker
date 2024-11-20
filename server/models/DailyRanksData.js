'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class DailyRanksData extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      DailyRanksData.belongsTo(models.Server, {foreignKey: 'server_id', onDelete: 'CASCADE'})
    }
  }
  DailyRanksData.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    date: {
        type: DataTypes.DATE,
        allowNull: true
    },
    rank_id: {
        type: DataTypes.INTEGER,
        defaultValue: -1
    },
    server_id: {
        type: DataTypes.INTEGER
    }
  }, {
    sequelize,
    tableName: 'daily_ranks_data',
    collate: 'latin1_spanish_ci',
    timestamps: false,
    uniqueKeys: {
      unique_server_month_year: {
        fields: ['server_id', 'date']
      }
    }
    
  });
  return DailyRanksData;
};
