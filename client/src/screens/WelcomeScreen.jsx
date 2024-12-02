import React from 'react';
import { View, Text, StyleSheet, ImageBackground } from 'react-native';
import Button from '../components/Button';
import { colors } from '../assets/global/globalStyles';

const WelcomeScreen = ({ navigation }) => {
  return (
    <ImageBackground
      source={require('../assets/WelcomeScreen/welcome-image.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <Text style={styles.title}>Занурься у світ задоволення!</Text>
        <Text style={styles.subtitle}>
          Відкрий нові грані своєї фантазії та досліджуй найінтимніші бажання в нашому унікальному просторі.
        </Text>
        <Button
          title="Почати"
          onPress={() => navigation.navigate('LoginScreen')} // Переход на экран LoginScreen
        />
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1, // Занимает весь экран
  },
  overlay: {
    flex: 1,
    justifyContent: 'flex-end', // Перенос содержимого вниз
    alignItems: 'center',
    padding: 20, // Отступ от краёв
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.white,
    textAlign: 'center',
    marginBottom: 40,
  },
  subtitle: {
    fontSize: 16,
    color: colors.subtext,
    textAlign: 'center',
    marginBottom: 70,
    lineHeight: 22,
  },
});

export default WelcomeScreen;
