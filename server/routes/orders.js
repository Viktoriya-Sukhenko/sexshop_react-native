const express = require("express");
const router = express.Router();
const db = require("../config/db");

router.post("/orders", async (req, res) => {
    console.log("Отримані дані від клієнта:", req.body);

    const {
        user_id,
        phone_number,
        address,
        payment_method_id,
        cart_items, // Масив товарів у корзині [{product_id, price, quantity}]
    } = req.body;

    // Перевірка обов'язкових полів
    if (!user_id || !phone_number || !address || !payment_method_id || !cart_items || cart_items.length === 0) {
        console.error("Помилка: Відсутні обов'язкові поля", req.body);
        return res.status(400).json({ error: "Всі поля повинні бути заповнені." });
    }

    const connection = await db.getConnection(); // Отримання з'єднання з БД
    try {
        // Початок транзакції
        await connection.beginTransaction();

        // Розрахунок загальної суми замовлення
        const totalPrice = cart_items.reduce((sum, item) => sum + item.price * item.quantity, 0);

        // Додавання запису в таблицю `orders`
        const orderQuery = `
            INSERT INTO orders (
                user_id,
                phone_number,
                address,
                payment_method_id,
                total_price,
                created_at,
                updated_at
            ) VALUES (?, ?, ?, ?, ?, NOW(), NOW())
        `;
        const [orderResult] = await connection.query(orderQuery, [
            user_id,
            phone_number,
            address,
            payment_method_id,
            totalPrice,
        ]);

        const orderId = orderResult.insertId; // Отримання `order_id`

        // Додавання товарів у таблицю `order_items`
        const orderItemsQuery = `
            INSERT INTO order_items (
                order_id,
                product_id,
                price,
                quantity,
                created_at,
                updated_at
            ) VALUES (?, ?, ?, ?, NOW(), NOW())
        `;
        for (const item of cart_items) {
            await connection.query(orderItemsQuery, [
                orderId,
                item.product_id,
                item.price,
                item.quantity,
            ]);
        }

        // Завершення транзакції
        await connection.commit();

        res.status(201).json({
            message: "Замовлення успішно створено.",
            order_id: orderId,
        });
    } catch (error) {
        await connection.rollback(); // Відкат транзакції у разі помилки
        console.error("Помилка створення замовлення:", error);
        res.status(500).json({ error: "Помилка сервера при створенні замовлення." });
    } finally {
        connection.release(); // Звільнення з'єднання
    }
});

module.exports = router;
