// config/config.mjs
const config = {
  development: {
    username: 'true-authenticate-user',
    password: 'root',
    database: 'true_authenticate_db',
    host: '127.0.0.1',
    dialect: 'mysql'
  },
  test: {
    username: 'true-authenticate-user',
    password: 'root',
    database: 'true_authenticate_db',
    host: '127.0.0.1',
    dialect: 'mysql'
  },
  production: {
    username: 'root',
    password: null,
    database: 'database_production',
    host: '127.0.0.1',
    dialect: 'mysql'
  },
  JWT_SECRET:'this is secret key'
};

export default config;
