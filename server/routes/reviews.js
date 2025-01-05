const express = require("express");
const router = express.Router();
const db = require('../config/db'); // Ваш модуль для роботи з базою даних

// Отримати відгуки для товару
router.get("/", async (req, res) => {
  const { product_id } = req.query;

  if (!product_id) {
    return res.status(400).json({ error: "Необхідно вказати product_id." });
  }

  try {
    const [reviews] = await db.execute(
      "SELECT review_id, product_id, user_id, text, rating, created_at FROM reviews WHERE product_id = ? ORDER BY created_at DESC",
      [product_id]
    );

    res.status(200).json(reviews);
  } catch (error) {
    console.error("Помилка отримання відгуків:", error.message);
    res.status(500).json({ error: "Помилка отримання відгуків." });
  }
});

// Додати новий відгук
router.post("/", async (req, res) => {
  const { product_id, user_id, text, rating } = req.body;

  if (!product_id || !user_id || !text || !rating) {
    return res.status(400).json({ error: "Всі поля є обов'язковими." });
  }

  if (rating < 1 || rating > 5) {
    return res.status(400).json({ error: "Рейтинг має бути в межах від 1 до 5." });
  }

  try {
    // Додати відгук
    await db.execute(
      "INSERT INTO reviews (product_id, user_id, text, rating, created_at) VALUES (?, ?, ?, ?, NOW())",
      [product_id, user_id, text, rating]
    );

    // Отримати оновлений список відгуків
    const [updatedReviews] = await db.execute(
      "SELECT review_id, product_id, user_id, text, rating, created_at FROM reviews WHERE product_id = ? ORDER BY created_at DESC",
      [product_id]
    );

    res.status(201).json(updatedReviews);
  } catch (error) {
    console.error("Помилка додавання відгуку:", error.message);
    res.status(500).json({ error: "Помилка додавання відгуку." });
  }
});

module.exports = router;
