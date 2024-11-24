const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Store = require('../models/Store');
const auth = require('../middleware/auth');

// Criar produto
router.post('/', auth, async (req, res) => {
    try {
        const store = await Store.findOne({ owner: req.user.userId });
        if (!store) {
            return res.status(403).json({ message: 'Você não possui uma loja' });
        }

        const product = new Product({
            ...req.body,
            store: store._id
        });

        await product.save();
        res.status(201).json(product);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao criar produto' });
    }
});

// Listar produtos de uma loja
router.get('/store/:storeId', async (req, res) => {
    try {
        const { category } = req.query;
        let query = { store: req.params.storeId };

        if (category) {
            query.category = category;
        }

        const products = await Product.find(query);
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao listar produtos' });
    }
});

// Buscar produtos
router.get('/search', async (req, res) => {
    try {
        const { q } = req.query;
        const products = await Product.find({
            $or: [
                { name: { $regex: q, $options: 'i' } },
                { description: { $regex: q, $options: 'i' } }
            ]
        }).populate('store');
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar produtos' });
    }
});

// Obter produto específico
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate('store');
        if (!product) {
            return res.status(404).json({ message: 'Produto não encontrado' });
        }
        res.json(product);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao obter produto' });
    }
});

// Atualizar produto
router.put('/:id', auth, async (req, res) => {
    try {
        const store = await Store.findOne({ owner: req.user.userId });
        if (!store) {
            return res.status(403).json({ message: 'Você não possui uma loja' });
        }

        const product = await Product.findOne({
            _id: req.params.id,
            store: store._id
        });

        if (!product) {
            return res.status(404).json({ message: 'Produto não encontrado' });
        }

        Object.assign(product, req.body);
        await product.save();
        res.json(product);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao atualizar produto' });
    }
});

// Excluir produto
router.delete('/:id', auth, async (req, res) => {
    try {
        const store = await Store.findOne({ owner: req.user.userId });
        if (!store) {
            return res.status(403).json({ message: 'Você não possui uma loja' });
        }

        const product = await Product.findOneAndDelete({
            _id: req.params.id,
            store: store._id
        });

        if (!product) {
            return res.status(404).json({ message: 'Produto não encontrado' });
        }

        res.json({ message: 'Produto excluído com sucesso' });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao excluir produto' });
    }
});

module.exports = router;
