const path = require('path');
const dotenv = require('dotenv');

dotenv.config({
    path: path.resolve(__dirname, '../development.env')
});

module.exports = {
    user: process.env.USER_EMAIL,
    pass: process.env.PASSWORD_EMAIL,
    host: process.env.HOST_EMAIL,
    port: process.env.PORT_EMAIL,
    // secure: process.env.SECURE_EMAIL
}