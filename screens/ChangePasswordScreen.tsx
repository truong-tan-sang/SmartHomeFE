// screens/ChangePasswordScreen.tsx
import React, { useState, useMemo } from 'react';
import { View, StyleSheet, ScrollView, Alert, Platform, StatusBar, SafeAreaView } from 'react-native';
import { TextInput, Button, useTheme, ActivityIndicator, Text, MD3Theme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { AppStackParamList } from '../navigation/AppNavigator'; // Đảm bảo type này đúng
import { userService, ChangePasswordInput } from '../services/userService';

type ChangePasswordScreenNavigationProp = StackNavigationProp<AppStackParamList, 'ChangePassword'>;

const createChangePasswordStyles = (theme: MD3Theme) => StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: theme.colors.background,
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },
    container: {
        flexGrow: 1,
        padding: 20,
        justifyContent: 'center', // Căn giữa nếu nội dung ít
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 24,
        color: theme.colors.primary,
    },
    input: {
        marginBottom: 16,
    },
    buttonContainer: {
        marginTop: 24,
    },
    saveButton: {
        paddingVertical: 8,
    },
    errorText: {
        color: theme.colors.error,
        textAlign: 'center',
        marginBottom: 10,
    }
});

export default function ChangePasswordScreen() {
    const navigation = useNavigation<ChangePasswordScreenNavigationProp>();
    const theme = useTheme();
    const styles = useMemo(() => createChangePasswordStyles(theme), [theme]);

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleChangePassword = async () => {
        if (!currentPassword || !newPassword || !confirmNewPassword) {
            Alert.alert("Lỗi", "Vui lòng điền đầy đủ các trường.");
            return;
        }
        if (newPassword !== confirmNewPassword) {
            Alert.alert("Lỗi", "Mật khẩu mới và xác nhận mật khẩu không khớp.");
            return;
        }
        if (newPassword.length < 6) { // Ví dụ: yêu cầu mật khẩu tối thiểu 6 ký tự
            Alert.alert("Lỗi", "Mật khẩu mới phải có ít nhất 6 ký tự.");
            return;
        }

        setError(null);
        setIsLoading(true);

        const changePasswordData: ChangePasswordInput = {
            currentPassword,
            newPassword,
        };

        try {
            const response = await userService.changePassword(changePasswordData);
            if (response.success) {
                Alert.alert("Thành công", response.message || "Đổi mật khẩu thành công!");
                navigation.goBack();
            } else {
                throw new Error(response.message || "Đổi mật khẩu thất bại.");
            }
        } catch (apiError: unknown) {
            const message = apiError instanceof Error ? apiError.message : "Lỗi không xác định khi đổi mật khẩu.";
            setError(message);
            Alert.alert("Lỗi", message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.container}>
                <Text style={styles.title}>Đổi Mật Khẩu</Text>

                {error && <Text style={styles.errorText}>{error}</Text>}

                <TextInput
                    label="Mật khẩu hiện tại"
                    value={currentPassword}
                    onChangeText={setCurrentPassword}
                    secureTextEntry
                    mode="outlined"
                    style={styles.input}
                    disabled={isLoading}
                />
                <TextInput
                    label="Mật khẩu mới"
                    value={newPassword}
                    onChangeText={setNewPassword}
                    secureTextEntry
                    mode="outlined"
                    style={styles.input}
                    disabled={isLoading}
                />
                <TextInput
                    label="Xác nhận mật khẩu mới"
                    value={confirmNewPassword}
                    onChangeText={setConfirmNewPassword}
                    secureTextEntry
                    mode="outlined"
                    style={styles.input}
                    disabled={isLoading}
                />

                <View style={styles.buttonContainer}>
                    <Button 
                        mode="contained" 
                        onPress={handleChangePassword} 
                        loading={isLoading}
                        disabled={isLoading}
                        style={styles.saveButton}
                        icon="lock-reset"
                    >
                        Lưu Mật Khẩu Mới
                    </Button>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
