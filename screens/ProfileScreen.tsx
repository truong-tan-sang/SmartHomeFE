// screens/ProfileScreen.tsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { StyleSheet, View, ScrollView, Alert, Platform, StatusBar, SafeAreaView } from "react-native";
import { Text, Switch, List, Avatar, Button, useTheme, ActivityIndicator, MD3Theme, Divider } from "react-native-paper"; // Thêm Divider vào import
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
// Giả sử ProfileScreen là một phần của AppNavigator, có thể là một tab hoặc một screen trong stack
// Nếu là tab, bạn cần dùng kiểu từ BottomTabScreenProps
// Ví dụ: import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
// import type { AppTabParamList } from '../navigation/AppNavigator'; 
// Hiện tại, dựa vào code gốc, ta dùng StackNavigationProp. Cần đảm bảo AppStackParamList được định nghĩa đúng.
import type { AppStackParamList } from "../navigation/AppNavigator"; // Bạn cần đảm bảo type này tồn tại và đúng

import { useAuthStore } from "../store/authStore";
import { userService, UserProfile as UserProfileData } from "../services/userService"; // userService để fetch profile nếu cần
import { authApiService } from "../services/AuthService"; // authApiService để delete account

// Cần đảm bảo AppStackParamList có định nghĩa cho 'Profile', 'EditProfile', 'ChangePassword'
type ProfileScreenNavigationProp = StackNavigationProp<AppStackParamList, 'Profile'>;

interface ProfileScreenProps {
    toggleTheme: () => void;
    isDarkMode: boolean;
    // navigation: ProfileScreenNavigationProp; // navigation đã được lấy từ useNavigation()
}

// Function to create styles, accepting theme
const createProfileStyles = (theme: MD3Theme) => StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: theme.colors.background,
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },
    container: {
        padding: 16,
        paddingBottom: 32, // Thêm padding dưới cho nội dung scroll
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    loadingText: {
        marginTop: 10,
        color: theme.colors.onSurface,
    },
    errorText: { // Style cho error text
        color: theme.colors.error,
        marginVertical: 10,
        textAlign: 'center'
    },
    profileHeader: {
        alignItems: 'center',
        marginVertical: 20,
    },
    avatar: {
        marginBottom: 16,
        backgroundColor: theme.colors.primaryContainer, // Sử dụng màu từ theme
    },
    userName: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
        color: theme.colors.onSurface,
    },
    emailText: {
        color: theme.colors.secondary,
        marginBottom: 16,
    },
    editButton: {
        marginTop: 16,
        borderColor: theme.colors.primary, // Sử dụng màu từ theme
        // width: '60%', // Cân nhắc chiều rộng nút
    },
    listSubheader: {
        color: theme.colors.primary,
        fontWeight: 'bold', // Thêm đậm cho subheader
    },
    listItemTitle: {
        color: theme.colors.onSurface,
    },
    listItemIcon: {
        color: theme.colors.onSurfaceVariant, // Màu cho icon
    },
    dangerZone: {
        borderColor: theme.colors.error,
        borderWidth: 1, // Giảm độ dày border
        borderRadius: 8, // Bo tròn hơn
        marginBottom: 16,
        padding: 10,
        // backgroundColor: theme.colors.errorContainer, // Nền cho khu vực nguy hiểm
    },
    dangerItemTitle: {
        color: theme.colors.error, // Màu chữ cho mục nguy hiểm
    },
    dangerItemDescription: {
        // color: theme.colors.onErrorContainer, // Sửa lại nếu không dùng errorContainer
        color: theme.colors.error, // Hoặc một màu khác phù hợp
        opacity: 0.7,
    },
    dangerItemIcon: {
        color: theme.colors.error, // Màu icon cho mục nguy hiểm
    },
    centeredInfoIcon: { // Thêm style này nếu chưa có
        backgroundColor: 'transparent',
    },
});


