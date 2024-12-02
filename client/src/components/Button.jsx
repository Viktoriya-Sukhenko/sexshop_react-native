import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors } from '../assets/global/globalStyles';

const Button = ({ title, onPress, style, textStyle }) => {
  return (
    <TouchableOpacity
      style={[styles.button, style]} // Глобальный стиль + пользовательский
      onPress={onPress}
    >
      <Text style={[styles.text, textStyle]}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    alignSelf: 'center',
    width: 350, // Фиксированная ширина
    height: 56, // Фиксированная высота
    backgroundColor: colors.action, // Цвет действия
    borderRadius: 16, // Радиус скругления
    alignItems: 'center', // Центрируем текст по горизонтали
    justifyContent: 'center', // Центрируем текст по вертикали
  },
  text: {
    color: colors.background, // Цвет текста (белый)
    fontSize: 16, // Размер текста
    fontWeight: 'bold', // Жирный шрифт
    textAlign: 'center', // Выравнивание текста по центру
  },
});

export default Button;
