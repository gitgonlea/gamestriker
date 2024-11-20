
'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class WeeklyMapData extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      WeeklyMapData.belongsTo(models.Server, {foreignKey: 'server_id', onDelete: 'CASCADE'})
    }
  }
  WeeklyMapData.init({
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
  },
  server_id: {
      type: DataTypes.INTEGER,
  },
  map_data: {
    type: DataTypes.TEXT('long'), // Use TEXT('long') for longtext
    allowNull: true // Assuming map_data can be null
}
  }, {
    sequelize,
    tableName: 'weekly_map_data',
    timestamps: false
  });
  return WeeklyMapData;
};