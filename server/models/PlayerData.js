'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class PlayerData extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      PlayerData.belongsTo(models.Server, {foreignKey: 'server_id', onDelete: 'CASCADE'})
    }
  }
  PlayerData.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    server_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    player_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      collate: 'utf8mb4_general_ci',
    },
    playtime: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    score: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    previous_playtime: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    previous_score: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    online: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    last_seen: {
        type: DataTypes.DATE,
        allowNull: true
    },
    first_seen: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    current_playtime: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    current_score: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    BOT: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }
  }, {
    sequelize,
    tableName: 'player_data',
    collate: 'utf8mb4_general_ci',
    timestamps: false,
    uniqueKeys: {
      unique_server_month_year: {
        fields: ['server_id', 'player_name']
      }
    }
  });
  return PlayerData;
};