const express = require("express");
const router = express.Router();
const db = require('../config/db');
router.post("/orders", async (req, res) => {
    console.log("Отримані дані від клієнта:", req.body);
  
    const {
      user_id,
      product_id,
      price,
      phone_number,
      address,
      payment_method_id,
    } = req.body;
  
    if (
      !user_id ||
      !product_id ||
      !price ||
      !phone_number ||
      !address ||
      !payment_method_id
    ) {
      console.error("Помилка: Відсутні обов'язкові поля", req.body);
      return res.status(400).json({ error: "Всі поля повинні бути заповнені." });
    }
  
    try {
      const query = `
        INSERT INTO orders (
          user_id,
          product_id,
          price,
          payment_method_id,
          phone_number,
          address,
          created_at,
          updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
      `;
  
      const [result] = await db.execute(query, [
        user_id,
        product_id,
        price,
        payment_method_id,
        phone_number,
        address,
      ]);
  
      res.status(201).json({
        message: "Замовлення успішно створено.",
        order_id: result.insertId,
      });
    } catch (error) {
      console.error("Помилка створення замовлення:", error);
      res.status(500).json({ error: "Помилка сервера при створенні замовлення." });
    }
  });
  
  module.exports = router;