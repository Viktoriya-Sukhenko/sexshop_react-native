const express = require('express');
const router = express.Router();
const db = require('../config/db'); // Подключение к БД
const upload = require('../middlewares/upload'); // Middleware для загрузки файлов
const fs = require('fs'); // Для удаления файлов
const path = require('path');

// Отримання всіх товарів із приєднанням додаткових даних
router.get('/', async (req, res) => {
    try {
        const [products] = await db.query(`
            SELECT 
                p.product_id, 
                p.name, 
                p.price, 
                p.description, 
                p.category_id, 
                p.stock, 
                p.color_id, 
                c.color_name, 
                p.country_id, 
                cn.country_name, 
                p.size_id, 
                s.size_name, 
                p.image_url, 
                p.created_at, 
                p.updated_at 
            FROM products p
            LEFT JOIN colors c ON p.color_id = c.color_id
            LEFT JOIN countries cn ON p.country_id = cn.country_id
            LEFT JOIN sizes s ON p.size_id = s.size_id
        `);
        res.json(products);
    } catch (error) {
        console.error('Помилка отримання товарів:', error.message);
        res.status(500).json({ error: 'Помилка отримання товарів' });
    }
});

// Получение товара по ID
router.get('/:product_id', async (req, res) => {
    const { product_id } = req.params;

    try {
        const [product] = await db.query(`
            SELECT 
                product_id, 
                name, 
                price, 
                description, 
                category_id, 
                stock, 
                color_id, 
                country_id, 
                size_id, 
                image_url, 
                created_at, 
                updated_at 
            FROM products 
            WHERE product_id = ?
        `, [product_id]);

        if (product.length === 0) {
            return res.status(404).json({ error: `Товар с ID ${product_id} не найден` });
        }

        res.json(product[0]);
    } catch (error) {
        console.error('Ошибка получения товара:', error.message);
        res.status(500).json({ error: 'Ошибка получения товара' });
    }
});

// Добавление нового товара
router.post('/', upload.single('image'), async (req, res) => {
    const { 
        name, 
        price, 
        description, 
        category_id, 
        stock, 
        color_id, 
        country_id, 
        size_id 
    } = req.body;

    const image_url = req.file ? `/uploads/${req.file.filename}` : null;

    try {
        const [result] = await db.query(`
            INSERT INTO products (
                name, price, description, category_id, stock, color_id, country_id, size_id, image_url
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [name, price, description, category_id, stock, color_id, country_id, size_id, image_url]);

        res.status(201).json({ message: 'Товар добавлен', productId: result.insertId });
    } catch (error) {
        console.error('Ошибка добавления товара:', error.message);
        res.status(500).json({ error: 'Ошибка добавления товара' });
    }
});

// Обновление товара
router.put('/:product_id', upload.single('image'), async (req, res) => {
    const { product_id } = req.params;
    const { 
        name, 
        price, 
        description, 
        category_id, 
        stock, 
        color_id, 
        country_id, 
        size_id 
    } = req.body;

    const image_url = req.file ? `/uploads/${req.file.filename}` : null;

    try {
        const [existingProduct] = await db.query('SELECT * FROM products WHERE product_id = ?', [product_id]);

        if (existingProduct.length === 0) {
            return res.status(404).json({ error: `Товар с ID ${product_id} не найден` });
        }

        if (req.file && existingProduct[0].image_url) {
            // Удаляем старое изображение, если добавлено новое
            const oldImagePath = path.join(__dirname, '../', existingProduct[0].image_url);
            if (fs.existsSync(oldImagePath)) {
                fs.unlinkSync(oldImagePath);
            }
        }

        const updateQuery = `
            UPDATE products 
            SET 
                name = ?, 
                price = ?, 
                description = ?, 
                category_id = ?, 
                stock = ?, 
                color_id = ?, 
                country_id = ?, 
                size_id = ?, 
                image_url = COALESCE(?, image_url) 
            WHERE product_id = ?
        `;
        await db.query(updateQuery, [
            name, price, description, category_id, stock, color_id, country_id, size_id, image_url, product_id
        ]);

        res.json({ message: 'Товар обновлен' });
    } catch (error) {
        console.error('Ошибка обновления товара:', error.message);
        res.status(500).json({ error: 'Ошибка обновления товара' });
    }
});

// Удаление товара
router.delete('/:product_id', async (req, res) => {
    const { product_id } = req.params;

    try {
        const [product] = await db.query('SELECT image_url FROM products WHERE product_id = ?', [product_id]);

        if (product.length === 0) {
            return res.status(404).json({ error: `Товар с ID ${product_id} не найден` });
        }

        // Удаление файла изображения
        if (product[0].image_url) {
            const imagePath = path.join(__dirname, '../', product[0].image_url);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        // Удаление записи из БД
        const [result] = await db.query('DELETE FROM products WHERE product_id = ?', [product_id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: `Товар с ID ${product_id} не найден` });
        }

        res.json({ message: 'Товар удален' });
    } catch (error) {
        console.error('Ошибка удаления товара:', error.message);
        res.status(500).json({ error: 'Ошибка удаления товара' });
    }
});

module.exports = router;
