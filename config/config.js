require("dotenv").config({
  path: `.env.${process.env.NODE_ENV || 'development'}`
})

module.exports = {
  port: process.env.PORT || 80,
  db: {
    host: process.env.DB_HOST || "yamabiko.proxy.rlwy.net",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "dKjxnYeLeANjNrgvakSXBiKLJyHHTfUY",
    name: process.env.DB_NAME || "ligafemenina",
    port: process.env.DB_PORT || 39681,
  },
  secretKey: process.env.SECRET_KEY || "default_secret",
};
