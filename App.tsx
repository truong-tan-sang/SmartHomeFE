//App.tsx

import React, { useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import RootNavigator from './navigation/RootNavigator';
import { 
  PaperProvider, 
  MD3DarkTheme, 
  MD3LightTheme, 
  configureFonts,
  adaptNavigationTheme
} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Tạo theme tùy chỉnh cho cả light và dark mode
const lightColors = {
  primary: "#caa26a",
  primaryVariant: "#dac296",
  onPrimary: "#ffffff",
  secondary: "#496783",
  onSecondary: "#ffffff",
  background: "#ffffff",
  surface: "#f5f5f5",
  onSurface: "#1e1e1e",
  text: "#1e1e1e",
  error: "#aa0000",
  outline: '#79747E', // Màu viền mặc định của MD3 light, có thể giữ hoặc đổi
  onSurfaceVariant: '#49454F', // Màu label/placeholder mặc định của MD3 light, có thể giữ hoặc đổi
  // placeholder: '#757575', // key này ít dùng hơn trong MD3, onSurfaceVariant quan trọng hơn

};

const darkColors = {
  primary: "#caa26a",
  onPrimary: "#ffecd1",
  secondary: "#6b8ba4",
  onSecondary: "#0d1a26",
  background: "#121212",
  surface: "#1e1e1e",
  text: "#fcfcfc",
  onSurface: "#fcfcfc",
  error: "#cc1111",
  outline: '#948F99', // Màu xám nhạt cho đường viền TextInput khi unfocused (có thể điều chỉnh)
  onSurfaceVariant: '#CAC4CF',
  placeholder: '#BDBDBD', // Có thể bỏ key này nếu dùng onSurfaceVariant
  highlight:"#322222"

};

export default function App() {
  const systemColorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(systemColorScheme === 'dark');
  const [isThemeLoaded, setIsThemeLoaded] = useState(false);

  // Load theme từ AsyncStorage khi khởi động
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('theme');
        if (savedTheme) {
          setIsDarkMode(savedTheme === 'dark');
        }
      } catch (error) {
        console.error('Error loading theme:', error);
      } finally {
        setIsThemeLoaded(true);
      }
    };
    
    loadTheme();
  }, []);

  // Lưu theme khi thay đổi
  const toggleTheme = async () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    try {
      await AsyncStorage.setItem('theme', newTheme ? 'dark' : 'light');
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  // Tạo theme động
  const theme = {
    ...(isDarkMode ? MD3DarkTheme : MD3LightTheme),
    colors: {
      ...(isDarkMode ? darkColors : lightColors),
    },
    fonts: configureFonts({ config: { fontFamily: 'Roboto-Regular' } }),
    // Thêm các thuộc tính tùy chỉnh khác nếu cần
    // roundness: 8,
    // animation: {
    //   scale: 1.0,
    // },
  };

  if (!isThemeLoaded) {
    return null; // Hoặc hiển thị loading screen
  }

  return (
    <PaperProvider theme={theme}>
      <NavigationContainer theme={theme}>
        <RootNavigator toggleTheme={toggleTheme} isDarkMode={isDarkMode} />
      </NavigationContainer>
    </PaperProvider>
  );
}