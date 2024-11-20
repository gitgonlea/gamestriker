 'use strict';
  const {
    Model
  } = require('sequelize');
  //const { uuid} = require("uuidv4")
  module.exports = (sequelize, DataTypes) => {
    class Server extends Model {

      static associate(models) {
        Server.hasMany(models.ServerRanks,{foreignKey: 'server_id', sourceKey: 'id'})
        Server.hasMany(models.WeeklyMapData,{foreignKey: 'server_id', sourceKey: 'id'})
        Server.hasMany(models.PlayerData,{foreignKey: 'server_id', sourceKey: 'id'})
      }
    }
    Server.init({
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
      host: {
        type: DataTypes.STRING(64),
        allowNull: true
      },
      port: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      servername: {
        type: DataTypes.STRING(65),
        allowNull: true
      },
      map: {
        type: DataTypes.STRING(50),
        allowNull: true
      },
      maxplayers: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      numplayers: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      rank_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      status: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1
      },
      last_update: {
        type: DataTypes.STRING(50)
      }
    }, {
      sequelize,
      tableName: 'servers',
      timestamps: false 
    })/*,
    Server.addHook('beforeSave', async (Server) => {
      return Server.id = uuid();
    });*/
    return Server;
  };