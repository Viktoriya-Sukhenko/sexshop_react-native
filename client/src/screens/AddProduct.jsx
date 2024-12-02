import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { launchImageLibrary } from 'react-native-image-picker';
import { API_BASE_URL } from "../config/config";

const AddProduct = ({ navigation }) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [stock, setStock] = useState('');
  const [image, setImage] = useState(null);
  const [categories, setCategories] = useState([]);
  const [colors, setColors] = useState([]);
  const [countries, setCountries] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);

  useEffect(() => {
    fetchData(`${API_BASE_URL}/categories`, setCategories, "категорій");
    fetchData(`${API_BASE_URL}/colors`, setColors, "кольорів");
    fetchData(`${API_BASE_URL}/countries`, setCountries, "країн");
    fetchData(`${API_BASE_URL}/sizes`, setSizes, "розмірів");
  }, []);

  const fetchData = async (url, setter, name) => {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Помилка завантаження ${name}`);
      const data = await response.json();
      setter(data);
    } catch (error) {
      console.error(`Помилка завантаження ${name}:`, error);
      Alert.alert('Помилка', `Не вдалося завантажити ${name}`);
    }
  };

  const handleSelectImage = () => {
    launchImageLibrary({ mediaType: 'photo' }, (response) => {
      if (!response.didCancel && !response.errorCode) {
        setImage(response.assets[0]);
      }
    });
  };

  const handleAddProduct = async () => {
    if (
      !name ||
      !price ||
      !description ||
      !stock ||
      !selectedCategory ||
      !selectedColor ||
      !selectedCountry ||
      !selectedSize ||
      !image
    ) {
      Alert.alert('Помилка', 'Будь ласка, заповніть всі поля та виберіть параметри товару!');
      return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('price', price);
    formData.append('description', description);
    formData.append('stock', stock);
    formData.append('category_id', selectedCategory);
    formData.append('color_id', selectedColor);
    formData.append('country_id', selectedCountry);
    formData.append('size_id', selectedSize);
    formData.append('image', {
      uri: image.uri,
      type: image.type,
      name: image.fileName,
    });

    console.log("Дані для відправлення:", {
      name,
      price,
      description,
      stock,
      selectedCategory,
      selectedColor,
      selectedCountry,
      selectedSize,
    });

    try {
      const response = await fetch(`${API_BASE_URL}/products`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.ok) {
        Alert.alert('Успіх', 'Товар успішно додано!');
        navigation.goBack();
      } else {
        const errorData = await response.json();
        console.error('Помилка сервера:', errorData);
        Alert.alert('Помилка', errorData.message || 'Не вдалося додати товар!');
      }
    } catch (error) {
      console.error('Помилка:', error);
      Alert.alert('Помилка', 'Помилка підключення до сервера');
    }
  };

  const renderHorizontalSelector = (items, selectedId, setSelectedId, placeholder) => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
      {items.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={[
            styles.selectorItem,
            selectedId === item.id && styles.selectedItem,
          ]}
          onPress={() => setSelectedId(item.id)}
        >
          <Text
            style={[
              styles.selectorText,
              selectedId === item.id && styles.selectedItemText,
            ]}
          >
            {item.name || placeholder}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  return (
    <LinearGradient colors={['#111111', '#313131']} style={styles.container}>
      <ScrollView>
        <Text style={styles.title}>Додати товар</Text>
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
        <TextInput
          style={styles.input}
          placeholder="Кількість на складі"
          placeholderTextColor="#A2A2A2"
          keyboardType="numeric"
          value={stock}
          onChangeText={setStock}
        />

        <Text style={styles.label}>Категорія</Text>
        {renderHorizontalSelector(categories, selectedCategory, setSelectedCategory, "Категорія")}

        <Text style={styles.label}>Колір</Text>
        {renderHorizontalSelector(colors, selectedColor, setSelectedColor, "Колір")}

        <Text style={styles.label}>Країна</Text>
        {renderHorizontalSelector(countries, selectedCountry, setSelectedCountry, "Країна")}

        <Text style={styles.label}>Розмір</Text>
        {renderHorizontalSelector(sizes, selectedSize, setSelectedSize, "Розмір")}

        {image && <Image source={{ uri: image.uri }} style={styles.imagePreview} />}
        <TouchableOpacity style={styles.button} onPress={handleSelectImage}>
          <Text style={styles.buttonText}>Вибрати зображення</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleAddProduct}>
          <Text style={styles.buttonText}>Додати</Text>
        </TouchableOpacity>
      </ScrollView>
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
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#313131',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    fontSize: 16,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#555',
  },
  textArea: {
    height: 100,
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  horizontalScroll: {
    marginBottom: 20,
  },
  selectorItem: {
    backgroundColor: '#313131',
    padding: 10,
    borderRadius: 10,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  selectedItem: {
    backgroundColor: '#FF3B30',
  },
  selectorText: {
    color: '#A2A2A2',
    fontSize: 16,
  },
  selectedItemText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#FF3B30',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonText: {
    color: '#FFFFFF',
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
});

export default AddProduct;
