// navigation/RootNavigator.tsx
import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native'; 
import { useTheme } from 'react-native-paper';
import AuthNavigator from './AuthNavigator';
import AppNavigator from './AppNavigator';
import { useAuthStore } from '../store/authStore';

interface RootNavigatorProps {
    toggleTheme: () => void;
    isDarkMode: boolean;
}

export default function RootNavigator({ toggleTheme, isDarkMode }: RootNavigatorProps) {
    const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
    const isLoading = useAuthStore((state) => state.isLoading);
    const theme = useTheme();

    if (isLoading) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }
    
    return isLoggedIn ? (
        <AppNavigator toggleTheme={toggleTheme} isDarkMode={isDarkMode} />
    ) : (
        <AuthNavigator />
    );
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
