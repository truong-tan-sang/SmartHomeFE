// ProfileScreen.tsx
import React, { useState } from "react";
import { StyleSheet, View, ScrollView, Alert } from "react-native";
import { Text, Switch, List, Avatar, Button } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { AppStackParamList } from "../navigation/AppNavigator";
import * as Components from "../components";
import { useTheme } from 'react-native-paper';
import { useAuthStore } from "../store/authStore"; // --- CHỈ DÙNG ZUSTAND ---


type ProfileScreenNavigationProp = StackNavigationProp<AppStackParamList, 'Profile'>;

export default function ProfileScreen({ toggleTheme, isDarkMode }) {
    const navigation = useNavigation<ProfileScreenNavigationProp>();
    const theme = useTheme();
    // const { logout, deleteAccount } = useAuth(); // Giả sử có hàm logout và deleteAccount trong auth context
    const logoutAction = useAuthStore((state) => state.logout);
    // const [isDarkMode, setIsDarkMode] = useState(false);
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [twoFactorAuth, setTwoFactorAuth] = useState(false);

    const userData = {
        name: "Trương Tấn Sang",
        email: "sangbeo245@gmail.com",
        avatarUrl: "https://example.com/avatar.jpg",
    };

    const handleLogout = () => {
        Alert.alert(
            "Xác nhận đăng xuất",
            "Bạn có chắc chắn muốn đăng xuất?",
            [
                {
                    text: "Hủy",
                    style: "cancel"
                },
                {
                    text: "Đăng xuất",
                    onPress: async () => {
                        await logoutAction();
                        // logout();
                        // navigation.reset({
                        //     index: 0,
                        //     routes: [{ name: 'Home' }]
                        // });
                    }
                }
            ]
        );
    };
    const handleDeleteAccount = async () => {
        Alert.alert(
            "Xóa tài khoản vĩnh viễn",
            "Tất cả dữ liệu sẽ bị xóa và không thể khôi phục. Bạn có chắc chắn?",
            [
                {
                    text: "Hủy",
                    style: "cancel"
                },
                {
                    text: "Xóa tài khoản",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            // 1. BỎ LỆNH GỌI TỪ CONTEXT CŨ:
                            // await deleteAccount(); 

                            // 2. THAY THẾ BẰNG LỆNH GỌI API BACKEND CỦA BẠN:
                            // await yourApiService.deleteUserOnServer(); // Ví dụ

                            // 3. NẾU API THÀNH CÔNG, GỌI logoutAction CỦA ZUSTAND:
                            await logoutAction();

                            // 4. BỎ LỆNH navigation.reset:
                            // navigation.reset(...) 


                        } catch (error) {
                            Alert.alert("Lỗi", "Xóa tài khoản thất bại");
                        }
                    }
                }
            ]
        );
    };


    const handleChangePassword = () => {
        navigation.navigate("ChangePassword");
    };

    const handleEditProfile = () => {
        navigation.navigate("EditProfile");
    };

    return (
        <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
            <ScrollView contentContainerStyle={styles.container}>
                {/* Phần thông tin cá nhân */}
                <View style={styles.profileHeader}>
                    <Avatar.Image
                        size={100}
                        source={{ uri: userData.avatarUrl }}
                        style={styles.avatar}
                    />
                    <Text style={[styles.userName, { color: theme.colors.onSurface }]}>
                        {userData.name}
                    </Text>
                    <Text style={{ color: theme.colors.secondary }}>
                        {userData.email}
                    </Text>
                    <Button
                        mode="outlined"
                        style={styles.editButton}
                        onPress={handleEditProfile}
                    >
                        Chỉnh sửa hồ sơ
                    </Button>
                </View>

                {/* Cài đặt chung */}
                <List.Section>
                    <List.Subheader style={{ color: theme.colors.primary }}>
                        Cài đặt
                    </List.Subheader>

                    <List.Item
                        title="Chế độ tối"
                        left={() => <List.Icon icon="weather-night" />}
                        right={() => (
                            <Switch
                                value={isDarkMode}
                                onValueChange={toggleTheme}
                            />
                        )}
                    />

                    <List.Item
                        title="Thông báo"
                        left={() => <List.Icon icon="bell" />}
                        right={() => (
                            <Switch
                                value={notificationsEnabled}
                                onValueChange={() => setNotificationsEnabled(!notificationsEnabled)}
                            />
                        )}
                    />

                    <List.Item
                        title="Đổi mật khẩu"
                        left={() => <List.Icon icon="lock" />}
                        onPress={handleChangePassword}
                    />

                    {/* <List.Item
                        title="Xác thực 2 yếu tố"
                        left={() => <List.Icon icon="shield-key" />}
                        right={() => (
                            <Switch
                                value={twoFactorAuth}
                                onValueChange={() => setTwoFactorAuth(!twoFactorAuth)}
                            />
                        )}
                    /> */}
                </List.Section>

                {/* Thiết bị & Bảo mật */}
                <List.Section>
                    <List.Subheader style={{ color: theme.colors.primary }}>
                        Thiết bị
                    </List.Subheader>

                    <List.Item
                        title="Thiết bị đang hoạt động"
                        description="Điện thoại Xiaomi • Android 13"
                        left={() => <List.Icon icon="cellphone" />}
                    />

                    <List.Item
                        title="Quản lý thiết bị"
                        left={() => <List.Icon icon="devices" />}
                    />
                </List.Section>

                {/* Hỗ trợ */}
                <List.Section>
                    <List.Subheader style={{ color: theme.colors.primary }}>
                        Hỗ trợ
                    </List.Subheader>

                    <List.Item
                        title="Trung tâm trợ giúp"
                        left={() => <List.Icon icon="help-circle" />}
                    />

                    <List.Item
                        title="Điều khoản dịch vụ"
                        left={() => <List.Icon icon="file-document" />}
                    />

                    <List.Item
                        title="Chính sách bảo mật"
                        left={() => <List.Icon icon="shield-lock" />}
                    />
                </List.Section>

                {/* Nguy hiểm */}
                <List.Section>
                    <List.Subheader style={{ color: theme.colors.error, fontWeight: "bold", fontSize: 16 }}>
                        Nguy hiểm
                    </List.Subheader>
                    <View style={{ borderColor: theme.colors.error, borderWidth: 2, borderRadius: 8, marginBottom: 16, padding: 16, backgroundColor: theme.colors.highlight }}>
                        <List.Item
                            title="Đăng xuất"
                            titleStyle={{ color: theme.colors.error }}
                            description="Bạn sẽ phải đăng nhập lại"
                            descriptionStyle={{ color: theme.colors.error }}
                            left={() => <List.Icon icon="logout" color={theme.colors.error} />}
                            onPress={handleLogout}
                            style={styles.destructiveButton}
                        />

                        <List.Item
                            title="Xóa tài khoản"
                            titleStyle={{ color: theme.colors.error }}
                            description="Tất cả dữ liệu sẽ bị xóa vĩnh viễn"
                            descriptionStyle={{ color: theme.colors.error }}
                            left={() => <List.Icon icon="delete-forever" color={theme.colors.error} />}
                            onPress={handleDeleteAccount}
                            style={styles.destructiveButton}
                        />

                    </View>
                </List.Section>
                {/* <Button
                    mode="contained"
                    style={styles.logoutButton}
                    labelStyle={{ color: theme.colors.onError }}
                    onPress={handleLogout}
                >
                    Đăng xuất
                </Button> */}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
    },
    // destructiveButton: {
    //     marginTop: 16,
    //     borderTopWidth: 1,
    //     borderBottomWidth: 1,
    //     borderColor: '#ff444433',
    // },
    profileHeader: {
        alignItems: 'center',
        marginVertical: 20,
    },
    avatar: {
        marginBottom: 16,
        backgroundColor: '#caa26a',
    },
    userName: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    editButton: {
        marginTop: 16,
        borderColor: '#caa26a',
    },
    logoutButton: {
        marginTop: 30,
        backgroundColor: '#ff4444',
    },
});