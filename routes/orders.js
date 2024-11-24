const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Store = require('../models/Store');
const User = require('../models/User');
const auth = require('../middleware/auth');
const axios = require('axios');

// Criar pedido
router.post('/', auth, async (req, res) => {
    try {
        const { storeId, items, deliveryAddress } = req.body;

        const store = await Store.findById(storeId);
        if (!store) {
            return res.status(404).json({ message: 'Loja não encontrada' });
        }

        const order = new Order({
            customer: req.user.userId,
            store: storeId,
            items,
            deliveryAddress,
            subtotal: items.reduce((acc, item) => acc + (item.price * item.quantity), 0),
            deliveryFee: store.deliveryFee,
            total: items.reduce((acc, item) => acc + (item.price * item.quantity), 0) + store.deliveryFee,
            paymentMethod: 'pix'
        });

        // Gerar código PIX (implementação exemplo)
        const pixCode = await generatePixCode(order.total);
        order.pixCode = pixCode;

        await order.save();
        res.status(201).json(order);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao criar pedido' });
    }
});

// Listar pedidos do usuário
router.get('/my-orders', auth, async (req, res) => {
    try {
        const orders = await Order.find({ customer: req.user.userId })
            .populate('store')
            .populate('driver')
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao listar pedidos' });
    }
});

// Listar pedidos da loja
router.get('/store-orders', auth, async (req, res) => {
    try {
        const store = await Store.findOne({ owner: req.user.userId });
        if (!store) {
            return res.status(403).json({ message: 'Você não possui uma loja' });
        }

        const orders = await Order.find({ store: store._id })
            .populate('customer')
            .populate('driver')
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao listar pedidos da loja' });
    }
});

// Listar entregas disponíveis
router.get('/available-deliveries', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        if (user.role !== 'driver') {
            return res.status(403).json({ message: 'Acesso negado' });
        }

        const orders = await Order.find({
            status: 'ready',
            driver: null
        }).populate('store').populate('customer');
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao listar entregas disponíveis' });
    }
});

// Aceitar entrega
router.post('/:id/accept-delivery', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        if (user.role !== 'driver') {
            return res.status(403).json({ message: 'Acesso negado' });
        }

        const order = await Order.findOne({
            _id: req.params.id,
            status: 'ready',
            driver: null
        });

        if (!order) {
            return res.status(404).json({ message: 'Pedido não encontrado ou já aceito' });
        }

        order.driver = req.user.userId;
        order.status = 'delivering';
        await order.save();

        res.json(order);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao aceitar entrega' });
    }
});

// Atualizar status do pedido
router.put('/:id/status', auth, async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: 'Pedido não encontrado' });
        }

        // Verificar permissões baseado no status
        const user = await User.findById(req.user.userId);
        const store = await Store.findById(order.store);

        if (user.role === 'store' && user._id.toString() !== store.owner.toString()) {
            return res.status(403).json({ message: 'Acesso negado' });
        }

        if (user.role === 'driver' && order.driver && order.driver.toString() !== user._id.toString()) {
            return res.status(403).json({ message: 'Acesso negado' });
        }

        order.status = status;
        await order.save();
        res.json(order);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao atualizar status do pedido' });
    }
});

// Função exemplo para gerar código PIX
async function generatePixCode(amount) {
    try {
        // Aqui você implementaria a integração real com a API do Inter
        // Este é apenas um exemplo
        const response = await axios.post('https://api.inter.com.br/pix/qrcode', {
            amount,
            description: 'Pedido iPobre'
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.INTER_TOKEN}`
            }
        });
        return response.data.pixCode;
    } catch (error) {
        console.error('Erro ao gerar código PIX:', error);
        return 'PIX-CODE-EXEMPLO';
    }
}

module.exports = router;
