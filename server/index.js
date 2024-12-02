const express = require('express');
const cors = require('cors'); // Импортируем cors
const path = require('path'); // Добавляем импорт path
require('dotenv').config({ path: './config/.env' });

console.log('Загрузка .env:');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD);
console.log('DB_NAME:', process.env.DB_NAME);

const db = require('./config/db'); // Импорт настроенного файла db.js

const app = express(); // Создаём объект Express
app.use(cors()); // Подключаем CORS
app.use(express.json()); // Поддержка JSON в запросах

// Папка для хранения загружаемых изображений
app.use('/api/uploads', express.static(path.join(__dirname, 'uploads')));

const PORT = 5000;

const productsRoutes = require('./routes/products');
const categoriesRoutes = require('./routes/categories');
const sizesRouter = require('./routes/sizes');
const colorsRouter = require('./routes/colors');
const countriesRouter = require('./routes/countries');
const authRoutes = require('./routes/auth');
const paymentMethodsRoute = require('./routes/paymentMethods');
const orderRoutes = require("./routes/orders"); 

// Роут для товаров
app.use('/api/products', productsRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/sizes', sizesRouter);
app.use('/api/colors', colorsRouter);
app.use('/api/countries', countriesRouter);
app.use('/api/auth', authRoutes);
app.use('/api/payment_methods', paymentMethodsRoute);
app.use("/api", orderRoutes);

app.get('/', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT 1 + 1 AS solution');
        res.send(`Результат: ${rows[0].solution}`);
    } catch (err) {
        console.error('Ошибка выполнения запроса:', err.message);
        res.status(500).send('Ошибка подключения к базе данных');
    }
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});
