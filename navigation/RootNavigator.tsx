import { createStackNavigator } from '@react-navigation/stack';
import { TransitionSpecs } from '@react-navigation/stack';
import { Easing } from 'react-native';
import HomeScreen from '../screens/HomeScreen';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import SmartHomeScreen from '../screens/SmartHomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ElecControlScreen from '../screens/ElecControl';
import ScheduleScreen from '../screens/Schedule';
import EditProfileScreen from '../screens/EditProfile';

export type RootStackParamList = {
    Home: undefined;
    Intro: undefined;
    Login: undefined;
    Signup: undefined;
    SmartHome: undefined;
    Profile: undefined;
    ElecControl: undefined;
    Schedule: undefined;
    EditProfile: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

// Cấu hình transition spec với thời gian và easing tùy chỉnh
const customTransitionSpec = {
    animation: 'timing' as const,
    config: {
        duration: 100, // thời gian chuyển cảnh: 300ms
        easing: Easing.bezier(0.42, 0, 0.58, 1), // easing phổ biến (ease-in-out)
    },
};

export default function RootNavigator() {
    return (
        <Stack.Navigator
            initialRouteName="SmartHome"
            screenOptions={{
                headerShown: false,
                // Hiệu ứng fade: màn hình mới sẽ dần xuất hiện khi chuyển trang
                cardStyleInterpolator: ({ current: { progress } }) => ({
                    cardStyle: {
                        opacity: progress,
                    },
                }),
                transitionSpec: {
                    open: customTransitionSpec,
                    close: customTransitionSpec,
                },
            }}
        >
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Signup" component={SignupScreen} />
            <Stack.Screen name="SmartHome" component={SmartHomeScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen name="ElecControl" component={ElecControlScreen} />
            <Stack.Screen name="Schedule" component={ScheduleScreen} />
            <Stack.Screen name="EditProfile" component={EditProfileScreen} />
        </Stack.Navigator>
    );
}
