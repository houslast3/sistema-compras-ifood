const express = require('express');
const router = express.Router();
const Store = require('../models/Store');
const auth = require('../middleware/auth');
const User = require('../models/User');

// Criar loja
router.post('/', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        if (user.role !== 'store') {
            return res.status(403).json({ message: 'Acesso negado' });
        }

        const store = new Store({
            ...req.body,
            owner: req.user.userId
        });

        await store.save();
        res.status(201).json(store);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao criar loja' });
    }
});

// Listar todas as lojas
router.get('/', async (req, res) => {
    try {
        const { category, search } = req.query;
        let query = {};

        if (category) {
            query.category = category;
        }

        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }

        const stores = await Store.find(query);
        res.json(stores);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao listar lojas' });
    }
});

// Obter loja específica
router.get('/:id', async (req, res) => {
    try {
        const store = await Store.findById(req.params.id);
        if (!store) {
            return res.status(404).json({ message: 'Loja não encontrada' });
        }
        res.json(store);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao obter loja' });
    }
});

// Atualizar loja
router.put('/:id', auth, async (req, res) => {
    try {
        const store = await Store.findOne({
            _id: req.params.id,
            owner: req.user.userId
        });

        if (!store) {
            return res.status(404).json({ message: 'Loja não encontrada' });
        }

        Object.assign(store, req.body);
        await store.save();
        res.json(store);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao atualizar loja' });
    }
});

// Excluir loja
router.delete('/:id', auth, async (req, res) => {
    try {
        const store = await Store.findOneAndDelete({
            _id: req.params.id,
            owner: req.user.userId
        });

        if (!store) {
            return res.status(404).json({ message: 'Loja não encontrada' });
        }

        res.json({ message: 'Loja excluída com sucesso' });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao excluir loja' });
    }
});

module.exports = router;
