const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Registro de usuário
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, address, phone, role } = req.body;
        
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'Usuário já existe' });
        }

        user = new User({
            name,
            email,
            password,
            address,
            phone,
            role
        });

        await user.save();

        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({ token });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao registrar usuário' });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Credenciais inválidas' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Credenciais inválidas' });
        }

        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({ token });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao fazer login' });
    }
});

// Obter perfil do usuário
router.get('/profile', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-password');
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao obter perfil' });
    }
});

// Atualizar perfil
router.put('/profile', auth, async (req, res) => {
    try {
        const { name, address, phone } = req.body;
        
        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }

        user.name = name || user.name;
        user.address = address || user.address;
        user.phone = phone || user.phone;

        await user.save();
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao atualizar perfil' });
    }
});

module.exports = router;
