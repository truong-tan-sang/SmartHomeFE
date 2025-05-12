// screens/LoginScreen.tsx
import React, { useState } from "react";
import { StyleSheet, View, Alert } from "react-native";
import { Text, TextInput, Button, IconButton} from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import { AuthStackParamList } from '../navigation/AuthNavigator';
import * as Components from "../components";
import { useAuthStore } from "../store/authStore"; 

type LoginScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Login'>

export default function LoginScreen() {
    const navigation = useNavigation<LoginScreenNavigationProp>();
    // const theme = useTheme();
    const [email, setEmail] = useState("");      // State cho email
    const [password, setPassword] = useState(""); // State cho mật khẩu
    // function handleLogin() {
    //     console.log("Thông tin đăng ký: ", email, password);
    //     navigation.navigate("SmartHome");
    // }
    const [isLoggingIn, setIsLoggingIn] = useState(false); // Thêm state loading cho nút

    // Lấy action login từ store
    const loginAction = useAuthStore((state) => state.login);

    async function handleLogin() {
        // --- SỬA Ở ĐÂY ---
        // 1. (Tùy chọn) Validate input cơ bản
        if (!email || !password) {
            Alert.alert("Lỗi", "Vui lòng nhập email và mật khẩu.");
            return;
        }

        setIsLoggingIn(true); // Bắt đầu trạng thái loading

        try {
            // 2. Gọi API đăng nhập của bạn ở đây
            // const response = await yourAuthApi.login(email, password); 

            // Giả sử API trả về token khi thành công
            const fakeToken = `fake-token-for-${email}`; // <<<--- Thay bằng token thật từ API

            // 3. Nếu đăng nhập thành công, gọi action login của store với token nhận được
            await loginAction(fakeToken);

            // KHÔNG cần gọi navigation.navigate("SmartHome") ở đây nữa.
            // RootNavigator sẽ tự động chuyển sang AppNavigator khi state isLoggedIn thay đổi.

        } catch (error) {
            // 4. Xử lý lỗi nếu đăng nhập thất bại (ví dụ: sai mật khẩu, lỗi mạng)
            console.error("Login failed:", error);
            Alert.alert("Đăng nhập thất bại", "Email hoặc mật khẩu không đúng.");
            // Hoặc hiển thị lỗi cụ thể hơn từ API
        } finally {
            setIsLoggingIn(false); // Kết thúc trạng thái loading dù thành công hay thất bại
        }
        // --- KẾT THÚC SỬA ---
    }
        return (
            <View style={styles.container}>
                {/* Nút quay lại */}

                <Components.BackButton />

                <TextInput label="Email" mode="outlined" keyboardType="email-address" value={email} onChangeText={setEmail} style={styles.input} />
                <TextInput label="Mật khẩu" mode="outlined" secureTextEntry value={password} onChangeText={setPassword} style={styles.input} />

                {/* Nút đăng nhập */}
                <Button mode="contained" onPress={handleLogin}>
                    Đăng nhập
                </Button>

                {/* Nút quay lại */}
                <View style={styles.row}>
                    <Text style={styles.downText}>Chưa có tài khoản?</Text>
                    <Button onPress={() => { navigation.navigate('Signup') }}>Đăng ký</Button>
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
            fontSize: 24,
            fontWeight: "bold",
            marginBottom: 20,
        },
        // input: {
        //     width: "100%",
        //     height: 50,
        //     borderColor: "#ccc",
        //     borderWidth: 1,
        //     borderRadius: 8,
        //     paddingHorizontal: 15,
        //     marginBottom: 15,
        //     backgroundColor: "#fff",
        // },
        input: {
            marginBottom: 15,
        },
        button: {
            width: "100%",
            backgroundColor: "#3498db",
            padding: 15,
            borderRadius: 8,
            alignItems: "center",
        },
        buttonText: {
            color: "white",
            fontSize: 18,
            fontWeight: "bold",
        },
        row: {
            marginTop: 15,
            flexDirection: "row",
            alignItems: "center",
            alignSelf: "center",
            fontSize: 16,
        },
        backText: {
            color: "#3498db",
            fontSize: 16,
        },
        downText: {
        },
    });
