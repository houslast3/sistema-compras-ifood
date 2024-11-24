const sequelize = require('../config/database');
const User = require('./User');
const Store = require('./Store');
const Product = require('./Product');
const { Order, OrderItem } = require('./Order');

// User - Store relationship (one-to-many)
User.hasMany(Store, { foreignKey: 'ownerId' });
Store.belongsTo(User, { foreignKey: 'ownerId' });

// Store - Product relationship (one-to-many)
Store.hasMany(Product);
Product.belongsTo(Store);

// User - Order relationships
User.hasMany(Order, { foreignKey: 'userId', as: 'customerOrders' });
Order.belongsTo(User, { foreignKey: 'userId', as: 'customer' });

User.hasMany(Order, { foreignKey: 'driverId', as: 'deliveries' });
Order.belongsTo(User, { foreignKey: 'driverId', as: 'driver' });

// Store - Order relationship
Store.hasMany(Order);
Order.belongsTo(Store);

// Product - OrderItem relationship
Product.hasMany(OrderItem);
OrderItem.belongsTo(Product);

// Sync all models with database
async function syncDatabase() {
    try {
        await sequelize.sync({ alter: true });
        console.log('Database synchronized successfully');
    } catch (error) {
        console.error('Error synchronizing database:', error);
    }
}

module.exports = {
    sequelize,
    User,
    Store,
    Product,
    Order,
    OrderItem,
    syncDatabase
};
