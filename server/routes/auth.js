const express = require("express");
const bcrypt = require("bcrypt");
const db = require("../config/db");

const router = express.Router();

// POST /auth/login
router.post("/login", async (req, res) => {
  try {
    console.log("Полученные данные:", req.body);

    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: "Имя пользователя/номер телефона и пароль обязательны для заполнения.",
      });
    }

    const userQuery = `SELECT * FROM users WHERE username = ? OR phone = ?`;
    const [userResult] = await db.query(userQuery, [identifier, identifier]);

    if (!userResult || userResult.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Неверное имя пользователя, номер телефона или пароль.",
      });
    }

    const user = userResult[0];

    // Проверяем хэш пароля
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Неверное имя пользователя, номер телефона или пароль.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Успешный вход.",
      user: {
        user_id: user.user_id,
        username: user.username,
        phone: user.phone,
        is_admin: user.is_admin,
        created_at: user.created_at,
        updated_at: user.updated_at,
      },
    });
  } catch (error) {
    console.error("Ошибка авторизации:", error);
    return res.status(500).json({
      success: false,
      message: "Внутренняя ошибка сервера.",
    });
  }
});

// POST /auth/register
router.post("/register", async (req, res) => {
  try {
    const { username, phone, password } = req.body;

    if (!username || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: "Логин, номер телефона и пароль обязательны для заполнения.",
      });
    }

    const checkUserQuery = `SELECT * FROM users WHERE username = ? OR phone = ?`;
    const [existingUser] = await db.query(checkUserQuery, [username, phone]);

    if (existingUser && existingUser.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Пользователь с таким логином или номером телефона уже существует.",
      });
    }

    // Хэшируем пароль перед сохранением
    const hashedPassword = await bcrypt.hash(password, 10);

    const insertUserQuery = `INSERT INTO users (username, phone, password, is_admin) VALUES (?, ?, ?, ?)`;
    const [insertResult] = await db.query(insertUserQuery, [username, phone, hashedPassword, 0]);

    return res.status(201).json({
      success: true,
      message: "Пользователь успешно зарегистрирован.",
      user: {
        user_id: insertResult.insertId,
        username,
        phone,
        is_admin: 0,
      },
    });
  } catch (error) {
    console.error("Ошибка регистрации:", error);
    return res.status(500).json({
      success: false,
      message: "Внутренняя ошибка сервера.",
    });
  }
});

// POST /auth/change-password
router.post("/change-password", async (req, res) => {
  try {
    const { user_id, oldPassword, newPassword } = req.body;

    if (!user_id || !oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Усі поля (user_id, старий пароль, новий пароль) обов'язкові.",
      });
    }

    const [user] = await db.query("SELECT * FROM users WHERE user_id = ?", [user_id]);

    if (!user.length) {
      return res.status(404).json({
        success: false,
        message: "Користувача не знайдено.",
      });
    }

    const isOldPasswordValid = await bcrypt.compare(oldPassword, user[0].password);
    if (!isOldPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Старий пароль неправильний.",
      });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    await db.query("UPDATE users SET password = ? WHERE user_id = ?", [
      hashedNewPassword,
      user_id,
    ]);

    res.status(200).json({
      success: true,
      message: "Пароль успішно змінено.",
    });
  } catch (error) {
    console.error("Ошибка изменения пароля:", error);
    res.status(500).json({
      success: false,
      message: "Внутрішня помилка сервера.",
    });
  }
});

module.exports = router;
