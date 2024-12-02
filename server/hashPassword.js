const bcrypt = require('bcrypt');
const db = require('./config/db'); // Подключение к базе данных

const hashPasswordAndSaveToDB = async (plainTextPassword, username) => {
    try {
        const saltRounds = 10; // Количество раундов шифрования
        const hashedPassword = await bcrypt.hash(plainTextPassword, saltRounds);
        console.log("Захэшированный пароль:", hashedPassword);

        // Обновляем пароль в базе данных
        db.query(
            "UPDATE users SET password = ? WHERE username = ?",
            [hashedPassword, username],
            (error, results) => {
                if (error) {
                    console.error("Ошибка обновления пароля в базе данных:", error);
                } else {
                    console.log(`Пароль для пользователя '${username}' успешно обновлен.`);
                }
            }
        );
    } catch (error) {
        console.error("Ошибка при хэшировании пароля:", error);
    }
};

// Получение аргументов из командной строки
const args = process.argv.slice(2);
const password = args[0]; // Пароль
const username = args[1]; // Имя пользователя

if (password && username) {
    hashPasswordAndSaveToDB(password, username);
} else {
    console.log("Используйте: node hashPassword.js <пароль> <имя_пользователя>");
}

module.exports = hashPasswordAndSaveToDB;
