require("dotenv").config(); // Load environment variables from .env

module.exports = {
  getMongoDbUrl: () => {
    return process.env.MONGO_DB_URL;
  },
  getMongoDbName: () => {
    return process.env.MONGO_DB_NAME;
  },
  getJwtSecret: () => {
    return process.env.JWT_SECRET;
  },
  getJwtExpiresTime: () => {
    return process.env.JWT_EXPIRES_IN;
  },
};
