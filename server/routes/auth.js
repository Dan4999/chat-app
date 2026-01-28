const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../db');

// Registro de usuario
router.post('/register', async (req, res) => {
    try {
        const { username, email, gender, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ 
                error: 'Usuario, email y contraseña son requeridos' 
            });
        }

        const userCheck = await db.query(
            'SELECT * FROM users WHERE username = $1 OR email = $2',
            [username, email]
        );

        if (userCheck.rows.length > 0) {
            return res.status(400).json({ 
                error: 'Usuario o email ya registrado' 
            });
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const result = await db.query(
            `INSERT INTO users (username, email, gender, password_hash) 
             VALUES ($1, $2, $3, $4) RETURNING id, username, email, gender`,
            [username, email, gender, passwordHash]
        );

        res.status(201).json({
            message: 'Usuario registrado exitosamente',
            user: result.rows[0]
        });

    } catch (error) {
        console.error('Error en registro:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Login de usuario
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ 
                error: 'Usuario y contraseña son requeridos' 
            });
        }

        const result = await db.query(
            'SELECT * FROM users WHERE username = $1 OR email = $1',
            [username]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ 
                error: 'Usuario o contraseña incorrectos' 
            });
        }

        const user = result.rows[0];
        const validPassword = await bcrypt.compare(password, user.password_hash);
        
        if (!validPassword) {
            return res.status(401).json({ 
                error: 'Usuario o contraseña incorrectos' 
            });
        }

        await db.query(
            'UPDATE users SET is_online = true WHERE id = $1',
            [user.id]
        );

        const userResponse = {
            id: user.id,
            username: user.username,
            email: user.email,
            gender: user.gender,
            is_online: true
        };

        res.json({
            message: 'Login exitoso',
            user: userResponse
        });

    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Logout de usuario
router.post('/logout', async (req, res) => {
    try {
        const { userId } = req.body;
        
        if (userId) {
            await db.query(
                'UPDATE users SET is_online = false WHERE id = $1',
                [userId]
            );
        }
        
        res.json({ message: 'Logout exitoso' });
    } catch (error) {
        console.error('Error en logout:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

module.exports = router;