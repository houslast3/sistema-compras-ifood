const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Order = require('../models/Order');

// Get available orders for drivers
router.get('/available-orders', auth, async (req, res) => {
    try {
        // Verify if the user is a driver
        if (req.user.role !== 'driver') {
            return res.status(403).json({ message: 'Access denied. Only drivers can view available orders.' });
        }

        // Find orders that don't have a driver assigned
        const availableOrders = await Order.find({ 
            driver: null,
            status: 'paid'
        }).populate('user', 'name').populate('store', 'name address');

        res.json(availableOrders);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Accept an order
router.post('/accept-order/:orderId', auth, async (req, res) => {
    try {
        // Verify if the user is a driver
        if (req.user.role !== 'driver') {
            return res.status(403).json({ message: 'Access denied. Only drivers can accept orders.' });
        }

        const order = await Order.findById(req.params.orderId);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        if (order.driver) {
            return res.status(400).json({ message: 'This order has already been accepted by another driver' });
        }

        order.driver = req.user.id;
        order.status = 'in_delivery';
        await order.save();

        res.json({ message: 'Order accepted successfully', order });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Update order status
router.put('/update-order-status/:orderId', auth, async (req, res) => {
    try {
        const { status } = req.body;
        
        // Verify if the user is a driver
        if (req.user.role !== 'driver') {
            return res.status(403).json({ message: 'Access denied. Only drivers can update order status.' });
        }

        const order = await Order.findById(req.params.orderId);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        if (order.driver.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Access denied. You can only update orders assigned to you.' });
        }

        // Validate status transition
        const validStatuses = ['picked_up', 'delivered'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        order.status = status;
        await order.save();

        res.json({ message: 'Order status updated successfully', order });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get driver's active orders
router.get('/my-orders', auth, async (req, res) => {
    try {
        // Verify if the user is a driver
        if (req.user.role !== 'driver') {
            return res.status(403).json({ message: 'Access denied. Only drivers can view their orders.' });
        }

        const orders = await Order.find({ 
            driver: req.user.id,
            status: { $in: ['in_delivery', 'picked_up'] }
        }).populate('user', 'name').populate('store', 'name address');

        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get driver's delivery history
router.get('/delivery-history', auth, async (req, res) => {
    try {
        // Verify if the user is a driver
        if (req.user.role !== 'driver') {
            return res.status(403).json({ message: 'Access denied. Only drivers can view their delivery history.' });
        }

        const orders = await Order.find({ 
            driver: req.user.id,
            status: 'delivered'
        }).populate('user', 'name').populate('store', 'name address')
          .sort({ updatedAt: -1 });

        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
