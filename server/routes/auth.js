const express = require("express");
const db = require("../config/db");

const router = express.Router();

// POST /auth/login
router.post("/login", async (req, res) => {
    try {
      console.log("Полученные данные:", req.body);
  
      const { identifier, password } = req.body;
  
      // Проверяем, что все поля заполнены
      if (!identifier || !password) {
        console.log("Ошибка: отсутствуют обязательные поля.");
        return res.status(400).json({
          success: false,
          message: "Имя пользователя/номер телефона и пароль обязательны для заполнения.",
        });
      }
  
      console.log("Ищем пользователя в базе данных...");
      const userQuery = `SELECT * FROM users WHERE username = ? OR phone = ?`;
      const [userResult] = await db.query(userQuery, [identifier, identifier]);
  
      // Проверяем, что пользователь найден
      if (!userResult || userResult.length === 0) {
        console.log("Пользователь не найден.");
        return res.status(401).json({
          success: false,
          message: "Неверное имя пользователя, номер телефона или пароль.",
        });
      }
  
      const user = userResult[0]; // Получаем первую запись из результата
  
      console.log("Данные пользователя:", user);
  
      // Проверяем, что пароли совпадают
      if (user.password !== password) {
        console.log("Неверный пароль.");
        return res.status(401).json({
          success: false,
          message: "Неверное имя пользователя, номер телефона или пароль.",
        });
      }
  
      console.log("Авторизация успешна.");
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
    console.log("Полученные данные для регистрации:", req.body);

    const { username, phone, password } = req.body;

    // Проверяем, что все поля заполнены
    if (!username || !phone || !password) {
      console.log("Ошибка: отсутствуют обязательные поля.");
      return res.status(400).json({
        success: false,
        message: "Логин, номер телефона и пароль обязательны для заполнения.",
      });
    }

    // Проверяем, есть ли пользователь с таким же логином или номером телефона
    const checkUserQuery = `SELECT * FROM users WHERE username = ? OR phone = ?`;
    const [existingUser] = await db.query(checkUserQuery, [username, phone]);

    if (existingUser && existingUser.length > 0) {
      console.log("Пользователь с таким логином или номером телефона уже существует.");
      return res.status(400).json({
        success: false,
        message: "Пользователь с таким логином или номером телефона уже существует.",
      });
    }

    // Вставляем нового пользователя в базу данных
    const insertUserQuery = `INSERT INTO users (username, phone, password, is_admin) VALUES (?, ?, ?, ?)`;
    const [insertResult] = await db.query(insertUserQuery, [username, phone, password, 0]);

    console.log("Пользователь успешно зарегистрирован:", insertResult);

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


module.exports = router;
