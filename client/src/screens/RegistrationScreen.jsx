import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../components/Button';
import { colors } from '../assets/global/globalStyles';
import { API_BASE_URL } from "../config/config";

const RegistrationScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleRegister = async () => {
    // Проверяем заполненность всех полей и совпадение паролей
    if (!username || !phone || !password) {
      alert('Будь ласка, заповніть усі поля');
      return;
    }

    if (password !== confirmPassword) {
      alert('Паролі не співпадають');
      return;
    }

    try {
      // Отправляем запрос на сервер
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, phone, password }),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        alert(data.error || 'Помилка реєстрації');
        return;
      }

      // Если успешно, перенаправляем пользователя на экран входа
      alert('Ви успішно зареєструвались!');
      navigation.navigate('LoginScreen');
    } catch (error) {
      console.error('Помилка реєстрації:', error.message);
      alert('Не вдалося підключитися до сервера');
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <SafeAreaView style={styles.container}>
          <ScrollView
            contentContainerStyle={styles.scrollViewContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Заголовок */}
            <Text style={styles.title}>Реєстрація</Text>

            {/* Форма ввода */}
            <View style={styles.form}>
              <TextInput
                style={styles.input}
                placeholder="Логін"
                placeholderTextColor="#A2A2A2"
                value={username}
                onChangeText={setUsername}
              />
              <TextInput
                style={styles.input}
                placeholder="Номер телефону"
                placeholderTextColor="#A2A2A2"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
              <TextInput
                style={styles.input}
                placeholder="Введіть пароль"
                placeholderTextColor="#A2A2A2"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
              <TextInput
                style={styles.input}
                placeholder="Підтвердіть пароль"
                placeholderTextColor="#A2A2A2"
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />

              {/* Кнопка "Зареєструватися" */}
              <Button
                title="Зареєструватися"
                onPress={handleRegister}
                style={{ marginTop: 45 }}
              />

              {/* Кнопка "Ввійти" */}
              <View style={styles.loginContainer}>
                <Text style={styles.loginText}>Вже маєте акаунт?</Text>
                <TouchableOpacity onPress={() => navigation.navigate('LoginScreen')}>
                  <Text style={styles.loginButton}>Ввійти</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
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
    justifyContent: 'center',
  },
  title: {
    fontSize: 35,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 50,
  },
  form: {
    justifyContent: 'center',
    alignSelf: 'center',
    width: 350,
  },
  input: {
    backgroundColor: '#313131',
    color: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    fontSize: 16,
    width: '100%',
  },
  loginContainer: {
    marginTop: 80,
    alignItems: 'center',
  },
  loginText: {
    color: colors.subtext,
    fontSize: 14,
    marginBottom: 15,
  },
  loginButton: {
    color: colors.action,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default RegistrationScreen;
