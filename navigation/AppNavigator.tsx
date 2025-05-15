// navigation/AppNavigator.tsx
import React from 'react';
import { View, ViewStyle  } from 'react-native';
import { createBottomTabNavigator, BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { createStackNavigator, StackScreenProps as StackScreenPropsType } from '@react-navigation/stack';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from 'react-native-paper';
import { NavigatorScreenParams } from '@react-navigation/native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';

import SmartHomeScreen from '../screens/SmartHomeScreen';
import ElecControlScreen from '../screens/ElecControl';
import ScheduleScreen from '../screens/Schedule';
import ProfileScreen from '../screens/ProfileScreen';
// export type HomeTabStackParamList = {
//     SmartHomeMain: undefined;
// };
export type AppTabParamList = {
    HomeTab: undefined;
    ElecControlTab: undefined;
    ScheduleTab: undefined;
    ProfileTab: undefined;
};

const Tab = createBottomTabNavigator<AppTabParamList>();
// const HomeStack = createStackNavigator<HomeTabStackParamList>();

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

    const containerStyle = {
        height: wrapperHeight,
        width: wrapperWidth,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        borderRadius: wrapperBorderRadius,
    } as const; 

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

// type HomeTabScreenProps = BottomTabScreenProps<AppTabParamList, 'HomeTab'>;
// function HomeStackNavigator({ navigation, route }: HomeTabScreenProps) {
//     return (
//         <HomeStack.Navigator screenOptions={{ headerShown: false }}>
//             <HomeStack.Screen name="SmartHomeMain" component={SmartHomeScreen} />
//             {/* <HomeStack.Screen name="DeviceDetail" component={DeviceDetailScreen} /> */}
//         </HomeStack.Navigator>
//     );
// }

interface AppNavigatorProps {
    toggleTheme: () => void;
    isDarkMode: boolean;
}

export default function AppNavigator({ toggleTheme, isDarkMode }: AppNavigatorProps) {
    const theme = useTheme();

    return (
        <Tab.Navigator
            screenOptions={{ // screenOptions giữ nguyên
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: theme.colors.primary,
                    height: 75,
                    // paddingBottom: 5, 
                },
                tabBarIconStyle: {
                    marginTop: 10,
                    // paddingTop:20,
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: "900",
                    color: "#faf7f2",
                    // marginTop: -4, 
                },
            }}
        >
            {/* HomeTab, ElecControlTab, ScheduleTab giữ nguyên */}
            <Tab.Screen name="HomeTab" component={SmartHomeScreen} options={{ tabBarLabel: 'Trang chủ', tabBarIcon: ({ focused }) => <TabBarIconWrapper focused={focused} name="home" /> }} />
            {/* <Tab.Screen name="ElecControlTab" component={ElecControlScreen} options={{ tabBarLabel: 'Điều khiển', tabBarIcon: ({ focused }) => <TabBarIconWrapper focused={focused} name="lightning-bolt" /> }} /> */}
            <Tab.Screen name="ScheduleTab" component={ScheduleScreen} options={{ tabBarLabel: 'Lịch trình', tabBarIcon: ({ focused }) => <TabBarIconWrapper focused={focused} name="calendar-clock" /> }} />
            <Tab.Screen name="ProfileTab" options={{ tabBarLabel: 'Hồ sơ', tabBarIcon: ({ focused }) => <TabBarIconWrapper focused={focused} name="account" /> }} >
                {/* Dùng Render Prop để truyền props trực tiếp vào ProfileScreen */}
                {(props: BottomTabScreenProps<AppTabParamList, 'ProfileTab'>) => // <<< Kiểu props là của Tab Navigator
                    <ProfileScreen
                        {...props} // Truyền navigation/route của Tab Navigator
                        toggleTheme={toggleTheme}
                        isDarkMode={isDarkMode}
                    />
                }
            </Tab.Screen>

        </Tab.Navigator>
    );
}