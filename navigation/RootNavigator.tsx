import {createStackNavigator} from '@react-navigation/stack'
import HomeScreen from '../screens/HomeScreen'
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import SmartHomeScreen from '../screens/SmartHomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { create } from 'zustand';

export type RootStackParamList = {
    Home : undefined;
    Intro : undefined;
    Login : undefined;
    Signup : undefined;
    SmartHome: undefined;
    Profile: undefined;
}

const Stack = createStackNavigator <RootStackParamList>();

export default function RootNavigator(){
    return(
        <Stack.Navigator 
        initialRouteName='SmartHome'
        screenOptions={{headerShown: false}}
        >
            <Stack.Screen name="Home" component={HomeScreen}/>
            <Stack.Screen name="Login" component={LoginScreen}/>
            <Stack.Screen name="Signup" component={SignupScreen}/>
            <Stack.Screen name="SmartHome" component={SmartHomeScreen}/>
            <Stack.Screen name="Profile" component={ProfileScreen}/>
        </Stack.Navigator>
    )
}