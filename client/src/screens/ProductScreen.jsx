import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Image,
  ScrollView,
  Modal,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "../config/config";

const ProductScreen = ({ route }) => {
  const { product_id } = route.params;
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [orderData, setOrderData] = useState({
    phone_number: "",
    address: "",
    payment_method_id: null,
  });

  const [userId, setUserId] = useState(null);
  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const user = await AsyncStorage.getItem("user");
        if (user) {
          const parsedUser = JSON.parse(user);
          setUserId(parsedUser.user_id);
        }
      } catch (error) {
        console.error("Ошибка извлечения user_id из AsyncStorage:", error);
      }
    };

    fetchUserId();
  }, []);
  // Завантаження деталей продукту
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

    fetchProductDetails();
  }, [product_id]);

  // Завантаження способів оплати
  useEffect(() => {
    const fetchPaymentMethods = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/payment_methods`);
        if (!response.ok) {
          throw new Error("Помилка завантаження способів оплати.");
        }
        const data = await response.json();
        setPaymentMethods(data);
        if (data.length > 0) {
          setOrderData((prev) => ({
            ...prev,
            payment_method_id: data[0].payment_method_id,
          }));
        }
      } catch (error) {
        Alert.alert("Помилка", "Не вдалося завантажити способи оплати.");
      }
    };

    fetchPaymentMethods();
  }, []);

  const handleOrderSubmit = async () => {
    try {
      if (
        !orderData.phone_number ||
        !orderData.address ||
        !orderData.payment_method_id
      ) {
        Alert.alert("Помилка", "Будь ласка, заповніть усі поля.");
        return;
      }

      const payload = {
        user_id: userId,
        product_id: product.product_id,
        price: product.price,
        phone_number: orderData.phone_number,
        address: orderData.address,
        payment_method_id: orderData.payment_method_id,
      };

      const response = await fetch(`${API_BASE_URL}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Не вдалося створити замовлення.");
      }

      Alert.alert("Успіх", "Ваше замовлення успішно оформлено!");
      setModalVisible(false);
    } catch (error) {
      Alert.alert("Помилка", error.message);
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
        <View style={styles.attributeRow}>
          <Text style={styles.attributeLabel}>Категорія:</Text>
          <Text style={styles.attributeValue}>{product.category_name}</Text>
        </View>
        <View style={styles.attributeRow}>
          <Text style={styles.attributeLabel}>Колір:</Text>
          <Text style={styles.attributeValue}>{product.color_name}</Text>
        </View>
        <View style={styles.attributeRow}>
          <Text style={styles.attributeLabel}>Країна:</Text>
          <Text style={styles.attributeValue}>{product.country_name}</Text>
        </View>
        <View style={styles.attributeRow}>
          <Text style={styles.attributeLabel}>Розмір:</Text>
          <Text style={styles.attributeValue}>{product.size_name}</Text>
        </View>
        <View style={styles.attributeRow}>
          <Text style={styles.attributeLabel}>На складі:</Text>
          <Text style={styles.attributeValue}>{product.stock} шт.</Text>
        </View>
        <View style={styles.priceAndOrderContainer}>
  <Text style={styles.productPrice}>₴ {product.price}</Text>
  <TouchableOpacity
    style={styles.orderButton}
    onPress={() => setModalVisible(true)}
  >
    <Text style={styles.orderButtonText}>Замовити зараз</Text>
  </TouchableOpacity>
</View>

      </View>

      <Modal visible={isModalVisible} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Оформлення замовлення</Text>
            <TextInput
              style={styles.input}
              placeholder="Ваш номер телефону"
              placeholderTextColor="#A2A2A2"
              keyboardType="phone-pad"
              value={orderData.phone_number}
              onChangeText={(text) =>
                setOrderData({ ...orderData, phone_number: text })
              }
            />
            <TextInput
              style={styles.input}
              placeholder="Адреса доставки"
              placeholderTextColor="#A2A2A2"
              value={orderData.address}
              onChangeText={(text) =>
                setOrderData({ ...orderData, address: text })
              }
            />
            <ScrollView horizontal style={styles.paymentRow}>
              {paymentMethods.map((method) => (
                <TouchableOpacity
                  key={method.payment_method_id}
                  style={[
                    styles.paymentMethodButton,
                    orderData.payment_method_id === method.payment_method_id &&
                      styles.selectedPaymentMethod,
                  ]}
                  onPress={() =>
                    setOrderData({
                      ...orderData,
                      payment_method_id: method.payment_method_id,
                    })
                  }
                >
                  <Text
                    style={[
                      styles.paymentMethodText,
                      orderData.payment_method_id ===
                        method.payment_method_id &&
                        styles.selectedPaymentMethodText,
                    ]}
                  >
                    {method.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Скасувати</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.submitButton]}
                onPress={handleOrderSubmit}
              >
                <Text style={styles.modalButtonText}>Підтвердити</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
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
  productPrice: {
    fontSize: 22,
    color: "#FF4C4C",
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  orderButton: {
    backgroundColor: "#FF4C4C",
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },
  orderButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.9)",
  },
  modalContent: {
    width: "90%",
    backgroundColor: "#2C2C2C",
    borderRadius: 20,
    padding: 25,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 22,
    color: "#FFFFFF",
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    width: "100%",
    padding: 15,
    backgroundColor: "#3A3A3A",
    color: "#FFFFFF",
    borderRadius: 10,
    marginBottom: 20,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#555",
  },
  paymentRow: {
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  paymentMethodButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: "#3A3A3A",
    borderRadius: 12,
    marginRight: 10,
    alignItems: "center",
  },
  selectedPaymentMethod: {
    backgroundColor: "#FF4C4C",
  },
  paymentMethodText: {
    color: "#B3B3B3",
    fontSize: 16,
  },
  selectedPaymentMethodText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  modalButton: {
    flex: 0.48,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#555",
  },
  submitButton: {
    backgroundColor: "#FF4C4C",
  },
  modalButtonText: {
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
  priceAndOrderContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
    paddingHorizontal: 10, // Відступи зліва та справа
  },
  productPrice: {
    fontSize: 22,
    color: "#FF4C4C",
    fontWeight: "bold",
    marginRight: 55, // Відступ між ціною і кнопкою
  },
  orderButton: {
    backgroundColor: "#FF4C4C",
    paddingVertical: 10,
    paddingHorizontal: 20, // Ширина кнопки
    borderRadius: 12,
    alignItems: "center",
  },
  orderButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  
});

export default ProductScreen;
