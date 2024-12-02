import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { API_BASE_URL } from "../config/config";

const ProductList = ({ navigation }) => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/products`);
      const data = await response.json();
      console.log("Отримані дані:", data);
      setProducts(data);
    } catch (error) {
      console.error('Помилка завантаження товарів:', error);
    }
  };

  const renderProduct = ({ item }) => (
    <TouchableOpacity
      style={styles.productItem}
      onPress={() => navigation.navigate('EditProduct', { product: item })}
    >
      <Text style={styles.productName}>{item.name}</Text>
      <Text style={styles.productPrice}>{item.price} грн</Text>
    </TouchableOpacity>
  );

  return (
    <LinearGradient colors={['#111111', '#313131']} style={styles.container}>
      <Text style={styles.title}>Список товарів</Text>
      <FlatList
        data={products}
        keyExtractor={(item) => item.product_id.toString()} // Використовуємо product_id
        renderItem={renderProduct}
      />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF', // Білий текст
    marginBottom: 20,
    textAlign: 'center',
  },
  productItem: {
    backgroundColor: '#313131', // Темний фон картки
    padding: 15,
    marginVertical: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF', // Білий текст
  },
  productPrice: {
    fontSize: 16,
    color: '#FF3B30', // Червоний текст для ціни
    marginTop: 5,
  },
});

export default ProductList;
