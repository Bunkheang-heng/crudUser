// Import necessary modules
import express from 'express';
import bcrypt from 'bcrypt';
import pool from './db.js';

const router = express.Router();

// Register a new user
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        
        // Check if user exists
        const userExists = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );

        if (userExists.rows.length > 0) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const newUser = await pool.query(
            'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *',
            [username, email, hashedPassword]
        );

        res.status(201).json({
            id: newUser.rows[0].id,
            username: newUser.rows[0].username,
            email: newUser.rows[0].email
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// Login a user
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user exists
        const user = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );

        if (user.rows.length === 0) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Validate password
        const validPassword = await bcrypt.compare(password, user.rows[0].password);
        if (!validPassword) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        res.json({
            id: user.rows[0].id,
            username: user.rows[0].username,
            email: user.rows[0].email
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// Search for users
router.get('/search', async (req, res) => {
    try {
        const { query } = req.query;
        const users = await pool.query(
            'SELECT id, username, email FROM users WHERE username ILIKE $1',
            [`%${query}%`]
        );
        res.json(users.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update user information
router.put('/update/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { username, email } = req.body;

        const updateUser = await pool.query(
            'UPDATE users SET username = $1, email = $2 WHERE id = $3 RETURNING *',
            [username, email, id]
        );

        if (updateUser.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            id: updateUser.rows[0].id,
            username: updateUser.rows[0].username,
            email: updateUser.rows[0].email
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete a user
router.delete('/delete/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deleteUser = await pool.query('DELETE FROM users WHERE id = $1', [id]);
        
        if (deleteUser.rowCount === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
