'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class DailyMapData extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      DailyMapData.belongsTo(models.Server, {foreignKey: 'server_id', onDelete: 'CASCADE'})
    }
  }
  DailyMapData.init({
    server_id: {
      type: DataTypes.INTEGER
    },
    map_data: {
      type: DataTypes.TEXT('long'),
      allowNull: true,
      collate: 'utf8mb4_bin'
    },
    date: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'daily_map_data',
    timestamps: false,
    uniqueKeys: {
      unique_server_month_year: {
        fields: ['server_id', 'date']
      }
    }
    
  });
  return DailyMapData;
};
