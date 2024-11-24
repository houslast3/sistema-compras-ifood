const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Order = sequelize.define('Order', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    status: {
        type: DataTypes.ENUM('pending', 'paid', 'preparing', 'ready', 'in_delivery', 'delivered', 'cancelled'),
        defaultValue: 'pending'
    },
    total: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    deliveryFee: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0
    },
    deliveryAddress: {
        type: DataTypes.STRING,
        allowNull: false
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    storeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Stores',
            key: 'id'
        }
    },
    driverId: {
        type: DataTypes.INTEGER,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    payment: {
        type: DataTypes.JSONB,
        defaultValue: {}
    }
});

const OrderItem = sequelize.define('OrderItem', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    orderId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Orders',
            key: 'id'
        }
    },
    productId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Products',
            key: 'id'
        }
    }
});

// Define associations
Order.hasMany(OrderItem);
OrderItem.belongsTo(Order);

module.exports = { Order, OrderItem };
