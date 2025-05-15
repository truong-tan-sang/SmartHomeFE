// App.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { useColorScheme, ActivityIndicator, View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import RootNavigator from './navigation/RootNavigator';
import { PaperProvider } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppLightTheme, AppDarkTheme } from './styles/theme';

const THEME_STORAGE_KEY = '@app_theme_preference';

export default function App() {
    const systemColorScheme = useColorScheme();
    // Khởi tạo isDarkMode dựa trên system scheme trước, sau đó sẽ load từ storage
    const [isDarkMode, setIsDarkMode] = useState(systemColorScheme === 'dark');
    const [isThemeLoaded, setIsThemeLoaded] = useState(false);

    useEffect(() => {
        const loadThemePreference = async () => {
            try {
                const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
                if (savedTheme !== null) {
                    setIsDarkMode(savedTheme === 'dark');
                } else {
                    // Nếu không có lưu trữ, dùng system default
                    setIsDarkMode(systemColorScheme === 'dark');
                }
            } catch (error) {
                console.error('App.tsx: Error loading theme preference from AsyncStorage:', error);
                // Trong trường hợp lỗi, vẫn dùng system default
                setIsDarkMode(systemColorScheme === 'dark');
            } finally {
                setIsThemeLoaded(true);
            }
        };
        loadThemePreference();
    }, [systemColorScheme]); // Re-check if system theme changes, though AsyncStorage takes precedence

    const toggleTheme = async () => {
        const newThemeIsDark = !isDarkMode;
        setIsDarkMode(newThemeIsDark);
        try {
            await AsyncStorage.setItem(THEME_STORAGE_KEY, newThemeIsDark ? 'dark' : 'light');
            console.log('App.tsx: Theme preference saved:', newThemeIsDark ? 'dark' : 'light');
        } catch (error) {
            console.error('App.tsx: Error saving theme preference to AsyncStorage:', error);
        }
    };

    // Sử dụng useMemo để theme chỉ được tính toán lại khi isDarkMode thay đổi
    const activeTheme = useMemo(() => {
        console.log("App.tsx: Active theme is now:", isDarkMode ? "Dark" : "Light");
        return isDarkMode ? AppDarkTheme : AppLightTheme;
    }, [isDarkMode]);

    if (!isThemeLoaded) {
        // Hiển thị màn hình loading đơn giản trong khi theme đang được tải
        return (
            <View style={appStyles.loadingContainer}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return (
        <PaperProvider theme={activeTheme}>
            {/* Nếu bạn muốn theme của NavigationContainer đồng bộ với PaperProvider,
              bạn cần tạo Navigation themes dựa trên AppLightTheme/AppDarkTheme
              và truyền vào thuộc tính `theme` của NavigationContainer.
              Ví dụ: theme={isDarkMode ? NavigationDarkTheme : NavigationLightTheme}
              Xem ví dụ trong file styles/theme.ts (đã comment lại)
            */}
            <NavigationContainer>
                <RootNavigator toggleTheme={toggleTheme} isDarkMode={isDarkMode} />
            </NavigationContainer>
        </PaperProvider>
    );
}

// Styles cho màn hình loading (không phụ thuộc vào theme)
const appStyles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF', // Màu nền mặc định cho loading
    },
});
