const express = require('express');
const router = express.Router();
const db = require('../config/db'); // Подключение к базе данных

// Маршрут для получения цветов
router.get('/', async (req, res) => {
    console.log('Маршрут /api/colors вызван');
    try {
        const [colors] = await db.query('SELECT * FROM colors');
        res.json(colors);
    } catch (error) {
        console.error('Ошибка получения цветов:', error.message);
        res.status(500).send('Ошибка сервера');
    }
});

module.exports = router;
