import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { launchImageLibrary } from 'react-native-image-picker';
import { API_BASE_URL } from "../config/config";

const EditProduct = ({ route, navigation }) => {
  const { product } = route.params || {};

  if (!product) {
    return <Text style={styles.errorText}>Помилка: дані про товар не передані</Text>;
  }

  const [name, setName] = useState(product.name);
  const [price, setPrice] = useState(product.price.toString());
  const [description, setDescription] = useState(product.description);
  const [image, setImage] = useState(product.image_url);

  const handleSelectImage = () => {
    launchImageLibrary({ mediaType: 'photo' }, (response) => {
      if (!response.didCancel && !response.errorCode) {
        setImage(response.assets[0]);
      }
    });
  };

  const handleEditProduct = async () => {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('price', price);
    formData.append('description', description);

    if (image && image.uri) {
      formData.append('image', {
        uri: image.uri,
        type: image.type,
        name: image.fileName,
      });
    }

    try {
      const response = await fetch(`${API_BASE_URL}/products/${product.id}`, {
        method: 'PUT',
        body: formData,
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.ok) {
        alert('Товар успішно оновлено!');
        navigation.goBack();
      } else {
        alert('Помилка при редагуванні товару!');
      }
    } catch (error) {
      console.error('Помилка:', error);
      alert('Помилка підключення до сервера');
    }
  };

  return (
    <LinearGradient colors={['#111111', '#313131']} style={styles.container}>
      <Text style={styles.title}>Редагувати товар</Text>
      <TextInput
        style={styles.input}
        placeholder="Назва товару"
        placeholderTextColor="#A2A2A2"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Ціна"
        placeholderTextColor="#A2A2A2"
        keyboardType="numeric"
        value={price}
        onChangeText={setPrice}
      />
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Опис"
        placeholderTextColor="#A2A2A2"
        value={description}
        onChangeText={setDescription}
        multiline
      />
      {image && (
        <Image source={{ uri: image.uri || image }} style={styles.imagePreview} />
      )}
      <TouchableOpacity style={styles.button} onPress={handleSelectImage}>
        <Text style={styles.buttonText}>Вибрати зображення</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={handleEditProduct}>
        <Text style={styles.buttonText}>Зберегти зміни</Text>
      </TouchableOpacity>
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
  input: {
    backgroundColor: '#313131', // Темний фон
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    fontSize: 16,
    color: '#FFFFFF', // Білий текст
    borderWidth: 1,
    borderColor: '#555',
  },
  textArea: {
    height: 100, // Для багаторядкового тексту
  },
  button: {
    backgroundColor: '#FF3B30', // Червоний фон
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  buttonText: {
    color: '#FFFFFF', // Білий текст
    fontSize: 18,
    fontWeight: 'bold',
  },
  imagePreview: {
    width: '100%',
    height: 200,
    marginBottom: 15,
    borderRadius: 10,
    resizeMode: 'cover',
  },
  errorText: {
    fontSize: 18,
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default EditProduct;
