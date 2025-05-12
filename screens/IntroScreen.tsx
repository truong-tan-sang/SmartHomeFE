// IntroScreen.tsx
import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet, Dimensions, Easing , Image} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackScreenProps } from '@react-navigation/stack';
import type { AuthStackParamList } from '../navigation/AuthNavigator';
import { IconButton } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage'; // <<< THÊM ASYNCSTORAGE


const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const INTRO_FLAG_KEY = 'hasSeenIntro'
type IntroScreenProp = StackScreenProps<AuthStackParamList, 'Intro'>;

export default function IntroScreen({navigation} : IntroScreenProp) {
    const [showIntro, setShowIntro] = useState(false);
    const animation = useRef(new Animated.Value(0)).current;
    const textOpacity = useRef(new Animated.Value(1)).current;

    const buttonSize = animation.interpolate({
        inputRange: [0, 1],
        outputRange: [200, Math.max(SCREEN_WIDTH, SCREEN_HEIGHT) * 2]
    });
    
    const translateX = buttonSize.interpolate({
        inputRange: [200, Math.max(SCREEN_WIDTH, SCREEN_HEIGHT) * 2],
        outputRange: [0, -(Math.max(SCREEN_WIDTH, SCREEN_HEIGHT) * 2 - 200) / 2]
    });
    
    const translateY = buttonSize.interpolate({
        inputRange: [200, Math.max(SCREEN_WIDTH, SCREEN_HEIGHT) * 2],
        outputRange: [0, -(Math.max(SCREEN_WIDTH, SCREEN_HEIGHT) * 2 - 200) / 2]
    });
    

    const borderRadius = animation.interpolate({
        inputRange: [0, 1],
        outputRange: [100, Math.max(SCREEN_WIDTH, SCREEN_HEIGHT)]
    });

    const handlePress = () => {
        Animated.parallel([
            Animated.timing(animation, {
                toValue: 1,
                duration: 800,
                easing: Easing.bezier(0.4, 0, 0.2, 1),
                useNativeDriver: false
            }),
            Animated.timing(textOpacity, {
                toValue: 0,
                duration: 300,
                useNativeDriver: false
            })
        ]).start(() => setShowIntro(true));
    };

    const handleBack = () => {
        Animated.parallel([
            Animated.timing(animation, {
                toValue: 0,
                duration: 800,
                easing: Easing.bezier(0.4, 0, 0.2, 1),
                useNativeDriver: false
            }),
            Animated.timing(textOpacity, {
                toValue: 1,
                duration: 300,
                useNativeDriver: false
            })
        ]).start(() => setShowIntro(false));
    };
        // --- HÀM XỬ LÝ KHI NHẤN NÚT TIẾP THEO ---
        const handleNavigateToLogin = async () => {
            try {
                // Đánh dấu là đã xem Intro
                await AsyncStorage.setItem(INTRO_FLAG_KEY, 'true'); 
                console.log("Đã lưu cờ hasSeenIntro");
            } catch (error) {
                console.error("Lỗi lưu cờ hasSeenIntro:", error);
                // Có thể bỏ qua lỗi và vẫn điều hướng
            } finally {
                 // Điều hướng đến màn hình Login
                navigation.navigate("Login");
            }
        };
        // --- KẾT THÚC HÀM XỬ LÝ ---
    

    return (
        <View style={styles.container}>
            {/* Home Screen Elements */}
            <Animated.View
                style={[
                    styles.buttonContainer,
                    {
                        width: buttonSize,
                        height: buttonSize,
                        borderRadius: borderRadius,
                        backgroundColor: showIntro ? '#caa26a' : '#caa26a',
                        transform: [{ translateX }, { translateY }]

                    }
                ]}
            >
                <TouchableOpacity
                    style={styles.fullSize}
                    onPress={handlePress}
                    activeOpacity={0.9}
                >
                    <Animated.Text style={[styles.buttonText, { opacity: textOpacity }]}>
                        The Perfect Dream House
                    </Animated.Text>
                </TouchableOpacity>
            </Animated.View>

            {/* Intro Screen Overlay */}
            {showIntro && (
                <Animated.View style={[styles.introContainer, { opacity: animation }]}>
                    {/* <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                        <Text style={styles.backButtonText}>Back</Text>
                    </TouchableOpacity> */}

                    <IconButton
                        icon="arrow-left"
                        size={32}
                        style= {styles.backButton}
                        onPress={handleBack}
                        iconColor="#fff"
                    />
                    <Text style={styles.headerText}>
                        The Perfect Dream House for you
                    </Text>
                    <Text style = {styles.normalText}>
                    A smart house with advanced features that you can control by mobile app
                    </Text>
                    <Image
                        style={styles.introImage}
                        source={require('../assets/intro-home-image.png')}
                        />
                    <IconButton
                        icon="arrow-right"
                        size={32}
                        style= {styles.nextButton}
                        onPress={handleNavigateToLogin}
                        iconColor="#fff"
                    />
                </Animated.View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#e1d5c9'
    },
    buttonContainer: {
        position: 'absolute',
        top: SCREEN_HEIGHT / 2 - 120, // Đặt ở giữa màn hình theo chiều dọc
        left: SCREEN_WIDTH / 2 - 80, // Đặt ở giữa màn hình theo chiều ngang
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden'
    },
    fullSize: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    buttonText: {
        color: 'white',
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        padding: 20
    },
    nextButton: {
        position:'absolute',
        zIndex: 1,
        backgroundColor: "#caa26a",
        bottom: 20,
        right: 20,
    },
    introContainer: {
        ...StyleSheet.absoluteFillObject,
        // justifyContent: 'center',
        // alignItems: 'center',
        padding: 60,
    },
    headerText: {
        fontSize: 32,
        fontWeight: '700',
        color: 'rgba(0, 0, 0, 1)',
        fontFamily: 'Inter',
        width: 255,
        marginTop: 20
    },
    normalText: {
        marginTop: 20,
        fontSize: 20,
        fontWeight: '500',

    },
    backButton: {
        position: 'absolute',
        bottom: 20,
        zIndex:1,
        left: 20,
        borderRadius: 50,
        backgroundColor: '#caa26a'
    },
    backButtonText: {
        color: 'white',
        fontSize: 16
    },
    introImage: {
        position: "absolute",
        width: 1.2 * SCREEN_WIDTH,  // Phóng to hình ảnh
        bottom: 0,                  // Đặt ở đáy màn hình
        left: -0.1 * SCREEN_WIDTH,  // Dịch sang trái để giữ hình ở trung tâm
    }
});