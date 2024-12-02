const express = require('express');
const router = express.Router();
const db = require('../config/db'); // Подключение к базе данных

// Маршрут для получения категорий
router.get('/', async (req, res) => {
    console.log('Маршрут /api/categories вызван');
    try {
      const [categories] = await db.query('SELECT * FROM categories');
      res.json(categories);
    } catch (error) {
      console.error('Ошибка получения категорий:', error.message);
      res.status(500).send('Ошибка сервера');
    }
  });
  

module.exports = router;
