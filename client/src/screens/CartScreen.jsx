import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "../config/config";
import { useFocusEffect } from "@react-navigation/native";
import Toast from "react-native-toast-message";
import { SafeAreaView } from "react-native-safe-area-context";
import { KeyboardAvoidingView, Platform } from "react-native";

const CartScreen = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setModalVisible] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [orderData, setOrderData] = useState({
    phone_number: "",
    address: "",
    payment_method_id: null,
  });

  const fetchCartItems = async () => {
    setLoading(true);
    try {
      const user = await AsyncStorage.getItem("user");
      if (!user) {
        console.error("Користувач не знайдений в AsyncStorage");
        setCartItems([]);
        return;
      }

      const parsedUser = JSON.parse(user);
      const cartId = parsedUser.cart_id;

      if (!cartId) {
        console.error("cart_id не знайдено для користувача.");
        setCartItems([]);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/cart/${cartId}`);
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Помилка сервера:", errorText);
        setCartItems([]);
        return;
      }

      const data = await response.json();
      setCartItems(data.length > 0 ? data : []);
    } catch (error) {
      console.error("Помилка завантаження корзини:", error.message);
    } finally {
      setLoading(false);
    }
  };

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

      const user = await AsyncStorage.getItem("user");
      if (!user) {
        Alert.alert("Помилка", "Не вдалося отримати дані користувача.");
        return;
      }

      const parsedUser = JSON.parse(user);
      const payload = {
        user_id: parsedUser.user_id,
        cart_items: cartItems,
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
      setCartItems([]);
      setModalVisible(false);
    } catch (error) {
      Alert.alert("Помилка", error.message);
    }
  };

  const handleQuantityChange = async (cartItemId, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      const response = await fetch(`${API_BASE_URL}/cart/${cartItemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: newQuantity }),
      });
      if (response.ok) {
        await fetchCartItems();
        Toast.show({
          type: "success",
          text1: "Кількість оновлено",
          text2: `Нову кількість встановлено: ${newQuantity}`,
        });
      } else {
        console.error("Помилка оновлення кількості:", await response.text());
      }
    } catch (error) {
      console.error("Помилка оновлення кількості:", error.message);
    }
  };

  const handleRemoveItem = async (cartItemId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/cart/${cartItemId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        await fetchCartItems();
        Toast.show({
          type: "success",
          text1: "Товар видалено",
          text2: "Товар успішно видалено з корзини",
        });
      } else {
        console.error("Помилка видалення товару:", await response.text());
      }
    } catch (error) {
      console.error("Помилка видалення товару:", error.message);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchCartItems();
      fetchPaymentMethods();
    }, [])
  );

  const renderCartItem = ({ item }) => (
    <View style={styles.cartItem}>
      <Image
        source={{ uri: `${API_BASE_URL}/uploads/${item.image_url}` }}
        style={styles.productImage}
      />
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productPrice}>₴ {item.price}</Text>
        <View style={styles.quantityControls}>
          <TouchableOpacity
            onPress={() =>
              handleQuantityChange(item.cart_item_id, item.quantity - 1)
            }
          >
            <Ionicons name="remove-circle-outline" size={24} color="#FF4C4C" />
          </TouchableOpacity>
          <Text style={styles.quantity}>{item.quantity}</Text>
          <TouchableOpacity
            onPress={() =>
              handleQuantityChange(item.cart_item_id, item.quantity + 1)
            }
          >
            <Ionicons name="add-circle-outline" size={24} color="#FF4C4C" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleRemoveItem(item.cart_item_id)}
            style={styles.removeButton}
          >
            <Ionicons name="trash-outline" size={24} color="#FF4C4C" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.container}>
          <Text style={styles.headerText}>Корзина</Text>
          <FlatList
            data={cartItems}
            keyExtractor={(item) => item.cart_item_id.toString()}
            renderItem={renderCartItem}
            ListEmptyComponent={
              <Text style={styles.emptyText}>Ваша корзина порожня.</Text>
            }
          />
          {cartItems.length > 0 && (
            <TouchableOpacity
              style={styles.orderButton}
              onPress={() => setModalVisible(true)}
            >
              <Text style={styles.orderButtonText}>Оформити замовлення</Text>
            </TouchableOpacity>
          )}

          <Modal
            visible={isModalVisible}
            transparent={true}
            animationType="slide"
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Оформлення замовлення</Text>

                {/* Список товарів у замовленні */}
                <ScrollView
                  style={styles.cartItemsList}
                  nestedScrollEnabled={true}
                >
                  {cartItems.map((item) => (
                    <View key={item.cart_item_id} style={styles.cartItemModal}>
                      <Text style={styles.cartItemText}>{item.name}</Text>
                      <View style={styles.cartItemPriceQuantity}>
                        <Text style={styles.priceText}>
                          Ціна: ₴{item.price}
                        </Text>
                        <Text style={styles.quantityText}>
                          Кількість: {item.quantity}
                        </Text>
                      </View>
                    </View>
                  ))}
                </ScrollView>

                {/* Загальна сума */}
                <View style={styles.totalContainer}>
                  <Text style={styles.totalText}>Загальна сума:</Text>
                  <Text style={styles.totalAmount}>
                    ₴
                    {cartItems
                      .reduce(
                        (sum, item) => sum + item.quantity * item.price,
                        0
                      )
                      .toFixed(2)}
                  </Text>
                </View>

                {/* Поле для введення телефону */}
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

                {/* Поле для введення адреси */}
                <TextInput
                  style={styles.input}
                  placeholder="Адреса доставки"
                  placeholderTextColor="#A2A2A2"
                  value={orderData.address}
                  onChangeText={(text) =>
                    setOrderData({ ...orderData, address: text })
                  }
                />

                {/* Вибір способу оплати */}
                <ScrollView
                  horizontal
                  style={styles.paymentRow}
                  nestedScrollEnabled={true}
                >
                  {paymentMethods.map((method) => (
                    <TouchableOpacity
                      key={method.payment_method_id}
                      style={[
                        styles.paymentMethodButton,
                        orderData.payment_method_id ===
                          method.payment_method_id &&
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

                {/* Кнопки управління */}
                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={() => setModalVisible(false)}
                  >
                    <Text style={styles.modalButtonText}>Скасувати</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.modalButton,
                      styles.submitButton,
                      !orderData.phone_number ||
                      !orderData.address ||
                      !orderData.payment_method_id
                        ? styles.disabledButton
                        : {},
                    ]}
                    onPress={handleOrderSubmit}
                    disabled={
                      !orderData.phone_number ||
                      !orderData.address ||
                      !orderData.payment_method_id
                    }
                  >
                    <Text style={styles.modalButtonText}>Підтвердити</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#111111",
  },

  container: {
    flex: 1,
    backgroundColor: "#111111",
    paddingHorizontal: 10,
  },
  headerText: {
    fontSize: 24,
    color: "#FFFFFF",
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 15, // Відступи зверху та знизу
  },

  cartItem: {
    flexDirection: "row",
    marginBottom: 15,
    backgroundColor: "#222222",
    borderRadius: 12,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
  },
  productInfo: {
    flex: 1,
    marginLeft: 15,
  },
  productName: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  productPrice: {
    color: "#FF4C4C",
    fontSize: 16,
    marginBottom: 5,
  },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    justifyContent: "space-between", // Додає простір між елементами
  },

  quantity: {
    color: "#FFFFFF",
    fontSize: 16,
    marginHorizontal: 10,
  },
  removeButton: {
    marginLeft: 90, // Відступ зліва від лічильника кількості
    alignSelf: "center", // Вирівнювання по центру вертикально
  },

  emptyText: {
    color: "#A2A2A2",
    fontSize: 18,
    textAlign: "center",
    marginTop: 20,
  },
  summaryContainer: {
    padding: 15,
    backgroundColor: "#222222",
    borderRadius: 12,
    marginTop: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  summaryText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
  },
  totalAmount: {
    color: "#FF4C4C",
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "right",
  },
  orderButton: {
    backgroundColor: "#FF4C4C",
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
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
    maxHeight: "80%",
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
  },
  input: {
    width: "100%",
    padding: 15,
    backgroundColor: "#3A3A3A",
    color: "#FFFFFF",
    borderRadius: 10,
    marginBottom: 20,
  },
  cartItemsList: {
    maxHeight: 150,
    marginBottom: 20,
    width: "100%",
  },
  cartItemModal: {
    flexDirection: "column",
    alignItems: "flex-start",
    marginBottom: 10,
    padding: 10,
    backgroundColor: "#333",
    borderRadius: 10,
    width: "100%",
    overflow: "hidden",
  },
  cartItemText: {
    color: "#FFF",
    fontSize: 14,
    marginBottom: 5,
  },
  cartItemPriceQuantity: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  priceText: {
    color: "#FF4C4C",
    fontSize: 14,
  },
  quantityText: {
    color: "#FFF",
    fontSize: 14,
  },
  totalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    width: "100%",
  },
  totalText: {
    fontSize: 18,
    color: "#FFF",
    fontWeight: "bold",
  },
  paymentRow: {
    marginBottom: 20,
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
  },
  paymentMethodButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: "#3A3A3A",
    borderRadius: 12,
    marginRight: 10,
    marginBottom: 10,
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
  disabledButton: {
    backgroundColor: "#555",
  },
});

export default CartScreen;
