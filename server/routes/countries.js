const express = require('express');
const router = express.Router();
const db = require('../config/db'); // Подключение к базе данных

// Маршрут для получения стран
router.get('/', async (req, res) => {
    console.log('Маршрут /api/countries вызван');
    try {
        const [countries] = await db.query('SELECT * FROM countries');
        res.json(countries);
    } catch (error) {
        console.error('Ошибка получения стран:', error.message);
        res.status(500).send('Ошибка сервера');
    }
});

module.exports = router;
