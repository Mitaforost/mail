require('dotenv').config();

module.exports = {
    dialect: 'postgres',
    host: 'localhost',
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '1111',
    database: process.env.DB_NAME || 'mail',
    logging: (msg) => {
        console.log(`[Sequelize] ${msg}`);
    },
};
