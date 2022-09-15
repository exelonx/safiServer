const { Sequelize } = require("sequelize");

const { ESQUEMA, MYSQL_HOST, SQL_USER, SQL_PASSWORD } = process.env

const db = new Sequelize(ESQUEMA, SQL_USER, SQL_PASSWORD, {
    host: MYSQL_HOST,
    dialect: 'mysql',
    
});

module.exports = {
    db
};