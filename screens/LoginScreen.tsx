// screens/LoginScreen.tsx
import React, { useState } from "react";
import { StyleSheet, View, Alert } from "react-native";
import { Text, TextInput, Button, ActivityIndicator, useTheme } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import { AuthStackParamList } from '../navigation/AuthNavigator';
import * as Components from "../components"; // Giả sử bạn có BackButton trong này
import { useAuthStore } from "../store/authStore";

type LoginScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Login'>;

export default function LoginScreen() {
    const navigation = useNavigation<LoginScreenNavigationProp>();
    const theme = useTheme();
    const [email, setEmail] = useState(""); 
    const [password, setPassword] = useState("");
    const [isLoggingIn, setIsLoggingIn] = useState(false);

    const loginAction = useAuthStore((state) => state.login);

    async function handleLogin() {
        if (!email.trim() || !password.trim()) {
            Alert.alert("Lỗi", "Vui lòng nhập email và mật khẩu.");
            return;
        }

        setIsLoggingIn(true);
        console.log(`[LoginScreen] Attempting to login with email: ${email}`);
        try {
            await loginAction(email, password);
            console.log("[LoginScreen] Login API call successful. Token should be stored and user navigated.");
            // RootNavigator sẽ tự động xử lý việc chuyển màn hình nếu đăng nhập thành công
        } catch (error: unknown) { // Explicitly type error as unknown
            console.error("[LoginScreen] Login API call failed or error in login action:", error);
            
            // Type guard to safely access message property
            const errorMessage = error instanceof Error 
                ? error.message 
                : "Email hoặc mật khẩu không đúng hoặc đã có lỗi xảy ra. Vui lòng thử lại.";

            Alert.alert(
                "Đăng nhập thất bại",
                errorMessage
            );
        } finally {
            setIsLoggingIn(false);
        }
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            {/* Giả sử BackButton được render ở đây nếu cần, hoặc trong AuthNavigator */}
            {/* <Components.BackButton /> */}
            <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.primary }]}>Đăng Nhập</Text>
            <TextInput
                label="Email"
                mode="outlined"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
                style={styles.input}
                autoCapitalize="none"
                disabled={isLoggingIn}
            />
            <TextInput
                label="Mật khẩu"
                mode="outlined"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                style={styles.input}
                disabled={isLoggingIn}
            />
            {isLoggingIn && <ActivityIndicator animating={true} color={theme.colors.primary} style={styles.activityIndicator}/>}
            <Button
                mode="contained"
                onPress={handleLogin}
                disabled={isLoggingIn}
                style={styles.button}
                contentStyle={styles.buttonContent} // Để đảm bảo chiều cao nút nhất quán
            >
                {isLoggingIn ? "Đang đăng nhập..." : "Đăng nhập"}
            </Button>
            <View style={styles.row}>
                <Text style={[styles.downText, { color: theme.colors.onSurface }]}>Chưa có tài khoản?</Text>
                <Button
                    onPress={() => navigation.navigate('Signup')}
                    disabled={isLoggingIn}
                    textColor={theme.colors.primary}
                >
                    Đăng ký
                </Button>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        paddingHorizontal: 20,
    },
    title: {
        textAlign: "center",
        fontSize: 28,
        fontWeight: "bold",
        marginBottom: 30,
    },
    input: {
        marginBottom: 15,
    },
    activityIndicator: { // Style cho ActivityIndicator
        marginVertical: 10,
    },
    button: {
        marginTop: 10,
    },
    buttonContent: { // Style cho nội dung bên trong Button (để padding có tác dụng)
        paddingVertical: 8,
    },
    row: {
        marginTop: 20,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    },
    downText: {
        fontSize: 16,
        marginRight: 5, 
    },
});
