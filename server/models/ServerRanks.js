'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ServerRanks extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      ServerRanks.belongsTo(models.Server, {foreignKey: 'server_id', onDelete: 'CASCADE'})
    }
  }
  ServerRanks.init({
    server_id: {
        type: DataTypes.INTEGER,
    },
    lowest_rank: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    highest_rank: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    month: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    year: {
        type: DataTypes.INTEGER,
        allowNull: true
    }
  }, {
    sequelize,
    tableName: 'server_ranks',
    collate: 'latin1_spanish_ci',
    timestamps: false,
    uniqueKeys: {
      unique_server_month_year: {
        fields: ['server_id', 'month', 'year']
      }
    }
    
  });
  return ServerRanks;
};

