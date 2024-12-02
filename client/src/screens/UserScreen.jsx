import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

const UserProfileScreen = ({ navigation }) => {
  const [userData, setUserData] = useState(null); // Стан для збереження даних користувача

  // Функція для отримання даних з AsyncStorage
  const fetchUserData = async () => {
    try {
      const user = await AsyncStorage.getItem("user");
      if (user) {
        setUserData(JSON.parse(user));
      }
    } catch (error) {
      console.error("Помилка отримання даних з AsyncStorage:", error);
    }
  };

  // Викликається при завантаженні екрану
  useEffect(() => {
    fetchUserData();
  }, []);

  // Функція для виходу з аккаунту
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

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={["#111111", "#313131"]}
        style={styles.headerGradient}
      >
        <Text style={styles.headerTitle}>Профіль</Text>
      </LinearGradient>

      <View style={styles.content}>
        {/* Інформація про користувача */}
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>
            {userData ? userData.username : "Завантаження..."}
          </Text>
          <Text style={styles.profilePhone}>
            {userData ? userData.phone : ""}
          </Text>
        </View>

        {/* Кнопка "Змінити пароль" */}
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate("ChangePassword")}
        >
          <Ionicons name="lock-closed" size={20} color="#fff" />
          <Text style={styles.actionButtonText}>Змінити пароль</Text>
        </TouchableOpacity>

        {/* Кнопка "Вийти з аккаунту" */}
        <TouchableOpacity style={styles.actionButton} onPress={handleLogout}>
          <Ionicons name="log-out" size={20} color="#fff" />
          <Text style={styles.actionButtonText}>Вийти з аккаунту</Text>
        </TouchableOpacity>
      </View>
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
    alignItems: "center",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },
  content: {
    padding: 15,
  },
  profileInfo: {
    marginBottom: 20,
  },
  profileName: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
  },
  profilePhone: {
    color: "#A2A2A2",
    fontSize: 16,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#222222",
    borderRadius: 10,
    marginBottom: 10,
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 16,
    marginLeft: 10,
  },
});

export default UserProfileScreen;
