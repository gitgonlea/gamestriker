const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('argenti3_argstrike', 'argenti3_none', 'ey4m)g!GAIsX', {
  host: '67.225.220.9',
  dialect: 'mysql',
  logging: false
});

module.exports = sequelize;