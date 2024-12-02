const mysql = require('mysql2/promise'); // Подключаем mysql2 с поддержкой промисов

// Создаём пул соединений
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

// Тестируем подключение к базе данных
(async () => {
    try {
        const connection = await pool.getConnection();
        console.log('Успешно подключено к базе данных');
        connection.release(); // Освобождаем соединение
    } catch (err) {
        console.error('Ошибка подключения к базе данных:', err.message);
    }
})();

module.exports = pool; // Экспортируем пул для использования в других модулях
