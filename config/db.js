const { Sequelize } = require('sequelize');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({
    path: path.resolve(__dirname, '../development.env')
});


const db = new Sequelize({
    dialect: 'mysql',
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_DATABASE,
    dialectOptions: {
        charset: 'utf8_general_ci',
        ssl: { rejectUnauthorized: false },
    },
    define: {
        timestamps: false
    },
    // pool: {
    //     max: 5,
    //     min: 0,
    //     acquire: 30000,
    //     idle: 10000
    // },
    logging: false
});

// db.authenticate().then(
//     () => console.log('success'),
//     (error) => console.error(error),
// );

module.exports = db;
