import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Image,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Alert,
  TextInput,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker"; // Використовується для вибору рейтингу
import { API_BASE_URL } from "../config/config";
import Toast from "react-native-toast-message";
import { LogBox } from "react-native";

LogBox.ignoreLogs([
  "VirtualizedLists should never be nested inside plain ScrollViews", // Попередження, яке потрібно приховати
]);

const ProductScreen = ({ route }) => {
  const { product_id } = route.params;
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState(0);
  const [submittingReview, setSubmittingReview] = useState(false);

  // Завантаження деталей продукту та відгуків
  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/products/${product_id}`);
        if (!response.ok) {
          throw new Error(`Помилка відповіді: ${response.statusText}`);
        }
        const data = await response.json();
        setProduct(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    const fetchReviews = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/reviews?product_id=${product_id}`);
        if (!response.ok) {
          throw new Error("Не вдалося завантажити відгуки.");
        }
        const data = await response.json();
        setReviews(data);
      } catch (error) {
        console.error("Помилка завантаження відгуків:", error.message);
      }
    };

    fetchProductDetails();
    fetchReviews();
  }, [product_id]);

  const handleAddToCart = async () => {
    try {
      const user = await AsyncStorage.getItem("user");
      if (!user) {
        console.error("Користувач не знайдений в AsyncStorage");
        return;
      }

      const parsedUser = JSON.parse(user);
      const cartId = parsedUser.cart_id;

      if (!cartId) {
        console.error("cart_id не знайдено для користувача.");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/cart`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cart_id: cartId,
          product_id: product.product_id,
          quantity: 1,
        }),
      });
      if (!response.ok) {
        console.error("Помилка додавання товару до корзини:", await response.text());
      } else {
        Toast.show({
          type: "success",
          text1: "Товар додано до корзини",
          text2: `${product.name} успішно додано.`,
        });
      }
    } catch (error) {
      console.error("Помилка додавання товару до корзини:", error.message);
    }
  };

  const handleSubmitReview = async () => {
    if (!reviewText || rating < 1 || rating > 5) {
      Alert.alert("Помилка", "Будь ласка, введіть текст відгуку та виберіть рейтинг.");
      return;
    }

    setSubmittingReview(true);

    try {
      const user = await AsyncStorage.getItem("user");
      if (!user) {
        console.error("Користувач не знайдений в AsyncStorage");
        return;
      }

      const parsedUser = JSON.parse(user);

      const response = await fetch(`${API_BASE_URL}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id,
          user_id: parsedUser.user_id,
          text: reviewText,
          rating,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Помилка: ${errorText}`);
      }

      Toast.show({
        type: "success",
        text1: "Відгук додано",
        text2: "Дякуємо за ваш відгук!",
      });

      // Оновити список відгуків
      const updatedReviews = await response.json();
      setReviews(updatedReviews);
      setReviewText("");
      setRating(0);
    } catch (error) {
      console.error("Помилка додавання відгуку:", error.message);
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF3B30" />
        <Text style={styles.loadingText}>Завантаження...</Text>
      </View>
    );
  }

  if (error) {
    return <Text style={styles.errorText}>Помилка завантаження: {error}</Text>;
  }

  if (!product) {
    return <Text style={styles.errorText}>Товар не знайдено.</Text>;
  }

  const imageUrl = `${API_BASE_URL}/uploads/${product.image_url}`;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>Деталі товару</Text>
      </View>
      <Image source={{ uri: imageUrl }} style={styles.productImage} />
      <View style={styles.detailsContainer}>
        <Text style={styles.productName}>{product.name}</Text>
        <Text style={styles.productDescription}>{product.description}</Text>
        <View style={styles.priceAndOrderContainer}>
          <Text style={styles.productPrice}>₴ {product.price}</Text>
          <TouchableOpacity style={styles.addButton} onPress={handleAddToCart}>
            <Text style={styles.addButtonText}>Додати до корзини</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Додавання відгуку */}
      <View style={styles.addReviewContainer}>
        <Text style={styles.sectionTitle}>Залишити відгук</Text>
        <TextInput
          style={styles.input}
          placeholder="Ваш відгук"
          placeholderTextColor="#A2A2A2"
          value={reviewText}
          onChangeText={setReviewText}
        />
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={rating}
            onValueChange={(itemValue) => setRating(itemValue)}
            style={styles.picker}
          >
            <Picker.Item label="Оберіть рейтинг" value={0} />
            <Picker.Item label="1 зірка" value={1} />
            <Picker.Item label="2 зірки" value={2} />
            <Picker.Item label="3 зірки" value={3} />
            <Picker.Item label="4 зірки" value={4} />
            <Picker.Item label="5 зірок" value={5} />
          </Picker>
        </View>
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmitReview}
          disabled={submittingReview}
        >
          <Text style={styles.submitButtonText}>
            {submittingReview ? "Відправка..." : "Додати відгук"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Відгуки */}
      <View style={styles.reviewsContainer}>
        <Text style={styles.sectionTitle}>Відгуки</Text>
        {reviews.length === 0 ? (
          <Text style={styles.noReviewsText}>Немає відгуків</Text>
        ) : (
          <FlatList
            data={reviews}
            keyExtractor={(item) => item.review_id.toString()}
            renderItem={({ item }) => (
              <View style={styles.reviewItem}>
                <Text style={styles.reviewText}>{item.text}</Text>
                <Text style={styles.reviewRating}>Рейтинг: {item.rating}</Text>
              </View>
            )}
            nestedScrollEnabled
          />
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  pickerContainer: {
    backgroundColor: "#3A3A3A",
    borderRadius: 10,
    marginBottom: 15,
  },
  picker: {
    color: "#FFFFFF",
    fontSize: 16,
    height: 50,
  },
  container: {
    flex: 1,
    backgroundColor: "#1A1A1A",
  },
  headerContainer: {
    marginTop: 50,
    marginBottom: 20,
    alignItems: "center",
  },
  headerText: {
    fontSize: 24,
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  productImage: {
    width: "100%",
    height: 300,
    resizeMode: "contain",
    marginBottom: 20,
  },
  detailsContainer: {
    padding: 20,
    backgroundColor: "#2C2C2C",
    borderRadius: 20,
    marginHorizontal: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  productName: {
    fontSize: 24,
    color: "#FFFFFF",
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  productDescription: {
    fontSize: 16,
    color: "#B3B3B3",
    lineHeight: 24,
    marginBottom: 20,
    textAlign: "justify",
  },
  attributeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#444",
    paddingBottom: 10,
  },
  attributeLabel: {
    fontSize: 16,
    color: "#B3B3B3",
    fontWeight: "600",
  },
  attributeValue: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  priceAndOrderContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
  },
  productPrice: {
    fontSize: 22,
    color: "#FF4C4C",
    fontWeight: "bold",
  },
  addButton: {
    backgroundColor: "#FF4C4C",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: "center",
  },
  addButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1A1A1A",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 18,
    color: "#FFFFFF",
  },
  errorText: {
    fontSize: 18,
    color: "#FF4C4C",
    textAlign: "center",
    marginTop: 20,
  },
  reviewsContainer: {
    padding: 20,
    backgroundColor: "#2C2C2C",
    borderRadius: 10,
    marginHorizontal: 15,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    color: "#FFFFFF",
    fontWeight: "bold",
    marginBottom: 10,
  },
  noReviewsText: {
    color: "#B3B3B3",
    fontSize: 16,
    textAlign: "center",
  },
  reviewItem: {
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#444",
    paddingBottom: 10,
  },
  reviewText: {
    fontSize: 16,
    color: "#FFFFFF",
  },
  reviewRating: {
    fontSize: 14,
    color: "#FF4C4C",
  },
  addReviewContainer: {
    padding: 20,
    backgroundColor: "#2C2C2C",
    borderRadius: 10,
    marginHorizontal: 15,
    marginTop: 20,
  },
  input: {
    width: "100%",
    padding: 15,
    backgroundColor: "#3A3A3A",
    color: "#FFFFFF",
    borderRadius: 10,
    marginBottom: 15,
  },
  submitButton: {
    backgroundColor: "#FF4C4C",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default ProductScreen;
