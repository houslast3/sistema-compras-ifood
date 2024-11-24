const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Order = require('../models/Order');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Helper function to generate PIX charge
async function generatePixCharge(amount, orderId) {
    try {
        // Read the Inter certificate
        const cert = process.env.INTER_CERT_PATH ? 
            fs.readFileSync(process.env.INTER_CERT_PATH) : null;

        // Configure Inter Bank API client
        const interApi = axios.create({
            baseURL: 'https://cdpj.partners.bancointer.com.br',
            headers: {
                'Content-Type': 'application/json',
                'client_id': process.env.INTER_CLIENT_ID,
                'client_secret': process.env.INTER_CLIENT_SECRET
            },
            httpsAgent: cert ? {
                cert: cert,
                key: cert
            } : undefined
        });

        // For development/testing, return a mock PIX code
        if (process.env.NODE_ENV !== 'production') {
            return {
                pixCopiaECola: '00020126580014br.gov.bcb.pix0136123e4567-e89b-12d3-a456-426614174000520400005303986540510.005802BR5913iPobre Store6008Sao Paulo62070503***63041234',
                qrCode: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
                txId: `IPOBRE${orderId}`
            };
        }

        // Production PIX charge generation
        const response = await interApi.post('/pix/v2/cob', {
            calendario: {
                expiracao: 3600 // 1 hour expiration
            },
            valor: {
                original: amount.toFixed(2)
            },
            chave: process.env.PIX_KEY,
            solicitacaoPagador: `Pedido #${orderId} - iPobre Food`,
            infoAdicionais: [
                {
                    nome: 'Pedido',
                    valor: orderId
                }
            ]
        });

        return response.data;
    } catch (error) {
        console.error('Error generating PIX charge:', error);
        throw error;
    }
}

// Create PIX payment for order
router.post('/create-pix/:orderId', auth, async (req, res) => {
    try {
        const order = await Order.findById(req.params.orderId);
        
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        if (order.user.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to pay for this order' });
        }

        if (order.status !== 'pending') {
            return res.status(400).json({ message: 'Order is not in pending status' });
        }

        const pixCharge = await generatePixCharge(order.total, order._id);

        // Update order with PIX information
        order.payment = {
            method: 'pix',
            pixCode: pixCharge.pixCopiaECola,
            pixQrCode: pixCharge.qrCode,
            txId: pixCharge.txId,
            status: 'pending'
        };
        await order.save();

        res.json({
            message: 'PIX payment created successfully',
            pixCode: pixCharge.pixCopiaECola,
            qrCode: pixCharge.qrCode,
            orderId: order._id
        });
    } catch (error) {
        console.error('Error creating PIX payment:', error);
        res.status(500).json({ message: 'Error creating PIX payment', error: error.message });
    }
});

// Webhook for PIX payment notifications
router.post('/pix-webhook', async (req, res) => {
    try {
        // Verify webhook signature if in production
        if (process.env.NODE_ENV === 'production') {
            // Add webhook signature verification logic here
        }

        const { txId, status } = req.body;

        // Find order by PIX transaction ID
        const order = await Order.findOne({ 'payment.txId': txId });
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Update order payment status
        if (status === 'CONCLUIDA') {
            order.payment.status = 'completed';
            order.status = 'paid';
            await order.save();
        } else if (status === 'DEVOLVIDA') {
            order.payment.status = 'refunded';
            order.status = 'cancelled';
            await order.save();
        }

        res.json({ message: 'Webhook processed successfully' });
    } catch (error) {
        console.error('Error processing PIX webhook:', error);
        res.status(500).json({ message: 'Error processing webhook', error: error.message });
    }
});

// Check payment status
router.get('/check-status/:orderId', auth, async (req, res) => {
    try {
        const order = await Order.findById(req.params.orderId);
        
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        if (order.user.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to check this order' });
        }

        res.json({
            orderId: order._id,
            status: order.payment?.status || 'no_payment',
            orderStatus: order.status
        });
    } catch (error) {
        console.error('Error checking payment status:', error);
        res.status(500).json({ message: 'Error checking payment status', error: error.message });
    }
});

// Mock endpoint to simulate PIX payment completion (development only)
if (process.env.NODE_ENV !== 'production') {
    router.post('/mock-complete-payment/:orderId', auth, async (req, res) => {
        try {
            const order = await Order.findById(req.params.orderId);
            
            if (!order) {
                return res.status(404).json({ message: 'Order not found' });
            }

            order.payment.status = 'completed';
            order.status = 'paid';
            await order.save();

            res.json({ message: 'Payment marked as completed', order });
        } catch (error) {
            console.error('Error completing mock payment:', error);
            res.status(500).json({ message: 'Error completing payment', error: error.message });
        }
    });
}

module.exports = router;
