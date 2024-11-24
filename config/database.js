const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
    process.env.POSTGRES_DATABASE || 'shop_193z',
    process.env.POSTGRES_USER || 'shop_193z_user',
    process.env.POSTGRES_PASSWORD || 'zDc6g7nHDQUxCXH68q6CbdgjQkktJ2WK',
    {
        host: process.env.POSTGRES_HOST || 'dpg-ct1l3ld2ng1s73e7gm30-a.oregon-postgres.render.com',
        dialect: 'postgres',
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false
            }
        },
        logging: false
    }
);

module.exports = sequelize;
