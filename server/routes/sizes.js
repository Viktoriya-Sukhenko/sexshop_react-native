const express = require('express');
const router = express.Router();
const db = require('../config/db'); // Подключение к базе данных

// Маршрут для получения размеров
router.get('/', async (req, res) => {
    console.log('Маршрут /api/sizes вызван');
    try {
        const [sizes] = await db.query('SELECT * FROM sizes');
        res.json(sizes);
    } catch (error) {
        console.error('Ошибка получения размеров:', error.message);
        res.status(500).send('Ошибка сервера');
    }
});

module.exports = router;
