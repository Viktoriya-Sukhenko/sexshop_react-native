import React from 'react';
import { Text } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';

// Импорт навигации
import AppNavigator from './src/navigation/AppNavigator';

// Задержка экрана загрузки
SplashScreen.preventAutoHideAsync();

export default function App() {
  // Подключение шрифтов Montserrat
  const [fontsLoaded] = useFonts({
    'Montserrat-Regular': require('./src/assets/fonts/Montserrat-Regular.ttf'),
    'Montserrat-Medium': require('./src/assets/fonts/Montserrat-Medium.ttf'),
    'Montserrat-SemiBold': require('./src/assets/fonts/Montserrat-SemiBold.ttf'),
  });

  // Если шрифты не загружены, не показываем интерфейс
  if (!fontsLoaded) {
    return null;
  }

  // Скрываем экран загрузки после загрузки шрифтов
  SplashScreen.hideAsync();

  // Устанавливаем шрифт по умолчанию
  const defaultTextProps = Text.defaultProps || {};
  Text.defaultProps = {
    ...defaultTextProps,
    style: [defaultTextProps.style, { fontFamily: 'Montserrat-Regular' }],
  };

  return <AppNavigator />;
}
