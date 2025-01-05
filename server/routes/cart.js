const express = require("express");
const router = express.Router();
const db = require("../config/db");

// Отримання товарів у корзині користувача за `cart_id`
router.get("/:cart_id", async (req, res) => {
    const { cart_id } = req.params;

    if (!cart_id) {
        return res.status(400).json({ error: "cart_id є обов'язковим." });
    }

    try {
        const [cartItems] = await db.query(
            `SELECT ci.cart_item_id, ci.quantity, p.product_id, p.name, p.price, p.image_url 
             FROM cart_items ci
             JOIN products p ON ci.product_id = p.product_id
             WHERE ci.cart_id = ?`,
            [cart_id]
        );

        // Повернення порожнього масиву для порожньої корзини
        return res.status(200).json(cartItems);
    } catch (error) {
        console.error("Помилка отримання корзини:", error.message);
        res.status(500).json({ error: "Помилка отримання корзини." });
    }
});

// Додавання товару до корзини
router.post("/", async (req, res) => {
    const { cart_id, product_id, quantity } = req.body;

    if (!cart_id || !product_id) {
        return res.status(400).json({ error: "cart_id і product_id є обов'язковими." });
    }

    try {
        const [existingItem] = await db.query(
            `SELECT * FROM cart_items WHERE cart_id = ? AND product_id = ?`,
            [cart_id, product_id]
        );

        if (existingItem.length) {
            await db.query(
                `UPDATE cart_items SET quantity = quantity + ? WHERE cart_id = ? AND product_id = ?`,
                [quantity || 1, cart_id, product_id]
            );
            return res.status(200).json({ message: "Кількість товару в корзині оновлено." });
        } else {
            await db.query(
                `INSERT INTO cart_items (cart_id, product_id, quantity) VALUES (?, ?, ?)`,
                [cart_id, product_id, quantity || 1]
            );
            return res.status(201).json({ message: "Товар додано до корзини." });
        }
    } catch (error) {
        console.error("Помилка додавання товару до корзини:", error.message);
        res.status(500).json({ error: "Помилка додавання товару до корзини." });
    }
});

// Оновлення кількості товару
router.put("/:cart_item_id", async (req, res) => {
    const { cart_item_id } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
        return res.status(400).json({ error: "Кількість має бути більше 0." });
    }

    try {
        const [result] = await db.query(`UPDATE cart_items SET quantity = ? WHERE cart_item_id = ?`, [quantity, cart_item_id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Товар у корзині не знайдено." });
        }

        res.status(200).json({ message: "Кількість оновлено." });
    } catch (error) {
        console.error("Помилка оновлення кількості:", error.message);
        res.status(500).json({ error: "Помилка оновлення кількості." });
    }
});

// Видалення товару з корзини
router.delete("/:cart_item_id", async (req, res) => {
    const { cart_item_id } = req.params;

    try {
        const [result] = await db.query(`DELETE FROM cart_items WHERE cart_item_id = ?`, [cart_item_id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Товар у корзині не знайдено." });
        }

        res.status(200).json({ message: "Товар видалено з корзини." });
    } catch (error) {
        console.error("Помилка видалення товару з корзини:", error.message);
        res.status(500).json({ error: "Помилка видалення товару з корзини." });
    }
});

module.exports = router;
