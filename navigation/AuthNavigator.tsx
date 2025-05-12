// navigation/AuthNavigator.tsx
import React, { useState, useEffect } from 'react'; // <<< THÊM useState, useEffect
// Sử dụng lại createStackNavigator từ @react-navigation/stack giống RootNavigator cũ
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage'; // <<< THÊM AsyncStorage
import { View, ActivityIndicator, StyleSheet } from 'react-native'; // <<< THÊM View, ActivityIndicator, StyleSheetz
import { useTheme } from 'react-native-paper'; // <<< THÊM useTheme (tùy chọn)

// Import các màn hình xác thực của bạn
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import IntroScreen from '../screens/IntroScreen'; // Bỏ comment nếu bạn có màn hình Intro và muốn thêm vào luồng này

// --- Định nghĩa Param List cho Auth Stack ---
// Quan trọng: Chỉ chứa các màn hình thuộc luồng xác thực
export type AuthStackParamList = {
    Login: undefined; // Màn hình Login không cần tham số khi điều hướng đến
    Signup: undefined; // Màn hình Signup không cần tham số
    Intro: undefined; // Nếu có màn hình Intro
    // ForgotPassword: { email?: string }; // Ví dụ: Màn hình quên mật khẩu có thể nhận email (optional)
};

// Tạo Stack Navigator cho Auth
const Stack = createStackNavigator<AuthStackParamList>();
const INTRO_FLAG_KEY = 'hasSeenIntro'; // <<< Key phải giống với bên IntroScreen


export default function AuthNavigator() {
        // State để lưu màn hình bắt đầu và trạng thái loading
        const [initialRoute, setInitialRoute] = useState<keyof AuthStackParamList | null>(null);
        const [isLoading, setIsLoading] = useState(true);
        const theme = useTheme(); // Lấy theme để tạo màu cho loading (tùy chọn)
    
        // useEffect chạy 1 lần khi component mount để kiểm tra cờ
        useEffect(() => {
            const checkIntroStatus = async () => {
                setIsLoading(true); // Bắt đầu loading
                try {
                    const hasSeenIntro = await AsyncStorage.getItem(INTRO_FLAG_KEY);
                    if (hasSeenIntro === 'true') {
                        // Nếu đã xem Intro -> Bắt đầu từ Login
                        setInitialRoute('Login');
                        console.log("AuthNavigator: Đã xem Intro, bắt đầu từ Login");
                    } else {
                        // Nếu chưa xem Intro (hoặc có lỗi đọc) -> Bắt đầu từ Intro
                        setInitialRoute('Intro');
                        console.log("AuthNavigator: Chưa xem Intro, bắt đầu từ Intro");
                    }
                } catch (error) {
                    console.error("Lỗi kiểm tra trạng thái Intro:", error);
                    setInitialRoute('Intro'); // Mặc định về Intro nếu có lỗi
                } finally {
                    setIsLoading(false); // Kết thúc loading
                }
            };
            checkIntroStatus();
        }, []); // Mảng rỗng đảm bảo useEffect chỉ chạy 1 lần
    
        // --- HIỂN THỊ LOADING KHI ĐANG KIỂM TRA ASYNCSTORAGE ---
        if (isLoading || !initialRoute) { // Chờ cả isLoading xong và initialRoute có giá trị
            return (
                <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                </View>
            );
        }
        // --- KẾT THÚC HIỂN THỊ LOADING ---
    
    
    return (
        // Khởi tạo Stack Navigator cho các màn hình Auth
        <Stack.Navigator
            // Chọn màn hình bắt đầu cho luồng xác thực (thường là Login hoặc Intro)
            initialRouteName={initialRoute}
            // Cấu hình chung cho các màn hình trong Auth Stack
            screenOptions={{
                headerShown: false, // Giữ cấu hình ẩn header như cũ, hoặc bạn có thể đổi thành true nếu muốn có header riêng cho Auth Stack
                // Bạn có thể giữ lại các tùy chỉnh transition giống RootNavigator cũ nếu muốn
                // cardStyleInterpolator: ({ current: { progress } }) => ({
                //   cardStyle: { opacity: progress },
                // }),
                // transitionSpec: { ... }, // Giữ hoặc bỏ tùy theo ý muốn
            }}
        >
            {/* Khai báo các màn hình trong Auth Stack */}
            <Stack.Screen 
                name="Intro" 
                component={IntroScreen} 
            />
            <Stack.Screen
                name="Login"
                component={LoginScreen}
            />
            <Stack.Screen
                name="Signup"
                component={SignupScreen}
            />
            {/* <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} /> */}

        </Stack.Navigator>
    );
}
// Style cho màn hình loading (có thể đặt ở file riêng)
const styles = StyleSheet.create({
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });
  