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
import { LinearGradient } from "expo-linear-gradient";
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
      // Перевіряємо, чи завантажено продукт і чи є ID
      if (!product || !product.id) {
        Alert.alert("Помилка", "Продукт не завантажено або відсутній ID продукту.");
        return;
      }
  
      const payload = {
        user_id: 1, // Замініть на фактичний ID користувача
        product_id: product.id, // ID продукту
        price: product.price, // Ціна продукту
        phone_number: orderData.phone_number,
        address: orderData.address,
        payment_method_id: orderData.payment_method_id,
      };
  
      console.log("Дані, які відправляються на сервер:", payload);
  
      const response = await fetch(`${API_BASE_URL}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Сервер повернув помилку:", errorData);
        throw new Error(errorData.error || "Не вдалося створити замовлення.");
      }
  
      const data = await response.json();
      Alert.alert("Успіх", "Ваше замовлення успішно оформлено!");
      setModalVisible(false);
    } catch (error) {
      console.error("Помилка під час створення замовлення:", error.message);
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
      <LinearGradient
        colors={["#111111", "#313131"]}
        style={styles.headerGradient}
      >
        <Text style={styles.productName}>{product.name}</Text>
      </LinearGradient>
      <Image source={{ uri: imageUrl }} style={styles.productImage} />
      <View style={styles.detailsContainer}>
        <Text style={styles.productPrice}>₴ {product.price}</Text>
        <Text style={styles.productDescription}>{product.description}</Text>
        <View style={styles.extraDetails}>
          <Text style={styles.extraText}>На складі: {product.stock} шт.</Text>
          <Text style={styles.extraText}>
            Категорія ID: {product.category_id}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.orderButton}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.orderButtonText}>Замовити зараз</Text>
        </TouchableOpacity>
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
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.paymentRow}
            >
              {paymentMethods.map((method) => (
                <TouchableOpacity
                  key={`method-${method.payment_method_id}`}
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
    backgroundColor: "#111111",
  },
  headerGradient: {
    paddingVertical: 20,
    paddingHorizontal: 15,
    alignItems: "center",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 15,
  },
  productName: {
    fontSize: 24,
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },
  productImage: {
    width: "100%",
    height: 250,
    resizeMode: "contain",
    marginBottom: 15,
  },
  detailsContainer: {
    padding: 20,
    backgroundColor: "#313131",
    borderRadius: 15,
    marginHorizontal: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  productPrice: {
    fontSize: 22,
    color: "#FF3B30",
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  productDescription: {
    fontSize: 16,
    color: "#a2a2a2",
    lineHeight: 24,
    marginBottom: 20,
    textAlign: "center",
  },
  extraDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#555",
  },
  extraText: {
    fontSize: 14,
    color: "#a2a2a2",
  },
  orderButton: {
    backgroundColor: "#FF3B30",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  orderButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.8)",
  },
  modalContent: {
    width: "90%",
    backgroundColor: "#1c1c1c",
    borderRadius: 15,
    padding: 20,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    color: "#fff",
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    width: "100%",
    padding: 15,
    backgroundColor: "#313131",
    color: "#fff",
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#555",
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
    backgroundColor: "#FF3B30",
  },
  modalButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  paymentLabel: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  paymentMethodButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: "#313131", // Неактивний стан
    borderRadius: 10,
    marginRight: 10,
    alignItems: "center",
  },
  selectedPaymentMethod: {
    backgroundColor: "#FF3B30", // Активний стан
  },
  paymentMethodText: {
    color: "#A2A2A2", // Текст для неактивного стану
    fontSize: 16,
  },
  paymentRow: {
    marginBottom: 20, // Збільшуємо відступ між списком варіантів оплати і кнопками
    paddingHorizontal: 10, // Додаємо горизонтальний відступ для прокрутки
  },
  
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 20, // Збільшуємо відступ між списком оплати і кнопками
  },
  
  selectedPaymentMethodText: {
    color: "#fff", // Текст для активного стану
    fontWeight: "bold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#111111",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#fff",
  },
  errorText: {
    fontSize: 18,
    color: "red",
    textAlign: "center",
    marginTop: 20,
  },
});

export default ProductScreen;
