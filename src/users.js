// Import necessary modules
import express from 'express';
import bcrypt from 'bcrypt';
import { db } from '../firebase.js';
import { collection, query, where, getDocs, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';

const router = express.Router();

// Register a new user
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        
        if (!username || !email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        console.log('Attempting to register user:', { username, email });
        
        // Check if user exists
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('email', '==', email));
        
        try {
            const querySnapshot = await getDocs(q);
            console.log('User search completed');
            
            if (!querySnapshot.empty) {
                return res.status(400).json({ message: 'User already exists' });
            }
        } catch (error) {
            console.error('Error checking existing user:', error);
            throw error;
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        try {
            const newUser = await addDoc(usersRef, {
                username,
                email,
                password: hashedPassword,
                created_at: new Date()
            });
            console.log('User created successfully with ID:', newUser.id);

            res.status(201).json({
                id: newUser.id,
                username,
                email
            });
        } catch (error) {
            console.error('Error creating new user:', error);
            throw error;
        }
    } catch (err) {
        console.error('Registration error:', err);
        res.status(500).json({ 
            message: 'Server error', 
            error: process.env.NODE_ENV === 'development' ? err.message : undefined 
        });
    }
});

// Login a user
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user exists
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('email', '==', email));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const userDoc = querySnapshot.docs[0];
        const user = userDoc.data();

        // Validate password
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        res.json({
            id: userDoc.id,
            username: user.username,
            email: user.email
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// Search for users
router.get('/search', async (req, res) => {
    try {
        const { query: searchQuery } = req.query;
        const usersRef = collection(db, 'users');
        const querySnapshot = await getDocs(usersRef);
        
        // Filter users whose username includes the search query (case-insensitive)
        const users = querySnapshot.docs
            .map(doc => ({
                id: doc.id,
                ...doc.data()
            }))
            .filter(user => 
                user.username.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .map(({ id, username, email }) => ({ id, username, email }));

        res.json(users);
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

        const userRef = doc(db, 'users', id);
        await updateDoc(userRef, {
            username,
            email
        });

        res.json({
            id,
            username,
            email
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
        const userRef = doc(db, 'users', id);
        await deleteDoc(userRef);
        
        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
