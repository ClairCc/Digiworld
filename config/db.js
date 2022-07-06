const { Sequelize } = require("sequelize");
const path = require("path");
const dotenv = require("dotenv");

dotenv.config({
  path: path.resolve(__dirname, "../.env"),
});

const db = new Sequelize({
  dialect: "mysql",
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_DATABASE,
  dialectOptions: {
    charset: "utf8_general_ci",
    ssl: { rejectUnauthorized: false },
  },
  define: {
    timestamps: false,
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  logging: false,
});

// var db = new Sequelize(
//   process.env.DB_DATABASE,
//   process.env.DB_USER,
//   process.env.DB_USER,
//   {
//     host: "localhost",
//     dialect: "mariadb",
//     port: 3306,
//     define: {
//       paranoid: true,
//     },
//   }
// );

// db.authenticate().then(
//   () => console.log("success"),
//   (error) => console.error("ERROR")
// );

module.exports = db;
