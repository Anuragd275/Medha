import express from 'express';
import { executeMedhaSearch } from '../services/medhaService.js';
import { db } from '../db/db.js';
const routes = express.Router();

// Healthy check endpoint
routes.get('/api/health', (req, res) => {
    res.json({ status: 'OK' });
});

routes.get('/api/search', async (req, res) => {
    try {
        const { q, page } = req.query;
        if (!q) {
            return res.status(400).json({ error: 'Search query required' });
        }

        const response = await executeMedhaSearch(db, q, Number(page) || 1);
        res.json(response);
    } catch (err) {
        console.error('Medha execution error:', err);
        res.status(500).json({ error: 'Failed to process search query' });
    }
});

export default routes;