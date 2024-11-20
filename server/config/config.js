require('dotenv').config()

module.exports={

    "development": {
      "username": 'argenti3_none',
      "password": 'ey4m)g!GAIsX',
      "database": 'argenti3_argstrike',
      "host": '67.225.220.9',
      "port": 3306,
      "dialect": "mysql",
      "logging":false
    },
    "production": {
      "username": 'argenti3_none',
      "password": 'ey4m)g!GAIsX',
      "database": 'argenti3_argstrike',
      "host": '67.225.220.9',
      "port": 3306,
      "dialect": "mysql",
      "dialectOptions": {
        "ssl": {
          "require": true,
          "rejectUnauthorized": false
        }
      },
      "logging":false
    }
  
}