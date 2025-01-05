import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "../config/config";

const UserProfileScreen = ({ navigation }) => {
  const [userData, setUserData] = useState(null);
  const [isModalVisible, setModalVisible] = useState(false);

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // Получение данных пользователя из AsyncStorage
  const fetchUserData = async () => {
    try {
      const user = await AsyncStorage.getItem("user");
      if (user) {
        setUserData(JSON.parse(user));
      }
    } catch (error) {
      console.error("Ошибка получения данных из AsyncStorage:", error);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  // Выход из аккаунта
  const handleLogout = async () => {
    Alert.alert("Вихід з аккаунту", "Ви впевнені, що хочете вийти?", [
      { text: "Скасувати", style: "cancel" },
      {
        text: "Вийти",
        style: "destructive",
        onPress: async () => {
          await AsyncStorage.removeItem("user");
          navigation.replace("LoginScreen");
        },
      },
    ]);
  };

  // Смена пароля
  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword) {
      Alert.alert("Помилка", "Заповніть усі поля!");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userData.user_id, // Передача user_id
          oldPassword,
          newPassword,
        }),
      });

      const responseData = await response.json();

      if (response.ok) {
        Alert.alert("Успіх", "Пароль успішно змінено!");
        setModalVisible(false);
        setOldPassword("");
        setNewPassword("");
      } else {
        Alert.alert(
          "Помилка",
          `Не вдалося змінити пароль: ${
            responseData.message || "Невідома помилка"
          }`
        );
      }
    } catch (error) {
      console.error("Помилка підключення до сервера:", error);
      Alert.alert("Помилка", "Помилка підключення до сервера");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Профіль</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>
            {userData ? userData.username : "Завантаження..."}
          </Text>
          <Text style={styles.profilePhone}>
            {userData ? userData.phone : ""}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="lock-closed" size={20} color="#fff" />
          <Text style={styles.actionButtonText}>Змінити пароль</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={handleLogout}>
          <Ionicons name="log-out" size={20} color="#fff" />
          <Text style={styles.actionButtonText}>Вийти з аккаунту</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={isModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Змінити пароль</Text>

            <TextInput
              style={styles.input}
              placeholder="Старий пароль"
              placeholderTextColor="#A2A2A2"
              secureTextEntry
              value={oldPassword}
              onChangeText={setOldPassword}
            />

            <TextInput
              style={styles.input}
              placeholder="Новий пароль"
              placeholderTextColor="#A2A2A2"
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
            />

            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Скасувати</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={handleChangePassword}
              >
                <Text style={styles.modalButtonText}>Змінити</Text>
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
    backgroundColor: "#1C1C1C", // Современный серый фон
  },
  header: {
    paddingVertical: 30,
    paddingHorizontal: 15,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#444444", // Добавляем линию для разделения
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 2,
  },
  content: {
    padding: 20,
    flex: 1,
  },
  profileInfo: {
    alignItems: "center",
    marginBottom: 30,
    padding: 15,
    backgroundColor: "#292929",
    borderRadius: 15,
    elevation: 3,
  },
  profileName: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "700",
  },
  profilePhone: {
    color: "#A2A2A2",
    fontSize: 18,
    marginTop: 5,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    paddingHorizontal: 10,
    backgroundColor: "#3A3A3A",
    borderRadius: 12,
    marginBottom: 15,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center", // Центрування по вертикалі
    alignItems: "center", // Центрування по горизонталі
    backgroundColor: "rgba(0, 0, 0, 0.8)", // Затемнення позаду
  },
  modalContent: {
    width: "85%",
    padding: 25,
    backgroundColor: "#292929",
    borderRadius: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    width: "100%",
    padding: 15,
    backgroundColor: "#373737",
    borderRadius: 12,
    color: "#FFFFFF",
    marginBottom: 20, // Відступ між інпутами та кнопками
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#555555",
  },
  modalButtonContainer: {
    flexDirection: "row", // Розміщення кнопок по горизонталі
    justifyContent: "space-between", // Розподіл простору між кнопками
    width: "100%",
  },
  modalButton: {
    flex: 1,
    paddingVertical: 15,
    backgroundColor: "#FF4C4C",
    borderRadius: 12,
    alignItems: "center",
    marginHorizontal: 5, // Відступ між кнопками
    elevation: 5,
  },
  modalButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  cancelButton: {
    backgroundColor: "#444444",
  },
});

export default UserProfileScreen;