export default function ProfileScreen({ toggleTheme, isDarkMode }: ProfileScreenProps) {
    const navigation = useNavigation<ProfileScreenNavigationProp>();
    const theme = useTheme();
    const styles = useMemo(() => createProfileStyles(theme), [theme]);

    const storedUserData = useAuthStore((state) => state.userData);
    const logoutAction = useAuthStore((state) => state.logout);

    const [profileData, setProfileData] = useState<UserProfileData | null>(storedUserData);
    const [isLoading, setIsLoading] = useState<boolean>(!storedUserData); // Loading nếu chưa có data từ store
    const [error, setError] = useState<string | null>(null);

    const [notificationsEnabled, setNotificationsEnabled] = useState(true); // Giữ lại state này nếu bạn có logic cho nó

    const fetchProfile = useCallback(async () => {
        if (!profileData && isLoading) { // Chỉ fetch nếu chưa có data và đang trong trạng thái loading ban đầu
            console.log("[ProfileScreen] Attempting to fetch user profile...");
        } else if (profileData && !isLoading) { // Nếu đã có data và không loading, có thể không cần fetch lại
            // Hoặc bạn có thể thêm logic để refresh nếu cần
            // console.log("[ProfileScreen] Profile data already exists, skipping fetch unless forced.");
            return;
        }


        setIsLoading(true);
        setError(null);
        try {
            const data = await userService.getUserProfile();
            setProfileData(data);
            // Cân nhắc cập nhật lại authStore nếu dữ liệu từ server là mới nhất
            // useAuthStore.setState({ userData: {id: data.id, fullName: data.name, email: data.email, phone: data.phone || null} });
            console.log("[ProfileScreen] User profile fetched successfully:", data);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Không thể tải thông tin cá nhân.";
            console.error("[ProfileScreen] Error fetching profile:", message);
            setError(message);
        } finally {
            setIsLoading(false);
        }
    }, [profileData, isLoading]); // Dependencies

    useFocusEffect(
        useCallback(() => {
            console.log("[ProfileScreen] Screen focused. Current storedUserData:", storedUserData);
            if (storedUserData) {
                // Nếu có dữ liệu từ store, ưu tiên hiển thị nó trước
                // và có thể bỏ qua fetchProfile nếu không muốn refresh mỗi lần focus
                setProfileData(storedUserData);
                setIsLoading(false);
            } else {
                // Nếu không có dữ liệu từ store, fetch từ server
                fetchProfile();
            }
            return () => {
                // console.log("ProfileScreen unfocused");
            };
        }, [storedUserData, fetchProfile]) // fetchProfile đã được bọc trong useCallback
    );


    const handleLogout = () => {
        Alert.alert(
            "Xác nhận đăng xuất",
            "Bạn có chắc chắn muốn đăng xuất?",
            [
                { text: "Hủy", style: "cancel" },
                {
                    text: "Đăng xuất", onPress: async () => {
                        await logoutAction();
                    }
                }
            ]
        );
    };

    const handleDeleteAccount = async () => {
        Alert.alert(
            "Xóa tài khoản vĩnh viễn",
            "Tất cả dữ liệu của bạn sẽ bị xóa và không thể khôi phục. Bạn có chắc chắn?",
            [
                { text: "Hủy", style: "cancel" },
                {
                    text: "Xóa tài khoản",
                    style: "destructive",
                    onPress: async () => {
                        setIsLoading(true);
                        try {
                            const deleteResponse = await authApiService.deleteAccount();
                            console.log("Delete account response:", deleteResponse);
                            Alert.alert("Thành công", deleteResponse.message || "Tài khoản của bạn đã được xóa.");
                            await logoutAction();
                        } catch (apiError: unknown) {
                            const message = apiError instanceof Error ? apiError.message : "Xóa tài khoản thất bại.";
                            Alert.alert("Lỗi", message);
                        } finally {
                            setIsLoading(false);
                        }
                    }
                }
            ]
        );
    };

    const handleChangePassword = () => {
        navigation.navigate("ChangePassword" as any);
    };

    const handleEditProfile = () => {
        navigation.navigate("EditProfile" as any, { profileData: profileData });
    };

    if (isLoading) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.centered}>
                    <ActivityIndicator animating={true} size="large" color={theme.colors.primary} />
                    <Text style={styles.loadingText}>Đang tải thông tin...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (error && !profileData) { // Chỉ hiển thị lỗi nếu không có profileData nào để hiển thị
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.centered}>
                    <Avatar.Icon icon="alert-circle-outline" size={48} style={styles.centeredInfoIcon} color={theme.colors.error} />
                    <Text style={styles.errorText}>{error}</Text>
                    <Button mode="contained" onPress={() => fetchProfile()}>Thử lại</Button>
                </View>
            </SafeAreaView>
        );
    }

    if (!profileData) { // Trường hợp không loading, không error, nhưng vẫn không có data
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.centered}>
                    <Avatar.Icon icon="account-question-outline" size={48} style={styles.centeredInfoIcon} color={theme.colors.onSurfaceVariant} />
                    <Text style={{ color: theme.colors.onSurface, marginTop: 10 }}>Không có thông tin người dùng để hiển thị.</Text>
                    <Button mode="outlined" onPress={() => fetchProfile()} style={{ marginTop: 10 }}>Tải lại</Button>
                </View>
            </SafeAreaView>
        );
    }

    const displayUser = {
        name: profileData.name || profileData.fullName || "Người dùng",
        email: profileData.email,
        avatarUrl: profileData.avatarUrl || `https://avatar.iran.liara.run/username?username=${encodeURIComponent(profileData.name || profileData.fullName || "User")}`,
        phone: profileData.phone || "Chưa cập nhật"
    };


    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.container}>
                <View style={styles.profileHeader}>
                    <Avatar.Image
                        size={100}
                        source={{ uri: displayUser.avatarUrl }}
                        style={styles.avatar}
                    />
                    <Text style={styles.userName}>
                        {displayUser.name}
                    </Text>
                    <Text style={styles.emailText}>
                        {displayUser.email}
                    </Text>
                    <Text style={[styles.emailText, { fontSize: 14, fontStyle: 'italic' }]}>
                        SĐT: {displayUser.phone}
                    </Text>
                    <Button
                        mode="elevated"
                        icon="account-edit-outline"
                        style={styles.editButton}
                        onPress={handleEditProfile}
                        textColor={theme.colors.primary}
                    >
                        Chỉnh sửa hồ sơ
                    </Button>
                </View>

                <List.Section>
                    <List.Subheader style={styles.listSubheader}>
                        Cài đặt chung
                    </List.Subheader>
                    <List.Item
                        title="Chế độ tối"
                        titleStyle={styles.listItemTitle}
                        left={() => <List.Icon icon="weather-night" color={styles.listItemIcon.color} />}
                        right={() => (
                            <Switch
                                value={isDarkMode}
                                onValueChange={toggleTheme}
                                color={theme.colors.primary}
                            />
                        )}
                    />
                    <List.Item
                        title="Thông báo"
                        titleStyle={styles.listItemTitle}
                        left={() => <List.Icon icon="bell-outline" color={styles.listItemIcon.color} />}
                        right={() => (
                            <Switch
                                value={notificationsEnabled}
                                onValueChange={() => setNotificationsEnabled(!notificationsEnabled)}
                                color={theme.colors.primary}
                            />
                        )}
                    />
                    <List.Item
                        title="Đổi mật khẩu"
                        titleStyle={styles.listItemTitle}
                        left={() => <List.Icon icon="lock-outline" color={styles.listItemIcon.color} />}
                        onPress={handleChangePassword}
                        right={() => <List.Icon icon="chevron-right" color={styles.listItemIcon.color} />}
                    />
                </List.Section>

                <List.Section>
                    <List.Subheader style={styles.listSubheader}>
                        Thiết bị & Bảo mật
                    </List.Subheader>
                    <List.Item
                        title="Thiết bị đang hoạt động"
                        description="Điện thoại hiện tại"
                        titleStyle={styles.listItemTitle}
                        descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
                        left={() => <List.Icon icon="cellphone-link" color={styles.listItemIcon.color} />}
                    />
                </List.Section>

                <List.Section>
                    <List.Subheader style={styles.listSubheader}>
                        Hỗ trợ
                    </List.Subheader>
                    <List.Item
                        title="Trung tâm trợ giúp"
                        titleStyle={styles.listItemTitle}
                        left={() => <List.Icon icon="help-circle-outline" color={styles.listItemIcon.color} />}
                        // right={() => <List.Icon icon="open-in-new" color={styles.listItemIcon.color} />}
                        onPress={() => Alert.alert("Thông báo", "Chức năng đang phát triển.")}
                    />
                    <List.Item
                        title="Điều khoản dịch vụ"
                        titleStyle={styles.listItemTitle}
                        left={() => <List.Icon icon="file-document-outline" color={styles.listItemIcon.color} />}
                        // right={() => <List.Icon icon="open-in-new" color={styles.listItemIcon.color} />}
                        onPress={() => Alert.alert("Thông báo", "Chức năng đang phát triển.")}
                    />
                    <List.Item
                        title="Chính sách bảo mật"
                        titleStyle={styles.listItemTitle}
                        left={() => <List.Icon icon="shield-check-outline" color={styles.listItemIcon.color} />}
                        // right={() => <List.Icon icon="open-in-new" color={styles.listItemIcon.color} />}
                        onPress={() => Alert.alert("Thông báo", "Chức năng đang phát triển.")}
                    />
                </List.Section>

                <List.Section>
                    <List.Subheader style={[styles.listSubheader, { color: theme.colors.error }]}>
                        Khu vực nguy hiểm
                    </List.Subheader>
                    <View style={[styles.dangerZone, { backgroundColor: theme.colors.errorContainer }]}>
                        <List.Item
                            title="Đăng xuất"
                            titleStyle={styles.dangerItemTitle}
                            description="Bạn sẽ phải đăng nhập lại để sử dụng ứng dụng."
                            descriptionStyle={[styles.dangerItemDescription, { color: theme.colors.error }]} // Sửa lại màu cho description
                            left={() => <List.Icon icon="logout-variant" color={styles.dangerItemIcon.color} />}
                            onPress={handleLogout}
                        />
                        <Divider style={{ backgroundColor: theme.colors.error, opacity: 0.3 }} />
                        <List.Item
                            title="Xóa tài khoản"
                            titleStyle={styles.dangerItemTitle}
                            description="Hành động này không thể hoàn tác."
                            descriptionStyle={[styles.dangerItemDescription, { color: theme.colors.error }]} // Sửa lại màu cho description
                            left={() => <List.Icon icon="delete-forever-outline" color={styles.dangerItemIcon.color} />}
                            onPress={handleDeleteAccount}
                        />
                    </View>
                </List.Section>
            </ScrollView>
        </SafeAreaView>
    );
}

