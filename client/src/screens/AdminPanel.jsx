import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const AdminPanel = ({ navigation }) => {
  return (
    <LinearGradient colors={['#111111', '#313131']} style={styles.container}>
      <Text style={styles.title}>Адмін-Панель</Text>

      {/* Кнопка для перегляду всіх товарів */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('ProductList')}
      >
        <Text style={styles.buttonText}>Дивитись товари</Text>
      </TouchableOpacity>

      {/* Кнопка для додавання нового товару */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('AddProduct')}
      >
        <Text style={styles.buttonText}>Додати товар</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff', // Білий текст
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#FF3B30', // Червоний фон кнопки
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    width: '80%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 3,
    elevation: 3, // Тінь для Android
  },
  buttonText: {
    color: '#FFFFFF', // Білий текст кнопки
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default AdminPanel;
