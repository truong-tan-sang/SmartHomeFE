//EditProfile.tsx

import React, { useState, useEffect } from "react";
import { StyleSheet, View, ScrollView } from "react-native";
import { Text, TextInput, Button, Avatar, ActivityIndicator } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { AppStackParamList } from "../navigation/AppNavigator";
import { useTheme } from 'react-native-paper';
import { getUserProfile, updateUserProfile } from "../services/userService";
import * as Components from "../components";

type EditProfileScreenNavigationProp = StackNavigationProp<AppStackParamList, 'EditProfile'>;

export default function EditProfileScreen() {
    const navigation = useNavigation<EditProfileScreenNavigationProp>();
    const theme = useTheme();

    const [loading, setLoading] = useState(true);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});
    useEffect(() => {
        const loadUserData = async () => {
            try {
                const userData = await getUserProfile();
                setName(userData.name);
                setEmail(userData.email);
                setAvatarUrl(userData.avatarUrl);
            } catch (error) {
                console.error("Failed to load user data:", error);
            } finally {
                setLoading(false);
            }
        };

        loadUserData();
    }, []);


    // Xác thực form
    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!name.trim()) newErrors.name = 'Vui lòng nhập tên';
        if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
            newErrors.email = 'Email không hợp lệ';
        }
        if (newPassword && newPassword.length < 6) {
            newErrors.newPassword = 'Mật khẩu phải có ít nhất 6 ký tự';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    const handleChangeAvatar = () => {}
    // Xử lý lưu thay đổi
    const handleSave = async () => {
        if (validateForm()) {
            try {
                await updateUserProfile({
                    name,
                    email,
                    newPassword: newPassword || undefined
                });
                navigation.goBack();
            } catch (error) {
                setErrors({ general: 'Cập nhật thất bại. Vui lòng thử lại.' });
            }
        }
    };

    if (loading) {
        return (
            <View style={  styles.loadingContainer}>
                <ActivityIndicator size="large" />
            </View>
        );
    }



    return (
        <View style={{ flex: 1, backgroundColor: theme.colors.background }}>

            <ScrollView contentContainerStyle={styles.container}>
            <Components.BackButton/>
                {/* Avatar */}
                <View style={styles.avatarContainer}>
                    <Avatar.Image
                        size={120}
                        source={{ uri: avatarUrl || 'https://example.com/default-avatar.jpg' }}
                        style={styles.avatar}
                    />

                    <Button
                        mode="text"
                        icon="camera"
                        onPress={() => { console.log('Thay đổi avatar'); handleChangeAvatar(); }}
                    >
                        Thay đổi ảnh
                    </Button>
                </View>

                {/* Form */}
                <TextInput
                    label="Họ và tên"
                    value={name}
                    onChangeText={setName}
                    mode="outlined"
                    error={!!errors.name}
                    style={styles.input}
                />
                {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

                <TextInput
                    label="Email"
                    value={email}
                    onChangeText={setEmail}
                    mode="outlined"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    error={!!errors.email}
                    style={styles.input}
                />
                {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

                <TextInput
                    label="Mật khẩu hiện tại"
                    value={currentPassword}
                    onChangeText={setCurrentPassword}
                    mode="outlined"
                    secureTextEntry
                    style={styles.input}
                />

                <TextInput
                    label="Mật khẩu mới"
                    value={newPassword}
                    onChangeText={setNewPassword}
                    mode="outlined"
                    secureTextEntry
                    error={!!errors.newPassword}
                    style={styles.input}
                />
                {errors.newPassword && <Text style={styles.errorText}>{errors.newPassword}</Text>}

                <Button
                    mode="contained"
                    style={styles.saveButton}
                    onPress={handleSave}
                >
                    Lưu thay đổi
                </Button>
            </ScrollView>
            <Components.BottomNavBar activeRoute="Profile" />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
    },
    avatarContainer: {
        alignItems: 'center',
        marginVertical: 20,
    },
    avatar: {
        marginBottom: 10,
        backgroundColor: '#caa26a',
    },
    input: {
        marginBottom: 10,
    },
    saveButton: {
        marginTop: 20,
        paddingVertical: 8,
    },
    errorText: {
        color: '#ff4444',
        marginBottom: 10,
        marginLeft: 10,
    },
});
