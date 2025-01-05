import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  Modal,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { API_BASE_URL } from "../config/config";
import { useNavigation } from "@react-navigation/native";

const HomeScreen = () => {
  const navigation = useNavigation();

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);

  const [sizes, setSizes] = useState([]);
  const [colors, setColors] = useState([]);
  const [countries, setCountries] = useState([]);
  const [selectedFilters, setSelectedFilters] = useState({
    size: null,
    color: null,
    country: null,
    category: null, // Використовуємо category_id
  });

  const [searchQuery, setSearchQuery] = useState("");

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/categories`);
      const data = await response.json();
      setCategories([{ category_id: null, name: "Всі" }, ...data]); // Додаємо "Всі"
    } catch (error) {
      console.error("Помилка завантаження категорій:", error.message);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/products`);
      const data = await response.json();
      setProducts(data);
      setFilteredProducts(data);
    } catch (error) {
      console.error("Помилка завантаження товарів:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchFilters = async () => {
    try {
      const [sizesRes, colorsRes, countriesRes] = await Promise.all([
        fetch(`${API_BASE_URL}/sizes`),
        fetch(`${API_BASE_URL}/colors`),
        fetch(`${API_BASE_URL}/countries`),
      ]);

      const sizes = [
        { size_id: null, size_name: "Всі" },
        ...(await sizesRes.json()),
      ];
      const colors = [
        { color_id: null, color_name: "Всі" },
        ...(await colorsRes.json()),
      ];
      const countries = [
        { country_id: null, country_name: "Всі" },
        ...(await countriesRes.json()),
      ];

      setSizes(sizes);
      setColors(colors);
      setCountries(countries);
    } catch (error) {
      console.error("Помилка завантаження фільтрів:", error.message);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchProducts();
    fetchFilters();
  }, []);

  const applyFilters = () => {
    const filtered = products.filter((product) => {
      const matchesSize = selectedFilters.size
        ? product.size_id === selectedFilters.size
        : true;
      const matchesColor = selectedFilters.color
        ? product.color_id === selectedFilters.color
        : true;
      const matchesCountry = selectedFilters.country
        ? product.country_id === selectedFilters.country
        : true;
      const matchesCategory =
        selectedFilters.category === null ||
        product.category_id === selectedFilters.category;

      return matchesSize && matchesColor && matchesCountry && matchesCategory;
    });
    setFilteredProducts(filtered);
    setModalVisible(false);
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
    const searchedProducts = products.filter((product) =>
      product.name.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredProducts(searchedProducts);
  };

  const renderProduct = ({ item }) => {
    const imageUrl = `${API_BASE_URL}/uploads/${item.image_url}`;

    return (
      <TouchableOpacity
        style={styles.productCard}
        onPress={() =>
          navigation.navigate("Product", { product_id: item.product_id })
        }
      >
        <Image source={{ uri: imageUrl }} style={styles.productImage} />
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{item.name}</Text>
          <Text style={styles.productDetails}>
            Розмір: {item.size_name || "N/A"}
          </Text>
          <Text style={styles.productDetails}>
            Країна: {item.country_name || "N/A"}
          </Text>
          <Text style={styles.productDetails}>
            Колір: {item.color_name || "N/A"}
          </Text>
        </View>
        <View style={styles.productFooter}>
          <Text style={styles.productPrice}>₴ {item.price}</Text>
          <TouchableOpacity style={styles.addButton}>
            <Ionicons name="cart" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF3B30" />
        <Text style={styles.loadingText}>Завантаження...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={["#111111", "#313131"]}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.storeTitle}>Сексшоп</Text>
            <Text style={styles.logoText}>120 ДНІВ СОДОМУ</Text>
          </View>
        </View>
        <View style={styles.searchFilterWrapper}>
          <View style={styles.searchContainer}>
            <TouchableOpacity onPress={() => handleSearch(searchQuery)}>
              <Ionicons
                name="search"
                size={20}
                color="#A2A2A2"
                style={styles.searchIcon}
              />
            </TouchableOpacity>
            <TextInput
              style={styles.searchInputWithIcon}
              placeholder="Введіть товар"
              placeholderTextColor="#A2A2A2"
              value={searchQuery}
              onChangeText={(text) => {
                setSearchQuery(text);
                if (text === "") {
                  setFilteredProducts(products); // Повернення до замовчування
                }
              }}
              onSubmitEditing={() => handleSearch(searchQuery)} // Запускає пошук при натисканні Enter
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => {
                  setSearchQuery("");
                  setFilteredProducts(products); // Повернення до замовчування
                }}
              >
                <Ionicons
                  name="close"
                  size={20}
                  color="#A2A2A2"
                  style={styles.clearIcon}
                />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setModalVisible(true)}
          >
            <Ionicons name="filter" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>
      <View style={styles.productsWrapper}>
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item.product_id.toString()}
          renderItem={renderProduct}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: "space-between" }}
          contentContainerStyle={{ paddingBottom: 10 }}
        />
      </View>
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={{ alignSelf: "flex-end", marginBottom: 10 }}
              onPress={() => setModalVisible(false)}
            >
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>

            <Text style={styles.modalTitle}>Фільтри</Text>

            {/* Фільтри категорій */}
            <Text style={styles.filterLabel}>Категорії</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.filterRow}>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category.category_id}
                    onPress={() =>
                      setSelectedFilters((prev) => ({
                        ...prev,
                        category: category.category_id,
                      }))
                    }
                    style={[
                      styles.filterOptionHorizontal,
                      selectedFilters.category === category.category_id &&
                        styles.selectedOption,
                    ]}
                  >
                    <Text
                      style={[
                        styles.filterOptionText,
                        selectedFilters.category === category.category_id &&
                          styles.selectedOptionText,
                      ]}
                    >
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            {/* Фільтри розмірів */}
            <Text style={styles.filterLabel}>Розмір</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.filterRow}>
                {sizes.map((size) => (
                  <TouchableOpacity
                    key={size.size_id}
                    onPress={() =>
                      setSelectedFilters((prev) => ({
                        ...prev,
                        size: size.size_id,
                      }))
                    }
                    style={[
                      styles.filterOptionHorizontal,
                      selectedFilters.size === size.size_id &&
                        styles.selectedOption,
                    ]}
                  >
                    <Text
                      style={[
                        styles.filterOptionText,
                        selectedFilters.size === size.size_id &&
                          styles.selectedOptionText,
                      ]}
                    >
                      {size.size_name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            {/* Фільтри кольорів */}
            <Text style={styles.filterLabel}>Колір</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.filterRow}>
                {colors.map((color) => (
                  <TouchableOpacity
                    key={color.color_id}
                    onPress={() =>
                      setSelectedFilters((prev) => ({
                        ...prev,
                        color: color.color_id,
                      }))
                    }
                    style={[
                      styles.filterOptionHorizontal,
                      selectedFilters.color === color.color_id &&
                        styles.selectedOption,
                    ]}
                  >
                    <Text
                      style={[
                        styles.filterOptionText,
                        selectedFilters.color === color.color_id &&
                          styles.selectedOptionText,
                      ]}
                    >
                      {color.color_name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            {/* Фільтри країн */}
            <Text style={styles.filterLabel}>Країна</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.filterRow}>
                {countries.map((country) => (
                  <TouchableOpacity
                    key={country.country_id}
                    onPress={() =>
                      setSelectedFilters((prev) => ({
                        ...prev,
                        country: country.country_id,
                      }))
                    }
                    style={[
                      styles.filterOptionHorizontal,
                      selectedFilters.country === country.country_id &&
                        styles.selectedOption,
                    ]}
                  >
                    <Text
                      style={[
                        styles.filterOptionText,
                        selectedFilters.country === country.country_id &&
                          styles.selectedOptionText,
                      ]}
                    >
                      {country.country_name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            {/* Кнопки управління */}
            <View style={styles.horizontalButtonContainer}>
              <TouchableOpacity
                style={[styles.controlButton, styles.clearButton]}
                onPress={() => {
                  setSelectedFilters({
                    size: null,
                    color: null,
                    country: null,
                    category: null,
                  });
                }}
              >
                <Text style={styles.controlButtonText}>Очистити</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.controlButton, styles.applyButton]}
                onPress={() => {
                  applyFilters();
                  setModalVisible(false);
                }}
              >
                <Text style={styles.controlButtonText}>Застосувати</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111111",
  },
  headerGradient: {
    paddingVertical: 20,
    paddingHorizontal: 15,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 5,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  storeTitle: {
    color: "#a2a2a2",
    fontSize: 10,
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  logoText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "600",
  },
  searchFilterWrapper: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 15,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    backgroundColor: "#1c1c1c",
    borderRadius: 12,
    paddingHorizontal: 10,
    marginRight: 10, // Простір між полем вводу і кнопкою
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInputWithIcon: {
    flex: 1,
    height: 50,
    color: "#fff",
    fontSize: 16,
  },
  filterButton: {
    width: 50,
    height: 50,
    backgroundColor: "#FF3B30",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  productsWrapper: {
    flex: 1,
    padding: 15,
    backgroundColor: "#111111",
  },
  productCard: {
    flex: 0.48,
    backgroundColor: "#222222",
    borderRadius: 12,
    marginBottom: 15,
    marginHorizontal: 3,
    padding: 10,
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  productImage: {
    width: "100%",
    height: 120,
    resizeMode: "contain",
    marginBottom: 10,
    borderRadius: 8,
  },
  productInfo: {
    flex: 1, // Займає залишковий простір
    marginBottom: 10, // Простір між інформацією та ціновою частиною
    justifyContent: "space-between", // Рівномірний розподіл тексту
  },
  productName: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "bold",
    marginBottom: 5,
  },
  productDetails: {
    fontSize: 14,
    color: "#A2A2A2",
    marginBottom: 3,
  },
  productFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "auto", // Зміщує вміст вниз
  },
  productPrice: {
    fontSize: 18,
    color: "#FF3B30",
    fontWeight: "bold",
  },
  addButton: {
    backgroundColor: "#FF3B30",
    borderRadius: 50,
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#111111",
  },
  loadingText: {
    marginTop: 10,
    color: "#fff",
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    backgroundColor: "#1c1c1c",
    borderRadius: 15,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 20,
  },
  filterLabel: {
    fontSize: 16,
    color: "#fff",
    marginVertical: 10,
    alignSelf: "flex-start",
  },
  filterRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  filterOptionHorizontal: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginHorizontal: 5,
    backgroundColor: "#313131",
    borderRadius: 20,
  },
  filterOptionText: {
    fontSize: 16,
    color: "#A2A2A2",
  },
  selectedOption: {
    backgroundColor: "#FF3B30",
  },
  selectedOptionText: {
    color: "#fff",
  },
  horizontalButtonContainer: {
    flexDirection: "row", // Кнопки горизонтально
    justifyContent: "space-between",
    marginTop: 20,
    width: "100%",
  },
  controlButton: {
    flex: 0.48,
    paddingVertical: 15,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  applyButton: {
    backgroundColor: "#FF3B30",
  },
  clearButton: {
    backgroundColor: "#313131",
  },
  controlButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default HomeScreen;
