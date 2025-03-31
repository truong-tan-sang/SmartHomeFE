import React from 'react';
import { useColorScheme } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import RootNavigator from './navigation/RootNavigator';
import { PaperProvider, MD3DarkTheme, MD3LightTheme, configureFonts } from 'react-native-paper';

const customColors = {
  primary: "#caa26a",   // Màu chính
  onPrimary: "#ffecd1",
  secondary: "#496783",
  onSecondary: "#f5f7fa",
};

export default function App() {
  // Sử dụng hook để lấy màu chủ đề của hệ thống (dark hoặc light)
  const colorScheme = useColorScheme();
  const defaultTheme = colorScheme === 'dark' ? MD3DarkTheme : MD3LightTheme;
  
  // Tạo theme kết hợp giữa theme mặc định của Paper với các màu sắc và fonts tuỳ chỉnh của bạn
  const theme = {
    ...defaultTheme,
    colors: {
      ...defaultTheme.colors,
      ...customColors,
    },
    fonts: configureFonts({ config: { fontFamily: 'Roboto-Regular' } }),
  };

  return (
    <PaperProvider theme={theme}>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </PaperProvider>
  );
}
