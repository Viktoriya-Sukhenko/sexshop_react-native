import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import { API_BASE_URL } from "../config/config";

const AddProduct = ({ navigation }) => {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [stock, setStock] = useState("");
  const [size, setSize] = useState(null);
  const [color, setColor] = useState(null);
  const [country, setCountry] = useState(null);
  const [category, setCategory] = useState(null);
  const [image, setImage] = useState(null);

  const [sizes, setSizes] = useState([]);
  const [colors, setColors] = useState([]);
  const [countries, setCountries] = useState([]);
  const [categories, setCategories] = useState([]);

  const fetchAttributes = async () => {
    try {
      const [sizesRes, colorsRes, countriesRes, categoriesRes] = await Promise.all([
        fetch(`${API_BASE_URL}/sizes`),
        fetch(`${API_BASE_URL}/colors`),
        fetch(`${API_BASE_URL}/countries`),
        fetch(`${API_BASE_URL}/categories`),
      ]);

      setSizes(await sizesRes.json());
      setColors(await colorsRes.json());
      setCountries(await countriesRes.json());
      setCategories(await categoriesRes.json());
    } catch (error) {
      console.error("Помилка завантаження атрибутів:", error.message);
    }
  };

  useEffect(() => {
    fetchAttributes();
  }, []);

  const handleSelectImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert("Помилка", "Потрібен доступ до галереї для вибору зображення.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        const selectedImage = result.assets[0];
        setImage({
          uri: selectedImage.uri,
          type: "image/jpeg",
          name: selectedImage.uri.split("/").pop(),
        });
      } else {
        Alert.alert("Скасовано", "Вибір зображення було скасовано.");
      }
    } catch (error) {
      console.error("Помилка вибору зображення:", error);
      Alert.alert("Помилка", "Не вдалося вибрати зображення.");
    }
  };

  const handleAddProduct = async () => {
    if (!name || !price || !stock || !size || !color || !country || !category) {
      Alert.alert("Помилка", "Заповніть усі поля!");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("price", price);
    formData.append("description", description);
    formData.append("stock", stock);
    formData.append("size_id", size);
    formData.append("color_id", color);
    formData.append("country_id", country);
    formData.append("category_id", category);

    if (image && image.uri) {
      formData.append("image", {
        uri: image.uri,
        type: image.type,
        name: image.name || "image.jpg",
      });
    }

    try {
      const response = await fetch(`${API_BASE_URL}/products`, {
        method: "POST",
        body: formData,
        headers: { "Content-Type": "multipart/form-data" },
      });

      const responseData = await response.json();
      console.log("Відповідь сервера:", responseData);

      if (response.ok) {
        Alert.alert("Успіх", "Товар успішно додано!");
        navigation.goBack();
      } else {
        Alert.alert(
          "Помилка",
          `Помилка при додаванні товару: ${responseData.error || "Невідома помилка"}`
        );
      }
    } catch (error) {
      console.error("Помилка підключення до сервера:", error.message);
      Alert.alert("Помилка", "Помилка підключення до сервера");
    }
  };

  return (
    <LinearGradient colors={["#111111", "#313131"]} style={styles.container}>
      <ScrollView>
        <Text style={styles.title}>Додати товар</Text>

        <Text style={styles.label}>Назва товару</Text>
        <TextInput
          style={styles.input}
          placeholder="Введіть назву товару"
          placeholderTextColor="#A2A2A2"
          value={name}
          onChangeText={setName}
        />

        <Text style={styles.label}>Ціна</Text>
        <TextInput
          style={styles.input}
          placeholder="Введіть ціну"
          placeholderTextColor="#A2A2A2"
          keyboardType="numeric"
          value={price}
          onChangeText={setPrice}
        />

        <Text style={styles.label}>Кількість на складі</Text>
        <TextInput
          style={styles.input}
          placeholder="Введіть кількість на складі"
          placeholderTextColor="#A2A2A2"
          keyboardType="numeric"
          value={stock}
          onChangeText={setStock}
        />

        <Text style={styles.label}>Опис</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Введіть опис товару"
          placeholderTextColor="#A2A2A2"
          value={description}
          onChangeText={setDescription}
          multiline
        />

        <Text style={styles.label}>Категорія</Text>
        <View style={styles.optionRow}>
          {categories.map((c) => (
            <TouchableOpacity
              key={c.category_id}
              style={[
                styles.optionButton,
                category === c.category_id && styles.selectedOption,
              ]}
              onPress={() => setCategory(c.category_id)}
            >
              <Text
                style={[
                  styles.optionText,
                  category === c.category_id && styles.selectedOptionText,
                ]}
              >
                {c.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Розмір</Text>
        <View style={styles.optionRow}>
          {sizes.map((s) => (
            <TouchableOpacity
              key={s.size_id}
              style={[
                styles.optionButton,
                size === s.size_id && styles.selectedOption,
              ]}
              onPress={() => setSize(s.size_id)}
            >
              <Text
                style={[
                  styles.optionText,
                  size === s.size_id && styles.selectedOptionText,
                ]}
              >
                {s.size_name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Колір</Text>
        <View style={styles.optionRow}>
          {colors.map((c) => (
            <TouchableOpacity
              key={c.color_id}
              style={[
                styles.optionButton,
                color === c.color_id && styles.selectedOption,
              ]}
              onPress={() => setColor(c.color_id)}
            >
              <Text
                style={[
                  styles.optionText,
                  color === c.color_id && styles.selectedOptionText,
                ]}
              >
                {c.color_name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Країна</Text>
        <View style={styles.optionRow}>
          {countries.map((c) => (
            <TouchableOpacity
              key={c.country_id}
              style={[
                styles.optionButton,
                country === c.country_id && styles.selectedOption,
              ]}
              onPress={() => setCountry(c.country_id)}
            >
              <Text
                style={[
                  styles.optionText,
                  country === c.country_id && styles.selectedOptionText,
                ]}
              >
                {c.country_name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {image && (
          <Image source={{ uri: image.uri }} style={styles.imagePreview} />
        )}
        <TouchableOpacity style={styles.button} onPress={handleSelectImage}>
          <Text style={styles.buttonText}>Вибрати зображення</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleAddProduct}>
          <Text style={styles.buttonText}>Додати товар</Text>
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
    fontWeight: "bold",
    color: "#FFFFFF",
    marginTop: 30,
    marginBottom: 30,
    textAlign: "center",
  },
  input: {
    backgroundColor: "#313131",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    fontSize: 16,
    color: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#555",
  },
  textArea: {
    height: 100,
  },
  button: {
    backgroundColor: "#FF3B30",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  imagePreview: {
    width: "100%",
    height: 200,
    marginBottom: 15,
    borderRadius: 10,
    resizeMode: "cover",
  },
  label: {
    fontSize: 16,
    color: "#FFFFFF",
    marginBottom: 10,
  },
  optionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 15,
  },
  optionButton: {
    backgroundColor: "#313131",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
  },
  optionText: {
    fontSize: 14,
    color: "#A2A2A2",
  },
  selectedOption: {
    backgroundColor: "#FF3B30",
  },
  selectedOptionText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
});

export default AddProduct;
