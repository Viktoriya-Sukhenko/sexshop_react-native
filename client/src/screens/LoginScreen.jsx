import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "../config/config";
import { colors } from "../assets/global/globalStyles";

const LoginScreen = ({ navigation }) => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Функція для логування даних з AsyncStorage
  const logStoredUser = async () => {
    try {
      const user = await AsyncStorage.getItem("user");
      if (user) {
        console.log("Збережений користувач:", JSON.parse(user));
      } else {
        console.log("Дані про користувача відсутні.");
      }
    } catch (error) {
      console.error("Помилка зчитування даних з AsyncStorage:", error);
    }
  };

  const handleLogin = async () => {
    if (!identifier || !password) {
      Alert.alert("Помилка", "Заповніть всі поля.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ identifier, password }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Відповідь сервера:", errorText);
        Alert.alert("Помилка", "Невірне ім'я користувача або пароль.");
        return;
      }

      const data = await response.json();

      if (data.success) {

        // Збереження даних користувача в AsyncStorage
        await AsyncStorage.setItem("user", JSON.stringify(data.user));

        // Логування збережених даних
        await logStoredUser();

        // Перевірка статусу адміністратора
        if (data.user.is_admin === 1) {
          navigation.replace("AdminPanel", { user: data.user });
        } else {
          navigation.replace("Home", { user: data.user });
        }
      } else {
        Alert.alert("Помилка", data.message || "Не вдалося авторизуватися.");
      }
    } catch (error) {
      console.error("Помилка входу:", error);
      Alert.alert("Помилка", "Виникла помилка при авторизації.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Вітаємо!</Text>

      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Введіть номер телефону або логін"
            placeholderTextColor="#A2A2A2"
            value={identifier}
            onChangeText={setIdentifier}
          />
          <TextInput
            style={styles.input}
            placeholder="Введіть пароль"
            placeholderTextColor="#A2A2A2"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

<TouchableOpacity
  onPress={() => Alert.alert("Увага", "Ця функція знаходиться в розробці.")}
  style={styles.forgotPasswordContainer}
>
  <Text style={styles.forgotPassword}>Забули пароль?</Text>
</TouchableOpacity>


          <View style={styles.loginButtonContainer}>
            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleLogin}
              disabled={loading}
            >
              <Text style={styles.loginButtonText}>
                {loading ? "Завантаження..." : "Ввійти"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.registerContainer} disabled>
              <Text style={styles.registerText}>Немає акаунту?</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => navigation.navigate("Registration")}
              style={styles.registrationButtonContainer}
            >
              <Text style={styles.registrationButton}>Зареєструватися</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background2,
    paddingHorizontal: 20,
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: "center",
  },
  title: {
    fontSize: 35,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
    marginTop: 120,
    marginBottom: 40,
  },
  form: {
    justifyContent: "center",
    alignSelf: "center",
    width: 350,
  },
  input: {
    backgroundColor: "#313131",
    color: "#FFFFFF",
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    fontSize: 16,
    width: "100%",
  },
  forgotPasswordContainer: {
    alignItems: "flex-end",
    marginBottom: 20,
  },
  forgotPassword: {
    color: colors.action,
    fontSize: 14,
  },
  loginButtonContainer: {
    alignItems: "center",
    marginBottom: 30,
    marginTop: 50,
  },
  loginButton: {
    backgroundColor: "#FF3B30",
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 70,
    width: "100%",
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  registerContainer: {
    marginTop: 20,
    alignItems: "center",
  },
  registerText: {
    color: colors.subtext,
    fontSize: 14,
  },
  registrationButtonContainer: {
    marginTop: 10,
    alignItems: "center",
  },
  registrationButton: {
    color: colors.action,
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default LoginScreen;
