import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet } from 'react-native';
import Toast from 'react-native-toast-message';


// Импорт экранов
import WelcomeScreen from '../screens/WelcomeScreen';
import LoginScreen from '../screens/LoginScreen';
import RegistrationScreen from '../screens/RegistrationScreen';
import HomeScreen from '../screens/HomeScreen';
import ProductScreen from '../screens/ProductScreen';
import AdminPanel from '../screens/AdminPanel';
import ProductList from '../screens/ProductList';
import AddProduct from '../screens/AddProduct';
import EditProduct from '../screens/EditProduct';
import UserScreen from '../screens/UserScreen';
import CartScreen from '../screens/CartScreen';


const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const AppNavigator = () => {
  return (
    <>
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="WelcomeScreen"
        screenOptions={{
          headerShown: false,
          gestureEnabled: false,
          cardStyleInterpolator: ({ current }) => ({
            cardStyle: {
              opacity: current.progress,
            },
          }),
        }}
      >
        {/* Обычные экраны */}
        <Stack.Screen name="WelcomeScreen" component={WelcomeScreen} />
        <Stack.Screen name="LoginScreen" component={LoginScreen} />
        <Stack.Screen name="Registration" component={RegistrationScreen} />
        <Stack.Screen name="Home" component={BottomTabNavigator} />
        <Stack.Screen name="Product" component={ProductScreen} />

        {/* Экраны для администратора */}
        <Stack.Screen name="AdminPanel" component={AdminPanel} />
        <Stack.Screen name="ProductList" component={ProductList} />
        <Stack.Screen name="AddProduct" component={AddProduct} />
        <Stack.Screen name="EditProduct" component={EditProduct} />
      </Stack.Navigator>
    </NavigationContainer>
    <Toast />
    </>
  );
};
const BottomTabNavigator = () => {
  return (
    <Tab.Navigator
      initialRouteName="HomeScreen"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'HomeScreen') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'UserScreen') {
            iconName = focused ? 'person' : 'person-outline';
          }

          // Повертаємо іконку
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#FF3B30',
        tabBarInactiveTintColor: '#A2A2A2',
        tabBarStyle: {
          backgroundColor: '#111111',
          borderTopWidth: 0,
          height: 60,
          paddingBottom: 10,
        },
        tabBarShowLabel: false, // Забирає назви екранів
        tabBarHideOnKeyboard: false, // Запобігає прихованню меню
      })}
    >
      <Tab.Screen name="HomeScreen" component={HomeScreen} options={{ headerShown: false }} />
      <Tab.Screen
    name="CartScreen"
    component={CartScreen}
    options={{
        tabBarIcon: ({ color, size }) => <Ionicons name="cart-outline" size={size} color={color} />,
        headerShown: false,
    }}
/>
    <Tab.Screen name="UserScreen" component={UserScreen} options={{ headerShown: false }} />
    </Tab.Navigator>
  );
};


export default AppNavigator;

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#111111',
    borderTopWidth: 0,
  },
  tabBarLabel: {
    fontSize: 12,
    color: '#fff',
  },
});
