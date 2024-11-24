const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Store = sequelize.define('Store', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT
    },
    address: {
        type: DataTypes.STRING,
        allowNull: false
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: false
    },
    category: {
        type: DataTypes.STRING,
        allowNull: false
    },
    image: {
        type: DataTypes.STRING
    },
    rating: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    isOpen: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    deliveryFee: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0
    },
    minOrder: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0
    },
    ownerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        }
    }
});

module.exports = Store;
