// screens/EditProfileScreen.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, ScrollView, Alert, Platform, StatusBar, SafeAreaView } from 'react-native';
import { TextInput, Button, Avatar, useTheme, ActivityIndicator, Text, MD3Theme } from 'react-native-paper';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { AppStackParamList } from '../navigation/AppNavigator'; // Đảm bảo type này đúng
import { userService, UserProfile as UserProfileData, UpdateUserProfileInput } from '../services/userService';
import { useAuthStore } from '../store/authStore';

type EditProfileScreenNavigationProp = StackNavigationProp<AppStackParamList, 'EditProfile'>;
type EditProfileScreenRouteProp = RouteProp<AppStackParamList, 'EditProfile'>;

const createEditProfileStyles = (theme: MD3Theme) => StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: theme.colors.background,
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },
    container: {
        flexGrow: 1, // Cho phép ScrollView co giãn
        padding: 20,
    },
    avatarContainer: {
        alignItems: 'center',
        marginBottom: 24,
    },
    avatar: {
        backgroundColor: theme.colors.primaryContainer,
    },
    changeAvatarButton: {
        marginTop: 8,
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        color: theme.colors.error,
        textAlign: 'center',
        marginBottom: 10,
    }
});

export default function EditProfileScreen() {
    const navigation = useNavigation<EditProfileScreenNavigationProp>();
    const route = useRoute<EditProfileScreenRouteProp>();
    const theme = useTheme();
    const styles = useMemo(() => createEditProfileStyles(theme), [theme]);

    const initialProfileData = route.params?.profileData;
    const setUserDataInStore = useAuthStore((state) => state.setUserData); // Giả sử có action này trong store

    const [name, setName] = useState(initialProfileData?.name || initialProfileData?.fullName || '');
    const [email, setEmail] = useState(initialProfileData?.email || ''); // Email thường không cho sửa
    const [phone, setPhone] = useState(initialProfileData?.phone || '');
    const [avatarUrl, setAvatarUrl] = useState(initialProfileData?.avatarUrl || '');
    
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Load profile data if not passed or to refresh (optional)
    useEffect(() => {
        if (!initialProfileData) {
            const fetchCurrentProfile = async () => {
                setIsLoading(true);
                try {
                    const profile = await userService.getUserProfile();
                    setName(profile.name || profile.fullName || '');
                    setEmail(profile.email || '');
                    setPhone(profile.phone || '');
                    setAvatarUrl(profile.avatarUrl || '');
                } catch (fetchError: any) {
                    setError(fetchError.message || "Không thể tải thông tin hồ sơ.");
                } finally {
                    setIsLoading(false);
                }
            };
            fetchCurrentProfile();
        }
    }, [initialProfileData]);


    const handleChooseAvatar = () => {
        // TODO: Implement image picker logic (e.g., using expo-image-picker)
        // For now, allow changing URL directly or show a placeholder
        Alert.alert("Thông báo", "Chức năng chọn ảnh đại diện đang được phát triển. Bạn có thể nhập URL mới.");
    };

    const handleSaveProfile = async () => {
        if (!name.trim()) {
            Alert.alert("Lỗi", "Tên không được để trống.");
            return;
        }
        setError(null);
        setIsLoading(true);

        const updateData: UpdateUserProfileInput = {
            // id: initialProfileData?.id, // Gửi ID nếu API yêu cầu, nếu không backend lấy từ token
            name: name.trim(),
            phone: phone.trim() || undefined, // Gửi undefined nếu rỗng để backend có thể bỏ qua
            avatarUrl: avatarUrl.trim() || undefined,
        };

        try {
            const updatedProfile = await userService.updateUserProfile(updateData);
            Alert.alert("Thành công", "Hồ sơ đã được cập nhật.");
            // Cập nhật lại userData trong Zustand store
            if (setUserDataInStore) { // Kiểm tra nếu action tồn tại
                 setUserDataInStore({
                    id: updatedProfile.id,
                    fullName: updatedProfile.name, // Giả sử API trả về 'name'
                    email: updatedProfile.email, // Email không đổi nhưng vẫn cập nhật từ response
                    phone: updatedProfile.phone || null,
                    // avatarUrl: updatedProfile.avatarUrl, // Nếu avatarUrl được trả về
                 });
            } else {
                // Nếu không có setUserData, có thể gọi lại fetchProfile ở ProfileScreen khi focus
                // Hoặc dựa vào việc ProfileScreen tự fetch khi focus
            }
            navigation.goBack();
        } catch (apiError: unknown) {
            const message = apiError instanceof Error ? apiError.message : "Lỗi cập nhật hồ sơ.";
            setError(message);
            Alert.alert("Lỗi", message);
        } finally {
            setIsLoading(false);
        }
    };
    
    if (isLoading && !initialProfileData) { // Chỉ hiển thị loading toàn màn hình khi fetch lần đầu
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.container}>
                <View style={styles.avatarContainer}>
                    <Avatar.Image 
                        size={120} 
                        source={{ uri: avatarUrl || `https://avatar.iran.liara.run/username?username=${encodeURIComponent(name || "User")}` }} 
                        style={styles.avatar}
                    />
                    <Button 
                        icon="camera" 
                        mode="text" 
                        onPress={handleChooseAvatar} 
                        style={styles.changeAvatarButton}
                        textColor={theme.colors.primary}
                    >
                        Thay đổi ảnh
                    </Button>
                </View>

                {error && <Text style={styles.errorText}>{error}</Text>}

                <TextInput
                    label="Họ và tên"
                    value={name}
                    onChangeText={setName}
                    mode="outlined"
                    style={styles.input}
                    disabled={isLoading}
                />
                <TextInput
                    label="Email"
                    value={email}
                    // onChangeText={setEmail} // Email thường không cho sửa trực tiếp
                    mode="outlined"
                    style={styles.input}
                    disabled={true} // Email không cho sửa
                    textColor={theme.colors.onSurfaceDisabled}
                />
                <TextInput
                    label="Số điện thoại"
                    value={phone}
                    onChangeText={setPhone}
                    mode="outlined"
                    style={styles.input}
                    keyboardType="phone-pad"
                    disabled={isLoading}
                />
                <TextInput
                    label="URL Ảnh đại diện"
                    value={avatarUrl}
                    onChangeText={setAvatarUrl}
                    mode="outlined"
                    style={styles.input}
                    disabled={isLoading}
                    placeholder="https://example.com/new-avatar.jpg"
                />

                <View style={styles.buttonContainer}>
                    <Button 
                        mode="contained" 
                        onPress={handleSaveProfile} 
                        loading={isLoading}
                        disabled={isLoading}
                        style={styles.saveButton}
                        icon="content-save-outline"
                    >
                        Lưu thay đổi
                    </Button>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
