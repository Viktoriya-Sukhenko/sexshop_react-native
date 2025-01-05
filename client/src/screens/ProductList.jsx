import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { API_BASE_URL } from "../config/config";
import { useFocusEffect } from '@react-navigation/native';

const ProductList = ({ navigation }) => {
  const [products, setProducts] = useState([]);

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

  useFocusEffect(
    useCallback(() => {
      fetchProducts();
    }, [])
  );

  const handleDeleteProduct = async (productId) => {
    Alert.alert(
      "Підтвердження видалення",
      "Ви впевнені, що хочете видалити цей товар?",
      [
        {
          text: "Скасувати",
          style: "cancel",
        },
        {
          text: "Видалити",
          onPress: async () => {
            try {
              const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
                method: 'DELETE',
              });

              if (response.ok) {
                setProducts((prevProducts) =>
                  prevProducts.filter((product) => product.product_id !== productId)
                );
                Alert.alert('Успіх', 'Товар успішно видалено.');
              } else {
                const errorData = await response.json();
                alert(`Помилка видалення товару: ${errorData.error || 'Невідома помилка'}`);
              }
            } catch (error) {
              console.error('Помилка видалення товару:', error);
              alert('Не вдалося видалити товар.');
            }
          },
        },
      ]
    );
  };

  const renderProduct = ({ item }) => (
    <View style={styles.productItem}>
      <TouchableOpacity
        style={styles.productInfo}
        onPress={() =>
          navigation.navigate('EditProduct', { product: { ...item, id: item.product_id } })
        }
      >
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productPrice}>{item.price} грн</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.deleteIcon}
        onPress={() => handleDeleteProduct(item.product_id)}
      >
        <Ionicons name="trash" size={24} color="#FF3B30" />
      </TouchableOpacity>
    </View>
  );

  return (
    <LinearGradient colors={['#111111', '#313131']} style={styles.container}>
      <Text style={styles.title}>Список товарів</Text>
      <FlatList
        data={products}
        keyExtractor={(item) => item.product_id.toString()}
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
    color: '#FFFFFF',
    marginTop: 50,
    marginBottom: 20,
    textAlign: 'center',
  },
  productItem: {
    backgroundColor: '#313131',
    padding: 15,
    marginVertical: 10,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  productPrice: {
    fontSize: 16,
    color: '#FF3B30',
    marginTop: 5,
  },
  deleteIcon: {
    marginLeft: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ProductList;
