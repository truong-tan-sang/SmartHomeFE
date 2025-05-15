// navigation/AppNavigator.tsx
import React from 'react';
import { View, ViewStyle } from 'react-native';
import { createBottomTabNavigator, BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { createStackNavigator, StackScreenProps as StackScreenPropsType } from '@react-navigation/stack';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme, MD3Theme } from 'react-native-paper'; // Import MD3Theme
import { NavigatorScreenParams, RouteProp } from '@react-navigation/native'; // Import RouteProp
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';

// Import các màn hình
import SmartHomeScreen from '../screens/SmartHomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import EditProfileScreen from '../screens/EditProfileScreen'; 
import ChangePasswordScreen from '../screens/ChangePasswordScreen'; 
import { UserProfile as UserProfileData } from '../services/userService'; 

// --- Định nghĩa kiểu cho các Param Lists ---

// Stack cho các màn hình trong tab Hồ sơ
export type ProfileStackParamList = {
    ProfileMain: { 
        toggleTheme: () => void;
        isDarkMode: boolean;
    };
    EditProfile: { profileData?: UserProfileData | null }; 
    ChangePassword: undefined; 
};

// Tab Navigator chính của ứng dụng
export type AppTabParamList = {
    HomeTab: undefined; 
    ElecControlTab: undefined; 
    ScheduleTab: undefined;   
    ProfileTab: NavigatorScreenParams<ProfileStackParamList>; 
};

const Tab = createBottomTabNavigator<AppTabParamList>();
const ProfileStack = createStackNavigator<ProfileStackParamList>();

// --- TabBarIconWrapper (Giữ nguyên) ---
interface TabBarIconWrapperProps {
    focused: boolean;
    name: string;
}
function TabBarIconWrapper({ focused, name }: TabBarIconWrapperProps) {
    const theme = useTheme();
    const iconSize = 32;
    const iconColor = "#faf7f2"; 
    const activeBackgroundColor = "#dac297"; 
    const wrapperHeight = 40;
    const wrapperWidth = 80;
    const wrapperBorderRadius = 20;
    const iconName = focused ? name : `${name}-outline`;
    const progress = useSharedValue(focused ? 1 : 0);

    React.useEffect(() => {
        progress.value = withTiming(focused ? 1 : 0, { duration: 100 });
    }, [focused, progress]);

    const animatedBackgroundStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: progress.value }],
            opacity: progress.value,
        };
    });

    const containerStyle: ViewStyle = {
        height: wrapperHeight,
        width: wrapperWidth,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        borderRadius: wrapperBorderRadius,
    }; 

    const backgroundStyle: ViewStyle = {
        position: 'absolute',
        backgroundColor: activeBackgroundColor,
        width: wrapperWidth,
        height: wrapperHeight,
        borderRadius: wrapperBorderRadius,
    };

    return (
        <View style={containerStyle}>
            <Animated.View style={[backgroundStyle, animatedBackgroundStyle]} />
            <MaterialCommunityIcons
                name={iconName}
                color={iconColor}
                size={iconSize}
            />
        </View>
    );
}


// --- ProfileStackNavigator ---
// Component này sẽ quản lý các màn hình liên quan đến Profile
interface ProfileStackNavigatorProps {
    toggleTheme: () => void;
    isDarkMode: boolean;
}

function ProfileStackNavigator({ toggleTheme, isDarkMode }: ProfileStackNavigatorProps) {
    const theme = useTheme(); // Lấy theme để style cho header của stack
    return (
        <ProfileStack.Navigator
            // screenOptions cho toàn bộ ProfileStack
            screenOptions={{
                // Mặc định hiển thị header, có thể tùy chỉnh màu sắc ở đây
                headerStyle: {
                    backgroundColor: theme.colors.surface, // Màu nền header
                },
                headerTintColor: theme.colors.onSurface, // Màu chữ và icon trên header
                headerTitleStyle: {
                    fontWeight: 'bold',
                },
                // Nút back sẽ tự động xuất hiện nếu có thể quay lại
            }}
        >
            <ProfileStack.Screen 
                name="ProfileMain"
                options={{ 
                    headerShown: false, // Màn hình ProfileMain không cần header của Stack này
                                        // vì nó là màn hình gốc của Tab và không có nút back ở đây.
                }}
            >
                {(props: StackScreenPropsType<ProfileStackParamList, 'ProfileMain'>) => (
                    <ProfileScreen
                        {...props} 
                        toggleTheme={toggleTheme}
                        isDarkMode={isDarkMode}
                    />
                )}
            </ProfileStack.Screen>
            <ProfileStack.Screen 
                name="EditProfile" 
                component={EditProfileScreen} 
                options={{ 
                    title: 'Chỉnh sửa hồ sơ',
                    headerShown: true, // Hiển thị header cho màn hình này (sẽ có nút back tự động)
                }} 
            />
            <ProfileStack.Screen 
                name="ChangePassword" 
                component={ChangePasswordScreen} 
                options={{ 
                    title: 'Đổi mật khẩu',
                    headerShown: true, // Hiển thị header cho màn hình này (sẽ có nút back tự động)
                }}
            />
        </ProfileStack.Navigator>
    );
}


// --- AppNavigator (Tab Navigator chính) ---
interface AppNavigatorProps {
    toggleTheme: () => void;
    isDarkMode: boolean;
}

export default function AppNavigator({ toggleTheme, isDarkMode }: AppNavigatorProps) {
    const theme = useTheme(); 

    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false, // Header của Tab.Navigator không cần thiết vì ProfileStack có header riêng
                tabBarStyle: {
                    backgroundColor: theme.colors.primary, 
                    height: 75,
                    borderTopWidth: 0, 
                    elevation: 0, 
                },
                tabBarIconStyle: {
                    marginTop: 10,
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: "bold", 
                    color: theme.colors.onPrimary, 
                    marginBottom: 5, 
                },
                tabBarActiveTintColor: theme.colors.onPrimary, 
                tabBarInactiveTintColor: theme.colors.onPrimaryContainer, 
            }}
        >
            <Tab.Screen 
                name="HomeTab" 
                component={SmartHomeScreen} 
                options={{ 
                    tabBarLabel: 'Trang chủ', 
                    tabBarIcon: ({ focused }) => <TabBarIconWrapper focused={focused} name="home" /> 
                }} 
            />
            <Tab.Screen 
                name="ProfileTab"
                options={{ 
                    tabBarLabel: 'Hồ sơ', 
                    tabBarIcon: ({ focused }) => <TabBarIconWrapper focused={focused} name="account-circle" /> 
                }} 
            >
                {() => (
                    <ProfileStackNavigator 
                        toggleTheme={toggleTheme}
                        isDarkMode={isDarkMode}
                    />
                )}
            </Tab.Screen>
        </Tab.Navigator>
    );
}
