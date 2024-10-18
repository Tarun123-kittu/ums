require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '' ,
    database: process.env.DB_NAME || 'ultivic',
    host: process.env.DB_HOST || 'localhost',
    secret_key: process.env.JWT_SECRET,
    email_host: process.env.EMAIL_HOST,
    email_port: 465,
    email_username: process.env.EMAIL_USERNAME,
    email_password: process.env.EMAIL_PASSWORD,
    lead_auth_token: process.env.LEAD_TECHNICAL_ROUND_AUTH_SECRET,
    dialect: 'mysql',

    dialectOptions: {
      connectTimeout: 10000
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  },

};
