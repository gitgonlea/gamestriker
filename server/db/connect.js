const { Sequelize } = require('sequelize');
require('dotenv').config(); // Load environment variables from .env

// Determine environment and load the appropriate variables
const isProduction = process.env.NODE_ENV === 'production';

const sequelize = new Sequelize(
  isProduction ? process.env.PROD_DB_NAME : process.env.DEV_DB_NAME,
  isProduction ? process.env.PROD_DB_USERNAME : process.env.DEV_DB_USERNAME,
  isProduction ? process.env.PROD_DB_PASSWORD : process.env.DEV_DB_PASSWORD,
  {
    host: isProduction ? process.env.PROD_DB_HOST : process.env.DEV_DB_HOST,
    port: isProduction ? process.env.PROD_DB_PORT : process.env.DEV_DB_PORT,
    dialect: 'mysql',
    logging: !isProduction,
  }
);

module.exports = sequelize;
