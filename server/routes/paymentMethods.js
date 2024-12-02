const express = require('express');
const router = express.Router();
const db = require('../config/db'); // Підключення до бази даних

// Маршрут для отримання способів оплати
router.get('/', async (req, res) => {
    console.log('Маршрут /api/payment_methods викликано');
    try {
        const [paymentMethods] = await db.query('SELECT * FROM payment_methods');
        res.json(paymentMethods);
    } catch (error) {
        console.error('Помилка отримання способів оплати:', error.message);
        res.status(500).send('Помилка сервера');
    }
});

module.exports = router;
